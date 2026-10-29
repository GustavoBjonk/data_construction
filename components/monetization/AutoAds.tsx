"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { isAdFreeRoute } from "@/lib/monetization/ads";
import { ensureAdsScript } from "@/lib/monetization/adsense-script";
import { useAdConsent } from "@/lib/monetization/consent";

/**
 * Anúncios automáticos: carrega o script do AdSense (uma vez) depois da escolha de
 * consentimento, fora das rotas sem anúncio. Onde e quantos anúncios aparecem é
 * decidido pelo Google conforme o painel (formatos, carga de anúncios e exclusões).
 * Só é montado quando NEXT_PUBLIC_ADSENSE_AUTO_ADS=true e a veiculação está ligada.
 */
export function AutoAds({ client, excludedPaths }: { client: string; excludedPaths: readonly string[] }) {
  const pathname = usePathname();
  const consent = useAdConsent();
  const excluded = isAdFreeRoute(pathname, excludedPaths);

  useEffect(() => {
    if (consent === null || excluded) return;
    ensureAdsScript(client, consent);
  }, [client, consent, excluded]);

  return null;
}
