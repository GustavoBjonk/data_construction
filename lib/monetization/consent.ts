"use client";

import { useEffect, useState } from "react";

/**
 * Preferência de cookies de publicidade, guardada só no navegador.
 *   - "granted": anúncios personalizados;
 *   - "denied": anúncios não personalizados (requestNonPersonalizedAds);
 *   - null: sem escolha — nenhum anúncio é carregado.
 */
export type AdConsent = "granted" | "denied";

const STORAGE_KEY = "dc-consent-v1";
const CHANGE_EVENT = "dc-consent-change";
const OPEN_EVENT = "dc-consent-open";

export function readAdConsent(): AdConsent | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { ads?: unknown };
    return parsed.ads === "granted" || parsed.ads === "denied" ? parsed.ads : null;
  } catch {
    return null;
  }
}

export function writeAdConsent(choice: AdConsent): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ ads: choice, at: new Date().toISOString() }));
  } catch {
    // Armazenamento indisponível (modo privado): a escolha vale só para esta página.
  }
  window.dispatchEvent(new CustomEvent<AdConsent>(CHANGE_EVENT, { detail: choice }));
}

/** Reabre o aviso para a pessoa mudar a escolha (link no rodapé). */
export function openConsentPreferences(): void {
  window.dispatchEvent(new Event(OPEN_EVENT));
}

export function useAdConsent(): AdConsent | null {
  const [consent, setConsent] = useState<AdConsent | null>(null);

  useEffect(() => {
    setConsent(readAdConsent());
    const onChange = (event: Event) => setConsent((event as CustomEvent<AdConsent>).detail);
    window.addEventListener(CHANGE_EVENT, onChange);
    return () => window.removeEventListener(CHANGE_EVENT, onChange);
  }, []);

  return consent;
}

export function useConsentPreferencesRequest(onOpen: () => void): void {
  useEffect(() => {
    window.addEventListener(OPEN_EVENT, onOpen);
    return () => window.removeEventListener(OPEN_EVENT, onOpen);
  }, [onOpen]);
}
