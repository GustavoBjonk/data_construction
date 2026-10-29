import type { MetadataRoute } from "next";
import { isEditoriallyVerified } from "@/data/news";
import { getCatalog } from "@/lib/content";
import { MIN_INDEXABLE_CATEGORY_SIZE, NEWS_CATEGORY_INFO, newsCategoryHref } from "@/lib/news-categories";
import { absoluteUrl } from "@/lib/site";

const STATIC_ROUTES = ["/", "/noticias", "/artigos", "/datasets", "/trilhas", "/projetos", "/livros", "/sobre", "/doacoes"];
/** Páginas legais: indexáveis, mas de baixa prioridade. */
const LEGAL_ROUTES = ["/privacidade", "/cookies", "/termos"];

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { articles, news, roadmaps } = await getCatalog();

  return [
    ...STATIC_ROUTES.map((path) => ({
      url: absoluteUrl(path),
      changeFrequency: "weekly" as const,
      priority: path === "/" ? 1 : 0.8,
    })),
    ...LEGAL_ROUTES.map((path) => ({ url: absoluteUrl(path), changeFrequency: "yearly" as const, priority: 0.2 })),
    // Só categorias com conteúdo suficiente (as demais são noindex).
    ...NEWS_CATEGORY_INFO.filter(
      (info) => news.filter((item) => item.category.includes(info.name)).length >= MIN_INDEXABLE_CATEGORY_SIZE,
    ).map((info) => ({ url: absoluteUrl(newsCategoryHref(info.name)), changeFrequency: "weekly" as const, priority: 0.6 })),
    ...articles.map((article) => ({
      url: absoluteUrl(`/artigos/${article.id}`),
      lastModified: article.date,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
    ...news.map((item) => ({
      url: absoluteUrl(`/noticias/${item.slug}`),
      lastModified: isEditoriallyVerified(item) ? item.verifiedAt : item.publishedAt,
      changeFrequency: "yearly" as const,
      priority: 0.5,
    })),
    ...roadmaps.map((roadmap) => ({
      url: absoluteUrl(`/trilhas/${roadmap.slug}`),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
  ];
}
