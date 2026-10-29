import { SITE } from "@/lib/site";
import { OG_CONTENT_TYPE, OG_SIZE, renderOgImage } from "@/lib/og-image";

export const alt = `${SITE.name} — Dados na prática`;
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

/** Imagem de compartilhamento padrão, gerada no build com as cores do design system. */
export default function OpengraphImage() {
  return renderOgImage({
    eyebrow: "Dados · IA · Tecnologia",
    title: "Dados na prática.",
    footer: "Artigos, notícias, datasets, trilhas e projetos",
  });
}
