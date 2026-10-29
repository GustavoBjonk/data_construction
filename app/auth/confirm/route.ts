import type { EmailOtpType } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";
import { safeRedirectPath } from "@/lib/auth/redirect";
import { isAuthEnabled } from "@/lib/supabase/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const ALLOWED_TYPES: readonly EmailOtpType[] = ["signup", "email", "recovery", "email_change", "invite"];

/**
 * Destino dos links enviados por e-mail (confirmação de cadastro e recuperação).
 * Aceita o fluxo com `token_hash` (recomendado para SSR) e o fluxo PKCE com `code`.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const next = safeRedirectPath(searchParams.get("next"));
  const failure = new URL("/entrar?erro=link", request.url);

  // Autenticação desligada: a rota não existe.
  if (!isAuthEnabled()) return new NextResponse(null, { status: 404 });

  const supabase = await createSupabaseServerClient();
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const code = searchParams.get("code");

  if (tokenHash && type && ALLOWED_TYPES.includes(type)) {
    const { error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash });
    if (!error) return NextResponse.redirect(new URL(type === "recovery" ? "/redefinir-senha" : next, request.url));
  } else if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(new URL(next, request.url));
  }

  return NextResponse.redirect(failure);
}
