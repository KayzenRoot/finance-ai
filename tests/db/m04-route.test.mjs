import assert from "node:assert/strict";
import test from "node:test";
import {PassThrough} from "node:stream";
import {renderToPipeableStream} from "react-dom/server";
import React from "react";
import "../helpers/m04-synthetic-loader.mjs";
import {resetSynthetic,syntheticDB,trace} from "../helpers/m04-synthetic-runtime.mjs";

const OWNER="e4000000-0000-4000-8000-0000000000e4";
const OTHER="e5000000-0000-4000-8000-0000000000e5";
const SPACE="b4000000-0000-4000-8000-0000000000b4";
const DEBT="d4000000-0000-4000-8000-0000000000d4";
process.env.FINANCE_AI_OWNER_USER_ID=OWNER;
const {createDebt,recordDebtObservation}=await import("../../src/app/dashboard/debts/debt-actions.ts");
const {default:DebtPage}=await import("../../src/app/dashboard/debts/page.tsx");
function form(fields={}){
 const result=new FormData();
 for(const [name,value] of Object.entries(fields))result.set(name,String(value));
 return result;
}
function authorizedClient(opts={}){return syntheticDB({userId:OWNER,...opts});}
function expectRedirect(action,path){return assert.rejects(action,error=>error.destination===path);}
const withAuth=({userId=OWNER,owner=true,spaces=[],debts=[],observations=[],spaceError=null,debtError=null,rpcError=null}={})=>
 syntheticDB({userId,owner,spaces,debts,observations,spaceError,debtError,rpcError});
function htmlOf(params){
 return new Promise((resolve,reject)=>{
  let error=null,html="";
  const rendered=renderToPipeableStream(React.createElement(DebtPage,{searchParams:Promise.resolve(params)}),{
   onAllReady(){
    if(error){reject(error);return;}
    const output=new PassThrough();
    output.setEncoding("utf8");
    output.on("data",part=>{html+=part;});
    output.on("error",reject);
    output.on("end",()=>resolve(html));
    rendered.pipe(output);
   },
   onError(err){error??=err;}
  });
 });
}
test("M04 server action refuses absent session, no financial RPC",async()=>{
 resetSynthetic(null);
 await expectRedirect(()=>createDebt(form({space_id:SPACE,creditor:"Synthetic"})),"/login");
 assert.equal(trace.rpc.length,0);
 assert.equal(trace.revalidations.length,0);
});
test("M04 server action refuses foreign wallet before mutation",async()=>{
 resetSynthetic(withAuth({userId:OTHER}));
 await expectRedirect(()=>recordDebtObservation(form({debt_id:DEBT,as_of_date:"2026-10-22",source_reference:"Synthetic"})),"/login");
 assert.equal(trace.rpc.length,0);
});
test("M04 server action respects allowlist RPC rejection",async()=>{
 resetSynthetic(withAuth({owner:false}));
 await expectRedirect(()=>createDebt(form({space_id:SPACE,creditor:"Synthetic"})),"/login");
 assert.deepEqual(trace.rpc.map(q=>q.name),["finance_is_authorized_owner"]);
});
test("M04 rejects invalid creditor and space without write",async()=>{
 resetSynthetic(authorizedClient());
 await expectRedirect(()=>createDebt(form({space_type:"store",space_id:"not-a-uuid",creditor:"Synthetic"})),
  "/dashboard/debts?space=store&notice=invalid");
 assert.deepEqual(trace.rpc.map(q=>q.name),["finance_is_authorized_owner"]);
});
test("M04 creates debt via owner-checked RPC and redirects to correct space",async()=>{
 resetSynthetic(authorizedClient());
 await expectRedirect(()=>createDebt(form({space_type:"store",space_id:SPACE,creditor:"  Synthetic Creditor  "})),
  "/dashboard/debts?space=store&notice=created");
 assert.deepEqual(trace.rpc.map(q=>q.name),["finance_is_authorized_owner","finance_create_debt"]);
 assert.deepEqual(trace.rpc[1].args,{p_space_id:SPACE,p_creditor:"Synthetic Creditor"});
 assert.deepEqual(trace.revalidations,["/dashboard/debts"]);
});
test("M04 RPC failure does not claim debt was created",async()=>{
 resetSynthetic(authorizedClient({rpcError:{code:"42501"}}));
 await expectRedirect(()=>createDebt(form({space_id:SPACE,creditor:"Synthetic"})),
  "/dashboard/debts?space=personal&notice=create-error");
 assert.equal(trace.rpc.at(-1).name,"finance_create_debt");
});
test("M04 rejects missing rate provenance without observation RPC",async()=>{
 resetSynthetic(authorizedClient());
 await expectRedirect(()=>recordDebtObservation(form({
  debt_id:DEBT,as_of_date:"2026-10-22",source_reference:"Synthetic",
  interest_percent:"2",interest_period:"monthly"
 })),"/dashboard/debts?space=personal&notice=invalid-terms");
 assert.deepEqual(trace.rpc.map(q=>q.name),["finance_is_authorized_owner"]);
});
test("M04 observation preserves exact cents, missing NULL, separate rate periods",async()=>{
 resetSynthetic(authorizedClient());
 await expectRedirect(()=>recordDebtObservation(form({
  space_type:"store",debt_id:DEBT,as_of_date:"2026-10-22",source_reference:"Synthetic contract",
  balance_brl:"900,01",minimum_brl:"",interest_percent:"2,125",interest_period:"monthly",
  interest_source:"Paper",cet_percent:"31.75",cet_period:"annual",cet_source:"Disclosure"
 })),"/dashboard/debts?space=store&notice=recorded");
 assert.deepEqual(trace.rpc.map(q=>q.name),["finance_is_authorized_owner","finance_record_debt_observation"]);
 assert.deepEqual(trace.rpc[1].args,{
  p_debt_id:DEBT,p_as_of_date:"2026-10-22",p_source_reference:"Synthetic contract",
  p_balance_cents:"90001",p_minimum_due_cents:null,p_due_date:null,
  p_interest_percent:"2.125",p_interest_period:"monthly",p_interest_source:"Paper",
  p_cet_percent:"31.75",p_cet_period:"annual",p_cet_source:"Disclosure",
  p_penalty_fixed_cents:null,p_consequences:null
 });
});
test("M04 snapshot RPC failures display error without claiming success",async()=>{
 resetSynthetic(authorizedClient({rpcError:{code:"22023"}}));
 await expectRedirect(()=>recordDebtObservation(form({
  debt_id:DEBT,as_of_date:"2026-10-22",source_reference:"Synthetic"
 })),"/dashboard/debts?space=personal&notice=snapshot-error");
});
test("M04 UI rejects unauthorized owner without querying finance spaces",async()=>{
 resetSynthetic(withAuth({owner:false}));
 const html=await htmlOf({space:"personal"});
 assert.match(html,/Carteira não autorizada/);
 assert.doesNotMatch(html,/Novo credor|Synthetic Creditor/);
 assert.equal(trace.queries.length,0);
});
test("M04 UI shows no store space without querying debt snapshots",async()=>{
 resetSynthetic(withAuth({spaces:[{id:SPACE,owner_id:OWNER,space_type:"personal",display_name:"Pessoal"}]}));
 const html=await htmlOf({space:"store"});
 assert.match(html,/Crie um espaço financeiro/);
 assert.doesNotMatch(html,/Synthetic Creditor|Novo credor/);
 assert.deepEqual(trace.queries.map(q=>q.table),["finance_spaces"]);
});
test("M04 UI displays incomplete data and provenance without inventing interest",async()=>{
 resetSynthetic(withAuth({
  spaces:[{id:SPACE,owner_id:OWNER,space_type:"personal",display_name:"Pessoal"}],
  debts:[{id:DEBT,owner_id:OWNER,space_id:SPACE,creditor:"Synthetic Creditor",
   balance_cents:"90001",minimum_due_cents:null,due_date:null,interest_percent:null,
   interest_period:null,interest_source:null,cet_percent:null,cet_period:null,
   cet_source:null,penalty_fixed_cents:null,consequences:null,source_reference:"Synthetic paper",
   as_of_date:"2026-10-22",has_missing_cost_data:true}],
  observations:[{id:"o1",owner_id:OWNER,space_id:SPACE,debt_id:DEBT,
   balance_cents:"90001",source_reference:"Synthetic paper",as_of_date:"2026-10-22"}]
 }));
 const html=await htmlOf({space:"personal",notice:"recorded"});
 assert.match(html,/Synthetic Creditor/);
 assert.match(html,/R\$ 900,01/);
 assert.match(html,/Juros: <|Juros:|Não informado/);
 assert.match(html,/Informações incompletas/);
 assert.match(html,/Observação adicionada sem apagar informações antigas/);
 assert.match(html,/Histórico preservado/);
 assert.doesNotMatch(html,/NaN|Infinity/);
 assert.deepEqual(trace.queries.map(q=>q.table),
  ["finance_spaces","finance_debt_latest","finance_debt_observations"]);
});
test("M04 UI fails closed on finance query error",async()=>{
 resetSynthetic(withAuth({
  spaces:[{id:SPACE,owner_id:OWNER,space_type:"store",display_name:"Loja"}],
  debtError:{code:"42501"}
 }));
 const html=await htmlOf({space:"store"});
 assert.match(html,/Dívidas indisponíveis/);
 assert.doesNotMatch(html,/Cadastrar dívida/);
});

