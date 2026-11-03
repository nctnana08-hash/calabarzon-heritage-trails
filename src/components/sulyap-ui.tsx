import React, { useEffect, useState } from "react";
import { imageUrl, type Destination } from "@/lib/destinations";
import { getEnrichment } from "@/lib/sulyap-data";
import { C, F, PROVINCE_CODES, getCategoryMeta, onColor, seedFromId } from "@/lib/sulyap-theme";
import { cn } from "@/lib/utils";

export const Label = ({
  children,
  className,
  style,
}: {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}) => (
  <span
    className={cn(
      "block text-[11px] font-semibold uppercase tracking-[0.16em] leading-snug",
      className,
    )}
    style={{ fontFamily: F.mono, color: C.mute, ...style }}
  >
    {children}
  </span>
);

export const Sec = ({
  fil,
  en,
  right,
  className,
}: {
  fil: string;
  en: string;
  right?: React.ReactNode;
  className?: string;
}) => (
  <div
    className={cn(
      "mt-8 mb-4 flex flex-wrap items-end justify-between gap-4 border-b pb-2.5",
      className,
    )}
    style={{ borderColor: "#D6CCB5" }}
  >
    <div>
      <Label className="mb-0.5">{en}</Label>
      <h2
        className="text-[24px] font-bold leading-tight sm:text-[28px]"
        style={{ fontFamily: F.display, color: C.ink }}
      >
        {fil}
      </h2>
    </div>
    {right}
  </div>
);

/**
 * Engraved Passport Guilloché & Compass Rose SVG watermark pattern.
 * Replaces the old blocky pattern with fine security linework and a subtle heritage crest.
 */
export const Banig = React.memo(function Banig({
  color,
  seed = 1,
  className,
}: {
  color: string;
  seed?: number;
  className?: string;
}) {
  const cleanSeed = Math.max(1, Math.abs(Math.floor(seed)));
  const ringOffset = (cleanSeed % 5) * 4;

  return (
    <svg
      className={cn("block h-full w-full select-none", className)}
      viewBox="0 0 360 200"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
    >
      <rect width="360" height="200" fill={color} />
      {/* Subtle dark vignette */}
      <rect width="360" height="200" fill="#120E0A" opacity="0.16" />

      {/* Guilloché security waves */}
      <g fill="none" stroke="#FCF9F0" strokeWidth="0.75" opacity="0.22">
        <path d="M-20 40 Q 70 10, 180 40 T 380 40" />
        <path d="M-20 65 Q 70 35, 180 65 T 380 65" />
        <path d="M-20 90 Q 70 60, 180 90 T 380 90" />
        <path d="M-20 115 Q 70 85, 180 115 T 380 115" />
        <path d="M-20 140 Q 70 110, 180 140 T 380 140" />
        <path d="M-20 165 Q 70 135, 180 165 T 380 165" />
      </g>

      {/* Concentric passport seal rosette */}
      <g transform="translate(180, 100)" fill="none" stroke="#FCF9F0" opacity="0.28">
        <circle r={34 + ringOffset} strokeWidth="1" strokeDasharray="3 3" />
        <circle r={48 + ringOffset} strokeWidth="0.8" />
        <circle r={64 + ringOffset} strokeWidth="0.7" strokeDasharray="6 4" />
        <polygon points="0,-28 7,-7 28,0 7,7 0,28 -7,7 -28,0 -7,-7" strokeWidth="1" />
        <polygon
          points="0,-20 5,-5 20,0 5,5 0,20 -5,5 -20,0 -5,-5"
          transform="rotate(45)"
          strokeWidth="0.8"
        />
      </g>

      {/* Corner registration marks */}
      <g stroke="#FCF9F0" strokeWidth="1" opacity="0.35" fill="none">
        <path d="M12 24 V12 H24" />
        <path d="M348 24 V12 H336" />
        <path d="M12 176 V188 H24" />
        <path d="M348 176 V188 H336" />
      </g>
    </svg>
  );
});

/**
 * Embossed Gold-Foil Philippine Heritage Passport Seal.
 */
