import React, { useEffect, useMemo, useState } from "react";
import { imageUrl, type Destination } from "@/lib/destinations";
import {
  getEnrichment,
  getQuestionsForDestination,
  markToured,
  saveScore,
} from "@/lib/sulyap-data";
import { C, F, getCategoryMeta } from "@/lib/sulyap-theme";
import { Btn, Cover, Label, Pop, Stamp, Top } from "./sulyap-ui";

const STOPS = [
  ["1. Overview", "Photos & introduction"],
  ["2. History", "How it came to be"],
  ["3. Significance", "Why it matters today"],
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

  return (
    <div className="mx-auto w-full max-w-2xl pb-10">
      <Top onBack={onBack} kicker="Virtual Tour" title={destination.name} />

      {/* Clean 3-Step Pills */}
      <div className="my-4 grid grid-cols-3 gap-2" role="tablist" aria-label="Virtual tour stops">
        {STOPS.map((s, n) => {
          const active = step === n;
          const idx = n as 0 | 1 | 2;
          return (
            <button
              key={s[0]}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setStep(idx)}
              className="cursor-pointer rounded-lg border px-3 py-2 text-left transition-colors"
              style={{
                backgroundColor: active ? C.cover : C.card,
                borderColor: active ? C.cover : "#DED5C0",
                color: active ? "#FFFFFF" : C.ink,
              }}
            >
              <div className="text-[13px] font-semibold" style={{ fontFamily: F.body }}>
                {s[0]}
              </div>
            </button>
          );
        })}
      </div>

      {/* Step Content */}
      {step === 0 && (
        <Pop className="p-5 sm:p-6">
          {allPhotos.length > 0 && activePhotoIdx > 0 ? (
            <img
              src={allPhotos[activePhotoIdx]!}
              alt={destination.name}
              className="mb-4 h-60 w-full rounded-lg object-cover sm:h-72"
            />
          ) : (
            <Cover destination={destination} className="mb-4 h-60 w-full rounded-lg sm:h-72" />
          )}

          {allPhotos.length > 1 ? (
            <div className="mb-4 flex flex-wrap gap-2">
              {allPhotos.map((u, idx) => (
                <button
                  key={u + idx}
                  type="button"
                  onClick={() => setActivePhotoIdx(idx)}
                  className="size-14 cursor-pointer overflow-hidden rounded-md border-2"
                  style={{
                    borderColor: activePhotoIdx === idx ? C.cover : "transparent",
                  }}
                >
                  <img src={u} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          ) : null}

          <p
            className="whitespace-pre-line text-[15px] leading-relaxed sm:text-[16px]"
            style={{ fontFamily: F.body, color: C.ink }}
          >
            {destination.description}
          </p>

          <div className="mt-6 flex justify-end">
            <Btn label="Next: History →" color={C.cover} onClick={() => setStep(1)} />
          </div>
        </Pop>
      )}

      {step === 1 && (
        <Pop className="p-5 sm:p-6">
          <h3
            className="mb-2 text-[22px] font-bold"
            style={{ fontFamily: F.display, color: C.ink }}
          >
            History
          </h3>
          <p
            className="whitespace-pre-line text-[15px] leading-relaxed sm:text-[16px]"
            style={{ fontFamily: F.body, color: C.ink }}
          >
            {enrichment.history || "No history has been added yet."}
          </p>

          <div className="mt-6 flex items-center justify-between gap-3">
            <Btn label="← Back" color={C.card} onClick={() => setStep(0)} />
            <Btn label="Next: Significance →" color={C.cover} onClick={() => setStep(2)} />
          </div>
        </Pop>
      )}

      {step === 2 && (
        <Pop className="p-5 sm:p-6">
          <h3
            className="mb-2 text-[22px] font-bold"
            style={{ fontFamily: F.display, color: C.ink }}
          >
            Cultural Significance
          </h3>
          <p
            className="whitespace-pre-line text-[15px] leading-relaxed sm:text-[16px]"
            style={{ fontFamily: F.body, color: C.ink }}
          >
            {enrichment.significance || "No cultural notes added yet."}
          </p>

          {enrichment.sources ? (
            <p className="mt-4 text-[12px]" style={{ fontFamily: F.body, color: C.mute }}>
              Source: {enrichment.sources}
            </p>
          ) : null}

          <div className="mt-6">
            {done ? (
              <div className="flex flex-col items-center rounded-xl border border-[#DED5C0] bg-[#FAF6EC] p-6 text-center">
                <Stamp destination={destination} label="✓" size={136} tilt={-6} animateIn={true} />
                <h4
                  className="mt-3 text-[24px] font-bold"
                  style={{ fontFamily: F.display, color: C.ink }}
                >
                  Passport Stamped!
                </h4>
                <p className="mt-1 mb-5 text-[14px]" style={{ fontFamily: F.body, color: C.mute }}>
                  You have completed the tour of {destination.name}.
                </p>
                <div className="flex flex-wrap justify-center gap-3">
                  <Btn label="Take Quick Quiz" color={C.foil} onClick={onStartQuiz} />
                  <Btn label="Done" color={C.card} onClick={onBack} />
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between gap-3">
                <Btn label="← Back" color={C.card} onClick={() => setStep(1)} />
                <Btn label="★ Collect Passport Stamp" color={C.green} onClick={finishTour} />
              </div>
            )}
          </div>
        </Pop>
      )}
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
      <div className="mx-auto w-full max-w-xl pb-10">
        <Top onBack={onBack} kicker={destination.name} title="Quiz Result" />
        <Pop className="mt-3 flex flex-col items-center p-7 text-center">
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
          <p className="mt-2 text-[14px]" style={{ fontFamily: F.body, color: C.mute }}>
            {pct === 1 ? "Perfect score! Saved to your passport." : "Score saved to your passport."}
          </p>

          <div className="mt-6 flex flex-wrap justify-center gap-2.5">
            <Btn label="Open Passport" color={C.cover} onClick={onOpenPassport} />
            <Btn label="Try Again" color={C.foil} onClick={retry} />
            <Btn label="Review Tour" color={C.card} onClick={onReviewTour} />
            <Btn label="Back to Place" color={C.card} onClick={onBack} />
          </div>
        </Pop>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-xl pb-10">
      <Top onBack={onBack} kicker={destination.name} title="Quiz" />

      <Pop className="mt-3 p-5 sm:p-6">
        <div className="mb-3 flex items-center justify-between">
          <Label>
            Question {i + 1} of {qs.length}
          </Label>
          <span className="text-[12px] font-medium" style={{ color: cat.deep }}>
            {cat.fil}
          </span>
        </div>

        <h2
          className="mb-5 text-[22px] font-bold leading-snug sm:text-[24px]"
          style={{ fontFamily: F.display, color: C.ink }}
        >
          {q.q}
        </h2>

        <div className="space-y-2">
          {q.options.map((opt, n) => {
            const right = pick !== null && n === q.answer;
            const wrong = pick === n && n !== q.answer;
            const bg = right ? C.green : wrong ? C.red : C.card;
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
                    className="mr-3 flex size-6 shrink-0 items-center justify-center rounded-full text-[12px] font-bold"
                    style={{
                      fontFamily: F.mono,
                      backgroundColor: highlighted ? "rgba(255,255,255,0.2)" : C.sand,
                      color: highlighted ? "#FFFFFF" : C.ink,
                    }}
                  >
                    {"ABCD"[n]}
                  </span>
                  <span
                    className="flex-1 text-[15px] font-medium leading-snug"
                    style={{
                      fontFamily: F.body,
                      color: highlighted ? "#FFFFFF" : C.ink,
                    }}
                  >
                    {opt}
                  </span>
                </Pop>
              </div>
            );
          })}
        </div>

        {pick !== null ? (
          <div className="mt-5">
            <div
              className="mb-4 rounded-lg border-l-4 bg-[#FAF6EC] p-3.5"
              style={{
                borderLeftColor: pick === q.answer ? C.green : C.red,
              }}
            >
              <p
                className="text-[14px] font-semibold"
                style={{
                  fontFamily: F.body,
                  color: pick === q.answer ? C.green : C.red,
                }}
              >
                {pick === q.answer ? "Correct!" : `Correct answer: ${q.options[q.answer]}`}
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
              label={i + 1 < qs.length ? "Next Question →" : "See Score →"}
              color={C.cover}
              onClick={next}
            />
          </div>
        ) : null}
      </Pop>
    </div>
  );
}
