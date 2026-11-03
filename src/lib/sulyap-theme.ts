// Sulyap design tokens: Google's four primaries, re-tuned to Philippine heritage
// (flag blue, Katipunan red, araw gold, palay green) on abaca-white paper with indigo ink.
export const C = {
  paper: "#FAF8F1",
  card: "#FFFFFF",
  sand: "#E9E4D4",
  ink: "#1B2247",
  mute: "#666B88",
  blue: "#2B59C3",
  red: "#D2372B",
  gold: "#F6B21A",
  green: "#2E8B4F",
} as const;

export const F = {
  display: '"Alfa Slab One", Georgia, serif',
  body: '"Figtree", ui-sans-serif, system-ui, sans-serif',
  bold: '"Figtree", ui-sans-serif, system-ui, sans-serif',
} as const;

export type SulyapCategoryKey = "Heritage" | "Church" | "Museum" | "Nature";

export type CategoryMeta = {
  key: SulyapCategoryKey;
  dbCategory: string;
  color: string;
  deep: string;
  fil: string;
  en: string;
  blurb: string;
};

// Each category owns one of the four colours, so colour always means something.
export const CATS: Record<SulyapCategoryKey, CategoryMeta> = {
  Heritage: {
    key: "Heritage",
    dbCategory: "Historical Shrines",
    color: C.red,
    deep: "#B02A20",
    fil: "Pamana",
    en: "Historical Shrines",
    blurb: "Homes, monuments, and fortresses of the revolution and pre-colonial art",
  },
  Church: {
    key: "Church",
    dbCategory: "Religious Landmarks",
    color: C.blue,
    deep: "#2B59C3",
    fil: "Simbahan",
    en: "Religious Landmarks",
    blurb: "Centuries-old basilicas, cathedrals, and hillside pilgrimage sites",
  },
  Museum: {
    key: "Museum",
    dbCategory: "Museums",
    color: C.gold,
    deep: "#8F6200",
    fil: "Museo",
    en: "Museums",
    blurb: "Curated rooms of heroes, flag-makers, and 19th-century life",
  },
  Nature: {
    key: "Nature",
    dbCategory: "Natural Heritage",
    color: C.green,
    deep: "#237040",
    fil: "Kalikasan",
    en: "Natural Heritage",
    blurb: "Volcanoes, crater lakes, gorge waterfalls, and sacred mountains",
  },
};

export const PROVINCES = ["Cavite", "Laguna", "Batangas", "Rizal", "Quezon"] as const;

export const PROVINCE_TONES: Record<string, string> = {
  Cavite: C.blue,
  Laguna: C.red,
  Batangas: C.gold,
  Rizal: C.green,
  Quezon: C.blue,
};

/**
 * Contrast rule (M5.1): Gold backgrounds use ink text (#1B2247, >8:1 contrast);
 * blue, red, and green backgrounds use crisp white text.
 */
export const onColor = (c: string): string => (c === C.gold ? C.ink : "#FFFFFF");

/**
 * Resolves either a database category ("Historical Shrines", "Religious Landmarks",
 * "Museums", "Natural Heritage") or a Sulyap short key ("Heritage", "Church",
 * "Museum", "Nature") to its full CategoryMeta.
 */
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

/**
 * Deterministic positive integer seed from any string or number ID for Banig woven patterns.
 */
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
