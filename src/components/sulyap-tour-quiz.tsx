import { useEffect, useMemo, useState } from "react";
import { Award, CheckCircle2, ChevronLeft, ChevronRight, RotateCw } from "lucide-react";
import type { Destination } from "@/lib/destinations";
import {
  CALABARZON_12K_PANO_URL,
  DEFAULT_MUSEUM_PANO_URL,
  GALLERY_HALL_PANO_URL,
  type KrpanoSceneConfig,
} from "@/lib/krpano-scenes";
import { getArtPieces360 } from "@/lib/sulyap-art-360";
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
    sceneId: "salon12k" as const,
    title: "First Look",
    subtitle: "Room 1 · 12K Heritage Salon",
    ath: 41,
    atv: -6,
    fov: 52,
  },
  {
    step: 2,
    id: "stop-2",
    sceneId: "rotunda" as const,
    title: "The Story",
    subtitle: "Room 2 · Grand Rotunda",
    ath: -2,
    atv: 6,
    fov: 58,
  },
  {
    step: 3,
    id: "stop-3",
    sceneId: "gallery" as const,
    title: "Why It Matters",
    subtitle: "Room 3 · Fine Arts Hall",
    ath: -48,
    atv: 4,
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
  const [activeSceneId, setActiveSceneId] = useState<"salon12k" | "rotunda" | "gallery">(
    "salon12k",
  );
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

  // Multi-room 360° scenes for the Virtual Tour (Room 1 12K Salon + Room 2 Rotunda + Room 3 Fine Arts Hall)
  const tourScenes: KrpanoSceneConfig[] = useMemo(() => {
    const safeSlug = destination.slug.replace(/[^a-zA-Z0-9_]/g, "_");
    return [
      {
        id: "salon12k",
        name: `tour_${safeSlug}_salon12k`,
        shortLabel: "Room 1: 12K Salon (UHD)",
        title: `${destination.name} — Room 1: 12K Heritage Salon (12,000 × 6,000)`,
        panoramaUrl: CALABARZON_12K_PANO_URL,
        isUltraHd12k: true,
        initialHlookat: 41,
        initialVlookat: -6,
        initialFov: 60,
        hotspots: [
          {
            id: "stop-1",
            badge: "S1",
            title: `Stop 1: ${destination.name}`,
            subtitle: "First Look · 12K Heritage Salon",
            ath: STOPS[0].ath,
            atv: STOPS[0].atv,
            fov: STOPS[0].fov,
          },
          {
            id: "portal-to-rotunda",
            badge: "🚪",
            title: "Walk to Room 2 (Stop 2: The Story) →",
            ath: -54,
            atv: -2,
            fov: 74,
            targetSceneId: "rotunda",
          },
          {
            id: "salon-masterworks",
            badge: "★",
            title: artPieces[0]?.title ?? "12K Masterworks Wall",
            ath: -153,
            atv: 12,
            fov: 46,
          },
        ],
      },
      {
        id: "rotunda",
        name: `tour_${safeSlug}_rotunda`,
        shortLabel: "Room 2: Grand Rotunda",
        title: `${destination.name} — Room 2: Grand Rotunda 360°`,
        panoramaUrl: DEFAULT_MUSEUM_PANO_URL,
        initialHlookat: -2,
        initialVlookat: 6,
        initialFov: 68,
        hotspots: [
          {
            id: "stop-2",
            badge: "S2",
            title: `Stop 2: ${artPieces[1]?.title ?? "The Historical Story"}`,
            subtitle: "The Story · Central Rotunda",
            ath: STOPS[1].ath,
            atv: STOPS[1].atv,
            fov: STOPS[1].fov,
          },
          {
            id: "portal-to-gallery",
            badge: "🚪",
            title: "Walk to Room 3 (Stop 3: Why It Matters) →",
            ath: 58,
            atv: -2,
            fov: 76,
            targetSceneId: "gallery",
          },
          {
            id: "rotunda-ancestral",
            badge: "★",
            title: artPieces[2]?.title ?? "Ancestral Architecture Wing",
            ath: 92,
            atv: -2,
            fov: 58,
          },
        ],
      },
      {
        id: "gallery",
        name: `tour_${safeSlug}_gallery`,
        shortLabel: "Room 3: Fine Arts Hall",
        title: `${destination.name} — Room 3: Fine Arts Hall 360°`,
        panoramaUrl: GALLERY_HALL_PANO_URL,
        initialHlookat: -48,
        initialVlookat: 4,
        initialFov: 60,
        hotspots: [
          {
            id: "stop-3",
            badge: "S3",
            title: `Stop 3: ${artPieces[3]?.title ?? "Cultural Significance"}`,
            subtitle: "Why It Matters · Claim Stamp",
            ath: STOPS[2].ath,
            atv: STOPS[2].atv,
            fov: STOPS[2].fov,
          },
          {
            id: "portal-to-12k",
            badge: "🚪",
            title: "Return to Room 1 (12K Salon) →",
            ath: 90,
            atv: -2,
            fov: 76,
            targetSceneId: "salon12k",
          },
          {
            id: "gallery-modernist",
            badge: "★",
            title: "Modernist Folk & Cubist Masterworks",
            ath: 42,
            atv: 4,
            fov: 56,
          },
        ],
      },
    ];
  }, [destination.slug, destination.name, artPieces]);

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

      {/* Real Full 360°×180° Spherical Panorama Virtual Tour Stage across 3 Connected Rooms */}
      <KrpanoViewer
        scenes={tourScenes}
        activeSceneId={activeSceneId}
        onSceneChange={(id) => {
          const nextRoom = id === "gallery" ? "gallery" : id === "rotunda" ? "rotunda" : "salon12k";
          setActiveSceneId(nextRoom);
          const nextStep: 0 | 1 | 2 = nextRoom === "salon12k" ? 0 : nextRoom === "rotunda" ? 1 : 2;
          if (step !== nextStep) {
            setStep(nextStep);
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
        heightClass="h-[360px] sm:h-[460px]"
      />

      {/* Synchronized 360° Tour Narrative & Stamp Action Card */}
      <Pop className="mt-3 overflow-hidden p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-[#EFF6FF] px-3 py-1 text-[11px] font-extrabold uppercase tracking-wider text-[#0038A8]">
            <RotateCw className="size-3.5" /> 360° Stop {step + 1} of 3 · {STOPS[step].title} (
            {STOPS[step].subtitle})
          </div>
          <span className="text-[12px] font-semibold" style={{ color: C.mute }}>
            Drag 360° in 12K UHD or click the green 🚪 door to walk across Rooms 1–3
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
                <ChevronLeft className="size-4" /> Previous 360° Room
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
                {step === 0 ? "Walk to Room 2 (Stop 2) →" : "Walk to Room 3 (Stop 3) →"}{" "}
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
            className="mt-3 text-[44px] font-extrabold leading-none"
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
          className="mb-5 text-[19px] font-extrabold leading-snug sm:text-[22px]"
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
                    className="flex-1 text-[15px] font-semibold leading-snug"
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
