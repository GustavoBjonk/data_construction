/**
 * Regras de integridade e de priorização da revisão editorial de notícias.
 * Sem dependências de rede: usado pelos testes (bloqueio) e por
 * scripts/audit-news.mts (relatório com checagem de links).
 */
import type { NewsArticle } from "@/data/news";

export type FindingSeverity = "error" | "review";

export interface NewsFinding {
  newsId: string;
  severity: FindingSeverity;
  code: string;
  message: string;
}

/**
 * Veículos de imprensa, escritórios e agregadores: são fontes secundárias.
 * Um anúncio de empresa citado por eles precisa ser conferido na fonte primária.
 */
export const SECONDARY_SOURCE_DOMAINS = [
  "techcrunch.com",
  "axios.com",
  "cnbc.com",
  "prnewswire.com",
  "helpnetsecurity.com",
  "cybersecuritydive.com",
  "bleepingcomputer.com",
  "dlapiper.com",
  "agenciabrasil.ebc.com.br",
  "regulacaoemnumeros-direitorio.fgv.br",
];

const SLUG_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
/** Marcação que não deveria existir em texto puro (o site renderiza tudo como texto). */
const MARKUP_PATTERN = /<\s*\/?\s*[a-z!]|javascript:|data:text\/html|on\w+\s*=/i;
/** Afirmações numéricas (valores, percentuais, escalas) exigem conferência na fonte. */
const NUMERIC_CLAIM_PATTERN = /(US\$|R\$|€|\d+(?:[.,]\d+)?\s?%|\d+(?:[.,]\d+)?\s?(mil|milh(ão|ões)|bilh(ão|ões)|trilh(ão|ões)))/i;

function hostname(url: string): string | null {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return null;
  }
}

export function isSecondarySource(url: string): boolean {
  const host = hostname(url);
  return host !== null && SECONDARY_SOURCE_DOMAINS.some((domain) => host === domain || host.endsWith(`.${domain}`));
}

export function auditNews(items: readonly NewsArticle[], today: string): NewsFinding[] {
  const findings: NewsFinding[] = [];
  const add = (newsId: string, severity: FindingSeverity, code: string, message: string) =>
    findings.push({ newsId, severity, code, message });

  const seen = { id: new Map<string, string>(), slug: new Map<string, string>(), url: new Map<string, string>() };

  for (const item of items) {
    // --- Integridade (erros bloqueiam) ---
    for (const [key, value] of [
      ["id", item.id],
      ["slug", item.slug],
      ["url", item.sourceUrl.toLowerCase()],
    ] as const) {
      const previous = seen[key].get(value);
      if (previous) add(item.id, "error", `duplicate_${key}`, `${key} duplicado com "${previous}"`);
      else seen[key].set(value, item.id);
    }

    if (!SLUG_PATTERN.test(item.slug)) add(item.id, "error", "invalid_slug", `slug fora do padrão: ${item.slug}`);

    const host = hostname(item.sourceUrl);
    if (!host || !/^https?:$/.test(new URL(item.sourceUrl).protocol)) {
      add(item.id, "error", "invalid_source_url", "URL da fonte inválida ou com protocolo não permitido");
    } else if (item.sourceUrl.startsWith("http://")) {
      add(item.id, "review", "insecure_source_url", "fonte sem HTTPS");
    }

    for (const field of ["publishedAt", "collectedAt", "lastCheckedAt", "verifiedAt"] as const) {
      const value = item[field];
      if (value === undefined) continue;
      if (!DATE_PATTERN.test(value) || Number.isNaN(Date.parse(value))) {
        add(item.id, "error", "invalid_date", `${field} inválida: ${value}`);
      } else if (value > today) {
        add(item.id, "error", "future_date", `${field} no futuro: ${value}`);
      }
    }
    if (item.lastCheckedAt && item.lastCheckedAt < item.publishedAt) {
      add(item.id, "error", "checked_before_published", "fonte conferida antes de publicada");
    }
    if (item.verifiedAt && item.verifiedAt < item.publishedAt) {
      add(item.id, "error", "verified_before_published", "verificada antes de publicada");
    }
    if ((item.verification === "verified") !== (item.verifiedAt !== undefined)) {
      add(item.id, "error", "verification_mismatch", 'verifiedAt exige verification "verified" (e vice-versa)');
    }
    if (String(item.year) !== item.publishedAt.slice(0, 4)) add(item.id, "error", "year_mismatch", "ano não confere com a data");
    if (item.category.length === 0) add(item.id, "error", "no_category", "sem categoria");

    for (const field of ["title", "summary", "relevance", "source"] as const) {
      if (MARKUP_PATTERN.test(item[field])) add(item.id, "error", "markup_in_text", `marcação/script no campo ${field}`);
    }
    if (item.imageUrl && !item.imageUrl.startsWith("https://")) {
      add(item.id, "error", "invalid_image_url", "imagem sem HTTPS");
    }

    // --- Priorização da revisão (não bloqueia) ---
    if (isSecondarySource(item.sourceUrl)) {
      add(item.id, "review", "secondary_source", `fonte secundária (${host}); confirmar na fonte primária`);
    }
    if (NUMERIC_CLAIM_PATTERN.test(`${item.title} ${item.summary}`)) {
      add(item.id, "review", "numeric_claim", "contém valores ou percentuais; conferir números na fonte");
    }
  }

  return findings;
}
