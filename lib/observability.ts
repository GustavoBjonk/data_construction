import "server-only";

/**
 * Eventos operacionais do servidor (falha de banco, fallback de conteúdo...).
 *
 * Cada evento vai para o log da plataforma como JSON de uma linha — na Vercel,
 * filtre por `"source":"dataconstruction"` — e fica numa memória curta da
 * instância, exibida no painel. Em ambiente serverless cada instância tem a
 * própria memória: o painel mostra o recorte da instância que respondeu, e o
 * histórico completo fica no log da Vercel.
 */
export type ServerEventLevel = "error" | "warn" | "info";

export interface ServerEvent {
  at: string;
  level: ServerEventLevel;
  code: string;
  message: string;
  detail?: string;
}

const MAX_EVENTS = 50;
const recentEvents: ServerEvent[] = [];

function describeError(error: unknown): string | undefined {
  if (error === undefined) return undefined;
  if (error instanceof Error) return error.message.slice(0, 500);
  if (typeof error === "object" && error && "message" in error) return String((error as { message: unknown }).message).slice(0, 500);
  return String(error).slice(0, 500);
}

export function logServerEvent(level: ServerEventLevel, code: string, message: string, error?: unknown): void {
  const event: ServerEvent = { at: new Date().toISOString(), level, code, message, detail: describeError(error) };
  recentEvents.unshift(event);
  recentEvents.length = Math.min(recentEvents.length, MAX_EVENTS);

  const line = JSON.stringify({ source: "dataconstruction", ...event });
  if (level === "error") console.error(line);
  else if (level === "warn") console.warn(line);
  else console.info(line);
}

export function getRecentServerEvents(): readonly ServerEvent[] {
  return recentEvents;
}
