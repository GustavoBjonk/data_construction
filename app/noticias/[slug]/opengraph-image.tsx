import { getNewsBySlug } from "@/lib/content";
import { formatDate } from "@/lib/format";
import { OG_CONTENT_TYPE, OG_SIZE, renderOgImage } from "@/lib/og-image";

export const alt = "Notícia — DataConstruction";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default async function NewsOgImage({ params }: { params: Promise<{ slug: string }> }) {
  const item = await getNewsBySlug((await params).slug);
  return renderOgImage({
    eyebrow: item?.category[0] ?? "Notícias",
    title: item?.title ?? "Notícias sobre Dados e IA",
    footer: item ? `${formatDate(item.publishedAt)} · Fonte: ${item.source}` : undefined,
  });
}
