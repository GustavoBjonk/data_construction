import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/layout/Container";
import { AdSlot } from "@/components/monetization/AdSlot";
import { NewsCard } from "@/components/news/NewsCard";
import { NewsExplorer } from "@/components/news/NewsExplorer";
import { NewsTimeline } from "@/components/news/NewsTimeline";
import { PageHeader } from "@/components/ui/PageHeader";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { NEWS_CATEGORIES, toNewsSummary } from "@/data/news";
import { getNewsByDate, getNewsReviewStats } from "@/lib/content";
import { formatDate } from "@/lib/format";
import { NEWS_CATEGORY_INFO, newsCategoryHref } from "@/lib/news-categories";

const DESCRIPTION =
  "Acontecimentos que transformaram dados, analytics, inteligência artificial e tecnologia, com resumo editorial e link para a fonte original.";

export const metadata: Metadata = {
  title: "Notícias sobre Dados e IA",
  description: DESCRIPTION,
  alternates: { canonical: "/noticias" },
  openGraph: { title: "Notícias sobre Dados e IA", description: DESCRIPTION, url: "/noticias" },
};

const FEATURED_COUNT = 3;

export const revalidate = 300;

export default async function NoticiasPage() {
  const news = await getNewsByDate();
  const years = [...new Set(news.map((item) => item.year))].sort((a, b) => b - a);
  const featured = news.filter((item) => item.featured).slice(0, FEATURED_COUNT);
  const [mainFeatured, ...otherFeatured] = featured;
  const review = await getNewsReviewStats();

  return (
    <>
      <PageHeader
        eyebrow="Notícias"
        title={
          <>
            O que move
            <br />
            o mundo dos dados<span className="text-accent">.</span>
          </>
        }
        lead="Acontecimentos relevantes para quem estuda ou trabalha com Dados e IA. Cada notícia traz resumo próprio, o que muda na prática e o link para a fonte original."
        breadcrumbs={[{ label: "Notícias", href: "/noticias" }]}
        aside={
          <dl className="grid grid-cols-2 gap-6 border-t border-line pt-6 lg:border-l lg:border-t-0 lg:pl-8 lg:pt-0">
            <div>
              <dt className="eyebrow">No acervo</dt>
              <dd className="mt-1 font-display text-2xl tabular-nums text-fg">{news.length}</dd>
            </div>
            <div>
              <dt className="eyebrow">Revisão editorial</dt>
              <dd className="mt-1 font-display text-2xl tabular-nums text-fg">
                {review.verified} <span className="text-muted">de {review.total}</span>
              </dd>
              {review.lastVerifiedAt && (
                <dd className="mt-1 text-xs text-subtle">Última em {formatDate(review.lastVerifiedAt)}</dd>
              )}
            </div>
          </dl>
        }
      />

      {mainFeatured && (
        <section aria-labelledby="destaques">
          <Container className="py-12 sm:py-16">
            <SectionHeader id="destaques" title="Destaques" />
            <div className="mt-6 grid gap-5 lg:grid-cols-12">
              <div className="lg:col-span-7">
                <NewsCard news={mainFeatured} featured />
              </div>
              <div className="grid gap-5 lg:col-span-5">
                {otherFeatured.map((item) => (
                  <NewsCard key={item.id} news={item} />
                ))}
              </div>
            </div>
          </Container>
        </section>
      )}

      <Container className="pb-12">
        <AdSlot placement="news-list" />
      </Container>

      <section aria-labelledby="categorias" className="border-t border-line">
        <Container className="py-12 sm:py-16">
          <SectionHeader id="categorias" title="Categorias" link={{ href: "/noticias/feed.xml", label: "Assinar via RSS" }} />
          <ul className="mt-6 grid grid-cols-1 border-t border-line sm:grid-cols-2 lg:grid-cols-4">
            {NEWS_CATEGORY_INFO.map((info) => {
              const count = news.filter((item) => item.category.includes(info.name)).length;
              return (
                <li key={info.slug} className="border-b border-line">
                  <Link
                    href={newsCategoryHref(info.name)}
                    className="group flex min-h-[56px] items-center justify-between gap-4 py-3 pr-4 transition-colors hover:text-accent"
                  >
                    <span className="text-sm text-fg group-hover:text-accent">{info.name}</span>
                    <span className="font-mono text-xs tabular-nums text-subtle">{count}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </Container>
      </section>

      <section aria-labelledby="linha-do-tempo" className="border-t border-line">
        <Container className="py-12 sm:py-16">
          <SectionHeader
            id="linha-do-tempo"
            title="Linha do tempo"
            description={`Um recorte de ${years[years.length - 1]} a ${years[0]} com acontecimentos marcantes de cada ano.`}
          />
          <div className="mt-6">
            <NewsTimeline news={news} years={years} />
          </div>
        </Container>
      </section>

      <section aria-labelledby="todas" className="border-t border-line">
        <Container className="py-12 sm:py-16">
          <SectionHeader id="todas" title="Todas as notícias" />
          <div className="mt-8">
            <NewsExplorer news={news.map(toNewsSummary)} years={years} categories={NEWS_CATEGORIES} />
          </div>
        </Container>
      </section>
    </>
  );
}