export const Mark = React.memo(function Mark({ size = 36 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 44 44"
      aria-label="Sulyap Passport Official Crest"
      role="img"
      className="shrink-0"
    >
      {/* Octagonal Passport Seal Base */}
      <polygon
        points="14,2 30,2 42,14 42,30 30,42 14,42 2,30 2,14"
        fill={C.cover}
        stroke={C.foil}
        strokeWidth="1.8"
      />
      <circle
        cx="22"
        cy="22"
        r="15"
        fill="none"
        stroke={C.foil}
        strokeWidth="0.9"
        strokeDasharray="2 2"
      />
      {/* 8-Ray Philippine Heritage Compass Star */}
      <polygon points="22,8 25,18 35,22 25,26 22,36 19,26 9,22 19,18" fill={C.foil} />
      <polygon
        points="22,11 24,19 32,22 24,25 22,33 20,25 12,22 20,19"
        transform="rotate(45 22 22)"
        fill={C.foil}
        opacity="0.65"
      />
      <circle cx="22" cy="22" r="3.2" fill={C.cover} stroke={C.foil} strokeWidth="1.2" />
    </svg>
  );
});

/**
 * Archival Passport Surface / Interactive Card.
 * Replaces the heavy comic drop-shadow with a stitched/engraved passport frame and subtle tactile lift.
 */
export function Pop({
  children,
  onClick,
  className,
  style,
  bg = C.card,
  radius = 8,
  ariaLabel,
  disabled = false,
  type = "button",
}: {
  children: React.ReactNode;
  onClick?: (() => void) | undefined;
  className?: string;
  style?: React.CSSProperties;
  bg?: string;
  depth?: number;
  radius?: number;
  ariaLabel?: string;
  disabled?: boolean;
  type?: "button" | "submit";
}) {
  const [pressed, setPressed] = useState(false);
  const interactive = Boolean(onClick) && !disabled;
  const isDarkBg =
    bg === C.cover ||
    bg === C.coverDeep ||
    bg === C.ink ||
    bg === C.blue ||
    bg === C.red ||
    bg === C.green;

  const content = (
    <div
      className={cn(
        "relative overflow-hidden transition-all duration-150",
        interactive && "hover:shadow-md",
        className,
      )}
      style={{
        backgroundColor: bg,
        borderRadius: radius,
        borderWidth: 1.5,
        borderStyle: "solid",
        borderColor: isDarkBg ? "rgba(212, 175, 55, 0.45)" : "#C8BDA4",
        boxShadow: pressed
          ? "0 1px 2px rgba(30, 35, 42, 0.08)"
          : "0 3px 10px rgba(30, 35, 42, 0.07), inset 0 0 0 1px rgba(255, 255, 255, 0.35)",
        transform: pressed && interactive ? "translateY(1px)" : "translateY(0px)",
        ...style,
      }}
    >
      {children}
    </div>
  );

  if (onClick) {
    return (
      <button
        type={type}
        disabled={disabled}
        aria-label={ariaLabel}
        onClick={onClick}
        onMouseDown={() => setPressed(true)}
        onMouseUp={() => setPressed(false)}
        onMouseLeave={() => setPressed(false)}
        onTouchStart={() => setPressed(true)}
        onTouchEnd={() => setPressed(false)}
        className={cn(
          "block w-full text-left focus-visible:outline-2 focus-visible:outline-offset-2",
          interactive ? "cursor-pointer" : "cursor-not-allowed opacity-60",
        )}
        style={{ outlineColor: C.cover }}
      >
        {content}
      </button>
    );
  }

  return content;
}

export const Btn = ({
  label,
  sub,
  onClick,
  color = C.cover,
  disabled = false,
  type = "button",
  className,
  ariaLabel,
}: {
  label: string;
  sub?: string;
  onClick?: () => void;
  color?: string;
  disabled?: boolean;
  type?: "button" | "submit";
  className?: string;
  ariaLabel?: string;
}) => {
  const textColor = onColor(color);
  return (
    <Pop
      onClick={onClick}
      disabled={disabled}
      type={type}
      bg={color}
      radius={6}
      ariaLabel={ariaLabel ?? (sub ? `${label} (${sub})` : label)}
      className={cn(
        "flex min-h-[46px] flex-col items-center justify-center px-4 py-2.5 text-center",
        className,
      )}
    >
      <span
        className="text-[14px] font-semibold tracking-[0.04em] leading-tight"
        style={{ fontFamily: F.bold, color: textColor }}
      >
        {label}
      </span>
      {sub ? (
        <span
          className="mt-0.5 text-[11px] font-medium uppercase tracking-[0.12em] leading-tight"
          style={{ fontFamily: F.mono, color: textColor, opacity: 0.85 }}
        >
          {sub}
        </span>
      ) : null}
    </Pop>
  );
};

