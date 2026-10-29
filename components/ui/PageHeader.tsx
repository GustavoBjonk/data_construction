import { Container } from "@/components/layout/Container";
import { Breadcrumbs, type Crumb } from "@/components/seo/Breadcrumbs";

interface PageHeaderProps {
  eyebrow: string;
  title: React.ReactNode;
  lead?: React.ReactNode;
  breadcrumbs?: Crumb[];
  /** Conteúdo à direita no desktop (ex.: indicadores). */
  aside?: React.ReactNode;
  children?: React.ReactNode;
}

/** Abertura padrão das páginas internas. */
export function PageHeader({ eyebrow, title, lead, breadcrumbs, aside, children }: PageHeaderProps) {
  return (
    <header className="relative overflow-hidden border-b border-line">
      <div
        aria-hidden="true"
        className="bg-dot-grid absolute inset-0 opacity-40 [mask-image:linear-gradient(to_bottom,black,transparent_85%)]"
      />
      <Container className="relative pb-12 pt-8 sm:pb-16 sm:pt-10">
        {breadcrumbs && <Breadcrumbs items={breadcrumbs} />}
        <div className="mt-10 grid gap-10 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-8">
            <p className="eyebrow">{eyebrow}</p>
            <h1 className="mt-4 font-display text-display-2 font-semibold uppercase">{title}</h1>
            {lead && <p className="mt-6 max-w-2xl text-base leading-relaxed text-muted sm:text-lg">{lead}</p>}
            {children}
          </div>
          {aside && <div className="lg:col-span-4">{aside}</div>}
        </div>
      </Container>
    </header>
  );
}
