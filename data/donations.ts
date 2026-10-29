/** Tipos e constantes. Os itens ficam em content/organizations/*.json (lido por lib/content/store.ts). */
export const ORGANIZATION_CATEGORIES = [
  "Educação",
  "Inclusão digital",
  "Tecnologia",
  "Formação profissional",
  "Apoio estudantil",
] as const;

export type OrganizationCategory = (typeof ORGANIZATION_CATEGORIES)[number];

export interface Organization {
  id: string;
  name: string;
  description: string;
  category: OrganizationCategory;
  officialSiteUrl: string;
  donationUrl: string;
}
