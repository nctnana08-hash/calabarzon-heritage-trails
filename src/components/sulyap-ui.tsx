import React, { useEffect, useState } from "react";
import { MapPin, Check, Sparkles, Compass } from "lucide-react";
import { imageUrl, type Destination } from "@/lib/destinations";
import { getEnrichment } from "@/lib/sulyap-data";
import { C, F, getCategoryMeta, onColor, seedFromId } from "@/lib/sulyap-theme";
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
    className={cn("block text-[11px] font-bold tracking-wider uppercase", className)}
    style={{ fontFamily: F.body, color: C.mute, ...style }}
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
  en?: string;
  right?: React.ReactNode;
  className?: string;
}) => (
  <div className={cn("mt-9 mb-4 flex items-end justify-between gap-4", className)}>
    <div>
      <div className="mb-1 flex items-center gap-1.5">
        <span className="h-1.5 w-5 rounded-full" style={{ backgroundColor: C.cover }} />
        <span className="h-1.5 w-2 rounded-full" style={{ backgroundColor: C.foil }} />
        <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: C.red }} />
      </div>
      <h2
        className="text-[22px] font-extrabold tracking-tight leading-tight sm:text-[26px]"
        style={{ fontFamily: F.display, color: C.ink }}
      >
        {fil}
      </h2>
      {en ? (
        <p className="mt-0.5 text-[13px] font-medium" style={{ fontFamily: F.body, color: C.mute }}>
          {en}
        </p>
      ) : null}
    </div>
    {right}
  </div>
);

/**
 * Illustrated Travel Postcard SVG Scene per category & seed.
 * Gives every destination a vibrant, recognizable scenic illustration when no photo is uploaded.
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
  const variant = cleanSeed % 4;
  const sunX = 70 + ((cleanSeed * 37) % 220);

  const isRed = color === C.red || color === "#B91C1C";
  const isBlue = color === C.blue || color === "#0038A8" || color === "#1D4ED8";
  const isGold = color === C.gold || color === "#B45309";

  const skyTop = isRed ? "#881337" : isBlue ? "#002366" : isGold ? "#78350F" : "#064E3B";
  const skyBottom = isRed ? "#E11D48" : isBlue ? "#2563EB" : isGold ? "#D97706" : "#059669";
  const hillBack = isRed ? "#4C0519" : isBlue ? "#001A4D" : isGold ? "#451A03" : "#022C22";
  const hillFront = "#0F172A";

  return (
    <svg
      className={cn("block h-full w-full select-none", className)}
      viewBox="0 0 360 220"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={`sky-${cleanSeed}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={skyTop} />
          <stop offset="100%" stopColor={skyBottom} />
        </linearGradient>
      </defs>

      {/* Sky */}
      <rect width="360" height="220" fill={`url(#sky-${cleanSeed})`} />

      {/* Philippine Sun Glow */}
      <circle cx={sunX} cy="60" r="26" fill="#FCD116" opacity="0.92" />
      <circle cx={sunX} cy="60" r="42" fill="#FCD116" opacity="0.22" />

      {/* Distant Hills */}
      <path
        d="M 0,145 Q 90,110 180,140 T 360,130 L 360,220 L 0,220 Z"
        fill={hillBack}
        opacity="0.65"
      />

      {/* Category / Variant Architectural or Natural Silhouette */}
      {isRed && (
        /* Heritage Bahay-na-Bato / Shrine Silhouette */
        <g fill={hillFront} transform="translate(115, 76)">
          <polygon points="0,48 65,12 130,48" />
          <rect x="14" y="48" width="102" height="58" />
          <rect x="52" y="18" width="26" height="32" />
          <polygon points="48,18 65,2 82,18" />
          <rect x="24" y="58" width="16" height="20" rx="2" fill="#FCD116" opacity="0.9" />
          <rect x="46" y="58" width="16" height="20" rx="2" fill="#FCD116" opacity="0.9" />
          <rect x="68" y="58" width="16" height="20" rx="2" fill="#FCD116" opacity="0.9" />
          <rect x="90" y="58" width="16" height="20" rx="2" fill="#FCD116" opacity="0.9" />
        </g>
      )}

      {isBlue && (
        /* Colonial Basilica / Bell Tower Silhouette */
        <g fill={hillFront} transform="translate(110, 62)">
          <polygon points="20,56 65,24 110,56" />
          <rect x="26" y="56" width="78" height="64" />
          <rect x="108" y="32" width="26" height="88" />
          <polygon points="105,32 121,12 137,32" />
          <line x1="65" y1="10" x2="65" y2="24" stroke="#FCD116" strokeWidth="2.5" />
          <line x1="59" y1="16" x2="71" y2="16" stroke="#FCD116" strokeWidth="2.5" />
          <circle cx="65" cy="46" r="8" fill="#FCD116" opacity="0.9" />
          <path d="M55,120 L55,88 A10,10 0 0,1 75,88 L75,120 Z" fill="#FCD116" opacity="0.85" />
        </g>
      )}

      {isGold && (
        /* Museum / Archival Gallery Colonnade */
        <g fill={hillFront} transform="translate(100, 82)">
          <polygon points="0,38 80,6 160,38" />
          <rect x="8" y="38" width="144" height="8" />
          <rect x="16" y="46" width="128" height="58" />
          <rect x="30" y="56" width="18" height="36" rx="9" fill="#FCD116" opacity="0.9" />
          <rect x="71" y="56" width="18" height="36" rx="9" fill="#FCD116" opacity="0.9" />
          <rect x="112" y="56" width="18" height="36" rx="9" fill="#FCD116" opacity="0.9" />
        </g>
      )}

      {!isRed && !isBlue && !isGold && (
        /* Volcano / Waterfall / Mountain Peak Silhouette */
        <g>
          <polygon points="65,185 165,72 205,72 295,185" fill={hillBack} />
          {variant % 2 === 0 ? (
            <path d="M 178,72 L 192,72 L 204,185 L 168,185 Z" fill="#A7F3D0" opacity="0.8" />
          ) : (
            <circle cx="185" cy="56" r="16" fill="#FFFFFF" opacity="0.4" />
          )}
        </g>
      )}

      {/* Foreground Horizon */}
      <path d="M 0,175 Q 110,152 230,172 T 360,165 L 360,220 L 0,220 Z" fill={hillFront} />
    </svg>
  );
});

