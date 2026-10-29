"use client";

import { useMemo, useState } from "react";
import { Article } from "@/data/articles";
import { FILTER_ALL, FilterChips } from "@/components/ui/FilterChips";
import { ResultBar } from "@/components/ui/ResultBar";
import { SearchInput } from "@/components/ui/SearchInput";
import { normalizeText } from "@/lib/text";
import { ArticleGrid } from "./ArticleGrid";

interface ArticleExplorerProps {
  articles: Article[];
  categories: readonly string[];
}

export function ArticleExplorer({ articles, categories }: ArticleExplorerProps) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string>(FILTER_ALL);

  const filtered = useMemo(() => {
    const normalizedQuery = normalizeText(query.trim());
    return articles.filter((article) => {
      if (category !== FILTER_ALL && article.category !== category) return false;
      if (!normalizedQuery) return true;
      return normalizeText(`${article.title} ${article.description} ${article.category}`).includes(normalizedQuery);
    });
  }, [articles, category, query]);

  const hasActiveFilters = query.trim() !== "" || category !== FILTER_ALL;

  return (
    <div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,22rem)_1fr] lg:items-end">
        <SearchInput id="article-search" label="Buscar artigos" value={query} onChange={setQuery} />
        <FilterChips label="Categoria" options={categories} active={category} onChange={setCategory} />
      </div>

      <div className="mt-8">
        <ResultBar
          shown={filtered.length}
          total={articles.length}
          noun="artigos"
          onClear={
            hasActiveFilters
              ? () => {
                  setQuery("");
                  setCategory(FILTER_ALL);
                }
              : undefined
          }
        />
      </div>

      <div className="mt-6">
        <ArticleGrid articles={filtered} emptyMessage="Nenhum artigo encontrado para essa busca ou filtro." />
      </div>
    </div>
  );
}
