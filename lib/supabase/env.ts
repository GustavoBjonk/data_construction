/**
 * Configuração pública do Supabase. A chave publicável (ou anon) é feita para
 * o navegador: a proteção dos dados vem das políticas RLS, não do segredo.
 * A service role key NUNCA deve ser lida aqui nem prefixada com NEXT_PUBLIC_.
 */
export interface SupabasePublicEnv {
  url: string;
  publishableKey: string;
}

export function getSupabaseEnv(): SupabasePublicEnv | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const publishableKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !publishableKey) return null;
  return { url, publishableKey };
}

export function isSupabaseConfigured(): boolean {
  return getSupabaseEnv() !== null;
}

/**
 * Contas, login e painel. Desligado por padrão: exige
 * NEXT_PUBLIC_AUTH_ENABLED=true E o Supabase configurado. Ter as chaves no
 * .env não basta — ativar autenticação é uma decisão explícita.
 */
export function isAuthEnabled(): boolean {
  return process.env.NEXT_PUBLIC_AUTH_ENABLED === "true" && isSupabaseConfigured();
}

/**
 * Origem do conteúdo público. Padrão `static` (arquivos de data/) até o seed
 * ser validado no banco; trocar para `supabase` é uma decisão explícita.
 */
export type ContentSource = "static" | "supabase";

export function getContentSource(): ContentSource {
  return process.env.CONTENT_SOURCE === "supabase" && isSupabaseConfigured() ? "supabase" : "static";
}
