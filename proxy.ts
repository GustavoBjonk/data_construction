import type { NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/proxy";

export async function proxy(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  // Somente rotas que dependem de sessão: as páginas de conteúdo continuam
  // estáticas e não pagam o custo de verificar cookies.
  matcher: ["/conta/:path*", "/entrar", "/cadastro", "/redefinir-senha", "/auth/:path*"],
};