/**
 * eGovPH-Inspired Philippine Sun & Heritage Emblem.
 */
export const Mark = React.memo(function Mark({ size = 36 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 44 44"
      aria-label="Sulyap emblem"
      role="img"
      className="shrink-0"
    >
      <defs>
        <linearGradient id="egov-mark-bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#002366" />
          <stop offset="65%" stopColor="#0038A8" />
          <stop offset="100%" stopColor="#1D4ED8" />
        </linearGradient>
      </defs>
      <rect x="2" y="2" width="40" height="40" rx="12" fill="url(#egov-mark-bg)" />
      {/* Bottom crimson accent ribbon */}
      <path d="M 6,36 L 38,36 A 6,6 0 0,1 32,42 L 12,42 A 6,6 0 0,1 6,36 Z" fill="#CE1126" />
      {/* 8-Ray Philippine Sun Starburst */}
      <polygon
        points="22,7 24.8,17.2 35,20 24.8,22.8 22,33 19.2,22.8 9,20 19.2,17.2"
        fill="#FCD116"
      />
      <polygon
        points="13,11 20,18 27,11 24,20 31,27 22,24 13,27 18,20"
        fill="#FCD116"
        opacity="0.85"
      />
      <circle cx="22" cy="20" r="4.5" fill="#FFFFFF" />
      <circle cx="22" cy="20" r="2.5" fill="#0038A8" />
    </svg>
  );
});

/**
 * Clean eGovPH-style Elevated Surface Card.
 */
export function Pop({
  children,
  onClick,
  className,
  style,
  bg = "#FFFFFF",
  radius = 16,
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
        "relative overflow-hidden transition-all duration-200",
        interactive &&
          "hover:-translate-y-0.5 hover:border-[#93C5FD] hover:shadow-lg active:translate-y-0",
        className,
      )}
      style={{
        backgroundColor: bg,
        borderRadius: radius,
        borderWidth: 1,
        borderStyle: "solid",
        borderColor: isDarkBg ? "rgba(255, 255, 255, 0.22)" : "#E2E8F0",
        boxShadow: "0 4px 18px -2px rgba(15, 23, 42, 0.05)",
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
      radius={12}
      ariaLabel={ariaLabel ?? (sub ? `${label} (${sub})` : label)}
      className={cn(
        "inline-flex min-h-[42px] items-center justify-center px-4 py-2 text-center",
        className,
      )}
    >
      <span
        className="text-[13px] font-bold leading-tight sm:text-[14px]"
        style={{ fontFamily: F.bold, color: textColor }}
      >
        {label}
      </span>
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
    className="inline-flex min-h-[36px] shrink-0 cursor-pointer items-center justify-center rounded-full px-4 py-1.5 text-[13px] font-semibold transition-all focus-visible:outline-2 focus-visible:outline-offset-2"
    style={{
      fontFamily: F.body,
      borderWidth: 1,
      borderStyle: "solid",
      borderColor: on ? color : "#CBD5E1",
      backgroundColor: on ? color : "#FFFFFF",
      color: on ? onColor(color) : C.ink,
      boxShadow: on ? "0 2px 8px rgba(0, 56, 168, 0.18)" : "none",
    }}
  >
    {label}
  </button>
);

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
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      ) : (
        <Banig color={cat.deep} seed={seed} />
      )}
    </div>
  );
}

/**
 * Collectible Official Travel Stamp Seal.
 */
