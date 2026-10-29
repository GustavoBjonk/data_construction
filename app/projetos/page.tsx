import type { Metadata } from "next";
import { Container } from "@/components/layout/Container";
import { ProjectExplorer } from "@/components/projects/ProjectExplorer";
import { PageHeader } from "@/components/ui/PageHeader";
import { PROJECT_AREAS, PROJECT_DIFFICULTIES } from "@/data/projects";
import { getCatalog } from "@/lib/content";

const DESCRIPTION =
  "Ideias de projetos práticos organizadas por área e nível de dificuldade para praticar Análise de Dados, Engenharia de Dados, BI, SQL e Machine Learning.";

export const metadata: Metadata = {
  title: "Projetos práticos",
  description: DESCRIPTION,
  alternates: { canonical: "/projetos" },
  openGraph: { title: "Projetos práticos", description: DESCRIPTION, url: "/projetos" },
};

export const revalidate = 300;

export default async function ProjetosPage() {
  const { projects } = await getCatalog();

  return (
    <>
      <PageHeader
        eyebrow={`${projects.length} ideias de projeto`}
        title={
          <>
            Construa seu
            <br />
            portfólio<span className="text-accent">.</span>
          </>
        }
        lead="Ideias de projetos organizadas por área e nível de dificuldade, com objetivo, habilidades e tecnologias para colocar o estudo em prática."
        breadcrumbs={[{ label: "Projetos", href: "/projetos" }]}
      />
      <Container className="py-12 sm:py-16">
        <ProjectExplorer projects={projects} areas={PROJECT_AREAS} difficulties={PROJECT_DIFFICULTIES} />
      </Container>
    </>
  );
}
