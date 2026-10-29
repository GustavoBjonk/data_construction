/** Tipos e constantes. Os itens ficam em content/datasets/*.json (lido por lib/content/store.ts). */
export type DatasetCategory =
  | "Data Analytics"
  | "Data Science"
  | "Machine Learning"
  | "Deep Learning"
  | "SQL"
  | "Business Intelligence"
  | "NLP"
  | "Computer Vision";

export type DatasetDifficulty = "Iniciante" | "Intermediário" | "Avançado";

export interface Dataset {
  id: string;
  name: string;
  description: string;
  category: DatasetCategory;
  difficulty: DatasetDifficulty;
  size?: string;
  format?: string;
  topics: string[];
  technologies: string[];
  idealFor: string[];
  source: string;
  sourceUrl: string;
}

export const DATASET_CATEGORIES: DatasetCategory[] = [
  "Data Analytics",
  "Data Science",
  "Machine Learning",
  "Deep Learning",
  "SQL",
  "Business Intelligence",
  "NLP",
  "Computer Vision",
];

export const DATASET_DIFFICULTIES: DatasetDifficulty[] = [
  "Iniciante",
  "Intermediário",
  "Avançado",
];