export const Chip = ({
  label,
  on,
  color = C.cover,
  onClick,
  ariaLabel,
}: {
  label: string;
  on: boolean;
  color?: string;
  onClick: () => void;
  ariaLabel?: string;
}) => (
  <button
    type="button"
    role="button"
    aria-pressed={on}
    aria-label={ariaLabel ?? label}
    onClick={onClick}
    className="inline-flex min-h-[38px] shrink-0 cursor-pointer items-center justify-center rounded-md px-3.5 py-1.5 text-[13px] font-semibold transition-all focus-visible:outline-2 focus-visible:outline-offset-2"
    style={{
      fontFamily: F.bold,
      borderWidth: 1.5,
      borderStyle: "solid",
      borderColor: on ? color : "#C8BDA4",
      backgroundColor: on ? color : C.card,
      color: on ? onColor(color) : C.ink,
      boxShadow: on ? "0 2px 5px rgba(30,35,42,0.14)" : "none",
    }}
  >
    {label}
  </button>
);

/**
 * Renders the destination's cover image if available and loadable;
 * otherwise renders the engraved passport guilloché pattern in the category's ink color.
 */
export function Cover({
  destination,
  className,
  style,
}: {
  destination: Pick<
    Destination,
    "id" | "slug" | "name" | "category" | "image_path" | "updated_at" | "description" | "province"
  >;
  className?: string;
  style?: React.CSSProperties;
}) {
  const [imgFailed, setImgFailed] = useState(false);
  const enrichment = getEnrichment(destination);
  const primaryUri = imageUrl(destination) || enrichment.images[0] || null;
  const cat = getCategoryMeta(destination.category);
  const seed = seedFromId(destination.slug || destination.id);

  useEffect(() => {
    setImgFailed(false);
  }, [primaryUri]);

  return (
    <div
      className={cn("relative overflow-hidden", className)}
      style={{ backgroundColor: cat.deep, ...style }}
    >
      {primaryUri && !imgFailed ? (
        <img
          src={primaryUri}
          alt={destination.name}
          loading="lazy"
          onError={() => setImgFailed(true)}
          className="h-full w-full object-cover"
        />
      ) : (
        <Banig color={cat.deep} seed={seed} />
      )}
    </div>
  );
}

/**
 * Authentic Multi-Shape Rubber Ink Passport Stamp (Selyo ng Pagbisita).
 * Each heritage category features its own official immigration/customs stamp frame:
 * - Heritage Shrines: Octagonal Customs Seal
 * - Religious Landmarks: Gothic Arch Entry Stamp
 * - Museums: Rectangular Archival Cancel Stamp
 * - Natural Heritage: Double-Ring Compass Seal
 */
