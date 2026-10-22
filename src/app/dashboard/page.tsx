import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { createClient } from "@/lib/supabase/server";

export default function DashboardPage() {
  return (
    <main className="dashboard-shell">
      <header className="dashboard-topbar">
        <Link className="brand" href="/">
          <span className="brand-mark" aria-hidden="true">F</span>
          <span>finance<span className="brand-light">ai</span></span>
        </Link>
        <SignOutButton />
      </header>
      <section className="dashboard-main">
        <Suspense fallback={<div className="dashboard-card" role="status">Validando sua sessão…</div>}>
          <DashboardContent />
        </Suspense>
      </section>
    </main>
  );
}

async function DashboardContent() {
  const supabase = await createClient();
  if (!supabase) redirect("/login");

  // getUser() revalidates the session with Auth, including server-side revocation.
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) redirect("/login");

  const ownerId = process.env.FINANCE_AI_OWNER_USER_ID;
  const matchesServerAllowlist = Boolean(ownerId && data.user.id === ownerId);
  const { data: isProvisioned, error: provisionError } = matchesServerAllowlist
    ? await supabase.rpc("finance_is_authorized_owner")
    : { data: false, error: null };
  const isOwner = matchesServerAllowlist && provisionError === null && isProvisioned === true;

  return (
    <div className="dashboard-card">
      <p className="eyebrow">ESPAÇO DO TITULAR</p>
      {isOwner ? (
        <>
          <h1>Fundação pronta para evoluir.</h1>
          <p>A sessão foi confirmada e vinculada ao titular autorizado. Os módulos de contas e movimentações ainda não foram habilitados.</p>
          <div className="setup-note">Nesta etapa não há dados financeiros para exibir. Quando os módulos forem adicionados, Pessoal e Loja terão acesso isolado por políticas no banco.</div>
        </>
      ) : (
        <>
          <h1>Acesso ainda não vinculado.</h1>
          <p>A carteira autenticou corretamente, mas esta conta não está autorizada a acessar o espaço financeiro.</p>
          <div className="setup-note">O titular precisa configurar <code>FINANCE_AI_OWNER_USER_ID</code> no servidor e ser autorizado na lista privada do banco. Nenhum dado foi carregado.</div>
        </>
      )}
    </div>
  );
}
