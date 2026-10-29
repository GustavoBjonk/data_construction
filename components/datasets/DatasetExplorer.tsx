"use client";

import { useMemo, useState } from "react";
import { Dataset, DatasetCategory, DatasetDifficulty } from "@/data/datasets";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { FILTER_ALL, FilterChips } from "@/components/ui/FilterChips";
import { ResultBar } from "@/components/ui/ResultBar";
import { SearchInput } from "@/components/ui/SearchInput";
import { SelectField } from "@/components/ui/SelectField";
import { normalizeText } from "@/lib/text";
import { DatasetGrid } from "./DatasetGrid";

type DatasetSort = "relevantes" | "nome-asc" | "nome-desc";

const SORT_OPTIONS: { value: DatasetSort; label: string }[] = [
  { value: "relevantes", label: "Mais relevantes" },
  { value: "nome-asc", label: "Nome A–Z" },
  { value: "nome-desc", label: "Nome Z–A" },
];

interface DatasetExplorerProps {
  datasets: Dataset[];
  categories: DatasetCategory[];
  difficulties: DatasetDifficulty[];
}

export function DatasetExplorer({ datasets, categories, difficulties }: DatasetExplorerProps) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string>(FILTER_ALL);
  const [difficulty, setDifficulty] = useState<string>(FILTER_ALL);
  const [sort, setSort] = useState<DatasetSort>("relevantes");

  const hasActiveFilters = query.trim() !== "" || category !== FILTER_ALL || difficulty !== FILTER_ALL;

  function clearFilters() {
    setQuery("");
    setCategory(FILTER_ALL);
    setDifficulty(FILTER_ALL);
  }

  const filtered = useMemo(() => {
    const normalizedQuery = normalizeText(query.trim());

    const result = datasets.filter((dataset) => {
      if (category !== FILTER_ALL && dataset.category !== category) return false;
      if (difficulty !== FILTER_ALL && dataset.difficulty !== difficulty) return false;
      if (!normalizedQuery) return true;
      return normalizeText(
        [dataset.name, dataset.description, dataset.category, ...dataset.technologies, ...dataset.topics].join(" "),
      ).includes(normalizedQuery);
    });

    if (sort === "nome-asc") return [...result].sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));
    if (sort === "nome-desc") return [...result].sort((a, b) => b.name.localeCompare(a.name, "pt-BR"));
    return result;
  }, [datasets, category, difficulty, query, sort]);

  return (
    <div>
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,22rem)_auto] lg:items-end lg:justify-between">
        <SearchInput id="dataset-search" label="Buscar datasets" value={query} onChange={setQuery} />
        <SelectField
          id="dataset-sort"
          label="Ordenar por"
          value={sort}
          options={SORT_OPTIONS}
          onChange={(value) => setSort(value as DatasetSort)}
        />
      </div>

      <div className="mt-6 flex flex-col gap-5">
        <FilterChips label="Categoria" options={categories} active={category} onChange={setCategory} />
        <FilterChips label="Dificuldade" options={difficulties} active={difficulty} onChange={setDifficulty} />
      </div>

      <div className="mt-8">
        <ResultBar shown={filtered.length} total={datasets.length} noun="datasets" onClear={hasActiveFilters ? clearFilters : undefined} />
      </div>

      <div className="mt-6">
        {filtered.length === 0 ? (
          <EmptyState
            title="Nenhum dataset encontrado."
            description="Tente pesquisar por outro termo ou remover alguns filtros."
            action={
              <Button variant="secondary" size="sm" onClick={clearFilters}>
                Limpar filtros
              </Button>
            }
          />
        ) : (
          <DatasetGrid datasets={filtered} />
        )}
      </div>
    </div>
  );
}
