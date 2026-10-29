import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Container } from "@/components/layout/Container";
import { NewsGrid } from "@/components/news/NewsGrid";
import { JsonLd } from "@/components/seo/JsonLd";
import { PageHeader } from "@/components/ui/PageHeader";
import { getNewsByDate } from "@/lib/content";
import { MIN_INDEXABLE_CATEGORY_SIZE, NEWS_CATEGORY_INFO, findNewsCategory, newsCategoryHref } from "@/lib/news-categories";
import { absoluteUrl } from "@/lib/site";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export const revalidate = 300;
// Só categorias conhecidas; qualquer outro slug é 404.
export const dynamicParams = false;

export function generateStaticParams() {
  return NEWS_CATEGORY_INFO.map((info) => ({ slug: info.slug }));
}

async function load(slug: string) {
  const info = findNewsCategory(slug);
  if (!info) return null;
  const items = (await getNewsByDate()).filter((item) => item.category.includes(info.name));
  return { info, items };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const data = await load((await params).slug);
  if (!data) return { title: "Categoria não encontrada" };
  const { info, items } = data;
  const path = newsCategoryHref(info.name);
  const title = `Notícias de ${info.name}`;

  return {
    title,
    description: info.description,
    alternates: { canonical: path },
    openGraph: { title, description: info.description, url: path },
    // Categorias com pouco conteúdo seguem navegáveis, mas fora do índice.
    robots: items.length >= MIN_INDEXABLE_CATEGORY_SIZE ? undefined : { index: false, follow: true },
  };
}

export default async function NewsCategoryPage({ params }: PageProps) {
  const data = await load((await params).slug);
  if (!data) notFound();
  const { info, items } = data;
  const path = newsCategoryHref(info.name);

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: `Notícias de ${info.name}`,
          description: info.description,
          url: absoluteUrl(path),
          mainEntity: {
            "@type": "ItemList",
            numberOfItems: items.length,
            itemListElement: items.slice(0, 30).map((item, index) => ({
              "@type": "ListItem",
              position: index + 1,
              url: absoluteUrl(`/noticias/${item.slug}`),
              name: item.title,
            })),
          },
        }}
      />
      <PageHeader
        eyebrow={`${items.length} ${items.length === 1 ? "notícia" : "notícias"}`}
        title={info.name}
        lead={info.description}
        breadcrumbs={[
          { label: "Notícias", href: "/noticias" },
          { label: info.name, href: path },
        ]}
      />
      <Container className="py-12 sm:py-16">
        <NewsGrid news={items} emptyMessage="Ainda não há notícias nesta categoria." />
        <nav aria-labelledby="outras-categorias" className="mt-16 border-t border-line pt-10">
          <h2 id="outras-categorias" className="eyebrow text-fg">
            Outras categorias
          </h2>
          <ul className="mt-4 flex flex-wrap gap-2">
            {NEWS_CATEGORY_INFO.filter((other) => other.slug !== info.slug).map((other) => (
              <li key={other.slug}>
                <Link
                  href={newsCategoryHref(other.name)}
                  className="inline-flex min-h-[40px] items-center rounded-full border border-line px-4 text-[0.8125rem] text-muted transition-colors hover:border-line-strong hover:text-fg"
                >
                  {other.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </Container>
    </>
  );
}
