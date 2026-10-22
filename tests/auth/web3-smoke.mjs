import assert from "node:assert/strict";
import { createClient } from "@supabase/supabase-js";
import { generatePrivateKey, privateKeyToAccount } from "viem/accounts";

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error("Local Supabase URL and anonymous key are required for the wallet smoke test.");
}

function createEphemeralWallet() {
  const account = privateKeyToAccount(generatePrivateKey());
  const wallet = {
    async request({ method, params = [] }) {
      if (method === "eth_requestAccounts") return [account.address];
      if (method === "eth_chainId") return "0x1";
      if (method === "personal_sign") {
        const messageHex = String(params[0]);
        const message = Buffer.from(messageHex.slice(2), "hex").toString("utf8");
        return account.signMessage({ message });
      }
      throw new Error("Unexpected wallet method in synthetic test.");
    },
  };

  return { wallet, account };
}

function createUnauthenticatedClient() {
  return createClient(supabaseUrl, supabaseKey, {
    auth: { autoRefreshToken: false, detectSessionInUrl: false, persistSession: false },
  });
}

async function authenticateSyntheticWallet() {
  const client = createUnauthenticatedClient();
  const { wallet } = createEphemeralWallet();
  const { data, error } = await client.auth.signInWithWeb3({
    chain: "ethereum",
    wallet,
    statement: "Synthetic Finance AI CI identity check. No funds are moved.",
    options: { url: "http://localhost:3000" },
  });
  assert.equal(error, null);
  assert.ok(data.user?.id);
  return { client, userId: data.user.id };
}

const first = await authenticateSyntheticWallet();
const second = await authenticateSyntheticWallet();
assert.notEqual(first.userId, second.userId);

const { data: firstSpace, error: firstInsertError } = await first.client
  .from("finance_spaces")
  .insert({ owner_id: first.userId, space_type: "personal", display_name: "Synthetic personal" })
  .select("id")
  .single();
assert.equal(firstInsertError, null);
assert.ok(firstSpace?.id);

const { data: crossRead, error: crossReadError } = await second.client
  .from("finance_spaces")
  .select("id")
  .eq("id", firstSpace.id);
assert.equal(crossReadError, null);
assert.deepEqual(crossRead, []);

const { data: foreignInsert, error: foreignInsertError } = await second.client
  .from("finance_spaces")
  .insert({ owner_id: first.userId, space_type: "store", display_name: "Synthetic store" })
  .select("id");
assert.ok(foreignInsertError);
assert.equal(foreignInsert, null);

const { data: ownSpace, error: ownInsertError } = await second.client
  .from("finance_spaces")
  .insert({ owner_id: second.userId, space_type: "personal", display_name: "Synthetic personal" })
  .select("id")
  .single();
assert.equal(ownInsertError, null);
assert.ok(ownSpace?.id);

const { data: crossUpdate, error: crossUpdateError } = await second.client
  .from("finance_spaces")
  .update({ display_name: "Changed by another owner" })
  .eq("id", firstSpace.id)
  .select("id");
assert.equal(crossUpdateError, null);
assert.deepEqual(crossUpdate, []);

const { data: crossDelete, error: crossDeleteError } = await second.client
  .from("finance_spaces")
  .delete()
  .eq("id", firstSpace.id)
  .select("id");
assert.equal(crossDeleteError, null);
assert.deepEqual(crossDelete, []);

const { data: stillOwned, error: ownerReadError } = await first.client
  .from("finance_spaces")
  .select("id")
  .eq("id", firstSpace.id);
assert.equal(ownerReadError, null);
assert.equal(stillOwned?.length, 1);

await first.client.auth.signOut();
await second.client.auth.signOut();
console.log("Synthetic EVM sign-in and finance-space RLS checks passed.");
