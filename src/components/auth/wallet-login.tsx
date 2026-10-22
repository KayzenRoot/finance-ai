"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/browser";

type WalletChain = "ethereum" | "solana";

export function WalletLogin() {
  const router = useRouter();
  const [pending, setPending] = useState<WalletChain | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function signIn(chain: WalletChain) {
    const supabase = createClient();
    if (!supabase) {
      setMessage("A autenticação ainda não está configurada neste ambiente.");
      return;
    }

    setPending(chain);
    setMessage(null);

    try {
      const statement = "Use esta assinatura somente para entrar no Finance AI. Nenhum fundo será movimentado.";
      const options = { url: window.location.origin };
      const result = chain === "ethereum"
        ? await supabase.auth.signInWithWeb3({ chain, statement, options })
        : await supabase.auth.signInWithWeb3({ chain, statement, options });

      if (result.error) {
        setMessage("Não foi possível confirmar a carteira. Verifique se a extensão está instalada e tente novamente.");
        return;
      }

      router.replace("/dashboard");
      router.refresh();
    } catch {
      setMessage("Não foi possível confirmar a carteira. Verifique se a extensão está instalada e tente novamente.");
    } finally {
      setPending(null);
    }
  }

  return (
    <div className="wallet-options">
      <button className="wallet-button" type="button" disabled={pending !== null} onClick={() => void signIn("ethereum")}>
        <span>Ethereum / EVM</span><span aria-hidden="true">↗</span>
      </button>
      <button className="wallet-button" type="button" disabled={pending !== null} onClick={() => void signIn("solana")}>
        <span>Solana</span><span aria-hidden="true">↗</span>
      </button>
      {pending && <p role="status" className="wallet-hint">Aguardando confirmação na carteira…</p>}
      {message && <p role="alert" className="alert">{message}</p>}
    </div>
  );
}