export function Stamp({
  destination,
  label,
  size = 128,
  tilt = -5,
  animateIn = false,
}: {
  destination: Pick<Destination, "name" | "province" | "category">;
  label: string;
  size?: number;
  tilt?: number;
  animateIn?: boolean;
}) {
  const cat = getCategoryMeta(destination.category);
  const provCode = PROVINCE_CODES[destination.province] ?? "IVA";
  const inkColor = cat.deep;
  const [settled, setSettled] = useState(!animateIn);

  useEffect(() => {
    if (!animateIn) {
      setSettled(true);
      return;
    }
    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      setSettled(true);
      return;
    }
    setSettled(false);
    const id = window.setTimeout(() => setSettled(true), 30);
    return () => window.clearTimeout(id);
  }, [animateIn]);

  const t = Math.max(9, size * 0.082);

  return (
    <div
      role="img"
      aria-label={`Passport stamp for ${destination.name} (${destination.province}): ${label}`}
      className="relative flex select-none items-center justify-center"
      style={{
        width: size,
        height: size,
        transform: settled ? `scale(1) rotate(${tilt}deg)` : `scale(1.45) rotate(${tilt - 12}deg)`,
        transition: animateIn ? "transform 260ms cubic-bezier(0.22, 1, 0.36, 1)" : undefined,
      }}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 120 120"
        className="pointer-events-none absolute inset-0"
        aria-hidden="true"
      >
        {/* Subtle rubber ink bleed fill */}
        {cat.stampShape === "octagon" && (
          <g>
            <polygon
              points="35,6 85,6 114,35 114,85 85,114 35,114 6,85 6,35"
              fill={inkColor}
              fillOpacity="0.06"
              stroke={inkColor}
              strokeWidth="3"
            />
            <polygon
              points="38,11 82,11 109,38 109,82 82,109 38,109 11,82 11,38"
              fill="none"
              stroke={inkColor}
              strokeWidth="1.2"
              strokeDasharray="3 2"
            />
          </g>
        )}

        {cat.stampShape === "arch" && (
          <g>
            <path
              d="M 14,112 L 14,50 A 46,46 0 0,1 106,50 L 106,112 Z"
              fill={inkColor}
              fillOpacity="0.06"
              stroke={inkColor}
              strokeWidth="3"
            />
            <path
              d="M 19,107 L 19,50 A 41,41 0 0,1 101,50 L 101,107 Z"
              fill="none"
              stroke={inkColor}
              strokeWidth="1.2"
              strokeDasharray="3 2.5"
            />
          </g>
        )}

        {cat.stampShape === "rect" && (
          <g>
            <rect
              x="8"
              y="14"
              width="104"
              height="92"
              rx="8"
              fill={inkColor}
              fillOpacity="0.06"
              stroke={inkColor}
              strokeWidth="3"
            />
            <rect
              x="13"
              y="19"
              width="94"
              height="82"
              rx="5"
              fill="none"
              stroke={inkColor}
              strokeWidth="1.2"
              strokeDasharray="4 2.5"
            />
          </g>
        )}

        {cat.stampShape === "circle" && (
          <g>
            <circle
              cx="60"
              cy="60"
              r="53"
              fill={inkColor}
              fillOpacity="0.06"
              stroke={inkColor}
              strokeWidth="3"
            />
            <circle
              cx="60"
              cy="60"
              r="47"
              fill="none"
              stroke={inkColor}
              strokeWidth="1.2"
              strokeDasharray="3 2.5"
            />
          </g>
        )}

        {/* Center horizontal verification band */}
        <line
          x1="18"
          y1="40"
          x2="102"
          y2="40"
          stroke={inkColor}
          strokeWidth="1"
          strokeOpacity="0.55"
        />
        <line
          x1="18"
          y1="82"
          x2="102"
          y2="82"
          stroke={inkColor}
          strokeWidth="1"
          strokeOpacity="0.55"
        />
      </svg>

      <div
        className="relative z-10 flex flex-col items-center justify-center text-center"
        style={{ width: size * 0.72, color: inkColor }}
      >
        <span
          className="font-bold uppercase tracking-[0.14em] leading-none"
          style={{ fontFamily: F.mono, fontSize: Math.max(7.5, t * 0.72) }}
        >
          ★ {provCode} · {cat.code} ★
        </span>
        <span
          className="mt-0.5 uppercase tracking-[0.08em] leading-none"
          style={{ fontFamily: F.bold, fontSize: Math.max(8, t * 0.8), opacity: 0.9 }}
        >
          {destination.province}
        </span>

        <span
          className="my-1.5 line-clamp-2 font-bold leading-tight"
          style={{
            fontFamily: F.display,
            fontSize: t * 1.18,
            lineHeight: `${t * 1.15}px`,
          }}
        >
          {destination.name}
        </span>

        <span
          className="inline-block rounded-xs border px-1.5 py-0.5 font-bold uppercase tracking-[0.12em] leading-none"
          style={{
            fontFamily: F.mono,
            fontSize: Math.max(8, t * 0.78),
            borderColor: inkColor,
            backgroundColor: "rgba(252, 249, 240, 0.85)",
          }}
        >
          {label === "✓" ? "VISITED" : `PASSED ${label}`}
        </span>
      </div>
    </div>
  );
}

/**
 * Official Entry Visa & Field Dossier Row (replaces the old comic ticket stub).
 * Looks like an authentic passport visa entry with a framed photo, serial code, coordinates,
 * and an overlaid rubber ink stamp when the traveler has visited the site.
 */
