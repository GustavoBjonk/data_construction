import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Container } from "@/components/layout/Container";
import { AdSlot } from "@/components/monetization/AdSlot";
import { NewsGrid } from "@/components/news/NewsGrid";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { JsonLd } from "@/components/seo/JsonLd";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ShareLinks } from "@/components/ui/ShareLinks";
import { isEditoriallyVerified } from "@/data/news";
import { getCatalog, getNewsBySlug } from "@/lib/content";
import { newsCategoryHref } from "@/lib/news-categories";
import { formatDate } from "@/lib/format";
import { SITE, absoluteUrl } from "@/lib/site";

interface NewsPageProps {
  params: Promise<{ slug: string }>;
}

const RELATED_NEWS_COUNT = 3;

export const revalidate = 300;

export async function generateStaticParams() {
  return (await getCatalog()).news.map((item) => ({ slug: item.slug }));
}

export async function generateMetadata({ params }: NewsPageProps): Promise<Metadata> {
  const { slug } = await params;
  const item = await getNewsBySlug(slug);
  if (!item) return { title: "Notícia não encontrada" };

  const path = `/noticias/${item.slug}`;
  const verifiedAt = isEditoriallyVerified(item) ? item.verifiedAt : undefined;
  return {
    title: item.title,
    description: item.summary,
    alternates: { canonical: path },
    openGraph: {
      title: item.title,
      description: item.summary,
      type: "article",
      url: path,
      publishedTime: item.publishedAt,
      modifiedTime: verifiedAt,
      tags: item.tags,
    },
    twitter: { card: "summary_large_image", title: item.title, description: item.summary },
  };
}

function findAll<T>(ids: string[] | undefined, list: T[], key: (item: T) => string): T[] {
  return (ids ?? [])
    .map((id) => list.find((item) => key(item) === id))
    .filter((item): item is T => item !== undefined);
}

