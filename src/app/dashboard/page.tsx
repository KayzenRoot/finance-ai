import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { createClient } from "@/lib/supabase/server";
import { formatBrlCents } from "@/lib/finance/money.mjs";
import { archiveAccount, createAccount, createSpace, recordInternalTransfer, renameAccount } from "./finance-actions";

type Space = { id: string; owner_id: string; space_type: string; display_name: string };
type Balance = { account_id: string; owner_id: string; space_id: string; account_type: string; name: string; opening_balance_date: string; opening_balance_cents: string | number; current_balance_cents: string | number; archived_at: string | null };
type Transfer = { id: string; from_account_id: string; to_account_id: string; amount_cents: string | number; effective_date: string };
type Params = { space?: string; notice?: string };

const labels: Record<string, string> = { bank: "Banco", cash: "Dinheiro em caixa", card: "Cartão" };
const noticeText: Record<string, string> = {
  "space-created": "Espaço criado.",
  "account-created": "Conta cadastrada.",
  "account-renamed": "Conta renomeada.",
  "rename-error": "Não foi possível renomear a conta.",
  "account-archived": "Conta arquivada.",
  "transfer-created": "Transferência interna registrada (nenhum dinheiro foi movimentado).",
  "invalid": "Confira os dados informados.",
  "invalid-money": "Informe um valor em BRL, como 1234,56, sem separador de milhares.",
  "unauthorized": "A conta não pertence a um espaço autorizado.",
  "space-error": "Não foi possível criar o espaço. Confira se já existe.",
  "account-error": "Não foi possível cadastrar a conta.",
  "archive-error": "Não foi possível arquivar a conta.",
  "transfer-error": "Transferência recusada. Verifique saldos de referência, titular, contas e data.",
};

function sumCents(accounts: Balance[]) {
  return accounts.reduce((sum, account) => sum + BigInt(account.current_balance_cents), BigInt(0));
}

export default function DashboardPage({ searchParams }: { searchParams: Promise<Params> }) {
  return (
    <main className="dashboard-shell">
      <header className="dashboard-topbar">
        <Link className="brand" href="/"><span className="brand-mark" aria-hidden="true">F</span><span>finance<span className="brand-light">ai</span></span></Link>
        <SignOutButton />
      </header>
      <section className="dashboard-main">
        <Suspense fallback={<div className="dashboard-card" role="status">Validando sua sessão…</div>}>
          <DashboardContent searchParams={searchParams} />
        </Suspense>
      </section>
    </main>
  );
}

