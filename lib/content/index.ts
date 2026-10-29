/**
 * Camada de leitura do conteúdo público.
 *
 * Origem definida por `CONTENT_SOURCE` (lib/supabase/env.ts):
 *   - `static` (padrão): arquivos JSON de content/ (lib/content/store.ts);
 *   - `supabase`: banco, com as mesmas regras RLS de qualquer visitante.
 * Se o banco falhar, registra o erro e usa os arquivos — o site não sai do ar
 * durante a transição. As páginas devem importar daqui; data/*.ts só tem tipos.
 */
import "server-only";
import { cache } from "react";
import type { Article } from "@/data/articles";
import type { Book } from "@/data/books";
import type { Course } from "@/data/courses";
import type { Dataset } from "@/data/datasets";
import type { Organization } from "@/data/donations";
import { isEditoriallyVerified, type NewsArticle } from "@/data/news";
import type { Project } from "@/data/projects";
import type { Roadmap } from "@/data/roadmaps";
import { logServerEvent } from "@/lib/observability";
import { getContentSource } from "@/lib/supabase/env";
import { createSupabasePublicClient } from "@/lib/supabase/server";
import { normalizeText, slugify } from "@/lib/text";
import {
  SELECTS,
  articleRow,
  courseRow,
  datasetRow,
  newsRow,
  organizationRow,
  projectRow,
  roadmapRow,
  toArticle,
  toCourse,
  toDataset,
  toNews,
  toOrganization,
  toProject,
  toRoadmap,
} from "./rows";
import { loadPublishedContent, type PublishedContent } from "./store";

export interface Catalog {
  articles: Article[];
  news: NewsArticle[];
  datasets: Dataset[];
  courses: Course[];
  roadmaps: Roadmap[];
  projects: Project[];
  organizations: Organization[];
  /** Livros: sempre dos arquivos (curadoria editorial, sem tabela no banco). */
  books: Book[];
  /** Área de projetos relacionada a cada trilha (por slug). */
  roadmapProjectAreas: Record<string, string | null>;
}

let staticContent: Promise<PublishedContent> | undefined;

/**
 * Em produção os arquivos não mudam durante a execução: lê uma vez por
 * processo. Em desenvolvimento relê a cada requisição para refletir edições.
 */
function loadStaticContent(): Promise<PublishedContent> {
  if (process.env.NODE_ENV !== "production") return loadPublishedContent();
  staticContent ??= loadPublishedContent();
  return staticContent;
}

async function loadFromSupabase(books: Book[]): Promise<Catalog> {
  const supabase = createSupabasePublicClient();
  const byOrder = { ascending: true } as const;

  const [a, n, d, c, r, p, o] = await Promise.all([
    supabase.from("articles").select(SELECTS.articles).order("published_on", { ascending: false }),
    supabase.from("news").select(SELECTS.news).order("published_on", { ascending: false }),
    supabase.from("datasets").select(SELECTS.datasets).order("sort_order", byOrder),
    supabase.from("courses").select(SELECTS.courses).order("sort_order", byOrder),
    supabase.from("roadmaps").select(SELECTS.roadmaps).order("sort_order", byOrder),
    supabase.from("projects").select(SELECTS.projects).order("sort_order", byOrder),
    supabase.from("organizations").select(SELECTS.organizations).order("sort_order", byOrder),
  ]);

  const failed = [a, n, d, c, r, p, o].find((result) => result.error);
  if (failed?.error) throw new Error(`Supabase: ${failed.error.message}`);

  const roadmapRows = roadmapRow.array().parse(r.data);
  return {
    articles: articleRow.array().parse(a.data).map(toArticle),
    news: newsRow.array().parse(n.data).map(toNews),
    datasets: datasetRow.array().parse(d.data).map(toDataset),
    courses: courseRow.array().parse(c.data).map(toCourse),
    roadmaps: roadmapRows.map(toRoadmap),
    projects: projectRow.array().parse(p.data).map(toProject),
    organizations: organizationRow.array().parse(o.data).map(toOrganization),
    books,
    roadmapProjectAreas: Object.fromEntries(roadmapRows.map((row) => [row.slug, row.project_area])),
  };
}

/** Catálogo completo (memorizado por requisição/renderização). */
export const getCatalog = cache(async (): Promise<Catalog> => {
  const content = await loadStaticContent();
  if (getContentSource() === "static") return content;
  try {
    return await loadFromSupabase(content.books);
  } catch (error) {
    logServerEvent(
      "error",
      "content.fallback",
      "Falha ao ler o conteúdo do Supabase; o site está servindo content/*.json.",
      error,
    );
    return content;
  }
});

export async function getArticlesByDate(): Promise<Article[]> {
  return [...(await getCatalog()).articles].sort((a, b) => b.date.localeCompare(a.date));
}

export async function getArticle(id: string): Promise<Article | undefined> {
  return (await getCatalog()).articles.find((article) => article.id === id);
}

export async function getNewsByDate(): Promise<NewsArticle[]> {
  return [...(await getCatalog()).news].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
}

export async function getNewsBySlug(slug: string): Promise<NewsArticle | undefined> {
  return (await getCatalog()).news.find((item) => item.slug === slug);
}

