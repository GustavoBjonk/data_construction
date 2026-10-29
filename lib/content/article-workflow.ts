/**
 * Fluxo editorial dos artigos: rascunho → revisão → publicado → arquivado.
 *
 * Funções puras sobre o envelope, como em news-workflow.ts: o script de linha
 * de comando e um futuro painel usam as mesmas regras. Publicar só acontece
 * por approveArticle, a partir da revisão.
 *
 * Imports relativos com extensão .ts: também roda nos scripts de Node.
 */
import type { Article } from "../../data/articles.ts";
import type { ContentEnvelope, ContentStatus } from "./schemas.ts";
import { NEWS_TRANSITIONS, canTransition } from "./news-workflow.ts";
import type { StoredItem } from "./store.ts";

export type ArticleEnvelope = ContentEnvelope<Article>;

/** Mesmas transições das notícias. */
export const ARTICLE_TRANSITIONS = NEWS_TRANSITIONS;

export class ArticleWorkflowError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ArticleWorkflowError";
  }
}

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

/** Publica um artigo em revisão, com a data de publicação informada. */
export function approveArticle(envelope: ArticleEnvelope, publishedOn: string): ArticleEnvelope {
  if (envelope.status !== "review") {
    throw new ArticleWorkflowError(`Só artigos em revisão podem ser publicados ("${envelope.data.id}" está em ${envelope.status}).`);
  }
  if (!ISO_DATE.test(publishedOn) || Number.isNaN(Date.parse(publishedOn))) {
    throw new ArticleWorkflowError(`Data de publicação inválida: ${publishedOn}`);
  }
  return { ...envelope, status: "published", data: { ...envelope.data, date: publishedOn } };
}

/** Devolve ao rascunho (correção) ou arquiva (rejeição), sem publicar. */
export function moveArticle(envelope: ArticleEnvelope, to: Exclude<ContentStatus, "published">): ArticleEnvelope {
  if (!canTransition(envelope.status, to)) {
    throw new ArticleWorkflowError(`Transição não permitida: ${envelope.status} → ${to}.`);
  }
  return { ...envelope, status: to };
}

/** Artigos aguardando revisão, por ordem editorial. */
export function articleReviewQueue(items: readonly StoredItem<"articles">[]): StoredItem<"articles">[] {
  return items.filter((item) => item.status === "review").sort((a, b) => a.sortOrder - b.sortOrder);
}
