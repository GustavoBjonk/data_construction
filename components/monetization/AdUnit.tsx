"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { isAdFreeRoute } from "@/lib/monetization/ads";
import { requestAdFill } from "@/lib/monetization/adsense-script";
import { useAdConsent } from "@/lib/monetization/consent";
import type { AdDevice, AdFormat } from "@/lib/monetization/placements";

const LOAD_MARGIN = "400px";

/** Altura reservada (px) por formato, para o anúncio não deslocar o conteúdo. */
const MIN_HEIGHT: Record<AdFormat, { mobile: number; desktop: number }> = {
  auto: { mobile: 280, desktop: 250 },
  horizontal: { mobile: 100, desktop: 90 },
  rectangle: { mobile: 250, desktop: 250 },
  "in-article": { mobile: 250, desktop: 250 },
};

/** Visibilidade por dispositivo (breakpoint lg). Oculto via CSS, o bloco nunca entra na tela e não é pedido. */
function deviceClass(devices: readonly AdDevice[]): string {
  const mobile = devices.includes("mobile");
  const desktop = devices.includes("desktop");
  if (mobile && !desktop) return "lg:hidden";
  if (desktop && !mobile) return "hidden lg:block";
  return "";
}

function formatAttributes(format: AdFormat) {
  if (format === "in-article") return { "data-ad-format": "fluid", "data-ad-layout": "in-article" };
  return { "data-ad-format": format, "data-full-width-responsive": "true" };
}

export interface AdUnitProps {
  name: string;
  /** null só na pré-visualização. */
  slot: string | null;
  format: AdFormat;
  devices: readonly AdDevice[];
  /** Publisher ID; null na pré-visualização. */
  client: string | null;
  preview?: boolean;
  className?: string;
}

/**
 * Bloco de anúncio no navegador. Só aparece depois da escolha de consentimento e
 * fora das rotas sem anúncio. O pedido ao AdSense acontece uma única vez, quando o
 * bloco se aproxima da área visível.
 */
export function AdUnit({ name, slot, format, devices, client, preview = false, className = "" }: AdUnitProps) {
  const pathname = usePathname();
  const consent = useAdConsent();
  const insRef = useRef<HTMLModElement>(null);
  const requestedRef = useRef(false);

  const adFree = isAdFreeRoute(pathname);
  const ready = !preview && !adFree && client !== null && slot !== null && consent !== null;

  useEffect(() => {
    const ins = insRef.current;
    if (!ready || !ins || !client || !consent || requestedRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        observer.disconnect();
        // O AdSense marca o <ins> após o primeiro pedido; um segundo push gera erro.
        if (requestedRef.current || ins.dataset.adsbygoogleStatus) return;
        requestedRef.current = true;
        requestAdFill(client, consent);
      },
      { rootMargin: LOAD_MARGIN },
    );
    observer.observe(ins);
    return () => observer.disconnect();
  }, [ready, client, consent]);

  if (adFree) return null;

  const height = MIN_HEIGHT[format];
  const sizeStyle = {
    "--ad-min-mobile": `${height.mobile}px`,
    "--ad-min-desktop": `${height.desktop}px`,
  } as React.CSSProperties;
  const wrapperClass = `${deviceClass(devices)} ${className}`.trim();

  if (preview) {
    return (
      <aside aria-label="Posição de anúncio (pré-visualização)" className={wrapperClass}>
        <div
          style={sizeStyle}
          className="flex min-h-[var(--ad-min-mobile)] flex-col items-center justify-center gap-1 border border-dashed border-copper/50 p-4 text-center lg:min-h-[var(--ad-min-desktop)]"
        >
          <span className="eyebrow text-copper">Anúncio · pré-visualização</span>
          <span className="text-xs text-subtle">{name}</span>
          <span className="font-mono text-[0.6875rem] text-subtle">{slot ? `slot ${slot}` : "slot não configurado"}</span>
        </div>
      </aside>
    );
  }

  if (!ready) return null;

  return (
    <aside aria-label="Publicidade" className={wrapperClass}>
      <p className="eyebrow mb-2 text-center text-subtle">Publicidade</p>
      <div style={sizeStyle} className="min-h-[var(--ad-min-mobile)] lg:min-h-[var(--ad-min-desktop)]">
        <ins
          ref={insRef}
          className="adsbygoogle block"
          style={{ display: "block", textAlign: format === "in-article" ? "center" : undefined }}
          data-ad-client={client}
          data-ad-slot={slot}
          {...formatAttributes(format)}
        />
      </div>
    </aside>
  );
}
