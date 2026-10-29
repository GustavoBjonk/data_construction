import type { Metadata } from "next";
import { Container } from "@/components/layout/Container";
import { OrganizationCard } from "@/components/donations/OrganizationCard";
import { PageHeader } from "@/components/ui/PageHeader";
import { getCatalog } from "@/lib/content";

const DESCRIPTION =
  "Organizações que atuam com educação, inclusão digital e formação profissional. Apoie diretamente pelo canal oficial de cada uma.";

export const metadata: Metadata = {
  title: "Apoie a educação",
  description: DESCRIPTION,
  alternates: { canonical: "/doacoes" },
  openGraph: { title: "Apoie a educação", description: DESCRIPTION, url: "/doacoes" },
};

export const revalidate = 300;

export default async function DoacoesPage() {
  const { organizations } = await getCatalog();

  return (
    <>
      <PageHeader
        eyebrow="Apoie a educação"
        title={
          <>
            Aprender
            <br />
            transforma<span className="text-accent">.</span>
          </>
        }
        lead="Organizações e iniciativas que atuam com educação, inclusão digital, formação profissional e acesso à tecnologia. Se quiser contribuir, apoie diretamente qualquer uma delas."
        breadcrumbs={[{ label: "Doações", href: "/doacoes" }]}
      />

      <Container className="py-12 sm:py-16">
        <p role="note" className="max-w-3xl border-l-2 border-copper/60 pl-4 text-sm leading-relaxed text-muted">
          O DataConstruction não processa nem recebe essas doações. Ao clicar em uma organização, você será direcionado
          ao canal oficial disponibilizado por ela.
        </p>

        <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {organizations.map((organization) => (
            <OrganizationCard key={organization.id} organization={organization} />
          ))}
        </div>
      </Container>
    </>
  );
}
