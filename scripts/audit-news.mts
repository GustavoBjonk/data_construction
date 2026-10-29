/**
 * Relatório de revisão editorial das notícias: integridade + links + prioridade.
 *
 * Uso: npm run audit:news
 * Gera docs/auditoria-noticias.md. Somente leitura (requisições HEAD/GET às fontes).
 */
import { writeFile } from "node:fs/promises";
import path from "node:path";
import { loadPublishedContent } from "../lib/content/store.ts";
import { auditNews, type NewsFinding } from "../lib/content/news-audit.ts";
import { checkLink, runPool, type LinkResult } from "./audit-links.mts";

const { news } = await loadPublishedContent(path.resolve(import.meta.dirname, ".."));

const OUTPUT = path.resolve(import.meta.dirname, "../docs/auditoria-noticias.md");
const today = new Date().toISOString().slice(0, 10);

const findings = auditNews(news, today);
const links = await runPool(
  news.map((item) => ({ collection: "news" as const, id: item.id, url: item.sourceUrl })),
  checkLink,
);
const linkById = new Map<string, LinkResult>(links.map((result) => [result.id, result]));

const LINK_FINDINGS: Partial<Record<LinkResult["status"], { severity: NewsFinding["severity"]; message: string }>> = {
  broken: { severity: "review", message: "link da fonte quebrado" },
  error: { severity: "review", message: "falha de conexão com a fonte" },
  blocked: { severity: "review", message: "fonte bloqueia robôs (conferir manualmente)" },
};

for (const result of links) {
  const rule = LINK_FINDINGS[result.status];
  if (rule) {
    findings.push({
      newsId: result.id,
      severity: rule.severity,
      code: `link_${result.status}`,
      message: `${rule.message}${result.httpStatus ? ` (HTTP ${result.httpStatus})` : ""}`,
    });
  }
  if (result.status === "redirect" && result.finalUrl && new URL(result.finalUrl).hostname !== new URL(result.url).hostname) {
    findings.push({
      newsId: result.id,
      severity: "review",
      code: "link_cross_domain_redirect",
      message: `redireciona para outro domínio: ${new URL(result.finalUrl).hostname}`,
    });
  }
}

/** Peso de prioridade: link quebrado e redirecionamento externo primeiro; depois fonte secundária e números. */
const WEIGHT: Record<string, number> = {
  link_broken: 5,
  link_cross_domain_redirect: 5,
  link_error: 4,
  secondary_source: 3,
  numeric_claim: 2,
  link_blocked: 1,
};

const byNews = new Map<string, NewsFinding[]>();
for (const finding of findings) byNews.set(finding.newsId, [...(byNews.get(finding.newsId) ?? []), finding]);

const rows = news
  .map((item) => {
    const itemFindings = byNews.get(item.id) ?? [];
    const score = itemFindings.reduce((sum, f) => sum + (WEIGHT[f.code] ?? 0), 0) + (item.year >= 2026 ? 1 : 0);
    return { item, itemFindings, score };
  })
  .sort((a, b) => b.score - a.score || b.item.publishedAt.localeCompare(a.item.publishedAt));

const errors = findings.filter((f) => f.severity === "error");
const count = (code: string) => findings.filter((f) => f.code === code).length;
const linkCounts = links.reduce<Record<string, number>>((acc, r) => ({ ...acc, [r.status]: (acc[r.status] ?? 0) + 1 }), {});

const md: string[] = [
  "# Auditoria editorial das notícias",
  "",
  `Gerado por \`npm run audit:news\` em ${today}. Não edite à mão.`,
  "",
  "## Resumo",
  "",
  `- Notícias no acervo: ${news.length}`,
  `- Erros de integridade (bloqueiam publicação): ${errors.length}`,
  `- Links: ${Object.entries(linkCounts).map(([k, v]) => `${k} ${v}`).join(", ")}`,
  `- Fontes secundárias (confirmar na fonte primária): ${count("secondary_source")}`,
  `- Com valores/percentuais a conferir: ${count("numeric_claim")}`,
  "",
  "Todas as notícias entram no banco como `unverified` e aparecem no site como **revisão editorial pendente**.",
  "Nenhuma é removida ou despublicada automaticamente: URLs e conteúdo são preservados.",
  "",
  "## Como revisar cada notícia",
  "",
  "1. Abrir a fonte. Se o link estiver quebrado, procurar a publicação original (arquivo do site, Wayback Machine) e corrigir a URL.",
  "2. Conferir título, data e cada número citado no resumo contra a fonte.",
  "3. Fonte secundária: localizar o anúncio oficial (blog/press release da empresa ou órgão) e preferi-lo como fonte.",
  "4. Resultado: `verified` (conferida), ou `flagged` com nota explicando o problema — notícias `flagged` saem do ar automaticamente.",
  "",
  "## Fila de revisão (maior prioridade primeiro)",
  "",
  "| # | Notícia | Data | Fonte | Achados |",
  "|---|---|---|---|---|",
  ...rows.map(
    ({ item, itemFindings }, index) =>
      `| ${index + 1} | [${item.title.replace(/\|/g, "\\|")}](/noticias/${item.slug}) | ${item.publishedAt} | ${new URL(item.sourceUrl).hostname.replace(/^www\./, "")} | ${
        itemFindings.length ? itemFindings.map((f) => f.message).join("; ").replace(/\|/g, "\\|") : "—"
      } |`,
  ),
  "",
];

await writeFile(OUTPUT, md.join("\n"), "utf8");
console.log(`Relatório: ${path.relative(process.cwd(), OUTPUT)} — ${errors.length} erro(s), ${findings.length} achado(s).`);
if (linkById.size !== news.length) console.warn("Aviso: nem todos os links foram verificados.");
if (errors.length > 0) process.exitCode = 1;
