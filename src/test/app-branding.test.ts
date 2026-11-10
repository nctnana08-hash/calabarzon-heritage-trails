import { describe, it, expect, beforeEach } from "vitest";
import {
  DEFAULT_BRANDING,
  LOGO_PRESETS,
  getStoredBranding,
  saveStoredBranding,
  resetStoredBranding,
} from "@/lib/app-branding";

describe("App Branding Customization Store", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("returns DEFAULT_BRANDING when localStorage is empty", () => {
    const branding = getStoredBranding();
    expect(branding.appName).toBe("Sulyap");
    expect(branding.appBadge).toBe("PH");
    expect(branding.logoType).toBe("preset");
    expect(branding.presetId).toBe("sun");
    expect(branding.primaryColor).toBe("#0038A8");
  });

  it("persists custom app name, badge, and tagline", () => {
    saveStoredBranding({
      ...DEFAULT_BRANDING,
      appName: "Lakbay Kultura",
      appBadge: "APP",
      appTagline: "Interactive 360 Virtual Tour",
    });

    const loaded = getStoredBranding();
    expect(loaded.appName).toBe("Lakbay Kultura");
    expect(loaded.appBadge).toBe("APP");
    expect(loaded.appTagline).toBe("Interactive 360 Virtual Tour");
  });

  it("supports custom uploaded logo image and preset emblems", () => {
    const customDataUrl =
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";
    saveStoredBranding({
      ...DEFAULT_BRANDING,
      logoType: "custom",
      customLogoUrl: customDataUrl,
    });

    const loaded = getStoredBranding();
    expect(loaded.logoType).toBe("custom");
    expect(loaded.customLogoUrl).toBe(customDataUrl);
  });

  it("validates preset IDs and falls back gracefully", () => {
    expect(LOGO_PRESETS.length).toBeGreaterThanOrEqual(4);
    const presetIds = LOGO_PRESETS.map((p) => p.id);
    expect(presetIds).toContain("sun");
    expect(presetIds).toContain("carabao");
    expect(presetIds).toContain("church");
    expect(presetIds).toContain("flag");
  });

  it("resets back to defaults cleanly", () => {
    saveStoredBranding({
      ...DEFAULT_BRANDING,
      appName: "Temporary Name",
    });
    expect(getStoredBranding().appName).toBe("Temporary Name");

    resetStoredBranding();
    expect(getStoredBranding().appName).toBe(DEFAULT_BRANDING.appName);
  });
});
