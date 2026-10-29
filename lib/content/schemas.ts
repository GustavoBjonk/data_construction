/**
 * Schemas Zod do conteúdo editorial salvo em content/<coleção>/<id>.json.
 *
 * Cada arquivo é um envelope ({ schemaVersion, status, sortOrder, data }) e o
 * `data` tem exatamente o formato dos tipos de data/*.ts — as asserções no fim
 * do arquivo quebram o typecheck se schema e tipo divergirem.
 *
 * Os mesmos schemas validam a leitura (build/site), os scripts e qualquer
 * gravação futura. Objetos são estritos: campo
 * desconhecido é erro, não é descartado em silêncio.
 *
 * Imports relativos com extensão .ts: este módulo também roda nos scripts
 * (node --experimental-strip-types), que não resolvem o alias "@/".
 */
import { z } from "zod";
import type { Article } from "../../data/articles.ts";
import { BOOK_TOPICS, type Book } from "../../data/books.ts";
import type { Course } from "../../data/courses.ts";
import { DATASET_CATEGORIES, DATASET_DIFFICULTIES, type Dataset } from "../../data/datasets.ts";
import { ORGANIZATION_CATEGORIES, type Organization } from "../../data/donations.ts";
import { NEWS_CATEGORIES, NEWS_VERIFICATIONS, type NewsArticle } from "../../data/news.ts";
import { PROJECT_AREAS, PROJECT_DIFFICULTIES, type Project } from "../../data/projects.ts";
import type { Roadmap } from "../../data/roadmaps.ts";

/** Versão do formato do envelope. Mudança incompatível = nova versão + migração. */
export const CONTENT_SCHEMA_VERSION = 1;

/** Mesmo padrão de slug usado nas URLs públicas. */
export const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const MAX_SLUG_LENGTH = 120;

// ---------------------------------------------------------------------------
// Primitivos
// ---------------------------------------------------------------------------

/** Caracteres de controle (exceto quebra de linha e tab) não têm uso em texto editorial. */
const CONTROL_CHARS = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/;
/** Abertura de tag HTML. O React escapa texto, mas marcação não pertence a campos de texto puro. */
const HTML_TAG = /<\s*[a-zA-Z!/?]/;

/** Texto curto de uma linha, sem marcação. */
const plainText = (max: number) =>
  z
    .string()
    .trim()
    .min(1)
    .max(max)
    .refine((value) => !CONTROL_CHARS.test(value) && !/[\r\n]/.test(value), "Texto com caracteres não permitidos.")
    .refine((value) => !HTML_TAG.test(value), "Marcação HTML não é permitida neste campo.");

/** Texto longo (pode ter quebras de linha), sem marcação. */
const longText = (max: number) =>
  z
    .string()
    .trim()
    .min(1)
    .max(max)
    .refine((value) => !CONTROL_CHARS.test(value), "Texto com caracteres não permitidos.")
    .refine((value) => !HTML_TAG.test(value), "Marcação HTML não é permitida neste campo.");

export const slugSchema = z.string().max(MAX_SLUG_LENGTH).regex(SLUG_PATTERN, "Use letras minúsculas, números e hífens.");

/** Só http(s): bloqueia javascript:, data: e afins em qualquer link exibido. */
const httpUrl = z.url({ protocol: /^https?$/, hostname: z.regexes.domain }).max(2048);

const isoDate = z.iso.date();
const level = z.enum(["Iniciante", "Intermediário", "Avançado"]);
const tagList = (maxItems: number) => z.array(plainText(80)).max(maxItems);
const idList = z.array(slugSchema).max(50);

// ---------------------------------------------------------------------------
// Itens (formato de data/*.ts)
// ---------------------------------------------------------------------------

export const articleSchema = z.strictObject({
  id: slugSchema,
  title: plainText(200),
  description: longText(600),
  category: plainText(60),
  date: isoDate,
  readingTime: z.int().min(1).max(240),
  author: plainText(120),
  authorBio: longText(600),
  // Blocos do texto: parágrafos, "## Subtítulo" e blocos ``` de código.
  // Código pode conter "<" legítimo (comparações), por isso não usa longText;
  // o componente ArticleContent renderiza tudo como texto escapado.
  content: z
    .array(
      z
        .string()
        .min(1)
        .max(20_000)
        .refine((value) => !CONTROL_CHARS.test(value), "Texto com caracteres não permitidos."),
    )
    .min(1)
    .max(400),
  references: z.array(z.strictObject({ citation: longText(1000), url: httpUrl.optional() })).max(100),
  tags: tagList(12).optional(),
});