export default async function NewsPage({ params }: NewsPageProps) {
  const { slug } = await params;
  const item = await getNewsBySlug(slug);
  if (!item) notFound();

  const { news, datasets, projects, roadmaps, articles } = await getCatalog();
  const path = `/noticias/${item.slug}`;
  const verifiedAt = isEditoriallyVerified(item) ? item.verifiedAt : undefined;

  const relatedNews = news
    .filter(
      (entry) =>
        entry.id !== item.id &&
        (entry.category.some((cat) => item.category.includes(cat)) || entry.tags.some((tag) => item.tags.includes(tag))),
    )
    .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt))
    .slice(0, RELATED_NEWS_COUNT);

  // Navegação cronológica no acervo (mais recente → mais antiga).
  const chronological = [...news].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
  const position = chronological.findIndex((entry) => entry.id === item.id);
  const newer = position > 0 ? chronological[position - 1] : undefined;
  const older = position >= 0 ? chronological[position + 1] : undefined;

  const relatedGroups = [
    {
      label: "Datasets",
      links: findAll(item.related?.datasetIds, datasets, (d) => d.id).map((d) => ({
        href: `/datasets#dataset-${d.id}`,
        title: d.name,
      })),
    },
    {
      label: "Projetos",
      links: findAll(item.related?.projectIds, projects, (p) => p.id).map((p) => ({ href: "/projetos", title: p.title })),
    },
    {
      label: "Trilhas",
      links: findAll(item.related?.trackSlugs, roadmaps, (r) => r.slug).map((r) => ({
        href: `/trilhas/${r.slug}`,
        title: r.title,
      })),
    },
    {
      label: "Artigos",
      links: findAll(item.related?.articleIds, articles, (a) => a.id).map((a) => ({
        href: `/artigos/${a.id}`,
        title: a.title,
      })),
    },
  ].filter((group) => group.links.length > 0);

  return (
    <article>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "NewsArticle",
          headline: item.title,
          description: item.summary,
          datePublished: item.publishedAt,
          // Só declara modificação quando há revisão editorial registrada.
          ...(verifiedAt ? { dateModified: verifiedAt } : {}),
          inLanguage: "pt-BR",
          url: absoluteUrl(path),
          keywords: item.tags.join(", "),
          isBasedOn: item.sourceUrl,
          author: { "@type": "Organization", name: SITE.name, url: SITE.url },
          publisher: { "@type": "Organization", name: SITE.name, url: SITE.url },
        }}
      />

      <header className="border-b border-line">
        <Container className="pb-12 pt-8 sm:pt-10">
          <Breadcrumbs
            items={[
              { label: "Notícias", href: "/noticias" },
              { label: item.title, href: path },
            ]}
          />
          <div className="mt-10 max-w-4xl">
            <ul className="flex flex-wrap gap-2" aria-label="Categorias">
              {item.category.map((cat) => (
                <li key={cat}>
                  <Link href={newsCategoryHref(cat)} className="transition-opacity hover:opacity-80">
                    <Badge>{cat}</Badge>
                  </Link>
                </li>
              ))}
            </ul>
            <h1 className="mt-5 font-display text-display-3 font-semibold sm:text-[2.75rem] sm:leading-[1.05]">
              {item.title}
            </h1>
            <dl className="mt-8 flex flex-wrap gap-x-8 gap-y-3 font-mono text-[0.6875rem] uppercase tracking-[0.1em]">
              <div>
                <dt className="text-subtle">Data original</dt>
                <dd className="mt-1 text-fg">
                  <time dateTime={item.publishedAt}>{formatDate(item.publishedAt)}</time>
                </dd>
              </div>
              <div>
                <dt className="text-subtle">Fonte</dt>
                <dd className="mt-1 text-fg">{item.source}</dd>
              </div>
              <div>
                <dt className="text-subtle">Revisão editorial</dt>
                <dd className="mt-1 text-fg">
                  {verifiedAt ? (
                    <>
                      Verificada em <time dateTime={verifiedAt}>{formatDate(verifiedAt)}</time>
                    </>
                  ) : (
                    <span className="text-copper">Pendente</span>
                  )}
                </dd>
              </div>
            </dl>
          </div>
        </Container>
      </header>

      <Container className="grid gap-12 py-12 sm:py-16 lg:grid-cols-12">
        <div className="min-w-0 lg:col-span-7">
          <div className="max-w-prose">
            <p className="eyebrow">Resumo</p>
            <p className="mt-4 text-lg leading-relaxed text-fg/90 sm:text-xl">{item.summary}</p>

            <h2 className="mt-12 font-display text-2xl font-semibold tracking-tight">
              O que isso significa para a área de Dados?
            </h2>
            <p className="mt-4 text-base leading-relaxed text-muted sm:text-[1.0625rem]">{item.relevance}</p>

            <ul className="mt-10 flex flex-wrap gap-1.5" aria-label="Tags">
              {item.tags.map((tag) => (
                <li key={tag}>
                  <Badge variant="neutral">{tag}</Badge>
                </li>
              ))}
            </ul>

            <div className="mt-10">
              <ShareLinks url={absoluteUrl(path)} title={item.title} />
            </div>
          </div>
        </div>

        <aside className="lg:col-span-4 lg:col-start-9">
          <div className="space-y-6 lg:sticky lg:top-24">
            <div className="border border-accent/30 bg-surface p-6">
              <p className="eyebrow text-accent">Fonte original</p>
              <p className="mt-3 font-medium text-fg">{item.source}</p>
              <p className="mt-2 break-all font-mono text-xs text-subtle">{new URL(item.sourceUrl).hostname}</p>
              <p className="mt-4 text-sm leading-relaxed text-muted">
                {verifiedAt
                  ? "O resumo acima é editorial. Consulte a publicação original para detalhes e contexto completos."
                  : "O resumo acima ainda não passou pela revisão editorial. Confira datas, números e afirmações na publicação original."}
              </p>
              <Button href={item.sourceUrl} external withArrow className="mt-6 w-full">
                Ler na fonte original
              </Button>
            </div>

            {relatedGroups.length > 0 && (
              <div className="border border-line p-6">
                <p className="eyebrow">Aprofunde no DataConstruction</p>
                <div className="mt-4 space-y-5">
                  {relatedGroups.map((group) => (
                    <div key={group.label}>
                      <p className="font-mono text-[0.6875rem] uppercase tracking-[0.1em] text-subtle">{group.label}</p>
                      <ul className="mt-2 space-y-1">
                        {group.links.map((link) => (
                          <li key={link.href + link.title}>
                            <Link href={link.href} className="text-sm text-muted transition-colors hover:text-accent">
                              {link.title}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </aside>
      </Container>

      <Container className="pb-12">
        <AdSlot placement="news-detail" />
      </Container>

      {(newer || older) && (
        <nav aria-label="Navegação entre notícias" className="border-t border-line">
          <Container className="grid gap-px bg-line sm:grid-cols-2">
            {[
              { entry: older, label: "Anterior", align: "" },
              { entry: newer, label: "Próxima", align: "sm:text-right" },
            ].map(({ entry, label, align }) =>
              entry ? (
                <Link
                  key={label}
                  href={`/noticias/${entry.slug}`}
                  className={`group block bg-bg py-8 sm:px-6 sm:first:pl-0 sm:last:pr-0 ${align}`}
                >
                  <span className="eyebrow">{label}</span>
                  <span className="mt-2 block font-display text-lg font-medium leading-snug text-fg transition-colors group-hover:text-accent">
                    {entry.title}
                  </span>
                  <span className="mt-1 block font-mono text-[0.6875rem] uppercase tracking-[0.1em] text-subtle">
                    {formatDate(entry.publishedAt)}
                  </span>
                </Link>
              ) : (
                <span key={label} className="hidden bg-bg sm:block" />
              ),
            )}
          </Container>
        </nav>
      )}

      {relatedNews.length > 0 && (
        <section aria-labelledby="noticias-relacionadas" className="border-t border-line">
          <Container className="py-14">
            <h2 id="noticias-relacionadas" className="eyebrow text-fg">
              Notícias relacionadas
            </h2>
            <div className="mt-6">
              <NewsGrid news={relatedNews} />
            </div>
          </Container>
        </section>
      )}
    </article>
  );
}
