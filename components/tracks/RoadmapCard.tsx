import Link from "next/link";
import { Roadmap } from "@/data/roadmaps";
import { Badge } from "@/components/ui/Badge";
import { ArrowRightIcon, TrackIcon } from "@/components/ui/Icons";

interface RoadmapCardProps {
  roadmap: Roadmap;
}

export function RoadmapCard({ roadmap }: RoadmapCardProps) {
  return (
    <article className="card-interactive group flex h-full flex-col p-6">
      <div className="flex items-start justify-between gap-4">
        <TrackIcon slug={roadmap.slug} size={32} className="text-muted transition-colors group-hover:text-accent" />
        <Badge variant="outline">{roadmap.level}</Badge>
      </div>

      <h3 className="mt-6 font-display text-xl font-medium tracking-tight text-fg">
        <Link href={`/trilhas/${roadmap.slug}`} className="after:absolute after:inset-0">
          {roadmap.title}
        </Link>
      </h3>
      <p className="mt-3 flex-1 text-sm leading-relaxed text-muted">{roadmap.description}</p>

      <div className="mt-6 flex items-center justify-between gap-4 border-t border-line pt-4">
        <p className="font-mono text-[0.6875rem] uppercase tracking-[0.1em] text-subtle">
          {roadmap.steps.length} etapas · {roadmap.estimatedDuration}
        </p>
        <ArrowRightIcon size={16} className="text-muted transition-transform group-hover:translate-x-0.5 group-hover:text-accent" />
      </div>
    </article>
  );
}
