import { Dataset } from "@/data/datasets";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

interface DatasetCardProps {
  dataset: Dataset;
  withAnchor?: boolean;
}

export function DatasetCard({ dataset, withAnchor = true }: DatasetCardProps) {
  const meta = [dataset.format, dataset.size].filter(Boolean).join(" · ");

  return (
    <article
      id={withAnchor ? `dataset-${dataset.id}` : undefined}
      className="card-interactive flex h-full scroll-mt-24 flex-col p-6 target:border-accent/60"
    >
      <div className="flex items-start justify-between gap-3">
        <p className="eyebrow text-accent">{dataset.category}</p>
        <Badge variant="outline">{dataset.difficulty}</Badge>
      </div>

      <h3 className="mt-4 font-display text-xl font-medium leading-snug tracking-tight text-fg">{dataset.name}</h3>
      {meta && <p className="mt-1 font-mono text-[0.6875rem] uppercase tracking-[0.1em] text-subtle">{meta}</p>}

      <p className="mt-3 text-sm leading-relaxed text-muted">{dataset.description}</p>

      {dataset.idealFor.length > 0 && (
        <div className="mt-5 flex-1 border-t border-line pt-4">
          <p className="eyebrow">Ideal para</p>
          <ul className="mt-2 space-y-1">
            {dataset.idealFor.map((item) => (
              <li key={item} className="flex gap-2 text-sm text-muted">
                <span aria-hidden="true" className="text-accent">
                  —
                </span>
                {item}
              </li>
            ))}
          </ul>
        </div>
      )}

      <ul className="mt-5 flex flex-wrap gap-1.5" aria-label="Tecnologias">
        {dataset.technologies.map((tech) => (
          <li key={tech}>
            <Badge variant="neutral">{tech}</Badge>
          </li>
        ))}
      </ul>

      <div className="mt-6 flex items-center justify-between gap-4 border-t border-line pt-4">
        <p className="truncate text-xs text-subtle">Fonte: {dataset.source}</p>
        <Button href={dataset.sourceUrl} external withArrow variant="secondary" size="sm">
          Acessar
        </Button>
      </div>
    </article>
  );
}
