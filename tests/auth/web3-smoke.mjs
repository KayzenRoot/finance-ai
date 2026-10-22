import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
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

function provisionSyntheticOwner(userId) {
  const container = process.env.SUPABASE_DB_CONTAINER;
  assert.match(container ?? "", /^supabase_db_[a-zA-Z0-9_-]+$/, "A local Supabase database container is required.");
  assert.match(userId, /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);
  execFileSync("docker", [
    "exec", container, "psql", "-U", "postgres", "-d", "postgres",
    "-v", "ON_ERROR_STOP=1", "-c",
    `insert into finance_private.authorized_owners (owner_id) values ('${userId}')`,
  ], { stdio: "pipe" });
}

function revokeSyntheticOwner(userId) {
  const container = process.env.SUPABASE_DB_CONTAINER;
  assert.match(container ?? "", /^supabase_db_[a-zA-Z0-9_-]+$/);
  assert.match(userId, /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);
  execFileSync("docker", [
    "exec", container, "psql", "-U", "postgres", "-d", "postgres",
    "-v", "ON_ERROR_STOP=1", "-c",
    `delete from finance_private.authorized_owners where owner_id = '${userId}'`,
  ], { stdio: "pipe" });
}

// An anonymous client must not reach the private owner predicate.
const anonymous = createUnauthenticatedClient();
const { data: anonymousAccess, error: anonymousAccessError } = await anonymous.rpc("finance_is_authorized_owner");
assert.ok(anonymousAccessError);
assert.equal(anonymousAccess, null);

const first = await authenticateSyntheticWallet();
const second = await authenticateSyntheticWallet();
assert.notEqual(first.userId, second.userId);

const { data: unprovisionedSpace, error: unprovisionedInsertError } = await first.client
  .from("finance_spaces")
  .insert({ owner_id: first.userId, space_type: "personal", display_name: "Denied before provision" })
  .select("id");
assert.ok(unprovisionedInsertError);
assert.equal(unprovisionedSpace, null);

const { data: beforeProvision, error: beforeProvisionError } = await first.client.rpc("finance_is_authorized_owner");
assert.equal(beforeProvisionError, null);
assert.equal(beforeProvision, false);

provisionSyntheticOwner(first.userId);

const { data: afterProvision, error: afterProvisionError } = await first.client.rpc("finance_is_authorized_owner");
assert.equal(afterProvisionError, null);
assert.equal(afterProvision, true);

const { data: otherWalletAuthorized, error: otherWalletAuthError } = await second.client.rpc("finance_is_authorized_owner");
assert.equal(otherWalletAuthError, null);
assert.equal(otherWalletAuthorized, false);

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

const { data: unauthorizedSpace, error: unauthorizedInsertError } = await second.client
  .from("finance_spaces")
  .insert({ owner_id: second.userId, space_type: "personal", display_name: "Denied other wallet" })
  .select("id");
assert.ok(unauthorizedInsertError);
assert.equal(unauthorizedSpace, null);

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

revokeSyntheticOwner(first.userId);
const { data: afterRevocation, error: afterRevocationError } = await first.client.rpc("finance_is_authorized_owner");
assert.equal(afterRevocationError, null);
assert.equal(afterRevocation, false);
const { data: revokedRows, error: revokedReadError } = await first.client
  .from("finance_spaces")
  .select("id")
  .eq("id", firstSpace.id);
assert.equal(revokedReadError, null);
assert.deepEqual(revokedRows, []);

await first.client.auth.signOut();
await second.client.auth.signOut();
console.log("Synthetic EVM sign-in and finance-space RLS checks passed.");
