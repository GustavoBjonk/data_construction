import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Container } from "@/components/layout/Container";
import { ArticleContent, getTableOfContents } from "@/components/articles/ArticleContent";
import { AdSlot } from "@/components/monetization/AdSlot";
import { ArticleReferences } from "@/components/articles/ArticleReferences";
import { ArticleGrid } from "@/components/articles/ArticleGrid";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { JsonLd } from "@/components/seo/JsonLd";
import { DataArt } from "@/components/ui/DataArt";
import { ArrowLeftIcon } from "@/components/ui/Icons";
import { ShareLinks } from "@/components/ui/ShareLinks";
import { getArticle, getArticlesByDate } from "@/lib/content";
import { formatDate, formatReadingTime } from "@/lib/format";
import { SITE, absoluteUrl } from "@/lib/site";

interface ArticlePageProps {
  params: Promise<{ slug: string }>;
}

// Slugs novos (criados no banco) são renderizados sob demanda e revalidados.
export const revalidate = 300;

export async function generateStaticParams() {
  return (await getArticlesByDate()).map((article) => ({ slug: article.id }));
}

export async function generateMetadata({ params }: ArticlePageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticle(slug);
  if (!article) return { title: "Artigo não encontrado" };

  const path = `/artigos/${article.id}`;
  return {
    title: article.title,
    description: article.description,
    keywords: article.tags,
    alternates: { canonical: path },
    authors: [{ name: article.author }],
    openGraph: {
      title: article.title,
      description: article.description,
      type: "article",
      url: path,
      publishedTime: article.date,
      authors: [article.author],
      section: article.category,
    },
    twitter: { card: "summary_large_image", title: article.title, description: article.description },
  };
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { slug } = await params;
  const article = await getArticle(slug);
  if (!article) notFound();

  const path = `/artigos/${article.id}`;
  const toc = getTableOfContents(article.content);
  const relatedArticles = (await getArticlesByDate())
    .filter((item) => item.id !== article.id)
    .sort((a, b) => Number(b.category === article.category) - Number(a.category === article.category))
    .slice(0, 3);

  return (
    <article>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Article",
          headline: article.title,
          description: article.description,
          datePublished: article.date,
          inLanguage: "pt-BR",
          articleSection: article.category,
          ...(article.tags?.length ? { keywords: article.tags.join(", ") } : {}),
          url: absoluteUrl(path),
          author: { "@type": "Person", name: article.author },
          publisher: { "@type": "Organization", name: SITE.name, url: SITE.url },
          citation: article.references.map((reference) => reference.url ?? reference.citation),
        }}
      />

      <header className="border-b border-line">
        <Container className="pb-12 pt-8 sm:pt-10">
          <Breadcrumbs
            items={[
              { label: "Artigos", href: "/artigos" },
              { label: article.title, href: path },
            ]}
          />
          <div className="mt-10 grid gap-10 lg:grid-cols-12">
            <div className="lg:col-span-8">
              <p className="eyebrow text-accent">{article.category}</p>
              <h1 className="mt-4 font-display text-display-3 font-semibold sm:text-[2.75rem] sm:leading-[1.05]">
                {article.title}
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted">{article.description}</p>
              <dl className="mt-8 flex flex-wrap gap-x-8 gap-y-3 font-mono text-[0.6875rem] uppercase tracking-[0.1em]">
                <div>
                  <dt className="text-subtle">Autor</dt>
                  <dd className="mt-1 text-fg">{article.author}</dd>
                </div>
                <div>
                  <dt className="text-subtle">Publicado</dt>
                  <dd className="mt-1 text-fg">
                    <time dateTime={article.date}>{formatDate(article.date)}</time>
                  </dd>
                </div>
                <div>
                  <dt className="text-subtle">Leitura</dt>
                  <dd className="mt-1 text-fg">{formatReadingTime(article.readingTime)}</dd>
                </div>
              </dl>
            </div>
            <div className="hidden lg:col-span-4 lg:block">
              <DataArt seed={article.id} className="border border-line" />
            </div>
          </div>
        </Container>
      </header>

      <Container className="grid gap-12 py-12 sm:py-16 lg:grid-cols-12">
        <aside className="lg:col-span-3">
          <div className="space-y-10 lg:sticky lg:top-24">
            {toc.length > 0 && (
              <nav aria-labelledby="sumario">
                <p id="sumario" className="eyebrow">
                  Sumário
                </p>
                <ol className="mt-3 space-y-1 border-l border-line">
                  {toc.map((entry) => (
                    <li key={entry.id}>
                      <a
                        href={`#${entry.id}`}
                        className="-ml-px block border-l border-transparent py-1.5 pl-4 text-sm text-muted transition-colors hover:border-accent hover:text-fg"
                      >
                        {entry.title}
                      </a>
                    </li>
                  ))}
                </ol>
              </nav>
            )}
            <div className="hidden lg:block">
              <ShareLinks url={absoluteUrl(path)} title={article.title} />
            </div>
          </div>
        </aside>

        <div className="min-w-0 lg:col-span-8 lg:col-start-5">
          <div className="max-w-prose">
            <ArticleContent content={article.content} inlineSlot={<AdSlot placement="article-inline" className="my-10" />} />
            <ArticleReferences references={article.references} />

            <div className="mt-12 border border-line bg-surface p-6">
              <p className="eyebrow">Sobre quem escreveu</p>
              <p className="mt-3 font-medium text-fg">{article.author}</p>
              <p className="mt-1 text-sm leading-relaxed text-muted">{article.authorBio}</p>
            </div>

            <div className="mt-10 lg:hidden">
              <ShareLinks url={absoluteUrl(path)} title={article.title} />
            </div>
          </div>
        </div>
      </Container>

      {relatedArticles.length > 0 && (
        <section aria-labelledby="relacionados" className="border-t border-line">
          <Container className="py-14">
            <h2 id="relacionados" className="eyebrow text-fg">
              Continue lendo
            </h2>
            <div className="mt-6">
              <ArticleGrid articles={relatedArticles} />
            </div>
            <Link
              href="/artigos"
              className="mt-10 inline-flex min-h-[44px] items-center gap-2 text-sm text-muted transition-colors hover:text-fg"
            >
              <ArrowLeftIcon size={14} />
              Todos os artigos
            </Link>
          </Container>
        </section>
      )}
    </article>
  );
}
