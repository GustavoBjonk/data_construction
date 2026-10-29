/**
 * Audita os links externos do conteúdo de content/ (notícias, datasets e cursos).
 *
 * Uso: npm run audit:links [-- --json caminho/saida.json]
 *
 * Somente leitura: faz requisições HEAD (com fallback para GET) a cada URL e
 * classifica o resultado. Não altera nenhum arquivo de dados.
 */
import { writeFile } from "node:fs/promises";
import path from "node:path";
import { loadPublishedContent } from "../lib/content/store.ts";

export type LinkStatus = "ok" | "redirect" | "broken" | "blocked" | "error";

export interface LinkTarget {
  collection: "news" | "datasets" | "courses";
  id: string;
  url: string;
}

export interface LinkResult extends LinkTarget {
  status: LinkStatus;
  httpStatus?: number;
  finalUrl?: string;
  detail?: string;
}

const REQUEST_TIMEOUT_MS = 15_000;
const CONCURRENCY = 6;
const USER_AGENT = "DataConstructionLinkAudit/1.0 (+https://dataconstruction.vercel.app)";

/** Sites que costumam recusar robôs (401/403/429) mesmo com o link válido. */
const BLOCKED_HTTP_STATUSES = new Set([401, 403, 429]);

async function request(url: string, method: "HEAD" | "GET"): Promise<Response> {
  return fetch(url, {
    method,
    redirect: "follow",
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    headers: { "user-agent": USER_AGENT, accept: "text/html,*/*" },
  });
}

export async function checkLink(target: LinkTarget): Promise<LinkResult> {
  try {
    let response = await request(target.url, "HEAD");
    // Vários servidores não implementam HEAD corretamente.
    if (response.status === 405 || response.status === 404 || response.status >= 500) {
      response = await request(target.url, "GET");
    }
    await response.body?.cancel();

    const finalUrl = response.url !== target.url ? response.url : undefined;
    let status: LinkStatus;
    if (response.ok) status = finalUrl ? "redirect" : "ok";
    else if (BLOCKED_HTTP_STATUSES.has(response.status)) status = "blocked";
    else status = "broken";

    return { ...target, status, httpStatus: response.status, finalUrl };
  } catch (error) {
    return {
      ...target,
      status: "error",
      detail: error instanceof Error ? error.message : String(error),
    };
  }
}

export async function runPool<T, R>(items: T[], worker: (item: T) => Promise<R>): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let next = 0;
  async function lane() {
    while (next < items.length) {
      const index = next++;
      results[index] = await worker(items[index] as T);
    }
  }
  await Promise.all(Array.from({ length: CONCURRENCY }, lane));
  return results;
}

async function collectTargets(): Promise<LinkTarget[]> {
  const { news, datasets, courses } = await loadPublishedContent(path.resolve(import.meta.dirname, ".."));
  return [
    ...news.map((item) => ({ collection: "news" as const, id: item.id, url: item.sourceUrl })),
    ...datasets.map((item) => ({ collection: "datasets" as const, id: item.id, url: item.sourceUrl })),
    ...courses.map((item) => ({ collection: "courses" as const, id: item.id, url: item.url })),
  ];
}

function findDuplicates(targets: LinkTarget[]): string[] {
  const seen = new Map<string, string>();
  const duplicates: string[] = [];
  for (const target of targets) {
    const key = `${target.collection}:${target.url}`;
    const previous = seen.get(key);
    if (previous) duplicates.push(`${target.collection}: ${previous} e ${target.id} -> ${target.url}`);
    else seen.set(key, target.id);
  }
  return duplicates;
}

async function main() {
  const jsonFlagIndex = process.argv.indexOf("--json");
  const jsonPath = jsonFlagIndex >= 0 ? process.argv[jsonFlagIndex + 1] : undefined;

  const targets = await collectTargets();
  const results = await runPool(targets, checkLink);

  const counts = results.reduce<Record<LinkStatus, number>>(
    (acc, result) => ({ ...acc, [result.status]: acc[result.status] + 1 }),
    { ok: 0, redirect: 0, broken: 0, blocked: 0, error: 0 },
  );

  console.log(`Links verificados: ${results.length}`);
  console.log(counts);

  for (const result of results.filter((r) => r.status !== "ok")) {
    const extra = result.finalUrl ? ` -> ${result.finalUrl}` : result.detail ? ` (${result.detail})` : "";
    console.log(
      `[${result.status}] ${result.collection}/${result.id} ${result.httpStatus ?? ""} ${result.url}${extra}`,
    );
  }

  const duplicates = findDuplicates(targets);
  if (duplicates.length > 0) {
    console.log("\nURLs duplicadas:");
    for (const line of duplicates) console.log(`  ${line}`);
  }

  if (jsonPath) {
    await writeFile(jsonPath, JSON.stringify({ checkedAt: new Date().toISOString(), results }, null, 2));
    console.log(`\nRelatório salvo em ${jsonPath}`);
  }
}

// Executado diretamente (não quando importado por outro script).
if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve(import.meta.filename)) {
  await main();
}
