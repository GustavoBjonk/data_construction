/**
 * Ilustrações abstratas geradas em SVG, inspiradas em estruturas de dados.
 * Substituem fotos de banco de imagens (sem dependência de licenças) e são
 * determinísticas: o mesmo `seed` gera sempre a mesma imagem.
 */

export type DataArtVariant = "wave" | "planes" | "sphere" | "bars" | "network";

const VARIANTS: DataArtVariant[] = ["wave", "planes", "sphere", "bars", "network"];

const WIDTH = 400;
const HEIGHT = 225;

function hash(value: string): number {
  let h = 2166136261;
  for (let i = 0; i < value.length; i++) {
    h ^= value.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** Gerador pseudoaleatório simples (mulberry32). */
function random(seed: number) {
  let t = seed;
  return () => {
    t = (t + 0x6d2b79f5) | 0;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r = (r + Math.imul(r ^ (r >>> 7), 61 | r)) ^ r;
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

const round = (n: number) => Math.round(n * 10) / 10;

function Wave({ rand }: { rand: () => number }) {
  const phase = rand() * Math.PI * 2;
  const rows = 9;
  const cols = 34;
  const dots: React.ReactNode[] = [];
  for (let r = 0; r < rows; r++) {
    const depth = r / (rows - 1);
    for (let c = 0; c < cols; c++) {
      const x = (c / (cols - 1)) * WIDTH;
      const y =
        70 + r * 14 + Math.sin(c * 0.28 + phase + r * 0.45) * (18 - depth * 6) + Math.cos(c * 0.11 + r) * 6;
      dots.push(
        <circle key={`${r}-${c}`} cx={round(x)} cy={round(y)} r={round(0.7 + depth * 0.9)} opacity={round(0.25 + depth * 0.6)} />,
      );
    }
  }
  return <g fill="rgb(var(--color-fg))">{dots}</g>;
}

function Planes({ rand }: { rand: () => number }) {
  const count = 4 + Math.floor(rand() * 2);
  return (
    <g fill="none">
      {Array.from({ length: count }, (_, i) => {
        const y = 60 + i * 26;
        const cx = 200 + (rand() - 0.5) * 30;
        const w = 120 - i * 6;
        const points = `${cx},${y - 30} ${cx + w},${y} ${cx},${y + 30} ${cx - w},${y}`;
        return (
          <g key={i}>
            <polygon points={points} fill="rgb(var(--color-fg) / 0.04)" stroke="rgb(var(--color-fg) / 0.35)" strokeWidth="0.75" />
            {i === 1 && <polygon points={points} fill="rgb(var(--color-accent) / 0.08)" stroke="rgb(var(--color-accent) / 0.7)" strokeWidth="0.75" />}
          </g>
        );
      })}
      <line x1="200" y1="20" x2="200" y2="215" stroke="rgb(var(--color-accent) / 0.5)" strokeWidth="0.75" strokeDasharray="2 4" />
    </g>
  );
}

function Sphere({ rand }: { rand: () => number }) {
  const tilt = 0.3 + rand() * 0.3;
  const cx = 200;
  const cy = 150;
  const radius = 120;
  const dots: React.ReactNode[] = [];
  for (let lat = 1; lat < 12; lat++) {
    const theta = (lat / 12) * Math.PI;
    const ring = Math.sin(theta) * radius;
    const yBase = Math.cos(theta) * radius;
    const steps = Math.round(ring / 5);
    for (let s = 0; s < steps; s++) {
      const phi = (s / steps) * Math.PI * 2;
      const z = Math.sin(phi) * ring;
      if (z < -10) continue;
      const x = cx + Math.cos(phi) * ring;
      const y = cy - yBase * Math.cos(tilt) + z * Math.sin(tilt) * 0.4;
      dots.push(<circle key={`${lat}-${s}`} cx={round(x)} cy={round(y)} r="0.9" opacity={round(0.2 + (z / ring) * 0.6)} />);
    }
  }
  return (
    <g>
      <circle cx={cx} cy={cy} r={radius} fill="none" stroke="rgb(var(--color-accent) / 0.35)" strokeWidth="0.75" />
      <g fill="rgb(var(--color-fg))">{dots}</g>
    </g>
  );
}

function Bars({ rand }: { rand: () => number }) {
  const count = 22;
  const gap = WIDTH / count;
  return (
    <g>
      {Array.from({ length: count }, (_, i) => {
        const h = 30 + Math.abs(Math.sin(i * 0.5 + rand() * 0.6)) * 120 + rand() * 20;
        const highlight = i === 14;
        return (
          <rect
            key={i}
            x={round(i * gap + gap * 0.3)}
            y={round(HEIGHT - 20 - h)}
            width={round(gap * 0.4)}
            height={round(h)}
            fill={highlight ? "rgb(var(--color-accent) / 0.85)" : "rgb(var(--color-fg) / 0.18)"}
          />
        );
      })}
      <line x1="0" y1={HEIGHT - 20} x2={WIDTH} y2={HEIGHT - 20} stroke="rgb(var(--color-fg) / 0.3)" strokeWidth="0.75" />
    </g>
  );
}

function Network({ rand }: { rand: () => number }) {
  const nodes = Array.from({ length: 26 }, () => ({ x: 20 + rand() * 360, y: 20 + rand() * 185 }));
  const edges: React.ReactNode[] = [];
  nodes.forEach((a, i) => {
    nodes.slice(i + 1).forEach((b, j) => {
      const d = Math.hypot(a.x - b.x, a.y - b.y);
      if (d < 70) {
        edges.push(
          <line key={`${i}-${j}`} x1={round(a.x)} y1={round(a.y)} x2={round(b.x)} y2={round(b.y)} opacity={round(1 - d / 70)} />,
        );
      }
    });
  });
  return (
    <g>
      <g stroke="rgb(var(--color-fg) / 0.35)" strokeWidth="0.6">{edges}</g>
      {nodes.map((n, i) => (
        <circle
          key={i}
          cx={round(n.x)}
          cy={round(n.y)}
          r={i % 9 === 0 ? 2.4 : 1.4}
          fill={i % 9 === 0 ? "rgb(var(--color-accent))" : "rgb(var(--color-fg) / 0.7)"}
        />
      ))}
    </g>
  );
}

const RENDERERS: Record<DataArtVariant, (props: { rand: () => number }) => React.ReactNode> = {
  wave: Wave,
  planes: Planes,
  sphere: Sphere,
  bars: Bars,
  network: Network,
};

interface DataArtProps {
  seed: string;
  variant?: DataArtVariant;
  /** Número exibido no canto (ex.: "01"), como na composição editorial. */
  index?: string;
  className?: string;
}

export function DataArt({ seed, variant, index, className = "" }: DataArtProps) {
  const h = hash(seed);
  const chosen = variant ?? VARIANTS[h % VARIANTS.length] ?? "wave";
  const Renderer = RENDERERS[chosen];

  return (
    <div className={`relative aspect-video overflow-hidden bg-[radial-gradient(120%_90%_at_50%_0%,rgb(var(--color-elevated))_0%,rgb(var(--color-bg))_70%)] ${className}`}>
      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        preserveAspectRatio="xMidYMid slice"
        className="absolute inset-0 h-full w-full transition-transform duration-700 ease-out-expo group-hover:scale-[1.04]"
        aria-hidden="true"
        focusable="false"
      >
        <Renderer rand={random(h)} />
      </svg>
      {index && (
        <span aria-hidden="true" className="absolute right-3 top-2 font-display text-2xl font-medium text-fg/25">
          {index}
        </span>
      )}
    </div>
  );
}
