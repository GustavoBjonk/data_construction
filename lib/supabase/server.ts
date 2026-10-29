import "server-only";
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";
import { cookies } from "next/headers";
import { getSupabaseEnv } from "./env";

export class SupabaseNotConfiguredError extends Error {
  constructor() {
    super("Supabase não configurado: defina NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY.");
  }
}

/** Cliente com a sessão do usuário (cookies). Usar em Server Components e Server Actions. */
export async function createSupabaseServerClient() {
  const env = getSupabaseEnv();
  if (!env) throw new SupabaseNotConfiguredError();
  const cookieStore = await cookies();

  return createServerClient<Database>(env.url, env.publishableKey, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll: (cookiesToSet) => {
        try {
          for (const { name, value, options } of cookiesToSet) cookieStore.set(name, value, options);
        } catch {
          // Server Components não podem gravar cookies; o proxy.ts renova a sessão.
        }
      },
    },
  });
}

/**
 * Cliente anônimo sem cookies, para ler conteúdo público. Não força renderização
 * dinâmica, então as páginas continuam estáticas/ISR. Sujeito às mesmas políticas RLS
 * que qualquer visitante.
 */
export function createSupabasePublicClient() {
  const env = getSupabaseEnv();
  if (!env) throw new SupabaseNotConfiguredError();
  return createClient<Database>(env.url, env.publishableKey, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
}
