import React, { useEffect, useMemo, useState } from "react";
import { imageUrl, type Destination } from "@/lib/destinations";
import {
  getEnrichment,
  getQuestionsForDestination,
  markToured,
  saveScore,
} from "@/lib/sulyap-data";
import { C, F, getCategoryMeta, onColor } from "@/lib/sulyap-theme";
import { Btn, Cover, Label, Pop, Stamp, Top } from "./sulyap-ui";

const STOPS = [
  ["Larawan", "Photos"],
  ["Kasaysayan", "History"],
  ["Kahalagahan", "Cultural significance"],
] as const;

/**
 * M1.1: Defined outside Tour component so it never remounts on re-render.
 */
function TourHead({ stopIndex }: { stopIndex: 0 | 1 | 2 }) {
  const stop = STOPS[stopIndex];
  return (
    <div className="mb-4">
      <h2
        className="text-[30px] leading-tight sm:text-[34px]"
        style={{ fontFamily: F.display, color: C.ink }}
      >
        {stop[0]}
      </h2>
      <Label>{stop[1]}</Label>
    </div>
  );
}

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

  const cat = getCategoryMeta(destination.category);
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

  const streetViewUrl =
    destination.latitude != null && destination.longitude != null
      ? `https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=${destination.latitude},${destination.longitude}`
      : null;

  return (
    <div className="mx-auto w-full max-w-3xl pb-12">
      <Top onBack={onBack} kicker="Virtual tour" title={destination.name} />

      {/* Three stops stepper: like walking through the galleries of a museum */}
      <div
        className="flex items-center px-6 py-4 sm:px-12"
        role="tablist"
        aria-label="Virtual tour stops"
      >
        {STOPS.map((s, n) => {
          const active = n <= step;
          const idx = n as 0 | 1 | 2;
          return (
            <React.Fragment key={s[0]}>
              {n > 0 ? (
                <div
                  className="h-[3px] flex-1 transition-colors"
                  style={{ backgroundColor: n <= step ? C.ink : C.sand }}
                />
              ) : null}
              <button
                type="button"
                role="tab"
                aria-selected={step === idx}
                aria-label={`Stop ${n + 1}: ${s[0]} (${s[1]})`}
                onClick={() => setStep(idx)}
                className="flex size-11 cursor-pointer items-center justify-center focus-visible:outline-2"
                style={{ outlineColor: C.blue }}
              >
                <span
                  className="flex size-7 items-center justify-center transition-colors"
                  style={{
                    transform: "rotate(45deg)",
                    borderWidth: 2,
                    borderStyle: "solid",
                    borderColor: C.ink,
                    backgroundColor: active ? cat.color : C.card,
                  }}
                >
                  <span
                    className="text-[12px] font-bold"
                    style={{
                      transform: "rotate(-45deg)",
                      fontFamily: F.bold,
                      color: active ? onColor(cat.color) : C.ink,
                    }}
                  >
                    {n + 1}
                  </span>
                </span>
              </button>
            </React.Fragment>
          );
        })}
      </div>

      {/* Stop Content */}
      <div className="mt-2">
        {step === 0 && (
          <Pop className="p-5 sm:p-7">
            <TourHead stopIndex={0} />
            {allPhotos.length > 0 ? (
              <div className="mb-5">
                {activePhotoIdx === 0 ? (
                  <Cover
                    destination={destination}
                    className="h-64 w-full rounded-xl sm:h-80"
                    style={{
                      borderWidth: 2,
                      borderStyle: "solid",
                      borderColor: C.ink,
                    }}
                  />
                ) : (
                  <img
                    src={allPhotos[activePhotoIdx]!}
                    alt={`${destination.name} view ${activePhotoIdx + 1}`}
                    className="h-64 w-full rounded-xl object-cover sm:h-80"
                    style={{
                      borderWidth: 2,
                      borderStyle: "solid",
                      borderColor: C.ink,
                    }}
                  />
                )}

                {allPhotos.length > 1 ? (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {allPhotos.map((u, idx) => (
                      <button
                        key={u + idx}
                        type="button"
                        onClick={() => setActivePhotoIdx(idx)}
                        aria-label={`View photo ${idx + 1}`}
                        className="size-16 cursor-pointer overflow-hidden rounded-lg transition-transform hover:scale-105"
                        style={{
                          borderWidth: activePhotoIdx === idx ? 3 : 2,
                          borderStyle: "solid",
                          borderColor: activePhotoIdx === idx ? C.blue : C.ink,
                        }}
                      >
                        <img src={u} alt="" className="h-full w-full object-cover" />
                      </button>
                    ))}
                  </div>
                ) : null}

                <Label className="mt-2">
                  {destination.name} ({destination.address}, {destination.province}) ·{" "}
                  {enrichment.sources
                    ? `Sanggunian: ${enrichment.sources}`
                    : "CALABARZON Heritage Archive"}
                </Label>
              </div>
            ) : (
              <div className="mb-4">
                <Cover
                  destination={destination}
                  className="mb-2.5 h-60 w-full rounded-xl sm:h-72"
                  style={{
                    borderWidth: 2,
                    borderStyle: "solid",
                    borderColor: C.ink,
                  }}
                />
                <Label>No photos yet. Add some from Edit on the place page.</Label>
              </div>
            )}

            <p
              className="whitespace-pre-line text-[17px] leading-[28px]"
              style={{ fontFamily: F.body, color: C.ink }}
            >
              {destination.description}
            </p>

            <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {streetViewUrl ? (
                <Btn
                  label="Open 360° street view"
                  sub="Tingnan ang paligid"
                  color={C.card}
                  onClick={() => window.open(streetViewUrl, "_blank", "noopener,noreferrer")}
                />
              ) : null}
              <div className={streetViewUrl ? "" : "sm:col-span-2"}>
                <Btn
                  label="Next stop"
                  sub="Kasaysayan"
                  color={cat.color}
                  onClick={() => setStep(1)}
                />
              </div>
            </div>
          </Pop>
        )}

        {step === 1 && (
          <Pop className="p-5 sm:p-7">
            <TourHead stopIndex={1} />
            <p
              className="whitespace-pre-line text-[17px] leading-[28px]"
              style={{ fontFamily: F.body, color: C.ink }}
            >
              {enrichment.history || "No history has been added for this place yet."}
            </p>

            <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Btn label="Previous stop" sub="Larawan" color={C.card} onClick={() => setStep(0)} />
              <Btn
                label="Next stop"
                sub="Kahalagahan"
                color={cat.color}
                onClick={() => setStep(2)}
              />
            </div>
          </Pop>
        )}

        {step === 2 && (
          <Pop className="p-5 sm:p-7">
            <TourHead stopIndex={2} />
            <p
              className="whitespace-pre-line text-[17px] leading-[28px]"
              style={{ fontFamily: F.body, color: C.ink }}
            >
              {enrichment.significance || "No cultural notes have been added for this place yet."}
            </p>

            {/* M3.2: Mga Sanggunian (Sources) at the end of Tour stop 3 */}
            {enrichment.sources ? (
              <div
                className="mt-6 rounded-[10px] p-4"
                style={{
                  backgroundColor: C.paper,
                  borderWidth: 2,
                  borderStyle: "dashed",
                  borderColor: C.ink,
                }}
              >
                <div className="text-[16px]" style={{ fontFamily: F.display, color: C.ink }}>
                  Mga Sanggunian
                </div>
                <Label className="mb-1">Verified sources and references</Label>
                <p
                  className="text-[14px] leading-[21px]"
                  style={{ fontFamily: F.body, color: C.ink }}
                >
                  {enrichment.sources}
                </p>
              </div>
            ) : null}

            <div className="mt-6">
              {done ? (
                <div className="flex flex-col items-center py-3 text-center">
                  <Stamp
                    destination={destination}
                    label="✓"
                    size={152}
                    tilt={-8}
                    animateIn={true}
                  />
                  <h3 className="mt-3 text-[24px]" style={{ fontFamily: F.display, color: C.ink }}>
                    Selyo nakuha!
                  </h3>
                  <Label className="mb-5">Your stamp is now in the Pasaporte.</Label>
                  <div className="w-full space-y-2.5">
                    <Btn
                      label="Take the quiz"
                      sub="Pagsusulit"
                      color={C.gold}
                      onClick={onStartQuiz}
                    />
                    <Btn label="Back to place" color={C.card} onClick={onBack} />
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <Btn
                    label="Previous stop"
                    sub="Kasaysayan"
                    color={C.card}
                    onClick={() => setStep(1)}
                  />
                  <Btn
                    label="Finish the tour"
                    sub="Tapos na ang paglilibot"
                    color={C.green}
                    onClick={finishTour}
                  />
                </div>
              )}
            </div>
          </Pop>
        )}
      </div>
    </div>
  );
}

