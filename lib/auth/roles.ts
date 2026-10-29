/**
 * Papéis das contas do site (Supabase, desligado). Só para exibição: a
 * autorização real é feita pelo Postgres (RLS); nunca confie só nestes valores.
 */

export const APP_ROLES = ["user", "moderator", "editor", "admin", "superadmin"] as const;
export type AppRole = (typeof APP_ROLES)[number];

export const ACCOUNT_STATUSES = ["active", "suspended"] as const;
export type AccountStatus = (typeof ACCOUNT_STATUSES)[number];

export const ROLE_LABELS: Record<AppRole, string> = {
  user: "Usuário",
  moderator: "Moderador",
  editor: "Editor",
  admin: "Administrador",
  superadmin: "Superadministrador",
};

export function isAppRole(value: unknown): value is AppRole {
  return typeof value === "string" && (APP_ROLES as readonly string[]).includes(value);
}
