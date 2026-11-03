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
    className={cn("block text-[13px] font-bold leading-snug", className)}
    style={{ fontFamily: F.bold, color: C.mute, ...style }}
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
  <div className={cn("mt-7 mb-3 flex items-end justify-between gap-4", className)}>
    <div>
      <h2
        className="text-[22px] leading-tight sm:text-2xl"
        style={{ fontFamily: F.display, color: C.ink }}
      >
        {fil}
      </h2>
      <Label>{en}</Label>
    </div>
    {right}
  </div>
);

/**
 * M1.6: Woven-mat (banig) pattern: stepped concentric diamonds, unique per seed.
 * Wrapped in React.memo for smooth scrolling in long lists.
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
  const s = 16;
  const cleanSeed = Math.max(1, Math.abs(Math.floor(seed)));
  const P = 6 + (cleanSeed % 3) * 2;
  const ox = cleanSeed % P;
  const oy = (cleanSeed * 3) % P;
  const rects: React.ReactNode[] = [];

  for (let r = 0; r < 12; r++) {
    for (let c = 0; c < 22; c++) {
      const d = Math.abs(((c + ox) % P) - P / 2) + Math.abs(((r + oy) % P) - P / 2);
      const k = d % 3;
      if (k === 2) continue;
      rects.push(
        <rect
          key={r * 30 + c}
          x={c * s}
          y={r * s}
          width={s}
          height={s}
          fill={k ? C.ink : "#FFFFFF"}
          opacity={k ? 0.3 : 0.9}
        />,
      );
    }
  }

  return (
    <svg
      className={cn("h-full w-full block select-none", className)}
      viewBox="0 0 352 192"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
    >
      <rect width="352" height="192" fill={color} />
      {rects}
    </svg>
  );
});

/**
 * Four diamonds in the four primaries: the Sulyap mark.
 */
export const Mark = React.memo(function Mark({ size = 36 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      aria-label="Sulyap four-diamond emblem"
      role="img"
      className="shrink-0"
    >
      <polygon points="20,1 29,10 20,19 11,10" fill={C.blue} stroke={C.ink} strokeWidth="1.2" />
      <polygon points="39,20 30,29 21,20 30,11" fill={C.red} stroke={C.ink} strokeWidth="1.2" />
      <polygon points="20,39 11,30 20,21 29,30" fill={C.gold} stroke={C.ink} strokeWidth="1.2" />
      <polygon points="1,20 10,11 19,20 10,29" fill={C.green} stroke={C.ink} strokeWidth="1.2" />
    </svg>
  );
});

/**
 * A "printed" card: 2px ink outline, hard offset shadow, presses down when tapped.
 * Includes M1.5 unclipped offset shadow margin and M1.11 accessibility attributes.
 */
