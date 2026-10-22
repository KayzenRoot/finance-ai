"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { parseBrlCents } from "@/lib/finance/money.mjs";

type Client=NonNullable<Awaited<ReturnType<typeof createClient>>>;
async function owner():Promise<{client:Client;userId:string}>{
  const client=await createClient();
  if(!client)redirect("/login");
  const {data,error}=await client.auth.getUser();
  if(error||!data.user||data.user.id!==process.env.FINANCE_AI_OWNER_USER_ID)redirect("/login");
  const gate=await client.rpc("finance_is_authorized_owner");
  if(gate.error||gate.data!==true)redirect("/login");
  return {client,userId:data.user.id};
}
function f(d:FormData,k:string):string{const x=d.get(k);return typeof x==="string"?x.trim():"";}
const uuid=(s:string)=>/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s);
function done(d:FormData,notice:string):never{
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/ledger");
  const space=f(d,"space_type")==="store"?"store":"personal";
  redirect(`/dashboard/ledger?space=${space}&notice=${encodeURIComponent(notice)}`);
}
function cents(d:FormData):string{
  const value=parseBrlCents(f(d,"amount_brl"));
  if(BigInt(value)<=BigInt(0))throw new RangeError("Expected positive amount");
  return value;
}
export async function createCategory(d:FormData):Promise<void>{
  const {client,userId}=await owner();
  const space=f(d,"space_id"),kind=f(d,"kind"),name=f(d,"name");
  if(!uuid(space)||!["income","expense"].includes(kind)||name.length<1||name.length>80)done(d,"invalid");
  const {data}=await client.from("finance_spaces").select("id").eq("id",space).eq("owner_id",userId).maybeSingle();
  if(!data)done(d,"denied");
  const {error}=await client.from("finance_categories").insert({owner_id:userId,space_id:space,kind,name});
  done(d,error?"category-error":"category-created");
}
export async function renameCategory(d:FormData):Promise<void>{
  const {client,userId}=await owner();
  const id=f(d,"category_id"),space=f(d,"space_id"),name=f(d,"name");
  if(!uuid(id)||!uuid(space)||name.length<1||name.length>80)done(d,"invalid");
  const {data,error}=await client.from("finance_categories").update({name})
    .eq("id",id).eq("owner_id",userId).eq("space_id",space)
    .is("archived_at",null).select("id").maybeSingle();
  done(d,error||!data?"category-error":"category-renamed");
}
export async function archiveCategory(d:FormData):Promise<void>{
  const {client,userId}=await owner();
  const id=f(d,"category_id"),space=f(d,"space_id");
  if(!uuid(id)||!uuid(space))done(d,"invalid");
  const {data,error}=await client.from("finance_categories")
    .update({archived_at:new Date().toISOString()})
    .eq("id",id).eq("owner_id",userId).eq("space_id",space).is("archived_at",null)
    .select("id").maybeSingle();
  done(d,error||!data?"category-error":"category-archived");
}
export async function recordEntry(d:FormData):Promise<void>{
  const {client}=await owner();
  const account=f(d,"account_id"),category=f(d,"category_id"),kind=f(d,"kind");
  const date=f(d,"effective_date"),description=f(d,"description");
  if(!uuid(account)||!uuid(category)||!["income","expense"].includes(kind)||
    !/^\d{4}-\d{2}-\d{2}$/.test(date)||description.length<1||description.length>240)done(d,"invalid");
  let amount:string;
  try{amount=cents(d);}catch{done(d,"invalid-money");}
  const {error}=await client.rpc("finance_record_entry",{
    p_account_id:account,p_category_id:category,p_kind:kind,
    p_amount_cents:amount,p_effective_date:date,p_description:description
  });
  done(d,error?"entry-error":"entry-created");
}
export async function cancelEntry(d:FormData):Promise<void>{
  const {client}=await owner(),id=f(d,"entry_id");
  if(!uuid(id))done(d,"invalid");
  const {error}=await client.rpc("finance_cancel_entry",{p_entry_id:id});
  done(d,error?"cancel-error":"entry-canceled");
}
export async function correctEntry(d:FormData):Promise<void>{
  const {client}=await owner();
  const id=f(d,"entry_id"),cat=f(d,"category_id"),date=f(d,"effective_date"),desc=f(d,"description");
  if(!uuid(id)||!uuid(cat)||!/^\d{4}-\d{2}-\d{2}$/.test(date)||desc.length<1||desc.length>240)done(d,"invalid");
  let amount:string;try{amount=cents(d);}catch{done(d,"invalid-money");}
  const {error}=await client.rpc("finance_correct_entry",{
    p_entry_id:id,p_category_id:cat,p_amount_cents:amount,
    p_effective_date:date,p_description:desc
  });
  done(d,error?"correction-error":"entry-corrected");
}
