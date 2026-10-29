/**
 * Conversão das linhas do banco para os tipos usados pelas páginas
 * (os mesmos de data/*.ts). Cada linha passa por validação Zod: um dado
 * inesperado vira erro explícito em vez de uma página quebrada.
 */
import { z } from "zod";
import type { Article } from "@/data/articles";
import type { Course } from "@/data/courses";
import type { Dataset, DatasetCategory, DatasetDifficulty } from "@/data/datasets";
import type { Organization, OrganizationCategory } from "@/data/donations";
import type { NewsArticle, NewsCategory } from "@/data/news";
import type { Project, ProjectArea, ProjectDifficulty } from "@/data/projects";
import type { Roadmap } from "@/data/roadmaps";

const textArray = z.array(z.string());
const level = z.enum(["Iniciante", "Intermediário", "Avançado"]);

export const articleRow = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  category: z.string(),
  body: textArray,
  citations: z.array(z.object({ citation: z.string(), url: z.string().optional() })),
  author_name: z.string(),
  author_bio: z.string(),
  reading_time_minutes: z.number().int(),
  // Obrigatória para artigos públicos (constraint articles_published_on_check).
  published_on: z.string(),
});

export const newsRow = z.object({
  id: z.string(),
  slug: z.string(),
  title: z.string(),
  summary: z.string(),
  relevance: z.string(),
  published_on: z.string(),
  verified_on: z.string().nullable(),
  verification: z.enum(["unverified", "verified", "flagged"]),
  categories: textArray,
  tags: textArray,
  source_name: z.string(),
  source_url: z.string(),
  image_url: z.string().nullable(),
  featured: z.boolean(),
  related: z.object({
    datasetIds: textArray.optional(),
    projectIds: textArray.optional(),
    trackSlugs: textArray.optional(),
    articleIds: textArray.optional(),
  }),
});

export const datasetRow = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  category: z.string(),
  difficulty: level,
  size_label: z.string().nullable(),
  format: z.string().nullable(),
  topics: textArray,
  technologies: textArray,
  ideal_for: textArray,
  source_name: z.string(),
  source_url: z.string(),
});

export const courseRow = z.object({
  id: z.string(),
  title: z.string(),
  platform: z.string(),
  area: z.string(),
  course_type: z.enum(["free", "paid"]),
  price: z.coerce.number().nullable(),
  price_checked_on: z.string().nullable(),
  duration: z.string().nullable(),
  level,
  description: z.string(),
  skills: textArray,
  url: z.string(),
});

export const roadmapRow = z.object({
  id: z.string(),
  slug: z.string(),
  title: z.string(),
  description: z.string(),
  level: z.string(),
  estimated_duration: z.string(),
  project_area: z.string().nullable(),
  roadmap_steps: z.array(
    z.object({
      id: z.string(),
      position: z.number().int(),
      title: z.string(),
      description: z.string(),
      topics: textArray,
      technologies: textArray,
      roadmap_step_courses: z.array(z.object({ course_id: z.string(), position: z.number().int() })),
    }),
  ),
});

export const projectRow = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  area: z.string(),
  difficulty: level,
  technologies: textArray,
  skills: textArray,
  estimated_time: z.string(),
  objective: z.string(),
});

export const organizationRow = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  category: z.string(),
  official_site_url: z.string(),
  donation_url: z.string(),
});

const optional = <T>(value: T | null): T | undefined => value ?? undefined;

export function toArticle(row: z.infer<typeof articleRow>): Article {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    category: row.category,
    date: row.published_on,
    readingTime: row.reading_time_minutes,
    author: row.author_name,
    authorBio: row.author_bio,
    content: row.body,
    references: row.citations,
  };
}

export function toNews(row: z.infer<typeof newsRow>): NewsArticle {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    summary: row.summary,
    relevance: row.relevance,
    publishedAt: row.published_on,
    // O banco não guarda collectedAt/lastCheckedAt; verified_on só vale como aprovação editorial.
    verifiedAt: row.verification === "verified" ? optional(row.verified_on) : undefined,
    year: Number(row.published_on.slice(0, 4)),
    verification: row.verification,
    category: row.categories as NewsCategory[],
    tags: row.tags,
    source: row.source_name,
    sourceUrl: row.source_url,
    imageUrl: optional(row.image_url),
    featured: row.featured,
    related: row.related,
  };
}

export function toDataset(row: z.infer<typeof datasetRow>): Dataset {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    category: row.category as DatasetCategory,
    difficulty: row.difficulty as DatasetDifficulty,
    size: optional(row.size_label),
    format: optional(row.format),
    topics: row.topics,
    technologies: row.technologies,
    idealFor: row.ideal_for,
    source: row.source_name,
    sourceUrl: row.source_url,
  };
}

export function toCourse(row: z.infer<typeof courseRow>): Course {
  return {
    id: row.id,
    title: row.title,
    platform: row.platform,
    area: row.area,
    type: row.course_type,
    price: optional(row.price),
    currency: "BRL",
    priceCheckedAt: optional(row.price_checked_on),
    duration: optional(row.duration),
    level: row.level,
    description: row.description,
    skills: row.skills,
    url: row.url,
  };
}

export function toRoadmap(row: z.infer<typeof roadmapRow>): Roadmap {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    description: row.description,
    level: row.level,
    estimatedDuration: row.estimated_duration,
    steps: [...row.roadmap_steps]
      .sort((a, b) => a.position - b.position)
      .map((step) => ({
        id: step.id,
        order: step.position,
        title: step.title,
        description: step.description,
        topics: step.topics,
        technologies: step.technologies,
        courseIds: [...step.roadmap_step_courses].sort((a, b) => a.position - b.position).map((c) => c.course_id),
      })),
  };
}

export function toProject(row: z.infer<typeof projectRow>): Project {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    area: row.area as ProjectArea,
    difficulty: row.difficulty as ProjectDifficulty,
    technologies: row.technologies,
    skills: row.skills,
    estimatedTime: row.estimated_time,
    objective: row.objective,
  };
}

export function toOrganization(row: z.infer<typeof organizationRow>): Organization {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    category: row.category as OrganizationCategory,
    officialSiteUrl: row.official_site_url,
    donationUrl: row.donation_url,
  };
}

/** Colunas selecionadas por tabela (mantidas junto dos schemas para não divergirem). */
export const SELECTS = {
  articles: Object.keys(articleRow.shape).join(", "),
  news: Object.keys(newsRow.shape).join(", "),
  datasets: Object.keys(datasetRow.shape).join(", "),
  courses: Object.keys(courseRow.shape).join(", "),
  roadmaps:
    "id, slug, title, description, level, estimated_duration, project_area, roadmap_steps (id, position, title, description, topics, technologies, roadmap_step_courses (course_id, position))",
  projects: Object.keys(projectRow.shape).join(", "),
  organizations: Object.keys(organizationRow.shape).join(", "),
} as const;
