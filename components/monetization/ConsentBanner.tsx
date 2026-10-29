"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { getAdsConfig } from "@/lib/monetization/ads";
import { isAdsScriptLoaded } from "@/lib/monetization/adsense-script";
import {
  type AdConsent,
  openConsentPreferences,
  readAdConsent,
  useConsentPreferencesRequest,
  writeAdConsent,
} from "@/lib/monetization/consent";

/**
 * Aviso de cookies de publicidade. Só existe quando há anúncios configurados:
 * sem anúncios, o site não usa cookies próprios e não precisa interromper ninguém.
 * "Aceitar" e "Recusar" têm o mesmo peso visual.
 */
export function ConsentBanner() {
  const { enabled, preview } = getAdsConfig();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if ((enabled || preview) && readAdConsent() === null) setOpen(true);
  }, [enabled, preview]);

  const reopen = useCallback(() => setOpen(true), []);
  useConsentPreferencesRequest(reopen);

  if (!(enabled || preview) || !open) return null;

  function choose(choice: AdConsent) {
    const previous = readAdConsent();
    writeAdConsent(choice);
    setOpen(false);
    // Com o script já carregado, a nova escolha só vale integralmente numa página nova.
    if (previous !== null && previous !== choice && isAdsScriptLoaded()) window.location.reload();
  }

  const buttonClass =
    "min-h-[44px] flex-1 rounded-full border border-line-strong px-5 text-sm font-medium text-fg transition-colors hover:border-fg/40 hover:bg-fg/5 sm:flex-none";

  return (
    <section
      role="region"
      aria-label="Preferências de cookies"
      className="fixed inset-x-3 bottom-3 z-50 mx-auto max-w-2xl border border-line-strong bg-surface p-5 shadow-[0_8px_40px_rgb(0_0_0/0.5)] sm:inset-x-6 sm:bottom-6"
    >
      <p className="text-sm leading-relaxed text-fg">
        Usamos anúncios do Google para manter o conteúdo gratuito. Você escolhe se eles podem usar cookies para
        personalização. Recusando, os anúncios continuam, mas não personalizados.
      </p>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button type="button" onClick={() => choose("granted")} className={buttonClass}>
          Aceitar
        </button>
        <button type="button" onClick={() => choose("denied")} className={buttonClass}>
          Recusar
        </button>
        <Link href="/cookies" className="ml-auto inline-flex min-h-[44px] items-center text-sm text-muted underline-offset-4 hover:text-fg hover:underline">
          Política de cookies
        </Link>
      </div>
    </section>
  );
}

/** Link do rodapé para rever a escolha (só aparece quando há anúncios). */
export function ConsentPreferencesButton() {
  const { enabled, preview } = getAdsConfig();
  if (!(enabled || preview)) return null;
  return (
    <button
      type="button"
      onClick={openConsentPreferences}
      className="inline-flex min-h-[36px] items-center text-sm text-muted transition-colors hover:text-fg"
    >
      Preferências de cookies
    </button>
  );
}
