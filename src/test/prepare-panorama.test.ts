import { describe, expect, it } from "vitest";
import { panoramaFit } from "@/lib/prepare-panorama";

describe("guided panorama sizing", () => {
  it.each([
    [8000, 4000],
    [4001, 2000],
    [3600, 2000],
    [4400, 2000],
  ])("fits %i by %i into an exact 2:1 image without cropping or stretching", (width, height) => {
    const fit = panoramaFit(width, height);
    expect(fit.width).toBe(fit.height * 2);
    expect(fit.width).toBeLessThanOrEqual(4096);
    expect(fit.drawWidth / fit.drawHeight).toBeCloseTo(width / height);
    expect(fit.x).toBeGreaterThanOrEqual(0);
    expect(fit.y).toBeGreaterThanOrEqual(0);
    expect(fit.x + fit.drawWidth).toBeLessThanOrEqual(fit.width);
    expect(fit.y + fit.drawHeight).toBeLessThanOrEqual(fit.height);
  });
  it.each([
    [0, 0],
    [Infinity, 2000],
    [3000, 4000],
    [4000, 3000],
    [8000, 1500],
  ])("rejects invalid or partial panorama dimensions %i by %i", (width, height) => {
    expect(() => panoramaFit(width, height)).toThrow("full-sphere export");
  });
});
