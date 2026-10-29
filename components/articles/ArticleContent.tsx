import { Fragment } from "react";
import { slugify } from "@/lib/text";

export interface TocEntry {
  id: string;
  title: string;
}

const HEADING_PREFIX = "## ";
const CODE_FENCE = "```";

/** Sumário a partir dos blocos `## Título` do conteúdo. */
export function getTableOfContents(content: string[]): TocEntry[] {
  return content
    .filter((block) => block.startsWith(HEADING_PREFIX))
    .map((block) => {
      const title = block.slice(HEADING_PREFIX.length);
      return { id: slugify(title), title };
    });
}

/** Textos abaixo deste tamanho não recebem anúncio no meio. */
const MIN_BLOCKS_FOR_INLINE_SLOT = 8;

/**
 * Índice do subtítulo mais próximo do meio do texto (nunca o primeiro), para
 * inserir conteúdo extra entre seções, e não no meio de uma explicação.
 */
export function findInlineSlotIndex(content: string[]): number | null {
  if (content.length < MIN_BLOCKS_FOR_INLINE_SLOT) return null;
  const middle = content.length / 2;
  const headings = content
    .map((block, index) => (block.startsWith(HEADING_PREFIX) ? index : -1))
    .filter((index) => index > 1);
  if (headings.length === 0) return null;
  return headings.reduce((best, index) => (Math.abs(index - middle) < Math.abs(best - middle) ? index : best));
}

interface ArticleContentProps {
  content: string[];
  /** Inserido antes do subtítulo mais próximo do meio, em textos longos. */
  inlineSlot?: React.ReactNode;
}

/**
 * Renderiza o formato atual dos artigos (parágrafos, `##` e blocos de código)
 * sem HTML arbitrário: todo texto passa pelo escape padrão do React.
 */
export function ArticleContent({ content, inlineSlot }: ArticleContentProps) {
  const slotIndex = inlineSlot ? findInlineSlotIndex(content) : null;

  return (
    <div className="prose-editorial">
      {content.map((block, index) => {
        if (block.startsWith(HEADING_PREFIX)) {
          const title = block.slice(HEADING_PREFIX.length);
          return (
            <Fragment key={index}>
              {index === slotIndex && inlineSlot}
              <h2 id={slugify(title)}>{title}</h2>
            </Fragment>
          );
        }

        if (block.startsWith(CODE_FENCE)) {
          const language = block.match(/^```([a-z]+)/)?.[1];
          const code = block.replace(/^```[a-z]*\n?/, "").replace(/```$/, "");
          return (
            <figure key={index}>
              {language && (
                <figcaption className="eyebrow -mb-4 mt-8 text-subtle">{language}</figcaption>
              )}
              <pre>
                <code>{code}</code>
              </pre>
            </figure>
          );
        }

        return <p key={index}>{block}</p>;
      })}
    </div>
  );
}
