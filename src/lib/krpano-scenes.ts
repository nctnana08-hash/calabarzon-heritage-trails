import { ARTWORK_HD_PLATES } from "./sulyap-art-360";

export const GRAND_16K_PANO_URL = "/panoramas/calabarzon-grand-pavilion-16k.jpg";
export const CALABARZON_12K_PANO_URL = "/panoramas/calabarzon-heritage-salon-12k.jpg";
export const UPSTAIRS_12K_PANO_URL = "/panoramas/calabarzon-upstairs-mezzanine-12k.jpg";
export const DEFAULT_MUSEUM_PANO_URL = "/panoramas/museum-rotunda-360.jpg";
export const GALLERY_HALL_PANO_URL = "/panoramas/museum-gallery-hall-360.webp";

/** Seamless overlap padding fractions for 4x2 (8-tile) 16K/12K grids and 4x1 6K sectors */
export const TILE_16K_PAD_FRAC = 16 / 4032;
export const TILE_12K_PAD_FRAC = 16 / 3032;
export const TILE_6K_PAD_FRAC = 12 / 1524;

export type EightTileTuple = [string, string, string, string, string, string, string, string];

export const GRAND_16K_TILES = {
  previewUrl: "/panoramas/tiles/grand16k/preview.webp",
  gridTileUrls: [
    "/panoramas/tiles/grand16k/tile_r0_c0.jpg",
    "/panoramas/tiles/grand16k/tile_r0_c1.jpg",
    "/panoramas/tiles/grand16k/tile_r0_c2.jpg",
    "/panoramas/tiles/grand16k/tile_r0_c3.jpg",
    "/panoramas/tiles/grand16k/tile_r1_c0.jpg",
    "/panoramas/tiles/grand16k/tile_r1_c1.jpg",
    "/panoramas/tiles/grand16k/tile_r1_c2.jpg",
    "/panoramas/tiles/grand16k/tile_r1_c3.jpg",
  ] as EightTileTuple,
  tilePadFrac: TILE_16K_PAD_FRAC,
  tilePadFracY: TILE_16K_PAD_FRAC,
  tilePixelSize: [4032, 4032] as [number, number],
  nativeWidth: 16000,
  nativeHeight: 8000,
  isUltraHd16k: true,
  isUltraHd12k: true,
};

export const SALON_12K_TILES = {
  previewUrl: "/panoramas/tiles/salon12k/preview.webp",
  gridTileUrls: [
    "/panoramas/tiles/salon12k/tile_r0_c0.jpg",
    "/panoramas/tiles/salon12k/tile_r0_c1.jpg",
    "/panoramas/tiles/salon12k/tile_r0_c2.jpg",
    "/panoramas/tiles/salon12k/tile_r0_c3.jpg",
    "/panoramas/tiles/salon12k/tile_r1_c0.jpg",
    "/panoramas/tiles/salon12k/tile_r1_c1.jpg",
    "/panoramas/tiles/salon12k/tile_r1_c2.jpg",
    "/panoramas/tiles/salon12k/tile_r1_c3.jpg",
  ] as EightTileTuple,
  tilePadFrac: TILE_12K_PAD_FRAC,
  tilePadFracY: TILE_12K_PAD_FRAC,
  tilePixelSize: [3032, 3032] as [number, number],
  nativeWidth: 12000,
  nativeHeight: 6000,
  isUltraHd12k: true,
};

export const UPSTAIRS_12K_TILES = {
  previewUrl: "/panoramas/tiles/upstairs12k/preview.webp",
  gridTileUrls: [
    "/panoramas/tiles/upstairs12k/tile_r0_c0.jpg",
    "/panoramas/tiles/upstairs12k/tile_r0_c1.jpg",
    "/panoramas/tiles/upstairs12k/tile_r0_c2.jpg",
    "/panoramas/tiles/upstairs12k/tile_r0_c3.jpg",
    "/panoramas/tiles/upstairs12k/tile_r1_c0.jpg",
    "/panoramas/tiles/upstairs12k/tile_r1_c1.jpg",
    "/panoramas/tiles/upstairs12k/tile_r1_c2.jpg",
    "/panoramas/tiles/upstairs12k/tile_r1_c3.jpg",
  ] as EightTileTuple,
  tilePadFrac: TILE_12K_PAD_FRAC,
  tilePadFracY: TILE_12K_PAD_FRAC,
  tilePixelSize: [3032, 3032] as [number, number],
  nativeWidth: 12000,
  nativeHeight: 6000,
  isUltraHd12k: true,
};

export const ROTUNDA_TILES = {
  previewUrl: "/panoramas/tiles/rotunda/preview.webp",
  tileUrls: [
    "/panoramas/tiles/rotunda/tile_0.jpg",
    "/panoramas/tiles/rotunda/tile_1.jpg",
    "/panoramas/tiles/rotunda/tile_2.jpg",
    "/panoramas/tiles/rotunda/tile_3.jpg",
  ] as [string, string, string, string],
  tilePadFrac: TILE_6K_PAD_FRAC,
  tilePixelSize: [1524, 3000] as [number, number],
  nativeWidth: 6000,
  nativeHeight: 3000,
};

export const GALLERY_TILES = {
  previewUrl: "/panoramas/tiles/gallery/preview.webp",
  tileUrls: [
    "/panoramas/tiles/gallery/tile_0.jpg",
    "/panoramas/tiles/gallery/tile_1.jpg",
    "/panoramas/tiles/gallery/tile_2.jpg",
    "/panoramas/tiles/gallery/tile_3.jpg",
  ] as [string, string, string, string],
  tilePadFrac: TILE_6K_PAD_FRAC,
  tilePixelSize: [1524, 3000] as [number, number],
  nativeWidth: 6000,
  nativeHeight: 3000,
};

