import { Article } from "@/data/articles";
import { EmptyState } from "@/components/ui/EmptyState";
import { ArticleCard } from "./ArticleCard";

interface ArticleGridProps {
  articles: Article[];
  emptyMessage?: string;
}

export function ArticleGrid({ articles, emptyMessage = "Nenhum artigo encontrado." }: ArticleGridProps) {
  if (articles.length === 0) {
    return <EmptyState title={emptyMessage} description="Tente outro termo ou remova os filtros." />;
  }

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {articles.map((article) => (
        <ArticleCard key={article.id} article={article} />
      ))}
    </div>
  );
}
