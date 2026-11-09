import { ARTWORK_HD_PLATES } from "./sulyap-art-360";

export const CALABARZON_12K_PANO_URL = "/panoramas/calabarzon-heritage-salon-12k.jpg";
export const UPSTAIRS_12K_PANO_URL = "/panoramas/calabarzon-upstairs-mezzanine-12k.jpg";
export const DEFAULT_MUSEUM_PANO_URL = "/panoramas/museum-rotunda-360.jpg";
export const GALLERY_HALL_PANO_URL = "/panoramas/museum-gallery-hall-360.webp";

/** Exact horizontal overlap fraction (16px padding on each side of a 3000px sector = 3032px wide tile) */
export const TILE_12K_PAD_FRAC = 16 / 3032;
export const TILE_6K_PAD_FRAC = 12 / 1524;

export const SALON_12K_TILES = {
  previewUrl: "/panoramas/tiles/salon12k/preview.webp",
  tileUrls: [
    "/panoramas/tiles/salon12k/tile_0.jpg",
    "/panoramas/tiles/salon12k/tile_1.jpg",
    "/panoramas/tiles/salon12k/tile_2.jpg",
    "/panoramas/tiles/salon12k/tile_3.jpg",
  ] as [string, string, string, string],
  tilePadFrac: TILE_12K_PAD_FRAC,
  nativeWidth: 12000,
  nativeHeight: 6000,
};

export const UPSTAIRS_12K_TILES = {
  previewUrl: "/panoramas/tiles/upstairs12k/preview.webp",
  tileUrls: [
    "/panoramas/tiles/upstairs12k/tile_0.jpg",
    "/panoramas/tiles/upstairs12k/tile_1.jpg",
    "/panoramas/tiles/upstairs12k/tile_2.jpg",
    "/panoramas/tiles/upstairs12k/tile_3.jpg",
  ] as [string, string, string, string],
  tilePadFrac: TILE_12K_PAD_FRAC,
  nativeWidth: 12000,
  nativeHeight: 6000,
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
  nativeWidth: 6000,
  nativeHeight: 3000,
};

export type KrpanoHotspotKind = "art" | "door" | "stairs-up" | "stairs-down" | "path";

