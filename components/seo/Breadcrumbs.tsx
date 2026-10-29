import Link from "next/link";
import { absoluteUrl } from "@/lib/site";
import { JsonLd } from "./JsonLd";

export interface Crumb {
  label: string;
  href: string;
}

/** Trilha de navegação visível + BreadcrumbList correspondente. */
export function Breadcrumbs({ items }: { items: Crumb[] }) {
  const all: Crumb[] = [{ label: "Início", href: "/" }, ...items];

  return (
    <>
      <nav aria-label="Você está em">
        <ol className="flex flex-wrap items-center gap-x-2 gap-y-1 font-mono text-[0.6875rem] uppercase tracking-[0.12em] text-subtle">
          {all.map((crumb, index) => {
            const isLast = index === all.length - 1;
            return (
              <li key={crumb.href} className="flex min-w-0 items-center gap-2">
                {isLast ? (
                  <span aria-current="page" className="truncate text-muted">
                    {crumb.label}
                  </span>
                ) : (
                  <>
                    <Link href={crumb.href} className="inline-flex min-h-[24px] items-center transition-colors hover:text-fg">
                      {crumb.label}
                    </Link>
                    <span aria-hidden="true">/</span>
                  </>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: all.map((crumb, index) => ({
            "@type": "ListItem",
            position: index + 1,
            name: crumb.label,
            item: absoluteUrl(crumb.href),
          })),
        }}
      />
    </>
  );
}
