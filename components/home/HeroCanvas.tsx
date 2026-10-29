"use client";

import { useEffect, useRef } from "react";
import {
  COMPACT_WIDTH,
  PARTICLE_TONES,
  WAVE_AMPLITUDE,
  Z_FAR,
  Z_NEAR,
  cellHash,
  densityFor,
  nearnessOf,
  particleAlpha,
  particleRadius,
  particleTone,
  projectionFor,
  rowDepth,
  surface,
  type ParticleTone,
} from "./particleGrid";

/**
 * Malha 3D de partículas em ondas, com deformação local sob o cursor e
 * sequência de entrada (surgir → ganhar profundidade → onda percorre).
 *
 * Desempenho: Canvas 2D, densidade adaptada à largura, DPR limitado,
 * sprites pré-renderizados, pausa fora da viewport e com a aba oculta.
 * Com `prefers-reduced-motion` (ou sem Canvas 2D) não anima: o CSS exibe
 * o fallback SVG irmão (HeroGridFallback).
 */

const INTRO_MS = 2000;
/** Velocidade do relógio da onda (unidades por ms). */
const WAVE_SPEED = 0.00045;
const POINTER_RADIUS = 170; // px
const POINTER_LIFT = 44; // px na fileira mais próxima
const SPRITE_SIZE = 32;

const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);
const easeOutCubic = (v: number) => 1 - (1 - v) ** 3;
const easeInOutSine = (v: number) => 0.5 - Math.cos(Math.PI * v) / 2;

/** Círculo nítido pré-renderizado: drawImage é mais barato que arc() por partícula. */
function createSprite(rgb: string) {
  const sprite = document.createElement("canvas");
  sprite.width = sprite.height = SPRITE_SIZE;
  const ctx = sprite.getContext("2d");
  if (ctx) {
    ctx.fillStyle = `rgb(${rgb})`;
    ctx.beginPath();
    ctx.arc(SPRITE_SIZE / 2, SPRITE_SIZE / 2, SPRITE_SIZE / 2 - 1, 0, Math.PI * 2);
    ctx.fill();
  }
  return sprite;
}

export function HeroCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    // A preferência pode mudar com a página aberta (ex.: efeitos de animação
    // do sistema): o CSS troca canvas/fallback na hora, então o loop acompanha.
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let teardown = reducedMotion.matches ? undefined : animate(canvas);
    const onMotionChange = () => {
      teardown?.();
      teardown = reducedMotion.matches ? undefined : animate(canvas);
    };
    reducedMotion.addEventListener("change", onMotionChange);
    return () => {
      reducedMotion.removeEventListener("change", onMotionChange);
      teardown?.();
    };
  }, []);

  return <canvas ref={canvasRef} aria-hidden="true" className="peer absolute inset-0 h-full w-full motion-reduce:hidden" />;
}