/** Situação real da revisão editorial do acervo (só conta revisão registrada). */
export async function getNewsReviewStats() {
  const items = (await getCatalog()).news;
  const verified = items.filter(isEditoriallyVerified);
  const lastVerifiedAt = verified.reduce<string | undefined>(
    (latest, item) => (!latest || item.verifiedAt > latest ? item.verifiedAt : latest),
    undefined,
  );
  return { total: items.length, verified: verified.length, lastVerifiedAt };
}

export async function getRoadmap(slug: string): Promise<Roadmap | undefined> {
  return (await getCatalog()).roadmaps.find((roadmap) => roadmap.slug === slug);
}

/** Contagens reais do acervo. Métricas sem fonte não entram. */
export async function getContentStats() {
  const catalog = await getCatalog();
  return {
    articles: catalog.articles.length,
    news: catalog.news.length,
    datasets: catalog.datasets.length,
    tracks: catalog.roadmaps.length,
    projects: catalog.projects.length,
    courses: catalog.courses.length,
  };
}

export function pickByIds<T extends { id: string }>(items: T[], ids: readonly string[] | undefined): T[] {
  return (ids ?? []).map((id) => items.find((item) => item.id === id)).filter((item): item is T => item !== undefined);
}

// ---------------------------------------------------------------------------
// Busca global
// ---------------------------------------------------------------------------

export type SearchResultType = "Notícia" | "Artigo" | "Dataset" | "Trilha" | "Projeto" | "Curso" | "Livro";

export interface SearchResult {
  type: SearchResultType;
  title: string;
  description: string;
  href: string;
  external?: boolean;
  meta?: string;
}

interface Indexed {
  result: SearchResult;
  title: string;
  body: string;
}

function buildIndex(catalog: Catalog): Indexed[] {
  const entries: { result: SearchResult; extra: string[] }[] = [
    ...catalog.articles.map((item) => ({
      result: { type: "Artigo" as const, title: item.title, description: item.description, href: `/artigos/${item.id}`, meta: item.category },
      extra: [item.category, ...item.content],
    })),
    ...catalog.news.map((item) => ({
      result: { type: "Notícia" as const, title: item.title, description: item.summary, href: `/noticias/${item.slug}`, meta: item.source },
      extra: [item.source, ...item.category, ...item.tags],
    })),
    ...catalog.datasets.map((item) => ({
      result: {
        type: "Dataset" as const,
        title: item.name,
        description: item.description,
        href: `/datasets#dataset-${item.id}`,
        meta: item.category,
      },
      extra: [item.category, ...item.topics, ...item.technologies],
    })),
    ...catalog.roadmaps.map((item) => ({
      result: { type: "Trilha" as const, title: item.title, description: item.description, href: `/trilhas/${item.slug}`, meta: item.level },
      extra: item.steps.flatMap((step) => [step.title, ...step.topics, ...step.technologies]),
    })),
    ...catalog.projects.map((item) => ({
      result: { type: "Projeto" as const, title: item.title, description: item.description, href: "/projetos", meta: item.area },
      extra: [item.area, ...item.technologies, ...item.skills],
    })),
    ...catalog.courses.map((item) => ({
      result: {
        type: "Curso" as const,
        title: item.title,
        description: item.description,
        href: item.url,
        external: true,
        meta: item.platform,
      },
      extra: [item.platform, item.area, ...item.skills],
    })),
  ];

  // Livros são curadoria editorial dos arquivos (content/books), não vêm do banco.
  entries.push(
    ...catalog.books.map((item) => ({
      result: {
        type: "Livro" as const,
        title: item.title,
        description: item.description,
        href: `/livros#${slugify(item.topic)}`,
        meta: item.authors.join(", "),
      },
      extra: [item.topic, item.level, ...item.authors],
    })),
  );

  return entries.map(({ result, extra }) => ({
    result,
    title: normalizeText(result.title),
    body: normalizeText([result.description, ...extra].join(" ")),
  }));
}

const getSearchIndex = cache(async () => buildIndex(await getCatalog()));

export const SEARCH_MIN_LENGTH = 2;
const SEARCH_LIMIT = 60;

/** Todos os termos precisam aparecer; título pesa mais que corpo. */
export async function searchContent(query: string): Promise<SearchResult[]> {
  const terms = normalizeText(query).split(/\s+/).filter(Boolean);
  if (terms.join("").length < SEARCH_MIN_LENGTH) return [];

  const index = await getSearchIndex();

  return index
    .map((entry) => {
      let score = 0;
      for (const term of terms) {
        const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        if (new RegExp(`(^|[^a-z0-9])${escaped}($|[^a-z0-9])`).test(entry.title)) score += 5;
        else if (entry.title.includes(term)) score += 3;
        else if (entry.body.includes(term)) score += 1;
        else return null;
      }
      return { entry, score };
    })
    .filter((item): item is { entry: Indexed; score: number } => item !== null)
    .sort((a, b) => b.score - a.score)
    .slice(0, SEARCH_LIMIT)
    .map(({ entry }) => entry.result);
}
