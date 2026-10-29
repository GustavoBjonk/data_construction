import Link from "next/link";
import { Roadmap } from "@/data/roadmaps";
import { ArrowRightIcon, TrackIcon } from "@/components/ui/Icons";

/** Lista compacta de trilhas (coluna lateral da home). */
export function TrackList({ roadmaps }: { roadmaps: Roadmap[] }) {
  return (
    <ul className="flex flex-col gap-3">
      {roadmaps.map((roadmap) => (
        <li key={roadmap.id}>
          <Link
            href={`/trilhas/${roadmap.slug}`}
            className="card-interactive group flex min-h-[76px] items-center gap-4 px-4 py-3"
          >
            <TrackIcon slug={roadmap.slug} className="shrink-0 text-muted transition-colors group-hover:text-accent" />
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-medium text-fg">{roadmap.title}</span>
              <span className="mt-0.5 block font-mono text-[0.6875rem] uppercase tracking-[0.08em] text-subtle">
                {roadmap.level} · {roadmap.steps.length} etapas
              </span>
            </span>
            <ArrowRightIcon
              size={16}
              className="shrink-0 text-muted transition-transform group-hover:translate-x-0.5 group-hover:text-fg"
            />
          </Link>
        </li>
      ))}
    </ul>
  );
}
