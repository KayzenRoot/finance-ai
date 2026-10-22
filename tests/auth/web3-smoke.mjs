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

// M01 Data API contract: exercise the same RLS and immutable transfer ledger
// through authenticated Supabase REST calls, not only privileged pgTAP SQL.
const { data: storeSpace, error: storeInsertError } = await first.client
  .from("finance_spaces")
  .insert({ owner_id: first.userId, space_type: "store", display_name: "Synthetic store" })
  .select("id")
  .single();
assert.equal(storeInsertError, null);
assert.ok(storeSpace?.id);

const { data: personalAccount, error: personalAccountError } = await first.client
  .from("finance_accounts")
  .insert({
    owner_id: first.userId, space_id: firstSpace.id,
    account_type: "bank", name: "Synthetic personal bank",
    opening_balance_cents: "10001", opening_balance_date: "2026-01-01",
  })
  .select("id")
  .single();
assert.equal(personalAccountError, null);
assert.ok(personalAccount?.id);

const { data: storeAccount, error: storeAccountError } = await first.client
  .from("finance_accounts")
  .insert({
    owner_id: first.userId, space_id: storeSpace.id,
    account_type: "cash", name: "Synthetic store cash",
    opening_balance_cents: "5001", opening_balance_date: "2026-01-01",
  })
  .select("id")
  .single();
assert.equal(storeAccountError, null);
assert.ok(storeAccount?.id);

const { data: forgedAccount, error: forgedAccountError } = await second.client
  .from("finance_accounts")
  .insert({
    owner_id: first.userId, space_id: firstSpace.id,
    account_type: "bank", name: "Forbidden foreign account",
    opening_balance_cents: "1", opening_balance_date: "2026-01-01",
  }).select("id");
assert.ok(forgedAccountError, "unauthorized wallet must not create accounts in another person's space");
assert.equal(forgedAccount, null);

const { data: foreignAccounts, error: foreignAccountsError } = await second.client
  .from("finance_account_balances")
  .select("account_id");
assert.equal(foreignAccountsError, null);
assert.deepEqual(foreignAccounts, [], "RLS applies through the security_invoker balance view");

const { data: scopedPersonal, error: scopedPersonalError } = await first.client
  .from("finance_account_balances")
  .select("account_id,current_balance_cents")
  .eq("space_id", firstSpace.id);
assert.equal(scopedPersonalError, null);
assert.equal(scopedPersonal?.length, 1);
assert.equal(scopedPersonal[0].account_id, personalAccount.id);
assert.equal(scopedPersonal[0].current_balance_cents, "10001", "exact cent totals are serialized as text");

const { data: directTransfer, error: directTransferError } = await first.client
  .from("finance_transfers")
  .insert({
    owner_id: first.userId,
    from_account_id: personalAccount.id,
    to_account_id: storeAccount.id,
    amount_cents: "251", effective_date: "2026-02-01",
  }).select("id");
assert.ok(directTransferError, "authenticated clients must not directly insert transfer ledger entries");
assert.equal(directTransfer, null);

const { data: recordedTransfer, error: recordedTransferError } = await first.client
  .rpc("finance_record_transfer", {
    p_from_account_id: personalAccount.id,
    p_to_account_id: storeAccount.id,
    p_amount_cents: "251",
    p_effective_date: "2026-02-01",
  });
assert.equal(recordedTransferError, null);
assert.match(recordedTransfer, /^[0-9a-f-]{36}$/i);

const { data: transferLegs, error: transferLegsError } = await first.client
  .from("finance_transfer_legs")
  .select("transfer_id,account_id,signed_amount_cents")
  .eq("transfer_id", recordedTransfer);
assert.equal(transferLegsError, null);
assert.equal(transferLegs?.length, 2, "every transfer must have a debit and credit");
assert.equal(transferLegs.reduce((sum, leg) => sum + BigInt(leg.signed_amount_cents), 0n), 0n);

const { data: personalAfter, error: personalAfterError } = await first.client
  .from("finance_account_balances")
  .select("current_balance_cents")
  .eq("account_id", personalAccount.id).single();
const { data: storeAfter, error: storeAfterError } = await first.client
  .from("finance_account_balances")
  .select("current_balance_cents")
  .eq("account_id", storeAccount.id).single();
