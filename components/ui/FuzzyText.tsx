"use client";

import { useEffect, useRef } from "react";
import { approach, introIntensity, pulseIntensity } from "./fuzzyMotion";

/**
 * Texto com distorção digital horizontal: fatias finas da palavra oscilam
 * lateralmente, mais fortes na abertura e sob o cursor.
 *
 * O texto HTML continua sendo o conteúdo real (SEO, leitores de tela, sem
 * JavaScript, LCP); o canvas é só uma camada visual sobreposta, ativada
 * depois que as fontes carregam e com o texto HTML ficando transparente
 * sem sair do fluxo, então não há deslocamento de layout.
 *
 * Desempenho: quadros limitados a `fps`, pausa fora da viewport e com a aba
 * oculta. Sem cursor fino (toque) não há distorção contínua: roda a abertura
 * (mais longa, para ser percebida) e depois só pulsos curtos e espaçados; entre
 * eles o loop para e o texto HTML estático volta. Com `prefers-reduced-motion`
 * não anima.
 */

/** Intensidade inicial da abertura (fração de `fuzzRange`). */
const INTRO_PEAK = 0.75;
/** Toque: a abertura dura mais, senão o decaimento rápido passa despercebido. */
const TOUCH_INTRO_STRETCH = 1.5;
/** Toque: pulsos de glitch ocasionais depois da abertura. */
const TOUCH_PULSE_PEAK = 0.35;
const TOUCH_PULSE_MS = 320;
const TOUCH_PULSE_MIN_GAP_MS = 6000;
const TOUCH_PULSE_GAP_JITTER_MS = 6000;
/** Margem vertical do canvas, em em: acentos e descendentes passam da caixa de linha. */
const VERTICAL_BLEED = 0.35;
const MAX_DPR = 2;

interface FuzzOptions {
  /** Intensidade em repouso (fração de `fuzzRange`). */
  baseIntensity: number;
  /** Intensidade com o cursor sobre o texto (fração de `fuzzRange`). */
  hoverIntensity: number;
  enableHover: boolean;
  /** Deslocamento horizontal máximo das fatias, em px. */
  fuzzRange: number;
  fps: number;
  /** Suavização entre intensidades, em quadros. */
  transitionDuration: number;
  /** Altura de cada fatia, em px. */
  sliceSize: number;
  intro: boolean;
  /** Duração da abertura, em ms. */
  introDuration: number;
}

interface FuzzyTextProps extends Partial<FuzzOptions> {
  children: string;
  className?: string;
}

export function FuzzyText({
  children,
  className = "",
  baseIntensity = 0.08,
  hoverIntensity = 0.4,
  enableHover = true,
  fuzzRange = 18,
  fps = 30,
  transitionDuration = 12,
  sliceSize = 2,
  intro = true,
  introDuration = 1200,
}: FuzzyTextProps) {
  const rootRef = useRef<HTMLSpanElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const baselineRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    const canvas = canvasRef.current;
    const baseline = baselineRef.current;
    if (!root || !canvas || !baseline) return;
    const options: FuzzOptions = {
      baseIntensity,
      hoverIntensity,
      enableHover,
      fuzzRange,
      fps,
      transitionDuration,
      sliceSize,
      intro,
      introDuration,
    };
    // Mesmo padrão do HeroCanvas: a preferência pode mudar com a página aberta.
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const run = () => (reducedMotion.matches ? undefined : animate(root, canvas, baseline, children, options));
    let teardown = run();
    const onMotionChange = () => {
      teardown?.();
      teardown = run();
    };
    reducedMotion.addEventListener("change", onMotionChange);
    return () => {
      reducedMotion.removeEventListener("change", onMotionChange);
      teardown?.();
    };
  }, [children, baseIntensity, hoverIntensity, enableHover, fuzzRange, fps, transitionDuration, sliceSize, intro, introDuration]);

  return (
    <span ref={rootRef} className={`group/fuzz relative inline-block data-[fuzz=on]:text-transparent ${className}`}>
      {children}
      {/* Marcador de altura zero alinhado à linha de base: posiciona o texto no canvas. */}
      <span ref={baselineRef} aria-hidden="true" className="inline-block h-0 w-0" />
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className="pointer-events-none absolute hidden group-data-[fuzz=on]/fuzz:block"
      />
    </span>
  );
}

