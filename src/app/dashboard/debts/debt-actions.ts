"use server";
import {revalidatePath} from "next/cache";
import {redirect} from "next/navigation";
import {createClient} from "@/lib/supabase/server";
import {money,terms} from "@/lib/finance/debt-input.mjs";

type DB=NonNullable<Awaited<ReturnType<typeof createClient>>>;
async function requireOwner():Promise<DB>{
 const db=await createClient();if(!db)redirect("/login");
 const {data,error}=await db.auth.getUser();
 if(error||!data.user||data.user.id!==process.env.FINANCE_AI_OWNER_USER_ID)redirect("/login");
 const g=await db.rpc("finance_is_authorized_owner");
 if(g.error||g.data!==true)redirect("/login");
 return db;
}
const f=(v:FormData,k:string)=>{const x=v.get(k);return typeof x==="string"?x.trim():"";};
const uuid=(x:string)=>/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(x);
function finish(v:FormData,notice:string):never{
 revalidatePath("/dashboard/debts");
 redirect("/dashboard/debts?space="+(f(v,"space_type")==="store"?"store":"personal")+"&notice="+notice);
}
export async function createDebt(v:FormData):Promise<void>{
 const db=await requireOwner(),space=f(v,"space_id"),creditor=f(v,"creditor");
 if(!uuid(space)||creditor.length<1||creditor.length>180)finish(v,"invalid");
 const {error}=await db.rpc("finance_create_debt",{p_space_id:space,p_creditor:creditor});
 finish(v,error?"create-error":"created");
}
export async function recordDebtObservation(v:FormData):Promise<void>{
 const db=await requireOwner(),id=f(v,"debt_id"),date=f(v,"as_of_date"),
 source=f(v,"source_reference"),consequences=f(v,"consequences");
 if(!uuid(id)||!/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/.test(date)||source.length<1||
 source.length>240||consequences.length>1200)finish(v,"invalid");
 let payload;
 try{
 const interest=terms(v,"interest"),cet=terms(v,"cet");
 const due=f(v,"due_date");
 if(due&&!/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/.test(due))throw Error("due date");
 payload={p_debt_id:id,p_as_of_date:date,p_source_reference:source,
 p_balance_cents:money(f(v,"balance_brl")),p_minimum_due_cents:money(f(v,"minimum_brl")),
 p_due_date:due||null,p_interest_percent:interest.value,
 p_interest_period:interest.period,p_interest_source:interest.source,
 p_cet_percent:cet.value,p_cet_period:cet.period,p_cet_source:cet.source,
 p_penalty_fixed_cents:money(f(v,"penalty_brl")),p_consequences:consequences||null};
 }catch{finish(v,"invalid-terms");}
 const {error}=await db.rpc("finance_record_debt_observation",payload);
 finish(v,error?"snapshot-error":"recorded");
}
