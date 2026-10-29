"use client";

import { useMemo, useState } from "react";
import { Project, ProjectArea, ProjectDifficulty } from "@/data/projects";
import { FILTER_ALL, FilterChips } from "@/components/ui/FilterChips";
import { ResultBar } from "@/components/ui/ResultBar";
import { SearchInput } from "@/components/ui/SearchInput";
import { normalizeText } from "@/lib/text";
import { ProjectGrid } from "./ProjectGrid";

interface ProjectExplorerProps {
  projects: Project[];
  areas: ProjectArea[];
  difficulties: ProjectDifficulty[];
}

export function ProjectExplorer({ projects, areas, difficulties }: ProjectExplorerProps) {
  const [query, setQuery] = useState("");
  const [area, setArea] = useState<string>(FILTER_ALL);
  const [difficulty, setDifficulty] = useState<string>(FILTER_ALL);

  const hasActiveFilters = query.trim() !== "" || area !== FILTER_ALL || difficulty !== FILTER_ALL;

  function clearFilters() {
    setQuery("");
    setArea(FILTER_ALL);
    setDifficulty(FILTER_ALL);
  }

  const filtered = useMemo(() => {
    const normalizedQuery = normalizeText(query.trim());
    return projects.filter((project) => {
      if (area !== FILTER_ALL && project.area !== area) return false;
      if (difficulty !== FILTER_ALL && project.difficulty !== difficulty) return false;
      if (!normalizedQuery) return true;
      return normalizeText(
        [project.title, project.description, project.area, ...project.technologies, ...project.skills].join(" "),
      ).includes(normalizedQuery);
    });
  }, [projects, area, difficulty, query]);

  return (
    <div>
      <div className="max-w-[22rem]">
        <SearchInput id="project-search" label="Buscar projetos" value={query} onChange={setQuery} />
      </div>

      <div className="mt-6 flex flex-col gap-5">
        <FilterChips label="Área" options={areas} active={area} onChange={setArea} />
        <FilterChips label="Dificuldade" options={difficulties} active={difficulty} onChange={setDifficulty} />
      </div>

      <div className="mt-8">
        <ResultBar shown={filtered.length} total={projects.length} noun="projetos" onClear={hasActiveFilters ? clearFilters : undefined} />
      </div>

      <div className="mt-6">
        <ProjectGrid projects={filtered} emptyMessage="Nenhum projeto encontrado para essa busca ou filtro." />
      </div>
    </div>
  );
}
