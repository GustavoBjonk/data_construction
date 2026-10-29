import { ArticleReference } from "@/data/articles";

interface ArticleReferencesProps {
  references: ArticleReference[];
}

export function ArticleReferences({ references }: ArticleReferencesProps) {
  if (references.length === 0) return null;

  const sorted = [...references].sort((a, b) => a.citation.localeCompare(b.citation));

  return (
    <section aria-labelledby="referencias" className="mt-16 border-t border-line pt-10">
      <h2 id="referencias" className="eyebrow text-fg">
        Referências
      </h2>
      <p className="mt-1 text-xs text-subtle">Conforme ABNT NBR 6023.</p>
      <ol className="mt-6 space-y-4">
        {sorted.map((reference, index) => (
          <li key={reference.citation} className="grid grid-cols-[2rem_minmax(0,1fr)] text-sm leading-relaxed text-muted">
            <span className="font-mono text-xs text-subtle">{String(index + 1).padStart(2, "0")}</span>
            {reference.url ? (
              <a
                href={reference.url}
                target="_blank"
                rel="noopener noreferrer"
                className="break-words underline decoration-line-strong underline-offset-4 transition-colors hover:text-fg hover:decoration-accent"
              >
                {reference.citation}
              </a>
            ) : (
              <span>{reference.citation}</span>
            )}
          </li>
        ))}
      </ol>
    </section>
  );
}
