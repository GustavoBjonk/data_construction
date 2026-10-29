import Link from "next/link";
import { Article } from "@/data/articles";
import { DataArt } from "@/components/ui/DataArt";
import { ArrowRightIcon } from "@/components/ui/Icons";
import { formatDate, formatReadingTime } from "@/lib/format";

interface ArticleCardProps {
  article: Article;
  /** Número editorial exibido sobre a ilustração (ex.: "01"). */
  index?: string;
  headingLevel?: "h2" | "h3";
}

export function ArticleCard({ article, index, headingLevel: Heading = "h3" }: ArticleCardProps) {
  return (
    <article className="card-interactive group flex h-full flex-col">
      <DataArt seed={article.id} index={index} className="border-b border-line" />
      <div className="flex flex-1 flex-col p-5">
        <p className="eyebrow">{article.category}</p>
        <Heading className="mt-3 font-display text-lg font-medium leading-snug tracking-tight text-fg">
          <Link href={`/artigos/${article.id}`} className="after:absolute after:inset-0">
            {article.title}
          </Link>
        </Heading>
        <p className="mt-2 line-clamp-2 flex-1 text-sm leading-relaxed text-muted">{article.description}</p>
        <div className="mt-5 flex items-center justify-between gap-4">
          <p className="font-mono text-[0.6875rem] uppercase tracking-[0.1em] text-subtle">
            <time dateTime={article.date}>{formatDate(article.date)}</time> · {formatReadingTime(article.readingTime)}
          </p>
          <span
            aria-hidden="true"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-line-strong text-muted transition-colors group-hover:border-accent group-hover:text-accent"
          >
            <ArrowRightIcon size={14} />
          </span>
        </div>
      </div>
    </article>
  );
}
