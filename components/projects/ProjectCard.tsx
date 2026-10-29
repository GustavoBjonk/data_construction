"use client";

import { useState } from "react";
import { Project } from "@/data/projects";
import { Badge } from "@/components/ui/Badge";

interface ProjectCardProps {
  project: Project;
}

export function ProjectCard({ project }: ProjectCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const detailsId = `project-details-${project.id}`;

  return (
    <article className="card-interactive flex h-full flex-col p-6">
      <div className="flex items-start justify-between gap-3">
        <p className="eyebrow text-accent">{project.area}</p>
        <Badge variant="outline">{project.difficulty}</Badge>
      </div>

      <h3 className="mt-4 font-display text-xl font-medium leading-snug tracking-tight text-fg">{project.title}</h3>
      <p className="mt-1 font-mono text-[0.6875rem] uppercase tracking-[0.1em] text-subtle">
        Tempo estimado: {project.estimatedTime}
      </p>

      <p className="mt-3 text-sm leading-relaxed text-muted">{project.description}</p>

      <div className="mt-5 flex-1 border-t border-line pt-4">
        <p className="eyebrow">Habilidades</p>
        <p className="mt-2 text-sm text-muted">{project.skills.join(" · ")}</p>
      </div>

      <ul className="mt-5 flex flex-wrap gap-1.5" aria-label="Tecnologias">
        {project.technologies.map((tech) => (
          <li key={tech}>
            <Badge variant="neutral">{tech}</Badge>
          </li>
        ))}
      </ul>

      {/* Mantido no DOM para a transição de altura; `inert` o retira da navegação quando fechado. */}
      <div
        id={detailsId}
        inert={!isExpanded}
        className={`grid transition-[grid-template-rows,opacity] duration-300 ease-out-expo ${
          isExpanded ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        }`}
      >
        <div className="overflow-hidden">
          <div className="mt-5 border-t border-line pt-4">
            <p className="eyebrow">Objetivo</p>
            <p className="mt-2 text-sm leading-relaxed text-muted">{project.objective}</p>
          </div>
        </div>
      </div>

      <button
        type="button"
        aria-expanded={isExpanded}
        aria-controls={detailsId}
        onClick={() => setIsExpanded((expanded) => !expanded)}
        className="mt-6 min-h-[44px] w-full rounded-full border border-line-strong px-5 text-sm font-medium text-fg transition-colors hover:border-fg/40 hover:bg-fg/5"
      >
        {isExpanded ? "Ocultar objetivo" : "Ver objetivo do projeto"}
      </button>
    </article>
  );
}
