/**
 * Cálculos puros do efeito FuzzyText (sem DOM), separados para teste.
 *
 * Intensidade é uma fração de `fuzzRange`: 0 = texto parado, 1 = fatias
 * deslocadas até `fuzzRange` px para cada lado.
 */

const easeOutCubic = (v: number) => 1 - (1 - v) ** 3;

/** Intensidade da abertura: parte de `peak` e assenta em `rest` ao fim de `durationMs`. */
export function introIntensity(elapsedMs: number, durationMs: number, peak: number, rest: number): number {
  if (durationMs <= 0 || elapsedMs >= durationMs) return rest;
  const progress = easeOutCubic(Math.max(0, elapsedMs) / durationMs);
  return peak + (rest - peak) * progress;
}

/** Pulso curto de glitch: meia senoide de 0 até `peak` e de volta a 0 em `durationMs`. */
export function pulseIntensity(elapsedMs: number, durationMs: number, peak: number): number {
  if (durationMs <= 0 || elapsedMs <= 0 || elapsedMs >= durationMs) return 0;
  return peak * Math.sin((Math.PI * elapsedMs) / durationMs);
}

/**
 * Aproxima `current` de `target` como uma suavização exponencial em que
 * `transitionFrames` quadros cobrem ~63% da distância; independe da taxa
 * real de quadros porque `frames` pode ser fracionário.
 */
export function approach(current: number, target: number, transitionFrames: number, frames: number): number {
  if (transitionFrames <= 1) return target;
  const step = 1 - Math.pow(1 - 1 / transitionFrames, frames);
  const next = current + (target - current) * step;
  return Math.abs(target - next) < 0.001 ? target : next;
}
