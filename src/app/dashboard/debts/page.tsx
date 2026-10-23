import Link from "next/link";
import {Suspense, type ReactNode} from "react";
import {redirect} from "next/navigation";
import {createClient} from "@/lib/supabase/server";
import {formatBrlCents} from "@/lib/finance/money.mjs";
import {createDebt,recordDebtObservation} from "./debt-actions";

type Debt={id:string;creditor:string;balance_cents:string|null;minimum_due_cents:string|null;
 due_date:string|null;interest_percent:string|null;interest_period:string|null;interest_source:string|null;
 cet_percent:string|null;cet_period:string|null;cet_source:string|null;penalty_fixed_cents:string|null;
 consequences:string|null;source_reference:string|null;as_of_date:string|null;has_missing_cost_data:boolean};
type Observation={id:string;debt_id:string;balance_cents:string|null;source_reference:string;as_of_date:string};
type Params={space?:string;notice?:string};
const msg:Record<string,string>={
 created:"Credor cadastrado. Registre os valores conhecidos em uma observação.",
 recorded:"Observação adicionada sem apagar informações antigas.",
 invalid:"Confira os campos obrigatórios.",
 "invalid-terms":"Valor, juros, CET, período e fonte precisam ser coerentes.",
 "create-error":"Cadastro recusado pelo banco.",
 "snapshot-error":"Observação recusada pelo banco; confira espaço e informações.",
};
const money=(v:string|null)=>v===null?"Não informado":formatBrlCents(v);
function editCents(value:string|null):string{
 if(value===null)return "";
 const n=BigInt(value),divisor=BigInt(100);
 return (n/divisor).toString()+","+(n%divisor).toString().padStart(2,"0");
}
function rate(value:string|null,period:string|null,source:string|null){
 if(value===null)return "Não informado";
 const unitByPeriod:Record<string,string>={daily:"dia",monthly:"mês",annual:"ano"};
 const unit=period===null?null:(unitByPeriod[period]??null);
 return value+(unit?"% ao "+unit:"% · Período desconhecido")+" · Fonte: "+(source??"Não informada");
}
export default function DebtPage({searchParams}:{searchParams:Promise<Params>}){
 return <Suspense fallback={<main className="dashboard-shell"><section className="dashboard-main">
 <div className="dashboard-card">Validando sua sessão financeira…</div></section></main>}>
 <DebtContent searchParams={searchParams}/></Suspense>;
}
async function DebtContent({searchParams}:{searchParams:Promise<Params>}){
 const p=await searchParams,type=p.space==="store"?"store":"personal";
 const db=await createClient();if(!db)redirect("/login");
 const {data,error}=await db.auth.getUser();
 if(error||!data.user||data.user.id!==process.env.FINANCE_AI_OWNER_USER_ID)redirect("/login");
 const gate=await db.rpc("finance_is_authorized_owner");
 if(gate.error||gate.data!==true)return <main className="dashboard-shell"><section className="dashboard-main">
 <div className="dashboard-card">Carteira não autorizada para dados financeiros.</div></section></main>;
 const {data:spaces,error:spaceError}=await db.from("finance_spaces")
 .select("id,space_type,display_name").eq("owner_id",data.user.id);
 if(spaceError)return <main className="dashboard-shell"><section className="dashboard-main">
 <div className="dashboard-card">Espaços indisponíveis.</div></section></main>;
 const space=spaces?.find(s=>s.space_type===type);
 let debts:Debt[]=[],observations:Observation[]=[],failed=false;
 if(space){
  const [a,b]=await Promise.all([
   db.from("finance_debt_latest")
   .select("id,creditor,balance_cents,minimum_due_cents,due_date,interest_percent,interest_period,interest_source,cet_percent,cet_period,cet_source,penalty_fixed_cents,consequences,source_reference,as_of_date,has_missing_cost_data")
   .eq("owner_id",data.user.id).eq("space_id",space.id).order("created_at",{ascending:false}).limit(100),
   db.from("finance_debt_observations").select("id,debt_id,balance_cents,source_reference,as_of_date")
   .eq("owner_id",data.user.id).eq("space_id",space.id)
   .order("recorded_at",{ascending:false}).limit(100)
  ]);
  failed=Boolean(a.error||b.error);debts=(a.data??[]) as Debt[];observations=(b.data??[]) as Observation[];
 }
 const hidden=<input type="hidden" name="space_type" value={type}/>;
 let debtPanel: ReactNode;
 if (!space) {
  debtPanel=<section className="finance-panel"><h2>Crie um espaço financeiro</h2>
   <Link href={"/dashboard?space="+type}>Abrir contas</Link></section>;
 } else if (failed) {
  debtPanel=<section className="finance-panel"><h2>Dívidas indisponíveis</h2>
   <p>A migração M04 precisa estar aplicada no ambiente privado.</p></section>;
 } else {
  debtPanel=<>
   <section className="finance-panel"><h2>Novo credor</h2><form action={createDebt} className="finance-form">
    {hidden}<input type="hidden" name="space_id" value={space.id}/>
    <label>Credor<input name="creditor" required minLength={1} maxLength={180} placeholder="Credor informado"/></label>
    <button type="submit" className="button button-primary">Cadastrar dívida</button>
   </form></section>
   <section className="finance-panel"><h2>Dívidas · {space.display_name}</h2>
    <p>Sem cálculo de juros, custo futuro ou classificação de prioridades até existirem condições comprovadas.</p>
    {debts.map(d=><div className="finance-account" key={d.id}><div>
      <strong>{d.creditor}</strong>
      <small>Saldo: {money(d.balance_cents)} · Mínimo: {money(d.minimum_due_cents)} · Vencimento: {d.due_date??"Não informado"}</small>
      <small>Juros: {rate(d.interest_percent,d.interest_period,d.interest_source)}</small>
      <small>CET: {rate(d.cet_percent,d.cet_period,d.cet_source)}</small>
      <small>Multa fixa: {money(d.penalty_fixed_cents)} · Consequências: {d.consequences??"Não informadas"}</small>
      <small>Fonte: {d.source_reference??"Não informada"} · Observado em: {d.as_of_date??"Não informado"}</small>
      {d.has_missing_cost_data&&<p><strong>Informações incompletas.</strong> Sem custo total confiável calculado.</p>}
      <details><summary>Adicionar informação ou correção</summary>
       <p>Valores existentes vêm preenchidos para evitar apagar informações sem querer. Para registrar um campo como desconhecido, apague seu conteúdo. O histórico anterior é preservado.</p>
       <form action={recordDebtObservation} className="finance-form">
        {hidden}<input type="hidden" name="debt_id" value={d.id}/>
        <label>Documento ou origem<input name="source_reference" required maxLength={240}/></label>
        <label>Data da informação<input name="as_of_date" type="date" required/></label>
        <label>Saldo (BRL)<input name="balance_brl" inputMode="decimal" defaultValue={editCents(d.balance_cents)} placeholder="Desconhecido"/></label>
        <label>Pagamento mínimo (BRL)<input name="minimum_brl" inputMode="decimal" defaultValue={editCents(d.minimum_due_cents)} placeholder="Desconhecido"/></label>
        <label>Vencimento<input name="due_date" type="date" defaultValue={d.due_date??""}/></label>
        <label>Juros (% ao período)<input name="interest_percent" inputMode="decimal" defaultValue={d.interest_percent??""}/></label>
        <label>Unidade dos juros<select name="interest_period" defaultValue={d.interest_period??""}>
         <option value="">Desconhecida</option><option value="monthly">Mensal</option>
         <option value="annual">Anual</option><option value="daily">Diária</option></select></label>
        <label>Fonte dos juros<input name="interest_source" maxLength={240} defaultValue={d.interest_source??""}/></label>
        <label>CET (% ao período)<input name="cet_percent" inputMode="decimal" defaultValue={d.cet_percent??""}/></label>
        <label>Unidade do CET<select name="cet_period" defaultValue={d.cet_period??""}>
         <option value="">Desconhecida</option><option value="annual">Anual</option>
         <option value="monthly">Mensal</option><option value="daily">Diária</option></select></label>
        <label>Fonte do CET<input name="cet_source" maxLength={240} defaultValue={d.cet_source??""}/></label>
        <label>Multa fixa (BRL)<input name="penalty_brl" inputMode="decimal" defaultValue={editCents(d.penalty_fixed_cents)}/></label>
        <label>Consequências conhecidas<textarea name="consequences" maxLength={1200} defaultValue={d.consequences??""}/></label>
        <button type="submit" className="button button-primary">Registrar novo snapshot</button>
       </form>
      </details>
      <details><summary>Histórico preservado</summary>
       {observations.filter(o=>o.debt_id===d.id).map(o=><p key={o.id}>
        {o.as_of_date} · {o.source_reference} · Saldo: {money(o.balance_cents)}
       </p>)}
       <small>Exibidas até 100 observações recentes do espaço. O banco guarda as anteriores.</small>
      </details>
     </div></div>)}
     {debts.length===0&&<p>Nenhuma dívida cadastrada.</p>}
   </section>
  </>;
 }
 return <main className="dashboard-shell"><section className="dashboard-main"><div className="finance-workspace">
  <header><p className="eyebrow">FINANCE AI · M04</p><h1>Cadastro de dívidas</h1>
  <p>Registre apenas condições conhecidas e sua origem. Campos vazios não são considerados zero.</p>
  <Link href="/dashboard/commitments">← Voltar a contas a pagar</Link></header>
  {p.notice&&msg[p.notice]&&<output className="finance-notice block">{msg[p.notice]}</output>}
  <nav className="finance-tabs" aria-label="Espaço financeiro">
   <Link className={type==="personal"?"finance-tab active":"finance-tab"} href="/dashboard/debts?space=personal">Pessoal</Link>
   <Link className={type==="store"?"finance-tab active":"finance-tab"} href="/dashboard/debts?space=store">Loja</Link>
  </nav>
  {debtPanel}
 </div></section></main>;
}
