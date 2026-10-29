import Link from "next/link";
import type { NewsSummary } from "@/data/news";
import { ArrowRightIcon } from "@/components/ui/Icons";
import { formatDate } from "@/lib/format";

interface NewsCardProps {
  news: NewsSummary;
  /** Versão maior, com resumo completo e relevância. */
  featured?: boolean;
}

export function NewsCard({ news, featured = false }: NewsCardProps) {
  return (
    <article className={`card-interactive group flex h-full flex-col ${featured ? "p-6 sm:p-8" : "p-5"}`}>
      <div className="flex items-center justify-between gap-3">
        <p className="eyebrow truncate text-accent">{news.category[0]}</p>
        <time dateTime={news.publishedAt} className="shrink-0 font-mono text-[0.6875rem] uppercase tracking-[0.1em] text-subtle">
          {formatDate(news.publishedAt)}
        </time>
      </div>

      <h3
        className={`mt-4 font-display font-medium leading-snug tracking-tight text-fg ${
          featured ? "text-2xl sm:text-[1.75rem]" : "text-lg"
        }`}
      >
        <Link href={`/noticias/${news.slug}`} className="after:absolute after:inset-0">
          {news.title}
        </Link>
      </h3>

      <p className={`mt-3 flex-1 text-sm leading-relaxed text-muted ${featured ? "sm:text-base" : "line-clamp-3"}`}>
        {news.summary}
      </p>

      {featured && news.relevance && (
        <div className="mt-6 border-l border-accent/50 pl-4">
          <p className="eyebrow">O que muda na prática</p>
          <p className="mt-2 text-sm leading-relaxed text-fg/80">{news.relevance}</p>
        </div>
      )}

      <div className="mt-5 flex items-center justify-between gap-4 border-t border-line pt-4">
        <p className="truncate text-xs text-subtle">
          Fonte: <span className="text-muted">{news.source}</span>
        </p>
        <ArrowRightIcon size={14} className="shrink-0 text-muted transition-transform group-hover:translate-x-0.5 group-hover:text-accent" />
      </div>
    </article>
  );
}
