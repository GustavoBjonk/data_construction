/**
 * Geometria da malha de partículas do Hero, compartilhada entre o canvas
 * animado (HeroCanvas) e o fallback SVG estático (HeroGridFallback).
 *
 * Modelo: um plano de partículas visto por uma câmera a altura 1, com
 * profundidade z entre Z_NEAR e Z_FAR, projetado em perspectiva para 2D.
 */

export const PARTICLE_TONES = {
  primary: "115, 214, 199", // #73D6C7
  secondary: "155, 168, 167", // #9BA8A7
  highlight: "217, 168, 117", // #D9A875
} as const;

export type ParticleTone = keyof typeof PARTICLE_TONES;

export interface GridDensity {
  cols: number;
  rows: number;
}

/** Abaixo desta largura (px) a malha usa densidade e projeção compactas. */
export const COMPACT_WIDTH = 640;

/** Densidade limitada por largura: menos partículas em telas pequenas. */
export function densityFor(width: number): GridDensity {
  if (width < COMPACT_WIDTH) return { cols: 34, rows: 18 };
  if (width < 1100) return { cols: 56, rows: 26 };
  return { cols: 80, rows: 34 };
}

export const Z_NEAR = 1;
export const Z_FAR = 4.2;
/** Altura da onda em unidades de mundo (câmera está a 1). */
export const WAVE_AMPLITUDE = 0.26;
/** Valor normalizado da superfície a partir do qual a partícula é crista. */
const CREST = 0.5;
/** Fração das partículas com destaque cobre. */
const HIGHLIGHT_RATIO = 0.014;

const HORIZON = 0.2; // fração da altura
const FOCAL = 0.78; // fração da altura
const NEAR_ROW_SPAN = 1.35; // largura da fileira mais próxima, em larguras do canvas

/*
 * Telas estreitas (retrato): a projeção padrão leva a fileira mais próxima
 * ao pé do Hero, sobre os indicadores, e afina demais as fileiras do fundo.
 * Aqui a malha sobe para a metade superior (fileira da frente em ~50% da
 * altura, acima dos indicadores) e fica mais larga, para a perspectiva não
 * virar um triângulo estreito.
 */
const COMPACT_HORIZON = 0.08;
const COMPACT_FOCAL = 0.42;
const COMPACT_NEAR_ROW_SPAN = 2;

export interface Projection {
  focal: number;
  horizon: number;
  /** Largura da malha em unidades de mundo. */
  span: number;
}

export function projectionFor(width: number, height: number): Projection {
  const compact = width < COMPACT_WIDTH;
  const focal = (compact ? COMPACT_FOCAL : FOCAL) * height;
  const horizon = (compact ? COMPACT_HORIZON : HORIZON) * height;
  return { focal, horizon, span: ((compact ? COMPACT_NEAR_ROW_SPAN : NEAR_ROW_SPAN) * width) / focal };
}

/** Profundidade da fileira `s` (0 = fundo, 1 = frente), em progressão geométrica. */
export function rowDepth(s: number) {
  return Z_FAR * (Z_NEAR / Z_FAR) ** s;
}

/** Proximidade corrigida pela perspectiva: 0 no fundo, 1 na frente. */
export function nearnessOf(z: number) {
  return (1 / z - 1 / Z_FAR) / (1 / Z_NEAR - 1 / Z_FAR);
}

/** Superfície ≈ -1..1: senos de frequências e direções distintas evitam repetição óbvia. */
export function surface(x: number, z: number, t: number) {
  return (
    0.5 * Math.sin(x * 1.7 + z * 0.8 + t * 0.9) +
    0.28 * Math.sin(x * 0.65 - z * 1.9 + t * 0.55) +
    0.16 * Math.cos((x + z) * 2.4 - t * 1.2) +
    0.08 * Math.sin(Math.hypot(x, z - 2) * 3.2 - t * 1.5)
  );
}

/** Ruído determinístico 0..1 por célula da malha. */
export function cellHash(col: number, row: number) {
  const n = Math.sin(col * 127.1 + row * 311.7) * 43758.5453;
  return n - Math.floor(n);
}

export function particleRadius(nearness: number) {
  return 0.6 + 1.9 * nearness ** 1.2;
}

/** Opacidade por distância, bordas laterais e iluminação das cristas. */
export function particleAlpha(nearness: number, u: number, n: number) {
  const edge = Math.abs(u) * 2; // 0 no centro, 1 na borda
  const edgeFade = edge < 0.62 ? 1 : Math.max(0, 1 - (edge - 0.62) / 0.38) ** 2;
  const light = 0.75 + 0.125 * (n + 1);
  return (0.2 + 0.8 * nearness) * edgeFade * light;
}

export function particleTone(n: number, hash: number): ParticleTone {
  if (hash < HIGHLIGHT_RATIO) return "highlight";
  return n > CREST ? "primary" : "secondary";
}
