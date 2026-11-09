import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, ExternalLink, RotateCw, Sparkles } from "lucide-react";
import type { Destination } from "@/lib/destinations";
import { getArtPieces360, type ArtPiece360 } from "@/lib/sulyap-art-360";
import { C, F, conciseText, getCategoryMeta } from "@/lib/sulyap-theme";
import { DEFAULT_MUSEUM_PANO_URL, KrpanoViewer, type KrpanoHotspot } from "./krpano-viewer";
import { Pop } from "./sulyap-ui";

// Calibrated 3D spherical vantage points (ath, atv, fov) inside the 360° museum rotunda
const MUSEUM_WING_COORDS: { ath: number; atv: number; fov: number }[] = [
  { ath: -2, atv: 6, fov: 60 }, // Central Torch Monument & Rotunda Pedestal
  { ath: 92, atv: -2, fov: 58 }, // East Wing: Ancestral Bahay Kubo & Architecture
  { ath: -128, atv: 3, fov: 58 }, // West Wing: Historical Revolution Mural & Bust
  { ath: 134, atv: -4, fov: 56 }, // South-East Wing: Pre-Colonial Gold, Okir & Tapestry
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
  const [expanded, setExpanded] = useState<boolean>(false);
  const [targetView, setTargetView] = useState<{
    ath: number;
    atv: number;
    fov: number;
    key: string;
  } | null>(null);

  const cat = getCategoryMeta(destination.category);

  useEffect(() => {
    if (pieces[0]) {
      setSelectedId(pieces[0].id);
      setExpanded(false);
      setTargetView({
        ...MUSEUM_WING_COORDS[0]!,
        key: `${destination.id}-${pieces[0].id}-init`,
      });
    }
  }, [destination.id, pieces]);

  const selectedPiece: ArtPiece360 = pieces.find((p) => p.id === selectedId) ?? pieces[0]!;
  const selectedIndex = Math.max(
    0,
    pieces.findIndex((p) => p.id === selectedPiece.id),
  );

  const hotspots: KrpanoHotspot[] = useMemo(
    () =>
      pieces.map((p, idx) => {
        const coords = MUSEUM_WING_COORDS[idx % MUSEUM_WING_COORDS.length]!;
        return {
          id: p.id,
          title: p.title,
          subtitle: p.zone,
          badge: String(idx + 1),
          ath: coords.ath,
          atv: coords.atv,
          fov: coords.fov,
          accentColor: cat.color,
        };
      }),
    [pieces, cat.color],
  );

  const focusPiece = (piece: ArtPiece360, idx: number) => {
    const coords = MUSEUM_WING_COORDS[idx % MUSEUM_WING_COORDS.length]!;
    setSelectedId(piece.id);
    setExpanded(false);
    setTargetView({
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
            <RotateCw className="size-3.5" /> krpano 360° Museum View
          </span>
          <span className="text-[13px] font-medium" style={{ color: C.mute }}>
            Drag 360° in any direction, scroll to zoom, or tap hotspots 1–4
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

      {/* Real Full 360°×180° WebGL Spherical Panorama Stage */}
      <KrpanoViewer
        panoramaUrl={DEFAULT_MUSEUM_PANO_URL}
        sceneName={`scene_${destination.slug.replace(/[^a-zA-Z0-9_]/g, "_")}`}
        sceneTitle={`${destination.name} — 360° Art & Relics`}
        hotspots={hotspots}
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

      {/* 4 Quick Numbered Artwork Selector Buttons */}
      <div className="mt-2.5 grid grid-cols-2 gap-2 sm:grid-cols-4">
        {pieces.map((p, idx) => {
          const active = p.id === selectedPiece.id;
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
              <span className="truncate text-[12px] font-bold" style={{ fontFamily: F.body }}>
                {p.title}
              </span>
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
            <Sparkles className="size-3" /> 360° Hotspot {selectedIndex + 1} of {pieces.length}
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
