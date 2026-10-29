/** Tipos e constantes. Os itens ficam em content/courses/*.json (lido por lib/content/store.ts). */
export interface Course {
  id: string;
  title: string;
  platform: string;
  area: string;
  type: "free" | "paid";
  price?: number;
  currency: "BRL";
  priceCheckedAt?: string;
  duration?: string;
  level: "Iniciante" | "Intermediário" | "Avançado";
  description: string;
  skills: string[];
  url: string;
}

export const COURSE_AREAS: string[] = [
  "Análise de Dados",
  "Ciência de Dados",
  "Engenharia de Dados",
  "Business Intelligence",
  "Machine Learning",
  "SQL",
  "Data Visualization",
];
