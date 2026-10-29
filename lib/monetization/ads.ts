/**
 * Configuração do Google AdSense a partir das variáveis de ambiente.
 * Seguro para o navegador: sem dependências de servidor.
 *
 * Dois estados separados:
 *   - Verificação: com NEXT_PUBLIC_ADSENSE_CLIENT válido, o site publica a
 *     metatag "google-adsense-account" e o /ads.txt. Nenhum script é carregado.
 *   - Veiculação: anúncios só carregam quando TODOS forem verdadeiros:
 *       - NEXT_PUBLIC_ADSENSE_ENABLED=true (ligar só após a aprovação no AdSense);
 *       - NEXT_PUBLIC_ADSENSE_CLIENT no formato ca-pub-<16 dígitos>;
 *       - build de produção e, na Vercel, deploy de Production (nunca Preview).
 *
 * Anúncios automáticos (NEXT_PUBLIC_ADSENSE_AUTO_ADS=true) dependem também da
 * veiculação ligada e precisam estar ativados no painel do AdSense.
 * As posições manuais ficam em content/settings/ads.json (lib/monetization/placements.ts).
 */

export const CLIENT_PATTERN = /^ca-pub-\d{16}$/;

/** Rotas onde nunca há anúncio (login, conta, páginas legais). */
const AD_FREE_PREFIXES = [
  "/entrar",
  "/cadastro",
  "/recuperar-senha",
  "/redefinir-senha",
  "/auth",
  "/conta",
  "/privacidade",
  "/cookies",
  "/termos",
];

export interface AdsEnv {
  enabled?: string;
  autoAds?: string;
  client?: string;
  preview?: string;
  nodeEnv?: string;
  vercelEnv?: string;
}

export interface AdsConfig {
  /** Anúncios reais podem ser carregados. */
  enabled: boolean;
  /** Anúncios automáticos do Google (exige `enabled`). */
  autoAds: boolean;
  /** Mostra as posições reservadas (desenvolvimento), sem carregar anúncios. */
  preview: boolean;
  /** Publisher ID válido; basta ele para a verificação do site. */
  client: string | null;
}

export function resolveAdsConfig(env: AdsEnv): AdsConfig {
  const client = env.client && CLIENT_PATTERN.test(env.client) ? env.client : null;
  const isProductionDeploy = env.nodeEnv === "production" && (env.vercelEnv === undefined || env.vercelEnv === "production");
  const enabled = env.enabled === "true" && client !== null && isProductionDeploy;
  const autoAds = enabled && env.autoAds === "true";
  // Preview nunca em produção real.
  const preview = !enabled && env.preview === "true" && env.vercelEnv !== "production";
  return { enabled, autoAds, preview, client };
}

/** Acesso literal a cada variável: o Next só embute no navegador NEXT_PUBLIC_* referenciadas assim. */
export function getAdsConfig(): AdsConfig {
  return resolveAdsConfig({
    enabled: process.env.NEXT_PUBLIC_ADSENSE_ENABLED,
    autoAds: process.env.NEXT_PUBLIC_ADSENSE_AUTO_ADS,
    client: process.env.NEXT_PUBLIC_ADSENSE_CLIENT,
    preview: process.env.NEXT_PUBLIC_ADSENSE_PREVIEW,
    nodeEnv: process.env.NODE_ENV,
    vercelEnv: process.env.NEXT_PUBLIC_VERCEL_ENV,
  });
}

function matchesPrefix(pathname: string, prefix: string): boolean {
  return pathname === prefix || pathname.startsWith(`${prefix}/`);
}

/** Rotas sem anúncio. `extraPrefixes` soma exclusões configuradas (ex.: dos anúncios automáticos). */
export function isAdFreeRoute(pathname: string, extraPrefixes: readonly string[] = []): boolean {
  return [...AD_FREE_PREFIXES, ...extraPrefixes].some((prefix) => matchesPrefix(pathname, prefix));
}

/** Linha do ads.txt (Google). O ID após a vírgula final é o identificador fixo da Google. */
export function buildAdsTxt(client: string | null): string | null {
  if (!client) return null;
  return `google.com, ${client.replace(/^ca-/, "")}, DIRECT, f08c47fec0942fa0\n`;
}
