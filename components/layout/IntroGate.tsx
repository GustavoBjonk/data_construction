"use client";

import { useEffect } from "react";

/** Duração total da sequência de abertura (ver `[data-intro]` em globals.css). */
const INTRO_DURATION_MS = 2200;

/**
 * Marca a abertura como concluída em <html>. Como o layout raiz não é
 * remontado na navegação client-side, a animação roda apenas uma vez por
 * carregamento de página — não a cada troca de rota.
 */
export function IntroGate() {
  useEffect(() => {
    const timer = window.setTimeout(() => {
      document.documentElement.classList.add("intro-done");
    }, INTRO_DURATION_MS);
    return () => window.clearTimeout(timer);
  }, []);

  return null;
}
