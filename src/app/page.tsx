import Link from "next/link";

export default function Home() {
  return (
    <main className="page-shell">
      <header className="topbar">
        <Link className="brand" href="/" aria-label="Finance AI, início">
          <span className="brand-mark" aria-hidden="true">F</span>
          <span>finance<span className="brand-light">ai</span></span>
        </Link>
        <Link className="text-link" href="/login">Entrar</Link>
      </header>

      <section className="hero">
        <p className="eyebrow"><span className="status-dot" /> FINANÇAS COM MAIS CLAREZA</p>
        <h1>Uma visão mais clara para decidir o próximo passo.</h1>
        <p className="hero-copy">
          Organize suas finanças pessoais e da loja em espaços separados. O Finance AI
          está sendo construído para explicar prioridades com critérios claros e manter
          você no controle de cada decisão.
        </p>
        <div className="hero-actions">
          <Link className="button button-primary" href="/login">Acessar com carteira <span aria-hidden="true">↗</span></Link>
          <a className="button button-secondary" href="#principios">Conhecer os princípios</a>
        </div>
        <p className="security-note">A assinatura serve somente para confirmar sua identidade. O app não movimenta fundos.</p>
      </section>

      <section className="feature-grid" id="principios" aria-label="Princípios do Finance AI">
        <article className="feature-card">
          <span className="card-index">01 / ORGANIZAÇÃO</span>
          <h2>Pessoal e Loja, com limites claros.</h2>
          <p>Dois espaços para separar as contas e entender o panorama sem misturar os movimentos.</p>
        </article>
        <article className="feature-card">
          <span className="card-index">02 / EXPLICAÇÃO</span>
          <h2>Prioridades que mostram o porquê.</h2>
          <p>As recomendações devem expor premissas, datas e custos conhecidos para você avaliar.</p>
        </article>
        <article className="feature-card">
          <span className="card-index">03 / CONTROLE</span>
          <h2>Você confirma cada decisão.</h2>
          <p>Sem pagamentos automáticos ou movimentação de cripto. A decisão final continua sua.</p>
        </article>
      </section>

      <footer className="site-footer">
        <span>FINANCE AI · FUNDAÇÃO EM CONSTRUÇÃO</span>
        <span>Privacidade e controle desde o primeiro passo.</span>
      </footer>
    </main>
  );
}
