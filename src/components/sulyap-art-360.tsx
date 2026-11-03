import React, { useEffect, useMemo, useRef, useState } from "react";
import { imageUrl, type Destination } from "@/lib/destinations";
import { getArtPieces360, type ArtPiece360 } from "@/lib/sulyap-art-360";
import { getEnrichment } from "@/lib/sulyap-data";
import { C, F, getCategoryMeta } from "@/lib/sulyap-theme";
import { Btn, Label, Pop } from "./sulyap-ui";

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
  const dragStartRef = useRef<{ x: number; startYaw: number } | null>(null);

  const cat = getCategoryMeta(destination.category);
  const enrichment = getEnrichment(destination);
  const backdropUrl = imageUrl(destination) || enrichment.images[0] || null;

  useEffect(() => {
    if (pieces[0]) {
      setSelectedId(pieces[0].id);
      setYaw(pieces[0].bearing);
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

  return (
    <section aria-label={`360-degree Art Map for ${destination.name}`} className="w-full">
      {/* Minimal Header */}
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div>
          <h3
            className="text-[20px] font-bold leading-tight"
            style={{ fontFamily: F.display, color: C.ink }}
          >
            360° Art &amp; Highlights
          </h3>
          <Label>Drag to look around or tap a numbered pin</Label>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setAutoRotate((v) => !v)}
            className="cursor-pointer rounded-full border px-3 py-1 text-[12px] font-medium transition-colors"
            style={{
              fontFamily: F.body,
              backgroundColor: autoRotate ? C.cover : C.card,
              borderColor: autoRotate ? C.cover : "#D5CBB4",
              color: autoRotate ? "#FFFFFF" : C.ink,
            }}
          >
            {autoRotate ? "Pause 360°" : "Auto-Rotate"}
          </button>

          {streetViewUrl ? (
            <button
              type="button"
              onClick={() => window.open(streetViewUrl, "_blank", "noopener,noreferrer")}
              className="cursor-pointer rounded-full border border-[#D5CBB4] bg-[#FCF9F0] px-3 py-1 text-[12px] font-medium hover:bg-[#EAE2CE]"
              style={{ fontFamily: F.body, color: C.ink }}
            >
              Street View ↗
            </button>
          ) : null}

          {onBack ? (
            <button
              type="button"
              onClick={onBack}
              className="cursor-pointer rounded-full border border-[#D5CBB4] bg-[#FCF9F0] px-3 py-1 text-[12px] font-medium hover:bg-[#EAE2CE]"
              style={{ fontFamily: F.body, color: C.ink }}
            >
              Close
            </button>
          ) : null}
        </div>
      </div>

      {/* Clean 360° Stage */}
      <div
        className="overflow-hidden rounded-xl border shadow-sm"
        style={{
          borderColor: "#D5CBB4",
          backgroundColor: "#1B1614",
        }}
      >
        <div
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          className={`relative w-full overflow-hidden select-none ${
            compact ? "h-[240px] sm:h-[280px]" : "h-[280px] sm:h-[340px]"
          } ${isDragging ? "cursor-grabbing" : "cursor-grab"}`}
          style={{
            touchAction: "pan-y",
            background: "radial-gradient(circle at 50% 50%, #382521 0%, #171210 100%)",
          }}
        >
          {/* Seamless Backdrop */}
          {backdropUrl ? (
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 opacity-40"
              style={{
                backgroundImage: `url(${backdropUrl})`,
                backgroundRepeat: "repeat-x",
                backgroundSize: "880px 100%",
                backgroundPosition: `${-yaw * 4}px center`,
              }}
            />
          ) : null}

          {/* Subtle Horizon Line */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 top-1/2 h-px opacity-25"
            style={{ backgroundColor: C.foil }}
          />

          {/* Compass Pill at Top Center */}
          <div className="pointer-events-none absolute top-3 left-1/2 z-20 -translate-x-1/2">
            <span
              className="rounded-full px-3 py-1 text-[11px] font-semibold"
              style={{
                fontFamily: F.mono,
                backgroundColor: "rgba(23, 18, 16, 0.8)",
                color: C.foil,
                border: "1px solid rgba(212, 175, 55, 0.4)",
              }}
            >
              {Math.round(normalizeAngle(yaw))}° {cardinalLabel(yaw)}
            </span>
          </div>

          {/* Compact Art Piece Pins */}
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
                  top: `${Math.max(20, Math.min(80, topPct))}%`,
                  zIndex: isSelected ? 30 : 20,
                }}
              >
                <div
                  className="flex items-center gap-2 rounded-full border px-3 py-1.5 shadow-md"
                  style={{
                    backgroundColor: isSelected ? C.foil : "rgba(252, 249, 240, 0.92)",
                    borderColor: isSelected ? "#FFFFFF" : C.foil,
                    color: C.ink,
                  }}
                >
                  <span
                    className="flex size-5 items-center justify-center rounded-full text-[11px] font-bold"
                    style={{
                      fontFamily: F.mono,
                      backgroundColor: C.cover,
                      color: "#FFFFFF",
                    }}
                  >
                    {idx + 1}
                  </span>
                  <span
                    className="max-w-[140px] truncate text-[12px] font-semibold sm:max-w-[180px]"
                    style={{ fontFamily: F.body }}
                  >
                    {piece.title}
                  </span>
                </div>
              </button>
            );
          })}

          {/* Left / Right Pan Controls */}
          <button
            type="button"
            onClick={() => {
              setAutoRotate(false);
              setYaw((y) => normalizeAngle(y - 35));
            }}
            aria-label="Pan left"
            className="absolute top-1/2 left-2.5 z-20 flex size-8 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border border-white/25 bg-black/50 text-white hover:bg-black/70"
          >
            ‹
          </button>
          <button
            type="button"
            onClick={() => {
              setAutoRotate(false);
              setYaw((y) => normalizeAngle(y + 35));
            }}
            aria-label="Pan right"
            className="absolute top-1/2 right-2.5 z-20 flex size-8 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border border-white/25 bg-black/50 text-white hover:bg-black/70"
          >
            ›
          </button>
        </div>

        {/* 4 Numbered Tabs Below Stage */}
        <div
          className="grid grid-cols-2 gap-1 border-t p-1.5 sm:grid-cols-4"
          style={{
            backgroundColor: "#241C19",
            borderColor: "rgba(255,255,255,0.1)",
          }}
        >
          {pieces.map((p, idx) => {
            const active = p.id === selectedPiece.id;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => focusPiece(p)}
                className="flex cursor-pointer items-center gap-2 rounded-lg px-2.5 py-2 text-left transition-colors"
                style={{
                  backgroundColor: active ? C.cover : "transparent",
                  color: active ? "#FFFFFF" : "rgba(252, 249, 240, 0.75)",
                }}
              >
                <span
                  className="flex size-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold"
                  style={{
                    fontFamily: F.mono,
                    backgroundColor: active ? C.foil : "rgba(255,255,255,0.15)",
                    color: active ? C.ink : "#FFFFFF",
                  }}
                >
                  {idx + 1}
                </span>
                <span className="truncate text-[12px] font-medium" style={{ fontFamily: F.body }}>
                  {p.title}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Concise Selected Art Piece Card */}
      <Pop className="mt-3 p-5">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <span
            className="text-[12px] font-semibold"
            style={{ fontFamily: F.body, color: cat.deep }}
          >
            Piece {selectedIndex + 1} of {pieces.length} · {selectedPiece.period}
          </span>
          <span className="text-[12px]" style={{ fontFamily: F.mono, color: C.mute }}>
            {selectedPiece.bearing}° {cardinalLabel(selectedPiece.bearing)} · {selectedPiece.zone}
          </span>
        </div>

        <h4
          className="mt-1 text-[22px] font-bold leading-snug"
          style={{ fontFamily: F.display, color: C.ink }}
        >
          {selectedPiece.title}
        </h4>

        <p className="mt-1 text-[13px] font-medium" style={{ fontFamily: F.body, color: C.mute }}>
          {selectedPiece.artistOrMaker} · {selectedPiece.medium}
        </p>

        <p
          className="mt-3 text-[14px] leading-relaxed sm:text-[15px]"
          style={{ fontFamily: F.body, color: C.ink }}
        >
          {selectedPiece.details}
        </p>

        <div className="mt-4 flex items-center justify-between border-t border-[#E5DEC9] pt-3">
          <button
            type="button"
            onClick={() => stepPiece(-1)}
            className="cursor-pointer text-[13px] font-semibold hover:underline"
            style={{ fontFamily: F.body, color: C.cover }}
          >
            ← Previous piece
          </button>
          <button
            type="button"
            onClick={() => stepPiece(1)}
            className="cursor-pointer text-[13px] font-semibold hover:underline"
            style={{ fontFamily: F.body, color: C.cover }}
          >
            Next piece →
          </button>
        </div>
      </Pop>
    </section>
  );
}
