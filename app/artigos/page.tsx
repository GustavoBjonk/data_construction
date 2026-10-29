import type { Metadata } from "next";
import { Container } from "@/components/layout/Container";
import { ArticleExplorer } from "@/components/articles/ArticleExplorer";
import { PageHeader } from "@/components/ui/PageHeader";
import { ARTICLE_CATEGORIES } from "@/data/articles";
import { getArticlesByDate } from "@/lib/content";

const DESCRIPTION =
  "Artigos técnicos do DataConstruction sobre SQL, Python e Power BI, com exemplos comentados e referências.";

export const metadata: Metadata = {
  title: "Artigos",
  description: DESCRIPTION,
  alternates: { canonical: "/artigos" },
  openGraph: { title: "Artigos", description: DESCRIPTION, url: "/artigos" },
};

export const revalidate = 300;

export default async function ArtigosPage() {
  const articles = await getArticlesByDate();
  // Só categorias com artigo publicado viram filtro (rascunhos não deixam chips vazios).
  const categories = ARTICLE_CATEGORIES.filter((category) => articles.some((article) => article.category === category));

  return (
    <>
      <PageHeader
        eyebrow="Artigos técnicos"
        title={
          <>
            Explicado
            <br />
            na prática<span className="text-accent">.</span>
          </>
        }
        lead="Conteúdos técnicos sobre dados, engenharia e tecnologia — direto ao ponto, com exemplos e fontes."
        breadcrumbs={[{ label: "Artigos", href: "/artigos" }]}
      />
      <Container className="py-12 sm:py-16">
        <ArticleExplorer articles={articles} categories={categories} />
      </Container>
    </>
  );
}