export type KrpanoHotspotKind = "art" | "door" | "stairs-up" | "stairs-down" | "path";

export type KrpanoArtDetails = {
  /** Dedicated 1,600×1,000 Ultra-HD close-up image brought forward uncropped when clicked */
  imageUrl?: string;
  filTitle?: string;
  artist?: string;
  period: string;
  medium: string;
  dimensions?: string;
  zone: string;
  province?: string;
  description: string;
  highlight?: string;
  conservationNote?: string;
};

export type KrpanoHotspot = {
  id: string;
  kind?: KrpanoHotspotKind;
  title: string;
  subtitle?: string;
  badge?: string;
  /** Horizontal spherical azimuth of pin in degrees (-180..180, 0 = front center) */
  ath: number;
  /** Vertical spherical pitch of pin in degrees (-90..90, + = up, - = down) */
  atv: number;
  /** Optional true artwork center azimuth/pitch so pin sits neatly below frame without blocking art */
  lookAtAth?: number;
  lookAtAtv?: number;
  /** Optional target FOV when flying to this hotspot */
  fov?: number;
  accentColor?: string;
  /** If set, clicking walks through a Door or climbs/descends Stairs to another 360° room! */
  targetSceneId?: string;
  /** Optional arrival camera orientation after walking through door or climbing stairs */
  arrivalView?: { ath: number; atv: number; fov?: number };
  /** Rich curatorial details & Ultra-HD foreground image shown when clicked */
  artDetails?: KrpanoArtDetails;
  /** Optional sequential order (1, 2, 3...) along the guided floor path */
  pathOrder?: number;
};

export type KrpanoSceneConfig = {
  id: string;
  name: string;
  shortLabel: string;
  floorLabel?: string;
  title: string;
  panoramaUrl: string;
  /** Instant <35ms 2048×1024 WebP preview sphere for zero-lag room entry */
  previewUrl?: string;
  /** Pre-sliced 4-sector (4x1) GPU tiles */
  tileUrls?: [string, string, string, string];
  /** Pre-sliced 8-tile (4x2 hemisphere grid) Ultra-HD 16K/12K GPU tiles (<=4032x4032 each) */
  gridTileUrls?: EightTileTuple;
  tilePadFrac?: number;
  tilePadFracY?: number;
  tilePixelSize?: [number, number];
  nativeWidth?: number;
  nativeHeight?: number;
  isUltraHd16k?: boolean;
  isUltraHd12k?: boolean;
  initialHlookat?: number;
  initialVlookat?: number;
  initialFov?: number;
  /** Ordered spherical floor path coordinates (ath, atv) drawn as a 3D museum trail */
  floorPath?: {
    ath: number;
    atv: number;
    label?: string;
    lookAtAth?: number;
    lookAtAtv?: number;
    targetSceneId?: string;
  }[];
  hotspots: KrpanoHotspot[];
};

