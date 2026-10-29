import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Container } from "@/components/layout/Container";
import { ProjectGrid } from "@/components/projects/ProjectGrid";
import { RoadmapTimeline } from "@/components/tracks/RoadmapTimeline";
import { PageHeader } from "@/components/ui/PageHeader";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { StatList } from "@/components/ui/Stat";
import type { ProjectDifficulty } from "@/data/projects";
import { getCatalog, getRoadmap } from "@/lib/content";

interface RoadmapPageProps {
  params: Promise<{ slug: string }>;
}

const DIFFICULTY_ORDER: ProjectDifficulty[] = ["Iniciante", "Intermediário", "Avançado"];

export const revalidate = 300;

export async function generateStaticParams() {
  return (await getCatalog()).roadmaps.map((roadmap) => ({ slug: roadmap.slug }));
}

export async function generateMetadata({ params }: RoadmapPageProps): Promise<Metadata> {
  const { slug } = await params;
  const roadmap = await getRoadmap(slug);
  if (!roadmap) return { title: "Trilha não encontrada" };

  const path = `/trilhas/${roadmap.slug}`;
  return {
    title: `Trilha de ${roadmap.title}`,
    description: roadmap.description,
    alternates: { canonical: path },
    openGraph: { title: `Trilha de ${roadmap.title}`, description: roadmap.description, url: path },
  };
}

export default async function RoadmapPage({ params }: RoadmapPageProps) {
  const { slug } = await params;
  const roadmap = await getRoadmap(slug);
  if (!roadmap) notFound();

  const { courses, projects, roadmapProjectAreas } = await getCatalog();
  const projectArea = roadmapProjectAreas[roadmap.slug] ?? null;
  const relatedProjects = projectArea
    ? DIFFICULTY_ORDER.map((difficulty) =>
        projects.find((project) => project.area === projectArea && project.difficulty === difficulty),
      ).filter((project): project is NonNullable<typeof project> => Boolean(project))
    : [];
  const courseCount = new Set(roadmap.steps.flatMap((step) => step.courseIds)).size;

  return (
    <>
      <PageHeader
        eyebrow="Trilha de aprendizado"
        title={roadmap.title}
        lead={roadmap.description}
        breadcrumbs={[
          { label: "Trilhas", href: "/trilhas" },
          { label: roadmap.title, href: `/trilhas/${roadmap.slug}` },
        ]}
        aside={
          <StatList
            className="border-t border-line pt-6 lg:border-t-0 lg:pt-0"
            items={[
              { value: roadmap.level, label: "Nível" },
              { value: roadmap.steps.length, label: "Etapas" },
              { value: courseCount, label: "Cursos" },
            ]}
          />
        }
      >
        <p className="mt-4 font-mono text-[0.6875rem] uppercase tracking-[0.1em] text-subtle">
          Duração estimada: {roadmap.estimatedDuration}
        </p>
      </PageHeader>

      <Container className="py-12 sm:py-16">
        <section aria-labelledby="roadmap">
          <SectionHeader id="roadmap" title="Roadmap" />
          <div className="mt-10">
            <RoadmapTimeline steps={roadmap.steps} courses={courses} />
          </div>
        </section>

        <section aria-labelledby="pratica" className="mt-20 border-t border-line pt-12">
          <SectionHeader
            id="pratica"
            title="Coloque em prática"
            description="Projetos para praticar o que você estudou nesta trilha."
            link={{ href: "/projetos", label: "Todos os projetos" }}
          />
          <div className="mt-6">
            {relatedProjects.length > 0 ? (
              <ProjectGrid projects={relatedProjects} />
            ) : (
              <p className="text-sm text-muted">
                Ainda não há projetos específicos para esta área. Veja todas as ideias em{" "}
                <Link href="/projetos" className="text-accent hover:text-accent-hover">
                  Projetos
                </Link>
                .
              </p>
            )}
          </div>
        </section>
      </Container>
    </>
  );
}
