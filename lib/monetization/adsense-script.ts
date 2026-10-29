import type { AdConsent } from "./consent";

declare global {
  interface Window {
    adsbygoogle?: unknown[] & { requestNonPersonalizedAds?: 0 | 1 };
  }
}

const SCRIPT_ID = "adsbygoogle-js";

export function isAdsScriptLoaded(): boolean {
  return document.getElementById(SCRIPT_ID) !== null;
}

/** Fila do AdSense com a escolha de personalização aplicada antes de qualquer pedido. */
function adsQueue(consent: AdConsent) {
  const queue = (window.adsbygoogle = window.adsbygoogle ?? []);
  queue.requestNonPersonalizedAds = consent === "granted" ? 0 : 1;
  return queue;
}

/**
 * Injeta o script oficial uma única vez por sessão de navegação: o <head> persiste
 * nas trocas de página do App Router e o ID impede uma segunda cópia.
 * Chamado só depois da escolha de consentimento e sob demanda (posição perto da tela
 * ou anúncios automáticos), em vez de baixar o script em todas as páginas.
 */
export function ensureAdsScript(client: string, consent: AdConsent): void {
  adsQueue(consent);
  if (isAdsScriptLoaded()) return;
  const script = document.createElement("script");
  script.id = SCRIPT_ID;
  script.async = true;
  script.crossOrigin = "anonymous";
  script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${encodeURIComponent(client)}`;
  document.head.appendChild(script);
}

/** Pede o preenchimento de um bloco <ins> já presente na página. */
export function requestAdFill(client: string, consent: AdConsent): void {
  ensureAdsScript(client, consent);
  try {
    adsQueue(consent).push({});
  } catch {
    // Bloqueadores e erros do AdSense podem lançar aqui; o espaço reservado fica vazio.
  }
}
