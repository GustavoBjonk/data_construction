import { getArticle } from "@/lib/content";
import { formatReadingTime } from "@/lib/format";
import { OG_CONTENT_TYPE, OG_SIZE, renderOgImage } from "@/lib/og-image";

export const alt = "Artigo — DataConstruction";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default async function ArticleOgImage({ params }: { params: Promise<{ slug: string }> }) {
  const article = await getArticle((await params).slug);
  return renderOgImage({
    eyebrow: article?.category ?? "Artigos",
    title: article?.title ?? "Artigos técnicos sobre dados",
    footer: article ? `${article.author} · ${formatReadingTime(article.readingTime)}` : undefined,
  });
}