/**
 * M1.2 & M3.3: Multiple-choice quiz that loads questions once per destination ID
 * (never reshuffling mid-quiz), displays explanations after each answer, and
 * automatically calculates & saves best score, total, attempts, and last score.
 */
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
  // M1.2: Load once per destination id/slug so questions never reshuffle mid-quiz
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
    const textCol = onColor(cat.color);
    return (
      <div className="mx-auto w-full max-w-2xl pb-12">
        <Top onBack={onBack} kicker={destination.name} title="Resulta" />
        <div className="mt-2">
          <Pop
            bg={cat.color}
            depth={5}
            radius={12}
            className="flex flex-col items-center p-7 text-center"
          >
            <div
              className="text-[76px] leading-[84px] sm:text-[84px] sm:leading-[92px]"
              style={{ fontFamily: F.display, color: textCol }}
            >
              {score}/{qs.length}
            </div>
            <div className="mt-1 text-[24px]" style={{ fontFamily: F.display, color: textCol }}>
              {pct === 1 ? "Perpekto!" : pct >= 0.5 ? "Magaling!" : "Subukan muli!"}
            </div>
            <p className="mt-2 text-[15px]" style={{ fontFamily: F.body, color: textCol }}>
              {Math.round(pct * 100)}% correct. Your best score is saved in your Pasaporte.
            </p>
          </Pop>

          <div className="mt-5 space-y-2.5">
            <Btn label="Try again" color={C.gold} onClick={retry} />
            <Btn label="Open Pasaporte" color={C.blue} onClick={onOpenPassport} />
            <Btn label="Review the tour" color={C.card} onClick={onReviewTour} />
            <Btn label="Back to place" color={C.card} onClick={onBack} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-2xl pb-12">
      <Top onBack={onBack} kicker={destination.name} title="Pagsusulit" />

      <div className="mt-2">
        {/* Progress Diamonds */}
        <div className="mb-2 flex items-center">
          {qs.map((_, n) => (
            <span
              key={n}
              className="mr-3 inline-block size-3.5"
              style={{
                transform: "rotate(45deg)",
                borderWidth: 2,
                borderStyle: "solid",
                borderColor: C.ink,
                backgroundColor: n <= i ? cat.color : "transparent",
              }}
            />
          ))}
        </div>
        <Label>
          Question {i + 1} of {qs.length}
        </Label>

        <h2
          className="my-4 text-[24px] leading-[31px] sm:text-[26px] sm:leading-[34px]"
          style={{ fontFamily: F.display, color: C.ink }}
        >
          {q.q}
        </h2>

        <div className="space-y-2.5">
          {q.options.map((opt, n) => {
            const right = pick !== null && n === q.answer;
            const wrong = pick === n && n !== q.answer;
            const bg = right ? C.green : wrong ? C.red : C.card;
            const highlighted = right || wrong;
            return (
              <div
                key={n}
                style={{
                  opacity: pick !== null && !right && !wrong ? 0.58 : 1,
                }}
              >
                <Pop
                  bg={bg}
                  onClick={() => choose(n)}
                  ariaLabel={`Option ${"ABCD"[n]}: ${opt}`}
                  className="flex items-center p-3.5"
                >
                  <span
                    className="mr-4 flex size-7 shrink-0 items-center justify-center"
                    style={{
                      transform: "rotate(45deg)",
                      borderWidth: 2,
                      borderStyle: "solid",
                      borderColor: highlighted ? "#FFFFFF" : C.ink,
                    }}
                  >
                    <span
                      className="text-[13px] font-bold"
                      style={{
                        transform: "rotate(-45deg)",
                        fontFamily: F.bold,
                        color: highlighted ? "#FFFFFF" : C.ink,
                      }}
                    >
                      {"ABCD"[n]}
                    </span>
                  </span>
                  <span
                    className="flex-1 text-[16px] font-bold leading-[22px]"
                    style={{
                      fontFamily: F.bold,
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
            <Pop
              bg={C.card}
              className="mb-4 p-4"
              style={{
                borderLeftWidth: 6,
                borderLeftColor: pick === q.answer ? C.green : C.red,
              }}
            >
              <p
                className="text-[16px] font-bold"
                style={{
                  fontFamily: F.bold,
                  color: pick === q.answer ? C.green : C.red,
                }}
              >
                {pick === q.answer
                  ? "Tama! That is correct."
                  : `Mali. The answer is ${q.options[q.answer]}.`}
              </p>
              {q.explanation ? (
                <p
                  className="mt-1.5 text-[14px] leading-[21px]"
                  style={{ fontFamily: F.body, color: C.ink }}
                >
                  {q.explanation}
                </p>
              ) : null}
            </Pop>

            <Btn
              label={i + 1 < qs.length ? "Next question" : "See my score"}
              color={C.blue}
              onClick={next}
            />
          </div>
        ) : null}
      </div>
    </div>
  );
}
