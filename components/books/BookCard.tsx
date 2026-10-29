import Image from "next/image";
import type { Book } from "@/data/books";
import { Badge } from "@/components/ui/Badge";
import { ArrowUpRightIcon } from "@/components/ui/Icons";
import type { BookOffer } from "@/lib/monetization/book-affiliates";

function formatAuthors(authors: string[]): string {
  if (authors.length <= 2) return authors.join(" e ");
  return `${authors[0]} e outros`;
}

/** Capa na proporção original (contida, sem cortar nem esticar) ou lombada tipográfica. */
function BookCover({ book, cover }: { book: Book; cover: string | null }) {
  return (
    <div className="relative aspect-[2/3] w-20 shrink-0 overflow-hidden bg-elevated">
      {cover ? (
        <Image
          src={cover}
          alt={`Capa do livro ${book.title}`}
          fill
          sizes="80px"
          className="object-contain"
        />
      ) : (
        <div aria-hidden="true" className="flex h-full flex-col justify-between border-l-2 border-accent/70 px-2 py-3">
          <span className="font-mono text-[0.625rem] uppercase tracking-[0.12em] text-accent">{book.topic}</span>
          <span className="font-display text-sm font-semibold text-fg/60">{book.year}</span>
        </div>
      )}
    </div>
  );
}

export function BookCard({ book, offer }: { book: Book; offer: BookOffer }) {
  const hasLinks = Boolean(book.freeOnlineUrl || offer.affiliateUrl);

  return (
    <article className="card-interactive flex h-full flex-col">
      <div className="flex gap-4 p-5">
        <BookCover book={book} cover={offer.cover} />
        <div className="min-w-0">
          <h3 className="font-display text-lg font-medium leading-snug tracking-tight text-fg">{book.title}</h3>
          <p className="mt-1 text-sm text-muted" title={book.authors.join(", ")}>
            {formatAuthors(book.authors)}
          </p>
          <p className="mt-1 font-mono text-[0.6875rem] uppercase tracking-[0.08em] text-subtle">
            {[book.publisher, book.edition, book.year].filter(Boolean).join(" · ")}
          </p>
        </div>
      </div>

      <div className="flex flex-1 flex-col border-t border-line p-5">
        <div className="flex flex-wrap gap-1.5">
          <Badge variant="outline">{book.level}</Badge>
          <Badge variant="neutral">{book.language}</Badge>
          {book.freeOnlineUrl && <Badge>Versão gratuita oficial</Badge>}
        </div>
        <p className="mt-4 text-sm leading-relaxed text-muted">{book.description}</p>
        <p className="mt-3 border-l border-line-strong pl-3 text-sm leading-relaxed text-fg/80">
          <span className="sr-only">Por que recomendamos: </span>
          {book.why}
        </p>

        {hasLinks && (
          <>
            {/* Empurra os links para a base, alinhando cartões de alturas diferentes. */}
            <div className="flex-1" />
            <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-line pt-4">
              {book.freeOnlineUrl && (
                <a
                  href={book.freeOnlineUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group inline-flex min-h-[40px] items-center gap-1.5 text-sm font-medium text-accent hover:text-accent-hover"
                >
                  Ler grátis
                  <ArrowUpRightIcon size={14} className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                  <span className="sr-only"> (site oficial, abre em nova aba)</span>
                </a>
              )}
              {offer.affiliateUrl && (
                <a
                  href={offer.affiliateUrl}
                  target="_blank"
                  rel="sponsored noopener noreferrer"
                  className="group inline-flex min-h-[40px] items-center gap-1.5 text-sm text-muted hover:text-fg"
                >
                  Ver na Amazon
                  <ArrowUpRightIcon size={14} className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                  <span className="sr-only"> (link de afiliado, abre em nova aba)</span>
                </a>
              )}
              {offer.affiliateUrl && (
                /* Identificação visual do link comercial; leitores de tela já ouvem "link de afiliado" no próprio link. */
                <span aria-hidden="true" className="font-mono text-[0.625rem] uppercase tracking-[0.08em] text-subtle">
                  Publicidade
                </span>
              )}
            </div>
          </>
        )}
      </div>
    </article>
  );
}