export function Pop({
  children,
  onClick,
  className,
  style,
  bg = C.card,
  depth = 4,
  radius = 10,
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

  const content = (
    <div
      className="relative"
      style={{
        marginRight: depth,
        marginBottom: depth,
      }}
    >
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          top: depth,
          left: depth,
          right: -depth,
          bottom: -depth,
          backgroundColor: C.ink,
          borderRadius: radius,
        }}
      />
      <div
        className={cn("relative overflow-hidden transition-transform duration-75", className)}
        style={{
          backgroundColor: bg,
          borderRadius: radius,
          borderWidth: 2,
          borderStyle: "solid",
          borderColor: C.ink,
          transform:
            pressed && interactive ? `translate(${depth}px, ${depth}px)` : "translate(0px, 0px)",
          ...style,
        }}
      >
        {children}
      </div>
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
        style={{ outlineColor: C.blue }}
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
  color = C.blue,
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
      ariaLabel={ariaLabel ?? (sub ? `${label} (${sub})` : label)}
      className={cn(
        "flex min-h-[46px] flex-col items-center justify-center px-4 py-3 text-center",
        className,
      )}
    >
      <span
        className="text-[16px] font-bold leading-tight"
        style={{ fontFamily: F.bold, color: textColor }}
      >
        {label}
      </span>
      {sub ? (
        <span
          className="mt-0.5 text-[12px] font-medium leading-tight"
          style={{ fontFamily: F.body, color: textColor, opacity: 0.9 }}
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
  color = C.ink,
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
    className="inline-flex min-h-[42px] shrink-0 cursor-pointer items-center justify-center rounded-full px-4 py-2 text-[14px] font-bold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2"
    style={{
      fontFamily: F.bold,
      borderWidth: 2,
      borderStyle: "solid",
      borderColor: C.ink,
      backgroundColor: on ? color : C.card,
      color: on ? onColor(color) : C.ink,
    }}
  >
    {label}
  </button>
);

/**
 * Renders the destination's cover image if available and loadable;
 * otherwise renders the woven Banig pattern in the category's signature color.
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
      style={{ backgroundColor: cat.color, ...style }}
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
        <Banig color={cat.color} seed={seed} />
      )}
    </div>
  );
}

/**
 * Passport stamp (selyo) — M5.4 supports the single motion moment when earned:
 * scales from 1.4 to 1 and settles its tilt over ~250ms (respecting prefers-reduced-motion).
 */
export function Stamp({
  destination,
  label,
  size = 112,
  tilt = -6,
  animateIn = false,
}: {
  destination: Pick<Destination, "name" | "province" | "category">;
  label: string;
  size?: number;
  tilt?: number;
  animateIn?: boolean;
}) {
  const cat = getCategoryMeta(destination.category);
  const t = Math.max(9.5, size * 0.095);
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

  return (
    <div
      role="img"
      aria-label={`Passport stamp for ${destination.name} (${destination.province}): ${label}`}
      className="relative flex select-none items-center justify-center"
      style={{
        width: size,
        height: size,
        transform: settled ? `scale(1) rotate(${tilt}deg)` : `scale(1.4) rotate(${tilt - 14}deg)`,
        transition: animateIn ? "transform 250ms cubic-bezier(0.22, 1, 0.36, 1)" : undefined,
      }}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        className="pointer-events-none absolute inset-0"
        aria-hidden="true"
      >
        <circle cx="50" cy="50" r="47" stroke={cat.color} strokeWidth="3.5" fill={C.card} />
        <circle
          cx="50"
          cy="50"
          r="41"
          stroke={cat.color}
          strokeWidth="1.5"
          strokeDasharray="2.5 3"
          fill="none"
        />
      </svg>
      <div
        className="relative z-10 flex flex-col items-center justify-center text-center"
        style={{ width: size * 0.66 }}
      >
        <span
          className="font-bold leading-none"
          style={{ fontFamily: F.bold, fontSize: t * 0.85, color: C.ink }}
        >
          {destination.province}
        </span>
        <span
          className="mt-1 line-clamp-2 font-bold"
          style={{
            fontFamily: F.bold,
            fontSize: t,
            lineHeight: `${t * 1.15}px`,
            color: C.ink,
          }}
        >
          {destination.name}
        </span>
        <span
          className="mt-1 leading-none"
          style={{
            fontFamily: F.display,
            fontSize: t * 1.45,
            color: cat.deep,
          }}
        >
          {label}
        </span>
      </div>
    </div>
  );
}

/**
 * Ticket-stub list card (Browse.js Ticket) with M1.4 & M5.3 fixes:
 * - 64px left Banig stub with rotated province badge fitting 8-char provinces ("Batangas")
 * - SVG/CSS dashed divider and circular punch notches aligned at the 64px stub boundary
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
  const seed = seedFromId(destination.slug || destination.id);

  return (
    <Pop
      onClick={onClick}
      ariaLabel={`${destination.name}, ${destination.province}, ${cat.fil} (${destination.category})${done ? ", Stamped" : ""}`}
      className="flex min-h-[124px] flex-row items-stretch"
    >
      {/* Left 64px Ticket Stub */}
      <div className="relative w-16 shrink-0 overflow-hidden">
        <Banig color={cat.color} seed={seed} />
        <div className="absolute inset-0 flex items-center justify-center">
          <span
            className="w-24 truncate py-0.5 text-center text-[13px] font-bold"
            style={{
              fontFamily: F.bold,
              transform: "rotate(-90deg)",
              backgroundColor: cat.color,
              color: onColor(cat.color),
              borderTop: `1.5px solid ${C.ink}`,
              borderBottom: `1.5px solid ${C.ink}`,
            }}
          >
            {destination.province}
          </span>
        </div>
      </div>

      {/* Ticket Body with Dashed Perforation */}
      <div
        className="flex flex-1 flex-col justify-center p-3.5 pl-4"
        style={{
          borderLeftWidth: 2,
          borderLeftStyle: "dashed",
          borderLeftColor: C.ink,
        }}
      >
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="text-[13px] font-bold" style={{ fontFamily: F.bold, color: cat.deep }}>
            {cat.fil} / {destination.category}
          </span>
          <div className="flex items-center gap-1.5">
            {done ? (
              <span
                className="inline-flex items-center rounded-full px-2 py-0.5 text-[12px] font-bold"
                style={{
                  fontFamily: F.bold,
                  backgroundColor: C.green,
                  color: "#FFFFFF",
                }}
              >
                ✓ Stamped
              </span>
            ) : null}
            {quizBest && quizBest.total > 0 ? (
              <span
                className="inline-flex items-center rounded-full px-2 py-0.5 text-[12px] font-bold"
                style={{
                  fontFamily: F.bold,
                  backgroundColor: C.gold,
                  color: C.ink,
                }}
              >
                Quiz {quizBest.best}/{quizBest.total}
              </span>
            ) : null}
          </div>
        </div>

        <h3
          className="my-1 text-[19px] leading-[23px] sm:text-[21px] sm:leading-[25px]"
          style={{ fontFamily: F.display, color: C.ink }}
        >
          {destination.name}
        </h3>

        <p
          className="line-clamp-2 text-[13px] leading-[18px]"
          style={{ fontFamily: F.body, color: C.mute }}
        >
          {destination.address}, {destination.province}
        </p>
      </div>

      {/* Ticket Perforation Notches aligned at x = 64px (left: 55px, width: 18px) */}
      <span
        aria-hidden="true"
        style={{
          position: "absolute",
          left: 55,
          top: -11,
          width: 18,
          height: 18,
          borderRadius: 9,
          backgroundColor: C.paper,
          borderWidth: 2,
          borderStyle: "solid",
          borderColor: C.ink,
        }}
      />
      <span
        aria-hidden="true"
        style={{
          position: "absolute",
          left: 55,
          bottom: -11,
          width: 18,
          height: 18,
          borderRadius: 9,
          backgroundColor: C.paper,
          borderWidth: 2,
          borderStyle: "solid",
          borderColor: C.ink,
        }}
      />
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
  <div className="flex items-center gap-3 py-3">
    {onBack ? (
      <button
        type="button"
        onClick={onBack}
        aria-label="Go back"
        className="flex size-11 shrink-0 cursor-pointer items-center justify-center rounded-[10px] transition-colors hover:bg-[#E9E4D4]"
        style={{
          borderWidth: 2,
          borderStyle: "solid",
          borderColor: C.ink,
          backgroundColor: C.card,
          fontFamily: F.bold,
          fontSize: 20,
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
          className="truncate text-[24px] leading-tight sm:text-[28px]"
          style={{ fontFamily: F.display, color: C.ink }}
        >
          {title}
        </h1>
      ) : null}
    </div>
    {right}
  </div>
);