/** Inicia o efeito e devolve a função que o encerra. */
function animate(
  root: HTMLElement,
  canvas: HTMLCanvasElement,
  baseline: HTMLElement,
  text: string,
  options: FuzzOptions,
): (() => void) | undefined {
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  const ctx = canvas.getContext("2d");
  const source = document.createElement("canvas");
  const sourceCtx = source.getContext("2d");
  if (!ctx || !sourceCtx) return;

  const frameMs = 1000 / options.fps;
  // Lida antes de o texto HTML ficar transparente.
  const color = getComputedStyle(root).color;

  let width = 0;
  let height = 0;
  let bleedX = 0;
  let bleedY = 0;
  let dpr = 1;

  let cancelled = false;
  let frame = 0;
  let running = false;
  let visible = true;
  let hovering = false;
  let lastTime = 0;
  let introStart = -1;
  let intensity = options.intro ? INTRO_PEAK : options.baseIntensity;
  // Toque: rajada em andamento (abertura ou pulso); fora dela o loop fica parado.
  let burst: "intro" | "pulse" | null = options.intro ? "intro" : null;
  let burstStart = -1;
  let pulseTimer = 0;

  /** Mede o texto e o desenha uma vez no canvas de origem, já com a margem. */
  function measure() {
    if (!ctx || !sourceCtx) return;
    const style = getComputedStyle(root);
    width = root.offsetWidth;
    height = root.offsetHeight;
    bleedX = Math.ceil(options.fuzzRange) + 2;
    bleedY = Math.ceil(parseFloat(style.fontSize) * VERTICAL_BLEED);
    dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);

    const outerWidth = width + bleedX * 2;
    const outerHeight = height + bleedY * 2;
    for (const target of [canvas, source]) {
      target.width = Math.round(outerWidth * dpr);
      target.height = Math.round(outerHeight * dpr);
    }
    canvas.style.left = `${-bleedX}px`;
    canvas.style.top = `${-bleedY}px`;
    canvas.style.width = `${outerWidth}px`;
    canvas.style.height = `${outerHeight}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    sourceCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
    sourceCtx.font = `${style.fontStyle} ${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
    sourceCtx.letterSpacing = style.letterSpacing === "normal" ? "0px" : style.letterSpacing;
    sourceCtx.fillStyle = color;
    sourceCtx.textBaseline = "alphabetic";
    const label = style.textTransform === "uppercase" ? text.toLocaleUpperCase("pt-BR") : text;
    sourceCtx.fillText(label, bleedX, bleedY + baseline.offsetTop);
  }

  function draw() {
    if (!ctx) return;
    const outerWidth = width + bleedX * 2;
    const outerHeight = height + bleedY * 2;
    const maxOffset = intensity * options.fuzzRange;
    const slice = Math.max(1, options.sliceSize);
    ctx.clearRect(0, 0, outerWidth, outerHeight);
    for (let y = 0; y < outerHeight; y += slice) {
      const h = Math.min(slice, outerHeight - y);
      const dx = (Math.random() * 2 - 1) * maxOffset;
      ctx.drawImage(source, 0, y * dpr, source.width, h * dpr, dx, y, outerWidth, h);
    }
  }

  function tick(time: number) {
    frame = requestAnimationFrame(tick);
    // Tolerância de 1 ms para não perder quadros alternados em telas de 60 Hz.
    if (lastTime && time - lastTime < frameMs - 1) return;
    const frames = lastTime ? Math.min(time - lastTime, 100) / frameMs : 1;
    lastTime = time;

    if (!finePointer) {
      if (burstStart < 0) burstStart = time;
      const elapsed = time - burstStart;
      const duration = burst === "intro" ? options.introDuration * TOUCH_INTRO_STRETCH : TOUCH_PULSE_MS;
      if (elapsed >= duration) {
        // Rajada concluída: volta ao texto HTML, para o loop e agenda o próximo pulso.
        stop();
        delete root.dataset.fuzz;
        burst = null;
        schedulePulse();
        return;
      }
      intensity =
        burst === "intro"
          ? introIntensity(elapsed, duration, INTRO_PEAK, 0)
          : pulseIntensity(elapsed, duration, TOUCH_PULSE_PEAK);
      draw();
      root.dataset.fuzz = "on";
      return;
    }

    if (introStart < 0) introStart = time;
    const rest = hovering ? options.hoverIntensity : options.baseIntensity;
    const introElapsed = time - introStart;
    const inIntro = options.intro && introElapsed < options.introDuration;
    intensity = inIntro
      ? introIntensity(introElapsed, options.introDuration, INTRO_PEAK, rest)
      : approach(intensity, rest, options.transitionDuration, frames);
    draw();
    root.dataset.fuzz = "on";
  }

  /** Toque: próximo pulso em intervalo aleatório; fora da tela, espera voltar a ficar visível. */
  function schedulePulse() {
    window.clearTimeout(pulseTimer);
    pulseTimer = window.setTimeout(
      () => {
        burst = "pulse";
        burstStart = -1;
        start();
      },
      TOUCH_PULSE_MIN_GAP_MS + Math.random() * TOUCH_PULSE_GAP_JITTER_MS,
    );
  }

  function start() {
    if (cancelled || running || !visible || document.hidden) return;
    if (!finePointer && !burst) return;
    running = true;
    lastTime = 0;
    frame = requestAnimationFrame(tick);
  }

  function stop() {
    running = false;
    cancelAnimationFrame(frame);
  }

  const resizeObserver = new ResizeObserver(() => {
    measure();
    if (!running && root.dataset.fuzz) draw();
  });
  const intersectionObserver = new IntersectionObserver(([entry]) => {
    visible = Boolean(entry?.isIntersecting);
    if (visible) start();
    else stop();
  });
  const onVisibility = () => (document.hidden ? stop() : start());
  const onPointerEnter = () => (hovering = true);
  const onPointerLeave = () => (hovering = false);
  const hoverEnabled = finePointer && options.enableHover;

  // Espera a fonte web: medir antes desenharia o canvas com a fonte de fallback.
  document.fonts.ready.then(() => {
    if (cancelled) return;
    measure();
    resizeObserver.observe(root);
    intersectionObserver.observe(root);
    document.addEventListener("visibilitychange", onVisibility);
    if (hoverEnabled) {
      root.addEventListener("pointerenter", onPointerEnter);
      root.addEventListener("pointerleave", onPointerLeave);
    }
    if (!finePointer && !burst) schedulePulse();
    start();
  });

  return () => {
    cancelled = true;
    stop();
    window.clearTimeout(pulseTimer);
    resizeObserver.disconnect();
    intersectionObserver.disconnect();
    document.removeEventListener("visibilitychange", onVisibility);
    root.removeEventListener("pointerenter", onPointerEnter);
    root.removeEventListener("pointerleave", onPointerLeave);
    delete root.dataset.fuzz;
  };
}
