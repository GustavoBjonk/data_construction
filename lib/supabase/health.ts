import "server-only";
import { logServerEvent } from "@/lib/observability";
import { isSupabaseConfigured } from "./env";
import { createSupabasePublicClient } from "./server";

const HEALTH_TIMEOUT_MS = 5000;

export type DatabaseHealth =
  | { status: "not_configured" }
  | { status: "ok"; latencyMs: number; checkedAt: string }
  | { status: "error"; latencyMs: number; checkedAt: string; message: string };

/** Códigos que indicam tabela inexistente (PostgREST e Postgres). */
const MISSING_TABLE_CODES = new Set(["PGRST205", "42P01"]);

/**
 * Consulta leve e real ao banco, com o mesmo acesso de um visitante.
 * Distingue "não configurado", "migrações ausentes" e falha de conexão.
 */
export async function checkDatabaseHealth(): Promise<DatabaseHealth> {
  if (!isSupabaseConfigured()) return { status: "not_configured" };

  const started = performance.now();
  const checkedAt = new Date().toISOString();
  try {
    const { error } = await createSupabasePublicClient()
      .from("news")
      .select("id", { count: "exact", head: true })
      .abortSignal(AbortSignal.timeout(HEALTH_TIMEOUT_MS));
    const latencyMs = Math.round(performance.now() - started);

    if (error) {
      const message = MISSING_TABLE_CODES.has(error.code)
        ? "Tabelas não encontradas: as migrações ainda não foram aplicadas neste projeto."
        : `Erro do banco (${error.code || "sem código"}): ${error.message}`;
      logServerEvent("error", "db.health_failed", message, error);
      return { status: "error", latencyMs, checkedAt, message };
    }
    return { status: "ok", latencyMs, checkedAt };
  } catch (error) {
    const latencyMs = Math.round(performance.now() - started);
    const message =
      error instanceof Error && error.name === "TimeoutError"
        ? `Sem resposta do banco em ${HEALTH_TIMEOUT_MS / 1000}s.`
        : "Falha de conexão com o banco.";
    logServerEvent("error", "db.health_failed", message, error);
    return { status: "error", latencyMs, checkedAt, message };
  }
}
