import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, ExternalLink, RotateCw, Sparkles } from "lucide-react";
import type { Destination } from "@/lib/destinations";
import {
  CALABARZON_12K_PANO_URL,
  DEFAULT_MUSEUM_PANO_URL,
  GALLERY_HALL_PANO_URL,
  GALLERY_TILES,
  ROTUNDA_TILES,
  SALON_12K_TILES,
  UPSTAIRS_12K_PANO_URL,
  UPSTAIRS_12K_TILES,
  type KrpanoSceneConfig,
} from "@/lib/krpano-scenes";
import { getArtPieces360, type ArtPiece360 } from "@/lib/sulyap-art-360";
import { C, F, conciseText, getCategoryMeta } from "@/lib/sulyap-theme";
import { KrpanoViewer } from "./krpano-viewer";
import { Pop } from "./sulyap-ui";

type SceneRoomId = "salon12k" | "upstairs12k" | "rotunda" | "gallery";

// Calibrated 3D spherical vantage points across all 4 Rooms & 2 Floors (1F Atrium, 2F Upstairs, Rotunda, Fine Arts)
const MUSEUM_WING_COORDS: {
  sceneId: SceneRoomId;
  roomBadge: string;
  roomTitle: string;
  ath: number;
  atv: number;
  fov: number;
}[] = [
  {
    sceneId: "salon12k",
    roomBadge: "1F · 12K Atrium",
    roomTitle: "1F Ground (12K Grand Atrium)",
    ath: -30,
    atv: 3.4,
    fov: 38,
  },
  {
    sceneId: "upstairs12k",
    roomBadge: "2F · Upstairs 12K",
    roomTitle: "2F Upstairs (12K Mezzanine Sky Gallery)",
    ath: 0,
    atv: 4,
    fov: 38,
  },
  {
    sceneId: "rotunda",
    roomBadge: "1F · Rotunda Wing",
    roomTitle: "1F East Wing (Grand Rotunda)",
    ath: -2,
    atv: 6,
    fov: 54,
  },
  {
    sceneId: "gallery",
    roomBadge: "1F · Fine Arts",
    roomTitle: "1F West Wing (Fine Arts Hall)",
    ath: -48,
    atv: 4,
    fov: 50,
  },
];