export const DEFAULT_MUSEUM_SCENES: KrpanoSceneConfig[] = [
  {
    id: "grand16k",
    name: "scene_sulyap_grand_pavilion_16k",
    shortLabel: "16K Grand Tour",
    floorLabel: "1F Pavilion (16K)",
    title: "1F Living National Heritage Pavilion — Smooth 16K Ultra-HD (16,000 × 8,000)",
    panoramaUrl: GRAND_16K_PANO_URL,
    ...GRAND_16K_TILES,
    initialHlookat: 0,
    initialVlookat: 1,
    initialFov: 80,
    floorPath: [
      {
        ath: -61,
        atv: -28,
        label: "Step 1 · West Gallery Masterwork",
        lookAtAth: -91,
        lookAtAtv: 9,
      },
      {
        ath: -26,
        atv: -29,
        label: "Step 2 · Bahay na Bato 12K Salon Door",
        lookAtAth: -61,
        lookAtAtv: -14,
        targetSceneId: "salon12k",
      },
      {
        ath: 0,
        atv: -31,
        label: "Step 3 · Climb Grand Staircase (2F Upstairs) ↑",
        lookAtAth: 0,
        lookAtAtv: -4,
        targetSceneId: "upstairs12k",
      },
      {
        ath: 34,
        atv: -29,
        label: "Step 4 · East Gallery & Sculpture",
        lookAtAth: 72,
        lookAtAtv: -18,
      },
      {
        ath: 61,
        atv: -26,
        label: "Step 5 · Enter Grand Rotunda →",
        lookAtAth: 61,
        lookAtAtv: -14,
        targetSceneId: "rotunda",
      },
    ],
    hotspots: [
      {
        id: "hs-16k-stairs-up",
        kind: "stairs-up",
        badge: "🪜",
        title: "Grand Staircase → 2F Mezzanine ↑",
        subtitle: "Climb Upstairs",
        ath: 0,
        atv: -6,
        fov: 52,
        targetSceneId: "upstairs12k",
        arrivalView: { ath: 0, atv: 0, fov: 78 },
        pathOrder: 3,
      },
      {
        id: "hs-16k-to-bahay-salon",
        kind: "door",
        badge: "🚪",
        title: "← Bahay na Bato 12K Salon",
        subtitle: "Enter Heritage 12K Room",
        ath: -61,
        atv: -15,
        fov: 52,
        targetSceneId: "salon12k",
        arrivalView: { ath: 43, atv: -2, fov: 80 },
        pathOrder: 2,
      },
      {
        id: "hs-16k-to-rotunda",
        kind: "door",
        badge: "🚪",
        title: "Grand Rotunda Wing →",
        subtitle: "Walk Through East Arch",
        ath: 61,
        atv: -15,
        fov: 52,
        targetSceneId: "rotunda",
        arrivalView: { ath: -2, atv: 5, fov: 80 },
        pathOrder: 5,
      },
      {
        id: "hs-16k-to-gallery",
        kind: "door",
        badge: "🚪",
        title: "Fine Arts Hall →",
        subtitle: "South-East Colonnade",
        ath: 133,
        atv: -18,
        fov: 52,
        targetSceneId: "gallery",
        arrivalView: { ath: -48, atv: 4, fov: 78 },
      },
      {
        id: "hs-16k-kawit",
        kind: "art",
        badge: "1",
        title: "1898 Kawit Independence Proclamation",
        subtitle: "Cavite · Monumental Oil",
        ath: -91,
        atv: 1,
        lookAtAth: -91,
        lookAtAtv: 9,
        fov: 38,
        pathOrder: 1,
        artDetails: {
          imageUrl: ARTWORK_HD_PLATES.kawit,
          filTitle: "Pagpapahayag ng Kasarinlan sa Kawit, Kabite (1898)",
          artist: "Cavite Centennial Heritage Atelier",
          period: "June 12, 1898 · Kawit, Cavite",
          medium: "Classical Oil on Linen Canvas · Ornate Gilt Frame",
          dimensions: "3.3 m × 2.3 m monumental canvas",
          zone: "16K Grand Pavilion · West Gallery Bay",
          province: "Cavite",
          description:
            "Depicts the historic unfurling of the Philippine Sun-and-Stars Flag from the Aguinaldo Shrine Bahay na Bato balcony before cheering townsfolk and revolutionary soldiers gathered in Kawit, Cavite on June 12, 1898.",
          highlight:
            "Double-click the artwork or tap 2× / 3× below it to inspect oil brushstrokes with zero text overlapping the canvas.",
          conservationNote: "Preserved in climate-controlled museum gallery framing.",
        },
      },
      {
        id: "hs-16k-taal",
        kind: "art",
        badge: "2",
        title: "Golden Sunrise Over Taal Volcano & Lake",
        subtitle: "Batangas · Landscape Oil",
        ath: -91,
        atv: -24,
        lookAtAth: -91,
        lookAtAtv: -18,
        fov: 40,
        artDetails: {
          imageUrl: ARTWORK_HD_PLATES.taal,
          filTitle: "Bukang-Liwayway sa Bulkang Taal at Lawa ng Batangas",
          artist: "Southern Tagalog Plein-Air Masters",
          period: "19th–20th Century Plein-Air · Batangas",
          medium: "Luminous Oil Impasto on Canvas",
          dimensions: "3.3 m × 2.3 m",
          zone: "16K Grand Pavilion · Lower West Alcove",
          province: "Batangas",
          description:
            "Captures golden morning mist rising across Taal Lake and Volcano Island from the Tagaytay–Batangas ridge, with traditional wooden outrigger bancas gliding past coconut palms.",
          highlight: "Uncropped full-frame view lets you see every corner of the landscape.",
        },
      },
      {
        id: "hs-16k-rizal",
        kind: "art",
        badge: "3",
        title: "Rizal's Candlelit Study in Calamba",
        subtitle: "Laguna · Historical Chiaroscuro",
        ath: -23,
        atv: 1,
        lookAtAth: -23,
        lookAtAtv: 7,
        fov: 36,
        artDetails: {
          imageUrl: ARTWORK_HD_PLATES.rizal,
          filTitle: "Ang Pag-aaral ni Jose Rizal sa Tanglaw ng Kandila sa Calamba",
          artist: "Laguna Academic Portraitists",
          period: "Late 19th Century · Calamba, Laguna",
          medium: "Chiaroscuro Oil on Canvas",
          dimensions: "2.8 m × 2.1 m",
          zone: "16K Grand Pavilion · North-West Mezzanine Bay",
          province: "Laguna",
          description:
            "Intimate warm-lit portrait inspired by the Bahay na Bato study of the Rizal Shrine in Calamba, Laguna—featuring handwritten manuscripts, leather-bound volumes, brass oil lamp, and Capiz shell windows.",
          conservationNote: "Displayed above the grand marble staircase landing.",
        },
      },
      {
        id: "hs-16k-pahiyas",
        kind: "art",
        badge: "4",
        title: "Pahiyas Harvest Festival Under Mt. Banahaw",
        subtitle: "Lucban, Quezon · Folk Oil",
        ath: 24,
        atv: 1,
        lookAtAth: 24,
        lookAtAtv: 7,
        fov: 36,
        artDetails: {
          imageUrl: ARTWORK_HD_PLATES.pahiyas,
          filTitle: "Kapistahan ng Pahiyas sa Paanan ng Bundok Banahaw",
          artist: "Quezon Regional Folkloric School",
          period: "Contemporary Heritage Masterwork · Quezon",
          medium: "Vibrant Oil & Natural Pigment on Canvas",
          dimensions: "3.3 m × 2.3 m",
          zone: "16K Grand Pavilion · North-East Mezzanine Bay",
          province: "Quezon",
          description:
            "Ancestral Quezon houses draped in vivid pink, yellow, and emerald rice-wafer kiping chandeliers, anahaw leaves, and harvest baskets during Lucban's May 15 Pahiyas thanksgiving beneath sacred Mt. Banahaw.",
          highlight: "Every colorful kiping leaf wafer is rendered in crisp foreground HD.",
        },
      },
      {
        id: "hs-16k-paete",
        kind: "art",
        badge: "5",
        title: "Paete Master Woodcarvers & Sculpture",
        subtitle: "Laguna · Carved Hardwood",
        ath: 72,
        atv: -28,
        lookAtAth: 72,
        lookAtAtv: -21,
        fov: 40,
        pathOrder: 4,
        artDetails: {
          imageUrl: ARTWORK_HD_PLATES.paete,
          filTitle: "Mga Dalubhasang Manlililok ng Kahoy sa Paete, Laguna",
          artist: "Paete Guild of Master Ukit Artisans",
          period: "Living Intangible Heritage · Paete, Laguna",
          medium: "Molave & Batikuling Sculpture + Chiaroscuro Study",
          dimensions: "2.2 m pedestal installation",
          zone: "16K Grand Pavilion · East Colonnade Pedestal",
          province: "Laguna",
          description:
            "Honors the centuries-old ukit (woodcarving) workshops of Paete, Laguna—the Woodcarving Capital of the Philippines—where master artisans shape sacred santos, floral reliefs, and heritage sculptures.",
          conservationNote: "Mounted on a custom marble-and-narra gallery plinth.",
        },
      },
    ],
  },
  {
    id: "salon12k",
    name: "scene_sulyap_calabarzon_12k",
    shortLabel: "12K Heritage Salon",
    floorLabel: "Bahay Salon (12K)",
    title: "Bahay na Bato 12K Heritage Salon — Restored Classic 12,000 × 6,000",
    panoramaUrl: CALABARZON_12K_PANO_URL,
    ...SALON_12K_TILES,
    initialHlookat: 35,
    initialVlookat: 0,
    initialFov: 80,
    floorPath: [
      {
        ath: 43,
        atv: -24,
        label: "Step 1 · 1898 Revolutionary Flag Vitrine",
        lookAtAth: 43,
        lookAtAtv: -4,
      },
      {
        ath: 137,
        atv: -25,
        label: "Step 2 · Piña Barong & Paete Retablo",
        lookAtAth: 152,
        lookAtAtv: 0,
      },
      {
        ath: -153,
        atv: -24,
        label: "Step 3 · Taal & Banahaw Paintings",
        lookAtAth: -153,
        lookAtAtv: 14,
      },
      {
        ath: -59,
        atv: -22,
        label: "Step 4 · Corridor to 16K Grand Pavilion →",
        lookAtAth: -59,
        lookAtAtv: -2,
        targetSceneId: "grand16k",
      },
    ],
    hotspots: [
      {
        id: "hs-salon-to-16k",
        kind: "door",
        badge: "🚪",
        title: "Enter 16K Grand Pavilion →",
        subtitle: "North Gallery Corridor",
        ath: -59,
        atv: -4,
        fov: 52,
        targetSceneId: "grand16k",
        arrivalView: { ath: 0, atv: 0, fov: 80 },
        pathOrder: 4,
      },
      {
        id: "hs-salon-to-upstairs",
        kind: "stairs-up",
        badge: "🪜",
        title: "Balustrade Stairs → 2F Mezzanine ↑",
        subtitle: "Ascend to 2nd Floor",
        ath: -6,
        atv: -8,
        fov: 52,
        targetSceneId: "upstairs12k",
        arrivalView: { ath: 0, atv: 2, fov: 78 },
      },
      {
        id: "hs-salon-to-rotunda",
        kind: "door",
        badge: "🚪",
        title: "East Veranda → Grand Rotunda →",
        subtitle: "Capiz Gallery Passage",
        ath: 102,
        atv: -4,
        fov: 52,
        targetSceneId: "rotunda",
        arrivalView: { ath: -2, atv: 5, fov: 80 },
      },
      {
        id: "hs-12k-kawit",
        kind: "art",
        badge: "1",
        title: "1898 Philippine Flag & Katipunan Relics",
        subtitle: "Cavite · Glass Heritage Vitrine",
        ath: 43,
        atv: -18,
        lookAtAth: 43,
        lookAtAtv: -4,
        fov: 42,
        pathOrder: 1,
        artDetails: {
          imageUrl: ARTWORK_HD_PLATES.kawit,
          filTitle: "Watawat ng Kasarinlan at mga Sandata ng Himagsikan (1898)",
          artist: "Cavite Revolutionary Archive Collection",
          period: "June 12, 1898 · Kawit, Cavite",
          medium: "Hand-sewn Silk Sun-and-Stars Flag & Forged Steel Bolos",
          dimensions: "2.6 m illuminated conservation case",
          zone: "Bahay na Bato 12K Salon · Central Vitrine",
          province: "Cavite",
          description:
            "Preserves the iconic Sun-and-Stars banner and ceremonial revolutionary blades honoring the June 12, 1898 Proclamation of Philippine Independence in Kawit, Cavite.",
          conservationNote:
            "Housed inside a UV-filtered humidity-controlled glass case beneath stained-glass domes.",
        },
      },
      {
        id: "hs-12k-taal",
        kind: "art",
        badge: "2",
        title: "Taal Volcano & Pagsanjan Falls Diptych",
        subtitle: "Batangas & Laguna · Gilt-Framed Oils",
        ath: -153,
        atv: -10,
        lookAtAth: -153,
        lookAtAtv: 14,
        fov: 44,
        pathOrder: 3,
        artDetails: {
          imageUrl: ARTWORK_HD_PLATES.taal,
          filTitle: "Bulkang Taal at Talon ng Pagsanjan sa Katagalugan",
          artist: "Southern Tagalog Landscape Masters",
          period: "19th–20th Century · Batangas & Laguna",
          medium: "Pair of Classical Oils in Carved Gold-Leaf Frames",
          dimensions: "1.8 m × 1.3 m each",
          zone: "Bahay na Bato 12K Salon · West Pilaster Wall",
          province: "Batangas",
          description:
            "Paired plein-air oil landscapes celebrating CALABARZON's twin natural icons: Volcano Island rising in Taal Lake and twin tropical cascades beneath Mount Banahaw and Pagsanjan Gorge.",
        },
      },
      {
        id: "hs-12k-barong",
        kind: "art",
        badge: "3",
        title: "Lumban Callado Piña Barong & Heirloom Gold",
        subtitle: "Laguna & Batangas · Textile & Goldwork",
        ath: 137,
        atv: -22,
        lookAtAth: 137,
        lookAtAtv: -10,
        fov: 42,
        pathOrder: 2,
        artDetails: {
          imageUrl: ARTWORK_HD_PLATES.gold,
          filTitle: "Burda ng Lumban sa Piña at Gintong Pamana",
          artist: "Lumban Master Embroiderers & Batangas Goldsmiths",
          period: "19th Century · Lumban, Laguna & Taal, Batangas",
          medium: "Hand-loomed Pineapple Fiber (Piña) & Filigree Gold",
          dimensions: "Full ceremonial Barong Tagalog ensemble",
          zone: "Bahay na Bato 12K Salon · East Narra Floor",
          province: "Laguna",
          description:
            "Hand-scraped red pineapple leaf fibers woven into sheer translucent cloth and embroidered with delicate calado lacework in Lumban, Laguna—paired with heirloom Batangas tamburin goldwork.",
        },
      },
      {
        id: "hs-12k-retablo",
        kind: "art",
        badge: "4",
        title: "Carved Paete Molave Retablo Altar",
        subtitle: "Paete, Laguna · Sacred Woodcarving",
        ath: 165,
        atv: -12,
        lookAtAth: 165,
        lookAtAtv: 4,
        fov: 42,
        artDetails: {
          imageUrl: ARTWORK_HD_PLATES.retablo,
          filTitle: "Inukit na Retablong Molave ng Paete",
          artist: "Paete Master Santeros (Laguna)",
          period: "18th–19th Century · Paete, Laguna",
          medium: "Hand-carved Tropical Molave & Narra Hardwood",
          dimensions: "3.1 m × 2.1 m three-niche altar",
          zone: "Bahay na Bato 12K Salon · Sanctuary Wall",
          province: "Laguna",
          description:
            "Intricately hand-chiseled Baroque wooden retablo featuring Solomonic columns, acanthus scrollwork, and polychrome santos crafted by the master woodcarvers of Paete, Laguna.",
        },
      },
    ],
  },
  {
    id: "upstairs12k",
    name: "scene_sulyap_upstairs_mezzanine_12k",
    shortLabel: "2F Upstairs",
    floorLabel: "2F Mezzanine (12K)",
    title: "2F Living Mezzanine Sky Gallery — Photorealistic 12,000 × 6,000",
    panoramaUrl: UPSTAIRS_12K_PANO_URL,
    ...UPSTAIRS_12K_TILES,
    initialHlookat: 0,
    initialVlookat: 0,
    initialFov: 80,
    floorPath: [
      {
        ath: -120,
        atv: -24,
        label: "Step 1 · Pahiyas Harvest Canvas",
        lookAtAth: -120,
        lookAtAtv: 5,
      },
      {
        ath: 0,
        atv: -28,
        label: "Step 2 · Descend Stairs to 16K Grand Pavilion ↓",
        lookAtAth: 0,
        lookAtAtv: -16,
        targetSceneId: "grand16k",
      },
      {
        ath: 120,
        atv: -24,
        label: "Step 3 · Highlands & Taal Vista",
        lookAtAth: 120,
        lookAtAtv: 5,
      },
      {
        ath: 168,
        atv: -22,
        label: "Step 4 · Pre-Colonial Gold & Textiles",
        lookAtAth: 168,
        lookAtAtv: -2,
      },
    ],
    hotspots: [
      {
        id: "hs-stairs-down-atrium",
        kind: "stairs-down",
        badge: "🪜",
        title: "Descend Stairs → 1F 16K Grand Hall ↓",
        subtitle: "Go Downstairs",
        ath: 0,
        atv: -18,
        fov: 54,
        targetSceneId: "grand16k",
        arrivalView: { ath: 0, atv: 0, fov: 80 },
        pathOrder: 2,
      },
      {
        id: "hs-upstairs-to-rotunda",
        kind: "door",
        badge: "🚪",
        title: "North Skybridge → Grand Rotunda →",
        subtitle: "Walk Through Sunlit Arch",
        ath: 0,
        atv: 2,
        fov: 50,
        targetSceneId: "rotunda",
        arrivalView: { ath: -2, atv: 5, fov: 80 },
      },
      {
        id: "hs-upstairs-to-salon",
        kind: "door",
        badge: "🚪",
        title: "← Enter 12K Bahay na Bato Salon",
        subtitle: "West Mezzanine Passage",
        ath: -55,
        atv: 1,
        fov: 50,
        targetSceneId: "salon12k",
        arrivalView: { ath: 43, atv: -2, fov: 80 },
      },
      {
        id: "hs-upstairs-pahiyas",
        kind: "art",
        badge: "1",
        title: "Pahiyas Harvest Fiesta in Lucban",
        subtitle: "Quezon · West Mezzanine Wall",
        ath: -120,
        atv: -6,
        lookAtAth: -120,
        lookAtAtv: 5,
        fov: 38,
        pathOrder: 1,
        artDetails: {
          imageUrl: ARTWORK_HD_PLATES.pahiyas,
          filTitle: "Kapistahan ng Pahiyas sa Lucban, Quezon",
          artist: "Quezon Regional Folkloric School",
          period: "Contemporary Heritage Masterwork · Quezon",
          medium: "Oil & Natural Pigment on Linen Canvas",
          dimensions: "3.2 m × 2.2 m",
          zone: "2F Mezzanine Sky Gallery · West Promenade",
          province: "Quezon",
          description:
            "Illuminated by natural skylight from the vaulted Beaux-Arts roof, this celebratory canvas captures colorful kiping rice-wafer chandeliers and harvest processions in Lucban, Quezon.",
        },
      },
      {
        id: "hs-upstairs-taal-highlands",
        kind: "art",
        badge: "2",
        title: "Cordillera & Southern Tagalog Ridges",
        subtitle: "Batangas & Rizal · East Mezzanine Wall",
        ath: 120,
        atv: -5,
        lookAtAth: 120,
        lookAtAtv: 5,
        fov: 38,
        pathOrder: 3,
        artDetails: {
          imageUrl: ARTWORK_HD_PLATES.taal,
          filTitle: "Kabundukan at Lawa ng Katagalugan",
          artist: "Plein-Air Landscape Atelier",
          period: "20th Century · Batangas, Laguna & Rizal",
          medium: "Oil on Linen Canvas",
          dimensions: "2.8 m × 1.9 m",
          zone: "2F Mezzanine Sky Gallery · East Promenade",
          province: "Batangas",
          description:
            "Lush emerald mountain terraces, mist-veiled volcanic lakes, and golden morning sunbeams admired by art students sketching along the polished narra mezzanine.",
        },
      },
      {
        id: "hs-upstairs-gold",
        kind: "art",
        badge: "3",
        title: "Pre-Colonial Gold Regalia & Piña Vitrine",
        subtitle: "Batangas & Laguna · Glass Vitrine",
        ath: -168,
        atv: -12,
        lookAtAth: -168,
        lookAtAtv: -2,
        fov: 40,
        pathOrder: 4,
        artDetails: {
          imageUrl: ARTWORK_HD_PLATES.gold,
          filTitle: "Sinaunang Ginto ng Batangas at Habing Lumban",
          artist: "Pre-Colonial Tagalog Goldsmiths",
          period: "12th–19th Century · Batangas & Laguna",
          medium: "22k Filigree Gold & Hand-Embroidered Piña",
          dimensions: "1.9 m museum conservation vitrine",
          zone: "2F Mezzanine Sky Gallery · South Vitrine",
          province: "Batangas",
          description:
            "Showcases delicately granulated pre-colonial Tagalog gold regalia, ceremonial vessels, and translucent hand-woven textiles preserved under museum glass.",
        },
      },
    ],
  },
  {
    id: "rotunda",
    name: "scene_sulyap_museum_rotunda",
    shortLabel: "Rotunda Wing",
    floorLabel: "1F East Wing",
    title: "1F East Wing: Grand Heritage Rotunda 360°",
    panoramaUrl: DEFAULT_MUSEUM_PANO_URL,
    ...ROTUNDA_TILES,
    initialHlookat: 0,
    initialVlookat: 2,
    initialFov: 84,
    floorPath: [
      { ath: -2, atv: -22, label: "Step 1 · Central Torch Monument", lookAtAth: -2, lookAtAtv: 6 },
      { ath: 92, atv: -22, label: "Step 2 · Ancestral Bahay Kubo", lookAtAth: 92, lookAtAtv: -2 },
      {
        ath: 58,
        atv: -21,
        label: "Step 3 · Door to Fine Arts Hall",
        lookAtAth: 58,
        lookAtAtv: -2,
        targetSceneId: "gallery",
      },
      {
        ath: -62,
        atv: -21,
        label: "Step 4 · Door to 16K Grand Pavilion",
        lookAtAth: -62,
        lookAtAtv: -2,
        targetSceneId: "grand16k",
      },
    ],
    hotspots: [
      {
        id: "hs-rotunda-to-16k",
        kind: "door",
        badge: "🚪",
        title: "← Return to 16K Grand Pavilion",
        subtitle: "West Archway Door",
        ath: -62,
        atv: -2,
        fov: 54,
        targetSceneId: "grand16k",
        arrivalView: { ath: -20, atv: 0, fov: 80 },
        pathOrder: 4,
      },
      {
        id: "hs-portal-to-gallery",
        kind: "door",
        badge: "🚪",
        title: "Enter Fine Arts Hall →",
        subtitle: "East Archway Door",
        ath: 58,
        atv: -2,
        fov: 54,
        targetSceneId: "gallery",
        arrivalView: { ath: -48, atv: 4, fov: 80 },
        pathOrder: 3,
      },
      {
        id: "hs-rotunda-upstairs",
        kind: "stairs-up",
        badge: "🪜",
        title: "Ascend → 2F Mezzanine ↑",
        subtitle: "2nd Floor Sky Gallery",
        ath: -26,
        atv: 1,
        fov: 54,
        targetSceneId: "upstairs12k",
        arrivalView: { ath: 0, atv: 0, fov: 78 },
      },
      {
        id: "hs-monument",
        kind: "art",
        badge: "1",
        title: "Inang Bayan Torch Monument",
        subtitle: "Rotunda Centerpiece",
        ath: -2,
        atv: -10,
        lookAtAth: -2,
        lookAtAtv: 6,
        fov: 52,
        pathOrder: 1,
        artDetails: {
          imageUrl: ARTWORK_HD_PLATES.monument,
          filTitle: "Bantayog ng Inang Bayan at Sulo ng Kalayaan",
          artist: "National Heritage Foundry Sculptors",
          period: "National Heritage Sculpture · 20th Century",
          medium: "Cast Bronze on Polished Nero Marquina Marble Plinth",
          dimensions: "4.6 m monument height",
          zone: "1F Grand Rotunda · Central Oculus",
          description:
            "Rising beneath the stained-glass rotunda dome, this neoclassical cast-bronze statue of Inang Bayan raises the golden torch of liberty while holding the eight-rayed sun shield of Philippine sovereignty.",
        },
      },
      {
        id: "hs-cavite-mural",
        kind: "art",
        badge: "2",
        title: "Revolution & Kasaysayan Mural (Cavite)",
        subtitle: "West Rotunda Wall",
        ath: -128,
        atv: -8,
        lookAtAth: -128,
        lookAtAtv: 3,
        fov: 50,
        artDetails: {
          imageUrl: ARTWORK_HD_PLATES.kawit,
          filTitle: "Mural ng Himagsayan at Kasaysayan ng Kabite",
          artist: "Historical Muralist Guild",
          period: "Centennial Historical Cycle · Cavite",
          medium: "Panoramic Oil on Canvas",
          dimensions: "5.4 m × 3.2 m",
          zone: "1F Grand Rotunda · West Gallery",
          province: "Cavite",
          description:
            "Chronicles the struggle for Philippine nationhood across Cavite's historic towns from Imus and Binakayan to the June 12, 1898 proclamation in Kawit.",
        },
      },
      {
        id: "hs-bahay-kubo",
        kind: "art",
        badge: "3",
        title: "Ancestral Bahay Kubo & Burial Jars",
        subtitle: "Quezon & Batangas",
        ath: 92,
        atv: -12,
        lookAtAth: 92,
        lookAtAtv: -2,
        fov: 50,
        pathOrder: 2,
        artDetails: {
          imageUrl: ARTWORK_HD_PLATES.ancestral,
          filTitle: "Sinaunang Bahay Kubo, Bahay-na-Bato at Tapayan",
          artist: "Master Vernacular Carpenters of Quezon & Laguna",
          period: "Vernacular & Pre-Colonial Collection",
          medium: "Woven Bamboo Sawali, Nipa Thatch, Capiz & Earthenware",
          dimensions: "2.4 m architectural scale model",
          zone: "1F Grand Rotunda · East Alcove",
          province: "Quezon",
          description:
            "Intricate museum architectural study of elevated Tagalog vernacular timber framing, woven sawali walls, and sliding Capiz shell windows displayed beside excavated pre-colonial earthenware jars.",
        },
      },
    ],
  },
  {
    id: "gallery",
    name: "scene_sulyap_fine_arts_hall",
    shortLabel: "Fine Arts Hall",
    floorLabel: "1F West Wing",
    title: "1F West Wing: Fine Arts & Masterworks Hall 360°",
    panoramaUrl: GALLERY_HALL_PANO_URL,
    ...GALLERY_TILES,
    initialHlookat: -18,
    initialVlookat: 2,
    initialFov: 84,
    floorPath: [
      { ath: -48, atv: -22, label: "Step 1 · Monumental Canvas", lookAtAth: -48, lookAtAtv: 4 },
      { ath: -80, atv: -22, label: "Step 2 · Tagalog Landscapes", lookAtAth: -80, lookAtAtv: 5 },
      { ath: 42, atv: -22, label: "Step 3 · Modernist Folk Salon", lookAtAth: 42, lookAtAtv: 4 },
      {
        ath: 90,
        atv: -21,
        label: "Step 4 · Iron Gate to 16K Grand Pavilion",
        lookAtAth: 90,
        lookAtAtv: -2,
        targetSceneId: "grand16k",
      },
    ],
    hotspots: [
      {
        id: "hs-portal-to-16k",
        kind: "door",
        badge: "🚪",
        title: "Enter 16K Grand Pavilion →",
        subtitle: "Iron Gate Doorway",
        ath: 90,
        atv: -2,
        fov: 54,
        targetSceneId: "grand16k",
        arrivalView: { ath: 0, atv: 0, fov: 80 },
        pathOrder: 4,
      },
      {
        id: "hs-gallery-to-salon12k",
        kind: "door",
        badge: "🚪",
        title: "← Bahay na Bato 12K Salon",
        subtitle: "South Heritage Passage",
        ath: -145,
        atv: -2,
        fov: 54,
        targetSceneId: "salon12k",
        arrivalView: { ath: 43, atv: -2, fov: 80 },
      },
      {
        id: "hs-gallery-stairs-up",
        kind: "stairs-up",
        badge: "🪜",
        title: "North Colonnade → 2F Mezzanine ↑",
        subtitle: "Go Upstairs",
        ath: 0,
        atv: 1,
        fov: 54,
        targetSceneId: "upstairs12k",
        arrivalView: { ath: 0, atv: 0, fov: 78 },
      },
      {
        id: "hs-grand-canvas",
        kind: "art",
        badge: "1",
        title: "Baroque Sanctuary & Altar Masterwork",
        subtitle: "North-West Wall",
        ath: -48,
        atv: -7,
        lookAtAth: -48,
        lookAtAtv: 4,
        fov: 50,
        pathOrder: 1,
        artDetails: {
          imageUrl: ARTWORK_HD_PLATES.retablo,
          filTitle: "Dakilang Pintura ng Dambana at Retablo",
          artist: "19th-Century Academic Salon Masters",
          period: "19th-Century Academic Salon Tradition",
          medium: "Monumental Oil on Linen Canvas",
          dimensions: "4.8 m × 3.1 m",
          zone: "1F Fine Arts Hall · Main Salon",
          description:
            "Grand-scale architectural and liturgical oil masterwork depicting sunbeams illuminating a gilded Baroque retablo sanctuary, framed in carved gilt wood above polished Narra flooring.",
        },
      },
      {
        id: "hs-pastoral-landscapes",
        kind: "art",
        badge: "2",
        title: "Classical Tagalog Lake & Volcano Pastorale",
        subtitle: "Laguna & Batangas",
        ath: -80,
        atv: -6,
        lookAtAth: -80,
        lookAtAtv: 5,
        fov: 52,
        pathOrder: 2,
        artDetails: {
          imageUrl: ARTWORK_HD_PLATES.taal,
          filTitle: "Tanawing Bukid at Lawa ng Katagalugan",
          artist: "Tagalog Plein-Air Landscape School",
          period: "Early 20th Century · Laguna & Batangas",
          medium: "Oil on Wood Panel & Canvas",
          dimensions: "2.4 m × 1.6 m",
          zone: "1F Fine Arts Hall · West Bay",
          province: "Batangas",
          description:
            "Sun-drenched waters, outrigger bancas, and tranquil volcanic horizons celebrating everyday rural life across Batangas and Laguna.",
        },
      },
      {
        id: "hs-modernist-folk",
        kind: "art",
        badge: "3",
        title: "Angono Lakeside Modernist & Cubist Folk",
        subtitle: "Angono, Rizal",
        ath: 42,
        atv: -6,
        lookAtAth: 42,
        lookAtAtv: 4,
        fov: 52,
        pathOrder: 3,
        artDetails: {
          imageUrl: ARTWORK_HD_PLATES.modernist,
          filTitle: "Makabagong Sining-Bayan ng Angono sa Lawa",
          artist: "Rizal Lakeside Modernist Guild (Angono & Tanay)",
          period: "Post-War Philippine Modernism · Rizal",
          medium: "Transparent Cubist Oil on Canvas",
          dimensions: "3.2 m × 2.0 m",
          zone: "1F Fine Arts Hall · East Bay",
          province: "Rizal",
          description:
            "Vibrant transparent-Cubist light planes, fisherfolk hauling Laguna de Bay nets, folk guitarists, and blooming lotus flowers inspired by the National Artists and lakeside masters of Angono, Rizal.",
        },
      },
    ],
  },
];