assert.equal(personalAfterError, null);
assert.equal(storeAfterError, null);
assert.equal(personalAfter.current_balance_cents, "9750");
assert.equal(storeAfter.current_balance_cents, "5252");
assert.equal(BigInt(personalAfter.current_balance_cents) + BigInt(storeAfter.current_balance_cents), 15002n);

const { data: foreignTransfers, error: foreignTransfersError } = await second.client
  .from("finance_transfers").select("id");
assert.equal(foreignTransfersError, null);
assert.deepEqual(foreignTransfers, [], "other wallets cannot see internal ledger data");

const { data: foreignRpc, error: foreignRpcError } = await second.client
  .rpc("finance_record_transfer", {
    p_from_account_id: personalAccount.id, p_to_account_id: storeAccount.id,
    p_amount_cents: "1", p_effective_date: "2026-02-01",
  });
assert.ok(foreignRpcError, "unauthorized wallet must not transfer the owner's funds even internally");
assert.equal(foreignRpc, null);

// M02 Data API smoke: use ephemeral, unprovisioned wallets only.
const { data: incomeCategory, error: incomeCategoryError } = await first.client
  .from("finance_categories")
  .insert({ owner_id: first.userId, space_id: firstSpace.id, kind: "income", name: "Synthetic income" })
  .select("id").single();
assert.equal(incomeCategoryError, null);
assert.ok(incomeCategory?.id);
const { data: expenseCategory, error: expenseCategoryError } = await first.client
  .from("finance_categories")
  .insert({ owner_id: first.userId, space_id: storeSpace.id, kind: "expense", name: "Synthetic expense" })
  .select("id").single();
assert.equal(expenseCategoryError, null);
assert.ok(expenseCategory?.id);
const { data: foreignCategories, error: foreignCategoriesError } = await second.client
  .from("finance_categories").select("id");
assert.equal(foreignCategoriesError, null);
assert.deepEqual(foreignCategories, []);

const { data: forbiddenEntry, error: forbiddenEntryError } = await first.client
  .from("finance_ledger_entries")
  .insert({ owner_id: first.userId, space_id: firstSpace.id,
    account_id: personalAccount.id, category_id: incomeCategory.id,
    kind: "income", amount_cents: "1", effective_date: "2026-02-01",
    description: "Unauthorized direct insertion", entry_role: "original" }).select("id");
assert.ok(forbiddenEntryError, "authenticated users cannot directly write the ledger");
assert.equal(forbiddenEntry, null);

const { data: incorrectSpace, error: incorrectSpaceError } = await first.client
  .rpc("finance_record_entry", {
    p_account_id: personalAccount.id, p_category_id: expenseCategory.id,
    p_kind: "expense", p_amount_cents: "50",
    p_effective_date: "2026-02-01", p_description: "Denied cross-space",
  });
assert.ok(incorrectSpaceError, "category of store cannot be used in personal account");
assert.equal(incorrectSpace, null);

const { data: incomeEntry, error: incomeEntryError } = await first.client
  .rpc("finance_record_entry", {
    p_account_id: personalAccount.id, p_category_id: incomeCategory.id,
    p_kind: "income", p_amount_cents: "500",
    p_effective_date: "2026-02-01", p_description: "Synthetic income",
  });
assert.equal(incomeEntryError, null);
assert.match(incomeEntry, /^[0-9a-f-]{36}$/i);

const {data: changedReference, error: changedReferenceError} = await first.client
  .from("finance_accounts")
  .update({opening_balance_cents:"999"})
  .eq("id",personalAccount.id).select("id");
assert.ok(changedReferenceError, "reference cannot be rewritten after M02 ledger entry");
assert.equal(changedReference,null);

const { data: expenseEntry, error: expenseEntryError } = await first.client
  .rpc("finance_record_entry", {
    p_account_id: storeAccount.id, p_category_id: expenseCategory.id,
    p_kind: "expense", p_amount_cents: "200",
    p_effective_date: "2026-02-01", p_description: "Synthetic expense",
  });
assert.equal(expenseEntryError, null);
assert.ok(expenseEntry);

