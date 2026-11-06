// eGovPH-Inspired Philippine Cultural & Tourism Portal Theme
// Crisp civic royal blue (#0038A8), Philippine sun gold (#FCD116),
// crimson red (#CE1126), emerald verification green (#059669),
// and ultra-clean cool slate-white surfaces (#F4F7FB / #FFFFFF).
export const C = {
  paper: "#F4F7FB", // Crisp eGovPH cool slate-white page background
  card: "#FFFFFF", // Pure white card surface
  sand: "#E2E8F0", // Clean slate-200 border & skeleton divider tone
  ink: "#0F172A", // Deep slate-900 ink for sharp modern typography
  mute: "#475569", // Slate-600 muted label & secondary copy
  cover: "#0038A8", // Official eGovPH / Philippine Flag Royal Blue
  coverDeep: "#002366", // Deep civic navy
  foil: "#FCD116", // Official Philippine Sun Gold
  blue: "#0038A8", // Royal Blue accent
  red: "#CE1126", // Official Philippine Crimson Red
  gold: "#D97706", // Rich amber gold for readable badges/icons on white
  green: "#059669", // eGov verified emerald green
} as const;

export const F = {
  display: '"Plus Jakarta Sans", "Inter", ui-sans-serif, system-ui, sans-serif',
  body: '"Plus Jakarta Sans", "Inter", ui-sans-serif, system-ui, sans-serif',
  bold: '"Plus Jakarta Sans", "Inter", ui-sans-serif, system-ui, sans-serif',
  mono: '"JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, monospace',
} as const;

export type SulyapCategoryKey = "Heritage" | "Church" | "Museum" | "Nature";

export type CategoryMeta = {
  key: SulyapCategoryKey;
  dbCategory: string;
  color: string;
  deep: string;
  fil: string;
  en: string;
  stampShape: "octagon" | "arch" | "rect" | "circle";
  code: string;
  blurb: string;
};

export const CATS: Record<SulyapCategoryKey, CategoryMeta> = {
  Heritage: {
    key: "Heritage",
    dbCategory: "Historical Shrines",
    color: C.red,
    deep: "#B91C1C",
    fil: "Pamana",
    en: "Historical Shrines",
    stampShape: "octagon",
    code: "SHR-IVA",
    blurb: "Homes, fortresses, and rock shelters of the revolution and antiquity",
  },
  Church: {
    key: "Church",
    dbCategory: "Religious Landmarks",
    color: C.blue,
    deep: "#0038A8",
    fil: "Simbahan",
    en: "Religious Landmarks",
    stampShape: "arch",
    code: "REL-IVA",
    blurb: "Centuries-old basilicas, cathedrals, and hillside pilgrimage shrines",
  },
  Museum: {
    key: "Museum",
    dbCategory: "Museums",
    color: C.gold,
    deep: "#B45309",
    fil: "Museo",
    en: "Museums",
    stampShape: "rect",
    code: "MUS-IVA",
    blurb: "Curated rooms of heroes, flag-makers, and 19th-century life",
  },
  Nature: {
    key: "Nature",
    dbCategory: "Natural Heritage",
    color: C.green,
    deep: "#047857",
    fil: "Kalikasan",
    en: "Natural Heritage",
    stampShape: "circle",
    code: "NAT-IVA",
    blurb: "Volcanoes, crater lakes, gorge waterfalls, and sacred mountains",
  },
};

export const PROVINCES = ["Cavite", "Laguna", "Batangas", "Rizal", "Quezon"] as const;

export const PROVINCE_TONES: Record<string, string> = {
  Cavite: C.red,
  Laguna: C.blue,
  Batangas: C.gold,
  Rizal: C.green,
  Quezon: "#1D4ED8",
};

export const PROVINCE_CODES: Record<string, string> = {
  Cavite: "CAV",
  Laguna: "LAG",
  Batangas: "BTG",
  Rizal: "RIZ",
  Quezon: "QUE",
};

/**
 * Contrast rule: Sun yellow/white backgrounds use deep slate ink; dark colors use white text.
 */
export const onColor = (c: string): string =>
  c === C.foil || c === C.card || c === C.paper || c === "#FFFFFF" ? C.ink : "#FFFFFF";

export function getCategoryMeta(category: string | undefined | null): CategoryMeta {
  switch (category) {
    case "Historical Shrines":
    case "Heritage":
      return CATS.Heritage;
    case "Religious Landmarks":
    case "Church":
      return CATS.Church;
    case "Museums":
    case "Museum":
      return CATS.Museum;
    case "Natural Heritage":
    case "Nature":
      return CATS.Nature;
    default:
      return CATS.Heritage;
  }
}

export function seedFromId(id: string | number | undefined | null): number {
  if (typeof id === "number") return Math.max(1, Math.abs(Math.floor(id)));
  if (!id) return 1;
  let hash = 0;
  const str = String(id);
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 31 + str.charCodeAt(i)) | 0;
  }
  return (Math.abs(hash) % 97) + 1;
}

/**
 * Extracts a concise 1–2 sentence summary so users aren't hit with a wall of text.
 */
export function conciseText(text: string, maxSentences = 2): { short: string; hasMore: boolean } {
  const clean = text.trim();
  if (!clean) return { short: "", hasMore: false };
  const sentences = clean.match(/[^.!?]+[.!?]+/g) ?? [clean];
  if (sentences.length <= maxSentences) {
    return { short: clean, hasMore: false };
  }
  return {
    short: sentences.slice(0, maxSentences).join(" ").trim(),
    hasMore: true,
  };
}
