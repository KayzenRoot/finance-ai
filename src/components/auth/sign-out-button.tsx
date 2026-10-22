"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/browser";

export function SignOutButton() {
  const router = useRouter();

  async function signOut() {
    const supabase = createClient();
    if (!supabase) return;

    await supabase.auth.signOut();
    router.replace("/login");
    router.refresh();
  }

  return <button className="signout-button" type="button" onClick={() => void signOut()}>Sair</button>;
}