const { data: actualRows, error: actualRowsError } = await first.client
  .from("finance_account_balances").select("account_id,current_balance_cents");
assert.equal(actualRowsError, null);
assert.equal(actualRows.length, 2);
const balances = new Map(actualRows.map((a) => [a.account_id, BigInt(a.current_balance_cents)]));
assert.equal(balances.get(personalAccount.id), 10250n);
assert.equal(balances.get(storeAccount.id), 5052n);
assert.equal([...balances.values()].reduce((a, b) => a + b, 0n), 15302n);

const { data: correctedEntry, error: correctedEntryError } = await first.client
  .rpc("finance_correct_entry", {
    p_entry_id: incomeEntry, p_category_id: incomeCategory.id,
    p_amount_cents: "650", p_effective_date: "2026-02-01",
    p_description: "Corrected synthetic income",
  });
assert.equal(correctedEntryError, null);
assert.ok(correctedEntry);
const { data: canceledEntry, error: canceledEntryError } = await first.client
  .rpc("finance_cancel_entry", { p_entry_id: expenseEntry });
assert.equal(canceledEntryError, null);
assert.ok(canceledEntry);

const { data: history, error: historyError } = await first.client
  .from("finance_ledger_entries").select("id,entry_role,reverses_entry_id,corrects_entry_id");
assert.equal(historyError, null);
assert.equal(history.length, 5, "origins, reversals and corrected entry retained");
const { data: afterCorrection, error: afterCorrectionError } = await first.client
  .from("finance_account_balances").select("account_id,current_balance_cents");
assert.equal(afterCorrectionError, null);
const correctedTotal = afterCorrection.reduce((sum, a) => sum + BigInt(a.current_balance_cents), 0n);
assert.equal(correctedTotal, 15652n, "correction and cancellation preserve exact consolidated balance");

const { data: foreignEntries, error: foreignEntriesError } = await second.client
  .from("finance_ledger_entries").select("id");
assert.equal(foreignEntriesError, null);
assert.deepEqual(foreignEntries, []);
const { data: foreignCancel, error: foreignCancelError } = await second.client
  .rpc("finance_cancel_entry", { p_entry_id: correctedEntry });
assert.ok(foreignCancelError);
assert.equal(foreignCancel, null);

// M03 Data API: a forecast must not be mistaken for a confirmed ledger balance.
const {data: personalExpenseCategory, error: personalExpenseCategoryError} = await first.client
  .from("finance_categories")
  .insert({owner_id:first.userId,space_id:firstSpace.id,kind:"expense",name:"Synthetic M03 expense"})
  .select("id").single();
assert.equal(personalExpenseCategoryError,null);
assert.ok(personalExpenseCategory?.id);

const {data: payable, error: payableError} = await first.client
  .rpc("finance_create_commitment",{
    p_space_id:firstSpace.id,p_kind:"payable",p_description:"Synthetic invoice",
    p_amount_cents:"125",p_due_date:"2026-02-01",p_confidence_percent:100,
  });
assert.equal(payableError,null);
assert.ok(payable);

const {data: receivable, error: receivableError} = await first.client
  .rpc("finance_create_commitment",{
    p_space_id:storeSpace.id,p_kind:"receivable",p_description:"Synthetic uncertain receivable",
    p_amount_cents:"260",p_due_date:"2026-03-01",p_confidence_percent:25,
  });
assert.equal(receivableError,null);
assert.ok(receivable);
const {data: forecasts, error: forecastsError} = await first.client
  .from("finance_commitment_forecast").select("id,kind,confidence_percent,projected_signed_cents");
assert.equal(forecastsError,null);
assert.equal(forecasts?.length,2);
assert.equal(forecasts.find(x=>x.id===receivable)?.confidence_percent,25);
const {data: balanceBeforeSettlement,error:balanceBeforeSettlementError}=await first.client
  .from("finance_account_balances").select("current_balance_cents");
assert.equal(balanceBeforeSettlementError,null);
assert.equal(balanceBeforeSettlement.reduce((s,x)=>s+BigInt(x.current_balance_cents),0n),15652n,
  "receivable forecast must not increase confirmed cash");

