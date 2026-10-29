import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { getSupabaseEnv, isAuthEnabled } from "./env";

/**
 * Prefixos que exigem sessão do Supabase. A checagem de papel acontece no
 * servidor (lib/auth/session.ts).
 */
const PROTECTED_PREFIXES = ["/conta"];

function isProtected(pathname: string): boolean {
  return PROTECTED_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}

/**
 * Renova o token de sessão (cookies) a cada requisição e faz o redirecionamento
 * otimista de rotas protegidas. Não é a barreira de segurança: páginas e ações
 * validam o usuário e o papel novamente no servidor.
 */
export async function updateSession(request: NextRequest): Promise<NextResponse> {
  const env = getSupabaseEnv();
  let response = NextResponse.next({ request });
  // Autenticação desligada: nenhuma chamada ao Supabase (as rotas respondem 404).
  if (!env || !isAuthEnabled()) return response;

  const supabase = createServerClient(env.url, env.publishableKey, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (cookiesToSet, headers) => {
        for (const { name, value } of cookiesToSet) request.cookies.set(name, value);
        response = NextResponse.next({ request });
        for (const { name, value, options } of cookiesToSet) response.cookies.set(name, value, options);
        for (const [key, value] of Object.entries(headers ?? {})) response.headers.set(key, value);
      },
    },
  });

  // Não inserir código entre a criação do cliente e getClaims (renovação da sessão).
  const { data } = await supabase.auth.getClaims();
  const isSignedIn = Boolean(data?.claims?.sub);

  if (!isSignedIn && isProtected(request.nextUrl.pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = "/entrar";
    url.search = `?next=${encodeURIComponent(request.nextUrl.pathname + request.nextUrl.search)}`;
    return NextResponse.redirect(url);
  }

  return response;
}
