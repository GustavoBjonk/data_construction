/** Tipos e constantes. Os itens ficam em content/projects/*.json (lido por lib/content/store.ts). */
export type ProjectArea =
  | "Análise de Dados"
  | "Ciência de Dados"
  | "Engenharia de Dados"
  | "Business Intelligence"
  | "SQL"
  | "Python"
  | "Machine Learning"
  | "Data Visualization";

export type ProjectDifficulty = "Iniciante" | "Intermediário" | "Avançado";

export interface Project {
  id: string;
  title: string;
  description: string;
  area: ProjectArea;
  difficulty: ProjectDifficulty;
  technologies: string[];
  skills: string[];
  estimatedTime: string;
  objective: string;
}

export const PROJECT_AREAS: ProjectArea[] = [
  "Análise de Dados",
  "Ciência de Dados",
  "Engenharia de Dados",
  "Business Intelligence",
  "SQL",
  "Python",
  "Machine Learning",
  "Data Visualization",
];

export const PROJECT_DIFFICULTIES: ProjectDifficulty[] = [
  "Iniciante",
  "Intermediário",
  "Avançado",
];