const {data: forbiddenSettlement,error: forbiddenSettlementError}=await first.client
  .from("finance_commitment_settlements")
  .insert({owner_id:first.userId,space_id:firstSpace.id,kind:"payable",
    commitment_id:payable,ledger_entry_id:incomeEntry}).select("id");
assert.ok(forbiddenSettlementError,"direct settlement inserts are forbidden");
assert.equal(forbiddenSettlement,null);
const {data: crossSpaceSettle,error:crossSpaceSettleError}=await first.client
  .rpc("finance_settle_commitment",{
    p_commitment_id:payable,p_account_id:storeAccount.id,
    p_category_id:expenseCategory.id,p_effective_date:"2026-02-01",
  });
assert.ok(crossSpaceSettleError,"settlement must reject an account in a different space");
assert.equal(crossSpaceSettle,null);
const {data: ledgerSettlement,error:ledgerSettlementError}=await first.client
  .rpc("finance_settle_commitment",{
    p_commitment_id:payable,p_account_id:personalAccount.id,
    p_category_id:personalExpenseCategory.id,p_effective_date:"2026-02-01",
  });
assert.equal(ledgerSettlementError,null);
assert.ok(ledgerSettlement);

const {data: doubleSettlement,error:doubleSettlementError}=await first.client
  .rpc("finance_settle_commitment",{
    p_commitment_id:payable,p_account_id:personalAccount.id,
    p_category_id:personalExpenseCategory.id,p_effective_date:"2026-02-01",
  });
assert.ok(doubleSettlementError,"double settlement must be rejected");
assert.equal(doubleSettlement,null);
const {data: rollbackSettlement,error:rollbackSettlementError}=await first.client
  .rpc("finance_cancel_entry",{p_entry_id:ledgerSettlement});
assert.ok(rollbackSettlementError,"M02 reversal cannot invalidate a settled M03 commitment");
assert.equal(rollbackSettlement,null);
const {data: balanceAfterSettlement,error:balanceAfterSettlementError}=await first.client
  .from("finance_account_balances").select("current_balance_cents");
assert.equal(balanceAfterSettlementError,null);
assert.equal(balanceAfterSettlement.reduce((s,x)=>s+BigInt(x.current_balance_cents),0n),15527n);

const {data: otherCommitments,error:otherCommitmentsError}=await second.client
  .from("finance_commitments").select("id");
assert.equal(otherCommitmentsError,null);
assert.deepEqual(otherCommitments,[]);
const {data: otherForecast,error:otherForecastError}=await second.client
  .from("finance_commitment_forecast").select("id");
assert.equal(otherForecastError,null);
assert.deepEqual(otherForecast,[]);
const {data: foreignSettlement,error:foreignSettlementError}=await second.client
  .rpc("finance_settle_commitment",{
    p_commitment_id:receivable,p_account_id:storeAccount.id,
    p_category_id:expenseCategory.id,p_effective_date:"2026-02-01",
  });
assert.ok(foreignSettlementError);
assert.equal(foreignSettlement,null);

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

const { data: revokedAccounts, error: revokedAccountsError } = await first.client
  .from("finance_account_balances").select("account_id");
assert.equal(revokedAccountsError, null);
assert.deepEqual(revokedAccounts, [], "revocation blocks account-view access through Data API");
const { data: revokedTransfers, error: revokedTransfersError } = await first.client
  .from("finance_transfers").select("id");
assert.equal(revokedTransfersError, null);
assert.deepEqual(revokedTransfers, [], "revocation blocks historical transfer reads");
const {data: revokedLedger,error: revokedLedgerError}=await first.client
  .from("finance_ledger_entries").select("id");
assert.equal(revokedLedgerError,null);
assert.deepEqual(revokedLedger,[],"revoked owner loses M02 ledger Data API access");
const {data: revokedM03,error:revokedM03Error}=await first.client
  .from("finance_commitments").select("id");
assert.equal(revokedM03Error,null);
assert.deepEqual(revokedM03,[],"revoked wallet loses M03 commitments");




await first.client.auth.signOut();
await second.client.auth.signOut();
console.log("Synthetic EVM M00/M01/M02/M03 Data API RLS, settlement integrity, forecasts and revocation passed.");
