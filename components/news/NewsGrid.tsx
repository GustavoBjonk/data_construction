import type { NewsSummary } from "@/data/news";
import { EmptyState } from "@/components/ui/EmptyState";
import { NewsCard } from "./NewsCard";

interface NewsGridProps {
  news: NewsSummary[];
  emptyMessage?: string;
}

export function NewsGrid({ news, emptyMessage = "Nenhuma notícia encontrada." }: NewsGridProps) {
  if (news.length === 0) {
    return <EmptyState title={emptyMessage} description="Tente outro termo ou remova os filtros." />;
  }

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {news.map((item) => (
        <NewsCard key={item.id} news={item} />
      ))}
    </div>
  );
}