export function Stamp({
  destination,
  label,
  size = 120,
  tilt = -4,
  animateIn = false,
}: {
  destination: Pick<Destination, "name" | "province" | "category">;
  label: string;
  size?: number;
  tilt?: number;
  animateIn?: boolean;
}) {
  const cat = getCategoryMeta(destination.category);
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

  const t = Math.max(9, size * 0.085);

  return (
    <div
      role="img"
      aria-label={`Passport stamp for ${destination.name} (${destination.province}): ${label}`}
      className="relative flex select-none items-center justify-center"
      style={{
        width: size,
        height: size,
        transform: settled ? `scale(1) rotate(${tilt}deg)` : `scale(1.4) rotate(${tilt - 12}deg)`,
        transition: animateIn ? "transform 250ms cubic-bezier(0.22, 1, 0.36, 1)" : undefined,
      }}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 120 120"
        className="pointer-events-none absolute inset-0"
        aria-hidden="true"
      >
        {cat.stampShape === "octagon" && (
          <g>
            <polygon
              points="35,6 85,6 114,35 114,85 85,114 35,114 6,85 6,35"
              fill={inkColor}
              fillOpacity="0.08"
              stroke={inkColor}
              strokeWidth="2.8"
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
              fillOpacity="0.08"
              stroke={inkColor}
              strokeWidth="2.8"
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
              rx="12"
              fill={inkColor}
              fillOpacity="0.08"
              stroke={inkColor}
              strokeWidth="2.8"
            />
            <rect
              x="13"
              y="19"
              width="94"
              height="82"
              rx="8"
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
              fillOpacity="0.08"
              stroke={inkColor}
              strokeWidth="2.8"
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
      </svg>

      <div
        className="relative z-10 flex flex-col items-center justify-center text-center"
        style={{ width: size * 0.72, color: inkColor }}
      >
        <span
          className="font-bold uppercase tracking-[0.14em] leading-none"
          style={{ fontFamily: F.mono, fontSize: Math.max(8, t * 0.76) }}
        >
          ★ {destination.province} ★
        </span>

        <span
          className="my-1.5 line-clamp-2 font-extrabold leading-tight"
          style={{
            fontFamily: F.display,
            fontSize: t * 1.05,
            lineHeight: `${t * 1.1}px`,
          }}
        >
          {destination.name}
        </span>

        <span
          className="rounded-full px-2 py-0.5 font-bold uppercase tracking-[0.08em] text-white leading-none"
          style={{
            fontFamily: F.mono,
            fontSize: Math.max(7.5, t * 0.72),
            backgroundColor: inkColor,
          }}
        >
          {label === "✓" ? "VERIFIED" : `QUIZ ${label}`}
        </span>
      </div>
    </div>
  );
}

/**
 * Clean eGovPH-Style Place Card for the Places list.
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

  return (
    <Pop
      onClick={onClick}
      ariaLabel={`${destination.name}, ${destination.province}`}
      className="group flex items-center gap-4 p-3 sm:p-4"
    >
      <div className="relative h-22 w-28 shrink-0 overflow-hidden rounded-xl sm:h-24 sm:w-36">
        <Cover destination={destination} className="h-full w-full" />
        {done ? (
          <span
            className="absolute top-1.5 left-1.5 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold text-white shadow-xs"
            style={{ backgroundColor: C.green }}
          >
            <Check className="size-3" /> Stamped
          </span>
        ) : null}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span
            className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold"
            style={{
              fontFamily: F.body,
              backgroundColor: `${cat.color}14`,
              color: cat.deep,
            }}
          >
            <Compass className="size-3" /> {cat.en}
          </span>
          {quizBest && quizBest.total > 0 ? (
            <span
              className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold"
              style={{
                backgroundColor: "#FEF3C7",
                color: "#B45309",
              }}
            >
              <Sparkles className="size-3" /> Quiz {quizBest.best}/{quizBest.total}
            </span>
          ) : null}
        </div>

        <h3
          className="mt-1.5 truncate text-[17px] font-bold leading-snug group-hover:text-[#0038A8] sm:text-[19px]"
          style={{ fontFamily: F.display, color: C.ink }}
        >
          {destination.name}
        </h3>

        <p
          className="mt-1 inline-flex items-center gap-1 truncate text-[13px]"
          style={{ fontFamily: F.body, color: C.mute }}
        >
          <MapPin className="size-3.5 shrink-0 text-[#0038A8]" /> {destination.address},{" "}
          {destination.province}
        </p>
      </div>

      <div
        className="hidden shrink-0 items-center gap-1 rounded-full bg-[#EFF6FF] px-4 py-2 text-[13px] font-bold text-[#0038A8] transition-colors group-hover:bg-[#0038A8] group-hover:text-white sm:inline-flex"
        style={{ fontFamily: F.body }}
      >
        Explore →
      </div>
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
  <div className="mb-4 flex items-center gap-3 py-2">
    {onBack ? (
      <button
        type="button"
        onClick={onBack}
        aria-label="Go back"
        className="flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-xl border border-[#E2E8F0] bg-white transition-colors hover:bg-[#EFF6FF]"
        style={{
          fontFamily: F.body,
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
          className="truncate text-[22px] font-extrabold leading-tight sm:text-[26px]"
          style={{ fontFamily: F.display, color: C.ink }}
        >
          {title}
        </h1>
      ) : null}
    </div>
    {right}
  </div>
);
