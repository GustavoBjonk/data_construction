/**
 * Leitura do conteúdo editorial em content/<coleção>/<id>.json.
 *
 * Fonte única para o site (lib/content/index.ts), os scripts e os testes.
 * Arquivo inválido interrompe a leitura com erro explícito (o build falha)
 * em vez de publicar uma página quebrada ou com dados parciais.
 *
 * Sem "server-only" e sem alias "@/": também roda nos scripts de Node.
 */
import { readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import type { Article } from "../../data/articles.ts";
import type { Book } from "../../data/books.ts";
import type { Course } from "../../data/courses.ts";
import type { Dataset } from "../../data/datasets.ts";
import type { Organization } from "../../data/donations.ts";
import type { NewsArticle } from "../../data/news.ts";
import type { Project, ProjectArea } from "../../data/projects.ts";
import type { Roadmap } from "../../data/roadmaps.ts";
import { CONTENT_DIR, contentFilePath, isValidContentId } from "./paths.ts";
import {
  COLLECTIONS,
  envelopeSchema,
  type CollectionItem,
  type CollectionName,
  type ContentEnvelope,
} from "./schemas.ts";

export interface StoredItem<C extends CollectionName> extends ContentEnvelope<CollectionItem<C>> {
  /** Caminho relativo à raiz do repositório (POSIX). */
  path: string;
}

export class ContentValidationError extends Error {
  readonly issues: string[];

  constructor(message: string, issues: string[]) {
    super(`${message}\n${issues.map((issue) => `  - ${issue}`).join("\n")}`);
    this.name = "ContentValidationError";
    this.issues = issues;
  }
}

/**
 * Pasta de uma coleção. A raiz é configurável (testes e scripts), o que o
 * rastreamento de arquivos do Next não consegue analisar: os comentários
 * turbopackIgnore evitam que ele inclua o projeto inteiro no servidor. Os JSON
 * entram no deploy por `outputFileTracingIncludes` (next.config.mjs).
 */
function collectionDir(collection: CollectionName, root?: string): string {
  return path.join(/*turbopackIgnore: true*/ root ?? process.cwd(), CONTENT_DIR, collection);
}

/** Lê e valida todos os itens de uma coleção, na ordem de `sortOrder`. */
export async function readCollection<C extends CollectionName>(collection: C, root?: string): Promise<StoredItem<C>[]> {
  const dir = collectionDir(collection, root);
  const schema = envelopeSchema(COLLECTIONS[collection].schema);
  const files = (await readdir(/*turbopackIgnore: true*/ dir)).filter((name) => name.endsWith(".json")).sort();
  const issues: string[] = [];
  const items: StoredItem<C>[] = [];

  for (const file of files) {
    const id = file.slice(0, -".json".length);
    const relative = `${CONTENT_DIR}/${collection}/${file}`;
    if (!isValidContentId(id)) {
      issues.push(`${relative}: nome de arquivo fora do padrão de slug`);
      continue;
    }

    let raw: unknown;
    try {
      raw = JSON.parse(await readFile(/*turbopackIgnore: true*/ path.join(/*turbopackIgnore: true*/ dir, file), "utf8"));
    } catch (error) {
      issues.push(`${relative}: JSON inválido (${(error as Error).message})`);
      continue;
    }

    const parsed = schema.safeParse(raw);
    if (!parsed.success) {
      for (const issue of parsed.error.issues) issues.push(`${relative}: ${issue.path.join(".") || "(raiz)"} — ${issue.message}`);
      continue;
    }

    const envelope = parsed.data as ContentEnvelope<CollectionItem<C>>;
    if (envelope.data.id !== id) {
      issues.push(`${relative}: o id "${envelope.data.id}" não corresponde ao nome do arquivo`);
      continue;
    }
    items.push({ ...envelope, path: contentFilePath(collection, id) });
  }

  if (issues.length > 0) throw new ContentValidationError(`Conteúdo inválido em ${CONTENT_DIR}/${collection}:`, issues);
  return items.sort((a, b) => a.sortOrder - b.sortOrder || a.data.id.localeCompare(b.data.id));
}

/**
 * Formato canônico de um arquivo: envelope validado, chaves na ordem do
 * schema, 2 espaços e quebra de linha final (o mesmo exigido pelos testes).
 */
export function serializeEnvelope<C extends CollectionName>(
  collection: C,
  envelope: ContentEnvelope<CollectionItem<C>>,
): string {
  const parsed = envelopeSchema(COLLECTIONS[collection].schema).safeParse(envelope);
  if (!parsed.success) {
    throw new ContentValidationError(
      `Item inválido para ${CONTENT_DIR}/${collection}:`,
      parsed.error.issues.map((issue) => `${issue.path.join(".") || "(raiz)"} — ${issue.message}`),
    );
  }
  return `${JSON.stringify(parsed.data, null, 2)}
`;
}

/**
 * Grava um item (qualquer status) em content/<coleção>/<id>.json, validando
 * antes. Ponto único de escrita para scripts e para um futuro painel.
 */
export async function writeContentItem<C extends CollectionName>(
  collection: C,
  envelope: ContentEnvelope<CollectionItem<C>>,
  root?: string,
): Promise<string> {
  const file = contentFilePath(collection, envelope.data.id);
  await writeFile(
    /*turbopackIgnore: true*/ path.join(/*turbopackIgnore: true*/ root ?? process.cwd(), file),
    serializeEnvelope(collection, envelope),
    "utf8",
  );
  return file;
}

/** Conteúdo visível no site (somente `published`), nos tipos de data/*.ts. */
export interface PublishedContent {
  articles: Article[];
  news: NewsArticle[];
  books: Book[];
  courses: Course[];
  datasets: Dataset[];
  roadmaps: Roadmap[];
  projects: Project[];
  organizations: Organization[];
  /** Área de projetos relacionada a cada trilha (por slug). */
  roadmapProjectAreas: Record<string, ProjectArea | null>;
}

async function readPublished<C extends CollectionName>(collection: C, root?: string): Promise<CollectionItem<C>[]> {
  return (await readCollection(collection, root)).filter((item) => item.status === "published").map((item) => item.data);
}

export async function loadPublishedContent(root?: string): Promise<PublishedContent> {
  const [articles, news, books, courses, datasets, storedRoadmaps, projects, organizations] = await Promise.all([
    readPublished("articles", root),
    readPublished("news", root),
    readPublished("books", root),
    readPublished("courses", root),
    readPublished("datasets", root),
    readPublished("roadmaps", root),
    readPublished("projects", root),
    readPublished("organizations", root),
  ]);

  return {
    articles,
    news,
    books,
    courses,
    datasets,
    roadmaps: storedRoadmaps.map(({ projectArea: _projectArea, ...roadmap }) => roadmap),
    projects,
    organizations,
    roadmapProjectAreas: Object.fromEntries(storedRoadmaps.map((roadmap) => [roadmap.slug, roadmap.projectArea])),
  };
}

/**
 * Regras entre arquivos que um schema isolado não enxerga: unicidade de slug
 * e referências para itens que existem e estão publicados. Retorna a lista de
 * problemas (vazia = consistente).
 */
export function findContentIntegrityIssues(content: PublishedContent): string[] {
  const issues: string[] = [];
  const ids = (items: { id: string }[]) => new Set(items.map((item) => item.id));
  const articleIds = ids(content.articles);
  const courseIds = ids(content.courses);
  const datasetIds = ids(content.datasets);
  const projectIds = ids(content.projects);
  const roadmapSlugs = new Set(content.roadmaps.map((roadmap) => roadmap.slug));

  const checkUnique = (label: string, values: string[]) => {
    const seen = new Set<string>();
    for (const value of values) {
      if (seen.has(value)) issues.push(`${label} duplicado: ${value}`);
      seen.add(value);
    }
  };
  checkUnique("slug de notícia", content.news.map((item) => item.slug));
  checkUnique("slug de trilha", content.roadmaps.map((item) => item.slug));

  for (const roadmap of content.roadmaps) {
    checkUnique(`etapa da trilha ${roadmap.id}`, roadmap.steps.map((step) => step.id));
    for (const step of roadmap.steps) {
      for (const id of step.courseIds) {
        if (!courseIds.has(id)) issues.push(`trilha ${roadmap.id}/${step.id}: curso inexistente "${id}"`);
      }
    }
  }

  for (const item of content.news) {
    const related = item.related ?? {};
    const refs: [string, readonly string[] | undefined, Set<string>][] = [
      ["dataset", related.datasetIds, datasetIds],
      ["projeto", related.projectIds, projectIds],
      ["trilha", related.trackSlugs, roadmapSlugs],
      ["artigo", related.articleIds, articleIds],
    ];
    for (const [label, values, known] of refs) {
      for (const value of values ?? []) {
        if (!known.has(value)) issues.push(`notícia ${item.id}: ${label} inexistente "${value}"`);
      }
    }
  }

  return issues;
}
