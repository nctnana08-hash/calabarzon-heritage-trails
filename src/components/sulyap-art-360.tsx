import React, { useEffect, useMemo, useRef, useState } from "react";
import { imageUrl, type Destination } from "@/lib/destinations";
import { getArtPieces360, type ArtMotif, type ArtPiece360 } from "@/lib/sulyap-art-360";
import { getEnrichment } from "@/lib/sulyap-data";
import { C, F, PROVINCE_CODES, getCategoryMeta } from "@/lib/sulyap-theme";
import { Btn, Label, Pop } from "./sulyap-ui";

function normalizeAngle(deg: number): number {
  return ((deg % 360) + 360) % 360;
}

/**
 * Signed shortest angular difference (-180..+180) between target bearing and current camera yaw.
 */
function shortestDelta(target: number, current: number): number {
  return ((target - current + 540) % 360) - 180;
}

function cardinalLabel(deg: number): string {
  const norm = normalizeAngle(deg);
  const dirs = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
  return dirs[Math.round(norm / 45) % 8] ?? "N";
}

/**
 * Engraved Curatorial Illustration Plate for each Art Piece motif.
 */
function ArtMotifPlate({ motif, color, code }: { motif: ArtMotif; color: string; code: string }) {
  return (
    <svg
      viewBox="0 0 220 160"
      className="h-full w-full select-none"
      role="img"
      aria-label={`Curatorial illustration plate for ${code}`}
    >
      <rect width="220" height="160" fill="#F6F1E3" />
      {/* Inner museum frame */}
      <rect x="8" y="8" width="204" height="144" fill="none" stroke={color} strokeWidth="1.5" />
      <rect
        x="12"
        y="12"
        width="196"
        height="136"
        fill="none"
        stroke={color}
        strokeWidth="0.7"
        strokeDasharray="3 2"
      />

      {/* Subtle radial guilloche */}
      <circle
        cx="110"
        cy="78"
        r="52"
        fill={color}
        fillOpacity="0.05"
        stroke={color}
        strokeWidth="0.7"
        strokeDasharray="2 2"
      />

      {motif === "retablo" && (
        <g stroke={color} fill="none" strokeWidth="1.6" transform="translate(110, 82)">
          <path d="M-42,46 L42,46 L38,-18 L22,-18 L22,-36 L0,-54 L-22,-36 L-22,-18 L-38,-18 Z" />
          <line x1="-22" y1="-18" x2="-22" y2="46" />
          <line x1="22" y1="-18" x2="22" y2="46" />
          <path d="M-12,46 L-12,8 A12,12 0 0,1 12,8 L12,46" fill={color} fillOpacity="0.12" />
          <circle cx="0" cy="-28" r="8" />
          <path d="M0,-62 L0,-48 M-5,-56 L5,-56" />
        </g>
      )}

      {motif === "fresco" && (
        <g stroke={color} fill="none" strokeWidth="1.5" transform="translate(110, 78)">
          <rect x="-54" y="-36" width="108" height="72" rx="6" fill={color} fillOpacity="0.08" />
          <circle cx="0" cy="0" r="24" />
          <polygon
            points="0,-22 5,-6 22,0 5,6 0,22 -5,6 -22,0 -5,-6"
            fill={color}
            fillOpacity="0.2"
          />
          <path d="M-46,-28 Q-25,-12 -46,8" />
          <path d="M46,-28 Q25,-12 46,8" />
          <path d="M-38,24 Q0,8 38,24" />
        </g>
      )}

      {motif === "sculpture" && (
        <g stroke={color} fill="none" strokeWidth="1.6" transform="translate(110, 82)">
          <rect x="-28" y="26" width="56" height="18" fill={color} fillOpacity="0.14" />
          <rect x="-20" y="18" width="40" height="8" />
          <circle cx="0" cy="-32" r="11" fill={color} fillOpacity="0.12" />
          <path d="M-18,18 C-18,-8 -12,-18 0,-18 C12,-18 18,-8 18,18 Z" />
          <circle cx="0" cy="-32" r="18" strokeDasharray="2 2" strokeWidth="1" />
        </g>
      )}

      {motif === "manuscript" && (
        <g stroke={color} fill="none" strokeWidth="1.5" transform="translate(110, 78)">
          <path
            d="M-46,-30 Q-23,-36 0,-26 Q23,-36 46,-30 L46,30 Q23,24 0,34 Q-23,24 -46,30 Z"
            fill={color}
            fillOpacity="0.08"
          />
          <line x1="0" y1="-26" x2="0" y2="34" />
          <line x1="-36" y1="-14" x2="-8" y2="-14" />
          <line x1="-36" y1="-2" x2="-8" y2="-2" />
          <line x1="-36" y1="10" x2="-14" y2="10" />
          <line x1="8" y1="-14" x2="36" y2="-14" />
          <line x1="8" y1="-2" x2="36" y2="-2" />
          <circle cx="22" cy="14" r="7" fill={color} fillOpacity="0.2" />
        </g>
      )}

      {motif === "vessel" && (
        <g stroke={color} fill="none" strokeWidth="1.6" transform="translate(110, 80)">
          <path
            d="M-16,-36 L16,-36 L12,-22 C32,-8 34,24 18,40 L-18,40 C-34,24 -32,-8 -12,-22 Z"
            fill={color}
            fillOpacity="0.1"
          />
          <path d="M-24,4 L24,4 M-26,14 L26,14" strokeDasharray="3 2" />
          <path d="M-12,-22 Q-28,-20 -24,-6" />
          <path d="M12,-22 Q28,-20 24,-6" />
        </g>
      )}

      {motif === "arch" && (
        <g stroke={color} fill="none" strokeWidth="1.6" transform="translate(110, 82)">
          <path d="M-48,44 L-48,-16 L0,-46 L48,-16 L48,44 Z" />
          <path d="M-22,44 L-22,8 A22,22 0 0,1 22,8 L22,44" fill={color} fillOpacity="0.15" />
          <circle cx="0" cy="-22" r="8" />
          <line x1="-36" y1="-10" x2="-36" y2="44" />
          <line x1="36" y1="-10" x2="36" y2="44" />
        </g>
      )}

      {motif === "petroglyph" && (
        <g stroke={color} fill="none" strokeWidth="1.8" transform="translate(110, 78)">
          <circle cx="0" cy="-24" r="9" />
          <line x1="0" y1="-15" x2="0" y2="18" />
          <path d="M-24,-18 L-14,-4 L14,-4 L24,-18" />
          <path d="M-22,34 L-12,18 L12,18 L22,34" />
          <circle cx="-36" cy="-6" r="5" strokeWidth="1.2" />
          <path d="M-36,-1 L-36,18 M-44,4 L-28,4" strokeWidth="1.2" />
          <circle cx="36" cy="-6" r="5" strokeWidth="1.2" />
          <path d="M36,-1 L36,18 M28,4 L44,4" strokeWidth="1.2" />
        </g>
      )}

      {motif === "natural" && (
        <g stroke={color} fill="none" strokeWidth="1.6" transform="translate(110, 82)">
          <path d="M-54,36 L-18,-26 L6,8 L24,-18 L54,36 Z" fill={color} fillOpacity="0.1" />
          <circle cx="34" cy="-32" r="9" />
          <path d="M-48,44 Q-20,38 0,44 T48,44" />
        </g>
      )}

      <text
        x="110"
        y="144"
        textAnchor="middle"
        fontSize="8.5"
        fontWeight="700"
        fill={color}
        style={{ fontFamily: F.mono, letterSpacing: "0.16em" }}
      >
        PLATE · {code}
      </text>
    </svg>
  );
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
  const provCode = PROVINCE_CODES[destination.province] ?? "IVA";
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
      setYaw((prev) => normalizeAngle(prev + 0.6));
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

  // Generate compass ticks visible within the 130° horizontal field of view
  const FOV = 130;
  const compassTicks: { deg: number; label: string; offsetPct: number }[] = [];
  for (let d = 0; d < 360; d += 15) {
    const delta = shortestDelta(d, yaw);
    if (Math.abs(delta) <= FOV / 2) {
      const label =
        d === 0
          ? "N 0°"
          : d === 45
            ? "NE 45°"
            : d === 90
              ? "E 90°"
              : d === 135
                ? "SE 135°"
                : d === 180
                  ? "S 180°"
                  : d === 225
                    ? "SW 225°"
                    : d === 270
                      ? "W 270°"
                      : d === 315
                        ? "NW 315°"
                        : `${d}°`;
      compassTicks.push({
        deg: d,
        label,
        offsetPct: 50 + (delta / (FOV / 2)) * 46,
      });
    }
  }

  return (
    <section aria-label={`360-degree Art and Relic Map for ${destination.name}`} className="w-full">
      {/* Header Bar */}
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <div>
          <Label>
            360° CURATED ART & RELIC PANORAMA · SECTOR {provCode} ({pieces.length} MASTERWORKS)
          </Label>
          <h2
            className="text-[24px] font-bold leading-tight sm:text-[28px]"
            style={{ fontFamily: F.display, color: C.ink }}
          >
            Mapa ng Sining at Relikya sa 360°
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setAutoRotate((v) => !v)}
            className="cursor-pointer rounded-xs border px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.12em] transition-colors"
            style={{
              fontFamily: F.mono,
              backgroundColor: autoRotate ? C.cover : C.card,
              borderColor: autoRotate ? C.foil : "#B8AC93",
              color: autoRotate ? C.foil : C.ink,
            }}
          >
            {autoRotate ? "⏸ Pause 360° Orbit" : "↻ Auto-Scan 360°"}
          </button>

          {streetViewUrl ? (
            <button
              type="button"
              onClick={() => window.open(streetViewUrl, "_blank", "noopener,noreferrer")}
              className="cursor-pointer rounded-xs border border-[#B8AC93] bg-[#FCF9F0] px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.12em] hover:bg-[#EAE2CE]"
              style={{ fontFamily: F.mono, color: C.ink }}
            >
              🌐 Live Street Pano ↗
            </button>
          ) : null}

          {onBack ? (
            <button
              type="button"
              onClick={onBack}
              className="cursor-pointer rounded-xs border border-[#B8AC93] bg-[#FCF9F0] px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.12em] hover:bg-[#EAE2CE]"
              style={{ fontFamily: F.mono, color: C.ink }}
            >
              ← Exit 360° View
            </button>
          ) : null}
        </div>
      </div>

      {/* Main 360° Interactive Panorama Stage */}
      <div
        className="overflow-hidden rounded-xl border-2 shadow-lg"
        style={{
          borderColor: C.foil,
          backgroundColor: "#171311",
        }}
      >
        {/* Top 360° Compass Degree Ribbon */}
        <div
          className="relative h-9 w-full overflow-hidden border-b select-none"
          style={{
            backgroundColor: "#221A17",
            borderColor: "rgba(212, 175, 55, 0.35)",
          }}
        >
          {compassTicks.map((tick) => {
            const isCardinal = tick.deg % 90 === 0;
            return (
              <div
                key={tick.deg}
                className=" absolute top-0 bottom-0 flex -translate-x-1/2 flex-col items-center justify-end pb-1"
                style={{ left: `${tick.offsetPct}%` }}
              >
                <span
                  className="text-[10px] font-bold"
                  style={{
                    fontFamily: F.mono,
                    color: isCardinal ? C.foil : "rgba(246, 241, 227, 0.6)",
                  }}
                >
                  {tick.label}
                </span>
                <span
                  className="mt-0.5 block w-[1.5px]"
                  style={{
                    height: isCardinal ? 6 : 3,
                    backgroundColor: isCardinal ? C.foil : "rgba(246, 241, 227, 0.4)",
                  }}
                />
              </div>
            );
          })}

          {/* Center Camera Heading Indicator */}
          <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2">
            <span
              className="inline-block rounded-b-xs px-2 py-0.5 text-[10px] font-bold"
              style={{
                fontFamily: F.mono,
                backgroundColor: C.foil,
                color: C.ink,
              }}
            >
              ▼ {Math.round(normalizeAngle(yaw))}° {cardinalLabel(yaw)}
            </span>
          </div>
        </div>

        {/* Draggable 360° Spatial Viewport */}
        <div
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          className={`relative w-full overflow-hidden select-none ${
            compact ? "h-[300px] sm:h-[340px]" : "h-[340px] sm:h-[420px]"
          } ${isDragging ? "cursor-grabbing" : "cursor-grab"}`}
          style={{
            touchAction: "pan-y",
            background: "radial-gradient(circle at 50% 50%, #3A2622 0%, #1E1614 68%, #120D0C 100%)",
          }}
        >
          {/* Seamless Panoramic Backdrop Layer */}
          {backdropUrl ? (
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 opacity-35 transition-transform duration-75"
              style={{
                backgroundImage: `url(${backdropUrl})`,
                backgroundRepeat: "repeat-x",
                backgroundSize: "900px 100%",
                backgroundPosition: `${-yaw * 4.5}px center`,
                filter: "sepia(0.25) contrast(1.08)",
              }}
            />
          ) : null}

          {/* 360° Cylindrical Perspective Grid & Gallery Arches SVG */}
          <svg
            viewBox="0 0 800 400"
            preserveAspectRatio="none"
            className="pointer-events-none absolute inset-0 h-full w-full opacity-35"
            aria-hidden="true"
          >
            {/* Upper & Lower Spherical Latitude Rings */}
            <path
              d="M 0,70 Q 400,115 800,70"
              fill="none"
              stroke={C.foil}
              strokeWidth="1"
              strokeDasharray="6 4"
            />
            <path d="M 0,135 Q 400,165 800,135" fill="none" stroke={C.foil} strokeWidth="0.75" />
            <line
              x1="0"
              y1="210"
              x2="800"
              y2="210"
              stroke={C.foil}
              strokeWidth="1.2"
              strokeOpacity="0.7"
            />
            <path d="M 0,285 Q 400,255 800,285" fill="none" stroke={C.foil} strokeWidth="0.75" />
            <path
              d="M 0,345 Q 400,300 800,345"
              fill="none"
              stroke={C.foil}
              strokeWidth="1"
              strokeDasharray="6 4"
            />

            {/* Scrolling Vertical Meridian Pillars based on yaw */}
            {Array.from({ length: 12 }).map((_, idx) => {
              const pillarDeg = idx * 30;
              const delta = shortestDelta(pillarDeg, yaw);
              if (Math.abs(delta) > 75) return null;
              const x = 400 + (delta / 65) * 380;
              return (
                <g key={pillarDeg}>
                  <line
                    x1={x}
                    y1="40"
                    x2={x}
                    y2="360"
                    stroke={C.foil}
                    strokeWidth="0.8"
                    strokeDasharray="4 4"
                  />
                  <circle cx={x} cy="210" r="3" fill={C.foil} />
                </g>
              );
            })}
          </svg>

          {/* 360° Art Piece Spatial Hotspots */}
          {pieces.map((piece, idx) => {
            const delta = shortestDelta(piece.bearing, yaw);
            const inView = Math.abs(delta) <= FOV / 2;
            const leftPct = 50 + (delta / (FOV / 2)) * 42;
            const topPct = 52 - piece.pitch * 1.15;
            const isSelected = piece.id === selectedPiece.id;

            if (!inView) return null;

            return (
              <button
                key={piece.id}
                type="button"
                onClick={() => focusPiece(piece)}
                aria-label={`Inspect Art Piece ${idx + 1}: ${piece.title} at ${piece.bearing} degrees`}
                className="group absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer text-left transition-transform duration-150 hover:scale-105 focus-visible:outline-2"
                style={{
                  left: `${leftPct}%`,
                  top: `${Math.max(18, Math.min(82, topPct))}%`,
                  zIndex: isSelected ? 30 : 20,
                  outlineColor: C.foil,
                }}
              >
                <div
                  className="flex items-center gap-2.5 rounded-md border-2 px-3 py-2 shadow-xl backdrop-blur-xs transition-all"
                  style={{
                    backgroundColor: isSelected
                      ? "rgba(252, 249, 240, 0.97)"
                      : "rgba(30, 23, 20, 0.88)",
                    borderColor: isSelected ? C.foil : "rgba(212, 175, 55, 0.6)",
                    color: isSelected ? C.ink : "#FCF9F0",
                    minWidth: 190,
                    maxWidth: 240,
                  }}
                >
                  <span
                    className="flex size-8 shrink-0 items-center justify-center rounded-full border text-[12px] font-bold"
                    style={{
                      fontFamily: F.mono,
                      backgroundColor: isSelected ? C.cover : C.foil,
                      borderColor: C.foil,
                      color: isSelected ? C.foil : C.ink,
                    }}
                  >
                    0{idx + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div
                      className="flex items-center justify-between text-[9px] font-bold uppercase tracking-[0.14em]"
                      style={{
                        fontFamily: F.mono,
                        color: isSelected ? cat.deep : C.foil,
                      }}
                    >
                      <span>{piece.id}</span>
                      <span>
                        {piece.bearing}° {cardinalLabel(piece.bearing)}
                      </span>
                    </div>
                    <div
                      className="truncate text-[13px] font-bold leading-snug"
                      style={{ fontFamily: F.display }}
                    >
                      {piece.title}
                    </div>
                    <div
                      className="truncate text-[10px]"
                      style={{
                        fontFamily: F.mono,
                        color: isSelected ? C.mute : "rgba(246, 241, 227, 0.72)",
                      }}
                    >
                      {piece.zone}
                    </div>
                  </div>
                </div>

                {/* Anchor Reticle Stem */}
                <div className="mx-auto flex flex-col items-center">
                  <div className="h-3 w-0.5" style={{ backgroundColor: C.foil }} />
                  <div
                    className="size-2.5 rounded-full border"
                    style={{
                      backgroundColor: isSelected ? C.red : C.foil,
                      borderColor: "#FFFFFF",
                    }}
                  />
                </div>
              </button>
            );
          })}

          {/* Top-Left Drag & Cardinal Controls Overlay */}
          <div className="absolute top-3 left-3 z-30 flex flex-wrap items-center gap-1.5">
            {(
              [
                ["N", 0],
                ["E", 90],
                ["S", 180],
                ["W", 270],
              ] as const
            ).map(([dir, deg]) => {
              const active = Math.abs(shortestDelta(deg, yaw)) < 22;
              return (
                <button
                  key={dir}
                  type="button"
                  onClick={() => {
                    setAutoRotate(false);
                    setYaw(deg);
                  }}
                  aria-label={`Look ${dir} (${deg} degrees)`}
                  className="cursor-pointer rounded-xs border px-2 py-1 text-[10px] font-bold transition-colors"
                  style={{
                    fontFamily: F.mono,
                    backgroundColor: active ? C.foil : "rgba(23, 19, 17, 0.82)",
                    borderColor: C.foil,
                    color: active ? C.ink : "#FCF9F0",
                  }}
                >
                  {dir} {deg}°
                </button>
              );
            })}
          </div>

          {/* Bottom-Left Pan Hint & Left/Right Buttons */}
          <div className="absolute bottom-3 left-3 z-30 flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => {
                setAutoRotate(false);
                setYaw((y) => normalizeAngle(y - 30));
              }}
              aria-label="Rotate 360 camera left"
              className="cursor-pointer rounded-xs border px-2.5 py-1 text-[11px] font-bold"
              style={{
                fontFamily: F.mono,
                backgroundColor: "rgba(23, 19, 17, 0.85)",
                borderColor: C.foil,
                color: "#FCF9F0",
              }}
            >
              ⟲ -30°
            </button>
            <button
              type="button"
              onClick={() => {
                setAutoRotate(false);
                setYaw((y) => normalizeAngle(y + 30));
              }}
              aria-label="Rotate 360 camera right"
              className="cursor-pointer rounded-xs border px-2.5 py-1 text-[11px] font-bold"
              style={{
                fontFamily: F.mono,
                backgroundColor: "rgba(23, 19, 17, 0.85)",
                borderColor: C.foil,
                color: "#FCF9F0",
              }}
            >
              +30° ⟳
            </button>
            <span
              className="hidden rounded-xs border px-2.5 py-1 text-[10px] uppercase tracking-[0.12em] sm:inline-block"
              style={{
                fontFamily: F.mono,
                backgroundColor: "rgba(23, 19, 17, 0.75)",
                borderColor: "rgba(212, 175, 55, 0.4)",
                color: "#E6DEC8",
              }}
            >
              ⇄ Drag Panorama or Tap a Numbered Art Pin
            </span>
          </div>

          {/* Bottom-Right Top-Down 360° Radar Floorplan Mini-Map */}
          <div
            className="absolute right-3 bottom-3 z-30 flex flex-col items-center rounded-lg border p-2 shadow-lg"
            style={{
              backgroundColor: "rgba(23, 19, 17, 0.9)",
              borderColor: C.foil,
            }}
          >
            <span
              className="mb-1 text-[8px] font-bold uppercase tracking-[0.16em]"
              style={{ fontFamily: F.mono, color: C.foil }}
            >
              360° FLOOR RADAR
            </span>
            <svg width="88" height="88" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="44" fill="#14100E" stroke={C.foil} strokeWidth="1.2" />
              <circle
                cx="50"
                cy="50"
                r="28"
                fill="none"
                stroke={C.foil}
                strokeWidth="0.6"
                strokeDasharray="2 2"
              />
              {/* Viewing Cone */}
              <g transform={`rotate(${yaw} 50 50)`}>
                <path
                  d="M 50,50 L 18,14 A 46,46 0 0,1 82,14 Z"
                  fill={C.foil}
                  fillOpacity="0.22"
                  stroke={C.foil}
                  strokeWidth="0.8"
                />
              </g>

              {/* Art Piece Radar Dots */}
              {pieces.map((p, idx) => {
                const rad = ((p.bearing - 90) * Math.PI) / 180;
                const rx = 50 + Math.cos(rad) * 34;
                const ry = 50 + Math.sin(rad) * 34;
                const active = p.id === selectedPiece.id;
                return (
                  <g key={p.id} onClick={() => focusPiece(p)} className="cursor-pointer">
                    <circle
                      cx={rx}
                      cy={ry}
                      r={active ? 7 : 5.5}
                      fill={active ? C.red : C.foil}
                      stroke="#FFFFFF"
                      strokeWidth="1.2"
                    />
                    <text
                      x={rx}
                      y={ry + 3}
                      textAnchor="middle"
                      fontSize="7"
                      fontWeight="700"
                      fill={active ? "#FFFFFF" : C.ink}
                      style={{ fontFamily: F.mono }}
                    >
                      {idx + 1}
                    </text>
                  </g>
                );
              })}

              {/* Center Observer Point */}
              <circle cx="50" cy="50" r="3.5" fill="#FFFFFF" />
            </svg>
          </div>
        </div>

        {/* Quick Art Piece Selector Strip */}
        <div
          className="grid grid-cols-2 gap-1.5 border-t p-2 sm:grid-cols-4"
          style={{
            backgroundColor: "#221A17",
            borderColor: "rgba(212, 175, 55, 0.35)",
          }}
        >
          {pieces.map((p, idx) => {
            const active = p.id === selectedPiece.id;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => focusPiece(p)}
                className="flex cursor-pointer items-center gap-2 rounded-xs border px-2.5 py-2 text-left transition-all"
                style={{
                  backgroundColor: active ? C.cover : "rgba(255, 255, 255, 0.04)",
                  borderColor: active ? C.foil : "rgba(212, 175, 55, 0.25)",
                  color: "#FCF9F0",
                }}
              >
                <span
                  className="flex size-6 shrink-0 items-center justify-center rounded-full text-[10px] font-bold"
                  style={{
                    fontFamily: F.mono,
                    backgroundColor: active ? C.foil : "rgba(212, 175, 55, 0.2)",
                    color: active ? C.ink : C.foil,
                  }}
                >
                  0{idx + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <div
                    className="truncate text-[12px] font-bold leading-tight"
                    style={{ fontFamily: F.display }}
                  >
                    {p.title}
                  </div>
                  <div
                    className="text-[9px] uppercase tracking-[0.12em]"
                    style={{ fontFamily: F.mono, color: C.foil }}
                  >
                    {p.bearing}° {cardinalLabel(p.bearing)} · {p.motif}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Art Piece Curatorial Dossier Panel */}
      <Pop className="passport-page-surface mt-4 p-5 sm:p-6">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-12">
          {/* Left Engraved Curatorial Plate & Bearing */}
          <div className="flex flex-col justify-between md:col-span-4">
            <div className="h-44 overflow-hidden rounded-md border border-[#B8AC93] shadow-inner">
              <ArtMotifPlate motif={selectedPiece.motif} color={cat.deep} code={selectedPiece.id} />
            </div>

            <div className="mt-3 rounded-xs border border-[#D5CBB4] bg-[#EFE9D8] p-3">
              <div className="flex items-center justify-between text-[11px] font-bold">
                <span style={{ fontFamily: F.mono, color: C.mute }}>360° BEARING:</span>
                <span style={{ fontFamily: F.mono, color: C.cover }}>
                  {selectedPiece.bearing}° {cardinalLabel(selectedPiece.bearing)} (PITCH{" "}
                  {selectedPiece.pitch >= 0
                    ? `+${selectedPiece.pitch}°`
                    : `${selectedPiece.pitch}°`}
                  )
                </span>
              </div>
              <div className="mt-1 flex items-center justify-between text-[11px] font-bold">
                <span style={{ fontFamily: F.mono, color: C.mute }}>GALLERY SECTOR:</span>
                <span className="truncate pl-2" style={{ fontFamily: F.mono, color: C.ink }}>
                  {selectedPiece.zone}
                </span>
              </div>
            </div>
          </div>

          {/* Right Detailed Art Plaque */}
          <div className="flex flex-col justify-between md:col-span-8">
            <div>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span
                  className="rounded-xs border px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.14em]"
                  style={{
                    fontFamily: F.mono,
                    borderColor: cat.deep,
                    backgroundColor: "rgba(252, 249, 240, 0.9)",
                    color: cat.deep,
                  }}
                >
                  ARTIFACT {selectedIndex + 1} OF {pieces.length} · {selectedPiece.id}
                </span>

                <span
                  className="text-[11px] font-bold uppercase tracking-[0.12em]"
                  style={{ fontFamily: F.mono, color: C.mute }}
                >
                  {selectedPiece.period}
                </span>
              </div>

              <h3
                className="mt-2 text-[24px] font-bold leading-snug sm:text-[28px]"
                style={{ fontFamily: F.display, color: C.ink }}
              >
                {selectedPiece.title}
              </h3>
              <div className="text-[14px] italic" style={{ fontFamily: F.display, color: C.mute }}>
                “{selectedPiece.filTitle}”
              </div>

              {/* Technical Metadata Grid */}
              <div className="mt-3 grid grid-cols-1 gap-2 rounded-md border border-[#D5CBB4] bg-[#FCF9F0]/90 p-3 sm:grid-cols-2">
                <div>
                  <Label>ARTIST / WORKSHOP / ORIGIN</Label>
                  <div
                    className="mt-0.5 text-[13px] font-semibold"
                    style={{ fontFamily: F.body, color: C.ink }}
                  >
                    {selectedPiece.artistOrMaker}
                  </div>
                </div>
                <div>
                  <Label>MEDIUM & MATERIALS</Label>
                  <div
                    className="mt-0.5 text-[13px] font-semibold"
                    style={{ fontFamily: F.body, color: C.ink }}
                  >
                    {selectedPiece.medium}
                  </div>
                </div>
                <div>
                  <Label>SCALE / DIMENSIONS</Label>
                  <div className="mt-0.5 text-[12px]" style={{ fontFamily: F.mono, color: C.ink }}>
                    {selectedPiece.dimensions}
                  </div>
                </div>
                <div>
                  <Label>CONSERVATION RECORD</Label>
                  <div
                    className="mt-0.5 text-[12px]"
                    style={{ fontFamily: F.body, color: C.green }}
                  >
                    {selectedPiece.conservationNote}
                  </div>
                </div>
              </div>

              {/* Curatorial Analysis */}
              <div className="mt-3.5">
                <Label className="mb-1">CURATORIAL DETAILS & ICONOGRAPHY</Label>
                <p
                  className="text-[14px] leading-relaxed sm:text-[15px]"
                  style={{ fontFamily: F.body, color: C.ink }}
                >
                  {selectedPiece.details}
                </p>
              </div>
            </div>

            {/* Step Between Art Pieces in 360° */}
            <div className="mt-4 grid grid-cols-2 gap-3 border-t border-dashed border-[#D5CBB4] pt-3">
              <Btn
                label="← Previous Art Piece"
                sub="Rotate Camera Counter-Clockwise"
                color={C.card}
                onClick={() => stepPiece(-1)}
              />
              <Btn
                label="Next Art Piece →"
                sub="Rotate Camera Clockwise"
                color={C.cover}
                onClick={() => stepPiece(1)}
              />
            </div>
          </div>
        </div>
      </Pop>
    </section>
  );
}
