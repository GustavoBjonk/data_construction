import { ImageResponse } from "next/og";

export const OG_SIZE = { width: 1200, height: 630 };
export const OG_CONTENT_TYPE = "image/png";

const COLORS = { bg: "#090D0F", fg: "#F1F0EB", muted: "#9BA8A7", accent: "#73D6C7", copper: "#D9A875", dot: "#3C484B" };

interface OgImageProps {
  eyebrow: string;
  title: string;
  footer?: string;
}

/** Cartão de compartilhamento no padrão visual do site (gerado no build). */
export function renderOgImage({ eyebrow, title, footer }: OgImageProps): ImageResponse {
  // Títulos longos diminuem para caber em até ~4 linhas.
  const fontSize = title.length > 90 ? 52 : title.length > 60 ? 62 : 74;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px",
          background: COLORS.bg,
          color: COLORS.fg,
          backgroundImage: `radial-gradient(${COLORS.dot} 1.5px, transparent 1.5px)`,
          backgroundSize: "28px 28px",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 26, letterSpacing: 4 }}>
          <span style={{ color: COLORS.muted }}>[ ] DATACONSTRUCTION</span>
          <span style={{ color: COLORS.accent, textTransform: "uppercase" }}>{eyebrow}</span>
        </div>
        <div style={{ display: "flex", fontSize, fontWeight: 700, lineHeight: 1.08, maxWidth: 1000 }}>{title}</div>
        <div style={{ display: "flex", alignItems: "center", gap: 16, fontSize: 26, color: COLORS.muted }}>
          <div style={{ width: 40, height: 4, background: COLORS.copper }} />
          {footer ?? "Dados na prática"}
        </div>
      </div>
    ),
    OG_SIZE,
  );
}