export function SulyapArt360Map({
  destination,
  onBack,
  compact = false,
}: {
  destination: Destination;
  onBack?: () => void;
  compact?: boolean;
}) {
  const pieces = useMemo(() => getArtPieces360(destination), [destination]);
  const [selectedId, setSelectedId] = useState<string>(pieces[0]?.id ?? "");
  const [activeSceneId, setActiveSceneId] = useState<SceneRoomId>("salon12k");
  const [expanded, setExpanded] = useState<boolean>(false);
  const [targetView, setTargetView] = useState<{
    ath: number;
    atv: number;
    fov: number;
    sceneId: string;
    key: string;
  } | null>(null);

  const cat = getCategoryMeta(destination.category);

  useEffect(() => {
    if (pieces[0]) {
      setSelectedId(pieces[0].id);
      setActiveSceneId("salon12k");
      setExpanded(false);
      setTargetView({
        ath: MUSEUM_WING_COORDS[0]!.ath,
        atv: MUSEUM_WING_COORDS[0]!.atv,
        fov: MUSEUM_WING_COORDS[0]!.fov,
        sceneId: MUSEUM_WING_COORDS[0]!.sceneId,
        key: `${destination.id}-${pieces[0].id}-init`,
      });
    }
  }, [destination.id, pieces]);

  const selectedPiece: ArtPiece360 = pieces.find((p) => p.id === selectedId) ?? pieces[0]!;
  const selectedIndex = Math.max(
    0,
    pieces.findIndex((p) => p.id === selectedPiece.id),
  );
  const selectedWing = MUSEUM_WING_COORDS[selectedIndex % MUSEUM_WING_COORDS.length]!;

  // Build 4 connected 360° krpano rooms across 2 floors (1F Atrium <-> Stairs <-> 2F Upstairs <-> Doors <-> Rotunda & Gallery)
  const destinationScenes: KrpanoSceneConfig[] = useMemo(() => {
    const p0 = pieces[0];
    const p1 = pieces[1];
    const p2 = pieces[2];
    const p3 = pieces[3];
    const safeSlug = destination.slug.replace(/[^a-zA-Z0-9_]/g, "_");

    return [
      {
        id: "salon12k",
        name: `scene_${safeSlug}_salon12k`,
        shortLabel: "1F: 12K Atrium",
        floorLabel: "1F Ground",
        title: `${destination.name} — 1F Ground: 12K Grand Atrium`,
        panoramaUrl: CALABARZON_12K_PANO_URL,
        ...SALON_12K_TILES,
        isUltraHd12k: true,
        initialHlookat: 0,
        initialVlookat: 2,
        initialFov: 78,
        floorPath: [
          {
            ath: -30,
            atv: -23,
            label: `Step 1 · ${p0?.title ?? "Exhibit 1"}`,
            lookAtAth: -30,
            lookAtAtv: 3.4,
          },
          {
            ath: 0,
            atv: -21,
            label: "Step 2 · Climb Stairs to 2F Mezzanine ↑",
            lookAtAth: 0,
            lookAtAtv: 9,
            targetSceneId: "upstairs12k",
          },
          {
            ath: 90,
            atv: -22,
            label: "Step 3 · East Door to Rotunda →",
            lookAtAth: 90,
            lookAtAtv: 1,
            targetSceneId: "rotunda",
          },
          {
            ath: -90,
            atv: -22,
            label: "Step 4 · West Door to Fine Arts →",
            lookAtAth: -90,
            lookAtAtv: 1,
            targetSceneId: "gallery",
          },
        ],
        hotspots: [
          {
            id: "stairs-up-mezzanine",
            kind: "stairs-up",
            badge: "🪜",
            title: "Climb Stairs → 2F Upstairs 12K ↑",
            subtitle: "Go Upstairs (Exhibit 2)",
            ath: 0,
            atv: 9,
            fov: 50,
            targetSceneId: "upstairs12k",
            arrivalView: { ath: 0, atv: 4, fov: 76 },
            pathOrder: 2,
          },
          {
            id: "door-atrium-to-rotunda",
            kind: "door",
            badge: "🚪",
            title: "East Door → Grand Rotunda →",
            subtitle: "Walk to Exhibit 3",
            ath: 90,
            atv: 1,
            fov: 50,
            targetSceneId: "rotunda",
            arrivalView: { ath: -2, atv: 6, fov: 76 },
            pathOrder: 3,
          },
          {
            id: "door-atrium-to-gallery",
            kind: "door",
            badge: "🚪",
            title: "West Door → Fine Arts Hall →",
            subtitle: "Walk to Exhibit 4",
            ath: -90,
            atv: 1,
            fov: 50,
            targetSceneId: "gallery",
            arrivalView: { ath: -48, atv: 4, fov: 76 },
          },
          ...(p0
            ? [
                {
                  id: p0.id,
                  kind: "art" as const,
                  badge: "1",
                  title: p0.title,
                  subtitle: p0.zone,
                  ath: MUSEUM_WING_COORDS[0]!.ath,
                  atv: MUSEUM_WING_COORDS[0]!.atv,
                  fov: MUSEUM_WING_COORDS[0]!.fov,
                  pathOrder: 1,
                  artDetails: {
                    period: p0.period,
                    medium: p0.medium,
                    zone: `1F 12K Atrium · ${p0.zone}`,
                    province: destination.province,
                    description: p0.details,
                    highlight:
                      "Click Macro Zoom (22°) for crystal-clear native 12,000 × 6,000 detail.",
                  },
                },
              ]
            : []),
        ],
      },
      {
        id: "upstairs12k",
        name: `scene_${safeSlug}_upstairs12k`,
        shortLabel: "2F: Upstairs 12K",
        floorLabel: "2F Upstairs",
        title: `${destination.name} — 2F Upstairs: 12K Mezzanine Sky Gallery`,
        panoramaUrl: UPSTAIRS_12K_PANO_URL,
        ...UPSTAIRS_12K_TILES,
        isUltraHd12k: true,
        initialHlookat: 0,
        initialVlookat: 4,
        initialFov: 76,
        floorPath: [
          {
            ath: 0,
            atv: -23,
            label: `Step 1 · ${p1?.title ?? "Exhibit 2"}`,
            lookAtAth: 0,
            lookAtAtv: 4,
          },
          {
            ath: 90,
            atv: -22,
            label: "Step 2 · Skybridge Door to Rotunda →",
            lookAtAth: 90,
            lookAtAtv: 1,
            targetSceneId: "rotunda",
          },
          {
            ath: 180,
            atv: -22,
            label: "Step 3 · Stairs Down to 1F Atrium ↓",
            lookAtAth: 180,
            lookAtAtv: -9,
            targetSceneId: "salon12k",
          },
        ],
        hotspots: [
          {
            id: "stairs-down-atrium",
            kind: "stairs-down",
            badge: "🪜",
            title: "Go Downstairs → 1F Atrium ↓",
            subtitle: "Descend Grand Staircase",
            ath: 180,
            atv: -9,
            fov: 54,
            targetSceneId: "salon12k",
            arrivalView: { ath: 180, atv: 0, fov: 78 },
            pathOrder: 3,
          },
          {
            id: "upstairs-door-rotunda",
            kind: "door",
            badge: "🚪",
            title: "Skybridge Door → Grand Rotunda →",
            subtitle: "Walk to Exhibit 3",
            ath: 90,
            atv: 1,
            fov: 50,
            targetSceneId: "rotunda",
            arrivalView: { ath: -2, atv: 6, fov: 76 },
            pathOrder: 2,
          },
          ...(p1
            ? [
                {
                  id: p1.id,
                  kind: "art" as const,
                  badge: "2",
                  title: p1.title,
                  subtitle: p1.zone,
                  ath: MUSEUM_WING_COORDS[1]!.ath,
                  atv: MUSEUM_WING_COORDS[1]!.atv,
                  fov: MUSEUM_WING_COORDS[1]!.fov,
                  pathOrder: 1,
                  artDetails: {
                    period: p1.period,
                    medium: p1.medium,
                    zone: `2F Upstairs 12K · ${p1.zone}`,
                    province: destination.province,
                    description: p1.details,
                    highlight: "Displayed beneath the 2nd-floor leaded-glass oculus dome.",
                  },
                },
              ]
            : []),
        ],
      },
      {
        id: "rotunda",
        name: `scene_${safeSlug}_rotunda`,
        shortLabel: "1F: Rotunda Wing",
        floorLabel: "1F East Wing",
        title: `${destination.name} — 1F East Wing: Grand Rotunda 360°`,
        panoramaUrl: DEFAULT_MUSEUM_PANO_URL,
        ...ROTUNDA_TILES,
        initialHlookat: -2,
        initialVlookat: 4,
        initialFov: 82,
        floorPath: [
          {
            ath: -2,
            atv: -22,
            label: `Step 1 · ${p2?.title ?? "Exhibit 3"}`,
            lookAtAth: -2,
            lookAtAtv: 6,
          },
          {
            ath: 58,
            atv: -21,
            label: "Step 2 · Door to Fine Arts Hall →",
            lookAtAth: 58,
            lookAtAtv: -2,
            targetSceneId: "gallery",
          },
        ],
        hotspots: [
          {
            id: "portal-to-gallery",
            kind: "door",
            badge: "🚪",
            title: "Enter Fine Arts Hall (Exhibit 4) →",
            subtitle: "East Archway Door",
            ath: 58,
            atv: -2,
            fov: 54,
            targetSceneId: "gallery",
            arrivalView: { ath: -48, atv: 4, fov: 76 },
            pathOrder: 2,
          },
          {
            id: "rotunda-back-atrium",
            kind: "door",
            badge: "🚪",
            title: "← Return to 1F 12K Atrium",
            subtitle: "West Archway Door",
            ath: -62,
            atv: -2,
            fov: 54,
            targetSceneId: "salon12k",
            arrivalView: { ath: -30, atv: 3.4, fov: 76 },
          },
          ...(p2
            ? [
                {
                  id: p2.id,
                  kind: "art" as const,
                  badge: "3",
                  title: p2.title,
                  subtitle: p2.zone,
                  ath: MUSEUM_WING_COORDS[2]!.ath,
                  atv: MUSEUM_WING_COORDS[2]!.atv,
                  fov: MUSEUM_WING_COORDS[2]!.fov,
                  pathOrder: 1,
                  artDetails: {
                    period: p2.period,
                    medium: p2.medium,
                    zone: `1F Rotunda Wing · ${p2.zone}`,
                    province: destination.province,
                    description: p2.details,
                  },
                },
              ]
            : []),
        ],
      },
      {
        id: "gallery",
        name: `scene_${safeSlug}_gallery`,
        shortLabel: "1F: Fine Arts",
        floorLabel: "1F West Wing",
        title: `${destination.name} — 1F West Wing: Fine Arts Hall 360°`,
        panoramaUrl: GALLERY_HALL_PANO_URL,
        ...GALLERY_TILES,
        initialHlookat: -35,
        initialVlookat: 2,
        initialFov: 82,
        floorPath: [
          {
            ath: -48,
            atv: -22,
            label: `Step 1 · ${p3?.title ?? "Exhibit 4"}`,
            lookAtAth: -48,
            lookAtAtv: 4,
          },
          {
            ath: 90,
            atv: -21,
            label: "Step 2 · Return to 1F 12K Atrium →",
            lookAtAth: 90,
            lookAtAtv: -2,
            targetSceneId: "salon12k",
          },
        ],
        hotspots: [
          {
            id: "portal-to-12k",
            kind: "door",
            badge: "🚪",
            title: "Return to 1F 12K Atrium →",
            subtitle: "Iron Gate Doorway",
            ath: 90,
            atv: -2,
            fov: 54,
            targetSceneId: "salon12k",
            arrivalView: { ath: 0, atv: 4, fov: 78 },
            pathOrder: 2,
          },
          {
            id: "gallery-stairs-up",
            kind: "stairs-up",
            badge: "🪜",
            title: "North Stairs → 2F Upstairs 12K ↑",
            subtitle: "Go Upstairs",
            ath: 0,
            atv: 1,
            fov: 54,
            targetSceneId: "upstairs12k",
            arrivalView: { ath: 0, atv: 4, fov: 76 },
          },
          ...(p3
            ? [
                {
                  id: p3.id,
                  kind: "art" as const,
                  badge: "4",
                  title: p3.title,
                  subtitle: p3.zone,
                  ath: MUSEUM_WING_COORDS[3]!.ath,
                  atv: MUSEUM_WING_COORDS[3]!.atv,
                  fov: MUSEUM_WING_COORDS[3]!.fov,
                  pathOrder: 1,
                  artDetails: {
                    period: p3.period,
                    medium: p3.medium,
                    zone: `1F Fine Arts Hall · ${p3.zone}`,
                    province: destination.province,
                    description: p3.details,
                  },
                },
              ]
            : []),
        ],
      },
    ];
  }, [destination.slug, destination.name, destination.province, pieces]);

  const focusPiece = (piece: ArtPiece360, idx: number) => {
    const coords = MUSEUM_WING_COORDS[idx % MUSEUM_WING_COORDS.length]!;
    setSelectedId(piece.id);
    setActiveSceneId(coords.sceneId);
    setExpanded(false);
    setTargetView({
      sceneId: coords.sceneId,
      ath: coords.ath,
      atv: coords.atv,
      fov: coords.fov,
      key: `${piece.id}-${Date.now()}`,
    });
  };

  const stepPiece = (dir: -1 | 1) => {
    const nextIdx = (selectedIndex + dir + pieces.length) % pieces.length;
    const next = pieces[nextIdx];
    if (next) focusPiece(next, nextIdx);
  };

  const streetViewUrl =
    destination.latitude != null && destination.longitude != null
      ? `https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=${destination.latitude},${destination.longitude}`
      : null;

  const { short, hasMore } = conciseText(selectedPiece.details, 1);

  return (
    <section aria-label={`360-degree Art Map for ${destination.name}`} className="w-full">
      {/* Header Bar */}
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span
            className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[12px] font-bold text-white"
            style={{ backgroundColor: C.cover }}
          >
            <RotateCw className="size-3.5" /> krpano 360° · 2 Floors / 4 Rooms (12K UHD)
          </span>
          <span className="text-[13px] font-medium" style={{ color: C.mute }}>
            Click 👣 floor path, 🪜 stairs (Upstairs/Downstairs), 🚪 doors, or art pieces 1–4 for
            details
          </span>
        </div>

        <div className="flex items-center gap-2">
          {streetViewUrl ? (
            <button
              type="button"
              onClick={() => window.open(streetViewUrl, "_blank", "noopener,noreferrer")}
              className="inline-flex cursor-pointer items-center gap-1 rounded-full border border-[#CBD5E1] bg-white px-3 py-1 text-[12px] font-bold hover:bg-[#EFF6FF]"
              style={{ color: C.ink }}
            >
              Google Street View <ExternalLink className="size-3" />
            </button>
          ) : null}

          {onBack ? (
            <button
              type="button"
              onClick={onBack}
              className="cursor-pointer rounded-full border border-[#CBD5E1] bg-white px-3 py-1 text-[12px] font-bold hover:bg-[#EFF6FF]"
              style={{ color: C.ink }}
            >
              Done
            </button>
          ) : null}
        </div>
      </div>

      {/* Real Full 360°×180° WebGL Spherical Panorama Stage with 2 Floors & 4 Connected Rooms */}
      <KrpanoViewer
        scenes={destinationScenes}
        activeSceneId={activeSceneId}
        onSceneChange={(id) => {
          const nextRoom: SceneRoomId =
            id === "upstairs12k"
              ? "upstairs12k"
              : id === "rotunda"
                ? "rotunda"
                : id === "gallery"
                  ? "gallery"
                  : "salon12k";
          setActiveSceneId(nextRoom);
          const targetPiece =
            nextRoom === "upstairs12k"
              ? pieces[1]
              : nextRoom === "rotunda"
                ? pieces[2]
                : nextRoom === "gallery"
                  ? pieces[3]
                  : pieces[0];
          if (targetPiece) {
            setSelectedId(targetPiece.id);
            setExpanded(false);
          }
        }}
        selectedHotspotId={selectedPiece.id}
        onSelectHotspot={(hs) => {
          const idx = pieces.findIndex((p) => p.id === hs.id);
          const found = pieces[idx];
          if (found) {
            setSelectedId(found.id);
            setExpanded(false);
          }
        }}
        targetView={targetView}
        heightClass={compact ? "h-[340px] sm:h-[400px]" : "h-[400px] sm:h-[510px]"}
      />

      {/* 4 Quick Numbered Artwork Selector Buttons (Spanning 1F Atrium, 2F Upstairs, Rotunda & Fine Arts) */}
      <div className="mt-2.5 grid grid-cols-2 gap-2 sm:grid-cols-4">
        {pieces.map((p, idx) => {
          const active = p.id === selectedPiece.id;
          const roomBadge = MUSEUM_WING_COORDS[idx % MUSEUM_WING_COORDS.length]!.roomBadge;
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => focusPiece(p, idx)}
              className="flex cursor-pointer items-center gap-2 rounded-xl border px-3 py-2.5 text-left transition-all"
              style={{
                backgroundColor: active ? C.cover : "#FFFFFF",
                borderColor: active ? C.cover : "#CBD5E1",
                color: active ? "#FFFFFF" : C.ink,
                boxShadow: active ? "0 4px 12px rgba(0, 56, 168, 0.2)" : "none",
              }}
            >
              <span
                className="flex size-5 shrink-0 items-center justify-center rounded-full text-[11px] font-extrabold"
                style={{
                  backgroundColor: active ? C.foil : "#EFF6FF",
                  color: active ? C.ink : C.cover,
                }}
              >
                {idx + 1}
              </span>
              <div className="min-w-0">
                <div className="truncate text-[12px] font-bold" style={{ fontFamily: F.body }}>
                  {p.title}
                </div>
                <div
                  className="text-[10px] font-semibold"
                  style={{ color: active ? "rgba(255,255,255,0.8)" : C.mute }}
                >
                  {roomBadge}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Bite-Sized Art Piece Detail Card */}
      <Pop className="mt-3 p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span
            className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold"
            style={{ backgroundColor: `${cat.color}14`, color: cat.deep }}
          >
            <Sparkles className="size-3" /> 360° Hotspot {selectedIndex + 1} of {pieces.length} ·{" "}
            {selectedWing.roomTitle}
          </span>
          <span className="text-[12px] font-semibold" style={{ color: C.mute }}>
            {selectedPiece.period}
          </span>
        </div>

        <h4
          className="mt-2 text-[20px] leading-snug font-extrabold"
          style={{ fontFamily: F.display, color: C.ink }}
        >
          {selectedPiece.title}
        </h4>

        <p className="mt-0.5 text-[13px] font-medium" style={{ color: C.mute }}>
          {selectedPiece.medium} · {selectedPiece.zone}
        </p>

        <p
          className="mt-3 text-[15px] leading-relaxed"
          style={{ fontFamily: F.body, color: C.ink }}
        >
          {expanded ? selectedPiece.details : short}
        </p>

        {hasMore ? (
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="mt-1.5 cursor-pointer text-[13px] font-bold underline"
            style={{ color: C.cover }}
          >
            {expanded ? "Show less" : "Read more"}
          </button>
        ) : null}

        <div className="mt-4 flex items-center justify-between border-t border-[#E2E8F0] pt-3">
          <button
            type="button"
            onClick={() => stepPiece(-1)}
            className="inline-flex cursor-pointer items-center gap-1 text-[13px] font-bold hover:underline"
            style={{ color: C.cover }}
          >
            <ChevronLeft className="size-4" /> Previous Artwork / Room
          </button>
          <button
            type="button"
            onClick={() => stepPiece(1)}
            className="inline-flex cursor-pointer items-center gap-1 text-[13px] font-bold hover:underline"
            style={{ color: C.cover }}
          >
            Next Artwork / Room <ChevronRight className="size-4" />
          </button>
        </div>
      </Pop>
    </section>
  );
}
