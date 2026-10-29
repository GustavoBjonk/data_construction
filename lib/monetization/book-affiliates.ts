/**
 * Capas e links de afiliado dos livros, lidos de content/afiliados/livros.json.
 *
 * Separado de content/books/*.json: aqui ficam só dados comerciais (capa,
 * URL de afiliado, ativo/inativo), indexados pelo id do livro. Título,
 * autores e descrição continuam apenas no catálogo.
 *
 * Nenhuma URL é inventada: sem URL válida e ativa, o livro não tem botão de
 * compra. Uso só no servidor (Zod e verificação de arquivo da capa).
 */
import { existsSync } from "node:fs";
import path from "node:path";
import { z } from "zod";
import rawSettings from "@/content/afiliados/livros.json";
import type { Book } from "@/data/books";
import { SLUG_PATTERN } from "@/lib/content/schemas";

/** Lojas aceitas: só a Amazon Brasil, onde estão as edições brasileiras. */
const AMAZON_BR_HOSTS = new Set(["amazon.com.br", "www.amazon.com.br"]);
/** Capas locais em public/images/books (o painel futuro grava no mesmo lugar). */
export const COVER_PATTERN = /^\/images\/books\/[a-z0-9]+(?:-[a-z0-9]+)*\.(?:webp|avif|jpg|png)$/;
/** Código do produto na URL (/dp/… ou /gp/product/…). Livro impresso: ASIN = ISBN-10. */
const ASIN_IN_PATH = /\/(?:dp|gp\/product)\/([A-Z0-9]{10})(?:[/?]|$)/i;

/** URL HTTPS da Amazon Brasil, sem credenciais embutidas. */
export function isAmazonBrUrl(value: string): boolean {
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    return false;
  }
  return url.protocol === "https:" && AMAZON_BR_HOSTS.has(url.hostname) && !url.username && !url.password;
}

const bookAffiliateSchema = z.strictObject({
  cover: z.string().regex(COVER_PATTERN, "Caminho de capa fora de /images/books/<nome>.webp|avif|jpg|png"),
  /** Vazio enquanto não houver link real. */
  affiliateUrl: z.union([z.literal(""), z.string().refine(isAmazonBrUrl, "URL HTTPS da Amazon Brasil (amazon.com.br)")]),
  active: z.boolean(),
});

export type BookAffiliate = z.infer<typeof bookAffiliateSchema>;

const settingsSchema = z.strictObject({
  schemaVersion: z.literal(1),
  books: z.record(z.string().regex(SLUG_PATTERN), bookAffiliateSchema),
});

export type BookAffiliateSettings = z.infer<typeof settingsSchema>;

export function parseBookAffiliateSettings(raw: unknown): BookAffiliateSettings {
  return settingsSchema.parse(raw);
}

export const BOOK_AFFILIATES: BookAffiliateSettings = parseBookAffiliateSettings(rawSettings);

/** ISBN-10 equivalente (só prefixo 978), usado pela Amazon como código de livros impressos. */
export function isbn13ToIsbn10(isbn13: string): string | null {
  if (!/^978\d{10}$/.test(isbn13)) return null;
  const body = isbn13.slice(3, 12);
  const sum = [...body].reduce((acc, digit, index) => acc + Number(digit) * (10 - index), 0);
  const check = (11 - (sum % 11)) % 11;
  return body + (check === 10 ? "X" : String(check));
}

/**
 * Problemas entre o arquivo de afiliados e o catálogo (vazio = consistente):
 * ids ativos sem livro publicado, livros sem configuração e URL apontando para
 * outra edição. Entradas inativas podem guardar o link de um livro arquivado
 * (publicação futura): nunca são exibidas.
 * Códigos que não são ISBN (ex.: e-book "B0…") não podem ser conferidos aqui.
 */
export function findBookAffiliateIssues(settings: BookAffiliateSettings, books: Book[]): string[] {
  const issues: string[] = [];
  const bookIds = new Set(books.map((book) => book.id));
  for (const [id, entry] of Object.entries(settings.books)) {
    if (entry.active && !bookIds.has(id)) issues.push(`afiliados: link ativo para livro não publicado "${id}"`);
  }
  for (const book of books) {
    const entry = settings.books[book.id];
    if (!entry) {
      issues.push(`afiliados: sem configuração para "${book.id}"`);
      continue;
    }
    const asin = ASIN_IN_PATH.exec(entry.affiliateUrl)?.[1]?.toUpperCase();
    if (asin && /^\d{9}[\dX]$/.test(asin) && asin !== isbn13ToIsbn10(book.isbn13)) {
      issues.push(`afiliados: "${book.id}" aponta para o ISBN-10 ${asin}, mas a edição do catálogo é ${book.isbn13}`);
    }
  }
  return issues;
}

/** URL de compra a exibir, ou null (sem botão) se ausente, inativa ou inválida. */
export function resolveAffiliateUrl(entry: BookAffiliate | undefined): string | null {
  if (!entry?.active || !entry.affiliateUrl) return null;
  return isAmazonBrUrl(entry.affiliateUrl) ? entry.affiliateUrl : null;
}

/**
 * Caminho da capa, se o arquivo existe em public/. A página é gerada no build,
 * então uma capa adicionada depois aparece no próximo deploy.
 */
export function resolveCover(entry: BookAffiliate | undefined, root: string = process.cwd()): string | null {
  if (!entry) return null;
  return existsSync(/*turbopackIgnore: true*/ path.join(/*turbopackIgnore: true*/ root, "public", entry.cover))
    ? entry.cover
    : null;
}

export interface BookOffer {
  /** Caminho público da capa, ou null para o placeholder. */
  cover: string | null;
  /** Link de afiliado validado, ou null para não exibir o botão. */
  affiliateUrl: string | null;
}

/** Sem capa (placeholder) e sem botão de compra. */
export const NO_OFFER: BookOffer = { cover: null, affiliateUrl: null };

/**
 * Capa e link de cada livro do catálogo. Arquivo inconsistente com o catálogo
 * interrompe o build com erro explícito, como o restante do conteúdo.
 */
export function getBookOffers(books: Book[], settings: BookAffiliateSettings = BOOK_AFFILIATES): Map<string, BookOffer> {
  const issues = findBookAffiliateIssues(settings, books);
  if (issues.length > 0) throw new Error(`content/afiliados/livros.json inconsistente:\n  - ${issues.join("\n  - ")}`);
  return new Map(
    books.map((book) => {
      const entry = settings.books[book.id];
      return [book.id, { cover: resolveCover(entry), affiliateUrl: resolveAffiliateUrl(entry) }];
    }),
  );
}

/**
 * Há algum link de afiliado ativo? Liga o aviso de afiliados em Termos e
 * Privacidade mesmo sem NEXT_PUBLIC_AMAZON_ASSOCIATE_TAG definida, para que
 * nenhum link comercial apareça no site sem a divulgação correspondente.
 */
export function hasActiveAffiliateLinks(settings: BookAffiliateSettings = BOOK_AFFILIATES): boolean {
  return Object.values(settings.books).some((entry) => resolveAffiliateUrl(entry) !== null);
}
