export const DEFAULT_MUSEUM_PANO_URL = "/panoramas/museum-rotunda-360.jpg";
export const GALLERY_HALL_PANO_URL = "/panoramas/museum-gallery-hall-360.webp";

export type KrpanoHotspot = {
  id: string;
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
  /** If set, clicking this hotspot triggers krpano loadscene(targetSceneId) to walk into another 360° room! */
  targetSceneId?: string;
};

export type KrpanoSceneConfig = {
  id: string;
  name: string;
  shortLabel: string;
  title: string;
  panoramaUrl: string;
  initialHlookat?: number;
  initialVlookat?: number;
  initialFov?: number;
  hotspots: KrpanoHotspot[];
};

export const DEFAULT_MUSEUM_SCENES: KrpanoSceneConfig[] = [
  {
    id: "rotunda",
    name: "scene_sulyap_museum_rotunda",
    shortLabel: "Room 1: Grand Rotunda",
    title: "Room 1: Grand Heritage Rotunda 360°",
    panoramaUrl: DEFAULT_MUSEUM_PANO_URL,
    initialHlookat: 0,
    initialVlookat: 2,
    initialFov: 86,
    hotspots: [
      {
        id: "hs-portal-to-gallery",
        badge: "🚪",
        title: "Enter Fine Arts Gallery Hall →",
        subtitle: "Walk to Room 2",
        ath: 58,
        atv: -2,
        fov: 76,
        targetSceneId: "gallery",
      },
      {
        id: "hs-monument",
        badge: "1",
        title: "Inang Bayan Torch Monument",
        ath: -2,
        atv: 6,
        fov: 58,
      },
      {
        id: "hs-cavite-mural",
        badge: "2",
        title: "Revolution & Kasaysayan Mural (Cavite)",
        ath: -128,
        atv: 3,
        fov: 56,
      },
      {
        id: "hs-mestiza-gown",
        badge: "3",
        title: "19th-Century Traje de Mestiza (Laguna)",
        ath: -167,
        atv: -9,
        fov: 54,
      },
      {
        id: "hs-bahay-kubo",
        badge: "4",
        title: "Ancestral Bahay Kubo Model (Quezon)",
        ath: 92,
        atv: -2,
        fov: 56,
      },
      {
        id: "hs-gold-vessels",
        badge: "5",
        title: "Pre-Colonial Gold & Burial Jars (Batangas)",
        ath: 121,
        atv: -11,
        fov: 52,
      },
      {
        id: "hs-okir-tapestry",
        badge: "6",
        title: "Carved Relief & Woven Tapestry (Rizal)",
        ath: 142,
        atv: 5,
        fov: 56,
      },
    ],
  },
  {
    id: "gallery",
    name: "scene_sulyap_fine_arts_hall",
    shortLabel: "Room 2: Fine Arts Hall",
    title: "Room 2: Fine Arts & Masterworks Gallery 360°",
    panoramaUrl: GALLERY_HALL_PANO_URL,
    initialHlookat: -18,
    initialVlookat: 2,
    initialFov: 86,
    hotspots: [
      {
        id: "hs-portal-to-rotunda",
        badge: "🚪",
        title: "Return to Grand Rotunda →",
        subtitle: "Walk to Room 1",
        ath: 90,
        atv: -2,
        fov: 76,
        targetSceneId: "rotunda",
      },
      {
        id: "hs-grand-canvas",
        badge: "1",
        title: "Monumental Historical Canvas",
        ath: -48,
        atv: 4,
        fov: 54,
      },
      {
        id: "hs-pastoral-landscapes",
        badge: "2",
        title: "Classical Tagalog Landscapes & Portraits",
        ath: -80,
        atv: 5,
        fov: 56,
      },
      {
        id: "hs-carved-anito",
        badge: "3",
        title: "Cordillera & Sierra Madre Wood Sculpture",
        ath: -102,
        atv: -5,
        fov: 54,
      },
      {
        id: "hs-modernist-folk",
        badge: "4",
        title: "Modernist Folk & Cubist Masterworks",
        ath: 42,
        atv: 4,
        fov: 56,
      },
      {
        id: "hs-vaulted-skylight",
        badge: "5",
        title: "Coffered Barrel-Vaulted Clerestory Ceiling",
        ath: 0,
        atv: 48,
        fov: 68,
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
        : `lookto(${h.ath.toFixed(1)}, ${h.atv.toFixed(1)}, ${(h.fov ?? 58).toFixed(1)}, smooth(120,60,30));`;
      return `    <hotspot name="hs_${h.id.replace(/[^a-zA-Z0-9_]/g, "_")}"
             style="skin_hotspotstyle"
             ath="${h.ath.toFixed(1)}"
             atv="${h.atv.toFixed(1)}"
             title="${h.title.replace(/"/g, "&quot;")}"
             onclick="${action}" />`;
    })
    .join("\n\n");

  return `<krpano version="1.21" title="${sceneTitle.replace(/"/g, "&quot;")}">
  <control mousetype="drag2d" touchtype="drag2d" zoomtocursor="true" friction="0.88" />
  <autorotate enabled="false" waittime="2.0" speed="3.5" horizon="0.0" tofov="86.0" />

  <scene name="${sceneName}" title="${sceneTitle.replace(/"/g, "&quot;")}">
    <view hlookat="${cam.hlookat.toFixed(1)}"
          vlookat="${cam.vlookat.toFixed(1)}"
          fovtype="MFOV"
          fov="${cam.fov.toFixed(1)}"
          fovmin="35.0"
          fovmax="115.0"
          limitview="auto" />

    <image>
      <sphere url="${panoramaUrl}" />
    </image>

${hsLines}
  </scene>
</krpano>`;
}