export function Ticket({
  destination,
  done,
  quizBest,
  onClick,
}: {
  destination: Destination;
  done?: boolean;
  quizBest?: { best: number; total: number } | null;
  onClick: () => void;
}) {
  const cat = getCategoryMeta(destination.category);
  const provCode = PROVINCE_CODES[destination.province] ?? "IVA";
  const seed = seedFromId(destination.slug || destination.id);
  const serialNo = `IV-A-${provCode}-${String(seed).padStart(3, "0")}`;

  return (
    <Pop
      onClick={onClick}
      ariaLabel={`${destination.name}, ${destination.province}, ${cat.fil} (${destination.category})${done ? ", Stamped" : ""}`}
      className="passport-page-surface flex min-h-[132px] flex-col sm:flex-row sm:items-stretch"
    >
      {/* Left Framed Passport Photograph */}
      <div className="relative h-36 w-full shrink-0 overflow-hidden border-b border-[#D5CBB4] bg-[#EAE2CE] p-2 sm:h-auto sm:w-40 sm:border-r sm:border-b-0">
        <div className="relative h-full w-full overflow-hidden rounded-xs border border-[#B8AC93] shadow-inner">
          <Cover destination={destination} className="h-full w-full" />
          <div
            className="absolute bottom-1.5 left-1.5 rounded-xs px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.12em]"
            style={{
              fontFamily: F.mono,
              backgroundColor: "rgba(30, 35, 42, 0.84)",
              color: C.foil,
            }}
          >
            {provCode} · {cat.fil}
          </div>
        </div>
      </div>

      {/* Center Visa Dossier Details */}
      <div className="flex flex-1 flex-col justify-between p-4">
        <div>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span
              className="text-[11px] font-semibold uppercase tracking-[0.14em]"
              style={{ fontFamily: F.mono, color: cat.deep }}
            >
              VISA NO. {serialNo} · {destination.category}
            </span>

            <div className="flex items-center gap-1.5">
              {done ? (
                <span
                  className="inline-flex items-center gap-1 rounded-xs border px-2 py-0.5 text-[11px] font-bold uppercase tracking-[0.1em]"
                  style={{
                    fontFamily: F.mono,
                    borderColor: C.green,
                    backgroundColor: "rgba(35, 99, 67, 0.1)",
                    color: C.green,
                  }}
                >
                  ★ Entry Stamped
                </span>
              ) : (
                <span
                  className="inline-flex items-center rounded-xs border border-dashed px-2 py-0.5 text-[11px] uppercase tracking-[0.1em]"
                  style={{
                    fontFamily: F.mono,
                    borderColor: "#B8AC93",
                    color: C.mute,
                  }}
                >
                  Unstamped Visa
                </span>
              )}

              {quizBest && quizBest.total > 0 ? (
                <span
                  className="inline-flex items-center rounded-xs border px-2 py-0.5 text-[11px] font-bold uppercase tracking-[0.08em]"
                  style={{
                    fontFamily: F.mono,
                    borderColor: "#B78727",
                    backgroundColor: "rgba(212, 168, 67, 0.18)",
                    color: C.ink,
                  }}
                >
                  Examiner {quizBest.best}/{quizBest.total}
                </span>
              ) : null}
            </div>
          </div>

          <h3
            className="mt-1 text-[21px] font-bold leading-snug sm:text-[23px]"
            style={{ fontFamily: F.display, color: C.ink }}
          >
            {destination.name}
          </h3>

          <p
            className="mt-0.5 line-clamp-2 text-[13px] leading-relaxed"
            style={{ fontFamily: F.body, color: C.mute }}
          >
            {destination.description}
          </p>
        </div>

        <div
          className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-dashed pt-2 text-[11px]"
          style={{ borderColor: "#D5CBB4", fontFamily: F.mono, color: C.mute }}
        >
          <span>
            LOC: {destination.address}, {destination.province}
          </span>
          <span>
            {Number(destination.latitude).toFixed(3)}°N · {Number(destination.longitude).toFixed(3)}
            °E →
          </span>
        </div>
      </div>

      {/* Right Rubber Stamp Preview when visited */}
      {done ? (
        <div className="hidden shrink-0 items-center justify-center border-l border-dashed border-[#D5CBB4] px-3 sm:flex">
          <Stamp
            destination={destination}
            label={quizBest ? `${quizBest.best}/${quizBest.total}` : "✓"}
            size={84}
            tilt={-6}
          />
        </div>
      ) : null}
    </Pop>
  );
}

export const Top = ({
  title,
  kicker,
  onBack,
  right,
}: {
  title?: string;
  kicker?: string;
  onBack?: () => void;
  right?: React.ReactNode;
}) => (
  <div className="mb-2 flex items-center gap-3 border-b py-3" style={{ borderColor: "#D6CCB5" }}>
    {onBack ? (
      <button
        type="button"
        onClick={onBack}
        aria-label="Go back"
        className="flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-md border transition-colors hover:bg-[#EAE2CE]"
        style={{
          borderColor: "#BFB399",
          backgroundColor: C.card,
          fontFamily: F.mono,
          fontSize: 18,
          color: C.ink,
        }}
      >
        ←
      </button>
    ) : null}
    <div className="min-w-0 flex-1">
      {kicker ? <Label>{kicker}</Label> : null}
      {title ? (
        <h1
          className="truncate text-[24px] font-bold leading-tight sm:text-[28px]"
          style={{ fontFamily: F.display, color: C.ink }}
        >
          {title}
        </h1>
      ) : null}
    </div>
    {right}
  </div>
);
