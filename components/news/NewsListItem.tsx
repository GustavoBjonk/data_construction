import Link from "next/link";
import type { NewsSummary } from "@/data/news";
import { formatDate } from "@/lib/format";

/** Linha editorial compacta: data, categoria, título e fonte. */
export function NewsListItem({ news }: { news: NewsSummary }) {
  return (
    <li className="group relative grid grid-cols-[5.5rem_1fr] gap-4 border-b border-line py-4 last:border-b-0 sm:grid-cols-[7rem_1fr]">
      <time
        dateTime={news.publishedAt}
        className="pt-0.5 font-mono text-[0.6875rem] uppercase tracking-[0.1em] text-subtle"
      >
        {formatDate(news.publishedAt)}
      </time>
      <div className="min-w-0">
        <p className="eyebrow truncate">{news.category[0]}</p>
        <h3 className="mt-1.5 text-[0.9375rem] font-medium leading-snug text-fg transition-colors group-hover:text-accent">
          <Link href={`/noticias/${news.slug}`} className="after:absolute after:inset-0">
            {news.title}
          </Link>
        </h3>
        <p className="mt-1 truncate text-xs text-subtle">{news.source}</p>
      </div>
    </li>
  );
}
