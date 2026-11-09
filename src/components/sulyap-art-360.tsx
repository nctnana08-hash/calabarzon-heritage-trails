import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, ExternalLink, RotateCw, Sparkles } from "lucide-react";
import type { Destination } from "@/lib/destinations";
import {
  CALABARZON_12K_PANO_URL,
  DEFAULT_MUSEUM_PANO_URL,
  GALLERY_HALL_PANO_URL,
  type KrpanoSceneConfig,
} from "@/lib/krpano-scenes";
import { getArtPieces360, type ArtPiece360 } from "@/lib/sulyap-art-360";
import { C, F, conciseText, getCategoryMeta } from "@/lib/sulyap-theme";
import { KrpanoViewer } from "./krpano-viewer";
import { Pop } from "./sulyap-ui";

type SceneRoomId = "salon12k" | "rotunda" | "gallery";

// Calibrated 3D spherical vantage points across all 3 connected 360° Museum Rooms
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
    roomBadge: "Room 1 · 12K UHD",
    roomTitle: "Room 1 (12K Heritage Salon)",
    ath: 41,
    atv: -6,
    fov: 46,
  },
  {
    sceneId: "salon12k",
    roomBadge: "Room 1 · 12K UHD",
    roomTitle: "Room 1 (12K Heritage Salon)",
    ath: -153,
    atv: 12,
    fov: 48,
  },
  {
    sceneId: "rotunda",
    roomBadge: "Room 2 · Rotunda",
    roomTitle: "Room 2 (Grand Rotunda)",
    ath: -2,
    atv: 6,
    fov: 58,
  },
  {
    sceneId: "gallery",
    roomBadge: "Room 3 · Fine Arts",
    roomTitle: "Room 3 (Fine Arts Hall)",
    ath: -48,
    atv: 4,
    fov: 56,
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

  // Build the 3 connected 360° krpano rooms (12K Salon -> Rotunda -> Fine Arts Hall) for this destination
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
        shortLabel: "Room 1: 12K Salon (UHD)",
        title: `${destination.name} — Room 1: 12K Heritage Salon (12,000 × 6,000)`,
        panoramaUrl: CALABARZON_12K_PANO_URL,
        isUltraHd12k: true,
        initialHlookat: 34,
        initialVlookat: -3,
        initialFov: 78,
        hotspots: [
          {
            id: "portal-12k-to-rotunda",
            badge: "🚪",
            title: "Enter Grand Rotunda (Room 2) →",
            ath: -54,
            atv: -2,
            fov: 74,
            targetSceneId: "rotunda",
          },
          ...(p0
            ? [
                {
                  id: p0.id,
                  badge: "1",
                  title: p0.title,
                  subtitle: p0.zone,
                  ath: MUSEUM_WING_COORDS[0]!.ath,
                  atv: MUSEUM_WING_COORDS[0]!.atv,
                  fov: MUSEUM_WING_COORDS[0]!.fov,
                },
              ]
            : []),
          ...(p1
            ? [
                {
                  id: p1.id,
                  badge: "2",
                  title: p1.title,
                  subtitle: p1.zone,
                  ath: MUSEUM_WING_COORDS[1]!.ath,
                  atv: MUSEUM_WING_COORDS[1]!.atv,
                  fov: MUSEUM_WING_COORDS[1]!.fov,
                },
              ]
            : []),
        ],
      },
      {
        id: "rotunda",
        name: `scene_${safeSlug}_rotunda`,
        shortLabel: "Room 2: Grand Rotunda",
        title: `${destination.name} — Room 2: Grand Rotunda 360°`,
        panoramaUrl: DEFAULT_MUSEUM_PANO_URL,
        initialHlookat: -2,
        initialVlookat: 4,
        initialFov: 84,
        hotspots: [
          {
            id: "portal-to-gallery",
            badge: "🚪",
            title: "Enter Fine Arts Hall (Room 3) →",
            ath: 58,
            atv: -2,
            fov: 76,
            targetSceneId: "gallery",
          },
          ...(p2
            ? [
                {
                  id: p2.id,
                  badge: "3",
                  title: p2.title,
                  subtitle: p2.zone,
                  ath: MUSEUM_WING_COORDS[2]!.ath,
                  atv: MUSEUM_WING_COORDS[2]!.atv,
                  fov: MUSEUM_WING_COORDS[2]!.fov,
                },
              ]
            : []),
        ],
      },
      {
        id: "gallery",
        name: `scene_${safeSlug}_gallery`,
        shortLabel: "Room 3: Fine Arts Hall",
        title: `${destination.name} — Room 3: Fine Arts Hall 360°`,
        panoramaUrl: GALLERY_HALL_PANO_URL,
        initialHlookat: -35,
        initialVlookat: 2,
        initialFov: 84,
        hotspots: [
          {
            id: "portal-to-12k",
            badge: "🚪",
            title: "Return to 12K Salon (Room 1) →",
            ath: 90,
            atv: -2,
            fov: 76,
            targetSceneId: "salon12k",
          },
          ...(p3
            ? [
                {
                  id: p3.id,
                  badge: "4",
                  title: p3.title,
                  subtitle: p3.zone,
                  ath: MUSEUM_WING_COORDS[3]!.ath,
                  atv: MUSEUM_WING_COORDS[3]!.atv,
                  fov: MUSEUM_WING_COORDS[3]!.fov,
                },
              ]
            : []),
        ],
      },
    ];
  }, [destination.slug, destination.name, pieces]);

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
            <RotateCw className="size-3.5" /> krpano 360° · 12K UHD (3 Rooms)
          </span>
          <span className="text-[13px] font-medium" style={{ color: C.mute }}>
            Drag 360° in 12,000 × 6,000 Ultra-HD, walk across 3 Rooms, or tap hotspots 1–4
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

      {/* Real Full 360°×180° WebGL Spherical Panorama Stage with 3 Connected Rooms */}
      <KrpanoViewer
        scenes={destinationScenes}
        activeSceneId={activeSceneId}
        onSceneChange={(id) => {
          const nextRoom: SceneRoomId =
            id === "gallery" ? "gallery" : id === "rotunda" ? "rotunda" : "salon12k";
          setActiveSceneId(nextRoom);
          // Highlight the primary artwork in that room
          const targetPiece =
            nextRoom === "gallery" ? pieces[3] : nextRoom === "rotunda" ? pieces[2] : pieces[0];
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
        heightClass={compact ? "h-[320px] sm:h-[380px]" : "h-[380px] sm:h-[480px]"}
      />

      {/* 4 Quick Numbered Artwork Selector Buttons (Rooms 1–3) */}
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
          className="mt-2 text-[20px] font-extrabold leading-snug"
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
            <ChevronLeft className="size-4" /> Previous Hotspot
          </button>
          <button
            type="button"
            onClick={() => stepPiece(1)}
            className="inline-flex cursor-pointer items-center gap-1 text-[13px] font-bold hover:underline"
            style={{ color: C.cover }}
          >
            Next Hotspot <ChevronRight className="size-4" />
          </button>
        </div>
      </Pop>
    </section>
  );
}
