import { describe, expect, it } from "vitest";
import { approach, introIntensity, pulseIntensity } from "@/components/ui/fuzzyMotion";

describe("introIntensity", () => {
  it("começa no pico e assenta no repouso", () => {
    expect(introIntensity(0, 1200, 0.75, 0.08)).toBe(0.75);
    expect(introIntensity(1200, 1200, 0.75, 0.08)).toBe(0.08);
    expect(introIntensity(5000, 1200, 0.75, 0.08)).toBe(0.08);
  });

  it("decresce de forma monotônica", () => {
    let previous = Infinity;
    for (let t = 0; t <= 1200; t += 100) {
      const value = introIntensity(t, 1200, 0.75, 0.08);
      expect(value).toBeLessThanOrEqual(previous);
      previous = value;
    }
  });

  it("sem duração vai direto ao repouso", () => {
    expect(introIntensity(0, 0, 0.75, 0.08)).toBe(0.08);
  });
});

describe("pulseIntensity", () => {
  it("começa e termina em zero, com pico no meio", () => {
    expect(pulseIntensity(0, 320, 0.35)).toBe(0);
    expect(pulseIntensity(320, 320, 0.35)).toBe(0);
    expect(pulseIntensity(160, 320, 0.35)).toBeCloseTo(0.35, 10);
  });

  it("nunca passa do pico nem fica negativo", () => {
    for (let t = -50; t <= 400; t += 10) {
      const value = pulseIntensity(t, 320, 0.35);
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThanOrEqual(0.35);
    }
  });

  it("sem duração não pulsa", () => {
    expect(pulseIntensity(10, 0, 0.35)).toBe(0);
  });
});

describe("approach", () => {
  it("move em direção ao alvo sem ultrapassá-lo", () => {
    const next = approach(0.08, 0.4, 12, 1);
    expect(next).toBeGreaterThan(0.08);
    expect(next).toBeLessThan(0.4);
  });

  it("independe da divisão dos quadros", () => {
    const twoSteps = approach(approach(0.4, 0.08, 12, 1), 0.08, 12, 1);
    expect(approach(0.4, 0.08, 12, 2)).toBeCloseTo(twoSteps, 10);
  });

  it("encaixa no alvo quando a diferença é desprezível", () => {
    expect(approach(0.0805, 0.08, 12, 1)).toBe(0.08);
    expect(approach(0.1, 0.4, 1, 1)).toBe(0.4);
  });
});
