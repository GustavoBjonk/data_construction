/**
 * Livros recomendados (tipos e constantes). Os itens ficam em
 * content/books/*.json. Dados bibliográficos conferidos por ISBN
 * (scripts/verify-books.mts). Capas e links de afiliado ficam à parte, em
 * content/afiliados/livros.json (lib/monetization/book-affiliates.ts).
 * Descrições e motivos são texto editorial próprio.
 */

export type BookTopic = "Dados" | "IA" | "Python" | "SQL";
export type BookLevel = "Iniciante" | "Intermediário" | "Avançado";

export interface Book {
  id: string;
  title: string;
  authors: string[];
  publisher: string;
  year: number;
  edition?: string;
  isbn13: string;
  topic: BookTopic;
  level: BookLevel;
  language: "Inglês" | "Português";
  description: string;
  /** Por que está na lista (opinião editorial, não avaliação de leitores). */
  why: string;
  /** Versão gratuita oficial disponibilizada pelos autores ou editora. */
  freeOnlineUrl?: string;
}

export const BOOK_TOPICS: BookTopic[] = ["Dados", "IA", "Python", "SQL"];
