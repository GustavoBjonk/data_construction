/** Tipos e constantes. Os itens ficam em content/roadmaps/*.json (lido por lib/content/store.ts). */
export interface RoadmapStep {
  id: string;
  order: number;
  title: string;
  description: string;
  topics: string[];
  technologies: string[];
  courseIds: string[];
}

export interface Roadmap {
  id: string;
  slug: string;
  title: string;
  description: string;
  level: string;
  estimatedDuration: string;
  steps: RoadmapStep[];
}
