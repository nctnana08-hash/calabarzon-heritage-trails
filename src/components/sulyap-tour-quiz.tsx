import React, { useEffect, useMemo, useState } from "react";
import { Award, CheckCircle2, ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import { imageUrl, type Destination } from "@/lib/destinations";
import {
  getEnrichment,
  getQuestionsForDestination,
  markToured,
  saveScore,
} from "@/lib/sulyap-data";
import { C, F, conciseText, getCategoryMeta } from "@/lib/sulyap-theme";
import { Btn, Cover, Label, Pop, Stamp } from "./sulyap-ui";

const STOPS = [
  { step: 1, title: "First Look", subtitle: "What you see here" },
  { step: 2, title: "The Story", subtitle: "How it began" },
  { step: 3, title: "Why It Matters", subtitle: "Collect your stamp" },
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
  const [activePhotoIdx, setActivePhotoIdx] = useState(0);
  const [expanded, setExpanded] = useState(false);
  const [done, setDone] = useState(false);

  const enrichment = getEnrichment(destination);
  const primaryImg = imageUrl(destination);
  const allPhotos = useMemo(() => {
    const list: string[] = [];
    if (primaryImg) list.push(primaryImg);
    for (const u of enrichment.images) {
      if (u && !list.includes(u)) list.push(u);
    }
    return list;
  }, [primaryImg, enrichment.images]);

  useEffect(() => {
    setExpanded(false);
  }, [step]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" && step < 2) {
        setStep((s) => (s + 1) as 0 | 1 | 2);
      } else if (e.key === "ArrowLeft" && step > 0) {
        setStep((s) => (s - 1) as 0 | 1 | 2);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [step]);

  const finishTour = () => {
    markToured(destination.id, destination.slug);
    setDone(true);
  };

  const activeText =
    step === 0
      ? destination.description
      : step === 1
        ? enrichment.history || destination.description
        : enrichment.significance || destination.description;

  const { short, hasMore } = conciseText(activeText, 2);

  return (
    <div className="mx-auto w-full max-w-2xl pb-8">
      {/* Visual 3-Step Progress Bar */}
      <div className="mb-4 grid grid-cols-3 gap-2.5" role="tablist" aria-label="Tour steps">
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
              onClick={() => setStep(idx)}
              className="flex cursor-pointer items-center gap-2.5 rounded-xl border p-3 text-left transition-all"
              style={{
                backgroundColor: active ? C.cover : completed ? "#F0FDF4" : "#FFFFFF",
                borderColor: active ? C.cover : completed ? "#86EFAC" : "#E6DFCE",
                color: active ? "#FFFFFF" : C.ink,
              }}
            >
              <span
                className="flex size-7 shrink-0 items-center justify-center rounded-full text-[12px] font-bold"
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
                  style={{ color: active ? "rgba(255,255,255,0.75)" : C.mute }}
                >
                  {s.subtitle}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Flashcard Slide */}
      <Pop className="overflow-hidden p-5 sm:p-6">
        {step === 0 && (
          <div className="mb-4">
            {allPhotos.length > 0 && activePhotoIdx > 0 ? (
              <img
                src={allPhotos[activePhotoIdx]!}
                alt={destination.name}
                className="h-56 w-full rounded-xl object-cover sm:h-68"
              />
            ) : (
              <Cover destination={destination} className="h-56 w-full rounded-xl sm:h-68" />
            )}

            {allPhotos.length > 1 ? (
              <div className="mt-2.5 flex flex-wrap gap-2">
                {allPhotos.map((u, idx) => (
                  <button
                    key={u + idx}
                    type="button"
                    onClick={() => setActivePhotoIdx(idx)}
                    className="size-12 cursor-pointer overflow-hidden rounded-lg border-2"
                    style={{
                      borderColor: activePhotoIdx === idx ? C.cover : "transparent",
                    }}
                  >
                    <img src={u} alt="" className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            ) : null}
          </div>
        )}

        <div className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-[#F6F1E3] px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-[#4A181B]">
          <Sparkles className="size-3.5" /> Step {step + 1} of 3 · {STOPS[step].title}
        </div>

        <p
          className="mt-2 text-[17px] leading-relaxed font-medium sm:text-[18px]"
          style={{ fontFamily: F.body, color: C.ink }}
        >
          {expanded ? activeText : short}
        </p>

        {hasMore ? (
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="mt-2 cursor-pointer text-[13px] font-semibold underline"
            style={{ color: C.cover }}
          >
            {expanded ? "Show less" : "Read more"}
          </button>
        ) : null}

        {/* Stamp Celebration Box on Step 3 */}
        {step === 2 && done ? (
          <div className="mt-6 flex flex-col items-center rounded-2xl border border-[#86EFAC] bg-[#F0FDF4] p-6 text-center">
            <Stamp destination={destination} label="✓" size={132} tilt={-6} animateIn={true} />
            <h4
              className="mt-3 text-[24px] font-bold"
              style={{ fontFamily: F.display, color: C.ink }}
            >
              Stamp Collected!
            </h4>
            <p className="mt-1 mb-5 text-[14px]" style={{ fontFamily: F.body, color: C.mute }}>
              Added to your CALABARZON Passport.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Btn label="Take 4-Question Quiz →" color={C.foil} onClick={onStartQuiz} />
              <Btn label="Back to Overview" color={C.card} onClick={onBack} />
            </div>
          </div>
        ) : (
          <div className="mt-6 flex items-center justify-between border-t border-[#F0EAE0] pt-4">
            {step > 0 ? (
              <button
                type="button"
                onClick={() => setStep((s) => (s - 1) as 0 | 1 | 2)}
                className="inline-flex cursor-pointer items-center gap-1 rounded-xl border border-[#DED5C0] bg-white px-4 py-2.5 text-[14px] font-semibold hover:bg-[#F6F1E3]"
                style={{ color: C.ink }}
              >
                <ChevronLeft className="size-4" /> Previous
              </button>
            ) : (
              <span />
            )}

            {step < 2 ? (
              <button
                type="button"
                onClick={() => setStep((s) => (s + 1) as 0 | 1 | 2)}
                className="inline-flex cursor-pointer items-center gap-1 rounded-xl px-5 py-2.5 text-[14px] font-bold text-white shadow-xs transition-transform hover:-translate-y-0.5"
                style={{ backgroundColor: C.cover }}
              >
                Next Step <ChevronRight className="size-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={finishTour}
                className="inline-flex cursor-pointer items-center gap-2 rounded-xl px-5 py-2.5 text-[14px] font-bold text-white shadow-md transition-transform hover:-translate-y-0.5"
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
            tilt={-5}
            animateIn={true}
          />
          <div
            className="mt-3 text-[48px] font-bold leading-none"
            style={{ fontFamily: F.display, color: C.cover }}
          >
            {score} / {qs.length}
          </div>
          <p className="mt-2 text-[15px] font-medium" style={{ fontFamily: F.body, color: C.ink }}>
            {pct === 1 ? "Perfect score!" : pct >= 0.5 ? "Nice job!" : "Keep exploring!"}
          </p>

          <div className="mt-6 flex flex-wrap justify-center gap-2.5">
            <Btn label="View My Passport" color={C.cover} onClick={onOpenPassport} />
            <Btn label="Try Again" color={C.foil} onClick={retry} />
            <Btn label="Review Tour" color={C.card} onClick={onReviewTour} />
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
          <span className="text-[12px] font-semibold" style={{ color: cat.deep }}>
            {cat.en}
          </span>
        </div>

        {/* Simple Progress Bar */}
        <div className="mb-5 grid grid-cols-4 gap-1.5">
          {qs.map((_, idx) => (
            <div
              key={idx}
              className="h-1.5 rounded-full"
              style={{ backgroundColor: idx <= i ? C.cover : "#E6DFCE" }}
            />
          ))}
        </div>

        <h2
          className="mb-5 text-[21px] font-bold leading-snug sm:text-[24px]"
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
                      backgroundColor: highlighted ? "rgba(255,255,255,0.2)" : C.paper,
                      color: highlighted ? "#FFFFFF" : C.ink,
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
              className="mb-4 rounded-xl border-l-4 bg-[#FAF6EC] p-3.5"
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
