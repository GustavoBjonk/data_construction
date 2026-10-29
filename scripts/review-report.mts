/**
 * Gera um relatório HTML local para revisar notícias e artigos pendentes.
 *
 * Uso: npm run review:report   →   revisao/relatorio.html (fora do Git)
 *
 * Somente leitura: o relatório mostra o conteúdo e os comandos de cada ação;
 * nada é aprovado por ele. As decisões continuam em npm run news:review e
 * npm run articles:review.
 */
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { articleReviewQueue } from "../lib/content/article-workflow.ts";
import { newsReviewQueue, unverifiedPublishedNews } from "../lib/content/news-workflow.ts";
import { readCollection } from "../lib/content/store.ts";

interface CheckNote {
  result: "ok" | "corrigida" | "manual";
  note: string;
}

const root = path.resolve(import.meta.dirname, "..");
const output = path.join(root, "revisao", "relatorio.html");
const notesFile = path.join(root, "docs", "revisao", "conferencia-2026-10-29.json");

const notes = JSON.parse(await readFile(notesFile, "utf8")) as { checkedAt: string; news: Record<string, CheckNote> };
const news = await readCollection("news", root);
const articles = await readCollection("articles", root);
const newsQueue = newsReviewQueue(news);
const articleQueue = articleReviewQueue(articles);
const legacyCount = unverifiedPublishedNews(news).length;

const RESULT_LABEL: Record<CheckNote["result"], string> = {
  ok: "Conferida na fonte",
  corrigida: "Corrigida após conferência",
  manual: "Conferir manualmente",
};

