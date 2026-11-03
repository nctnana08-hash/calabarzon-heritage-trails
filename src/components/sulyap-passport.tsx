import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { PROVINCES, type Destination } from "@/lib/destinations";
import { getDestinationProgress, resetAllProgress, useSulyapProgress } from "@/lib/sulyap-data";
import { C, F, PROVINCE_TONES, getCategoryMeta } from "@/lib/sulyap-theme";
import { Banig, Btn, Label, Pop, Sec, Stamp } from "./sulyap-ui";

const TILT = [-7, 5, -3, 8, -5, 3];

export function SulyapPassport({ destinations }: { destinations: Destination[] }) {
  const navigate = useNavigate();
  const progress = useSulyapProgress();
  const [resetOpen, setResetOpen] = useState(false);

  const progressEntries = destinations
    .map((d) => ({ destination: d, prog: getDestinationProgress(d, progress) }))
    .filter((x) => x.prog !== null);

  const scored = progressEntries.filter((x) => x.prog && x.prog.attempts > 0 && x.prog.total > 0);

  const avg = scored.length
    ? Math.round(
        (100 * scored.reduce((acc, x) => acc + x.prog!.best / x.prog!.total, 0)) / scored.length,
      )
    : 0;

  const tries = progressEntries.reduce((acc, x) => acc + (x.prog?.attempts ?? 0), 0);
  const stamped = progressEntries.filter((x) => x.prog?.toured === 1).length;

  const handleReset = () => {
    resetAllProgress();
    setResetOpen(false);
    toast.success("Pasaporte progress has been reset.");
  };

  return (
    <div className="mx-auto w-full max-w-4xl">
      {/* Summary Header Card */}
      <Pop bg={C.red} depth={5} radius={12}>
        <div className="h-11 overflow-hidden">
          <Banig color={C.red} seed={5} />
        </div>
        <div className="p-5 sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1
                className="text-[34px] leading-tight sm:text-[40px]"
                style={{ fontFamily: F.display, color: C.gold }}
              >
                Pasaporte
              </h1>
              <p
                className="mt-1 mb-5 text-[14px] sm:text-[15px]"
                style={{ fontFamily: F.body, color: "#FBE3E0" }}
              >
                Your record of places toured and quizzes taken across CALABARZON
              </p>
            </div>

            <div className="flex flex-wrap gap-2 print:hidden">
              <button
                type="button"
                onClick={() => window.print()}
                className="min-h-[40px] cursor-pointer rounded-lg px-3.5 py-1.5 text-[13px] font-bold transition-transform active:translate-y-0.5"
                style={{
                  fontFamily: F.bold,
                  backgroundColor: C.gold,
                  color: C.ink,
                  borderWidth: 2,
                  borderStyle: "solid",
                  borderColor: C.ink,
                }}
              >
                Print Pasaporte
              </button>
              {stamped > 0 || tries > 0 ? (
                <button
                  type="button"
                  onClick={() => setResetOpen(true)}
                  className="min-h-[40px] cursor-pointer rounded-lg px-3.5 py-1.5 text-[13px] font-bold transition-transform active:translate-y-0.5"
                  style={{
                    fontFamily: F.bold,
                    backgroundColor: C.card,
                    color: C.ink,
                    borderWidth: 2,
                    borderStyle: "solid",
                    borderColor: C.ink,
                  }}
                >
                  Reset
                </button>
              ) : null}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <div
                className="text-[26px] leading-tight sm:text-[32px]"
                style={{ fontFamily: F.display, color: "#FFFFFF" }}
              >
                {stamped}/{destinations.length}
              </div>
              <div
                className="text-[12px] sm:text-[13px]"
                style={{ fontFamily: F.body, color: "#FBE3E0" }}
              >
                Places finished
              </div>
            </div>
            <div>
              <div
                className="text-[26px] leading-tight sm:text-[32px]"
                style={{ fontFamily: F.display, color: "#FFFFFF" }}
              >
                {avg}%
              </div>
              <div
                className="text-[12px] sm:text-[13px]"
                style={{ fontFamily: F.body, color: "#FBE3E0" }}
              >
                Average best score
              </div>
            </div>
            <div>
              <div
                className="text-[26px] leading-tight sm:text-[32px]"
                style={{ fontFamily: F.display, color: "#FFFFFF" }}
              >
                {tries}
              </div>
              <div
                className="text-[12px] sm:text-[13px]"
                style={{ fontFamily: F.body, color: "#FBE3E0" }}
              >
                Quizzes taken
              </div>
            </div>
          </div>
        </div>
      </Pop>

      {/* Province Completion Breakdown */}
      <Sec
        fil="Progreso sa Bawat Lalawigan"
        en="Stamps collected across the five provinces of Region IV-A"
      />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        {PROVINCES.map((prov) => {
          const provPlaces = destinations.filter((d) => d.province === prov);
          const provStamped = provPlaces.filter(
            (d) => getDestinationProgress(d, progress)?.toured === 1,
          ).length;
          const pct = provPlaces.length ? Math.round((100 * provStamped) / provPlaces.length) : 0;
          const tone = PROVINCE_TONES[prov] ?? C.blue;
          return (
            <Pop
              key={prov}
              onClick={() =>
                navigate({
                  to: "/destinations",
                  search: { province: prov, view: "list" },
                })
              }
              ariaLabel={`${prov}: ${provStamped} of ${provPlaces.length} stamped`}
              className="p-3"
            >
              <div className="flex items-baseline justify-between">
                <span className="text-[17px]" style={{ fontFamily: F.display, color: C.ink }}>
                  {prov}
                </span>
                <span
                  className="text-[13px] font-bold"
                  style={{ fontFamily: F.bold, color: C.mute }}
                >
                  {provStamped}/{provPlaces.length}
                </span>
              </div>
              <div
                className="mt-2 h-2.5 overflow-hidden rounded-full"
                style={{
                  borderWidth: 1.5,
                  borderStyle: "solid",
                  borderColor: C.ink,
                  backgroundColor: C.paper,
                }}
              >
                <div
                  className="h-full transition-all duration-300"
                  style={{ width: `${pct}%`, backgroundColor: tone }}
                />
              </div>
            </Pop>
          );
        })}
      </div>

      {/* Stamps Grid */}
      <Sec fil="Mga Selyo" en="Finish a tour to earn a stamp. Tap one to revisit." />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
        {destinations.map((d, n) => {
          const p = getDestinationProgress(d, progress);
          const isToured = p?.toured === 1;
          return (
            <button
              key={d.id}
              type="button"
              onClick={() =>
                navigate({
                  to: "/destinations/$slug",
                  params: { slug: d.slug },
                })
              }
              aria-label={
                isToured
                  ? `Stamped: ${d.name} (${d.province}). Click to revisit.`
                  : `Not yet stamped: ${d.name} (${d.province}). Click to open.`
              }
              className="flex aspect-square cursor-pointer items-center justify-center rounded-xl p-2 transition-transform hover:scale-[1.03] focus-visible:outline-2"
              style={{ outlineColor: C.blue }}
            >
              {isToured ? (
                <Stamp
                  destination={d}
                  size={128}
                  tilt={TILT[n % TILT.length]!}
                  label={p && p.attempts > 0 && p.total > 0 ? `${p.best}/${p.total}` : "✓"}
                />
              ) : (
                <div
                  className="flex size-[118px] flex-col items-center justify-center rounded-full p-3 text-center"
                  style={{
                    borderWidth: 2,
                    borderStyle: "dashed",
                    borderColor: C.mute,
                    backgroundColor: "transparent",
                  }}
                >
                  <span
                    className="text-[11px] font-bold"
                    style={{ fontFamily: F.bold, color: C.mute }}
                  >
                    {d.province}
                  </span>
                  <span
                    className="mt-1 line-clamp-3 text-[12px] font-bold leading-[15px]"
                    style={{ fontFamily: F.bold, color: C.mute }}
                  >
                    {d.name}
                  </span>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Quiz Scores */}
      <Sec fil="Mga Marka" en="Best quiz score for each place" />
      {scored.length === 0 ? (
        <Pop className="p-5">
          <p className="text-[15px] leading-[22px]" style={{ fontFamily: F.body, color: C.mute }}>
            No quizzes yet. Open a place and take its quiz to see your score here.
          </p>
          <div className="mt-4 w-48">
            <Btn
              label="Browse places"
              color={C.blue}
              onClick={() => navigate({ to: "/destinations", search: { view: "list" } })}
            />
          </div>
        </Pop>
      ) : (
        <div className="space-y-4">
          {scored.map(({ destination: d, prog }) => {
            if (!prog) return null;
            const cat = getCategoryMeta(d.category);
            const pct = Math.min(100, Math.round((100 * prog.best) / prog.total));
            return (
              <div
                key={d.id}
                className="rounded-[10px] p-4"
                style={{
                  backgroundColor: C.card,
                  borderWidth: 2,
                  borderStyle: "solid",
                  borderColor: C.ink,
                }}
              >
                <div className="mb-1.5 flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      navigate({
                        to: "/destinations/$slug",
                        params: { slug: d.slug },
                      })
                    }
                    className="cursor-pointer text-left text-[15px] font-bold hover:underline"
                    style={{ fontFamily: F.bold, color: C.ink }}
                  >
                    {d.name}
                  </button>
                  <span
                    className="text-[15px] font-bold"
                    style={{ fontFamily: F.bold, color: cat.deep }}
                  >
                    {prog.best}/{prog.total}
                  </span>
                </div>
                <div
                  className="h-3 overflow-hidden rounded-[6px]"
                  style={{
                    borderWidth: 2,
                    borderStyle: "solid",
                    borderColor: C.ink,
                    backgroundColor: C.paper,
                  }}
                >
                  <div
                    className="h-full transition-all duration-300"
                    style={{
                      width: `${pct}%`,
                      backgroundColor: cat.color,
                    }}
                  />
                </div>
                <Label className="mt-1.5">
                  {prog.attempts} {prog.attempts === 1 ? "try" : "tries"}, last score {prog.last}/
                  {prog.total}
                </Label>
              </div>
            );
          })}
        </div>
      )}

      {/* Reset Progress Confirmation */}
      <AlertDialog open={resetOpen} onOpenChange={setResetOpen}>
        <AlertDialogContent
          style={{
            backgroundColor: C.paper,
            borderWidth: 2,
            borderStyle: "solid",
            borderColor: C.ink,
          }}
        >
          <AlertDialogHeader>
            <AlertDialogTitle
              className="text-[24px]"
              style={{ fontFamily: F.display, color: C.ink }}
            >
              Reset your Pasaporte?
            </AlertDialogTitle>
            <AlertDialogDescription
              className="text-[15px]"
              style={{ fontFamily: F.body, color: C.mute }}
            >
              All earned tour stamps and quiz scores on this device will be cleared so you can start
              fresh.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              style={{
                borderWidth: 2,
                borderStyle: "solid",
                borderColor: C.ink,
                backgroundColor: C.card,
                color: C.ink,
                fontFamily: F.bold,
              }}
            >
              Keep my stamps
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleReset}
              style={{
                borderWidth: 2,
                borderStyle: "solid",
                borderColor: C.ink,
                backgroundColor: C.red,
                color: "#FFFFFF",
                fontFamily: F.bold,
              }}
            >
              Reset Pasaporte
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
