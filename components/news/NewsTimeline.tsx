import Link from "next/link";
import type { NewsSummary } from "@/data/news";

interface NewsTimelineProps {
  news: NewsSummary[];
  years: number[];
  itemsPerYear?: number;
}

/** Recorte histórico por ano, em colunas no desktop. */
export function NewsTimeline({ news, years, itemsPerYear = 4 }: NewsTimelineProps) {
  const sortedYears = [...years].sort((a, b) => b - a);

  return (
    <ol className="grid border-t border-line sm:grid-cols-2 lg:grid-cols-5">
      {sortedYears.map((year, index) => {
        const yearNews = news
          .filter((item) => item.year === year)
          .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt))
          .slice(0, itemsPerYear);

        if (yearNews.length === 0) return null;

        return (
          <li
            key={year}
            className={`border-b border-line py-6 lg:border-b-0 lg:px-5 lg:first:pl-0 ${index > 0 ? "lg:border-l" : ""}`}
          >
            <h3 className="font-display text-3xl font-medium tabular-nums tracking-tight text-fg">{year}</h3>
            <ul className="mt-4 space-y-3">
              {yearNews.map((item) => (
                <li key={item.id}>
                  <Link
                    href={`/noticias/${item.slug}`}
                    className="text-sm leading-snug text-muted transition-colors hover:text-accent"
                  >
                    {item.title}
                  </Link>
                </li>
              ))}
            </ul>
          </li>
        );
      })}
    </ol>
  );
}
