/**
 * Fluxo editorial das notícias: rascunho → revisão → publicada → arquivada.
 *
 * Funções puras sobre o envelope (sem acesso a disco): o chamador lê com
 * readCollection, aplica a transição e grava com writeContentItem. Assim um
 * script de linha de comando e um futuro painel usam exatamente as mesmas regras.
 *
 * Imports relativos com extensão .ts: também roda nos scripts de Node.
 */
import type { NewsArticle } from "../../data/news.ts";
import type { ContentEnvelope, ContentStatus } from "./schemas.ts";
import type { StoredItem } from "./store.ts";

export type NewsEnvelope = ContentEnvelope<NewsArticle>;

/** Transições permitidas. Publicar só acontece por approveNews (exige revisão). */
export const NEWS_TRANSITIONS: Record<ContentStatus, readonly ContentStatus[]> = {
  draft: ["review", "archived"],
  review: ["published", "draft", "archived"],
  published: ["archived"],
  archived: ["draft"],
};

export class NewsWorkflowError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "NewsWorkflowError";
  }
}

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

export function canTransition(from: ContentStatus, to: ContentStatus): boolean {
  return NEWS_TRANSITIONS[from].includes(to);
}

/** Aprova uma notícia em revisão: registra a verificação editorial e publica. */
export function approveNews(envelope: NewsEnvelope, verifiedAt: string): NewsEnvelope {
  if (envelope.status !== "review") {
    throw new NewsWorkflowError(`Só notícias em revisão podem ser aprovadas ("${envelope.data.id}" está em ${envelope.status}).`);
  }
  if (!ISO_DATE.test(verifiedAt) || Number.isNaN(Date.parse(verifiedAt))) {
    throw new NewsWorkflowError(`Data de verificação inválida: ${verifiedAt}`);
  }
  if (verifiedAt < envelope.data.publishedAt) {
    throw new NewsWorkflowError("A verificação não pode ser anterior à data de publicação na fonte.");
  }
  return {
    ...envelope,
    status: "published",
    data: { ...envelope.data, verification: "verified", verifiedAt },
  };
}

/**
 * Registra a revisão editorial de uma notícia do acervo legado, que já está
 * publicada mas aparece como "Revisão editorial: Pendente". Só uma pessoa
 * editora deve chamar isto, depois de conferir a fonte.
 */
export function verifyPublishedNews(envelope: NewsEnvelope, verifiedAt: string): NewsEnvelope {
  if (envelope.status !== "published") {
    throw new NewsWorkflowError(`Só notícias publicadas podem ser conferidas assim ("${envelope.data.id}" está em ${envelope.status}).`);
  }
  if (envelope.data.verification === "verified") {
    throw new NewsWorkflowError(`"${envelope.data.id}" já foi verificada em ${envelope.data.verifiedAt}.`);
  }
  return { ...approveNews({ ...envelope, status: "review" }, verifiedAt), status: "published" };
}

/** Publicadas sem revisão editorial registrada (acervo legado), das mais recentes às mais antigas. */
export function unverifiedPublishedNews(items: readonly StoredItem<"news">[]): StoredItem<"news">[] {
  return items
    .filter((item) => item.status === "published" && item.data.verification !== "verified")
    .sort((a, b) => b.data.publishedAt.localeCompare(a.data.publishedAt) || a.data.id.localeCompare(b.data.id));
}

/**
 * Move a notícia sem aprovar: enviar para revisão, devolver ao rascunho ou
 * arquivar. Voltar ao rascunho descarta a verificação anterior, porque o
 * texto pode mudar e precisará de nova aprovação.
 */
export function moveNews(envelope: NewsEnvelope, to: Exclude<ContentStatus, "published">): NewsEnvelope {
  if (!canTransition(envelope.status, to)) {
    throw new NewsWorkflowError(`Transição não permitida: ${envelope.status} → ${to}.`);
  }
  if (to !== "draft") return { ...envelope, status: to };
  const { verification: _verification, verifiedAt: _verifiedAt, ...data } = envelope.data;
  return { ...envelope, status: to, data };
}

/** Fila de revisão, das notícias mais recentes às mais antigas. */
export function newsReviewQueue(items: readonly StoredItem<"news">[]): StoredItem<"news">[] {
  return items
    .filter((item) => item.status === "review")
    .sort((a, b) => b.data.publishedAt.localeCompare(a.data.publishedAt) || a.data.id.localeCompare(b.data.id));
}

/**
 * Regras do fluxo que olham para todos os status (o schema vê um item por vez):
 * - slug único em todo o acervo, para que aprovar nunca gere conflito de URL;
 * - rascunho e revisão não carregam aprovação editorial;
 * - notícia coletada pelo fluxo atual (com collectedAt) só é pública depois de
 *   aprovada. O acervo legado, sem collectedAt, segue publicado como estava.
 */
export function findNewsWorkflowIssues(items: readonly StoredItem<"news">[]): string[] {
  const issues: string[] = [];
  const slugs = new Map<string, string>();

  for (const { status, data, path } of items) {
    const previous = slugs.get(data.slug);
    if (previous) issues.push(`${path}: slug "${data.slug}" já usado por ${previous}`);
    else slugs.set(data.slug, path);

    if ((status === "draft" || status === "review") && data.verification === "verified") {
      issues.push(`${path}: notícia em ${status} não pode estar marcada como verificada`);
    }
    if (status === "published" && data.collectedAt && data.verification !== "verified") {
      issues.push(`${path}: notícia nova publicada sem aprovação editorial (use status "review")`);
    }
  }

  return issues;
}
