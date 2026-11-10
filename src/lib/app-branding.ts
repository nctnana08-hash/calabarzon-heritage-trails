export type LogoPresetId = "sun" | "carabao" | "church" | "flag";

export type AppBranding = {
  appName: string;
  appBadge: string;
  appTagline: string;
  appDescription: string;
  logoType: "preset" | "custom";
  presetId: LogoPresetId;
  customLogoUrl: string | null;
  thumbnailUrl: string | null;
  primaryColor: string;
  accentColor: string;
};

export const DEFAULT_BRANDING: AppBranding = {
  appName: "Sulyap",
  appBadge: "PH",
  appTagline: "CALABARZON Heritage Portal",
  appDescription:
    "Explore 19 historical shrines, churches, museums, and natural wonders across Region IV-A in 360° and collect digital stamps.",
  logoType: "preset",
  presetId: "sun",
  customLogoUrl: null,
  thumbnailUrl: null,
  primaryColor: "#0038A8",
  accentColor: "#FCD116",
};

export const LOGO_PRESETS: Array<{
  id: LogoPresetId;
  name: string;
  desc: string;
  symbol: string;
  bgColor: string;
}> = [
  {
    id: "sun",
    name: "Araw ng Kalayaan (8-Ray Sun)",
    desc: "Official Philippine Sun emblem with royal blue shield and golden rays",
    symbol: "☀️",
    bgColor: "#0038A8",
  },
  {
    id: "carabao",
    name: "Tamaraw / Kalabaw Heritage",
    desc: "Golden silhouette of the Philippine water buffalo, emblem of resilience",
    symbol: "🐃",
    bgColor: "#1E3A8A",
  },
  {
    id: "church",
    name: "Simbahang Bato (Baroque Belfry)",
    desc: "Historic colonial stone bell tower representing CALABARZON heritage",
    symbol: "⛪",
    bgColor: "#1E293B",
  },
  {
    id: "flag",
    name: "Tatlong Bituin at Isang Araw",
    desc: "Tri-color heritage crest inspired by the Philippine flag",
    symbol: "🇵🇭",
    bgColor: "#0F172A",
  },
];

const STORAGE_KEY = "sulyap_app_branding_v1";
const EVENT_NAME = "sulyap:branding-changed";

export function getStoredBranding(): AppBranding {
  if (typeof window === "undefined") return DEFAULT_BRANDING;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_BRANDING;
    const parsed = JSON.parse(raw) as Partial<AppBranding>;
    return {
      ...DEFAULT_BRANDING,
      ...parsed,
      // Guard invalid values
      appName: parsed.appName?.trim() || DEFAULT_BRANDING.appName,
      appBadge: parsed.appBadge?.trim() ?? DEFAULT_BRANDING.appBadge,
      appTagline: parsed.appTagline?.trim() || DEFAULT_BRANDING.appTagline,
      appDescription: parsed.appDescription?.trim() || DEFAULT_BRANDING.appDescription,
      presetId:
        parsed.presetId && LOGO_PRESETS.some((p) => p.id === parsed.presetId)
          ? parsed.presetId
          : DEFAULT_BRANDING.presetId,
      logoType: parsed.logoType === "custom" ? "custom" : "preset",
      customLogoUrl: parsed.customLogoUrl || null,
      thumbnailUrl: parsed.thumbnailUrl || null,
      primaryColor: parsed.primaryColor || DEFAULT_BRANDING.primaryColor,
      accentColor: parsed.accentColor || DEFAULT_BRANDING.accentColor,
    };
  } catch {
    return DEFAULT_BRANDING;
  }
}

export function saveStoredBranding(branding: AppBranding): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(branding));
    window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: branding }));

    // Apply document title prefix dynamically
    const currentTitle = document.title;
    if (currentTitle && !currentTitle.includes(branding.appName)) {
      document.title = `${branding.appName}${branding.appBadge ? ` ${branding.appBadge}` : ""} — ${branding.appTagline}`;
    }

    // Apply favicon if custom logo exists
    if (branding.customLogoUrl) {
      let link = document.querySelector<HTMLLinkElement>("link[rel~='icon']");
      if (!link) {
        link = document.createElement("link");
        link.rel = "icon";
        document.head.appendChild(link);
      }
      link.href = branding.customLogoUrl;
    }
  } catch (err) {
    console.error("Failed to persist app branding", err);
  }
}

export function resetStoredBranding(): AppBranding {
  if (typeof window !== "undefined") {
    window.localStorage.removeItem(STORAGE_KEY);
    window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: DEFAULT_BRANDING }));
  }
  return DEFAULT_BRANDING;
}
