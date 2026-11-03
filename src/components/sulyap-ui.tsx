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
    className={cn("block text-[12px] font-semibold tracking-wide uppercase", className)}
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
      <h2
        className="text-[24px] font-bold tracking-tight leading-tight sm:text-[28px]"
        style={{ fontFamily: F.display, color: C.ink }}
      >
        {fil}
      </h2>
      {en ? (
        <p className="mt-0.5 text-[13px]" style={{ fontFamily: F.body, color: C.mute }}>
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

  // Rich tropical sunset/heritage sky palettes based on category color
  const isRed = color === C.red || color === "#801F20";
  const isBlue = color === C.blue || color === "#163B68";
  const isGold = color === C.gold || color === "#8F6200";

  const skyTop = isRed ? "#7C1D24" : isBlue ? "#143A66" : isGold ? "#6E4B0A" : "#134B36";
  const skyBottom = isRed ? "#D96B43" : isBlue ? "#3B7EA1" : isGold ? "#D49B35" : "#429E6D";
  const hillBack = isRed ? "#59151B" : isBlue ? "#102E52" : isGold ? "#523707" : "#0E3828";
  const hillFront = "#1B1F26";

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

      {/* Glowing Sun / Moon */}
      <circle cx={sunX} cy="62" r="28" fill="#FCE79C" opacity="0.9" />
      <circle cx={sunX} cy="62" r="42" fill="#FCE79C" opacity="0.2" />

      {/* Distant Clouds / Rays */}
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
          {/* Glowing Capiz windows */}
          <rect x="24" y="58" width="16" height="20" rx="2" fill="#FCE79C" opacity="0.85" />
          <rect x="46" y="58" width="16" height="20" rx="2" fill="#FCE79C" opacity="0.85" />
          <rect x="68" y="58" width="16" height="20" rx="2" fill="#FCE79C" opacity="0.85" />
          <rect x="90" y="58" width="16" height="20" rx="2" fill="#FCE79C" opacity="0.85" />
        </g>
      )}

      {isBlue && (
        /* Colonial Basilica / Bell Tower Silhouette */
        <g fill={hillFront} transform="translate(110, 62)">
          <polygon points="20,56 65,24 110,56" />
          <rect x="26" y="56" width="78" height="64" />
          <rect x="108" y="32" width="26" height="88" />
          <polygon points="105,32 121,12 137,32" />
          <line x1="65" y1="10" x2="65" y2="24" stroke="#FCE79C" strokeWidth="2.5" />
          <line x1="59" y1="16" x2="71" y2="16" stroke="#FCE79C" strokeWidth="2.5" />
          <circle cx="65" cy="46" r="8" fill="#FCE79C" opacity="0.85" />
          <path d="M55,120 L55,88 A10,10 0 0,1 75,88 L75,120 Z" fill="#FCE79C" opacity="0.8" />
        </g>
      )}

      {isGold && (
        /* Museum / Archival Gallery Colonnade */
        <g fill={hillFront} transform="translate(100, 82)">
          <polygon points="0,38 80,6 160,38" />
          <rect x="8" y="38" width="144" height="8" />
          <rect x="16" y="46" width="128" height="58" />
          <rect x="30" y="56" width="18" height="36" rx="9" fill="#FCE79C" opacity="0.85" />
          <rect x="71" y="56" width="18" height="36" rx="9" fill="#FCE79C" opacity="0.85" />
          <rect x="112" y="56" width="18" height="36" rx="9" fill="#FCE79C" opacity="0.85" />
        </g>
      )}

      {!isRed && !isBlue && !isGold && (
        /* Volcano / Waterfall / Mountain Peak Silhouette */
        <g>
          <polygon points="65,185 165,72 205,72 295,185" fill={hillBack} />
          {variant % 2 === 0 ? (
            /* Waterfall cascade */
            <path d="M 178,72 L 192,72 L 204,185 L 168,185 Z" fill="#E2F7EE" opacity="0.75" />
          ) : (
            /* Crater plume */
            <circle cx="185" cy="56" r="16" fill="#FFFFFF" opacity="0.35" />
          )}
        </g>
      )}

      {/* Foreground Horizon */}
      <path d="M 0,175 Q 110,152 230,172 T 360,165 L 360,220 L 0,220 Z" fill={hillFront} />
    </svg>
  );
});

/**
 * Vibrant Compass & Stamp Emblem.
 */
