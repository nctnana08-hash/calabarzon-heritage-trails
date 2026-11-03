import React, { useEffect, useMemo, useState } from "react";
import { imageUrl, type Destination } from "@/lib/destinations";
import {
  getEnrichment,
  getQuestionsForDestination,
  markToured,
  saveScore,
} from "@/lib/sulyap-data";
import { C, F, PROVINCE_CODES, getCategoryMeta } from "@/lib/sulyap-theme";
import { Btn, Cover, Label, Pop, Stamp, Top } from "./sulyap-ui";

const STOPS = [
  ["Larawan", "Archival Photographs & Site Overview"],
  ["Kasaysayan", "Historical Record & Origins"],
  ["Kahalagahan", "Cultural Significance & Visa Endorsement"],
] as const;

function TourHead({ stopIndex }: { stopIndex: 0 | 1 | 2 }) {
  const stop = STOPS[stopIndex];
  return (
    <div className="mb-4 border-b border-dashed border-[#D5CBB4] pb-3">
      <Label>
        INSPECTION CHECKPOINT 0{stopIndex + 1} OF 03 · {stop[1]}
      </Label>
      <h2
        className="mt-0.5 text-[28px] font-bold leading-tight sm:text-[34px]"
        style={{ fontFamily: F.display, color: C.ink }}
      >
        {stop[0]}
      </h2>
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
  const provCode = PROVINCE_CODES[destination.province] ?? "IVA";
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
      <Top
        onBack={onBack}
        kicker={`FIELD EXPEDITION · SECTOR ${provCode} · ${cat.code}`}
        title={destination.name}
      />

      {/* Three Checkpoints Stepper */}
      <div
        className="my-4 grid grid-cols-3 gap-2 rounded-lg border border-[#C8BDA4] bg-[#FCF9F0] p-2.5"
        role="tablist"
        aria-label="Virtual tour stops"
      >
        {STOPS.map((s, n) => {
          const active = step === n;
          const passed = n < step || done;
          const idx = n as 0 | 1 | 2;
          return (
            <button
              key={s[0]}
              type="button"
              role="tab"
              aria-selected={active}
              aria-label={`Stop ${n + 1}: ${s[0]} (${s[1]})`}
              onClick={() => setStep(idx)}
              className="flex cursor-pointer flex-col items-start rounded-md border p-2.5 text-left transition-all"
              style={{
                backgroundColor: active
                  ? C.cover
                  : passed
                    ? "rgba(35, 99, 67, 0.08)"
                    : "transparent",
                borderColor: active ? C.foil : passed ? C.green : "#D5CBB4",
              }}
            >
              <span
                className="text-[10px] font-bold uppercase tracking-[0.14em]"
                style={{
                  fontFamily: F.mono,
                  color: active ? C.foil : passed ? C.green : C.mute,
                }}
              >
                {passed ? `✓ STOP 0${n + 1}` : `STOP 0${n + 1}`}
              </span>
              <span
                className="mt-0.5 text-[16px] font-bold leading-tight"
                style={{
                  fontFamily: F.display,
                  color: active ? "#FCF9F0" : C.ink,
                }}
              >
                {s[0]}
              </span>
            </button>
          );
        })}
      </div>

      {/* Stop Content */}
      <div className="mt-2">
        {step === 0 && (
          <Pop className="passport-page-surface p-5 sm:p-7">
            <TourHead stopIndex={0} />
            {allPhotos.length > 0 ? (
              <div className="mb-5">
                <div className="rounded-md border border-[#BFB399] bg-[#EAE2CE] p-2 shadow-inner">
                  {activePhotoIdx === 0 ? (
                    <Cover destination={destination} className="h-64 w-full rounded-xs sm:h-80" />
                  ) : (
                    <img
                      src={allPhotos[activePhotoIdx]!}
                      alt={`${destination.name} view ${activePhotoIdx + 1}`}
                      className="h-64 w-full rounded-xs object-cover sm:h-80"
                    />
                  )}
                </div>

                {allPhotos.length > 1 ? (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {allPhotos.map((u, idx) => (
                      <button
                        key={u + idx}
                        type="button"
                        onClick={() => setActivePhotoIdx(idx)}
                        aria-label={`View photo ${idx + 1}`}
                        className="size-16 cursor-pointer overflow-hidden rounded-xs border-2 transition-transform hover:scale-105"
                        style={{
                          borderColor: activePhotoIdx === idx ? C.cover : "#C8BDA4",
                        }}
                      >
                        <img src={u} alt="" className="h-full w-full object-cover" />
                      </button>
                    ))}
                  </div>
                ) : null}

                <Label className="mt-2.5">
                  ARCHIVAL PLATE: {destination.name} ({destination.address}, {destination.province})
                </Label>
              </div>
            ) : (
              <div className="mb-4">
                <div className="rounded-md border border-[#BFB399] bg-[#EAE2CE] p-2">
                  <Cover destination={destination} className="h-60 w-full rounded-xs sm:h-72" />
                </div>
              </div>
            )}

            <p
              className="whitespace-pre-line text-[16px] leading-relaxed"
              style={{ fontFamily: F.body, color: C.ink }}
            >
              {destination.description}
            </p>

            <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {streetViewUrl ? (
                <Btn
                  label="Open 360° Panorama"
                  sub="Street View Inspection"
                  color={C.card}
                  onClick={() => window.open(streetViewUrl, "_blank", "noopener,noreferrer")}
                />
              ) : null}
              <div className={streetViewUrl ? "" : "sm:col-span-2"}>
                <Btn
                  label="Proceed to Checkpoint 02 →"
                  sub="Kasaysayan (Historical Record)"
                  color={C.cover}
                  onClick={() => setStep(1)}
                />
              </div>
            </div>
          </Pop>
        )}

        {step === 1 && (
          <Pop className="passport-page-surface p-5 sm:p-7">
            <TourHead stopIndex={1} />
            <p
              className="whitespace-pre-line text-[16px] leading-relaxed"
              style={{ fontFamily: F.body, color: C.ink }}
            >
              {enrichment.history || "No history has been added for this place yet."}
            </p>

            <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Btn
                label="← Previous Checkpoint"
                sub="Larawan (Photographs)"
                color={C.card}
                onClick={() => setStep(0)}
              />
              <Btn
                label="Proceed to Checkpoint 03 →"
                sub="Kahalagahan (Cultural Significance)"
                color={C.cover}
                onClick={() => setStep(2)}
              />
            </div>
          </Pop>
        )}

        {step === 2 && (
          <Pop className="passport-page-surface p-5 sm:p-7">
            <TourHead stopIndex={2} />
            <p
              className="whitespace-pre-line text-[16px] leading-relaxed"
              style={{ fontFamily: F.body, color: C.ink }}
            >
              {enrichment.significance || "No cultural notes have been added for this place yet."}
            </p>

            {enrichment.sources ? (
              <div
                className="mt-6 rounded-md border border-dashed p-4"
                style={{
                  backgroundColor: "#EFE9D8",
                  borderColor: "#B8AC93",
                }}
              >
                <Label className="mb-1">MGA SANGGUNIAN · VERIFIED ARCHIVAL REFERENCES</Label>
                <p
                  className="text-[13px] leading-relaxed"
                  style={{ fontFamily: F.body, color: C.ink }}
                >
                  {enrichment.sources}
                </p>
              </div>
            ) : null}

            <div className="mt-6">
              {done ? (
                <div className="flex flex-col items-center rounded-lg border border-[#C8BDA4] bg-[#FCF9F0] p-6 text-center">
                  <Stamp
                    destination={destination}
                    label="✓"
                    size={156}
                    tilt={-7}
                    animateIn={true}
                  />
                  <div
                    className="mt-3 text-[11px] font-bold uppercase tracking-[0.18em]"
                    style={{ fontFamily: F.mono, color: C.green }}
                  >
                    ★ OFFICIAL ENTRY STAMP IMPRINTED ★
                  </div>
                  <h3
                    className="mt-1 text-[28px] font-bold"
                    style={{ fontFamily: F.display, color: C.ink }}
                  >
                    Tatak ng Pagbisita Nakuha!
                  </h3>
                  <p
                    className="mt-1 mb-5 max-w-md text-[14px]"
                    style={{ fontFamily: F.body, color: C.mute }}
                  >
                    Your official {destination.province} rubber stamp has been recorded in your
                    Pasaporte ng Pamana. Take the Examiner's Quiz next to endorse your stamp with a
                    mastery score.
                  </p>
                  <div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-2">
                    <Btn
                      label="Take Examiner's Quiz"
                      sub="Endorse Stamp with Score"
                      color={C.foil}
                      onClick={onStartQuiz}
                    />
                    <Btn
                      label="Return to Visa Dossier"
                      sub="View Site Details"
                      color={C.card}
                      onClick={onBack}
                    />
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <Btn
                    label="← Previous Checkpoint"
                    sub="Kasaysayan"
                    color={C.card}
                    onClick={() => setStep(1)}
                  />
                  <Btn
                    label="★ Stamp My Pasaporte"
                    sub="Complete 3-Stop Inspection"
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
      <div className="mx-auto w-full max-w-2xl pb-12">
        <Top
          onBack={onBack}
          kicker={`EXAMINER VERIFICATION · ${destination.name.toUpperCase()}`}
          title="Resulta ng Pagsusulit"
        />
        <div className="mt-3">
          <Pop className="passport-page-surface flex flex-col items-center p-7 text-center">
            <Stamp
              destination={destination}
              label={`${score}/${qs.length}`}
              size={148}
              tilt={-5}
              animateIn={true}
            />
            <div
              className="mt-3 text-[54px] font-bold leading-none sm:text-[64px]"
              style={{ fontFamily: F.display, color: C.cover }}
            >
              {score} / {qs.length}
            </div>
            <div
              className="mt-1 text-[22px] font-bold"
              style={{ fontFamily: F.display, color: C.ink }}
            >
              {pct === 1
                ? "Perpektong Marka! (Distinguished Chronicler)"
                : pct >= 0.5
                  ? "Magaling! (Verified Field Explorer)"
                  : "Subukan Muli! (Review Dossier Notes)"}
            </div>
            <p className="mt-2 max-w-md text-[14px]" style={{ fontFamily: F.body, color: C.mute }}>
              {Math.round(pct * 100)}% accuracy recorded. Your highest examiner score is permanently
              endorsed in your Pasaporte ng Pamana.
            </p>
          </Pop>

          <div className="mt-5 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
            <Btn
              label="Open Stamp Booklet"
              sub="View Pasaporte"
              color={C.cover}
              onClick={onOpenPassport}
            />
            <Btn
              label="Retake Inspection Quiz"
              sub="Improve Score"
              color={C.foil}
              onClick={retry}
            />
            <Btn
              label="Review 3-Stop Tour"
              sub="Read Archival Notes"
              color={C.card}
              onClick={onReviewTour}
            />
            <Btn
              label="Back to Visa Dossier"
              sub={destination.name}
              color={C.card}
              onClick={onBack}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-2xl pb-12">
      <Top
        onBack={onBack}
        kicker={`EXAMINER'S VERIFICATION · ${destination.name.toUpperCase()}`}
        title="Pagsusulit sa Pamana"
      />

      <div className="passport-page-surface mt-3 rounded-xl border border-[#C8BDA4] p-5 sm:p-7">
        {/* Progress Bar */}
        <div className="mb-3 flex items-center justify-between">
          <Label>
            QUESTION 0{i + 1} OF 0{qs.length}
          </Label>
          <span
            className="text-[11px] font-bold uppercase tracking-[0.12em]"
            style={{ fontFamily: F.mono, color: cat.deep }}
          >
            SEAL: {cat.code}
          </span>
        </div>

        <div className="mb-5 grid grid-cols-4 gap-1.5">
          {qs.map((_, n) => (
            <div
              key={n}
              className="h-1.5 rounded-full"
              style={{
                backgroundColor: n <= i ? C.cover : "#DFD6C0",
              }}
            />
          ))}
        </div>

        <h2
          className="my-4 text-[24px] font-bold leading-snug sm:text-[27px]"
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
                  opacity: pick !== null && !right && !wrong ? 0.6 : 1,
                }}
              >
                <Pop
                  bg={bg}
                  onClick={() => choose(n)}
                  ariaLabel={`Option ${"ABCD"[n]}: ${opt}`}
                  className="flex items-center p-3.5"
                >
                  <span
                    className="mr-3.5 flex size-7 shrink-0 items-center justify-center rounded-xs border text-[12px] font-bold"
                    style={{
                      fontFamily: F.mono,
                      borderColor: highlighted ? "#FFFFFF" : "#B8AC93",
                      backgroundColor: highlighted ? "rgba(255,255,255,0.15)" : "#EFE9D8",
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
                </Pop>
              </div>
            );
          })}
        </div>

        {pick !== null ? (
          <div className="mt-5">
            <div
              className="mb-4 rounded-md border-l-4 bg-[#FCF9F0] p-4 shadow-xs"
              style={{
                borderLeftColor: pick === q.answer ? C.green : C.red,
                borderTop: "1px solid #D5CBB4",
                borderRight: "1px solid #D5CBB4",
                borderBottom: "1px solid #D5CBB4",
              }}
            >
              <p
                className="text-[14px] font-bold uppercase tracking-[0.08em]"
                style={{
                  fontFamily: F.mono,
                  color: pick === q.answer ? C.green : C.red,
                }}
              >
                {pick === q.answer
                  ? "✓ VERIFIED CORRECT · TAMA"
                  : `✕ CORRECTION · ANSWER: ${q.options[q.answer]}`}
              </p>
              {q.explanation ? (
                <p
                  className="mt-1.5 text-[14px] leading-relaxed"
                  style={{ fontFamily: F.body, color: C.ink }}
                >
                  {q.explanation}
                </p>
              ) : null}
            </div>

            <Btn
              label={i + 1 < qs.length ? "Next Verification Question →" : "Record Official Score →"}
              color={C.cover}
              onClick={next}
            />
          </div>
        ) : null}
      </div>
    </div>
  );
}
