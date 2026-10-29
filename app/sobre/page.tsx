import type { Metadata } from "next";
import { Container } from "@/components/layout/Container";
import { Button } from "@/components/ui/Button";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatList } from "@/components/ui/Stat";
import { getContentStats } from "@/lib/content";

const DESCRIPTION =
  "Conheça o DataConstruction: uma plataforma aberta de conteúdo e aprendizado sobre Dados, Inteligência Artificial e tecnologia.";

export const metadata: Metadata = {
  title: "Sobre",
  description: DESCRIPTION,
  alternates: { canonical: "/sobre" },
  openGraph: { title: "Sobre o DataConstruction", description: DESCRIPTION, url: "/sobre" },
};

const SECTIONS: { title: string; body: React.ReactNode }[] = [
  {
    title: "O que é",
    body: (
      <p>
        O DataConstruction é uma plataforma de conteúdo e aprendizado voltada para tecnologia e dados, com artigos
        técnicos, notícias com fonte citada, datasets, trilhas de estudo e ideias de projetos práticos.
      </p>
    ),
  },
  {
    title: "Para quem é",
    body: (
      <ul className="space-y-1">
        {[
          "Estudantes",
          "Iniciantes na área de Dados",
          "Pessoas migrando de carreira para Dados",
          "Desenvolvedores",
          "Profissionais que desejam praticar",
        ].map((item) => (
          <li key={item} className="flex gap-3">
            <span aria-hidden="true" className="text-accent">
              —
            </span>
            {item}
          </li>
        ))}
      </ul>
    ),
  },
  {
    title: "Nossa proposta",
    body: (
      <p>
        Tornar o aprendizado de Dados e Tecnologia mais acessível, prático e organizado — sem enrolação, do jeito que a
        gente gostaria de ter aprendido.
      </p>
    ),
  },
  {
    title: "Compromisso editorial",
    body: (
      <p>
        Toda notícia cita a fonte original e a data em que foi verificada. Não publicamos métricas, avaliações ou
        depoimentos que não possam ser comprovados.
      </p>
    ),
  },
];

export const revalidate = 300;

export default async function SobrePage() {
  const stats = await getContentStats();

  return (
    <>
      <PageHeader
        eyebrow="Sobre o projeto"
        title={
          <>
            Conhecimento
            <br />
            aberto<span className="text-accent">.</span>
          </>
        }
        lead="Uma plataforma para aprender, construir e compartilhar conhecimento sobre Dados, Inteligência Artificial e tecnologia."
        breadcrumbs={[{ label: "Sobre", href: "/sobre" }]}
      />

      <Container className="py-12 sm:py-16">
        <StatList
          className="border-b border-line pb-10"
          items={[
            { value: stats.articles, label: "Artigos" },
            { value: stats.news, label: "Notícias" },
            { value: stats.datasets, label: "Datasets" },
            { value: stats.tracks, label: "Trilhas" },
            { value: stats.courses, label: "Cursos" },
          ]}
        />

        <dl className="divide-y divide-line">
          {SECTIONS.map((section, index) => (
            <div key={section.title} className="grid gap-4 py-10 lg:grid-cols-12">
              <dt className="lg:col-span-4">
                <span className="font-mono text-xs text-subtle">{String(index + 1).padStart(2, "0")}</span>
                <span className="mt-2 block font-display text-2xl font-medium tracking-tight text-fg">
                  {section.title}
                </span>
              </dt>
              <dd className="max-w-prose text-base leading-relaxed text-muted sm:text-lg lg:col-span-7 lg:col-start-6">
                {section.body}
              </dd>
            </div>
          ))}
        </dl>

        <div className="mt-6 flex flex-wrap gap-4 border-t border-line pt-10">
          <Button href="/trilhas" withArrow>
            Começar por uma trilha
          </Button>
          <Button href="/doacoes" variant="secondary">
            Apoie a educação
          </Button>
        </div>
      </Container>
    </>
  );
}
