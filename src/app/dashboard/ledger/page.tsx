import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { formatBrlCents } from "@/lib/finance/money.mjs";
import { archiveCategory,cancelEntry,correctEntry,createCategory,recordEntry,renameCategory } from "./ledger-actions";

type Space={id:string;space_type:string;display_name:string};
type Account={id:string;name:string;archived_at:string|null};
type Category={id:string;name:string;kind:string;archived_at:string|null};
type Entry={id:string;account_id:string;category_id:string;kind:string;entry_role:string;
  reverses_entry_id:string|null;amount_cents:string;effective_date:string;description:string};
type Params={space?:string;notice?:string};
const notes:Record<string,string>={
 "category-created":"Categoria cadastrada.","category-renamed":"Categoria renomeada.",
 "category-archived":"Categoria arquivada.","category-error":"Categoria não alterada.",
 "entry-created":"Lançamento confirmado.","entry-corrected":"Correção e estorno registrados.",
 "entry-canceled":"Estorno registrado.","entry-error":"Lançamento recusado.",
 "cancel-error":"Estorno recusado; lançamento possivelmente já corrigido.",
 "correction-error":"Correção recusada; confira os dados.",
 "invalid":"Confira os campos.","invalid-money":"Informe valor BRL positivo, ex.: 125,50.",
 "denied":"Acesso a espaço não autorizado."
};
function formCents(raw:string){const c=BigInt(raw);return (c/BigInt(100)).toString()+","+(c%BigInt(100)).toString().padStart(2,"0");}
export default async function LedgerPage({searchParams}:{searchParams:Promise<Params>}){
 const params=await searchParams,type=params.space==="store"?"store":"personal";
 const client=await createClient();if(!client)redirect("/login");
 const {data,error}=await client.auth.getUser();
 if(error||!data.user||data.user.id!==process.env.FINANCE_AI_OWNER_USER_ID)redirect("/login");
 const gate=await client.rpc("finance_is_authorized_owner");
 if(gate.error||gate.data!==true)return <main className="dashboard-shell"><section className="dashboard-main">
  <div className="dashboard-card"><h1>Carteira não autorizada</h1><p>Nenhum dado financeiro foi consultado.</p></div>
 </section></main>;
 const {data:spacesRaw,error:spaceError}=await client.from("finance_spaces")
  .select("id,space_type,display_name").eq("owner_id",data.user.id);
 if(spaceError)return <main className="dashboard-shell"><section className="dashboard-main">
  <div className="dashboard-card"><h1>Espaços indisponíveis</h1></div></section></main>;
 const space=((spacesRaw??[]) as Space[]).find(x=>x.space_type===type);
 let accounts:Account[]=[],categories:Category[]=[],entries:Entry[]=[],queryError=false;
 if(space){
  const [a,c,e]=await Promise.all([
    client.from("finance_accounts").select("id,name,archived_at")
      .eq("owner_id",data.user.id).eq("space_id",space.id).order("name"),
    client.from("finance_categories").select("id,name,kind,archived_at")
      .eq("owner_id",data.user.id).eq("space_id",space.id).order("name"),
    client.from("finance_ledger_entries")
      .select("id,account_id,category_id,kind,entry_role,reverses_entry_id,amount_cents,effective_date,description")
      .eq("owner_id",data.user.id).eq("space_id",space.id)
      .order("effective_date",{ascending:false}).limit(100)
  ]);
  queryError=Boolean(a.error||c.error||e.error);
  accounts=(a.data??[]) as Account[];categories=(c.data??[]) as Category[];entries=(e.data??[]) as Entry[];
 }
 const activeAccounts=accounts.filter(x=>!x.archived_at),activeCategories=categories.filter(x=>!x.archived_at);
 const reversedIds=new Set(entries.filter(x=>x.entry_role==="reversal").map(x=>x.reverses_entry_id));
 const accountNames=new Map(accounts.map(x=>[x.id,x.name])),categoryNames=new Map(categories.map(x=>[x.id,x.name]));
 const hidden=<input type="hidden" name="space_type" value={type}/>;
 return <main className="dashboard-shell"><section className="dashboard-main"><div className="finance-workspace">
  <header><p className="eyebrow">FINANCE AI · M02</p><h1>Livro financeiro</h1>
   <p>Receitas, despesas e categorias manuais. Nenhum pagamento é executado.</p>
   <Link href="/dashboard">← Voltar para contas e saldos</Link></header>
  {params.notice&&notes[params.notice]&&<p className="finance-notice" role="status">{notes[params.notice]}</p>}
  <nav className="finance-tabs" aria-label="Selecionar espaço">
   <Link className={type==="personal"?"finance-tab active":"finance-tab"} href="/dashboard/ledger?space=personal">Pessoal</Link>
   <Link className={type==="store"?"finance-tab active":"finance-tab"} href="/dashboard/ledger?space=store">Loja</Link>
  </nav>
  {!space?<section className="finance-panel"><h2>Espaço não criado</h2>
   <Link href={`/dashboard?space=${type}`}>Cadastrar espaço primeiro</Link></section>
  :queryError?<section className="finance-panel"><h2>Livro indisponível</h2>
   <p>Confirme migrações M02 e autorização do banco privado.</p></section>
  :<>
   <section className="finance-panel"><h2>Registrar lançamento</h2>
    {activeAccounts.length===0||activeCategories.length===0?<p>Cadastre contas e categorias ativas antes de lançar.</p>:
     <form action={recordEntry} className="finance-form">{hidden}
      <label>Tipo<select name="kind"><option value="expense">Despesa</option><option value="income">Receita</option></select></label>
      <label>Conta<select name="account_id" required defaultValue=""><option value="" disabled>Selecione</option>
       {activeAccounts.map(x=><option key={x.id} value={x.id}>{x.name}</option>)}</select></label>
      <label>Categoria<select name="category_id" required defaultValue=""><option value="" disabled>Selecione</option>
       {activeCategories.map(x=><option key={x.id} value={x.id}>{x.kind==="income"?"Receita":"Despesa"} · {x.name}</option>)}</select></label>
      <label>Valor BRL<input name="amount_brl" inputMode="decimal" placeholder="125,50" required/></label>
      <label>Data<input name="effective_date" type="date" required/></label>
      <label>Descrição<input name="description" maxLength={240} minLength={1} required/></label>
      <button className="button button-primary" type="submit">Confirmar lançamento</button>
     </form>}
   </section>
   <section className="finance-panel"><h2>Categorias de {space.display_name}</h2>
    <form className="finance-form" action={createCategory}>{hidden}
     <input type="hidden" name="space_id" value={space.id}/>
     <label>Tipo<select name="kind"><option value="expense">Despesa</option><option value="income">Receita</option></select></label>
     <label>Nome<input name="name" minLength={1} maxLength={80} required placeholder="Ex.: Alimentação"/></label>
     <button className="button button-primary" type="submit">Criar categoria</button>
    </form>
    {categories.map(c=><div className="finance-account" key={c.id}>
     <div><strong>{c.name}</strong><small>{c.kind==="income"?"Receita":"Despesa"}{c.archived_at?" · Arquivada":""}</small></div>
     {!c.archived_at&&<div className="finance-account-right">
      <details><summary>Renomear</summary><form action={renameCategory}>{hidden}
       <input type="hidden" name="space_id" value={space.id}/><input type="hidden" name="category_id" value={c.id}/>
       <label>Novo nome<input name="name" defaultValue={c.name} minLength={1} maxLength={80} required/></label>
       <button className="finance-link" type="submit">Salvar</button>
      </form></details>
      <form action={archiveCategory}>{hidden}<input type="hidden" name="space_id" value={space.id}/>
       <input type="hidden" name="category_id" value={c.id}/>
       <button className="finance-link" type="submit">Arquivar</button></form>
     </div>}
    </div>)}
    {categories.length===0&&<p>Sem categorias neste espaço.</p>}
   </section>
   <section className="finance-panel"><h2>Histórico com estornos</h2>
    <p>Até 100 eventos recentes; nenhuma correção ou cancelamento apaga o registro original.</p>
    {entries.map(e=>{
     const active=e.entry_role!=="reversal"&&!reversedIds.has(e.id);
     const allowed=activeCategories.filter(c=>c.kind===e.kind);
     return <div className="finance-account" key={e.id}>
      <div><strong>{e.description}</strong><small>{e.effective_date} · {accountNames.get(e.account_id)??"Conta"}
       {" · "}{categoryNames.get(e.category_id)??"Categoria"} · {e.entry_role==="reversal"?"Estorno":e.entry_role==="replacement"?"Substituição":"Original"}
       {!active&&e.entry_role!=="reversal"?" · Estornado":""}</small>
       {active&&<details><summary>Corrigir lançamento</summary>
        <form className="finance-form" action={correctEntry}>{hidden}
         <input type="hidden" name="entry_id" value={e.id}/>
         <label>Categoria<select name="category_id" required defaultValue={e.category_id}>
           {allowed.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}
         </select></label>
         <label>Valor BRL<input name="amount_brl" inputMode="decimal" defaultValue={formCents(e.amount_cents)} required/></label>
         <label>Data<input name="effective_date" type="date" defaultValue={e.effective_date} required/></label>
         <label>Descrição<input name="description" defaultValue={e.description} minLength={1} maxLength={240} required/></label>
         <button className="button button-primary" type="submit">Corrigir com estorno</button>
        </form></details>}
      </div>
      <div className="finance-account-right">
       <strong>{e.entry_role==="reversal"?(e.kind==="income"?"-":"+"):(e.kind==="income"?"+":"-")}{formatBrlCents(e.amount_cents)}</strong>
       {active&&<form action={cancelEntry}>{hidden}<input type="hidden" name="entry_id" value={e.id}/>
        <button className="finance-link" type="submit">Estornar</button></form>}
      </div>
     </div>;
    })}
    {entries.length===0&&<p>Nenhum lançamento neste espaço.</p>}
   </section>
  </>}
 </div></section></main>;
}
