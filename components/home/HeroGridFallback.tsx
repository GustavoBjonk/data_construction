import {
  PARTICLE_TONES,
  WAVE_AMPLITUDE,
  cellHash,
  nearnessOf,
  particleAlpha,
  particleRadius,
  particleTone,
  projectionFor,
  rowDepth,
  surface,
} from "./particleGrid";

/**
 * Quadro estático da malha de partículas, exibido quando o canvas não anima
 * (`prefers-reduced-motion`, Canvas 2D indisponível ou JavaScript desativado,
 * via classe `no-js` em <html>). Gerado no servidor
 * com a mesma geometria do HeroCanvas; pontos agrupados em poucos <path>
 * (traço arredondado de comprimento zero) para manter o HTML leve.
 */

const VIEW_WIDTH = 1440;
const VIEW_HEIGHT = 800;
const COLS = 48;
const ROWS = 22;
const FROZEN_TIME = 2.4;

function buildPaths() {
  const { focal, horizon, span } = projectionFor(VIEW_WIDTH, VIEW_HEIGHT);
  const groups = new Map<string, string[]>();

  for (let r = 0; r < ROWS; r++) {
    const z = rowDepth(r / (ROWS - 1));
    const nearness = nearnessOf(z);
    // Raio quantizado em 0,5px e opacidade em 0,1 para reduzir grupos.
    const width = Math.round(particleRadius(nearness) * 4) / 2;

    for (let c = 0; c < COLS; c++) {
      const u = c / (COLS - 1) - 0.5;
      const x = u * span;
      const n = surface(x, z, FROZEN_TIME);
      const alpha = Math.round(particleAlpha(nearness, u, n) * 10) / 10;
      if (alpha <= 0) continue;

      const sx = VIEW_WIDTH * 0.6 + (x * focal) / z;
      const sy = horizon + ((1 - n * WAVE_AMPLITUDE) * focal) / z;
      if (sx < 0 || sx > VIEW_WIDTH || sy > VIEW_HEIGHT) continue;

      const key = `${particleTone(n, cellHash(c, r))}|${width}|${alpha}`;
      const points = groups.get(key) ?? [];
      points.push(`M${sx.toFixed(1)} ${sy.toFixed(1)}h0`);
      groups.set(key, points);
    }
  }

  return Array.from(groups, ([key, points]) => {
    const [tone, width, alpha] = key.split("|") as [keyof typeof PARTICLE_TONES, string, string];
    return { key, d: points.join(""), stroke: `rgb(${PARTICLE_TONES[tone]})`, width, alpha };
  });
}

const PATHS = buildPaths();

export function HeroGridFallback() {
  return (
    <svg
      aria-hidden="true"
      viewBox={`0 0 ${VIEW_WIDTH} ${VIEW_HEIGHT}`}
      preserveAspectRatio="xMidYMid slice"
      className="absolute inset-0 hidden h-full w-full motion-reduce:block peer-data-[state=off]:block [.no-js_&]:block"
      fill="none"
      strokeLinecap="round"
    >
      {PATHS.map((path) => (
        <path key={path.key} d={path.d} stroke={path.stroke} strokeWidth={path.width} strokeOpacity={path.alpha} />
      ))}
    </svg>
  );
}