/** Inicia a animação no canvas e devolve a função que a encerra. */
function animate(canvas: HTMLCanvasElement): (() => void) | undefined {
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    canvas.dataset.state = "off";
    return;
  }

  const finePointer = window.matchMedia("(pointer: fine)").matches;
  // A abertura só roda no primeiro carregamento (ver IntroGate).
  const playIntro = !document.documentElement.classList.contains("intro-done");

  const sprites: Record<ParticleTone, HTMLCanvasElement> = {
    primary: createSprite(PARTICLE_TONES.primary),
    secondary: createSprite(PARTICLE_TONES.secondary),
    highlight: createSprite(PARTICLE_TONES.highlight),
  };

  let width = 0;
  let height = 0;
  let compact = false;
  let density = densityFor(window.innerWidth);
  let projection = projectionFor(1, 1);
  let rowY = new Float32Array(0);
  let rowX = new Float32Array(0);
  let rowN = new Float32Array(0);

  let frame = 0;
  let running = false;
  let visible = true;
  let lastTime = 0;
  let clock = INTRO_MS * 2; // relógio da onda; não salta após pausas
  let introClock = playIntro ? 0 : INTRO_MS;
  const pointer = { x: 0, y: 0, tx: 0, ty: 0, strength: 0, target: 0 };

  function resize() {
    if (!canvas || !ctx) return;
    const rect = canvas.getBoundingClientRect();
    width = rect.width;
    height = rect.height;
    compact = width < COMPACT_WIDTH;
    const dpr = Math.min(window.devicePixelRatio || 1, compact ? 1.5 : 2);
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    density = densityFor(width);
    projection = projectionFor(width, height);
    rowX = new Float32Array(density.cols);
    rowY = new Float32Array(density.cols);
    rowN = new Float32Array(density.cols);
  }

  function draw() {
    if (!ctx) return;
    const { cols, rows } = density;
    const { focal, horizon, span } = projection;
    const t = clock * WAVE_SPEED;
    const intro = clamp01(introClock / INTRO_MS);

    // Entrada: profundidade (câmera sobe, amplitude cresce) e frente de onda.
    const depthIn = easeOutCubic(clamp01((intro - 0.1) / 0.7));
    const cameraHeight = 0.72 + 0.28 * easeOutCubic(clamp01(intro / 0.9));
    const amplitude = WAVE_AMPLITUDE * depthIn * (compact ? 0.75 : 1);
    const sweep = clamp01((intro - 0.3) / 0.7);
    const frontZ = Z_NEAR - 0.3 + (Z_FAR - Z_NEAR + 0.9) * easeInOutSine(sweep);
    const frontPower = Math.sin(Math.PI * sweep);

    // Leve paralaxe horizontal seguindo o cursor.
    const centerX = width * (compact ? 0.5 : 0.6) + (pointer.x / (width || 1) - 0.5) * 14 * pointer.strength;
    const pointerActive = pointer.strength > 0.01;
    const radius2 = POINTER_RADIUS * POINTER_RADIUS;
    const reach2 = radius2 * 6;

    ctx.clearRect(0, 0, width, height);

    for (let r = 0; r < rows; r++) {
      const s = r / (rows - 1); // 0 = fundo, 1 = frente
      const z = rowDepth(s);
      const inv = 1 / z;
      const nearness = nearnessOf(z);
      const front = frontPower > 0 ? 0.22 * frontPower * Math.exp(-(((z - frontZ) / 0.4) ** 2)) : 0;
      const reveal = intro * 1.5 - (1 - s) * 0.6;

      // Posições da fileira (usadas pela linha de conexão e pelos pontos).
      for (let c = 0; c < cols; c++) {
        const x = (c / (cols - 1) - 0.5) * span;
        const n = surface(x, z, t);
        let sx = centerX + x * focal * inv;
        let sy = horizon + (cameraHeight - n * amplitude - front) * focal * inv;

        if (pointerActive) {
          const dx = sx - pointer.x;
          const dy = (sy - pointer.y) * 1.4;
          const d2 = dx * dx + dy * dy;
          if (d2 < reach2) {
            const ripple = 0.75 + 0.25 * Math.cos(Math.sqrt(d2) * 0.05 - clock * 0.003);
            sy -= pointer.strength * Math.exp(-d2 / radius2) * ripple * POINTER_LIFT * (0.35 + 0.65 * nearness);
          }
        }
        rowX[c] = sx;
        rowY[c] = sy;
        rowN[c] = n;
      }

      // Linha de conexão extremamente discreta ao longo da fileira.
      const lineAlpha = (0.03 + 0.06 * nearness) * clamp01((reveal - 0.15) / 0.3);
      if (lineAlpha > 0.005) {
        ctx.beginPath();
        ctx.moveTo(rowX[0] ?? 0, rowY[0] ?? 0);
        for (let c = 1; c < cols; c++) ctx.lineTo(rowX[c] ?? 0, rowY[c] ?? 0);
        ctx.globalAlpha = lineAlpha;
        ctx.strokeStyle = `rgb(${PARTICLE_TONES.secondary})`;
        ctx.lineWidth = 0.6;
        ctx.stroke();
      }

      const baseRadius = particleRadius(nearness) * (compact ? 0.85 : 1);
      for (let c = 0; c < cols; c++) {
        const sx = rowX[c] ?? 0;
        const sy = rowY[c] ?? 0;
        if (sx < -4 || sx > width + 4 || sy < -4 || sy > height + 4) continue;

        const hash = cellHash(c, r);
        const appear = clamp01((reveal - hash * 0.3) / 0.3);
        if (appear <= 0) continue;

        const u = c / (cols - 1) - 0.5;
        const n = rowN[c] ?? 0;
        let glow = front * 2.5;
        if (pointerActive) {
          const dx = sx - pointer.x;
          const dy = (sy - pointer.y) * 1.4;
          glow += pointer.strength * Math.exp(-(dx * dx + dy * dy) / radius2);
        }

        let tone = particleTone(n, hash);
        if (tone === "secondary" && glow > 0.4) tone = "primary";
        const alpha = Math.min(1, particleAlpha(nearness, u, n) * appear + glow * 0.3 * appear);
        if (alpha < 0.02) continue;

        const size = baseRadius * (1 + glow * 0.35) * 2;
        ctx.globalAlpha = alpha;
        ctx.drawImage(sprites[tone], sx - size / 2, sy - size / 2, size, size);
      }
    }
    ctx.globalAlpha = 1;
  }

  function loop(time: number) {
    // dt limitado evita saltos após travamentos.
    const dt = lastTime ? Math.min(time - lastTime, 50) : 16.7;
    lastTime = time;
    clock += dt;
    if (introClock < INTRO_MS) introClock += dt;

    // Interpolação independente da taxa de quadros.
    const follow = 1 - Math.pow(1 - 0.08, dt / 16.7);
    const fade = 1 - Math.pow(1 - 0.05, dt / 16.7);
    pointer.x += (pointer.tx - pointer.x) * follow;
    pointer.y += (pointer.ty - pointer.y) * follow;
    pointer.strength += (pointer.target - pointer.strength) * fade;

    draw();
    frame = requestAnimationFrame(loop);
  }

  function start() {
    if (running || !visible || document.hidden) return;
    running = true;
    lastTime = 0;
    frame = requestAnimationFrame(loop);
  }

  function stop() {
    running = false;
    cancelAnimationFrame(frame);
  }

  resize();

  const resizeObserver = new ResizeObserver(() => {
    resize();
    if (!running) draw();
  });
  resizeObserver.observe(canvas);

  const intersectionObserver = new IntersectionObserver(([entry]) => {
    visible = Boolean(entry?.isIntersecting);
    if (visible) start();
    else stop();
  });
  intersectionObserver.observe(canvas);

  const onVisibility = () => (document.hidden ? stop() : start());
  document.addEventListener("visibilitychange", onVisibility);

  const onPointerMove = (event: PointerEvent) => {
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const inside = x >= 0 && y >= 0 && x <= rect.width && y <= rect.height;
    if (inside && pointer.strength < 0.01) {
      // Começa onde o cursor entrou, sem atravessar a malha.
      pointer.x = x;
      pointer.y = y;
    }
    pointer.tx = x;
    pointer.ty = y;
    pointer.target = inside ? 1 : 0;
  };
  const onPointerLeave = () => {
    pointer.target = 0;
  };
  if (finePointer) {
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", onPointerLeave);
  }

  start();

  return () => {
    stop();
    resizeObserver.disconnect();
    intersectionObserver.disconnect();
    document.removeEventListener("visibilitychange", onVisibility);
    window.removeEventListener("pointermove", onPointerMove);
    document.documentElement.removeEventListener("pointerleave", onPointerLeave);
  };
}