export function buildKrpanoXml({
  sceneName,
  sceneTitle,
  panoramaUrl,
  cam,
  hotspots,
}: {
  sceneName: string;
  sceneTitle: string;
  panoramaUrl: string;
  cam: { hlookat: number; vlookat: number; fov: number };
  hotspots: KrpanoHotspot[];
}): string {
  const hsLines = hotspots
    .map((h) => {
      const targetAth = h.lookAtAth ?? h.ath;
      const targetAtv = h.lookAtAtv ?? h.atv;
      const action = h.targetSceneId
        ? `loadscene(scene_${h.targetSceneId}, null, MERGE, BLEND(0.8));`
        : `set(hotspot[hs_${h.id.replace(/[^a-zA-Z0-9_]/g, "_")}].visible, false); lookto(${targetAth.toFixed(1)}, ${targetAtv.toFixed(1)}, ${(h.fov ?? 46).toFixed(1)}, smooth(120,60,30)); popup_art_hd(${h.id});`;
      return `    <hotspot name="hs_${h.id.replace(/[^a-zA-Z0-9_]/g, "_")}"
             style="${h.kind === "stairs-up" || h.kind === "stairs-down" ? "skin_stairsstyle" : h.kind === "door" ? "skin_doorstyle" : "skin_hotspotstyle"}"
             ath="${h.ath.toFixed(1)}"
             atv="${h.atv.toFixed(1)}"
             title="${h.title.replace(/"/g, "&quot;")}"
             onclick="${action}" />`;
    })
    .join("\n\n");

  return `<krpano version="1.21" title="${sceneTitle.replace(/"/g, "&quot;")}">
  <display mipmapping="auto" autofullscreen="false" />
  <control mousetype="drag2d" touchtype="drag2d" zoomtocursor="true" friction="0.88" />
  <autorotate enabled="false" waittime="2.0" speed="3.2" horizon="0.0" tofov="82.0" />

  <scene name="${sceneName}" title="${sceneTitle.replace(/"/g, "&quot;")}">
    <view hlookat="${cam.hlookat.toFixed(1)}"
          vlookat="${cam.vlookat.toFixed(1)}"
          fovtype="MFOV"
          fov="${cam.fov.toFixed(1)}"
          maxpixelzoom="4.0"
          fovmin="18.0"
          fovmax="115.0"
          limitview="auto" />

    <image>
      <preview url="${panoramaUrl.replace(/\.(jpg|webp)$/i, "-preview.webp")}" />
      <sphere url="${panoramaUrl}" />
    </image>

${hsLines}
  </scene>
</krpano>`;
}
