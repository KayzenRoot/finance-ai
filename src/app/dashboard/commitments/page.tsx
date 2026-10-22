import Link from "next/link";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { formatBrlCents } from "@/lib/finance/money.mjs";
import {cancelCommitment,createCommitment,createRecurringPlan,generateOccurrences,settleCommitment} from "./commitment-actions";
type Space={id:string;space_type:string;display_name:string};
type Account={id:string;name:string;archived_at:string|null};
type Category={id:string;name:string;kind:string;archived_at:string|null};
type Obligation={id:string;kind:string;description:string;due_date:string;amount_cents:string;confidence_percent:number;status:string;series_id:string|null};
type Plan={id:string;description:string;kind:string;frequency:string;first_due_date:string};
type Params={space?:string;notice?:string;status?:string};
const messages:Record<string,string>={
 created:"Compromisso registrado como previsão, sem alterar o saldo.",
 canceled:"Compromisso cancelado sem movimentar dinheiro.",
 settled:"Liquidação manual registrada uma única vez no livro financeiro.",
 "plan-created":"Plano de recorrência cadastrado.",
 generated:"Ocorrências geradas. Datas já existentes não foram duplicadas.",
 invalid:"Confira os campos e as datas.",
 "invalid-money":"Informe valor positivo e confiança de 0 a 100%.",
 "create-error":"Não foi possível cadastrar a previsão.",
 "plan-error":"Não foi possível criar a recorrência.",
 "generate-error":"Geração recusada. Confira período máximo de 18 meses e plano.",
 "cancel-error":"Cancelamento recusado. O compromisso pode estar liquidado.",
 "settle-error":"Liquidação recusada. Confira conta ativa, categoria, espaço, data e status.",
};
export default function CommitmentsPage({searchParams}:{searchParams:Promise<Params>}){
 return <Suspense fallback={<main className="dashboard-shell"><section className="dashboard-main">
  <div className="dashboard-card" role="status">Validando sua sessão financeira…</div>
 </section></main>}><CommitmentContent searchParams={searchParams}/></Suspense>;
}
async function CommitmentContent({searchParams}:{searchParams:Promise<Params>}){
 const params=await searchParams,selected=params.space==="store"?"store":"personal";
 const client=await createClient();if(!client)redirect("/login");
 const {data,error}=await client.auth.getUser();
 if(error||!data.user||data.user.id!==process.env.FINANCE_AI_OWNER_USER_ID)redirect("/login");
 const gate=await client.rpc("finance_is_authorized_owner");
 if(gate.error||gate.data!==true)return <main className="dashboard-shell"><section className="dashboard-main">
 <div className="dashboard-card"><h1>Carteira não provisionada</h1><p>Nenhum dado financeiro foi consultado.</p></div>
 </section></main>;
 const {data:spacesRaw,error:spaceErr}=await client.from("finance_spaces")
  .select("id,space_type,display_name").eq("owner_id",data.user.id);
 if(spaceErr)return <main className="dashboard-shell"><section className="dashboard-main">
 <div className="dashboard-card"><h1>Não foi possível obter os espaços</h1></div></section></main>;
 const space=((spacesRaw??[]) as Space[]).find(s=>s.space_type===selected);
 let obligations:Obligation[]=[],plans:Plan[]=[],accounts:Account[]=[],categories:Category[]=[],failed=false;
 let pendingOut=BigInt(0),pendingIn=BigInt(0);
 const statusFilter=["open","settled","canceled"].includes(params.status??"")?params.status!:"";
 if(space){
 let obligationQuery=client.from("finance_commitments")
  .select("id,kind,description,due_date,amount_cents,confidence_percent,status,series_id")
  .eq("owner_id",data.user.id).eq("space_id",space.id);
 if(statusFilter)obligationQuery=obligationQuery.eq("status",statusFilter);
 const [a,b,c,d,summary]=await Promise.all([
  obligationQuery.order("due_date").limit(100),
  client.from("finance_recurring_plans").select("id,kind,description,frequency,first_due_date")
   .eq("owner_id",data.user.id).eq("space_id",space.id).order("created_at",{ascending:false}).limit(30),
  client.from("finance_accounts").select("id,name,archived_at")
   .eq("owner_id",data.user.id).eq("space_id",space.id),
  client.from("finance_categories").select("id,name,kind,archived_at")
   .eq("owner_id",data.user.id).eq("space_id",space.id),
  client.from("finance_commitment_summary").select("kind,open_amount_cents")
   .eq("owner_id",data.user.id).eq("space_id",space.id),
 ]);
 failed=Boolean(a.error||b.error||c.error||d.error||summary.error);
 if(!summary.error){
  pendingOut=BigInt(summary.data?.find(x=>x.kind==="payable")?.open_amount_cents??"0");
  pendingIn=BigInt(summary.data?.find(x=>x.kind==="receivable")?.open_amount_cents??"0");
 }
 obligations=(a.data??[]) as Obligation[];plans=(b.data??[]) as Plan[];
 accounts=(c.data??[]) as Account[];categories=(d.data??[]) as Category[];
 }
 const activeAccounts=accounts.filter(a=>!a.archived_at),activeCats=categories.filter(c=>!c.archived_at);
 // Summary is calculated from every open commitment in the database, not this 100-row page.
 const hidden=<><input type="hidden" name="space_type" value={selected}/>{space&&<input type="hidden" name="space_id" value={space.id}/>}</>;
 return <main className="dashboard-shell"><section className="dashboard-main"><div className="finance-workspace">
  <header><p className="eyebrow">FINANCE AI · M03</p><h1>Contas a pagar e receber</h1>
   <p>Planejamento financeiro. Recebíveis previstos não entram no saldo confirmado.</p>
   <Link href="/dashboard/ledger">← Ver livro financeiro</Link></header>
  {params.notice&&messages[params.notice]&&<p role="status" className="finance-notice">{messages[params.notice]}</p>}
  <nav className="finance-tabs" aria-label="Selecionar espaço">
   <Link className={selected==="personal"?"finance-tab active":"finance-tab"} href="/dashboard/commitments?space=personal">Pessoal</Link>
   <Link className={selected==="store"?"finance-tab active":"finance-tab"} href="/dashboard/commitments?space=store">Loja</Link>
  </nav>
  {!space?<section className="finance-panel"><h2>Espaço ainda não criado</h2>
   <Link href={`/dashboard?space=${selected}`}>Criar espaço antes de cadastrar contas a pagar</Link>
  </section>:failed?<section className="finance-panel"><h2>Compromissos indisponíveis</h2>
   <p>Confirme as migrações M03 no Supabase privado autorizado.</p></section>:<>
  <div className="grid-stats">
   <div className="finance-panel"><p className="eyebrow">A PAGAR · PREVISTO</p><h2>{formatBrlCents(pendingOut)}</h2><p>Não debitado do saldo confirmado.</p></div>
   <div className="finance-panel"><p className="eyebrow">A RECEBER · ESTIMADO</p><h2>{formatBrlCents(pendingIn)}</h2><p>Valor bruto sujeito à confiança individual, não disponível em caixa.</p></div>
  </div>
  <section className="finance-panel"><h2>Novo compromisso</h2><form action={createCommitment} className="finance-form">{hidden}
   <label>Natureza<select name="kind" required><option value="payable">Conta a pagar</option><option value="receivable">Conta a receber</option></select></label>
   <label>Descrição<input name="description" minLength={1} maxLength={240} required placeholder="Ex.: aluguel"/></label>
   <label>Valor BRL<input name="amount_brl" required inputMode="decimal" placeholder="350,00"/></label>
   <label>Vencimento<input name="due_date" type="date" required/></label>
   <label>Confiança do recebível (%)<input name="confidence_percent" type="number" min={0} max={100} defaultValue={100}/></label>
   <button className="button button-primary" type="submit">Cadastrar previsão</button>
  </form><p>Pagáveis sempre têm confiança 100%; recebíveis podem ser incertos.</p></section>
  <section className="finance-panel"><h2>Recorrência semanal ou mensal</h2>
   <form action={createRecurringPlan} className="finance-form">{hidden}
    <label>Natureza<select name="kind"><option value="payable">A pagar</option><option value="receivable">A receber</option></select></label>
    <label>Descrição<input name="description" minLength={1} maxLength={240} required/></label>
    <label>Valor BRL<input name="amount_brl" inputMode="decimal" required placeholder="800,00"/></label>
    <label>Primeiro vencimento<input name="first_due_date" type="date" required/></label>
    <label>Frequência<select name="frequency"><option value="monthly">Mensal</option><option value="weekly">Semanal</option></select></label>
    <label>Confiança do recebível (%)<input name="confidence_percent" type="number" min={0} max={100} defaultValue={100}/></label>
    <button className="button button-primary" type="submit">Criar plano</button>
   </form>
   {plans.map(p=><div className="finance-account" key={p.id}><div><strong>{p.description}</strong>
    <small>{p.kind==="payable"?"A pagar":"A receber"} · {p.frequency==="monthly"?"Mensal":"Semanal"} · Início {p.first_due_date}</small></div>
    <form action={generateOccurrences} className="finance-form">{hidden}
     <input name="series_id" type="hidden" value={p.id}/>
     <label>Gerar até<input name="through_date" type="date" min={p.first_due_date} required/></label>
     <button className="button button-primary" type="submit">Gerar ocorrências</button>
    </form>
   </div>)}
   {plans.length===0&&<p>Não há planos recorrentes cadastrados.</p>}
  </section>
  <section className="finance-panel"><h2>Agenda de compromissos</h2>
   <p>Até 100 compromissos por consulta. Os totais acima cobrem todos os compromissos abertos, independentemente da listagem.</p>
   <form method="get" action="/dashboard/commitments" className="finance-form">
    <input type="hidden" name="space" value={selected}/>
    <label>Situação<select name="status" defaultValue={statusFilter}>
     <option value="">Todas</option><option value="open">Em aberto</option>
     <option value="settled">Liquidadas</option><option value="canceled">Canceladas</option>
    </select></label>
    <button type="submit" className="button button-primary">Filtrar agenda</button>
   </form>
   <p>Liquidação é uma confirmação manual de valor integral. Nenhum Pix ou boleto é enviado.</p>
   {obligations.map(item=><div key={item.id} className="finance-account">
    <div><strong>{item.description}</strong><small>{item.due_date} · {item.kind==="payable"?"A pagar":"A receber"} ·
      Confiança {item.confidence_percent}% · {item.status==="open"?"Em aberto":item.status==="settled"?"Liquidado":"Cancelado"}
    </small></div>
    <div className="finance-account-right"><strong>{formatBrlCents(item.amount_cents)}</strong>
     {item.status==="open"&&<>
      <details><summary>Confirmar liquidação</summary>
       {activeAccounts.length===0||activeCats.filter(c=>c.kind===(item.kind==="payable"?"expense":"income")).length===0
        ?<p>É necessária conta ativa e categoria do tipo correto.</p>
        :<form action={settleCommitment} className="finance-form">{hidden}
          <input type="hidden" name="commitment_id" value={item.id}/>
          <label>Conta<select name="account_id" required defaultValue=""><option disabled value="">Selecione</option>
           {activeAccounts.map(a=><option key={a.id} value={a.id}>{a.name}</option>)}</select></label>
          <label>Categoria<select name="category_id" required defaultValue=""><option disabled value="">Selecione</option>
           {activeCats.filter(c=>c.kind===(item.kind==="payable"?"expense":"income")).map(c=>
             <option key={c.id} value={c.id}>{c.name}</option>)}</select></label>
          <label>Data de liquidação<input name="effective_date" type="date" required/></label>
          <button className="button button-primary" type="submit">Registrar liquidação manual</button>
        </form>}
      </details>
      <form action={cancelCommitment}>{hidden}<input type="hidden" name="commitment_id" value={item.id}/>
       <button type="submit" className="finance-link">Cancelar previsão</button></form>
     </>}
    </div>
   </div>)}
   {obligations.length===0&&<p>Nenhum compromisso neste espaço.</p>}
  </section>
  </>}
 </div></section></main>;
}
