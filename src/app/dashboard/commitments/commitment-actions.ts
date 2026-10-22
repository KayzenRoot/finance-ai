"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { parseBrlCents } from "@/lib/finance/money.mjs";

type Client=NonNullable<Awaited<ReturnType<typeof createClient>>>;
async function requireOwner():Promise<{client:Client;ownerId:string}>{
 const client=await createClient();if(!client)redirect("/login");
 const {data,error}=await client.auth.getUser();
 if(error||!data.user||data.user.id!==process.env.FINANCE_AI_OWNER_USER_ID)redirect("/login");
 const auth=await client.rpc("finance_is_authorized_owner");
 if(auth.error||auth.data!==true)redirect("/login");
 return {client,ownerId:data.user.id};
}
function field(f:FormData,key:string):string {const v=f.get(key);return typeof v==="string"?v.trim():"";}
function isUuid(s:string):boolean {return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s);}
function finish(f:FormData,notice:string):never{
 revalidatePath("/dashboard/commitments");
 const type=field(f,"space_type")==="store"?"store":"personal";
 redirect(`/dashboard/commitments?space=${type}&notice=${encodeURIComponent(notice)}`);
}
function amount(f:FormData):string{
 const value=parseBrlCents(field(f,"amount_brl"));
 if(BigInt(value)<=BigInt(0))throw new RangeError("positive amount required");
 return value;
}
function confidence(f:FormData,kind:string):number{
 const raw=field(f,"confidence_percent");
 const value=kind==="payable"?100:Number(raw);
 if(!Number.isInteger(value)||value<0||value>100)throw new RangeError("invalid confidence");
 return value;
}
export async function createCommitment(f:FormData):Promise<void>{
 const {client}=await requireOwner();
 const space=field(f,"space_id"),kind=field(f,"kind"),description=field(f,"description"),due=field(f,"due_date");
 if(!isUuid(space)||!["payable","receivable"].includes(kind)||!description||description.length>240||
 !/^\d{4}-\d{2}-\d{2}$/.test(due))finish(f,"invalid");
 let cents:string,conf:number;
 try{cents=amount(f);conf=confidence(f,kind);}catch{finish(f,"invalid-money");}
 const {error}=await client.rpc("finance_create_commitment",{
  p_space_id:space,p_kind:kind,p_description:description,p_amount_cents:cents,
  p_due_date:due,p_confidence_percent:conf,
 });
 finish(f,error?"create-error":"created");
}
export async function createRecurringPlan(f:FormData):Promise<void>{
 const {client,ownerId}=await requireOwner();
 const space=field(f,"space_id"),kind=field(f,"kind"),frequency=field(f,"frequency");
 const description=field(f,"description"),firstDue=field(f,"first_due_date");
 if(!isUuid(space)||!["payable","receivable"].includes(kind)||!["weekly","monthly"].includes(frequency)||
 !description||description.length>240||!/^\d{4}-\d{2}-\d{2}$/.test(firstDue))finish(f,"invalid");
 let cents:string,conf:number;
 try{cents=amount(f);conf=confidence(f,kind);}catch{finish(f,"invalid-money");}
 const {error}=await client.from("finance_recurring_plans").insert({
 owner_id:ownerId,space_id:space,kind,description,amount_cents:cents,
 first_due_date:firstDue,frequency,confidence_percent:conf,
 });
 finish(f,error?"plan-error":"plan-created");
}
export async function generateOccurrences(f:FormData):Promise<void>{
 const {client}=await requireOwner();
 const id=field(f,"series_id"),through=field(f,"through_date");
 if(!isUuid(id)||!/^\d{4}-\d{2}-\d{2}$/.test(through))finish(f,"invalid");
 const {error}=await client.rpc("finance_generate_commitments",{
 p_series_id:id,p_through_date:through,
 });
 finish(f,error?"generate-error":"generated");
}
export async function cancelCommitment(f:FormData):Promise<void>{
 const {client}=await requireOwner(),id=field(f,"commitment_id");
 if(!isUuid(id))finish(f,"invalid");
 const {error}=await client.rpc("finance_cancel_commitment",{p_commitment_id:id});
 finish(f,error?"cancel-error":"canceled");
}
export async function settleCommitment(f:FormData):Promise<void>{
 const {client}=await requireOwner();
 const id=field(f,"commitment_id"),account=field(f,"account_id"),category=field(f,"category_id");
 const date=field(f,"effective_date");
 if(!isUuid(id)||!isUuid(account)||!isUuid(category)||!/^\d{4}-\d{2}-\d{2}$/.test(date))finish(f,"invalid");
 const {error}=await client.rpc("finance_settle_commitment",{
 p_commitment_id:id,p_account_id:account,p_category_id:category,p_effective_date:date,
 });
 finish(f,error?"settle-error":"settled");
}
