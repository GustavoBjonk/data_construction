import { Container } from "@/components/layout/Container";
import { PageHeader } from "@/components/ui/PageHeader";
import { formatDate } from "@/lib/format";

/** Data da última revisão dos textos legais. */
export const LEGAL_LAST_UPDATED = "2026-10-29";

export interface LegalSection {
  title: string;
  body: React.ReactNode;
}

interface LegalPageProps {
  eyebrow: string;
  title: string;
  lead: string;
  path: string;
  sections: LegalSection[];
}

export function LegalPage({ eyebrow, title, lead, path, sections }: LegalPageProps) {
  return (
    <>
      <PageHeader eyebrow={eyebrow} title={title} lead={lead} breadcrumbs={[{ label: title, href: path }]}>
        <p className="mt-6 font-mono text-[0.6875rem] uppercase tracking-[0.1em] text-subtle">
          Última atualização: {formatDate(LEGAL_LAST_UPDATED)}
        </p>
      </PageHeader>
      <Container className="py-12 sm:py-16">
        <div className="max-w-prose space-y-10">
          {sections.map((section, index) => (
            <section key={section.title} aria-labelledby={`secao-${index}`}>
              <h2 id={`secao-${index}`} className="font-display text-xl font-semibold tracking-tight text-fg">
                {section.title}
              </h2>
              <div className="mt-3 space-y-3 text-[0.9375rem] leading-relaxed text-muted [&_a]:text-accent [&_a]:underline-offset-4 hover:[&_a]:underline [&_li]:ml-5 [&_li]:list-disc">
                {section.body}
              </div>
            </section>
          ))}
        </div>
      </Container>
    </>
  );
}

/** Canal de contato configurável; sem ele, o texto deixa claro que ainda não foi definido. */
export function ContactInfo() {
  const email = process.env.NEXT_PUBLIC_CONTACT_EMAIL;
  return email ? (
    <a href={`mailto:${email}`}>{email}</a>
  ) : (
    <span>o canal de contato será publicado nesta página antes da ativação de anúncios ou contas</span>
  );
}
