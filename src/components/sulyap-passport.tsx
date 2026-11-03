import { useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
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
import { C, F } from "@/lib/sulyap-theme";
import { Chip, Label, Mark, Stamp } from "./sulyap-ui";

const TILT = [-6, 4, -3, 7, -5, 3];
const BEARER_STORAGE_KEY = "sulyap.passport.bearer.v1";

export function SulyapPassport({ destinations }: { destinations: Destination[] }) {
  const navigate = useNavigate();
  const progress = useSulyapProgress();
  const [resetOpen, setResetOpen] = useState(false);
  const [activeProvince, setActiveProvince] = useState<string>("All");
  const [bearerName, setBearerName] = useState("Traveler");
  const [editingName, setEditingName] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const saved = window.localStorage.getItem(BEARER_STORAGE_KEY);
    if (saved && saved.trim()) {
      setBearerName(saved.trim());
    }
  }, []);

  const saveBearerName = (val: string) => {
    const clean = val.trim() || "Traveler";
    setBearerName(clean);
    setEditingName(false);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(BEARER_STORAGE_KEY, clean);
    }
  };

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

  const visibleDestinations =
    activeProvince === "All"
      ? destinations
      : destinations.filter((d) => d.province === activeProvince);

  const handleReset = () => {
    resetAllProgress();
    setResetOpen(false);
    toast.success("Passport stamps reset.");
  };

  return (
    <div className="mx-auto w-full max-w-4xl">
      {/* Clean Passport Cover Header */}
      <div
        className="passport-leather-cover overflow-hidden rounded-2xl border p-6 shadow-md sm:p-8"
        style={{ borderColor: "rgba(212, 175, 55, 0.45)" }}
      >
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <Mark size={40} />
            <div>
              <span
                className="text-[11px] font-semibold uppercase tracking-[0.16em]"
                style={{ fontFamily: F.mono, color: C.foil }}
              >
                CALABARZON Heritage Passport
              </span>
              <div className="mt-0.5 flex items-center gap-2.5">
                {editingName ? (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      saveBearerName(bearerName);
                    }}
                    className="flex items-center gap-2"
                  >
                    <input
                      type="text"
                      value={bearerName}
                      onChange={(e) => setBearerName(e.target.value)}
                      maxLength={28}
                      autoFocus
                      className="rounded-md border border-[#D4AF37] bg-white px-2.5 py-1 text-[16px] font-semibold"
                      style={{ fontFamily: F.body, color: C.ink }}
                    />
                    <button
                      type="submit"
                      className="cursor-pointer rounded-md px-3 py-1 text-[12px] font-semibold"
                      style={{ backgroundColor: C.foil, color: C.ink }}
                    >
                      Save
                    </button>
                  </form>
                ) : (
                  <>
                    <h1
                      className="text-[28px] font-bold leading-tight sm:text-[34px]"
                      style={{ fontFamily: F.display, color: "#FCF9F0" }}
                    >
                      {bearerName}&rsquo;s Passport
                    </h1>
                    <button
                      type="button"
                      onClick={() => setEditingName(true)}
                      className="cursor-pointer rounded-md border border-white/25 px-2 py-0.5 text-[11px] text-white/80 hover:bg-white/10 print:hidden"
                      style={{ fontFamily: F.body }}
                    >
                      Edit name
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 print:hidden">
            <button
              type="button"
              onClick={() => window.print()}
              className="cursor-pointer rounded-lg px-3.5 py-2 text-[13px] font-semibold transition-opacity hover:opacity-90"
              style={{
                fontFamily: F.body,
                backgroundColor: C.foil,
                color: C.ink,
              }}
            >
              Print
            </button>
            {stamped > 0 || tries > 0 ? (
              <button
                type="button"
                onClick={() => setResetOpen(true)}
                className="cursor-pointer rounded-lg border border-white/30 px-3.5 py-2 text-[13px] font-medium text-white hover:bg-white/10"
                style={{ fontFamily: F.body }}
              >
                Reset
              </button>
            ) : null}
          </div>
        </div>

        {/* 3 Clean Summary Stats */}
        <div className="mt-6 grid grid-cols-3 gap-4 border-t border-white/15 pt-5">
          <div>
            <div
              className="text-[28px] font-bold leading-tight sm:text-[34px]"
              style={{ fontFamily: F.display, color: "#FCF9F0" }}
            >
              {stamped}/{destinations.length}
            </div>
            <div className="text-[12px] text-white/75" style={{ fontFamily: F.body }}>
              Stamps collected
            </div>
          </div>
          <div>
            <div
              className="text-[28px] font-bold leading-tight sm:text-[34px]"
              style={{ fontFamily: F.display, color: C.foil }}
            >
              {avg}%
            </div>
            <div className="text-[12px] text-white/75" style={{ fontFamily: F.body }}>
              Average quiz score
            </div>
          </div>
          <div>
            <div
              className="text-[28px] font-bold leading-tight sm:text-[34px]"
              style={{ fontFamily: F.display, color: "#FCF9F0" }}
            >
              {tries}
            </div>
            <div className="text-[12px] text-white/75" style={{ fontFamily: F.body }}>
              Quizzes taken
            </div>
          </div>
        </div>
      </div>

      {/* Province Filter Pills */}
      <div className="my-5 flex flex-wrap items-center gap-2">
        <Chip
          label={`All (${stamped}/${destinations.length})`}
          on={activeProvince === "All"}
          color={C.cover}
          onClick={() => setActiveProvince("All")}
        />
        {PROVINCES.map((prov) => {
          const provPlaces = destinations.filter((d) => d.province === prov);
          const provStamped = provPlaces.filter(
            (d) => getDestinationProgress(d, progress)?.toured === 1,
          ).length;
          return (
            <Chip
              key={prov}
              label={`${prov} (${provStamped}/${provPlaces.length})`}
              on={activeProvince === prov}
              color={C.cover}
              onClick={() => setActiveProvince(prov)}
            />
          );
        })}
      </div>

      {/* Clean Open Passport Stamp Pages */}
      <div
        className="passport-page-surface rounded-2xl border p-5 shadow-sm sm:p-7"
        style={{ borderColor: "#DED5C0" }}
      >
        <div className="mb-4 flex items-center justify-between border-b border-[#E5DEC9] pb-3">
          <Label>STAMP PAGES · TAP A PLACE TO VISIT</Label>
          <Label>{activeProvince === "All" ? "All Provinces" : activeProvince}</Label>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          {visibleDestinations.map((d, n) => {
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
                    ? `Stamped: ${d.name} (${d.province})`
                    : `Not yet stamped: ${d.name} (${d.province})`
                }
                className="group flex aspect-square cursor-pointer flex-col items-center justify-center rounded-xl border p-3 text-center transition-all hover:bg-[#FCF9F0] hover:shadow-sm"
                style={{
                  borderColor: isToured ? "#C9BEA4" : "#E5DEC9",
                  backgroundColor: isToured ? "#FCF9F0" : "rgba(246, 241, 227, 0.5)",
                }}
              >
                {isToured ? (
                  <Stamp
                    destination={d}
                    size={128}
                    tilt={TILT[n % TILT.length]!}
                    label={p && p.attempts > 0 && p.total > 0 ? `${p.best}/${p.total}` : "✓"}
                  />
                ) : (
                  <div className="flex size-28 flex-col items-center justify-center rounded-full border border-dashed border-[#C7BCA4] p-3 transition-colors group-hover:border-[#8C7A5B]">
                    <span
                      className="text-[10px] font-medium uppercase tracking-wider"
                      style={{ fontFamily: F.mono, color: C.mute }}
                    >
                      {d.province}
                    </span>
                    <span
                      className="mt-1 line-clamp-2 text-[14px] font-bold leading-tight"
                      style={{ fontFamily: F.display, color: C.ink }}
                    >
                      {d.name}
                    </span>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Reset Progress Confirmation */}
      <AlertDialog open={resetOpen} onOpenChange={setResetOpen}>
        <AlertDialogContent
          style={{
            backgroundColor: C.card,
            borderColor: "#D5CBB4",
          }}
        >
          <AlertDialogHeader>
            <AlertDialogTitle
              className="text-[22px] font-bold"
              style={{ fontFamily: F.display, color: C.ink }}
            >
              Reset your passport stamps?
            </AlertDialogTitle>
            <AlertDialogDescription
              className="text-[14px]"
              style={{ fontFamily: F.body, color: C.mute }}
            >
              All collected stamps and quiz scores on this device will be cleared.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              style={{
                borderColor: "#D5CBB4",
                backgroundColor: C.paper,
                color: C.ink,
              }}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleReset}
              style={{
                backgroundColor: C.red,
                color: "#FFFFFF",
              }}
            >
              Reset Passport
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
