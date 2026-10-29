import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/layout/Container";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { ArrowRightIcon, ArrowUpRightIcon, SearchIcon } from "@/components/ui/Icons";
import { PageHeader } from "@/components/ui/PageHeader";
import { SEARCH_MIN_LENGTH, searchContent, type SearchResult } from "@/lib/content";

export const metadata: Metadata = {
  title: "Buscar",
  description: "Busque artigos, notícias, datasets, trilhas, projetos e cursos no DataConstruction.",
  alternates: { canonical: "/busca" },
  // Páginas de resultado não devem ser indexadas.
  robots: { index: false, follow: true },
};

const SUGGESTIONS = ["SQL", "Python", "Power BI", "Machine Learning", "dbt", "LLM"];

interface SearchPageProps {
  searchParams: Promise<{ q?: string | string[] }>;
}

function ResultItem({ result }: { result: SearchResult }) {
  const Arrow = result.external ? ArrowUpRightIcon : ArrowRightIcon;
  const content = (
    <>
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline">{result.type}</Badge>
          {result.meta && <span className="truncate text-xs text-subtle">{result.meta}</span>}
        </div>
        <h2 className="mt-2 text-base font-medium text-fg transition-colors group-hover:text-accent">{result.title}</h2>
        <p className="mt-1 line-clamp-2 text-sm text-muted">{result.description}</p>
      </div>
      <Arrow size={16} className="mt-1 shrink-0 text-muted group-hover:text-accent" />
    </>
  );
  const className = "group flex items-start justify-between gap-6 border-b border-line py-5";

  return (
    <li>
      {result.external ? (
        <a href={result.href} target="_blank" rel="noopener noreferrer" className={className}>
          {content}
          <span className="sr-only"> (abre em nova aba)</span>
        </a>
      ) : (
        <Link href={result.href} className={className}>
          {content}
        </Link>
      )}
    </li>
  );
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { q } = await searchParams;
  const query = (Array.isArray(q) ? q[0] : q)?.trim() ?? "";
  const results = await searchContent(query);
  const hasQuery = query.length >= SEARCH_MIN_LENGTH;

  return (
    <>
      <PageHeader eyebrow="Busca" title="Buscar no site" breadcrumbs={[{ label: "Busca", href: "/busca" }]}>
        {/* Formulário GET: funciona sem JavaScript e gera URL compartilhável. */}
        <form action="/busca" role="search" className="mt-8 flex max-w-2xl gap-3">
          <label htmlFor="global-search" className="sr-only">
            Termo de busca
          </label>
          <div className="relative flex-1">
            <SearchIcon className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-subtle" />
            <input
              id="global-search"
              name="q"
              type="search"
              defaultValue={query}
              placeholder="Ex.: window functions, dbt, Titanic..."
              autoComplete="off"
              autoFocus
              className="min-h-[52px] w-full rounded-full border border-line-strong bg-surface pl-12 pr-5 text-base text-fg placeholder:text-subtle focus:border-accent/60 focus:outline-none focus:ring-1 focus:ring-accent/60"
            />
          </div>
          <button
            type="submit"
            className="min-h-[52px] rounded-full bg-fg px-6 text-sm font-medium text-bg transition-colors hover:bg-white"
          >
            Buscar
          </button>
        </form>
      </PageHeader>

      <Container className="py-10 sm:py-14">
        {!hasQuery ? (
          <div>
            <p className="eyebrow">Sugestões</p>
            <ul className="mt-4 flex flex-wrap gap-2">
              {SUGGESTIONS.map((term) => (
                <li key={term}>
                  <Link
                    href={`/busca?q=${encodeURIComponent(term)}`}
                    className="inline-flex min-h-[40px] items-center rounded-full border border-line px-4 text-[0.8125rem] text-muted transition-colors hover:border-line-strong hover:text-fg"
                  >
                    {term}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ) : results.length === 0 ? (
          <EmptyState
            title={`Nenhum resultado para “${query}”.`}
            description="Verifique a ortografia ou tente um termo mais geral."
          />
        ) : (
          <div className="max-w-4xl">
            <p className="font-mono text-xs text-muted" role="status">
              {results.length} {results.length === 1 ? "resultado" : "resultados"} para “{query}”
            </p>
            <ul className="mt-4 border-t border-line">
              {results.map((result) => (
                <ResultItem key={`${result.type}-${result.href}-${result.title}`} result={result} />
              ))}
            </ul>
          </div>
        )}
      </Container>
    </>
  );
}
