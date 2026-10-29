/**
 * Revisão editorial dos artigos pela linha de comando (enquanto não há painel).
 *
 * Uso:
 *   npm run articles:review                          fila de revisão
 *   npm run articles:review -- approve <id> [data]   publica (data padrão: hoje)
 *   npm run articles:review -- return <id>           devolve para correção (rascunho)
 *   npm run articles:review -- reject <id>           rejeita (arquiva)
 *
 * Antes de aprovar, ajuste author/authorBio no JSON se for assinar o texto.
 * Grava somente content/articles/<id>.json, validado pelo schema.
 */
import path from "node:path";
import { approveArticle, articleReviewQueue, moveArticle, type ArticleEnvelope } from "../lib/content/article-workflow.ts";
import { readCollection, writeContentItem } from "../lib/content/store.ts";

const root = path.resolve(import.meta.dirname, "..");
const [command = "list", id, date] = process.argv.slice(2);
const items = await readCollection("articles", root);

if (command === "list") {
  const queue = articleReviewQueue(items);
  console.log(`${queue.length} artigo(s) em revisão:`);
  for (const { data } of queue) {
    console.log(`\n${data.id}\n  ${data.title}\n  ${data.category} · ${data.readingTime} min · ${data.references.length} referências · autor: ${data.author}`);
  }
  if (queue.length > 0) console.log("\nAções: approve <id> [AAAA-MM-DD] | return <id> | reject <id>. Relatório completo: npm run review:report");
  process.exit(0);
}

const item = items.find((entry) => entry.data.id === id);
if (!item) {
  console.error(`Artigo não encontrado: ${id ?? "(id ausente)"}`);
  process.exit(1);
}
const { path: _path, ...envelope } = item;
const actions: Record<string, (current: ArticleEnvelope) => ArticleEnvelope> = {
  approve: (current) => approveArticle(current, date ?? new Date().toISOString().slice(0, 10)),
  return: (current) => moveArticle(current, "draft"),
  reject: (current) => moveArticle(current, "archived"),
};
const action = actions[command];
if (!action) {
  console.error(`Comando desconhecido: ${command}`);
  process.exit(1);
}

try {
  const next = action(envelope);
  console.log(`${await writeContentItem("articles", next, root)}: ${item.status} → ${next.status}`);
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
}
