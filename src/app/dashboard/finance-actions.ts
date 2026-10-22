"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { parseBrlCents } from "@/lib/finance/money.mjs";

type Client = NonNullable<Awaited<ReturnType<typeof createClient>>>;

async function requireFinanceOwner(): Promise<{ client: Client; ownerId: string }> {
  const client = await createClient();
  if (!client) redirect("/login");
  const { data, error } = await client.auth.getUser();
  if (error || !data.user || data.user.id !== process.env.FINANCE_AI_OWNER_USER_ID) redirect("/login");
  const { data: allowed, error: authorizationError } = await client.rpc("finance_is_authorized_owner");
  if (authorizationError || allowed !== true) redirect("/login");
  return { client, ownerId: data.user.id };
}

function field(data: FormData, key: string): string {
  const raw = data.get(key);
  return typeof raw === "string" ? raw.trim() : "";
}

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
}

function finish(code: string): never {
  revalidatePath("/dashboard");
  redirect(`/dashboard?notice=${encodeURIComponent(code)}`);
}

export async function createSpace(formData: FormData): Promise<void> {
  const { client, ownerId } = await requireFinanceOwner();
  const type = field(formData, "space_type");
  const displayName = type === "personal" ? "Pessoal" : type === "store" ? "Loja" : "";
  if (!displayName) finish("invalid");
  const { error } = await client.from("finance_spaces").insert({ owner_id: ownerId, space_type: type, display_name: displayName });
  finish(error ? "space-error" : "space-created");
}

export async function createAccount(formData: FormData): Promise<void> {
  const { client, ownerId } = await requireFinanceOwner();
  const spaceId = field(formData, "space_id");
  const accountType = field(formData, "account_type");
  const name = field(formData, "name");
  const referenceDate = field(formData, "opening_balance_date");
  const types = ["bank", "cash", "card"];
  if (!isUuid(spaceId) || !types.includes(accountType) || !name || name.length > 80 || !/^\d{4}-\d{2}-\d{2}$/.test(referenceDate)) finish("invalid");
  let openingBalanceCents: string;
  try {
    openingBalanceCents = parseBrlCents(field(formData, "opening_balance_brl"));
  } catch {
    finish("invalid-money");
  }
  const { data: space, error: spaceError } = await client.from("finance_spaces").select("id").eq("id", spaceId).eq("owner_id", ownerId).single();
  if (spaceError || !space) finish("unauthorized");
  const { error } = await client.from("finance_accounts").insert({
    owner_id: ownerId, space_id: spaceId, account_type: accountType, name,
    currency: "BRL", opening_balance_cents: openingBalanceCents, opening_balance_date: referenceDate,
  });
  finish(error ? "account-error" : "account-created");
}

export async function archiveAccount(formData: FormData): Promise<void> {
  const { client, ownerId } = await requireFinanceOwner();
  const id = field(formData, "account_id");
  if (!isUuid(id)) finish("invalid");
  const { data, error } = await client.from("finance_accounts").update({ archived_at: new Date().toISOString() })
    .eq("id", id).eq("owner_id", ownerId).is("archived_at", null).select("id").maybeSingle();
  finish(error || !data ? "archive-error" : "account-archived");
}

export async function recordInternalTransfer(formData: FormData): Promise<void> {
  const { client } = await requireFinanceOwner();
  const from = field(formData, "from_account_id");
  const to = field(formData, "to_account_id");
  const date = field(formData, "effective_date");
  if (!isUuid(from) || !isUuid(to) || from === to || !/^\d{4}-\d{2}-\d{2}$/.test(date)) finish("invalid");
  let cents: string;
  try {
    cents = parseBrlCents(field(formData, "amount_brl"));
    if (BigInt(cents) <= BigInt(0)) finish("invalid-money");
  } catch {
    finish("invalid-money");
  }
  // The DB RPC independently verifies the JWT owner, both accounts, amount and date.
  const { error } = await client.rpc("finance_record_transfer", {
    p_from_account_id: from,
    p_to_account_id: to,
    p_amount_cents: cents,
    p_effective_date: date,
  });
  finish(error ? "transfer-error" : "transfer-created");
}
