import { NEWS_CATEGORIES, type NewsCategory } from "@/data/news";
import { slugify } from "@/lib/text";

/** Abaixo disso a página de categoria é "rasa" e fica fora do índice de busca. */
export const MIN_INDEXABLE_CATEGORY_SIZE = 3;

/** Descrição editorial de cada categoria (usada no topo da página e na meta description). */
const DESCRIPTIONS: Record<NewsCategory, string> = {
  "Inteligência Artificial": "Lançamentos de modelos, pesquisa aplicada e o impacto da IA no trabalho com dados.",
  "Data Science": "Métodos, ferramentas e práticas de ciência de dados.",
  "Data Analytics": "Análise de dados no dia a dia: ferramentas, técnicas e tendências.",
  "Data Engineering": "Pipelines, formatos de tabela, orquestração e a infraestrutura que move os dados.",
  "Business Intelligence": "Plataformas de BI, modelagem analítica e indicadores para decisão.",
  "Bancos de Dados": "Novas versões, recursos e arquitetura de bancos relacionais, analíticos e vetoriais.",
  Cloud: "Serviços de dados e IA dos provedores de nuvem.",
  "Big Data": "Processamento distribuído e dados em grande escala.",
  "Machine Learning": "Modelos, frameworks e práticas de aprendizado de máquina.",
  "Data Governance": "Qualidade, catálogo, linhagem e governança de dados.",
  "Data Privacy": "Vazamentos, proteção de dados pessoais e decisões de autoridades de privacidade.",
  "Open Source": "Projetos abertos que fazem parte da stack de dados e IA.",
  "Data Platforms": "Lakehouses, warehouses e plataformas unificadas de dados.",
  Infraestrutura: "Chips, data centers e a base computacional da IA e dos dados.",
  Mercado: "Investimentos, aquisições e movimentos das empresas de dados e IA.",
  "Regulamentação": "Leis, normas e regulação de IA e dados no Brasil e no mundo.",
};

export interface NewsCategoryInfo {
  name: NewsCategory;
  slug: string;
  description: string;
}

export const NEWS_CATEGORY_INFO: NewsCategoryInfo[] = NEWS_CATEGORIES.map((name) => ({
  name,
  slug: slugify(name),
  description: DESCRIPTIONS[name],
}));

export function newsCategoryHref(name: string): string {
  return `/noticias/categoria/${slugify(name)}`;
}

export function findNewsCategory(slug: string): NewsCategoryInfo | undefined {
  return NEWS_CATEGORY_INFO.find((info) => info.slug === slug);
}
