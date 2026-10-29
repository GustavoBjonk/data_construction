import { getAdsConfig } from "@/lib/monetization/ads";
import { ADS_SETTINGS, type AdPlacementId, findPlacement, resolvePlacement } from "@/lib/monetization/placements";
import { AdUnit } from "./AdUnit";

interface AdSlotProps {
  placement: AdPlacementId;
  /** Desliga a posição nesta página específica (ex.: conteúdo patrocinado ou sensível). */
  disabled?: boolean;
  className?: string;
}

/**
 * Posição de anúncio manual (componente de servidor). Não renderiza nada quando:
 * veiculação desligada, posição inativa, sem ID de bloco, fora do limite por página
 * ou desligada via `disabled`. Consentimento e rota são conferidos no navegador (AdUnit).
 */
export function AdSlot({ placement, disabled = false, className }: AdSlotProps) {
  if (disabled) return null;
  const config = getAdsConfig();

  if (config.preview) {
    const definition = findPlacement(placement);
    if (!definition?.active) return null;
    return (
      <AdUnit
        preview
        name={definition.name}
        slot={definition.slot}
        format={definition.format}
        devices={definition.devices}
        client={null}
        className={className}
      />
    );
  }

  if (!config.enabled || !config.client) return null;
  const resolved = resolvePlacement(placement, ADS_SETTINGS, config.autoAds);
  if (!resolved) return null;

  return (
    <AdUnit
      name={resolved.name}
      slot={resolved.slot}
      format={resolved.format}
      devices={resolved.devices}
      client={config.client}
      className={className}
    />
  );
}
