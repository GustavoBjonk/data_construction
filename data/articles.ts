/** Tipos e constantes. Os itens ficam em content/articles/*.json (lido por lib/content/store.ts). */
export interface ArticleReference {
  /** Referência completa já formatada conforme a ABNT NBR 6023. */
  citation: string;
  /** URL da fonte, quando for um documento eletrônico. */
  url?: string;
}

export interface Article {
  id: string;
  title: string;
  description: string;
  category: string;
  date: string;
  readingTime: number;
  author: string;
  authorBio: string;
  content: string[];
  references: ArticleReference[];
  /** Palavras-chave para busca e SEO (opcional). */
  tags?: string[];
}

export const ARTICLE_CATEGORIES = [
  "SQL",
  "Python",
  "Power BI",
  "Machine Learning",
  "Engenharia de Dados",
  "Estatística",
  "Inteligência Artificial",
] as const;