function esc(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function safeUrl(value: string): string {
  return /^https?:\/\//.test(value) ? esc(value) : "#";
}

function commands(tool: string, id: string, approve: string): string {
  return `<pre class="cmd">npm run ${tool} -- ${approve} ${esc(id)}
npm run ${tool} -- return ${esc(id)}
npm run ${tool} -- reject ${esc(id)}</pre>`;
}

const newsCards = newsQueue
  .map(({ data }) => {
    const check = notes.news[data.id];
    return `<article class="card" id="n-${esc(data.id)}">
  <p class="meta">${esc(data.publishedAt)} · ${esc(data.source)} · <span class="status">em revisão</span></p>
  <h3>${esc(data.title)}</h3>
  ${check ? `<p class="check ${check.result}"><strong>${RESULT_LABEL[check.result]}:</strong> ${esc(check.note)}</p>` : `<p class="check manual"><strong>Sem conferência registrada.</strong></p>`}
  <p>${esc(data.summary)}</p>
  <p class="muted"><strong>Por que importa:</strong> ${esc(data.relevance)}</p>
  <p><a href="${safeUrl(data.sourceUrl)}" target="_blank" rel="noopener noreferrer">Abrir a fonte original ↗</a></p>
  <details><summary>Ações (copie no terminal)</summary>${commands("news:review", data.id, "approve")}</details>
</article>`;
  })
  .join("\n");

function renderBlocks(blocks: string[]): string {
  return blocks
    .map((block) => {
      if (block.startsWith("## ")) return `<h4>${esc(block.slice(3))}</h4>`;
      if (block.startsWith("```")) return `<pre>${esc(block.replace(/^```[^\n]*\n?/, "").replace(/\n?```$/, ""))}</pre>`;
      return `<p>${esc(block)}</p>`;
    })
    .join("\n");
}

const articleCards = articleQueue
  .map(({ data }) => {
    const words = data.content.join(" ").split(/\s+/).length;
    const refs = data.references
      .map((ref) => `<li>${esc(ref.citation)}${ref.url ? ` <a href="${safeUrl(ref.url)}" target="_blank" rel="noopener noreferrer">↗</a>` : ""}</li>`)
      .join("");
    return `<article class="card" id="a-${esc(data.id)}">
  <p class="meta">${esc(data.category)} · ${data.readingTime} min · ${words} palavras · <span class="status">em revisão</span></p>
  <h3>${esc(data.title)}</h3>
  <p>${esc(data.description)}</p>
  <p class="muted">Autor: ${esc(data.author)} — ${esc(data.authorBio)}</p>
  <p class="muted">Tags: ${esc((data.tags ?? []).join(", ") || "—")}</p>
  <p class="check manual"><strong>Antes de aprovar:</strong> leia o texto, rode os exemplos de código, abra as referências e ajuste author/authorBio se for assinar.</p>
  <details><summary>Ler o texto completo</summary><div class="body">${renderBlocks(data.content)}</div></details>
  <details><summary>Referências (${data.references.length})</summary><ol>${refs}</ol></details>
  <details><summary>Ações (copie no terminal)</summary>${commands("articles:review", data.id, "approve")}</details>
</article>`;
  })
  .join("\n");

const generatedAt = new Date().toISOString().slice(0, 16).replace("T", " ");
const counts = Object.values(notes.news).reduce<Record<string, number>>((acc, { result }) => ({ ...acc, [result]: (acc[result] ?? 0) + 1 }), {});

const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex">
<title>Revisão editorial — DataConstruction</title>
<style>
  :root { color-scheme: light dark; --bg:#0b0f11; --card:#12181b; --fg:#e7ecec; --muted:#9aa7a6; --line:#26302f; --accent:#4fd1c5; --ok:#3fb37f; --warn:#e0a03a; --fix:#6aa9ff; }
  @media (prefers-color-scheme: light) { :root { --bg:#f6f7f7; --card:#fff; --fg:#14191b; --muted:#56605f; --line:#d9dfde; --accent:#0f766e; } }
  * { box-sizing: border-box; }
  body { margin:0; background:var(--bg); color:var(--fg); font:16px/1.6 system-ui, sans-serif; }
  main { max-width: 860px; margin: 0 auto; padding: 24px 16px 64px; }
  h1 { font-size: 1.6rem; margin: 0 0 4px; } h2 { margin-top: 40px; border-bottom:1px solid var(--line); padding-bottom:6px; }
  h3 { margin: 4px 0 8px; font-size: 1.15rem; line-height:1.35; } h4 { margin: 20px 0 6px; }
  .card { background:var(--card); border:1px solid var(--line); border-radius:10px; padding:16px 18px; margin:16px 0; }
  .meta, .muted { color:var(--muted); font-size:.875rem; } .status { color:var(--warn); }
  .check { border-left:3px solid var(--line); padding:6px 10px; font-size:.9rem; }
  .check.ok { border-color:var(--ok); } .check.corrigida { border-color:var(--fix); } .check.manual { border-color:var(--warn); }
  a { color:var(--accent); } pre { background:rgba(127,127,127,.12); padding:10px; border-radius:6px; overflow-x:auto; font-size:.85rem; }
  details { margin-top:10px; } summary { cursor:pointer; min-height:40px; display:flex; align-items:center; }
  nav ul { padding-left: 18px; } .body p { margin: 8px 0; }
</style>
</head>
<body>
<main>
  <h1>Revisão editorial</h1>
  <p class="muted">Gerado em ${generatedAt} por <code>npm run review:report</code>. Este arquivo só mostra o conteúdo: nada é aprovado por ele.</p>
  <ul>
    <li>${newsQueue.length} notícias em revisão (conferência técnica em ${esc(notes.checkedAt)}: ${counts.ok ?? 0} conferidas, ${counts.corrigida ?? 0} corrigidas, ${counts.manual ?? 0} para conferência manual)</li>
    <li>${articleQueue.length} artigos em revisão</li>
    <li>${legacyCount} notícias antigas publicadas sem revisão registrada (<code>npm run news:review -- legacy</code>)</li>
  </ul>
  <p class="muted">"approve" publica no próximo deploy; "return" devolve para correção (rascunho); "reject" arquiva. Depois de decidir, rode <code>npm test</code>.</p>
  <h2>Notícias (${newsQueue.length})</h2>
  ${newsCards || "<p>Nenhuma notícia em revisão.</p>"}
  <h2>Artigos (${articleQueue.length})</h2>
  ${articleCards || "<p>Nenhum artigo em revisão.</p>"}
</main>
</body>
</html>
`;

await mkdir(path.dirname(output), { recursive: true });
await writeFile(output, html, "utf8");
console.log(`Relatório: ${path.relative(root, output)} (${newsQueue.length} notícias, ${articleQueue.length} artigos)`);