export type KrpanoArtDetails = {
  /** Dedicated 1,600×1,000 Ultra-HD close-up image brought forward when clicked */
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
  /** Horizontal spherical azimuth in degrees (-180..180, 0 = front center) */
  ath: number;
  /** Vertical spherical pitch in degrees (-90..90, + = up toward ceiling, - = down toward floor) */
  atv: number;
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
  /** Instant <40ms 2048×1024 WebP preview sphere for zero-lag room entry */
  previewUrl?: string;
  /** Pre-sliced 4-sector high-res GPU tiles decoded off-main-thread via createImageBitmap */
  tileUrls?: [string, string, string, string];
  tilePadFrac?: number;
  nativeWidth?: number;
  nativeHeight?: number;
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
    id: "salon12k",
    name: "scene_sulyap_calabarzon_12k",
    shortLabel: "1F: 12K Atrium",
    floorLabel: "1F Ground",
    title: "1F Ground: CALABARZON 12K Grand Atrium (12,000 × 6,000)",
    panoramaUrl: CALABARZON_12K_PANO_URL,
    ...SALON_12K_TILES,
    isUltraHd12k: true,
    initialHlookat: 0,
    initialVlookat: 2,
    initialFov: 80,
    floorPath: [
      {
        ath: -30,
        atv: -23,
        label: "Step 1 · 1898 Kawit Proclamation",
        lookAtAth: -30,
        lookAtAtv: 3.4,
      },
      { ath: 0, atv: -21, label: "Step 2 · Grand Staircase Base", lookAtAth: 0, lookAtAtv: 8 },
      { ath: 30, atv: -23, label: "Step 3 · Taal Volcano Sunrise", lookAtAth: 30, lookAtAtv: 3.4 },
      { ath: 60, atv: -23, label: "Step 4 · Paete Woodcarvers", lookAtAth: 59.7, lookAtAtv: 3.4 },
      {
        ath: 90,
        atv: -22,
        label: "Step 5 · East Rotunda Door",
        lookAtAth: 90,
        lookAtAtv: 1,
        targetSceneId: "rotunda",
      },
      { ath: -60, atv: -23, label: "Step 6 · Pahiyas Harvest", lookAtAth: -59.7, lookAtAtv: 3.4 },
      {
        ath: -90,
        atv: -22,
        label: "Step 7 · West Fine Arts Door",
        lookAtAth: -90,
        lookAtAtv: 1,
        targetSceneId: "gallery",
      },
    ],
    hotspots: [
      {
        id: "hs-stairs-up-mezzanine",
        kind: "stairs-up",
        badge: "🪜",
        title: "Climb Stairs → 2F Mezzanine Sky Gallery ↑",
        subtitle: "Go Upstairs (2nd Floor 12K)",
        ath: 0,
        atv: 9,
        fov: 52,
        targetSceneId: "upstairs12k",
        arrivalView: { ath: 0, atv: 3, fov: 78 },
        pathOrder: 2,
      },
      {
        id: "hs-door-atrium-to-rotunda",
        kind: "door",
        badge: "🚪",
        title: "Enter Grand Rotunda (East Door) →",
        subtitle: "Walk to East Wing",
        ath: 90,
        atv: 1,
        fov: 50,
        targetSceneId: "rotunda",
        arrivalView: { ath: -2, atv: 5, fov: 80 },
        pathOrder: 5,
      },
      {
        id: "hs-door-atrium-to-gallery",
        kind: "door",
        badge: "🚪",
        title: "Enter Fine Arts Hall (West Door) →",
        subtitle: "Walk to West Wing",
        ath: -90,
        atv: 1,
        fov: 50,
        targetSceneId: "gallery",
        arrivalView: { ath: -48, atv: 4, fov: 78 },
        pathOrder: 7,
      },
      {
        id: "hs-12k-kawit",
        kind: "art",
        badge: "1",
        title: "1898 Kawit Independence Proclamation",
        subtitle: "Cavite · Click to Inspect in HD",
        ath: -30,
        atv: 3.4,
        fov: 36,
        pathOrder: 1,
        artDetails: {
          imageUrl: ARTWORK_HD_PLATES.kawit,
          filTitle: "Pagpapahayag ng Kasarinlan sa Kawit, Kabite (1898)",
          artist: "Cavite Centennial Heritage Atelier",
          period: "June 12, 1898 · Kawit, Cavite",
          medium: "Classical Oil on Linen Canvas · Ornate Gilt Frame",
          dimensions: "3.3 m × 2.3 m monumental canvas",
          zone: "1F Ground Atrium · North-West Bay",
          province: "Cavite",
          description:
            "Depicts the historic unfurling of the Philippine Sun-and-Stars Flag from the Aguinaldo Shrine Bahay na Bato balcony before cheering townsfolk and revolutionary soldiers gathered in Kawit, Cavite on June 12, 1898.",
          highlight:
            "Use the 2× / 3.5× Zoom buttons on the left to inspect individual oil brushstrokes, Barong Tagalog embroidery, and balcony woodwork.",
          conservationNote: "Preserved in climate-controlled museum gallery framing.",
        },
      },
      {
        id: "hs-12k-taal",
        kind: "art",
        badge: "2",
        title: "Golden Sunrise Over Taal Volcano & Lake",
        subtitle: "Batangas · Click to Inspect in HD",
        ath: 30,
        atv: 3.4,
        fov: 36,
        pathOrder: 3,
        artDetails: {
          imageUrl: ARTWORK_HD_PLATES.taal,
          filTitle: "Bukang-Liwayway sa Bulkang Taal at Lawa",
          artist: "Southern Luzon Realist Landscape School",
          period: "Early 20th Century · Batangas",
          medium: "Luminous Realist Oil Impasto on Canvas",
          dimensions: "3.3 m × 2.3 m gallery canvas",
          zone: "1F Ground Atrium · North-East Bay",
          province: "Batangas",
          description:
            "Captures Batangas's iconic Volcano Island rising from tranquil Taal Lake at golden sunrise as traditional wooden paraw outriggers glide past lush coconut palms.",
          highlight:
            "Zoom into the high-resolution canvas to examine the sunlit water ripples and volcanic crater ridge.",
          conservationNote: "Protected behind museum anti-reflective UV glazing.",
        },
      },
      {
        id: "hs-12k-paete",
        kind: "art",
        badge: "3",
        title: "Master Woodcarvers of Paete & Angono",
        subtitle: "Laguna & Rizal · Click to Inspect in HD",
        ath: 59.7,
        atv: 3.4,
        fov: 36,
        pathOrder: 4,
        artDetails: {
          imageUrl: ARTWORK_HD_PLATES.paete,
          filTitle: "Mga Manlililok ng Paete at Pintor ng Angono",
          artist: "Laguna & Rizal Guild of Master Artisans",
          period: "19th–20th Century Tradition · Laguna & Rizal",
          medium: "Academic Genre Oil on Canvas",
          dimensions: "3.3 m × 2.3 m",
          zone: "1F Ground Atrium · East Colonnade",
          province: "Laguna",
          description:
            "Honors the chisel masters of Paete, Laguna—the Carving Capital of the Philippines—sculpting wooden santos beside folk muralists inside a sunlit Bahay na Bato workshop.",
          highlight:
            "Inspect fine wood shavings, hand chisels (paet), and Capiz window light in crisp HD.",
        },
      },
      {
        id: "hs-12k-pahiyas-ground",
        kind: "art",
        badge: "4",
        title: "Pahiyas Harvest of Lucban & Mt. Banahaw",
        subtitle: "Quezon · Click to Inspect in HD",
        ath: -59.7,
        atv: 3.4,
        fov: 36,
        pathOrder: 6,
        artDetails: {
          imageUrl: ARTWORK_HD_PLATES.pahiyas,
          filTitle: "Kapistahan ng Pahiyas sa Paanan ng Bundok Banahaw",
          artist: "Quezon Modernist Muralist Circle",
          period: "Mid-20th Century Modernist · Lucban, Quezon",
          medium: "Vibrant Modernist-Realist Oil Mural",
          dimensions: "3.3 m × 2.3 m",
          zone: "1F Ground Atrium · West Colonnade",
          province: "Quezon",
          description:
            "Celebrates Lucban's May 15 feast of San Isidro Labrador with colorful kiping rice-wafer chandeliers, overflowing harvest baskets, and townsfolk parading beneath mystical Mount Banahaw.",
          highlight: "Zoom to 3.5× to see every jewel-toned kiping leaf and woven basket.",
        },
      },
      {
        id: "hs-12k-gold-ground",
        kind: "art",
        badge: "5",
        title: "Batangas 24K Gold & Piña-Jusi Regalia",
        subtitle: "Batangas · Click to Inspect in HD",
        ath: 120.3,
        atv: 3.4,
        fov: 36,
        artDetails: {
          imageUrl: ARTWORK_HD_PLATES.gold,
          filTitle: "Sinaunang Ginto ng Batangas at Burdang Piña",
          artist: "Pre-Colonial Tagalog Goldsmiths & Taal Embroiderers",
          period: "10th–19th Century · Batangas",
          medium: "24K Filigree Gold Heirlooms & Calado Pineapple Fiber",
          dimensions: "1.8 m illuminated velvet vitrine",
          zone: "1F Ground Atrium · South-East Alcove",
          province: "Batangas",
          description:
            "Pairs pre-colonial Tagalog goldsmithing (lingling-o ornaments, filigree ceremonial buckle, and kinnari vessel) with gossamer calado-embroidered Piña-Jusi textiles from Taal.",
          highlight:
            "Studio macro photography reveals microscopic gold granulation beads and translucent piña threads.",
        },
      },
    ],
  },
  {
    id: "upstairs12k",
    name: "scene_sulyap_upstairs_mezzanine_12k",
    shortLabel: "2F: Upstairs 12K",
    floorLabel: "2F Upstairs",
    title: "2F Upstairs: Mezzanine 12K Sky Gallery (12,000 × 6,000)",
    panoramaUrl: UPSTAIRS_12K_PANO_URL,
    ...UPSTAIRS_12K_TILES,
    isUltraHd12k: true,
    initialHlookat: 0,
    initialVlookat: 3,
    initialFov: 78,
    floorPath: [
      { ath: -30, atv: -23, label: "Step 1 · Rizal's Calamba Study", lookAtAth: -30, lookAtAtv: 4 },
      { ath: 0, atv: -23, label: "Step 2 · Pahiyas Centerpiece", lookAtAth: 0, lookAtAtv: 4 },
      { ath: 30, atv: -23, label: "Step 3 · Pre-Colonial Gold", lookAtAth: 30, lookAtAtv: 4 },
      {
        ath: 90,
        atv: -22,
        label: "Step 4 · Skybridge to Rotunda",
        lookAtAth: 90,
        lookAtAtv: 1,
        targetSceneId: "rotunda",
      },
      {
        ath: 180,
        atv: -22,
        label: "Step 5 · Stairs Down to 1F Atrium",
        lookAtAth: 180,
        lookAtAtv: -10,
        targetSceneId: "salon12k",
      },
    ],
    hotspots: [
      {
        id: "hs-stairs-down-atrium",
        kind: "stairs-down",
        badge: "🪜",
        title: "Go Downstairs → 1F Grand Atrium ↓",
        subtitle: "Descend Grand Staircase",
        ath: 180,
        atv: -9,
        fov: 54,
        targetSceneId: "salon12k",
        arrivalView: { ath: 180, atv: 0, fov: 80 },
        pathOrder: 5,
      },
      {
        id: "hs-upstairs-door-rotunda",
        kind: "door",
        badge: "🚪",
        title: "East Skybridge → Grand Rotunda →",
        subtitle: "Walk to Rotunda Wing",
        ath: 90,
        atv: 1,
        fov: 50,
        targetSceneId: "rotunda",
        arrivalView: { ath: -2, atv: 6, fov: 80 },
        pathOrder: 4,
      },
      {
        id: "hs-upstairs-door-gallery",
        kind: "door",
        badge: "🚪",
        title: "West Gallery Door → Fine Arts Hall →",
        subtitle: "Walk to Fine Arts Wing",
        ath: -90,
        atv: 1,
        fov: 50,
        targetSceneId: "gallery",
        arrivalView: { ath: 42, atv: 4, fov: 78 },
      },
      {
        id: "hs-upstairs-rizal",
        kind: "art",
        badge: "1",
        title: "Young Jose Rizal's Study in Calamba",
        subtitle: "Laguna · Click to Inspect in HD",
        ath: -30,
        atv: 4,
        fov: 35,
        pathOrder: 1,
        artDetails: {
          imageUrl: ARTWORK_HD_PLATES.rizal,
          filTitle: "Ang Pag-aaral ng Batang si Jose Rizal sa Calamba",
          artist: "Laguna Academic Portrait Tradition",
          period: "Late 19th Century · Calamba, Laguna",
          medium: "Chiaroscuro Classical Oil on Canvas",
          dimensions: "2.9 m × 2.2 m",
          zone: "2F Mezzanine Sky Gallery · North-West Wall",
          province: "Laguna",
          description:
            "Portrays young Jose Rizal reading by warm brass oil-lamp glow inside the Mercado family library in Calamba, surrounded by leather-bound folios, quill manuscripts, and cool Capiz window moonlight.",
          highlight:
            "Zoom into the foreground canvas to inspect the quill inkstand, open folios, and warm chiaroscuro lighting.",
        },
      },
      {
        id: "hs-upstairs-pahiyas",
        kind: "art",
        badge: "2",
        title: "Grand Pahiyas & Mount Banahaw Panorama",
        subtitle: "Quezon · Click to Inspect in HD",
        ath: 0,
        atv: 4,
        fov: 36,
        pathOrder: 2,
        artDetails: {
          imageUrl: ARTWORK_HD_PLATES.pahiyas,
          filTitle: "Dakilang Tanawin ng Pahiyas at Bundok Banahaw",
          artist: "Quezon Heritage Masterworks Studio",
          period: "Heritage Masterwork · Lucban, Quezon",
          medium: "Monumental Oil & Tempera on Panel",
          dimensions: "3.3 m × 2.3 m centerpiece",
          zone: "2F Mezzanine Sky Gallery · North Centerpiece",
          province: "Quezon",
          description:
            "Anchors the second-floor sky gallery with a sweeping celebration of Quezon Province's agricultural bounty, vibrant kiping chandeliers, and sacred Mount Banahaw.",
          highlight: "Illuminated directly beneath the 2nd-floor leaded-glass oculus skylight.",
        },
      },
      {
        id: "hs-upstairs-gold",
        kind: "art",
        badge: "3",
        title: "Royal Tagalog Gold & Piña-Seda Treasury",
        subtitle: "Batangas · Click to Inspect in HD",
        ath: 30,
        atv: 4,
        fov: 35,
        pathOrder: 3,
        artDetails: {
          imageUrl: ARTWORK_HD_PLATES.gold,
          filTitle: "Kayamanang Ginto at Habi ng Katagalugan",
          artist: "Batangas Goldsmiths & Taal Master Weavers",
          period: "Pre-Colonial to 1890s · Batangas",
          medium: "24K Gold Artifacts & Calado-Embroidered Textile Plate",
          dimensions: "2.9 m × 2.2 m treasury display",
          zone: "2F Mezzanine Sky Gallery · North-East Wall",
          province: "Batangas",
          description:
            "Showcases intricate Batangas filigree gold ceremonial ornaments alongside hand-loomed piña-seda embroidery preserved in the upstairs mezzanine treasury.",
          highlight:
            "High-resolution foreground view lets you examine delicate filigree twists with zero blur.",
        },
      },
      {
        id: "hs-upstairs-kawit-study",
        kind: "art",
        badge: "4",
        title: "Baroque Sanctuary & Gilded Retablo Mayor",
        subtitle: "Laguna & Batangas · Click to Inspect in HD",
        ath: 58,
        atv: 4,
        fov: 36,
        artDetails: {
          imageUrl: ARTWORK_HD_PLATES.retablo,
          filTitle: "Ginintuang Retablo Mayor ng Sinaunang Simbahan",
          artist: "Colonial Ecclesiastical Builders & Santeros",
          period: "18th–19th Century · Taal & Paete",
          medium: "Architectural Oil & Gold-Leaf Study on Canvas",
          dimensions: "2.9 m × 2.2 m",
          zone: "2F Mezzanine Sky Gallery · East Bay",
          province: "Batangas",
          description:
            "Celebrates CALABARZON's grand earthquake-Baroque and Neoclassical stone churches—from Taal Basilica to Paete and Majayjay—highlighting multi-tiered gold-leaf retablo altars.",
          highlight:
            "Inspect Solomonic columns, saint niches, and stained-glass sunbeams in high resolution.",
        },
      },
    ],
  },
  {
    id: "rotunda",
    name: "scene_sulyap_museum_rotunda",
    shortLabel: "1F: Rotunda Wing",
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
        label: "Step 4 · Door to 12K Atrium",
        lookAtAth: -62,
        lookAtAtv: -2,
        targetSceneId: "salon12k",
      },
    ],
    hotspots: [
      {
        id: "hs-rotunda-to-atrium",
        kind: "door",
        badge: "🚪",
        title: "← Return to 1F 12K Grand Atrium",
        subtitle: "West Archway Door",
        ath: -62,
        atv: -2,
        fov: 54,
        targetSceneId: "salon12k",
        arrivalView: { ath: -90, atv: 2, fov: 80 },
        pathOrder: 4,
      },
      {
        id: "hs-portal-to-gallery",
        kind: "door",
        badge: "🚪",
        title: "Enter Fine Arts Hall (East Archway) →",
        subtitle: "Walk to West Wing",
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
        title: "Gallery Lift / Stairs → 2F Mezzanine ↑",
        subtitle: "Ascend to 2nd Floor",
        ath: -26,
        atv: 1,
        fov: 54,
        targetSceneId: "upstairs12k",
        arrivalView: { ath: -90, atv: 3, fov: 78 },
      },
      {
        id: "hs-monument",
        kind: "art",
        badge: "1",
        title: "Inang Bayan Torch Monument",
        subtitle: "Rotunda Centerpiece · Click for HD",
        ath: -2,
        atv: 6,
        fov: 54,
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
          highlight:
            "Foreground HD studio view reveals crisp Filipiniana bronze drapery and stained-glass oculus reflections.",
        },
      },
      {
        id: "hs-cavite-mural",
        kind: "art",
        badge: "2",
        title: "Revolution & Kasaysayan Mural (Cavite)",
        subtitle: "West Rotunda Wall · Click for HD",
        ath: -128,
        atv: 3,
        fov: 52,
        artDetails: {
          imageUrl: ARTWORK_HD_PLATES.kawit,
          filTitle: "Mural ng Himagsikan at Kasaysayan ng Kabite",
          artist: "Historical Muralist Guild",
          period: "Centennial Historical Cycle · Cavite",
          medium: "Panoramic Oil on Canvas",
          dimensions: "5.4 m × 3.2 m",
          zone: "1F Grand Rotunda · West Gallery",
          province: "Cavite",
          description:
            "Chronicles the struggle for Philippine nationhood across Cavite's historic towns from Imus and Binakayan to the June 12, 1898 proclamation in Kawit.",
          highlight: "Brought forward in crisp 1,600×1,000 HD so every figure is crystal clear.",
        },
      },
      {
        id: "hs-bahay-kubo",
        kind: "art",
        badge: "3",
        title: "Ancestral Bahay Kubo & Burial Jars",
        subtitle: "Quezon & Batangas · Click for HD",
        ath: 92,
        atv: -2,
        fov: 52,
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
          highlight: "Zoom to 3.5× to inspect woven bamboo lashing and Capiz window joinery.",
        },
      },
    ],
  },
  {
    id: "gallery",
    name: "scene_sulyap_fine_arts_hall",
    shortLabel: "1F: Fine Arts Hall",
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
        label: "Step 4 · Iron Gate to 12K Atrium",
        lookAtAth: 90,
        lookAtAtv: -2,
        targetSceneId: "salon12k",
      },
    ],
    hotspots: [
      {
        id: "hs-portal-to-12k",
        kind: "door",
        badge: "🚪",
        title: "Enter 1F 12K Grand Atrium (Iron Gate) →",
        subtitle: "Walk to 12K Atrium",
        ath: 90,
        atv: -2,
        fov: 54,
        targetSceneId: "salon12k",
        arrivalView: { ath: 90, atv: 2, fov: 80 },
        pathOrder: 4,
      },
      {
        id: "hs-gallery-stairs-up",
        kind: "stairs-up",
        badge: "🪜",
        title: "North Colonnade Stairs → 2F Mezzanine ↑",
        subtitle: "Go Upstairs (2nd Floor 12K)",
        ath: 0,
        atv: 1,
        fov: 54,
        targetSceneId: "upstairs12k",
        arrivalView: { ath: 0, atv: 4, fov: 78 },
      },
      {
        id: "hs-grand-canvas",
        kind: "art",
        badge: "1",
        title: "Baroque Sanctuary & Altar Masterwork",
        subtitle: "North-West Wall · Click for HD",
        ath: -48,
        atv: 4,
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
          highlight: "Brought forward in full HD clarity despite the wide gallery room backdrop.",
        },
      },
      {
        id: "hs-pastoral-landscapes",
        kind: "art",
        badge: "2",
        title: "Classical Tagalog Lake & Volcano Pastorale",
        subtitle: "Laguna & Batangas · Click for HD",
        ath: -80,
        atv: 5,
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
          highlight: "Zoom into the HD plate to inspect warm golden-hour brushwork.",
        },
      },
      {
        id: "hs-modernist-folk",
        kind: "art",
        badge: "3",
        title: "Angono Lakeside Modernist & Cubist Folk",
        subtitle: "Angono, Rizal · Click for HD",
        ath: 42,
        atv: 4,
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
          highlight:
            "Inspect the prism-like geometric color planes and rich canvas impasto in 1,600×1,000 HD.",
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
      const action = h.targetSceneId
        ? `loadscene(scene_${h.targetSceneId}, null, MERGE, BLEND(0.8));`
        : `lookto(${h.ath.toFixed(1)}, ${h.atv.toFixed(1)}, ${(h.fov ?? 46).toFixed(1)}, smooth(120,60,30)); popup_art_hd(${h.id});`;
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
          fovmin="20.0"
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
