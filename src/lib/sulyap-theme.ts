// Philippine Cultural Heritage Passport & Archival Field Dossier Theme
// Deep passport cover burgundy, embossed gold foil, watermarked cream visa paper,
// and authentic rubber stamp inks (vermilion, Prussian blue, ochre sepia, botanical green).
export const C = {
  paper: "#F6F1E3", // Warm watermarked visa page cream
  card: "#FCF9F0", // Crisp archival ivory page
  sand: "#E6DEC8", // Aged parchment border & divider tone
  ink: "#1E232A", // Deep archival carbon ink
  mute: "#635E54", // Faded registry slate
  cover: "#4A181B", // Official passport cover burgundy
  coverDeep: "#320F11", // Dark leather spine
  foil: "#D4AF37", // Embossed gold foil
  blue: "#1D4E89", // Prussian blue rubber stamp ink
  red: "#9E2A2B", // Vermilion cinnabar rubber stamp ink
  gold: "#D4A843", // Imperial gold/ochre stamp accent
  green: "#236343", // Botanical forest rubber stamp ink
} as const;

export const F = {
  display: '"Cormorant Garamond", Georgia, serif',
  body: '"Work Sans", ui-sans-serif, system-ui, sans-serif',
  bold: '"Work Sans", ui-sans-serif, system-ui, sans-serif',
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
    deep: "#801F20",
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
    deep: "#163B68",
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
    deep: "#8F6200",
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
    deep: "#1A4D33",
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
  Quezon: C.red,
};

export const PROVINCE_CODES: Record<string, string> = {
  Cavite: "CAV",
  Laguna: "LAG",
  Batangas: "BTG",
  Rizal: "RIZ",
  Quezon: "QUE",
};

/**
 * Contrast rule: Gold backgrounds use deep ink text; dark ink stamps use white text.
 */
export const onColor = (c: string): string =>
  c === C.gold || c === C.foil || c === C.card || c === C.paper ? C.ink : "#FFFFFF";

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
