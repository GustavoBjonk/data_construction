import { getNewsByDate } from "@/lib/content";
import { SITE, absoluteUrl } from "@/lib/site";

export const revalidate = 3600;

const FEED_SIZE = 50;

function xml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/** RSS 2.0 com as notícias mais recentes; cada item aponta também para a fonte original. */
export async function GET() {
  const items = (await getNewsByDate()).slice(0, FEED_SIZE);
  const feedUrl = absoluteUrl("/noticias/feed.xml");

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${xml(`${SITE.name} — Notícias`)}</title>
    <link>${xml(absoluteUrl("/noticias"))}</link>
    <description>${xml("Notícias sobre Dados, IA e tecnologia com resumo editorial e fonte original.")}</description>
    <language>pt-BR</language>
    <atom:link href="${xml(feedUrl)}" rel="self" type="application/rss+xml" />
${items
  .map((item) => {
    const url = absoluteUrl(`/noticias/${item.slug}`);
    return `    <item>
      <title>${xml(item.title)}</title>
      <link>${xml(url)}</link>
      <guid isPermaLink="true">${xml(url)}</guid>
      <pubDate>${new Date(`${item.publishedAt}T12:00:00Z`).toUTCString()}</pubDate>
      <description>${xml(item.summary)}</description>
${item.category.map((category) => `      <category>${xml(category)}</category>`).join("\n")}
      <source url="${xml(item.sourceUrl)}">${xml(item.source)}</source>
    </item>`;
  })
  .join("\n")}
  </channel>
</rss>
`;

  return new Response(body, {
    headers: { "Content-Type": "application/rss+xml; charset=utf-8" },
  });
}
