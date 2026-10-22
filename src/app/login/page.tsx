import Link from "next/link";
import { WalletLogin } from "@/components/auth/wallet-login";

export default function LoginPage() {
  return (
    <main className="auth-wrap">
      <section className="auth-card" aria-labelledby="login-title">
        <Link className="brand" href="/" aria-label="Voltar ao início">
          <span className="brand-mark" aria-hidden="true">F</span>
          <span>finance<span className="brand-light">ai</span></span>
        </Link>
        <p className="eyebrow">ACESSO DO TITULAR</p>
        <h1 id="login-title">Entre com sua carteira.</h1>
        <p>Use uma assinatura de mensagem para confirmar sua identidade. Ela não autoriza transações nem movimenta fundos.</p>
        <WalletLogin />
        <div className="wallet-hint">Nunca compartilhe sua frase-semente ou chave privada. O Finance AI não solicita esses dados.</div>
        <Link className="auth-back" href="/">← Voltar para a página inicial</Link>
      </section>
    </main>
  );
}
