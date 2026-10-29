import "server-only";
import { notFound, redirect } from "next/navigation";
import { cache } from "react";
import { logServerEvent } from "@/lib/observability";
import { isAuthEnabled } from "@/lib/supabase/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { type AccountStatus, type AppRole, isAppRole } from "./roles";

export interface SessionUser {
  id: string;
  email: string | null;
  role: AppRole;
  status: AccountStatus;
  /** O papel não pôde ser lido (falha de banco). O usuário fica com privilégio mínimo. */
  roleLookupFailed: boolean;
}


/**
 * Usuário autenticado da requisição atual. O JWT é validado com `getClaims`
 * e o papel é lido do banco (RLS: cada um só lê o próprio papel) — nunca de
 * metadados do token, que o usuário pode alterar.
 */
export const getSessionUser = cache(async (): Promise<SessionUser | null> => {
  if (!isAuthEnabled()) return null;
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase.auth.getClaims();
  const claims = data?.claims;
  if (error || !claims || typeof claims.sub !== "string") return null;
  const sub = claims.sub;

  const { data: roleRow, error: roleError } = await supabase
    .from("user_roles")
    .select("role, status")
    .eq("user_id", sub)
    .maybeSingle();
  if (roleError) logServerEvent("error", "auth.role_lookup_failed", "Não foi possível ler o papel do usuário.", roleError);

  // Na falha, privilégio mínimo: papel 'user'.
  const role = !roleError && isAppRole(roleRow?.role) ? roleRow.role : "user";
  const status: AccountStatus = roleRow?.status === "suspended" ? "suspended" : "active";
  const email = typeof claims.email === "string" ? claims.email : null;

  return { id: sub, email, role, status, roleLookupFailed: Boolean(roleError) };
});

/** Rotas de conta e painel não existem enquanto a autenticação estiver desligada. */
export function requireAuthEnabled(): void {
  if (!isAuthEnabled()) notFound();
}

/** Exige sessão; sem ela, envia para o login preservando o destino. */
export async function requireUser(nextPath: string): Promise<SessionUser> {
  requireAuthEnabled();
  const user = await getSessionUser();
  if (!user) redirect(`/entrar?next=${encodeURIComponent(nextPath)}`);
  return user;
}