async function DashboardContent({ searchParams }: { searchParams: Promise<Params> }) {
  const supabase = await createClient();
  if (!supabase) redirect("/login");
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) redirect("/login");
  const ownerId = process.env.FINANCE_AI_OWNER_USER_ID;
  const ownerMatches = Boolean(ownerId && data.user.id === ownerId);
  const check = ownerMatches ? await supabase.rpc("finance_is_authorized_owner") : { data: false, error: null };
  if (!ownerMatches || check.error || check.data !== true) {
    return <div className="dashboard-card">
      <p className="eyebrow">ACESSO PRIVADO</p>
      <h1>Acesso ainda não vinculado.</h1>
      <p>Esta carteira autenticou, mas não está provisionada como titular financeiro.</p>
      <div className="setup-note">Configure <code>FINANCE_AI_OWNER_USER_ID</code> no servidor e o mesmo identificador na allowlist privada do Supabase. Nenhum dado foi carregado.</div>
    </div>;
  }

  const params = await searchParams;
  const selectedType = params.space === "store" ? "store" : "personal";
  const { data: spacesRaw, error: spacesError } = await supabase.from("finance_spaces")
    .select("id,owner_id,space_type,display_name").eq("owner_id", data.user.id).order("space_type");
  if (spacesError) {
    return <div className="dashboard-card"><h1>Não foi possível carregar os espaços.</h1><p>Confirme a migração e sua autorização privada.</p></div>;
  }
  const spaces = (spacesRaw ?? []) as Space[];
  const selected = spaces.find(space => space.space_type === selectedType);
  const balanceColumns = "account_id,owner_id,space_id,account_type,name,opening_balance_date,opening_balance_cents,current_balance_cents,archived_at";
  const [{ data: balancesRaw, error: balancesError }, { data: scopedRaw, error: scopedError }, { data: transfersRaw, error: transfersError }] = await Promise.all([
    supabase.from("finance_account_balances").select(balanceColumns).eq("owner_id", data.user.id),
    supabase.from("finance_account_balances").select(balanceColumns)
      .eq("owner_id", data.user.id).eq("space_id", selected?.id ?? "00000000-0000-0000-0000-000000000000"),
    supabase.from("finance_transfers").select("id,from_account_id,to_account_id,amount_cents,effective_date")
      .eq("owner_id", data.user.id).order("effective_date", { ascending: false }).limit(10),
  ]);
  if (balancesError || scopedError || transfersError) {
    return <div className="dashboard-card"><h1>Não foi possível carregar as contas.</h1><p>Confirme que a migração do M01 foi aplicada ao banco privado autorizado.</p></div>;
  }
  const accounts = (balancesRaw ?? []) as Balance[];
  const visibleAccounts = (scopedRaw ?? []) as Balance[];
  const transfers = (transfersRaw ?? []) as Transfer[];
  const activeAccounts = accounts.filter(account => !account.archived_at);
  const selectedTotal = sumCents(visibleAccounts);
  // Archived accounts retain their reference in historical totals: otherwise
  // one half of an internal transfer disappears from the consolidation.
  const globalTotal = sumCents(accounts);
  const names = new Map(accounts.map(account => [account.account_id, account.name]));
  const notice = params.notice ? noticeText[params.notice] : null;

  return <div className="finance-workspace">
    <div className="finance-heading">
      <div><p className="eyebrow">FINANCE AI · M01</p><h1>Seus espaços financeiros.</h1>
        <p>Contas e transferências internas, sem conexão bancária ou movimentação de fundos.</p></div>
      <div className="finance-total"><span>Referência consolidada</span><strong>{formatBrlCents(globalTotal)}</strong><small>Inclui contas arquivadas para preservar o histórico. Não representa extrato bancário nem dinheiro disponível.</small></div>
    </div>
    {notice && <p className="finance-notice" role="status">{notice}</p>}
    <div className="finance-tabs" aria-label="Selecionar espaço">
      <Link className={selectedType === "personal" ? "finance-tab active" : "finance-tab"} href="/dashboard?space=personal">Pessoal</Link>
      <Link className={selectedType === "store" ? "finance-tab active" : "finance-tab"} href="/dashboard?space=store">Loja</Link>
    </div>
    {!selected ? <section className="finance-panel">
      <h2>Criar espaço {selectedType === "personal" ? "Pessoal" : "Loja"}</h2>
      <p>O espaço será vinculado exclusivamente ao titular autorizado.</p>
      <form action={createSpace}><input type="hidden" name="space_type" value={selectedType}/><button className="button button-primary" type="submit">Criar espaço</button></form>
    </section> : <>
      <section className="finance-panel">
        <div className="finance-panel-header"><div><p className="eyebrow">{selected.display_name.toUpperCase()}</p><h2>Contas cadastradas</h2></div>
          <div><small>Referência histórica (inclui arquivadas)</small><strong>{formatBrlCents(selectedTotal)}</strong></div>
        </div>
        {visibleAccounts.length === 0 ? <p>Nenhuma conta cadastrada neste espaço.</p> :
          <div className="finance-account-list">{visibleAccounts.map(account =>
            <div className="finance-account" key={account.account_id}>
              <div><strong>{account.name}</strong><small>{labels[account.account_type] ?? account.account_type} · Referência em {account.opening_balance_date}{account.archived_at ? " · Arquivada" : ""}</small></div>
              <div className="finance-account-right"><strong>{formatBrlCents(account.current_balance_cents)}</strong>
                {!account.archived_at && <details className="finance-rename">
                  <summary>Renomear</summary>
                  <form action={renameAccount}>
                    <input type="hidden" name="account_id" value={account.account_id}/>
                    <label htmlFor={`rename-${account.account_id}`} className="sr-only">Novo nome da conta</label>
                    <input id={`rename-${account.account_id}`} name="name" type="text" maxLength={80} minLength={1} defaultValue={account.name} required/>
                    <button type="submit" className="finance-link">Salvar nome</button>
                  </form>
                </details>}
                {!account.archived_at && <form action={archiveAccount}><input type="hidden" name="account_id" value={account.account_id}/><button className="finance-link" type="submit">Arquivar</button></form>}
              </div>
            </div>)}</div>}
      </section>
      <section className="finance-panel"><h2>Nova conta em {selected.display_name}</h2>
        <form action={createAccount} className="finance-form">
          <input type="hidden" name="space_id" value={selected.id} />
          <label>Nome<input name="name" maxLength={80} required placeholder="Ex.: Banco principal"/></label>
          <label>Tipo<select name="account_type"><option value="bank">Banco</option><option value="cash">Dinheiro em caixa</option><option value="card">Cartão</option></select></label>
          <label>Saldo inicial em BRL<input name="opening_balance_brl" inputMode="decimal" required placeholder="1234,56"/></label>
          <label>Data do saldo informado<input name="opening_balance_date" type="date" required/></label>
          <button type="submit" className="button button-primary">Cadastrar conta</button>
        </form>
        <p className="finance-hint">Use valor negativo para saldo devedor. Esse valor é uma referência informada, não é sincronizado com o banco.</p>
      </section>
    </>}
    <section className="finance-panel">
      <h2>Transferência interna</h2>
      <p>O registro gera débito e crédito contábeis vinculados. Não envia dinheiro nem cria receita consolidada.</p>
      {activeAccounts.length < 2 ? <p>Cadastre pelo menos duas contas ativas para registrar transferências.</p> :
        <form action={recordInternalTransfer} className="finance-form">
          <label>De <select name="from_account_id" required defaultValue=""><option value="" disabled>Selecione a origem</option>{activeAccounts.map(a=><option key={a.account_id} value={a.account_id}>{a.name}</option>)}</select></label>
          <label>Para <select name="to_account_id" required defaultValue=""><option value="" disabled>Selecione o destino</option>{activeAccounts.map(a=><option key={a.account_id} value={a.account_id}>{a.name}</option>)}</select></label>
          <label>Valor (BRL)<input name="amount_brl" inputMode="decimal" placeholder="100,00" required/></label>
          <label>Data efetiva<input name="effective_date" type="date" required/></label>
          <button className="button button-primary" type="submit">Registrar transferência interna</button>
        </form>}
      {transfers.length > 0 && <div className="finance-history"><h3>Últimas transferências</h3>{transfers.map(t =>
        <div key={t.id} className="finance-history-row"><span>{names.get(t.from_account_id) ?? "Conta"} → {names.get(t.to_account_id) ?? "Conta"}<small>{t.effective_date}</small></span><strong>{formatBrlCents(t.amount_cents)}</strong></div>
      )}</div>}
    </section>
  </div>;
}
