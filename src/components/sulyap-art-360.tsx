import React, { useEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, ExternalLink, RotateCw, Sparkles } from "lucide-react";
import { imageUrl, type Destination } from "@/lib/destinations";
import { getArtPieces360, type ArtPiece360 } from "@/lib/sulyap-art-360";
import { getEnrichment } from "@/lib/sulyap-data";
import { C, F, conciseText, getCategoryMeta } from "@/lib/sulyap-theme";
import { Banig, Pop } from "./sulyap-ui";

function normalizeAngle(deg: number): number {
  return ((deg % 360) + 360) % 360;
}

function shortestDelta(target: number, current: number): number {
  return ((target - current + 540) % 360) - 180;
}

function cardinalLabel(deg: number): string {
  const norm = normalizeAngle(deg);
  const dirs = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
  return dirs[Math.round(norm / 45) % 8] ?? "N";
}

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
  const [yaw, setYaw] = useState<number>(pieces[0]?.bearing ?? 20);
  const [autoRotate, setAutoRotate] = useState<boolean>(false);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [expanded, setExpanded] = useState<boolean>(false);
  const dragStartRef = useRef<{ x: number; startYaw: number } | null>(null);

  const cat = getCategoryMeta(destination.category);
  const enrichment = getEnrichment(destination);
  const backdropUrl = imageUrl(destination) || enrichment.images[0] || null;

  useEffect(() => {
    if (pieces[0]) {
      setSelectedId(pieces[0].id);
      setYaw(pieces[0].bearing);
      setExpanded(false);
    }
  }, [destination.id, pieces]);

  useEffect(() => {
    if (!autoRotate || isDragging) return;
    const id = window.setInterval(() => {
      setYaw((prev) => normalizeAngle(prev + 0.5));
    }, 40);
    return () => window.clearInterval(id);
  }, [autoRotate, isDragging]);

  const selectedPiece: ArtPiece360 = pieces.find((p) => p.id === selectedId) ?? pieces[0]!;
  const selectedIndex = Math.max(
    0,
    pieces.findIndex((p) => p.id === selectedPiece.id),
  );

  const focusPiece = (piece: ArtPiece360) => {
    setAutoRotate(false);
    setSelectedId(piece.id);
    setYaw(normalizeAngle(piece.bearing));
    setExpanded(false);
  };

  const stepPiece = (dir: -1 | 1) => {
    const nextIdx = (selectedIndex + dir + pieces.length) % pieces.length;
    const next = pieces[nextIdx];
    if (next) focusPiece(next);
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest("button")) return;
    setAutoRotate(false);
    setIsDragging(true);
    dragStartRef.current = { x: e.clientX, startYaw: yaw };
    e.currentTarget.setPointerCapture?.(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging || !dragStartRef.current) return;
    const dx = e.clientX - dragStartRef.current.x;
    setYaw(normalizeAngle(dragStartRef.current.startYaw - dx * 0.35));
  };

  const handlePointerUp = () => {
    setIsDragging(false);
    dragStartRef.current = null;
  };

  const streetViewUrl =
    destination.latitude != null && destination.longitude != null
      ? `https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=${destination.latitude},${destination.longitude}`
      : null;

  const FOV = 140;
  const { short, hasMore } = conciseText(selectedPiece.details, 1);

  return (
    <section aria-label={`360-degree Art Map for ${destination.name}`} className="w-full">
      {/* Clean Header */}
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span
            className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[12px] font-bold text-white"
            style={{ backgroundColor: C.cover }}
          >
            <RotateCw className="size-3.5" /> 360° Art &amp; Relics
          </span>
          <span className="text-[13px]" style={{ color: C.mute }}>
            Drag to look around or tap 1–4
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setAutoRotate((v) => !v)}
            className="cursor-pointer rounded-full border px-3 py-1 text-[12px] font-semibold transition-colors"
            style={{
              backgroundColor: autoRotate ? C.foil : "#FFFFFF",
              borderColor: autoRotate ? C.foil : "#DED5C0",
              color: C.ink,
            }}
          >
            {autoRotate ? "Pause 360°" : "Auto-Spin"}
          </button>

          {streetViewUrl ? (
            <button
              type="button"
              onClick={() => window.open(streetViewUrl, "_blank", "noopener,noreferrer")}
              className="inline-flex cursor-pointer items-center gap-1 rounded-full border border-[#DED5C0] bg-white px-3 py-1 text-[12px] font-semibold hover:bg-[#F6F1E3]"
              style={{ color: C.ink }}
            >
              Google 360° <ExternalLink className="size-3" />
            </button>
          ) : null}

          {onBack ? (
            <button
              type="button"
              onClick={onBack}
              className="cursor-pointer rounded-full border border-[#DED5C0] bg-white px-3 py-1 text-[12px] font-semibold hover:bg-[#F6F1E3]"
              style={{ color: C.ink }}
            >
              Done
            </button>
          ) : null}
        </div>
      </div>

      {/* 360° Stage */}
      <div
        className="overflow-hidden rounded-2xl border shadow-md"
        style={{
          borderColor: "#DED5C0",
          backgroundColor: "#1B1614",
        }}
      >
        <div
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          className={`relative w-full overflow-hidden select-none ${
            compact ? "h-[240px] sm:h-[270px]" : "h-[270px] sm:h-[330px]"
          } ${isDragging ? "cursor-grabbing" : "cursor-grab"}`}
          style={{
            touchAction: "pan-y",
          }}
        >
          {/* Illustrated / Photo Panoramic Backdrop */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 opacity-65"
            style={{
              transform: `translateX(${((yaw % 90) - 45) * -1.2}px) scale(1.15)`,
              transition: isDragging ? "none" : "transform 150ms ease-out",
            }}
          >
            {backdropUrl ? (
              <img src={backdropUrl} alt="" className="h-full w-full object-cover" />
            ) : (
              <Banig color={cat.deep} seed={selectedIndex + 2} />
            )}
          </div>

          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-black/25 to-black/50"
          />

          {/* Compass Pill at Top Center */}
          <div className="pointer-events-none absolute top-3 left-1/2 z-20 -translate-x-1/2">
            <span
              className="rounded-full px-3 py-1 text-[11px] font-bold"
              style={{
                fontFamily: F.mono,
                backgroundColor: "rgba(0, 0, 0, 0.65)",
                color: C.foil,
                border: "1px solid rgba(212, 175, 55, 0.45)",
              }}
            >
              {Math.round(normalizeAngle(yaw))}° {cardinalLabel(yaw)}
            </span>
          </div>

          {/* Floating Art Pins */}
          {pieces.map((piece, idx) => {
            const delta = shortestDelta(piece.bearing, yaw);
            if (Math.abs(delta) > FOV / 2) return null;

            const leftPct = 50 + (delta / (FOV / 2)) * 42;
            const topPct = 52 - piece.pitch * 1.1;
            const isSelected = piece.id === selectedPiece.id;

            return (
              <button
                key={piece.id}
                type="button"
                onClick={() => focusPiece(piece)}
                aria-label={`Art piece ${idx + 1}: ${piece.title}`}
                className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-transform hover:scale-105"
                style={{
                  left: `${leftPct}%`,
                  top: `${Math.max(22, Math.min(78, topPct))}%`,
                  zIndex: isSelected ? 30 : 20,
                }}
              >
                <div
                  className="flex items-center gap-2 rounded-full border-2 px-3 py-1.5 shadow-lg"
                  style={{
                    backgroundColor: isSelected ? C.foil : "rgba(255, 255, 255, 0.95)",
                    borderColor: isSelected ? "#FFFFFF" : C.foil,
                    color: C.ink,
                  }}
                >
                  <span
                    className="flex size-5 items-center justify-center rounded-full text-[11px] font-bold"
                    style={{
                      backgroundColor: C.cover,
                      color: "#FFFFFF",
                    }}
                  >
                    {idx + 1}
                  </span>
                  <span
                    className="max-w-[130px] truncate text-[12px] font-bold sm:max-w-[170px]"
                    style={{ fontFamily: F.body }}
                  >
                    {piece.title}
                  </span>
                </div>
              </button>
            );
          })}

          {/* Left / Right Pan Arrows */}
          <button
            type="button"
            onClick={() => {
              setAutoRotate(false);
              setYaw((y) => normalizeAngle(y - 45));
            }}
            aria-label="Rotate left"
            className="absolute top-1/2 left-3 z-20 flex size-9 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-black/55 text-white hover:bg-black/80"
          >
            <ChevronLeft className="size-5" />
          </button>
          <button
            type="button"
            onClick={() => {
              setAutoRotate(false);
              setYaw((y) => normalizeAngle(y + 45));
            }}
            aria-label="Rotate right"
            className="absolute top-1/2 right-3 z-20 flex size-9 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-black/55 text-white hover:bg-black/80"
          >
            <ChevronRight className="size-5" />
          </button>
        </div>

        {/* 4 Quick Numbered Buttons */}
        <div className="grid grid-cols-2 gap-1.5 bg-[#221B18] p-2 sm:grid-cols-4">
          {pieces.map((p, idx) => {
            const active = p.id === selectedPiece.id;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => focusPiece(p)}
                className="flex cursor-pointer items-center gap-2 rounded-xl px-3 py-2 text-left transition-all"
                style={{
                  backgroundColor: active ? C.foil : "rgba(255,255,255,0.06)",
                  color: active ? C.ink : "#FFFFFF",
                }}
              >
                <span
                  className="flex size-5 shrink-0 items-center justify-center rounded-full text-[11px] font-bold"
                  style={{
                    backgroundColor: active ? C.cover : "rgba(255,255,255,0.18)",
                    color: "#FFFFFF",
                  }}
                >
                  {idx + 1}
                </span>
                <span className="truncate text-[12px] font-semibold" style={{ fontFamily: F.body }}>
                  {p.title}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Bite-Sized Art Piece Detail Card */}
      <Pop className="mt-3 p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span
            className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold"
            style={{ backgroundColor: `${cat.color}18`, color: cat.deep }}
          >
            <Sparkles className="size-3" /> Highlight {selectedIndex + 1} of {pieces.length}
          </span>
          <span className="text-[12px] font-medium" style={{ color: C.mute }}>
            {selectedPiece.period}
          </span>
        </div>

        <h4
          className="mt-2 text-[22px] font-bold leading-snug"
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
            className="mt-1.5 cursor-pointer text-[13px] font-semibold underline"
            style={{ color: C.cover }}
          >
            {expanded ? "Show less" : "Read more"}
          </button>
        ) : null}

        <div className="mt-4 flex items-center justify-between border-t border-[#F0EAE0] pt-3">
          <button
            type="button"
            onClick={() => stepPiece(-1)}
            className="inline-flex cursor-pointer items-center gap-1 text-[13px] font-bold hover:underline"
            style={{ color: C.cover }}
          >
            <ChevronLeft className="size-4" /> Previous
          </button>
          <button
            type="button"
            onClick={() => stepPiece(1)}
            className="inline-flex cursor-pointer items-center gap-1 text-[13px] font-bold hover:underline"
            style={{ color: C.cover }}
          >
            Next <ChevronRight className="size-4" />
          </button>
        </div>
      </Pop>
    </section>
  );
}
