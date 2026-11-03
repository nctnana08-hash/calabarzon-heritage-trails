import React, { useEffect, useState } from "react";
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
    className={cn("block text-[12px] font-medium tracking-[0.04em] leading-snug", className)}
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
  <div className={cn("mt-8 mb-4 flex items-baseline justify-between gap-4", className)}>
    <div>
      <h2
        className="text-[22px] font-bold leading-tight sm:text-[25px]"
        style={{ fontFamily: F.display, color: C.ink }}
      >
        {fil}
      </h2>
      {en ? <Label className="mt-0.5">{en}</Label> : null}
    </div>
    {right}
  </div>
);

/**
 * Subtle engraved passport watermark pattern for fallback covers.
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
      <g transform="translate(180, 100)" fill="none" stroke="#FCF9F0" opacity="0.22">
        <circle r={32 + ringOffset} strokeWidth="1" strokeDasharray="3 3" />
        <circle r={48 + ringOffset} strokeWidth="0.8" />
        <polygon points="0,-24 6,-6 24,0 6,6 0,24 -6,6 -24,0 -6,-6" strokeWidth="1" />
      </g>
    </svg>
  );
});

/**
 * Minimal Gold-Foil Passport Compass Emblem.
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
      <polygon
        points="14,2 30,2 42,14 42,30 30,42 14,42 2,30 2,14"
        fill={C.cover}
        stroke={C.foil}
        strokeWidth="1.8"
      />
      <polygon points="22,8 25,18 35,22 25,26 22,36 19,26 9,22 19,18" fill={C.foil} />
      <circle cx="22" cy="22" r="3" fill={C.cover} stroke={C.foil} strokeWidth="1.2" />
    </svg>
  );
});

/**
 * Clean Surface Card.
 */
export function Pop({
  children,
  onClick,
  className,
  style,
  bg = C.card,
  radius = 12,
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
        "relative overflow-hidden transition-all duration-150",
        interactive && "hover:-translate-y-0.5 hover:shadow-md",
        className,
      )}
      style={{
        backgroundColor: bg,
        borderRadius: radius,
        borderWidth: 1,
        borderStyle: "solid",
        borderColor: isDarkBg ? "rgba(212, 175, 55, 0.35)" : "#DED5C0",
        boxShadow: "0 2px 8px rgba(30, 35, 42, 0.04)",
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
      radius={8}
      ariaLabel={ariaLabel ?? (sub ? `${label} (${sub})` : label)}
      className={cn(
        "flex min-h-[42px] flex-col items-center justify-center px-4 py-2.5 text-center",
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
    className="inline-flex min-h-[36px] shrink-0 cursor-pointer items-center justify-center rounded-full px-3.5 py-1.5 text-[13px] font-medium transition-all focus-visible:outline-2 focus-visible:outline-offset-2"
    style={{
      fontFamily: F.body,
      borderWidth: 1,
      borderStyle: "solid",
      borderColor: on ? color : "#D5CBB4",
      backgroundColor: on ? color : C.card,
      color: on ? onColor(color) : C.ink,
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
          className="h-full w-full object-cover"
        />
      ) : (
        <Banig color={cat.deep} seed={seed} />
      )}
    </div>
  );
}

/**
 * Clean Rubber Ink Passport Stamp.
 * Distinct shape per category, showing only Province, Site Name, and Visited/Score status.
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
              fillOpacity="0.06"
              stroke={inkColor}
              strokeWidth="2.5"
            />
            <polygon
              points="38,11 82,11 109,38 109,82 82,109 38,109 11,82 11,38"
              fill="none"
              stroke={inkColor}
              strokeWidth="1"
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
              strokeWidth="2.5"
            />
            <path
              d="M 19,107 L 19,50 A 41,41 0 0,1 101,50 L 101,107 Z"
              fill="none"
              stroke={inkColor}
              strokeWidth="1"
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
              strokeWidth="2.5"
            />
            <rect
              x="13"
              y="19"
              width="94"
              height="82"
              rx="5"
              fill="none"
              stroke={inkColor}
              strokeWidth="1"
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
              strokeWidth="2.5"
            />
            <circle
              cx="60"
              cy="60"
              r="47"
              fill="none"
              stroke={inkColor}
              strokeWidth="1"
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
          className="font-semibold uppercase tracking-[0.12em] leading-none"
          style={{ fontFamily: F.mono, fontSize: Math.max(8, t * 0.78) }}
        >
          {destination.province}
        </span>

        <span
          className="my-1.5 line-clamp-2 font-bold leading-tight"
          style={{
            fontFamily: F.display,
            fontSize: t * 1.15,
            lineHeight: `${t * 1.12}px`,
          }}
        >
          {destination.name}
        </span>

        <span
          className="rounded-xs border px-1.5 py-0.5 font-bold uppercase tracking-[0.08em] leading-none"
          style={{
            fontFamily: F.mono,
            fontSize: Math.max(7.5, t * 0.74),
            borderColor: inkColor,
          }}
        >
          {label === "✓" ? "STAMPED" : label}
        </span>
      </div>
    </div>
  );
}

/**
 * Minimal Destination Row Card.
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
      className="flex items-center gap-4 p-3 sm:p-4"
    >
      <Cover destination={destination} className="h-20 w-24 shrink-0 rounded-lg sm:h-22 sm:w-28" />

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span
            className="text-[12px] font-semibold"
            style={{ fontFamily: F.body, color: cat.deep }}
          >
            {destination.province} · {cat.fil}
          </span>
          {done ? (
            <span
              className="rounded-full px-2 py-0.5 text-[11px] font-semibold"
              style={{
                fontFamily: F.body,
                backgroundColor: "rgba(35, 99, 67, 0.12)",
                color: C.green,
              }}
            >
              ✓ Stamped
            </span>
          ) : null}
          {quizBest && quizBest.total > 0 ? (
            <span
              className="rounded-full px-2 py-0.5 text-[11px] font-medium"
              style={{
                fontFamily: F.body,
                backgroundColor: C.sand,
                color: C.ink,
              }}
            >
              {quizBest.best}/{quizBest.total}
            </span>
          ) : null}
        </div>

        <h3
          className="mt-0.5 truncate text-[19px] font-bold leading-snug sm:text-[21px]"
          style={{ fontFamily: F.display, color: C.ink }}
        >
          {destination.name}
        </h3>

        <p className="mt-0.5 truncate text-[13px]" style={{ fontFamily: F.body, color: C.mute }}>
          {destination.address}
        </p>
      </div>

      <span
        className="hidden pr-1 text-[18px] sm:inline-block"
        style={{ color: C.mute }}
        aria-hidden="true"
      >
        →
      </span>
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
  <div className="mb-3 flex items-center gap-3 py-2">
    {onBack ? (
      <button
        type="button"
        onClick={onBack}
        aria-label="Go back"
        className="flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-lg border transition-colors hover:bg-[#EAE2CE]"
        style={{
          borderColor: "#D5CBB4",
          backgroundColor: C.card,
          fontFamily: F.body,
          fontSize: 16,
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
          className="truncate text-[22px] font-bold leading-tight sm:text-[26px]"
          style={{ fontFamily: F.display, color: C.ink }}
        >
          {title}
        </h1>
      ) : null}
    </div>
    {right}
  </div>
);
