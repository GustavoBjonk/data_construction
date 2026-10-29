import type { Metadata } from "next";
import { Fragment } from "react";
import { Container } from "@/components/layout/Container";
import { BookCard } from "@/components/books/BookCard";
import { AdSlot } from "@/components/monetization/AdSlot";
import { JsonLd } from "@/components/seo/JsonLd";
import { PageHeader } from "@/components/ui/PageHeader";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { BOOK_TOPICS, type BookTopic } from "@/data/books";
import { getCatalog } from "@/lib/content";
import { AFFILIATE_DISCLOSURE } from "@/lib/monetization/affiliate";
import { getBookOffers, NO_OFFER } from "@/lib/monetization/book-affiliates";
import { absoluteUrl } from "@/lib/site";
import { slugify } from "@/lib/text";

/** Anúncio depois deste tema: entre seções, longe dos links de compra/afiliado. */
const AD_AFTER_TOPIC: BookTopic = "IA";

const DESCRIPTION =
  "Livros recomendados para aprender Dados, Inteligência Artificial, Python e SQL — com nível, idioma e versões gratuitas oficiais quando existem.";

export const metadata: Metadata = {
  title: "Livros recomendados",
  description: DESCRIPTION,
  alternates: { canonical: "/livros" },
  openGraph: { title: "Livros recomendados", description: DESCRIPTION, url: "/livros" },
};

const TOPIC_INTRO: Record<BookTopic, string> = {
  Dados: "Engenharia, modelagem, estatística e comunicação de dados.",
  IA: "Machine learning, deep learning e aplicações com modelos de linguagem.",
  Python: "Da primeira linha de código à análise de dados com pandas.",
  SQL: "Consultas, modelagem e desempenho.",
};

export default async function BooksPage() {
  const { books } = await getCatalog();
  const offers = getBookOffers(books);
  const hasAffiliateLinks = [...offers.values()].some((offer) => offer.affiliateUrl !== null);

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "ItemList",
          name: "Livros recomendados",
          url: absoluteUrl("/livros"),
          itemListElement: books.map((book, index) => ({
            "@type": "ListItem",
            position: index + 1,
            item: {
              "@type": "Book",
              name: book.title,
              author: book.authors.map((name) => ({ "@type": "Person", name })),
              isbn: book.isbn13,
              publisher: { "@type": "Organization", name: book.publisher },
              datePublished: String(book.year),
              inLanguage: book.language === "Inglês" ? "en" : "pt-BR",
              ...(book.edition ? { bookEdition: book.edition } : {}),
            },
          })),
        }}
      />

      <PageHeader
        eyebrow={`${books.length} livros`}
        title={
          <>
            Livros para
            <br />
            estudar dados<span className="text-accent">.</span>
          </>
        }
        lead="Uma seleção de livros essenciais para aprofundar seus conhecimentos em Dados, Inteligência Artificial e tecnologia. Explore obras recomendadas para diferentes níveis de aprendizado, do iniciante ao avançado."
        breadcrumbs={[{ label: "Livros", href: "/livros" }]}
      >
        <nav aria-label="Temas" className="mt-8">
          <ul className="flex flex-wrap gap-2">
            {BOOK_TOPICS.map((topic) => (
              <li key={topic}>
                <a
                  href={`#${slugify(topic)}`}
                  className="inline-flex min-h-[40px] items-center rounded-full border border-line px-4 text-[0.8125rem] text-muted transition-colors hover:border-line-strong hover:text-fg"
                >
                  {topic}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </PageHeader>

      <Container className="space-y-16 py-12 sm:space-y-20 sm:py-16">
        {/* Declaração exigida pelo Programa de Associados da Amazon, na mesma página dos links. */}
        {hasAffiliateLinks && <p className="max-w-prose text-xs leading-relaxed text-subtle">{AFFILIATE_DISCLOSURE}</p>}
        {BOOK_TOPICS.map((topic) => {
          const topicBooks = books.filter((book) => book.topic === topic);
          if (topicBooks.length === 0) return null;
          const id = slugify(topic);
          return (
            <Fragment key={topic}>
              <section aria-labelledby={id} className="scroll-mt-24">
                <SectionHeader id={id} title={topic} description={TOPIC_INTRO[topic]} />
                <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
                  {topicBooks.map((book) => (
                    <BookCard key={book.id} book={book} offer={offers.get(book.id) ?? NO_OFFER} />
                  ))}
                </div>
              </section>
              {topic === AD_AFTER_TOPIC && <AdSlot placement="books-mid" />}
            </Fragment>
          );
        })}

        <section aria-labelledby="criterios" className="max-w-prose border-t border-line pt-10">
          <h2 id="criterios" className="eyebrow text-fg">
            Como escolhemos
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-muted">
            Priorizamos livros reconhecidos na área, com conteúdo que continua útil mesmo com a troca de ferramentas. Os
            textos de descrição são nossos; os dados bibliográficos (título, autores, editora, ano e ISBN) foram
            conferidos em bases públicas. Preços e disponibilidade são definidos pelas lojas.
          </p>
        </section>
      </Container>
    </>
  );
}
