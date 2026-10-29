/**
 * Confere os livros de content/books em bases bibliográficas públicas.
 *
 * Uso: npm run verify:books
 * Somente leitura: consulta Open Library (e Google Books como alternativa)
 * pelo ISBN e compara título e ano com os dados cadastrados.
 */
import path from "node:path";
import { loadPublishedContent } from "../lib/content/store.ts";

const { books } = await loadPublishedContent(path.resolve(import.meta.dirname, ".."));

const TIMEOUT_MS = 15_000;

function normalize(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

interface Found {
  source: string;
  title: string;
  year?: number;
}

async function fromOpenLibrary(isbn: string): Promise<Found | null> {
  const response = await fetch(`https://openlibrary.org/isbn/${isbn}.json`, { signal: AbortSignal.timeout(TIMEOUT_MS), redirect: "follow" });
  if (!response.ok) return null;
  const data = (await response.json()) as { title?: string; subtitle?: string; publish_date?: string };
  if (!data.title) return null;
  const year = data.publish_date?.match(/\d{4}/)?.[0];
  return { source: "Open Library", title: [data.title, data.subtitle].filter(Boolean).join(": "), year: year ? Number(year) : undefined };
}

async function fromGoogleBooks(isbn: string): Promise<Found | null> {
  const response = await fetch(`https://www.googleapis.com/books/v1/volumes?q=isbn:${isbn}`, { signal: AbortSignal.timeout(TIMEOUT_MS) });
  if (!response.ok) return null;
  const data = (await response.json()) as { items?: { volumeInfo?: { title?: string; subtitle?: string; publishedDate?: string } }[] };
  const info = data.items?.[0]?.volumeInfo;
  if (!info?.title) return null;
  const year = info.publishedDate?.match(/\d{4}/)?.[0];
  return { source: "Google Books", title: [info.title, info.subtitle].filter(Boolean).join(": "), year: year ? Number(year) : undefined };
}

let failures = 0;
for (const book of books) {
  let found: Found | null = null;
  try {
    found = (await fromOpenLibrary(book.isbn13)) ?? (await fromGoogleBooks(book.isbn13));
  } catch (error) {
    console.log(`ERRO      ${book.id}: ${error instanceof Error ? error.message : error}`);
    failures++;
    continue;
  }

  if (!found) {
    console.log(`NÃO ACHOU ${book.id} (${book.isbn13})`);
    failures++;
    continue;
  }

  // O título cadastrado deve aparecer no título encontrado (subtítulos variam entre bases).
  const titleOk = normalize(found.title).includes(normalize(book.title)) || normalize(book.title).includes(normalize(found.title));
  const yearOk = found.year === undefined || Math.abs(found.year - book.year) <= 1;
  const status = titleOk && yearOk ? "OK" : "DIVERGE";
  if (status !== "OK") failures++;
  console.log(`${status.padEnd(9)} ${book.id}: "${found.title}" (${found.year ?? "?"}) — ${found.source}`);
}

console.log(`\n${books.length - failures}/${books.length} conferidos.`);
process.exitCode = failures > 0 ? 1 : 0;