/**
 * Datas de uma notícia, cada uma com uma finalidade:
 * - `publishedAt`: data do acontecimento na fonte original;
 * - `collectedAt`: quando a notícia entrou no acervo (ausente no acervo legado, cuja data de coleta não foi registrada);
 * - `lastCheckedAt`: última conferência técnica da fonte (link e dados), sem valor de aprovação;
 * - `verifiedAt`: aprovação editorial; existe se, e somente se, `verification` é "verified".
 */
export const newsSchema = z
  .strictObject({
    id: slugSchema,
    slug: slugSchema,
    title: plainText(200),
    summary: longText(2000),
    relevance: longText(2000),
    publishedAt: isoDate,
    collectedAt: isoDate.optional(),
    lastCheckedAt: isoDate.optional(),
    verifiedAt: isoDate.optional(),
    year: z.int().min(1950).max(2100),
    verification: z.enum(NEWS_VERIFICATIONS).optional(),
    category: z.array(z.enum(NEWS_CATEGORIES)).min(1).max(6),
    tags: tagList(20),
    source: plainText(200),
    sourceUrl: httpUrl,
    imageUrl: httpUrl.optional(),
    featured: z.boolean().optional(),
    related: z
      .strictObject({
        datasetIds: idList.optional(),
        projectIds: idList.optional(),
        trackSlugs: idList.optional(),
        articleIds: idList.optional(),
      })
      .optional(),
  })
  .refine((item) => (item.verification === "verified") === (item.verifiedAt !== undefined), {
    message: 'verifiedAt só existe em notícia com verification "verified" (e é obrigatório nela).',
    path: ["verifiedAt"],
  });

export const bookSchema = z.strictObject({
  id: slugSchema,
  title: plainText(200),
  authors: z.array(plainText(120)).min(1).max(20),
  publisher: plainText(120),
  year: z.int().min(1900).max(2100),
  edition: plainText(60).optional(),
  isbn13: z.string().regex(/^97[89]\d{10}$/, "ISBN-13 inválido."),
  topic: z.enum(BOOK_TOPICS),
  level,
  language: z.enum(["Inglês", "Português"]),
  description: longText(1000),
  why: longText(1000),
  freeOnlineUrl: httpUrl.optional(),
});

export const courseSchema = z.strictObject({
  id: slugSchema,
  title: plainText(200),
  platform: plainText(120),
  area: plainText(80),
  type: z.enum(["free", "paid"]),
  price: z.number().nonnegative().max(100_000).optional(),
  currency: z.literal("BRL"),
  priceCheckedAt: isoDate.optional(),
  duration: plainText(60).optional(),
  level,
  description: longText(1000),
  skills: tagList(30),
  url: httpUrl,
});

export const datasetSchema = z.strictObject({
  id: slugSchema,
  name: plainText(200),
  description: longText(1000),
  category: z.enum(DATASET_CATEGORIES),
  difficulty: z.enum(DATASET_DIFFICULTIES),
  size: plainText(60).optional(),
  format: plainText(60).optional(),
  topics: tagList(30),
  technologies: tagList(30),
  idealFor: tagList(30),
  source: plainText(200),
  sourceUrl: httpUrl,
});

export const projectSchema = z.strictObject({
  id: slugSchema,
  title: plainText(200),
  description: longText(1000),
  area: z.enum(PROJECT_AREAS),
  difficulty: z.enum(PROJECT_DIFFICULTIES),
  technologies: tagList(30),
  skills: tagList(30),
  estimatedTime: plainText(60),
  objective: longText(1000),
});

export const roadmapStepSchema = z.strictObject({
  id: slugSchema,
  order: z.int().min(1).max(100),
  title: plainText(200),
  description: longText(1000),
  topics: tagList(40),
  technologies: tagList(40),
  courseIds: idList,
});

