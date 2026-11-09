import { useEffect, useMemo, useState } from "react";
import { Award, CheckCircle2, ChevronLeft, ChevronRight, RotateCw } from "lucide-react";
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
import { ARTWORK_HD_PLATES, getArtPieceHdImage, getArtPieces360 } from "@/lib/sulyap-art-360";
import {
  getEnrichment,
  getQuestionsForDestination,
  markToured,
  saveScore,
} from "@/lib/sulyap-data";
import { C, F, conciseText, getCategoryMeta } from "@/lib/sulyap-theme";
import { KrpanoViewer } from "./krpano-viewer";
import { Btn, Label, Pop, Stamp } from "./sulyap-ui";

const STOPS = [
  {
    step: 1,
    id: "stop-1",
    sceneId: "grand16k" as const,
    title: "First Look",
    subtitle: "1F · 16K Grand Pavilion",
    ath: -91,
    atv: 9,
    fov: 54,
  },
  {
    step: 2,
    id: "stop-2",
    sceneId: "upstairs12k" as const,
    title: "Upstairs Story",
    subtitle: "2F · 12K Mezzanine",
    ath: -120,
    atv: 5,
    fov: 52,
  },
  {
    step: 3,
    id: "stop-3",
    sceneId: "rotunda" as const,
    title: "Why It Matters",
    subtitle: "East Wing · Stamp Hall",
    ath: -2,
    atv: 6,
    fov: 56,
  },
] as const;

