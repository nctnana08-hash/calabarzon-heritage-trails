import { useEffect, useState } from "react";

export type LogoPresetId = "sun" | "carabao" | "church" | "flag";

export type NativeAppBranding = {
  appName: string;
  appBadge: string;
  appTagline: string;
  logoType: "preset" | "custom";
  presetId: LogoPresetId;
  customLogoUrl: string | null;
  primaryColor: string;
  accentColor: string;
};

export const DEFAULT_NATIVE_BRANDING: NativeAppBranding = {
  appName: "Sulyap",
  appBadge: "PH",
  appTagline: "CALABARZON Heritage Portal",
  logoType: "preset",
  presetId: "sun",
  customLogoUrl: null,
  primaryColor: "#0038A8",
  accentColor: "#FCD116",
};

let memoryStore: NativeAppBranding = { ...DEFAULT_NATIVE_BRANDING };
const listeners = new Set<(b: NativeAppBranding) => void>();

export function useNativeBranding() {
  const [branding, setBranding] = useState<NativeAppBranding>(memoryStore);

  useEffect(() => {
    const listener = (updated: NativeAppBranding) => setBranding(updated);
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }, []);

  const updateBranding = (next: Partial<NativeAppBranding>) => {
    memoryStore = {
      ...memoryStore,
      ...next,
    };
    listeners.forEach((fn) => fn(memoryStore));
  };

  const resetBranding = () => {
    memoryStore = { ...DEFAULT_NATIVE_BRANDING };
    listeners.forEach((fn) => fn(memoryStore));
  };

  return { branding, updateBranding, resetBranding };
}
