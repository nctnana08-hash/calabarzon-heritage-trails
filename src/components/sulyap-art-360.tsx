import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, ExternalLink, Eye, RotateCw, Sparkles } from "lucide-react";
import type { Destination } from "@/lib/destinations";
import {
  CALABARZON_12K_PANO_URL,
  DEFAULT_MUSEUM_PANO_URL,
  GALLERY_HALL_PANO_URL,
  GALLERY_TILES,
  GRAND_16K_PANO_URL,
  GRAND_16K_TILES,
  ROTUNDA_TILES,
  SALON_12K_TILES,
  UPSTAIRS_12K_PANO_URL,
  UPSTAIRS_12K_TILES,
  type KrpanoSceneConfig,
} from "@/lib/krpano-scenes";
import { getArtPieceHdImage, getArtPieces360, type ArtPiece360 } from "@/lib/sulyap-art-360";
import { C, F, conciseText, getCategoryMeta } from "@/lib/sulyap-theme";
import { KrpanoViewer } from "./krpano-viewer";
import { Pop } from "./sulyap-ui";

type SceneRoomId = "grand16k" | "salon12k" | "upstairs12k" | "rotunda" | "gallery";

// Calibrated 3D spherical vantage points across 5 Living Rooms (16K Grand Pavilion, Restored 12K Bahay Salon, 2F Upstairs, Rotunda, Fine Arts)
const MUSEUM_WING_COORDS: {
  sceneId: SceneRoomId;
  roomBadge: string;
  roomTitle: string;
  pinAth: number;
  pinAtv: number;
  lookAtAth: number;
  lookAtAtv: number;
  fov: number;
}[] = [
  {
    sceneId: "grand16k",
    roomBadge: "1F · 16K Grand Hall",
    roomTitle: "1F Living Grand Pavilion (16K Smooth UHD)",
    pinAth: -91,
    pinAtv: 1,
    lookAtAth: -91,
    lookAtAtv: 9,
    fov: 38,
  },
  {
    sceneId: "salon12k",
    roomBadge: "12K Heritage Salon",
    roomTitle: "Bahay na Bato 12K Heritage Salon",
    pinAth: 43,
    pinAtv: -18,
    lookAtAth: 43,
    lookAtAtv: -4,
    fov: 42,
  },
  {
    sceneId: "upstairs12k",
    roomBadge: "2F · Upstairs 12K",
    roomTitle: "2F Upstairs Mezzanine Sky Gallery (12K)",
    pinAth: -120,
    pinAtv: -6,
    lookAtAth: -120,
    lookAtAtv: 5,
    fov: 38,
  },
  {
    sceneId: "rotunda",
    roomBadge: "1F · Rotunda Wing",
    roomTitle: "1F East Wing (Grand Rotunda)",
    pinAth: -2,
    pinAtv: -10,
    lookAtAth: -2,
    lookAtAtv: 6,
    fov: 52,
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
  const [activeSceneId, setActiveSceneId] = useState<SceneRoomId>("grand16k");
  const [expanded, setExpanded] = useState<boolean>(false);
  const [targetView, setTargetView] = useState<{
    ath: number;
    atv: number;
    fov: number;
    sceneId: string;
    openHotspotId?: string;
    key: string;
  } | null>(null);

  const cat = getCategoryMeta(destination.category);

  useEffect(() => {
    if (pieces[0]) {
      setSelectedId(pieces[0].id);
      setActiveSceneId("grand16k");
      setExpanded(false);
      setTargetView({
        ath: 0,
        atv: 1,
        fov: 78,
        sceneId: "grand16k",
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

  // 5 Connected Photorealistic Living Museum Rooms (16K Grand Pavilion + Restored 12K Bahay Salon + 2F Upstairs + Rotunda + Fine Arts)
  const destinationScenes: KrpanoSceneConfig[] = useMemo(() => {
    const p0 = pieces[0];
    const p1 = pieces[1];
    const p2 = pieces[2];
    const p3 = pieces[3];
    const safeSlug = destination.slug.replace(/[^a-zA-Z0-9_]/g, "_");

    return [
      {
        id: "grand16k",
        name: `scene_${safeSlug}_grand16k`,
        shortLabel: "16K Grand Tour",
        floorLabel: "1F Pavilion (16K)",
        title: `${destination.name} — 1F Living Grand Pavilion (16,000 × 8,000)`,
        panoramaUrl: GRAND_16K_PANO_URL,
        ...GRAND_16K_TILES,
        initialHlookat: 0,
        initialVlookat: 1,
        initialFov: 78,
        floorPath: [
          {
            ath: -61,
            atv: -28,
            label: `Step 1 · ${p0?.title ?? "Exhibit 1"}`,
            lookAtAth: -91,
            lookAtAtv: 9,
          },
          {
            ath: -26,
            atv: -29,
            label: "Step 2 · Enter 12K Heritage Salon →",
            lookAtAth: -61,
            lookAtAtv: -15,
            targetSceneId: "salon12k",
          },
          {
            ath: 0,
            atv: -31,
            label: "Step 3 · Climb Grand Staircase (2F Upstairs) ↑",
            lookAtAth: 0,
            lookAtAtv: -6,
            targetSceneId: "upstairs12k",
          },
          {
            ath: 61,
            atv: -26,
            label: "Step 4 · East Archway to Rotunda →",
            lookAtAth: 61,
            lookAtAtv: -15,
            targetSceneId: "rotunda",
          },
        ],
        hotspots: [
          {
            id: "stairs-up-mezzanine",
            kind: "stairs-up",
            badge: "🪜",
            title: "Grand Staircase → 2F Upstairs ↑",
            subtitle: "Climb to Exhibit 3",
            ath: 0,
            atv: -6,
            fov: 52,
            targetSceneId: "upstairs12k",
            arrivalView: { ath: 0, atv: 0, fov: 78 },
            pathOrder: 3,
          },
          {
            id: "door-16k-to-salon12k",
            kind: "door",
            badge: "🚪",
            title: "← 12K Heritage Salon",
            subtitle: "Walk to Exhibit 2",
            ath: -61,
            atv: -15,
            fov: 52,
            targetSceneId: "salon12k",
            arrivalView: { ath: 43, atv: -2, fov: 78 },
            pathOrder: 2,
          },
          {
            id: "door-16k-to-rotunda",
            kind: "door",
            badge: "🚪",
            title: "Rotunda Wing →",
            subtitle: "Walk to Exhibit 4",
            ath: 61,
            atv: -15,
            fov: 52,
            targetSceneId: "rotunda",
            arrivalView: { ath: -2, atv: 5, fov: 78 },
            pathOrder: 4,
          },
          ...(p0
            ? [
                {
                  id: p0.id,
                  kind: "art" as const,
                  badge: "1",
                  title: p0.title,
                  subtitle: p0.zone,
                  ath: MUSEUM_WING_COORDS[0]!.pinAth,
                  atv: MUSEUM_WING_COORDS[0]!.pinAtv,
                  lookAtAth: MUSEUM_WING_COORDS[0]!.lookAtAth,
                  lookAtAtv: MUSEUM_WING_COORDS[0]!.lookAtAtv,
                  fov: MUSEUM_WING_COORDS[0]!.fov,
                  pathOrder: 1,
                  artDetails: {
                    imageUrl: getArtPieceHdImage(p0, destination.province, destination.slug),
                    filTitle: p0.filTitle,
                    artist: p0.artistOrMaker,
                    period: p0.period,
                    medium: p0.medium,
                    dimensions: p0.dimensions,
                    zone: `16K Grand Pavilion · ${p0.zone}`,
                    province: destination.province,
                    description: p0.details,
                    conservationNote: p0.conservationNote,
                  },
                },
              ]
            : []),
        ],
      },
      {
        id: "salon12k",
        name: `scene_${safeSlug}_salon12k`,
        shortLabel: "12K Heritage Salon",
        floorLabel: "Bahay Salon (12K)",
        title: `${destination.name} — Bahay na Bato 12K Heritage Salon`,
        panoramaUrl: CALABARZON_12K_PANO_URL,
        ...SALON_12K_TILES,
        initialHlookat: 43,
        initialVlookat: -2,
        initialFov: 78,
        floorPath: [
          {
            ath: 43,
            atv: -24,
            label: `Step 1 · ${p1?.title ?? "Exhibit 2"}`,
            lookAtAth: 43,
            lookAtAtv: -4,
          },
          {
            ath: -59,
            atv: -22,
            label: "Step 2 · Return to 16K Grand Pavilion →",
            lookAtAth: -59,
            lookAtAtv: -4,
            targetSceneId: "grand16k",
          },
        ],
        hotspots: [
          {
            id: "door-salon-to-16k",
            kind: "door",
            badge: "🚪",
            title: "16K Grand Pavilion →",
            subtitle: "North Gallery Corridor",
            ath: -59,
            atv: -4,
            fov: 52,
            targetSceneId: "grand16k",
            arrivalView: { ath: 0, atv: 1, fov: 78 },
            pathOrder: 2,
          },
          {
            id: "stairs-salon-to-upstairs",
            kind: "stairs-up",
            badge: "🪜",
            title: "Stairs → 2F Upstairs ↑",
            subtitle: "Ascend to Exhibit 3",
            ath: -6,
            atv: -8,
            fov: 52,
            targetSceneId: "upstairs12k",
            arrivalView: { ath: 0, atv: 0, fov: 78 },
          },
          ...(p1
            ? [
                {
                  id: p1.id,
                  kind: "art" as const,
                  badge: "2",
                  title: p1.title,
                  subtitle: p1.zone,
                  ath: MUSEUM_WING_COORDS[1]!.pinAth,
                  atv: MUSEUM_WING_COORDS[1]!.pinAtv,
                  lookAtAth: MUSEUM_WING_COORDS[1]!.lookAtAth,
                  lookAtAtv: MUSEUM_WING_COORDS[1]!.lookAtAtv,
                  fov: MUSEUM_WING_COORDS[1]!.fov,
                  pathOrder: 1,
                  artDetails: {
                    imageUrl: getArtPieceHdImage(p1, destination.province, destination.slug),
                    filTitle: p1.filTitle,
                    artist: p1.artistOrMaker,
                    period: p1.period,
                    medium: p1.medium,
                    dimensions: p1.dimensions,
                    zone: `12K Heritage Salon · ${p1.zone}`,
                    province: destination.province,
                    description: p1.details,
                    conservationNote: p1.conservationNote,
                  },
                },
              ]
            : []),
        ],
      },
      {
        id: "upstairs12k",
        name: `scene_${safeSlug}_upstairs12k`,
        shortLabel: "2F Upstairs",
        floorLabel: "2F Mezzanine (12K)",
        title: `${destination.name} — 2F Upstairs Mezzanine Sky Gallery`,
        panoramaUrl: UPSTAIRS_12K_PANO_URL,
        ...UPSTAIRS_12K_TILES,
        initialHlookat: 0,
        initialVlookat: 0,
        initialFov: 78,
        floorPath: [
          {
            ath: -120,
            atv: -24,
            label: `Step 1 · ${p2?.title ?? "Exhibit 3"}`,
            lookAtAth: -120,
            lookAtAtv: 5,
          },
          {
            ath: 0,
            atv: -28,
            label: "Step 2 · Descend Stairs to 16K Pavilion ↓",
            lookAtAth: 0,
            lookAtAtv: -18,
            targetSceneId: "grand16k",
          },
        ],
        hotspots: [
          {
            id: "stairs-down-16k",
            kind: "stairs-down",
            badge: "🪜",
            title: "Descend Stairs → 16K Pavilion ↓",
            subtitle: "Go Downstairs",
            ath: 0,
            atv: -18,
            fov: 54,
            targetSceneId: "grand16k",
            arrivalView: { ath: 0, atv: 1, fov: 78 },
            pathOrder: 2,
          },
          {
            id: "upstairs-door-rotunda",
            kind: "door",
            badge: "🚪",
            title: "Skybridge → Rotunda Wing →",
            subtitle: "Walk to Exhibit 4",
            ath: 0,
            atv: 2,
            fov: 50,
            targetSceneId: "rotunda",
            arrivalView: { ath: -2, atv: 6, fov: 78 },
          },
          ...(p2
            ? [
                {
                  id: p2.id,
                  kind: "art" as const,
                  badge: "3",
                  title: p2.title,
                  subtitle: p2.zone,
                  ath: MUSEUM_WING_COORDS[2]!.pinAth,
                  atv: MUSEUM_WING_COORDS[2]!.pinAtv,
                  lookAtAth: MUSEUM_WING_COORDS[2]!.lookAtAth,
                  lookAtAtv: MUSEUM_WING_COORDS[2]!.lookAtAtv,
                  fov: MUSEUM_WING_COORDS[2]!.fov,
                  pathOrder: 1,
                  artDetails: {
                    imageUrl: getArtPieceHdImage(p2, destination.province, destination.slug),
                    filTitle: p2.filTitle,
                    artist: p2.artistOrMaker,
                    period: p2.period,
                    medium: p2.medium,
                    dimensions: p2.dimensions,
                    zone: `2F Upstairs 12K · ${p2.zone}`,
                    province: destination.province,
                    description: p2.details,
                    conservationNote: p2.conservationNote,
                  },
                },
              ]
            : []),
        ],
      },
      {
        id: "rotunda",
        name: `scene_${safeSlug}_rotunda`,
        shortLabel: "Rotunda Wing",
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
            label: `Step 1 · ${p3?.title ?? "Exhibit 4"}`,
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
            title: "Fine Arts Hall →",
            subtitle: "East Archway Door",
            ath: 58,
            atv: -2,
            fov: 54,
            targetSceneId: "gallery",
            arrivalView: { ath: -48, atv: 4, fov: 78 },
            pathOrder: 2,
          },
          {
            id: "rotunda-back-16k",
            kind: "door",
            badge: "🚪",
            title: "← 16K Grand Pavilion",
            subtitle: "West Archway Door",
            ath: -62,
            atv: -2,
            fov: 54,
            targetSceneId: "grand16k",
            arrivalView: { ath: 0, atv: 1, fov: 78 },
          },
          ...(p3
            ? [
                {
                  id: p3.id,
                  kind: "art" as const,
                  badge: "4",
                  title: p3.title,
                  subtitle: p3.zone,
                  ath: MUSEUM_WING_COORDS[3]!.pinAth,
                  atv: MUSEUM_WING_COORDS[3]!.pinAtv,
                  lookAtAth: MUSEUM_WING_COORDS[3]!.lookAtAth,
                  lookAtAtv: MUSEUM_WING_COORDS[3]!.lookAtAtv,
                  fov: MUSEUM_WING_COORDS[3]!.fov,
                  pathOrder: 1,
                  artDetails: {
                    imageUrl: getArtPieceHdImage(p3, destination.province, destination.slug),
                    filTitle: p3.filTitle,
                    artist: p3.artistOrMaker,
                    period: p3.period,
                    medium: p3.medium,
                    dimensions: p3.dimensions,
                    zone: `1F Rotunda Wing · ${p3.zone}`,
                    province: destination.province,
                    description: p3.details,
                    conservationNote: p3.conservationNote,
                  },
                },
              ]
            : []),
        ],
      },
      {
        id: "gallery",
        name: `scene_${safeSlug}_gallery`,
        shortLabel: "Fine Arts Hall",
        floorLabel: "1F West Wing",
        title: `${destination.name} — 1F West Wing: Fine Arts Hall 360°`,
        panoramaUrl: GALLERY_HALL_PANO_URL,
        ...GALLERY_TILES,
        initialHlookat: -35,
        initialVlookat: 2,
        initialFov: 82,
        hotspots: [
          {
            id: "portal-to-16k",
            kind: "door",
            badge: "🚪",
            title: "16K Grand Pavilion →",
            subtitle: "Iron Gate Doorway",
            ath: 90,
            atv: -2,
            fov: 54,
            targetSceneId: "grand16k",
            arrivalView: { ath: 0, atv: 1, fov: 78 },
          },
          {
            id: "gallery-to-salon12k",
            kind: "door",
            badge: "🚪",
            title: "← 12K Heritage Salon",
            subtitle: "South Passage",
            ath: -145,
            atv: -2,
            fov: 54,
            targetSceneId: "salon12k",
            arrivalView: { ath: 43, atv: -2, fov: 78 },
          },
        ],
      },
    ];
  }, [destination.slug, destination.name, destination.province, pieces]);

  const focusPiece = (piece: ArtPiece360, idx: number, bringToFront = true) => {
    const coords = MUSEUM_WING_COORDS[idx % MUSEUM_WING_COORDS.length]!;
    setSelectedId(piece.id);
    setActiveSceneId(coords.sceneId);
    setExpanded(false);
    setTargetView({
      sceneId: coords.sceneId,
      ath: coords.lookAtAth,
      atv: coords.lookAtAtv,
      fov: coords.fov,
      openHotspotId: bringToFront ? piece.id : undefined,
      key: `${piece.id}-${Date.now()}`,
    });
  };

  const stepPiece = (dir: -1 | 1) => {
    const nextIdx = (selectedIndex + dir + pieces.length) % pieces.length;
    const next = pieces[nextIdx];
    if (next) focusPiece(next, nextIdx, true);
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
            <RotateCw className="size-3.5" /> krpano 360° · Smooth 16K + 12K Living Galleries
          </span>
          <span className="text-[13px] font-medium" style={{ color: C.mute }}>
            Click pins 1–4 for unboxed HD art &amp; details, or use 🪜 stairs &amp; 🚪 doors
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

      {/* Real Full 360°×180° Smooth 16K & 12K WebGL Spherical Panorama Stage */}
      <KrpanoViewer
        scenes={destinationScenes}
        activeSceneId={activeSceneId}
        onSceneChange={(id) => {
          const nextRoom: SceneRoomId =
            id === "salon12k"
              ? "salon12k"
              : id === "upstairs12k"
                ? "upstairs12k"
                : id === "rotunda"
                  ? "rotunda"
                  : id === "gallery"
                    ? "gallery"
                    : "grand16k";
          setActiveSceneId(nextRoom);
          const targetPiece =
            nextRoom === "salon12k"
              ? pieces[1]
              : nextRoom === "upstairs12k"
                ? pieces[2]
                : nextRoom === "rotunda"
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
        heightClass={compact ? "h-[350px] sm:h-[420px]" : "h-[410px] sm:h-[520px]"}
      />

      {/* 4 Quick Numbered Artwork Selector Buttons (Spanning 16K Grand Hall, 12K Salon, 2F Upstairs & Rotunda) */}
      <div className="mt-2.5 grid grid-cols-2 gap-2 sm:grid-cols-4">
        {pieces.map((p, idx) => {
          const active = p.id === selectedPiece.id;
          const roomBadge = MUSEUM_WING_COORDS[idx % MUSEUM_WING_COORDS.length]!.roomBadge;
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => focusPiece(p, idx, true)}
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
            <Sparkles className="size-3" /> 360° Exhibit {selectedIndex + 1} of {pieces.length} ·{" "}
            {selectedWing.roomTitle}
          </span>
          <div className="flex items-center gap-2">
            <span className="text-[12px] font-semibold" style={{ color: C.mute }}>
              {selectedPiece.period}
            </span>
            <button
              type="button"
              onClick={() => focusPiece(selectedPiece, selectedIndex, true)}
              className="inline-flex cursor-pointer items-center gap-1 rounded-full px-3 py-1 text-[11.5px] font-extrabold text-white shadow-xs hover:opacity-95"
              style={{ backgroundColor: C.cover }}
            >
              <Eye className="size-3.5" /> View Whole Art (HD)
            </button>
          </div>
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
