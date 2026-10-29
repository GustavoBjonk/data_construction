import type { Metadata } from "next";
import { Container } from "@/components/layout/Container";
import { CourseExplorer } from "@/components/tracks/CourseExplorer";
import { RoadmapGrid } from "@/components/tracks/RoadmapGrid";
import { PageHeader } from "@/components/ui/PageHeader";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Button } from "@/components/ui/Button";
import { COURSE_AREAS } from "@/data/courses";
import { getCatalog } from "@/lib/content";

const DESCRIPTION =
  "Escolha uma área de Dados, siga o roadmap e encontre cursos gratuitos ou de baixo custo para avançar em cada etapa.";

export const metadata: Metadata = {
  title: "Trilhas de aprendizado",
  description: DESCRIPTION,
  alternates: { canonical: "/trilhas" },
  openGraph: { title: "Trilhas de aprendizado", description: DESCRIPTION, url: "/trilhas" },
};

const COURSE_LEVELS = ["Iniciante", "Intermediário", "Avançado"];

const AREA_COMPARISON: { area: string; focus: string }[] = [
  { area: "Análise de Dados", focus: "Transformar dados em insights" },
  { area: "Ciência de Dados", focus: "Estatística + modelos + dados" },
  { area: "Engenharia de Dados", focus: "Construção de pipelines e infraestrutura" },
  { area: "Business Intelligence", focus: "Indicadores, dashboards e tomada de decisão" },
  { area: "Machine Learning", focus: "Construção de modelos preditivos" },
  { area: "SQL / Analytics", focus: "Consulta e transformação de dados" },
  { area: "Data Visualization", focus: "Comunicação visual de informações" },
];

export const revalidate = 300;

export default async function TrilhasPage() {
  const { roadmaps, courses, books } = await getCatalog();

  return (
    <>
      <PageHeader
        eyebrow={`${roadmaps.length} trilhas · ${courses.length} cursos`}
        title={
          <>
            Um caminho
            <br />
            claro<span className="text-accent">.</span>
          </>
        }
        lead="Escolha uma área, siga o roadmap e encontre cursos gratuitos ou de baixo custo para avançar em cada etapa."
        breadcrumbs={[{ label: "Trilhas", href: "/trilhas" }]}
      />

      <Container className="space-y-16 py-12 sm:space-y-20 sm:py-16">
        <section aria-labelledby="escolha-area">
          <SectionHeader id="escolha-area" title="Escolha sua área" />
          <div className="mt-6">
            <RoadmapGrid roadmaps={roadmaps} />
          </div>
        </section>

        <section aria-labelledby="comparativo" className="grid gap-8 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <SectionHeader
              id="comparativo"
              title="Ainda não sabe qual área seguir?"
              description="Uma comparação objetiva do foco de cada área. Nenhuma é “melhor” — o objetivo é entender as diferenças."
            />
          </div>
          <div className="overflow-x-auto lg:col-span-8">
            <table className="w-full border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-line-strong">
                  <th scope="col" className="eyebrow py-3 pr-4 font-normal">
                    Área
                  </th>
                  <th scope="col" className="eyebrow py-3 font-normal">
                    Principal foco
                  </th>
                </tr>
              </thead>
              <tbody>
                {AREA_COMPARISON.map((row) => (
                  <tr key={row.area} className="border-b border-line">
                    <th scope="row" className="py-4 pr-4 align-top font-medium text-fg">
                      {row.area}
                    </th>
                    <td className="py-4 align-top text-muted">{row.focus}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section aria-labelledby="cursos">
          <SectionHeader
            id="cursos"
            title="Todos os cursos"
            description="Cursos gratuitos e de baixo custo recomendados nas trilhas."
          />
          <div className="mt-8">
            <CourseExplorer courses={courses} areas={COURSE_AREAS} levels={COURSE_LEVELS} />
          </div>
        </section>

        <section aria-labelledby="livros-trilhas" className="grid gap-6 border border-line bg-surface p-6 sm:p-8 lg:grid-cols-12 lg:items-center">
          <div className="lg:col-span-8">
            <h2 id="livros-trilhas" className="eyebrow text-fg">
              Prefere estudar por livros?
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-muted sm:text-base">
              Uma seleção de {books.length} livros de Dados, IA, Python e SQL — vários com versão gratuita oficial.
            </p>
          </div>
          <div className="lg:col-span-4 lg:text-right">
            <Button href="/livros" variant="secondary" withArrow>
              Ver livros recomendados
            </Button>
          </div>
        </section>

        <section aria-labelledby="selecao" className="max-w-prose border-t border-line pt-10">
          <h2 id="selecao" className="eyebrow text-fg">
            Como selecionamos os cursos
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-muted">
            O DataConstruction prioriza cursos gratuitos e opções de baixo custo para facilitar o acesso ao aprendizado.
            Preços e disponibilidade podem mudar de acordo com a plataforma, região, promoções e condições comerciais.
          </p>
          <p className="mt-3 text-sm leading-relaxed text-muted">
            Os cursos são oferecidos por plataformas externas. O DataConstruction não é responsável pelo conteúdo, preço,
            disponibilidade ou alterações realizadas por essas plataformas.
          </p>
        </section>
      </Container>
    </>
  );
}