export const roadmapSchema = z.strictObject({
  id: slugSchema,
  slug: slugSchema,
  title: plainText(200),
  description: longText(1000),
  level: plainText(60),
  estimatedDuration: plainText(60),
  steps: z.array(roadmapStepSchema).min(1).max(50),
});

/**
 * No arquivo, a trilha guarda também a área de projetos relacionada
 * (antes ROADMAP_PROJECT_AREAS). O loader separa os dois.
 */
export const storedRoadmapSchema = roadmapSchema.extend({
  projectArea: z.enum(PROJECT_AREAS).nullable(),
});

export const organizationSchema = z.strictObject({
  id: slugSchema,
  name: plainText(200),
  description: longText(1000),
  category: z.enum(ORGANIZATION_CATEGORIES),
  officialSiteUrl: httpUrl,
  donationUrl: httpUrl,
});

// ---------------------------------------------------------------------------
// Envelope e registro de coleções
// ---------------------------------------------------------------------------

/**
 * Ciclo editorial. Só `published` aparece no site (páginas, busca, sitemap,
 * feed); os demais ficam apenas no repositório:
 * - `draft`: rascunho em edição;
 * - `review`: pronto, aguardando aprovação editorial;
 * - `published`: aprovado e público;
 * - `archived`: retirado do site, preservado (o histórico do Git guarda cada versão).
 * Transições permitidas: lib/content/news-workflow.ts.
 */
export const CONTENT_STATUSES = ["draft", "review", "published", "archived"] as const;
export type ContentStatus = (typeof CONTENT_STATUSES)[number];

export function envelopeSchema<T extends z.ZodType>(data: T) {
  return z.strictObject({
    schemaVersion: z.literal(CONTENT_SCHEMA_VERSION),
    status: z.enum(CONTENT_STATUSES),
    /** Posição na listagem original (coleções sem ordenação por data). */
    sortOrder: z.int().min(0).max(1_000_000),
    data,
  });
}

/**
 * Coleções editoriais. A chave é também o nome da pasta em content/ e o único
 * conjunto de diretórios de conteúdo permitido.
 */
export const COLLECTIONS = {
  articles: { schema: articleSchema, label: "Artigos" },
  news: { schema: newsSchema, label: "Notícias" },
  books: { schema: bookSchema, label: "Livros" },
  courses: { schema: courseSchema, label: "Cursos" },
  datasets: { schema: datasetSchema, label: "Datasets" },
  roadmaps: { schema: storedRoadmapSchema, label: "Trilhas" },
  projects: { schema: projectSchema, label: "Projetos" },
  organizations: { schema: organizationSchema, label: "Organizações (doações)" },
} as const;

export type CollectionName = keyof typeof COLLECTIONS;
export const COLLECTION_NAMES = Object.keys(COLLECTIONS) as CollectionName[];

export type CollectionItem<C extends CollectionName> = z.infer<(typeof COLLECTIONS)[C]["schema"]>;

export interface ContentEnvelope<T> {
  schemaVersion: typeof CONTENT_SCHEMA_VERSION;
  status: ContentStatus;
  sortOrder: number;
  data: T;
}

// ---------------------------------------------------------------------------
// Asserções de compatibilidade schema ⇄ tipos de data/*.ts (só em tempo de compilação)
// ---------------------------------------------------------------------------

type Same<A, B> = [A] extends [B] ? ([B] extends [A] ? true : false) : false;
type Assert<T extends true> = T;

export type SchemaMatchesTypes = [
  Assert<Same<z.infer<typeof articleSchema>, Article>>,
  Assert<Same<z.infer<typeof newsSchema>, NewsArticle>>,
  Assert<Same<z.infer<typeof bookSchema>, Book>>,
  Assert<Same<z.infer<typeof courseSchema>, Course>>,
  Assert<Same<z.infer<typeof datasetSchema>, Dataset>>,
  Assert<Same<z.infer<typeof projectSchema>, Project>>,
  Assert<Same<z.infer<typeof roadmapSchema>, Roadmap>>,
  Assert<Same<z.infer<typeof organizationSchema>, Organization>>,
];