test("M04 UI enforces Pessoal versus Loja query filters for owner and space",async()=>{
 const storeSpace="b5000000-0000-4000-8000-0000000000b5";
 const records=[
  {id:DEBT,owner_id:OWNER,space_id:SPACE,creditor:"Personal synthetic",
   balance_cents:null,minimum_due_cents:null,due_date:null,interest_percent:null,
   interest_period:null,interest_source:null,cet_percent:null,cet_period:null,cet_source:null,
   penalty_fixed_cents:null,consequences:null,source_reference:null,as_of_date:null,
   has_missing_cost_data:true},
  {id:"d5000000-0000-4000-8000-0000000000d5",owner_id:OWNER,space_id:storeSpace,
   creditor:"Store synthetic",balance_cents:null,minimum_due_cents:null,due_date:null,
   interest_percent:null,interest_period:null,interest_source:null,cet_percent:null,
   cet_period:null,cet_source:null,penalty_fixed_cents:null,consequences:null,
   source_reference:null,as_of_date:null,has_missing_cost_data:true}
 ];
 const spaces=[
  {id:SPACE,owner_id:OWNER,space_type:"personal",display_name:"Pessoal"},
  {id:storeSpace,owner_id:OWNER,space_type:"store",display_name:"Loja"}
 ];
 for(const [space,expected,excluded,id] of [
  ["personal","Personal synthetic","Store synthetic",SPACE],
  ["store","Store synthetic","Personal synthetic",storeSpace]
 ]){
  resetSynthetic(withAuth({spaces,debts:records}));
  const html=await htmlOf({space});
  assert.match(html,new RegExp(expected));
  assert.doesNotMatch(html,new RegExp(excluded));
  const queries=trace.queries.filter(q=>q.table==="finance_debt_latest"||
   q.table==="finance_debt_observations");
  assert.equal(queries.length,2);
  for(const query of queries)
   assert.deepEqual(query.filters,[["owner_id",OWNER],["space_id",id]]);
 }
});
