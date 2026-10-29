"use client";

import { useMemo, useState } from "react";
import { Course } from "@/data/courses";
import { FILTER_ALL, FilterChips } from "@/components/ui/FilterChips";
import { ResultBar } from "@/components/ui/ResultBar";
import { SearchInput } from "@/components/ui/SearchInput";
import { normalizeText } from "@/lib/text";
import { CourseGrid } from "./CourseGrid";

const COURSE_TYPES = ["Gratuitos", "Até R$100"] as const;
const LOW_COST_LIMIT = 100;

interface CourseExplorerProps {
  courses: Course[];
  areas: string[];
  levels: string[];
}

export function CourseExplorer({ courses, areas, levels }: CourseExplorerProps) {
  const [query, setQuery] = useState("");
  const [area, setArea] = useState<string>(FILTER_ALL);
  const [type, setType] = useState<string>(FILTER_ALL);
  const [level, setLevel] = useState<string>(FILTER_ALL);

  const hasActiveFilters = query.trim() !== "" || area !== FILTER_ALL || type !== FILTER_ALL || level !== FILTER_ALL;

  function clearFilters() {
    setQuery("");
    setArea(FILTER_ALL);
    setType(FILTER_ALL);
    setLevel(FILTER_ALL);
  }

  const filtered = useMemo(() => {
    const normalizedQuery = normalizeText(query.trim());
    return courses.filter((course) => {
      if (area !== FILTER_ALL && course.area !== area) return false;
      if (type === "Gratuitos" && course.type !== "free") return false;
      if (type === "Até R$100" && !(course.type === "paid" && (course.price ?? Infinity) < LOW_COST_LIMIT)) return false;
      if (level !== FILTER_ALL && course.level !== level) return false;
      if (!normalizedQuery) return true;
      return normalizeText(
        [course.title, course.platform, course.area, course.description, ...course.skills].join(" "),
      ).includes(normalizedQuery);
    });
  }, [courses, area, type, level, query]);

  return (
    <div>
      <div className="max-w-[22rem]">
        <SearchInput id="course-search" label="Buscar cursos" value={query} onChange={setQuery} />
      </div>

      <div className="mt-6 flex flex-col gap-5">
        <FilterChips label="Área" options={areas} active={area} onChange={setArea} />
        <FilterChips label="Tipo" options={COURSE_TYPES} active={type} onChange={setType} />
        <FilterChips label="Nível" options={levels} active={level} onChange={setLevel} />
      </div>

      <div className="mt-8">
        <ResultBar shown={filtered.length} total={courses.length} noun="cursos" onClear={hasActiveFilters ? clearFilters : undefined} />
      </div>

      <div className="mt-6">
        <CourseGrid courses={filtered} emptyMessage="Nenhum curso encontrado para essa busca ou filtro." />
      </div>
    </div>
  );
}