export const Mark = React.memo(function Mark({ size = 34 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 44 44"
      aria-label="Sulyap emblem"
      role="img"
      className="shrink-0"
    >
      <rect
        x="2"
        y="2"
        width="40"
        height="40"
        rx="12"
        fill={C.cover}
        stroke={C.foil}
        strokeWidth="2"
      />
      <polygon
        points="22,7 25.5,18.5 37,22 25.5,25.5 22,37 18.5,25.5 7,22 18.5,18.5"
        fill={C.foil}
      />
      <circle cx="22" cy="22" r="3.5" fill={C.cover} />
    </svg>
  );
});

/**
 * Modern Interactive Surface Card.
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
        interactive && "hover:-translate-y-1 hover:shadow-lg active:translate-y-0",
        className,
      )}
      style={{
        backgroundColor: bg,
        borderRadius: radius,
        borderWidth: 1,
        borderStyle: "solid",
        borderColor: isDarkBg ? "rgba(212, 175, 55, 0.35)" : "#E6DFCE",
        boxShadow: "0 4px 14px rgba(30, 35, 42, 0.06)",
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
        "inline-flex min-h-[44px] items-center justify-center px-5 py-2.5 text-center",
        className,
      )}
    >
      <span
        className="text-[14px] font-semibold leading-tight"
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
    className="inline-flex min-h-[38px] shrink-0 cursor-pointer items-center justify-center rounded-full px-4 py-1.5 text-[13px] font-semibold transition-all focus-visible:outline-2 focus-visible:outline-offset-2"
    style={{
      fontFamily: F.body,
      borderWidth: 1,
      borderStyle: "solid",
      borderColor: on ? color : "#DED5C0",
      backgroundColor: on ? color : "#FFFFFF",
      color: on ? onColor(color) : C.ink,
      boxShadow: on ? "0 2px 6px rgba(30,35,42,0.12)" : "none",
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
 * Collectible Rubber Ink Stamp Badge.
 */
export function Stamp({
  destination,
  label,
  size = 120,
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
              fillOpacity="0.08"
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
              rx="10"
              fill={inkColor}
              fillOpacity="0.08"
              stroke={inkColor}
              strokeWidth="3"
            />
            <rect
              x="13"
              y="19"
              width="94"
              height="82"
              rx="6"
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
      </svg>

      <div
        className="relative z-10 flex flex-col items-center justify-center text-center"
        style={{ width: size * 0.72, color: inkColor }}
      >
        <span
          className="font-bold uppercase tracking-[0.14em] leading-none"
          style={{ fontFamily: F.mono, fontSize: Math.max(8, t * 0.78) }}
        >
          ★ {destination.province} ★
        </span>

        <span
          className="my-1.5 line-clamp-2 font-bold leading-tight"
          style={{
            fontFamily: F.display,
            fontSize: t * 1.16,
            lineHeight: `${t * 1.12}px`,
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
          {label === "✓" ? "VISITED" : `QUIZ ${label}`}
        </span>
      </div>
    </div>
  );
}

/**
 * Visual Place Card for the Places list.
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
            className="inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-semibold"
            style={{
              fontFamily: F.body,
              backgroundColor: `${cat.color}18`,
              color: cat.deep,
            }}
          >
            <Compass className="size-3" /> {cat.en}
          </span>
          {quizBest && quizBest.total > 0 ? (
            <span
              className="inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-semibold"
              style={{
                backgroundColor: "#FEF3C7",
                color: "#92400E",
              }}
            >
              <Sparkles className="size-3" /> Quiz {quizBest.best}/{quizBest.total}
            </span>
          ) : null}
        </div>

        <h3
          className="mt-1.5 truncate text-[19px] font-bold leading-snug sm:text-[22px]"
          style={{ fontFamily: F.display, color: C.ink }}
        >
          {destination.name}
        </h3>

        <p
          className="mt-1 inline-flex items-center gap-1 truncate text-[13px]"
          style={{ fontFamily: F.body, color: C.mute }}
        >
          <MapPin className="size-3.5 shrink-0" /> {destination.address}, {destination.province}
        </p>
      </div>

      <div
        className="hidden shrink-0 items-center gap-1 rounded-full px-3.5 py-2 text-[13px] font-semibold transition-colors group-hover:bg-[#4A181B] group-hover:text-white sm:inline-flex"
        style={{
          fontFamily: F.body,
          backgroundColor: C.paper,
          color: C.cover,
        }}
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
        className="flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-xl border bg-white transition-colors hover:bg-[#F6F1E3]"
        style={{
          borderColor: "#E0D7C3",
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
