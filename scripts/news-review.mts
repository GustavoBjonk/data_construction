/**
 * Revisão editorial das notícias pela linha de comando (enquanto não há painel).
 * Usa as mesmas funções de lib/content/news-workflow.ts que um painel futuro usará.
 *
 * Uso:
 *   npm run news:review                           fila de revisão (título, fonte, data, resumo, link)
 *   npm run news:review -- show <id>              mostra uma notícia completa
 *   npm run news:review -- approve <id> [data]    aprova e publica (data padrão: hoje)
 *   npm run news:review -- return <id>            devolve para correção (volta ao rascunho)
 *   npm run news:review -- reject <id>            rejeita (arquiva; não aparece no site)
 *   npm run news:review -- legacy                 publicadas sem revisão editorial registrada
 *   npm run news:review -- verify <id> [data]     registra a revisão de uma notícia já publicada
 *
 * "draft" e "archive" continuam aceitos como sinônimos de "return" e "reject".
 * Grava somente content/news/<id>.json, validado pelo schema. Nenhum comando
 * aprova em lote: cada aprovação é uma decisão humana sobre uma notícia.
 */
import path from "node:path";
import {
  approveNews,
  moveNews,
  newsReviewQueue,
  unverifiedPublishedNews,
  verifyPublishedNews,
  type NewsEnvelope,
} from "../lib/content/news-workflow.ts";
import { readCollection, writeContentItem, type StoredItem } from "../lib/content/store.ts";

const STATUS_LABEL = { draft: "rascunho", review: "em revisão", published: "publicada", archived: "arquivada" } as const;
const SUMMARY_PREVIEW = 220;

const root = path.resolve(import.meta.dirname, "..");
const [command = "list", id, date] = process.argv.slice(2);
const items = await readCollection("news", root);
const today = () => new Date().toISOString().slice(0, 10);

function preview(text: string): string {
  return text.length > SUMMARY_PREVIEW ? `${text.slice(0, SUMMARY_PREVIEW).trimEnd()}…` : text;
}

function printItem({ status, data }: StoredItem<"news">, full: boolean): void {
  console.log(`\n${data.id}  [${STATUS_LABEL[status]}]`);
  console.log(`  Título : ${data.title}`);
  console.log(`  Fonte  : ${data.source}`);
  console.log(`  Data   : ${data.publishedAt}` + (data.collectedAt ? `  (coletada em ${data.collectedAt})` : ""));
  if (data.lastCheckedAt) console.log(`  Checada: ${data.lastCheckedAt} (conferência técnica, não é aprovação)`);
  console.log(`  Revisão: ${data.verification === "verified" ? `aprovada em ${data.verifiedAt}` : "pendente"}`);
  console.log(`  Link   : ${data.sourceUrl}`);
  console.log(`  Resumo : ${full ? data.summary : preview(data.summary)}`);
  if (full) console.log(`  Por que importa: ${data.relevance}`);
}

function list(title: string, queue: StoredItem<"news">[], hint: string): void {
  console.log(`${queue.length} ${title}`);
  for (const item of queue) printItem(item, false);
  if (queue.length > 0) console.log(`\n${hint}`);
}

if (command === "list") {
  list(
    "notícia(s) em revisão:",
    newsReviewQueue(items),
    "Ações: approve <id> [AAAA-MM-DD] | return <id> (correção) | reject <id> | show <id>",
  );
  process.exit(0);
}
if (command === "legacy") {
  list(
    "notícia(s) publicada(s) sem revisão editorial registrada:",
    unverifiedPublishedNews(items),
    "Depois de conferir a fonte: verify <id> [AAAA-MM-DD]. Se houver erro, corrija o JSON antes.",
  );
  process.exit(0);
}

const item = items.find((entry) => entry.data.id === id);
if (!item) {
  console.error(`Notícia não encontrada: ${id ?? "(id ausente)"}`);
  process.exit(1);
}
if (command === "show") {
  printItem(item, true);
  process.exit(0);
}

const { path: _path, ...envelope } = item;
const actions: Record<string, (current: NewsEnvelope) => NewsEnvelope> = {
  approve: (current) => approveNews(current, date ?? today()),
  verify: (current) => verifyPublishedNews(current, date ?? today()),
  return: (current) => moveNews(current, "draft"),
  draft: (current) => moveNews(current, "draft"),
  reject: (current) => moveNews(current, "archived"),
  archive: (current) => moveNews(current, "archived"),
};
const action = actions[command];
if (!action) {
  console.error(`Comando desconhecido: ${command}`);
  process.exit(1);
}

try {
  const next = action(envelope);
  console.log(`${await writeContentItem("news", next, root)}: ${item.status} → ${next.status}`);
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
}
