import { Project } from "@/data/projects";
import { EmptyState } from "@/components/ui/EmptyState";
import { ProjectCard } from "./ProjectCard";

interface ProjectGridProps {
  projects: Project[];
  emptyMessage?: string;
}

export function ProjectGrid({ projects, emptyMessage = "Nenhum projeto encontrado." }: ProjectGridProps) {
  if (projects.length === 0) {
    return <EmptyState title={emptyMessage} description="Tente outro termo ou remova os filtros." />;
  }

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {projects.map((project) => (
        <ProjectCard key={project.id} project={project} />
      ))}
    </div>
  );
}
