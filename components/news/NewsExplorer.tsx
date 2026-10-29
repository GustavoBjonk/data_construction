"use client";

import { useMemo, useState } from "react";
import type { NewsCategory, NewsSummary } from "@/data/news";
import { Button } from "@/components/ui/Button";
import { FILTER_ALL, FilterChips } from "@/components/ui/FilterChips";
import { ResultBar } from "@/components/ui/ResultBar";
import { SearchInput } from "@/components/ui/SearchInput";
import { SelectField } from "@/components/ui/SelectField";
import { normalizeText } from "@/lib/text";
import { NewsGrid } from "./NewsGrid";

const PAGE_SIZE = 9;

interface NewsExplorerProps {
  news: NewsSummary[];
  years: number[];
  categories: readonly string[];
}

export function NewsExplorer({ news, years, categories }: NewsExplorerProps) {
  const [query, setQuery] = useState("");
  const [year, setYear] = useState<string>(FILTER_ALL);
  const [category, setCategory] = useState<string>(FILTER_ALL);
  const [source, setSource] = useState<string>(FILTER_ALL);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const sources = useMemo(
    () => [...new Set(news.map((item) => item.source))].sort((a, b) => a.localeCompare(b, "pt-BR")),
    [news],
  );

  const hasActiveFilters = query.trim() !== "" || year !== FILTER_ALL || category !== FILTER_ALL || source !== FILTER_ALL;

  function resetPaging<T>(setter: (value: T) => void) {
    return (value: T) => {
      setter(value);
      setVisibleCount(PAGE_SIZE);
    };
  }

  function clearFilters() {
    setQuery("");
    setYear(FILTER_ALL);
    setCategory(FILTER_ALL);
    setSource(FILTER_ALL);
    setVisibleCount(PAGE_SIZE);
  }

  const filtered = useMemo(() => {
    const normalizedQuery = normalizeText(query.trim());

    return news
      .filter((item) => {
        if (year !== FILTER_ALL && String(item.year) !== year) return false;
        if (category !== FILTER_ALL && !item.category.includes(category as NewsCategory)) return false;
        if (source !== FILTER_ALL && item.source !== source) return false;
        if (!normalizedQuery) return true;
        return normalizeText([item.title, item.summary, item.source, ...item.category, ...item.tags].join(" ")).includes(
          normalizedQuery,
        );
      })
      .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
  }, [news, year, category, source, query]);

  const visible = filtered.slice(0, visibleCount);

  return (
    <div>
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,22rem)_auto] lg:items-end lg:justify-between">
        <SearchInput id="news-search" label="Buscar notícias" value={query} onChange={resetPaging(setQuery)} />
        <SelectField
          id="news-source"
          label="Fonte"
          value={source}
          onChange={resetPaging(setSource)}
          options={[{ value: FILTER_ALL, label: "Todas as fontes" }, ...sources.map((s) => ({ value: s, label: s }))]}
        />
      </div>

      <div className="mt-6 flex flex-col gap-5">
        <FilterChips label="Período" options={years.map(String)} active={year} onChange={resetPaging(setYear)} />
        <FilterChips label="Categoria" options={categories} active={category} onChange={resetPaging(setCategory)} />
      </div>

      <div className="mt-8">
        <ResultBar shown={filtered.length} total={news.length} noun="notícias" onClear={hasActiveFilters ? clearFilters : undefined} />
      </div>

      <div className="mt-6">
        <NewsGrid news={visible} emptyMessage="Nenhuma notícia encontrada para essa busca ou filtro." />
      </div>

      {visibleCount < filtered.length && (
        <div className="mt-10 flex justify-center">
          <Button variant="secondary" onClick={() => setVisibleCount((count) => count + PAGE_SIZE)}>
            Carregar mais notícias
          </Button>
        </div>
      )}
    </div>
  );
}
