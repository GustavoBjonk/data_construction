import Link from "next/link";
import { Container } from "@/components/layout/Container";
import { Hero } from "@/components/home/Hero";
import { AdSlot } from "@/components/monetization/AdSlot";
import { ArticleCard } from "@/components/articles/ArticleCard";
import { NewsCard } from "@/components/news/NewsCard";
import { NewsListItem } from "@/components/news/NewsListItem";
import { TrackList } from "@/components/tracks/TrackList";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { ArrowUpRightIcon } from "@/components/ui/Icons";
import { getArticlesByDate, getCatalog, getContentStats, getNewsByDate, getNewsReviewStats, pickByIds } from "@/lib/content";
import { formatDate } from "@/lib/format";

export const revalidate = 300;

/** Trilhas exibidas na home (ordem editorial). */
const HOME_TRACK_SLUGS = ["analise-de-dados", "ciencia-de-dados", "engenharia-de-dados", "machine-learning"];
const HOME_DATASET_IDS = ["titanic", "nyc-taxi-trips", "credit-card-fraud", "superstore"];
const HOME_PROJECT_COUNT = 4;

export default async function HomePage() {
  const { roadmaps, projects, datasets, books } = await getCatalog();
  const stats = await getContentStats();
  const featuredArticles = (await getArticlesByDate()).slice(0, 3);
  const [leadNews, ...otherNews] = (await getNewsByDate()).slice(0, 6);
  const review = await getNewsReviewStats();
  const homeTracks = HOME_TRACK_SLUGS.map((slug) => roadmaps.find((r) => r.slug === slug)).filter(
    (r): r is NonNullable<typeof r> => Boolean(r),
  );
  const homeDatasets = pickByIds(datasets, HOME_DATASET_IDS);
  // Primeiro projeto de cada área, para mostrar a variedade do catálogo.
  const homeProjects = projects
    .filter((project, index) => projects.findIndex((p) => p.area === project.area) === index)
    .slice(0, HOME_PROJECT_COUNT);

  return (
    <>
      <Hero
        stats={[
          { value: stats.articles, label: "Artigos" },
          { value: stats.news, label: "Notícias" },
          { value: stats.datasets, label: "Datasets" },
          { value: stats.tracks, label: "Trilhas" },
          { value: stats.projects, label: "Projetos" },
        ]}
      />

      {/* Conteúdos em destaque + trilhas */}
      <section id="conteudos" aria-label="Conteúdos e trilhas" className="border-b border-line">
        <Container className="grid gap-12 py-16 sm:py-20 lg:grid-cols-12 lg:gap-0">
          <div className="lg:col-span-8 lg:pr-10">
            <SectionHeader title="Conteúdos em destaque" link={{ href: "/artigos", label: "Ver todos" }} />
            <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {featuredArticles.map((article, index) => (
                <Reveal key={article.id} delay={index * 90}>
                  <ArticleCard article={article} index={String(index + 1).padStart(2, "0")} />
                </Reveal>
              ))}
            </div>
          </div>

          <div className="lg:col-span-4 lg:border-l lg:border-line lg:pl-10">
            <SectionHeader title="Trilhas de aprendizado" link={{ href: "/trilhas", label: "Ver todas" }} />
            <Reveal className="mt-6">
              <TrackList roadmaps={homeTracks} />
            </Reveal>
          </div>
        </Container>
      </section>

      {/* Notícias */}
      {leadNews && (
        <section aria-labelledby="home-noticias" className="border-b border-line">
          <Container className="py-16 sm:py-20">
            <SectionHeader
              id="home-noticias"
              title="Notícias"
              description={`Acervo com fonte original citada em cada notícia. Revisão editorial: ${review.verified} de ${review.total}${
                review.lastVerifiedAt ? ` (última em ${formatDate(review.lastVerifiedAt)})` : ""
              }.`}
              link={{ href: "/noticias", label: "Todas as notícias" }}
            />
            <div className="mt-8 grid gap-8 lg:grid-cols-12">
              <Reveal className="lg:col-span-5 lg:self-start">
                <NewsCard news={leadNews} featured />
              </Reveal>
              <Reveal className="lg:col-span-7" delay={100}>
                <ul>
                  {otherNews.map((item) => (
                    <NewsListItem key={item.id} news={item} />
                  ))}
                </ul>
              </Reveal>
            </div>
          </Container>
        </section>
      )}

      <Container className="py-10">
        <AdSlot placement="home-mid" />
      </Container>

      {/* Datasets + Projetos */}
      <section aria-label="Datasets e projetos" className="border-b border-line">
        <Container className="grid gap-12 py-16 sm:py-20 lg:grid-cols-2 lg:gap-0">
          <div className="lg:pr-10">
            <SectionHeader title="Datasets em destaque" link={{ href: "/datasets", label: "Ver datasets" }} />
            <Reveal className="mt-6">
              <ul className="border-t border-line">
                {homeDatasets.map((dataset) => (
                  <li key={dataset.id} className="group relative flex items-start justify-between gap-4 border-b border-line py-4">
                    <div className="min-w-0">
                      <h3 className="text-[0.9375rem] font-medium text-fg transition-colors group-hover:text-accent">
                        <a href={dataset.sourceUrl} target="_blank" rel="noopener noreferrer" className="after:absolute after:inset-0">
                          {dataset.name}
                          <span className="sr-only"> (abre em nova aba)</span>
                        </a>
                      </h3>
                      <p className="mt-1 line-clamp-1 text-sm text-muted">{dataset.description}</p>
                    </div>
                    <div className="flex shrink-0 items-center gap-3">
                      <Badge variant="outline" className="hidden sm:inline-flex">
                        {dataset.difficulty}
                      </Badge>
                      <ArrowUpRightIcon size={14} className="text-muted group-hover:text-accent" />
                    </div>
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>

          <div className="lg:border-l lg:border-line lg:pl-10">
            <SectionHeader title="Projetos selecionados" link={{ href: "/projetos", label: "Ver projetos" }} />
            <Reveal className="mt-6">
              <ul className="border-t border-line">
                {homeProjects.map((project) => (
                  <li key={project.id} className="flex items-start justify-between gap-4 border-b border-line py-4">
                    <div className="min-w-0">
                      <h3 className="text-[0.9375rem] font-medium text-fg">{project.title}</h3>
                      <p className="mt-1 font-mono text-[0.6875rem] uppercase tracking-[0.08em] text-subtle">
                        {project.area} · {project.estimatedTime}
                      </p>
                    </div>
                    <Badge variant="outline" className="shrink-0">
                      {project.difficulty}
                    </Badge>
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>
        </Container>
      </section>

      {/* Livros + apoio */}
      <section aria-label="Participe">
        <Container className="grid gap-5 py-16 sm:py-20 lg:grid-cols-2">
          <Reveal>
            <div className="relative h-full overflow-hidden border border-line bg-surface p-8 sm:p-10">
              <div aria-hidden="true" className="bg-dot-grid absolute inset-0 opacity-50 [mask-image:linear-gradient(to_left,black,transparent_70%)]" />
              <div className="relative">
                <p className="eyebrow">Livros recomendados</p>
                <h2 className="mt-5 font-display text-display-3 font-medium">Estude pelos livros que valem o tempo.</h2>
                <p className="mt-4 max-w-md text-sm leading-relaxed text-muted sm:text-base">
                  {books.length} livros de Dados, IA, Python e SQL, com nível e idioma — vários com versão gratuita oficial.
                </p>
                <div className="mt-8">
                  <Button href="/livros" variant="secondary" withArrow>
                    Ver livros
                  </Button>
                </div>
              </div>
            </div>
          </Reveal>
          <Reveal delay={100}>
            <div className="h-full border border-line p-8 sm:p-10">
              <p className="eyebrow">Apoie a educação</p>
              <h2 className="mt-5 font-display text-display-3 font-medium">Aprender também é uma forma de transformar.</h2>
              <p className="mt-4 max-w-md text-sm leading-relaxed text-muted sm:text-base">
                Conheça organizações que atuam com educação, inclusão digital e formação profissional — e apoie
                diretamente pelo canal oficial de cada uma.
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <Button href="/doacoes" withArrow>
                  Ver organizações
                </Button>
                <Link
                  href="/sobre"
                  className="inline-flex min-h-[44px] items-center text-sm text-muted transition-colors hover:text-fg"
                >
                  Sobre o projeto
                </Link>
              </div>
            </div>
          </Reveal>
        </Container>
      </section>
    </>
  );
}
