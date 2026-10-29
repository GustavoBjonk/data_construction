/**
 * Posições de anúncios manuais, lidas de content/settings/ads.json.
 *
 * Arquivo estático versionado no repositório, no mesmo formato de
 * content/<coleção>/*.json.
 * Uso só no servidor: mantém o Zod fora do pacote do navegador.
 *
 * Nenhum ID de bloco é inventado: posição com `slot: null` não renderiza.
 */
import { z } from "zod";
import rawSettings from "@/content/settings/ads.json";

export const AD_PLACEMENT_IDS = [
  "home-mid",
  "news-list",
  "news-detail",
  "article-inline",
  "datasets-mid",
  "books-mid",
] as const;
export type AdPlacementId = (typeof AD_PLACEMENT_IDS)[number];

export const AD_PAGES = ["home", "news-list", "news-detail", "article", "datasets", "books"] as const;
/** Formatos de bloco do AdSense: "auto" = display responsivo; "in-article" = anúncio no artigo. */
export const AD_FORMATS = ["auto", "horizontal", "rectangle", "in-article"] as const;
export type AdFormat = (typeof AD_FORMATS)[number];
export const AD_DEVICES = ["mobile", "desktop"] as const;
export type AdDevice = (typeof AD_DEVICES)[number];

export const SLOT_PATTERN = /^\d{6,20}$/;

const placementSchema = z
  .object({
    id: z.enum(AD_PLACEMENT_IDS),
    name: z.string().min(1),
    page: z.enum(AD_PAGES),
    slot: z.string().regex(SLOT_PATTERN, "ID de bloco numérico do AdSense").nullable(),
    active: z.boolean(),
    format: z.enum(AD_FORMATS),
    /** 1 = mais importante. Decide quais posições aparecem quando a página passa do limite. */
    priority: z.number().int().min(1),
    devices: z.array(z.enum(AD_DEVICES)).min(1),
  })
  .strict();

export type AdPlacement = z.infer<typeof placementSchema>;

const settingsSchema = z
  .object({
    schemaVersion: z.literal(1),
    maxManualPerPage: z.number().int().min(0).max(3),
    /** Limite menor quando os anúncios automáticos estão ligados, para não somar excesso. */
    maxManualPerPageWithAutoAds: z.number().int().min(0).max(3),
    /** Prefixos de rota sem anúncios automáticos, além das rotas que nunca têm anúncio. */
    autoAdsExcludedPaths: z.array(z.string().regex(/^\/[a-z0-9\-/]*$/)),
    placements: z.array(placementSchema),
  })
  .strict()
  .refine((s) => new Set(s.placements.map((p) => p.id)).size === s.placements.length, "IDs de posição repetidos");

export type AdsSettings = z.infer<typeof settingsSchema>;

export function parseAdsSettings(raw: unknown): AdsSettings {
  return settingsSchema.parse(raw);
}

export const ADS_SETTINGS: AdsSettings = parseAdsSettings(rawSettings);

/** Posições que podem aparecer numa página: ativas, com slot, por prioridade e dentro do limite. */
export function selectPagePlacements(settings: AdsSettings, page: AdPlacement["page"], autoAds: boolean): AdPlacement[] {
  const limit = autoAds ? settings.maxManualPerPageWithAutoAds : settings.maxManualPerPage;
  return settings.placements
    .filter((p) => p.page === page && p.active && p.slot !== null)
    .sort((a, b) => a.priority - b.priority)
    .slice(0, limit);
}

/** A posição, se ela deve ser veiculada; caso contrário null. */
export function resolvePlacement(id: AdPlacementId, settings: AdsSettings, autoAds: boolean): AdPlacement | null {
  const placement = settings.placements.find((p) => p.id === id);
  if (!placement) return null;
  return selectPagePlacements(settings, placement.page, autoAds).includes(placement) ? placement : null;
}

export function findPlacement(id: AdPlacementId, settings: AdsSettings = ADS_SETTINGS): AdPlacement | null {
  return settings.placements.find((p) => p.id === id) ?? null;
}
