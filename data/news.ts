/** Tipos e constantes. Os itens ficam em content/news/*.json (lido por lib/content/store.ts). */
export const NEWS_CATEGORIES = [
  "Inteligência Artificial",
  "Data Science",
  "Data Analytics",
  "Data Engineering",
  "Business Intelligence",
  "Bancos de Dados",
  "Cloud",
  "Big Data",
  "Machine Learning",
  "Data Governance",
  "Data Privacy",
  "Open Source",
  "Data Platforms",
  "Infraestrutura",
  "Mercado",
  "Regulamentação",
] as const;

export type NewsCategory = (typeof NEWS_CATEGORIES)[number];

export interface RelatedContent {
  datasetIds?: string[];
  projectIds?: string[];
  trackSlugs?: string[];
  articleIds?: string[];
}

export const NEWS_VERIFICATIONS = ["unverified", "verified", "flagged"] as const;
export type NewsVerification = (typeof NEWS_VERIFICATIONS)[number];

/** Revisão editorial concluída (e, por regra do schema, com `verifiedAt` preenchido). */
export function isEditoriallyVerified<T extends Pick<NewsArticle, "verification" | "verifiedAt">>(
  item: T,
): item is T & { verifiedAt: string } {
  return item.verification === "verified" && item.verifiedAt !== undefined;
}

/** Campos usados em listas e cartões (payload menor para componentes cliente). */
export type NewsSummary = Pick<
  NewsArticle,
  "id" | "slug" | "title" | "summary" | "publishedAt" | "year" | "category" | "tags" | "source"
> & { relevance?: string };

export function toNewsSummary(item: NewsArticle): NewsSummary {
  return {
    id: item.id,
    slug: item.slug,
    title: item.title,
    summary: item.summary,
    publishedAt: item.publishedAt,
    year: item.year,
    category: item.category,
    tags: item.tags,
    source: item.source,
  };
}

export interface NewsArticle {
  id: string;
  slug: string;
  title: string;
  summary: string;
  /** O que esse acontecimento significa, na prática, para quem estuda ou trabalha com Dados. */
  relevance: string;

  /** Data do acontecimento na fonte original. */
  publishedAt: string;
  /** Quando a notícia entrou no acervo. Ausente no acervo legado (data não registrada). */
  collectedAt?: string;
  /** Última conferência técnica da fonte (link e dados). Não equivale a aprovação editorial. */
  lastCheckedAt?: string;
  /** Data da aprovação editorial; só existe quando `verification` é "verified". */
  verifiedAt?: string;
  year: number;
  /** Revisão editorial registrada. Ausente no acervo estático = ainda não revisada. */
  verification?: NewsVerification;

  category: NewsCategory[];
  tags: string[];

  source: string;
  sourceUrl: string;

  imageUrl?: string;
  featured?: boolean;

  related?: RelatedContent;
}