export function SulyapTour({
  destination,
  onBack,
  onStartQuiz,
}: {
  destination: Destination;
  onBack: () => void;
  onStartQuiz: () => void;
}) {
  const [step, setStep] = useState<0 | 1 | 2>(0);
  const [activeSceneId, setActiveSceneId] = useState<
    "grand16k" | "salon12k" | "upstairs12k" | "rotunda" | "gallery"
  >("grand16k");
  const [expanded, setExpanded] = useState(false);
  const [done, setDone] = useState(false);
  const [targetView, setTargetView] = useState<{
    ath: number;
    atv: number;
    fov: number;
    sceneId: string;
    key: string;
  }>({
    ath: STOPS[0].ath,
    atv: STOPS[0].atv,
    fov: STOPS[0].fov,
    sceneId: STOPS[0].sceneId,
    key: "init-0",
  });

  const enrichment = getEnrichment(destination);
  const artPieces = useMemo(() => getArtPieces360(destination), [destination]);

  const goToStep = (nextStep: 0 | 1 | 2) => {
    setStep(nextStep);
    setExpanded(false);
    const s = STOPS[nextStep];
    setActiveSceneId(s.sceneId);
    setTargetView({
      ath: s.ath,
      atv: s.atv,
      fov: s.fov,
      sceneId: s.sceneId,
      key: `step-${nextStep}-${Date.now()}`,
    });
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" && step < 2) {
        goToStep((step + 1) as 0 | 1 | 2);
      } else if (e.key === "ArrowLeft" && step > 0) {
        goToStep((step - 1) as 0 | 1 | 2);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  const finishTour = () => {
    markToured(destination.id, destination.slug);
    setDone(true);
  };

  // 5 Connected Living Museum Rooms for the Guided Stamp Tour (16K Grand Pavilion + Restored 12K Salon + 2F Upstairs + Rotunda + Fine Arts)
  const tourScenes: KrpanoSceneConfig[] = useMemo(() => {
    const safeSlug = destination.slug.replace(/[^a-zA-Z0-9_]/g, "_");
    return [
      {
        id: "grand16k",
        name: `tour_${safeSlug}_grand16k`,
        shortLabel: "16K Grand Tour",
        floorLabel: "1F Pavilion (16K)",
        title: `${destination.name} — 1F Living Grand Pavilion (16,000 × 8,000)`,
        panoramaUrl: GRAND_16K_PANO_URL,
        ...GRAND_16K_TILES,
        initialHlookat: 0,
        initialVlookat: 1,
        initialFov: 74,
        floorPath: [
          { ath: -61, atv: -28, label: "Stop 1 · First Look", lookAtAth: -91, lookAtAtv: 9 },
          {
            ath: 0,
            atv: -31,
            label: "Climb Grand Staircase → Stop 2 (Upstairs) ↑",
            lookAtAth: 0,
            lookAtAtv: -6,
            targetSceneId: "upstairs12k",
          },
          {
            ath: 61,
            atv: -26,
            label: "East Arch → Rotunda (Stop 3) →",
            lookAtAth: 61,
            lookAtAtv: -15,
            targetSceneId: "rotunda",
          },
        ],
        hotspots: [
          {
            id: "stop-1",
            kind: "art",
            badge: "1",
            title: `Stop 1: ${destination.name}`,
            subtitle: "First Look · 16K Grand Pavilion",
            ath: -91,
            atv: 1,
            lookAtAth: STOPS[0].ath,
            lookAtAtv: STOPS[0].atv,
            fov: 42,
            pathOrder: 1,
            artDetails: {
              imageUrl: artPieces[0]
                ? getArtPieceHdImage(artPieces[0], destination.province, destination.slug)
                : ARTWORK_HD_PLATES.kawit,
              filTitle: artPieces[0]?.filTitle,
              artist: artPieces[0]?.artistOrMaker,
              period: artPieces[0]?.period ?? destination.province,
              medium: artPieces[0]?.medium ?? destination.category,
              dimensions: artPieces[0]?.dimensions,
              zone: "Stop 1 · 16K Grand Pavilion",
              province: destination.province,
              description: destination.description,
              conservationNote: artPieces[0]?.conservationNote,
              highlight: "Next: Click the 🪜 Grand Staircase to climb upstairs to Stop 2!",
            },
          },
          {
            id: "stairs-to-upstairs",
            kind: "stairs-up",
            badge: "🪜",
            title: "Grand Staircase → 2F Upstairs (Stop 2) ↑",
            subtitle: "Climb Upstairs",
            ath: 0,
            atv: -6,
            fov: 52,
            targetSceneId: "upstairs12k",
            arrivalView: { ath: -120, atv: 5, fov: 68 },
            pathOrder: 2,
          },
          {
            id: "door-to-salon12k",
            kind: "door",
            badge: "🚪",
            title: "← 12K Heritage Salon",
            subtitle: "Bahay na Bato Room",
            ath: -61,
            atv: -15,
            fov: 52,
            targetSceneId: "salon12k",
            arrivalView: { ath: 43, atv: -2, fov: 74 },
          },
          {
            id: "door-to-rotunda",
            kind: "door",
            badge: "🚪",
            title: "Rotunda Wing (Stop 3) →",
            subtitle: "Walk Through East Arch",
            ath: 61,
            atv: -15,
            fov: 52,
            targetSceneId: "rotunda",
            arrivalView: { ath: -2, atv: 6, fov: 68 },
            pathOrder: 3,
          },
        ],
      },
      {
        id: "salon12k",
        name: `tour_${safeSlug}_salon12k`,
        shortLabel: "12K Heritage Salon",
        floorLabel: "Bahay Salon (12K)",
        title: `${destination.name} — Bahay na Bato 12K Heritage Salon`,
        panoramaUrl: CALABARZON_12K_PANO_URL,
        ...SALON_12K_TILES,
        initialHlookat: 43,
        initialVlookat: -2,
        initialFov: 74,
        hotspots: [
          {
            id: "salon-flag-vitrine",
            kind: "art",
            badge: "★",
            title: artPieces[0]?.title ?? destination.name,
            subtitle: "Bahay na Bato 12K Salon",
            ath: 43,
            atv: -18,
            lookAtAth: 43,
            lookAtAtv: -4,
            fov: 42,
            artDetails: {
              imageUrl: artPieces[0]
                ? getArtPieceHdImage(artPieces[0], destination.province, destination.slug)
                : ARTWORK_HD_PLATES.kawit,
              filTitle: artPieces[0]?.filTitle,
              artist: artPieces[0]?.artistOrMaker,
              period: artPieces[0]?.period ?? destination.province,
              medium: artPieces[0]?.medium ?? destination.category,
              dimensions: artPieces[0]?.dimensions,
              zone: "Bahay na Bato 12K Salon",
              province: destination.province,
              description: destination.description,
              conservationNote: artPieces[0]?.conservationNote,
            },
          },
          {
            id: "salon-back-16k",
            kind: "door",
            badge: "🚪",
            title: "16K Grand Pavilion →",
            subtitle: "North Gallery Corridor",
            ath: -59,
            atv: -4,
            fov: 52,
            targetSceneId: "grand16k",
            arrivalView: { ath: 0, atv: 1, fov: 74 },
          },
          {
            id: "salon-upstairs",
            kind: "stairs-up",
            badge: "🪜",
            title: "Stairs → 2F Upstairs (Stop 2) ↑",
            subtitle: "Ascend to Mezzanine",
            ath: -6,
            atv: -8,
            fov: 52,
            targetSceneId: "upstairs12k",
            arrivalView: { ath: -120, atv: 5, fov: 68 },
          },
        ],
      },
      {
        id: "upstairs12k",
        name: `tour_${safeSlug}_upstairs12k`,
        shortLabel: "2F Upstairs",
        floorLabel: "2F Mezzanine (12K)",
        title: `${destination.name} — 2F Upstairs Mezzanine Sky Gallery`,
        panoramaUrl: UPSTAIRS_12K_PANO_URL,
        ...UPSTAIRS_12K_TILES,
        initialHlookat: -120,
        initialVlookat: 4,
        initialFov: 68,
        floorPath: [
          { ath: -120, atv: -24, label: "Stop 2 · Upstairs Story", lookAtAth: -120, lookAtAtv: 5 },
          {
            ath: 0,
            atv: -28,
            label: "Descend Stairs → 16K Pavilion ↓",
            lookAtAth: 0,
            lookAtAtv: -18,
            targetSceneId: "grand16k",
          },
        ],
        hotspots: [
          {
            id: "stop-2",
            kind: "art",
            badge: "2",
            title: `Stop 2: ${artPieces[1]?.title ?? "The Historical Story"}`,
            subtitle: "The Story · 2F Mezzanine",
            ath: -120,
            atv: -6,
            lookAtAth: STOPS[1].ath,
            lookAtAtv: STOPS[1].atv,
            fov: 40,
            pathOrder: 1,
            artDetails: {
              imageUrl: artPieces[1]
                ? getArtPieceHdImage(artPieces[1], destination.province, destination.slug)
                : ARTWORK_HD_PLATES.pahiyas,
              filTitle: artPieces[1]?.filTitle,
              artist: artPieces[1]?.artistOrMaker,
              period: artPieces[1]?.period ?? "Historical Archive",
              medium: artPieces[1]?.medium ?? "2F Mezzanine Centerpiece",
              dimensions: artPieces[1]?.dimensions,
              zone: "Stop 2 · 2F Upstairs 12K Mezzanine",
              province: destination.province,
              description: enrichment.history || destination.description,
              conservationNote: artPieces[1]?.conservationNote,
              highlight: "Next: Walk through the 🚪 Skybridge Door to reach Stop 3!",
            },
          },
          {
            id: "door-skybridge-rotunda",
            kind: "door",
            badge: "🚪",
            title: "Skybridge → Stop 3 (Claim Stamp) →",
            subtitle: "Enter Grand Rotunda",
            ath: 0,
            atv: 2,
            fov: 50,
            targetSceneId: "rotunda",
            arrivalView: { ath: -2, atv: 6, fov: 68 },
            pathOrder: 2,
          },
          {
            id: "stairs-down-atrium",
            kind: "stairs-down",
            badge: "🪜",
            title: "Descend Stairs → 16K Pavilion ↓",
            subtitle: "Go Downstairs",
            ath: 0,
            atv: -18,
            fov: 54,
            targetSceneId: "grand16k",
            arrivalView: { ath: 0, atv: 1, fov: 74 },
          },
        ],
      },
      {
        id: "rotunda",
        name: `tour_${safeSlug}_rotunda`,
        shortLabel: "Rotunda Wing",
        floorLabel: "1F East Wing",
        title: `${destination.name} — 1F East Wing: Grand Rotunda 360°`,
        panoramaUrl: DEFAULT_MUSEUM_PANO_URL,
        ...ROTUNDA_TILES,
        initialHlookat: -2,
        initialVlookat: 6,
        initialFov: 68,
        floorPath: [
          { ath: -2, atv: -22, label: "Stop 3 · Claim Stamp", lookAtAth: -2, lookAtAtv: 6 },
          {
            ath: 58,
            atv: -21,
            label: "Bonus Door → Fine Arts Hall →",
            lookAtAth: 58,
            lookAtAtv: -2,
            targetSceneId: "gallery",
          },
        ],
        hotspots: [
          {
            id: "stop-3",
            kind: "art",
            badge: "3",
            title: `Stop 3: ${artPieces[2]?.title ?? "Cultural Significance"}`,
            subtitle: "Why It Matters · Claim Stamp",
            ath: -2,
            atv: -10,
            lookAtAth: STOPS[2].ath,
            lookAtAtv: STOPS[2].atv,
            fov: 50,
            pathOrder: 1,
            artDetails: {
              imageUrl: artPieces[2]
                ? getArtPieceHdImage(artPieces[2], destination.province, destination.slug)
                : ARTWORK_HD_PLATES.monument,
              filTitle: artPieces[2]?.filTitle,
              artist: artPieces[2]?.artistOrMaker,
              period: artPieces[2]?.period ?? "Living Heritage",
              medium: artPieces[2]?.medium ?? "Monumental Exhibit",
              dimensions: artPieces[2]?.dimensions,
              zone: "Stop 3 · Grand Rotunda",
              province: destination.province,
              description: enrichment.significance || destination.description,
              conservationNote: artPieces[2]?.conservationNote,
              highlight: "You reached the final tour stop — click 'Collect My Stamp' below!",
            },
          },
          {
            id: "rotunda-to-gallery",
            kind: "door",
            badge: "🚪",
            title: "Bonus Wing → Fine Arts Hall →",
            subtitle: "Walk Through East Arch",
            ath: 58,
            atv: -2,
            fov: 54,
            targetSceneId: "gallery",
            arrivalView: { ath: -48, atv: 4, fov: 74 },
            pathOrder: 2,
          },
          {
            id: "rotunda-back-16k",
            kind: "door",
            badge: "🚪",
            title: "← Return to 16K Grand Pavilion",
            subtitle: "West Archway Door",
            ath: -62,
            atv: -2,
            fov: 54,
            targetSceneId: "grand16k",
            arrivalView: { ath: 0, atv: 1, fov: 74 },
          },
        ],
      },
      {
        id: "gallery",
        name: `tour_${safeSlug}_gallery`,
        shortLabel: "Fine Arts Hall",
        floorLabel: "1F West Wing",
        title: `${destination.name} — 1F West Wing: Fine Arts Hall 360°`,
        panoramaUrl: GALLERY_HALL_PANO_URL,
        ...GALLERY_TILES,
        initialHlookat: -48,
        initialVlookat: 4,
        initialFov: 68,
        hotspots: [
          {
            id: "gallery-art-bonus",
            kind: "art",
            badge: "★",
            title: artPieces[3]?.title ?? "Fine Arts Masterwork",
            subtitle: "Bonus Gallery Exhibit",
            ath: -48,
            atv: -7,
            lookAtAth: -48,
            lookAtAtv: 4,
            fov: 50,
            artDetails: {
              imageUrl: artPieces[3]
                ? getArtPieceHdImage(artPieces[3], destination.province, destination.slug)
                : ARTWORK_HD_PLATES.modernist,
              filTitle: artPieces[3]?.filTitle,
              artist: artPieces[3]?.artistOrMaker,
              period: artPieces[3]?.period ?? "Regional Masterwork",
              medium: artPieces[3]?.medium ?? "Oil on Canvas",
              dimensions: artPieces[3]?.dimensions,
              zone: "1F Fine Arts Wing",
              province: destination.province,
              description: artPieces[3]?.details ?? destination.description,
              conservationNote: artPieces[3]?.conservationNote,
            },
          },
          {
            id: "gallery-back-rotunda",
            kind: "door",
            badge: "🚪",
            title: "Return to Stamp Hall (Rotunda) →",
            subtitle: "Walk Through Iron Gate",
            ath: 90,
            atv: -2,
            fov: 54,
            targetSceneId: "rotunda",
            arrivalView: { ath: -2, atv: 6, fov: 68 },
          },
        ],
      },
    ];
  }, [
    destination.slug,
    destination.name,
    destination.province,
    destination.category,
    destination.description,
    enrichment.history,
    enrichment.significance,
    artPieces,
  ]);

  const activeText =
    step === 0
      ? destination.description
      : step === 1
        ? enrichment.history || destination.description
        : enrichment.significance || destination.description;

  const { short, hasMore } = conciseText(activeText, 2);

  return (
    <div className="mx-auto w-full max-w-4xl pb-8">
      {/* 360° Tour Waypoint Selector Bar */}
      <div className="mb-3 grid grid-cols-3 gap-2.5" role="tablist" aria-label="360 Tour stops">
        {STOPS.map((s, n) => {
          const active = step === n;
          const completed = n < step || done;
          const idx = n as 0 | 1 | 2;
          return (
            <button
              key={s.step}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => goToStep(idx)}
              className="flex cursor-pointer items-center gap-2.5 rounded-xl border p-3 text-left transition-all"
              style={{
                backgroundColor: active ? C.cover : completed ? "#ECFDF5" : "#FFFFFF",
                borderColor: active ? C.cover : completed ? "#6EE7B7" : "#E2E8F0",
                color: active ? "#FFFFFF" : C.ink,
              }}
            >
              <span
                className="flex size-7 shrink-0 items-center justify-center rounded-full text-[12px] font-extrabold"
                style={{
                  backgroundColor: active ? C.foil : completed ? C.green : C.paper,
                  color: active ? C.ink : completed ? "#FFFFFF" : C.ink,
                }}
              >
                {completed ? "✓" : s.step}
              </span>
              <div className="min-w-0">
                <div className="truncate text-[13px] font-bold" style={{ fontFamily: F.body }}>
                  {s.title}
                </div>
                <div
                  className="hidden truncate text-[11px] sm:block"
                  style={{ color: active ? "rgba(255,255,255,0.82)" : C.mute }}
                >
                  {s.subtitle}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Real Full 360°×180° Spherical Panorama Virtual Tour Stage across 2 Floors & 4 Rooms */}
      <KrpanoViewer
        scenes={tourScenes}
        activeSceneId={activeSceneId}
        onSceneChange={(id) => {
          const nextRoom =
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
          if ((nextRoom === "grand16k" || nextRoom === "salon12k") && step !== 0) {
            setStep(0);
            setExpanded(false);
          } else if (nextRoom === "upstairs12k" && step !== 1) {
            setStep(1);
            setExpanded(false);
          } else if ((nextRoom === "rotunda" || nextRoom === "gallery") && step !== 2) {
            setStep(2);
            setExpanded(false);
          }
        }}
        selectedHotspotId={STOPS[step].id}
        onSelectHotspot={(hs) => {
          if (hs.id === "stop-1") goToStep(0);
          else if (hs.id === "stop-2") goToStep(1);
          else if (hs.id === "stop-3") goToStep(2);
        }}
        targetView={targetView}
        heightClass="h-[380px] sm:h-[490px]"
      />

      {/* Synchronized 360° Tour Narrative & Stamp Action Card */}
      <Pop className="mt-3 overflow-hidden p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-[#EFF6FF] px-3 py-1 text-[11px] font-extrabold uppercase tracking-wider text-[#0038A8]">
            <RotateCw className="size-3.5" /> 360° Stop {step + 1} of 3 · {STOPS[step].title} (
            {STOPS[step].subtitle})
          </div>
          <span className="text-[12px] font-semibold" style={{ color: C.mute }}>
            Click 👣 floor path, 🪜 stairs (Upstairs), or 🚪 doors to move between rooms
          </span>
        </div>

        <p
          className="mt-3 text-[16px] leading-relaxed font-medium sm:text-[17px]"
          style={{ fontFamily: F.body, color: C.ink }}
        >
          {expanded ? activeText : short}
        </p>

        {hasMore ? (
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="mt-2 cursor-pointer text-[13px] font-bold underline"
            style={{ color: C.cover }}
          >
            {expanded ? "Show less" : "Read more"}
          </button>
        ) : null}

        {/* Stamp Celebration Box on Step 3 */}
        {step === 2 && done ? (
          <div className="mt-6 flex flex-col items-center rounded-2xl border border-[#6EE7B7] bg-[#ECFDF5] p-6 text-center">
            <Stamp destination={destination} label="✓" size={132} tilt={-5} animateIn={true} />
            <h4
              className="mt-3 text-[22px] font-extrabold"
              style={{ fontFamily: F.display, color: C.ink }}
            >
              Stamp Verified!
            </h4>
            <p className="mt-1 mb-5 text-[14px]" style={{ fontFamily: F.body, color: C.mute }}>
              Added to your CALABARZON e-Passport.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Btn label="Take 4-Question Quiz →" color={C.foil} onClick={onStartQuiz} />
              <Btn label="Back to Overview" color={C.card} onClick={onBack} />
            </div>
          </div>
        ) : (
          <div className="mt-5 flex items-center justify-between border-t border-[#E2E8F0] pt-4">
            {step > 0 ? (
              <button
                type="button"
                onClick={() => goToStep((step - 1) as 0 | 1 | 2)}
                className="inline-flex cursor-pointer items-center gap-1 rounded-xl border border-[#CBD5E1] bg-white px-4 py-2.5 text-[14px] font-bold hover:bg-[#EFF6FF]"
                style={{ color: C.ink }}
              >
                <ChevronLeft className="size-4" /> Previous Floor / Room
              </button>
            ) : (
              <span />
            )}

            {step < 2 ? (
              <button
                type="button"
                onClick={() => goToStep((step + 1) as 0 | 1 | 2)}
                className="inline-flex cursor-pointer items-center gap-1 rounded-xl px-5 py-2.5 text-[14px] font-bold text-white shadow-xs transition-transform hover:-translate-y-0.5"
                style={{ backgroundColor: C.cover }}
              >
                {step === 0
                  ? "🪜 Climb Stairs to 2F Upstairs (Stop 2) →"
                  : "🚪 Walk Skybridge Door (Stop 3) →"}{" "}
                <ChevronRight className="size-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={finishTour}
                className="inline-flex cursor-pointer items-center gap-2 rounded-xl px-5 py-2.5 text-[14px] font-extrabold text-white shadow-md transition-transform hover:-translate-y-0.5"
                style={{ backgroundColor: C.green }}
              >
                <Award className="size-4" /> Collect My Stamp
              </button>
            )}
          </div>
        )}
      </Pop>
    </div>
  );
}

export function SulyapQuiz({
  destination,
  onBack,
  onReviewTour,
  onOpenPassport,
}: {
  destination: Destination;
  onBack: () => void;
  onReviewTour: () => void;
  onOpenPassport: () => void;
}) {
  const { id, slug, name, province, category, address, description } = destination;
  const qs = useMemo(
    () =>
      getQuestionsForDestination({
        id,
        slug,
        name,
        province,
        category,
        address,
        description,
      }),
    [id, slug, name, province, category, address, description],
  );

  const [i, setI] = useState(0);
  const [pick, setPick] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);

  const cat = getCategoryMeta(destination.category);
  const q = qs[i];

  if (!q) return null;

  const choose = (n: number) => {
    if (pick !== null) return;
    setPick(n);
    if (n === q.answer) {
      setScore((s) => s + 1);
    }
  };

  const next = () => {
    if (i + 1 < qs.length) {
      setI(i + 1);
      setPick(null);
      return;
    }
    saveScore(destination.id, score, qs.length, destination.slug);
    setDone(true);
  };

  const retry = () => {
    setI(0);
    setPick(null);
    setScore(0);
    setDone(false);
  };

  if (done) {
    const pct = score / qs.length;
    return (
      <div className="mx-auto w-full max-w-xl pb-8">
        <Pop className="flex flex-col items-center p-7 text-center">
          <Stamp
            destination={destination}
            label={`${score}/${qs.length}`}
            size={132}
            tilt={-4}
            animateIn={true}
          />
          <div
            className="mt-3 text-[44px] leading-none font-extrabold"
            style={{ fontFamily: F.display, color: C.cover }}
          >
            {score} / {qs.length}
          </div>
          <p
            className="mt-2 text-[15px] font-semibold"
            style={{ fontFamily: F.body, color: C.ink }}
          >
            {pct === 1 ? "Perfect score!" : pct >= 0.5 ? "Nice job!" : "Keep exploring!"}
          </p>

          <div className="mt-6 flex flex-wrap justify-center gap-2.5">
            <Btn label="View My e-Passport" color={C.cover} onClick={onOpenPassport} />
            <Btn label="Try Again" color={C.foil} onClick={retry} />
            <Btn label="Review 360° Tour" color={C.card} onClick={onReviewTour} />
            <Btn label="Back" color={C.card} onClick={onBack} />
          </div>
        </Pop>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-xl pb-8">
      <Pop className="p-5 sm:p-6">
        <div className="mb-3 flex items-center justify-between">
          <Label>
            Question {i + 1} of {qs.length}
          </Label>
          <span className="text-[12px] font-bold" style={{ color: cat.deep }}>
            {cat.en}
          </span>
        </div>

        {/* Simple Progress Bar */}
        <div className="mb-5 grid grid-cols-4 gap-1.5">
          {qs.map((_, idx) => (
            <div
              key={idx}
              className="h-1.5 rounded-full"
              style={{ backgroundColor: idx <= i ? C.cover : "#E2E8F0" }}
            />
          ))}
        </div>

        <h2
          className="mb-5 text-[19px] leading-snug font-extrabold sm:text-[22px]"
          style={{ fontFamily: F.display, color: C.ink }}
        >
          {q.q}
        </h2>

        <div className="space-y-2.5">
          {q.options.map((opt, n) => {
            const right = pick !== null && n === q.answer;
            const wrong = pick === n && n !== q.answer;
            const bg = right ? C.green : wrong ? C.red : "#FFFFFF";
            const highlighted = right || wrong;
            return (
              <div
                key={n}
                style={{
                  opacity: pick !== null && !right && !wrong ? 0.55 : 1,
                }}
              >
                <Pop
                  bg={bg}
                  onClick={() => choose(n)}
                  ariaLabel={`Option ${"ABCD"[n]}: ${opt}`}
                  className="flex items-center p-3.5"
                >
                  <span
                    className="mr-3 flex size-7 shrink-0 items-center justify-center rounded-full text-[12px] font-bold"
                    style={{
                      fontFamily: F.mono,
                      backgroundColor: highlighted ? "rgba(255,255,255,0.22)" : "#EFF6FF",
                      color: highlighted ? "#FFFFFF" : C.cover,
                    }}
                  >
                    {"ABCD"[n]}
                  </span>
                  <span
                    className="flex-1 text-[15px] leading-snug font-semibold"
                    style={{
                      fontFamily: F.body,
                      color: highlighted ? "#FFFFFF" : C.ink,
                    }}
                  >
                    {opt}
                  </span>
                  {right ? <CheckCircle2 className="size-5 text-white" /> : null}
                </Pop>
              </div>
            );
          })}
        </div>

        {pick !== null ? (
          <div className="mt-5">
            <div
              className="mb-4 rounded-xl border-l-4 bg-[#F8FAFC] p-3.5"
              style={{
                borderLeftColor: pick === q.answer ? C.green : C.red,
              }}
            >
              <p
                className="text-[14px] font-bold"
                style={{
                  fontFamily: F.body,
                  color: pick === q.answer ? C.green : C.red,
                }}
              >
                {pick === q.answer ? "Correct!" : `Answer: ${q.options[q.answer]}`}
              </p>
              {q.explanation ? (
                <p
                  className="mt-1 text-[13px] leading-relaxed"
                  style={{ fontFamily: F.body, color: C.ink }}
                >
                  {q.explanation}
                </p>
              ) : null}
            </div>

            <Btn
              label={i + 1 < qs.length ? "Next Question →" : "See Final Score →"}
              color={C.cover}
              onClick={next}
              className="w-full"
            />
          </div>
        ) : null}
      </Pop>
    </div>
  );
}
