/** Configuração pública do site. Nenhum valor sensível deve ficar aqui. */
export const SITE = {
  name: "DataConstruction",
  shortDescription: "Dados na prática",
  description:
    "Aprenda, construa e compartilhe conhecimento sobre Dados, Inteligência Artificial e tecnologia: artigos, notícias verificadas, datasets, trilhas e projetos.",
  locale: "pt_BR",
  url: (process.env.NEXT_PUBLIC_SITE_URL?.trim() || "https://dataconstruction.vercel.app").replace(/\/$/, ""),
} as const;

export function absoluteUrl(path = "/"): string {
  return `${SITE.url}${path.startsWith("/") ? path : `/${path}`}`;
}
