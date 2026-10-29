"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type AuthState = "unknown" | "signed-in" | "signed-out";

/** Inlined no build: com autenticação desligada, o bloco abaixo vira código morto. */
const AUTH_ENABLED = process.env.NEXT_PUBLIC_AUTH_ENABLED === "true";

/**
 * "Entrar" ou "Conta" conforme a sessão no navegador. Fica no cliente para
 * que o layout não leia cookies — o que tornaria todas as páginas dinâmicas.
 * Serve só para navegação: nenhuma permissão depende deste estado.
 */
export function AccountLink({ className = "" }: { className?: string }) {
  const [state, setState] = useState<AuthState>("unknown");

  useEffect(() => {
    if (!AUTH_ENABLED) return;
    let unsubscribe: (() => void) | undefined;
    let cancelled = false;

    // Import dinâmico: o supabase-js só é baixado quando a autenticação está ativa.
    import("@/lib/supabase/browser").then(({ getSupabaseBrowserClient }) => {
      const supabase = getSupabaseBrowserClient();
      if (!supabase || cancelled) return;
      supabase.auth.getSession().then(({ data }) => {
        if (!cancelled) setState(data.session ? "signed-in" : "signed-out");
      });
      const { data } = supabase.auth.onAuthStateChange((_event, session) => {
        setState(session ? "signed-in" : "signed-out");
      });
      unsubscribe = () => data.subscription.unsubscribe();
    });

    return () => {
      cancelled = true;
      unsubscribe?.();
    };
  }, []);

  if (state === "unknown") return null;

  const signedIn = state === "signed-in";
  return (
    <Link
      href={signedIn ? "/conta" : "/entrar"}
      className={`inline-flex min-h-[44px] items-center text-[0.8125rem] text-muted transition-colors hover:text-fg ${className}`}
    >
      {signedIn ? "Minha conta" : "Entrar"}
    </Link>
  );
}
