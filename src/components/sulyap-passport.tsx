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
import { C, F, PROVINCE_CODES, PROVINCE_TONES, getCategoryMeta } from "@/lib/sulyap-theme";
import { Btn, Label, Mark, Pop, Sec, Stamp } from "./sulyap-ui";

const TILT = [-6, 4, -3, 7, -5, 3];
const BEARER_STORAGE_KEY = "sulyap.passport.bearer.v1";

export function SulyapPassport({ destinations }: { destinations: Destination[] }) {
  const navigate = useNavigate();
  const progress = useSulyapProgress();
  const [resetOpen, setResetOpen] = useState(false);
  const [activeProvince, setActiveProvince] = useState<string>("All");
  const [bearerName, setBearerName] = useState("MANLALAKBAY NG CALABARZON");
  const [editingName, setEditingName] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const saved = window.localStorage.getItem(BEARER_STORAGE_KEY);
    if (saved && saved.trim()) {
      setBearerName(saved.trim().toUpperCase());
    }
  }, []);

  const saveBearerName = (val: string) => {
    const clean = (val.trim() || "MANLALAKBAY NG CALABARZON").toUpperCase();
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
    toast.success("Pasaporte stamps and quiz records have been cleared.");
  };

  const mrzName = bearerName
    .replace(/[^A-Z]/g, "<")
    .padEnd(24, "<")
    .slice(0, 24);
  const mrzLine1 = `P<PHLSULYAP<<${mrzName}<<<<<<<<<<<`;
  const mrzLine2 = `IVA0019264PHL9806121M3012315STAMP${String(stamped).padStart(2, "0")}<<<08`;

  return (
    <div className="mx-auto w-full max-w-5xl">
      {/* Official Embossed Leather Passport Cover Banner & Bearer Bio-Data Page */}
      <div
        className="overflow-hidden rounded-xl border-2 shadow-xl"
        style={{
          backgroundColor: C.coverDeep,
          borderColor: C.foil,
        }}
      >
        {/* Top Gold-Foil Leather Cover Header */}
        <div
          className="passport-leather-cover flex flex-wrap items-center justify-between gap-4 border-b px-5 py-4 sm:px-7"
          style={{ borderColor: "rgba(212, 175, 55, 0.35)" }}
        >
          <div className="flex items-center gap-3.5">
            <Mark size={44} />
            <div>
              <div
                className="text-[10px] font-semibold uppercase tracking-[0.22em]"
                style={{ fontFamily: F.mono, color: C.foil }}
              >
                REPUBLIKA NG PILIPINAS · REHIYON IV-A (CALABARZON)
              </div>
              <h1
                className="text-[26px] font-bold tracking-[0.04em] leading-tight sm:text-[32px]"
                style={{ fontFamily: F.display, color: "#FCF9F0" }}
              >
                PASAPORTE NG PAMANA
              </h1>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 print:hidden">
            <button
              type="button"
              onClick={() => window.print()}
              className="cursor-pointer rounded-md border px-3.5 py-2 text-[12px] font-semibold uppercase tracking-[0.1em] transition-colors hover:opacity-90"
              style={{
                fontFamily: F.mono,
                backgroundColor: C.foil,
                borderColor: C.foil,
                color: C.ink,
              }}
            >
              ⎙ Print Booklet
            </button>
            {stamped > 0 || tries > 0 ? (
              <button
                type="button"
                onClick={() => setResetOpen(true)}
                className="cursor-pointer rounded-md border px-3.5 py-2 text-[12px] font-semibold uppercase tracking-[0.1em] transition-colors hover:bg-white/10"
                style={{
                  fontFamily: F.mono,
                  borderColor: "rgba(212, 175, 55, 0.55)",
                  color: "#FCF9F0",
                }}
              >
                Clear Stamps
              </button>
            ) : null}
          </div>
        </div>

        {/* Inner Passport Bearer Identity & Bio-Data Page */}
        <div className="passport-page-surface m-2.5 rounded-lg border border-[#C8BDA4] p-5 sm:m-4 sm:p-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-12">
            {/* Left Bearer Portrait & Official Seal Box */}
            <div className="flex flex-col items-center justify-between rounded-md border border-[#BFB399] bg-[#EAE2CE] p-4 text-center md:col-span-3">
              <div
                className="text-[10px] font-bold uppercase tracking-[0.16em]"
                style={{ fontFamily: F.mono, color: C.mute }}
              >
                OFFICIAL BEARER SEAL
              </div>
              <div className="my-3 flex size-24 items-center justify-center rounded-full border-2 border-dashed border-[#8C7A5B] bg-[#FCF9F0] shadow-inner">
                <Mark size={64} />
              </div>
              <div
                className="w-full border-t border-dashed border-[#BFB399] pt-2 text-[11px] font-bold uppercase tracking-[0.12em]"
                style={{ fontFamily: F.mono, color: C.cover }}
              >
                {stamped >= destinations.length
                  ? "★ MASTER CHRONICLER"
                  : stamped >= 10
                    ? "★ SENIOR EXPLORER"
                    : stamped >= 3
                      ? "★ FIELD VOYAGER"
                      : "★ PILGRIM BEARER"}
              </div>
            </div>

            {/* Right Bearer Particulars & Live Stamp Tally */}
            <div className="flex flex-col justify-between md:col-span-9">
              <div className="grid grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-4">
                <div className="col-span-2">
                  <Label>BEARER NAME / PANGALAN NG MANLALAKBAY</Label>
                  {editingName ? (
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        saveBearerName(bearerName);
                      }}
                      className="mt-1 flex items-center gap-2"
                    >
                      <input
                        type="text"
                        value={bearerName}
                        onChange={(e) => setBearerName(e.target.value)}
                        maxLength={32}
                        autoFocus
                        className="w-full rounded-xs border border-[#8C7A5B] bg-white px-2.5 py-1 text-[14px] font-bold uppercase"
                        style={{ fontFamily: F.mono, color: C.ink }}
                      />
                      <button
                        type="submit"
                        className="cursor-pointer rounded-xs px-2.5 py-1 text-[11px] font-bold uppercase"
                        style={{
                          fontFamily: F.mono,
                          backgroundColor: C.cover,
                          color: "#FFFFFF",
                        }}
                      >
                        Save
                      </button>
                    </form>
                  ) : (
                    <div className="mt-0.5 flex items-center gap-2">
                      <span
                        className="truncate text-[18px] font-bold tracking-[0.04em]"
                        style={{ fontFamily: F.mono, color: C.ink }}
                      >
                        {bearerName}
                      </span>
                      <button
                        type="button"
                        onClick={() => setEditingName(true)}
                        className="cursor-pointer rounded-xs border border-[#C8BDA4] px-1.5 py-0.5 text-[10px] font-semibold uppercase hover:bg-[#EAE2CE] print:hidden"
                        style={{ fontFamily: F.mono, color: C.mute }}
                      >
                        Edit
                      </button>
                    </div>
                  )}
                </div>

                <div>
                  <Label>PASSPORT NO.</Label>
                  <div
                    className="mt-0.5 text-[15px] font-bold"
                    style={{ fontFamily: F.mono, color: C.cover }}
                  >
                    PH-IVA-019
                  </div>
                </div>

                <div>
                  <Label>ISSUING AUTHORITY</Label>
                  <div
                    className="mt-0.5 text-[14px] font-bold"
                    style={{ fontFamily: F.mono, color: C.ink }}
                  >
                    SULYAP · REGION IV-A
                  </div>
                </div>
              </div>

              {/* Three Key Visa Metrics */}
              <div className="my-4 grid grid-cols-3 gap-3 rounded-md border border-[#D5CBB4] bg-[#FCF9F0]/90 p-3.5">
                <div>
                  <Label>VISA STAMPS EARNED</Label>
                  <div
                    className="mt-0.5 text-[26px] font-bold leading-tight sm:text-[30px]"
                    style={{ fontFamily: F.display, color: C.cover }}
                  >
                    {stamped}{" "}
                    <span className="text-[16px] text-[#635E54]">/ {destinations.length}</span>
                  </div>
                </div>
                <div className="border-x border-dashed border-[#D5CBB4] px-3">
                  <Label>EXAMINER MASTERY</Label>
                  <div
                    className="mt-0.5 text-[26px] font-bold leading-tight sm:text-[30px]"
                    style={{ fontFamily: F.display, color: C.blue }}
                  >
                    {avg}%
                  </div>
                </div>
                <div className="pl-1">
                  <Label>QUIZ INSPECTIONS</Label>
                  <div
                    className="mt-0.5 text-[26px] font-bold leading-tight sm:text-[30px]"
                    style={{ fontFamily: F.display, color: C.green }}
                  >
                    {tries}
                  </div>
                </div>
              </div>

              {/* Machine Readable Passport Zone (MRZ) */}
              <div
                className="overflow-x-auto rounded-xs border border-[#D5CBB4] bg-[#EFE9D8] px-3 py-2 text-[11px] leading-relaxed tracking-[0.18em] select-all sm:text-[12px]"
                style={{ fontFamily: F.mono, color: "#3A352D" }}
              >
                <div>{mrzLine1}</div>
                <div>{mrzLine2}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Regional Visa Jurisdiction Tabs */}
      <Sec
        fil="Talaan ng mga Lalawigan"
        en="REGIONAL JURISDICTIONS · FILTER YOUR PASSPORT VISA PAGES BY PROVINCE"
      />
      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-6">
        <button
          type="button"
          onClick={() => setActiveProvince("All")}
          className="flex cursor-pointer flex-col justify-between rounded-lg border p-3 text-left transition-all"
          style={{
            backgroundColor: activeProvince === "All" ? C.cover : C.card,
            borderColor: activeProvince === "All" ? C.foil : "#C8BDA4",
            color: activeProvince === "All" ? "#FCF9F0" : C.ink,
          }}
        >
          <span
            className="text-[10px] font-bold uppercase tracking-[0.14em]"
            style={{
              fontFamily: F.mono,
              color: activeProvince === "All" ? C.foil : C.mute,
            }}
          >
            REGION IV-A
          </span>
          <div className="mt-1 flex items-baseline justify-between">
            <span className="text-[18px] font-bold" style={{ fontFamily: F.display }}>
              All Pages
            </span>
            <span className="text-[12px] font-bold" style={{ fontFamily: F.mono }}>
              {stamped}/{destinations.length}
            </span>
          </div>
        </button>

        {PROVINCES.map((prov) => {
          const provPlaces = destinations.filter((d) => d.province === prov);
          const provStamped = provPlaces.filter(
            (d) => getDestinationProgress(d, progress)?.toured === 1,
          ).length;
          const pct = provPlaces.length ? Math.round((100 * provStamped) / provPlaces.length) : 0;
          const tone = PROVINCE_TONES[prov] ?? C.blue;
          const isSelected = activeProvince === prov;
          const code = PROVINCE_CODES[prov] ?? "IVA";

          return (
            <button
              key={prov}
              type="button"
              onClick={() => setActiveProvince(prov)}
              aria-label={`${prov}: ${provStamped} of ${provPlaces.length} stamped`}
              className="flex cursor-pointer flex-col justify-between rounded-lg border p-3 text-left transition-all"
              style={{
                backgroundColor: isSelected ? C.cover : C.card,
                borderColor: isSelected ? C.foil : "#C8BDA4",
                color: isSelected ? "#FCF9F0" : C.ink,
              }}
            >
              <div className="flex items-center justify-between">
                <span
                  className="text-[10px] font-bold uppercase tracking-[0.14em]"
                  style={{
                    fontFamily: F.mono,
                    color: isSelected ? C.foil : C.mute,
                  }}
                >
                  SECTOR {code}
                </span>
                <span
                  className="text-[11px] font-bold"
                  style={{
                    fontFamily: F.mono,
                    color: isSelected ? "#FCF9F0" : C.mute,
                  }}
                >
                  {provStamped}/{provPlaces.length}
                </span>
              </div>

              <div className="mt-1 text-[18px] font-bold" style={{ fontFamily: F.display }}>
                {prov}
              </div>

              <div
                className="mt-2 h-1.5 overflow-hidden rounded-full"
                style={{
                  backgroundColor: isSelected ? "rgba(255,255,255,0.2)" : "#E2D9C3",
                }}
              >
                <div
                  className="h-full transition-all duration-300"
                  style={{
                    width: `${pct}%`,
                    backgroundColor: isSelected ? C.foil : tone,
                  }}
                />
              </div>
            </button>
          );
        })}
      </div>

      {/* Open Physical Two-Page Passport Visa Booklet */}
      <Sec
        fil="Mga Pahina ng Tatak at Bisita"
        en="OFFICIAL ENTRY & EXIT VISA STAMPS · COMPLETE A 3-STOP VIRTUAL TOUR TO STAMP YOUR PASSPORT"
      />

      <div
        className="relative overflow-hidden rounded-xl border-2 p-2.5 shadow-xl sm:p-4"
        style={{
          backgroundColor: C.coverDeep,
          borderColor: C.foil,
        }}
      >
        {/* Open Passport Paper Spread */}
        <div className="passport-page-surface relative overflow-hidden rounded-lg border border-[#C8BDA4] p-4 sm:p-6">
          {/* Center Stitched Booklet Spine on Desktop */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute top-0 bottom-0 left-1/2 hidden w-6 -translate-x-1/2 lg:flex lg:items-center lg:justify-center"
            style={{
              background:
                "linear-gradient(90deg, rgba(30,35,42,0) 0%, rgba(30,35,42,0.08) 48%, rgba(30,35,42,0.16) 50%, rgba(30,35,42,0.08) 52%, rgba(30,35,42,0) 100%)",
            }}
          >
            <div className="h-full border-l-2 border-dashed border-[#9E9077]" />
          </div>

          {/* Passport Spread Top Running Header */}
          <div
            className="mb-4 flex items-center justify-between border-b pb-2 text-[11px] font-bold uppercase tracking-[0.18em]"
            style={{ borderColor: "#D5CBB4", fontFamily: F.mono, color: C.mute }}
          >
            <span>VISAS · MGA TATAK NG PAGBISITA</span>
            <span>
              {activeProvince === "All"
                ? "ALL CALABARZON SECTORS"
                : `PROVINCE OF ${activeProvince.toUpperCase()}`}
            </span>
          </div>

          {/* Visa Stamp Boxes Grid */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {visibleDestinations.map((d, n) => {
              const p = getDestinationProgress(d, progress);
              const isToured = p?.toured === 1;
              const cat = getCategoryMeta(d.category);
              const provCode = PROVINCE_CODES[d.province] ?? "IVA";
              const visaNumber = String(n + 1).padStart(2, "0");

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
                  className="group relative flex min-h-[210px] cursor-pointer flex-col justify-between rounded-md border p-3 text-left transition-all hover:bg-[#FCF9F0] hover:shadow-md focus-visible:outline-2"
                  style={{
                    borderColor: isToured ? "#B5A689" : "#D5CBB4",
                    backgroundColor: isToured
                      ? "rgba(252, 249, 240, 0.92)"
                      : "rgba(246, 241, 227, 0.55)",
                    outlineColor: C.cover,
                  }}
                >
                  {/* Top Visa Box Serial Header */}
                  <div className="flex w-full items-center justify-between border-b border-dashed border-[#D5CBB4] pb-1.5">
                    <span
                      className="text-[10px] font-bold uppercase tracking-[0.14em]"
                      style={{ fontFamily: F.mono, color: C.mute }}
                    >
                      VISA BOX {visaNumber} · {provCode}
                    </span>
                    <span
                      className="text-[10px] font-bold uppercase tracking-[0.1em]"
                      style={{
                        fontFamily: F.mono,
                        color: isToured ? cat.deep : C.mute,
                      }}
                    >
                      {isToured ? "★ STAMPED" : "UNSTAMPED"}
                    </span>
                  </div>

                  {/* Center Stamp Area */}
                  <div className="my-2 flex flex-1 items-center justify-center">
                    {isToured ? (
                      <Stamp
                        destination={d}
                        size={134}
                        tilt={TILT[n % TILT.length]!}
                        label={p && p.attempts > 0 && p.total > 0 ? `${p.best}/${p.total}` : "✓"}
                      />
                    ) : (
                      <div className="flex size-[124px] flex-col items-center justify-center rounded-full border-2 border-dashed border-[#C7BCA4] p-3 text-center transition-colors group-hover:border-[#8C7A5B]">
                        <span
                          className="text-[9px] font-bold uppercase tracking-[0.16em]"
                          style={{ fontFamily: F.mono, color: "#8E8472" }}
                        >
                          {cat.code}
                        </span>
                        <span
                          className="mt-1 line-clamp-2 text-[14px] font-bold leading-tight"
                          style={{ fontFamily: F.display, color: C.ink }}
                        >
                          {d.name}
                        </span>
                        <span
                          className="mt-1.5 rounded-xs border border-dashed border-[#BFB399] px-1.5 py-0.5 text-[9px] uppercase tracking-[0.12em]"
                          style={{ fontFamily: F.mono, color: C.mute }}
                        >
                          Tap to Visit →
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Bottom Visa Box Caption */}
                  <div className="flex w-full items-center justify-between border-t border-dashed border-[#D5CBB4] pt-1.5 text-[10px]">
                    <span
                      className="truncate font-semibold"
                      style={{ fontFamily: F.body, color: C.ink }}
                    >
                      {d.name}
                    </span>
                    <span
                      className="shrink-0 pl-2 uppercase"
                      style={{ fontFamily: F.mono, color: C.mute }}
                    >
                      {d.province}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Passport Spread Bottom Page Footer */}
          <div
            className="mt-5 flex items-center justify-between border-t pt-2.5 text-[10px] font-semibold uppercase tracking-[0.18em]"
            style={{ borderColor: "#D5CBB4", fontFamily: F.mono, color: C.mute }}
          >
            <span>REPUBLIKA NG PILIPINAS · PASAPORTE NG PAMANA</span>
            <span>PAGE 02 — 03</span>
          </div>
        </div>
      </div>

      {/* Examiner's Field Quiz Ledger */}
      <Sec
        fil="Talaan ng Pagsusulit"
        en="EXAMINER'S VERIFICATION LEDGER · RECORD OF HERITAGE QUIZZES COMPLETED"
      />
      {scored.length === 0 ? (
        <Pop className="passport-page-surface p-6">
          <p className="text-[15px] leading-relaxed" style={{ fontFamily: F.body, color: C.mute }}>
            No heritage examiner assessments recorded yet. Open any destination visa entry and
            complete its 4-question cultural verification quiz to log your official score here.
          </p>
          <div className="mt-4 w-56">
            <Btn
              label="Inspect Heritage Sites"
              sub="Open Field Directory"
              color={C.cover}
              onClick={() => navigate({ to: "/destinations", search: { view: "list" } })}
            />
          </div>
        </Pop>
      ) : (
        <div className="space-y-3">
          {scored.map(({ destination: d, prog }) => {
            if (!prog) return null;
            const cat = getCategoryMeta(d.category);
            const pct = Math.min(100, Math.round((100 * prog.best) / prog.total));
            const provCode = PROVINCE_CODES[d.province] ?? "IVA";
            return (
              <Pop key={d.id} className="passport-page-surface p-4">
                <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <span
                      className="text-[10px] font-bold uppercase tracking-[0.14em]"
                      style={{ fontFamily: F.mono, color: cat.deep }}
                    >
                      {provCode} · {cat.fil} ({d.category})
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        navigate({
                          to: "/destinations/$slug",
                          params: { slug: d.slug },
                        })
                      }
                      className="block cursor-pointer text-left text-[19px] font-bold hover:underline"
                      style={{ fontFamily: F.display, color: C.ink }}
                    >
                      {d.name}
                    </button>
                  </div>
                  <div className="text-right">
                    <span
                      className="inline-block rounded-xs border px-2.5 py-1 text-[13px] font-bold"
                      style={{
                        fontFamily: F.mono,
                        borderColor: cat.deep,
                        backgroundColor: "rgba(252,249,240,0.9)",
                        color: cat.deep,
                      }}
                    >
                      SCORE {prog.best}/{prog.total} ({pct}%)
                    </span>
                  </div>
                </div>
                <div
                  className="h-2 overflow-hidden rounded-full"
                  style={{
                    backgroundColor: "#E2D9C3",
                  }}
                >
                  <div
                    className="h-full transition-all duration-300"
                    style={{
                      width: `${pct}%`,
                      backgroundColor: cat.deep,
                    }}
                  />
                </div>
                <Label className="mt-2">
                  INSPECTIONS LOGGED: {prog.attempts} · LATEST SCORE: {prog.last}/{prog.total}
                </Label>
              </Pop>
            );
          })}
        </div>
      )}

      {/* Reset Progress Confirmation */}
      <AlertDialog open={resetOpen} onOpenChange={setResetOpen}>
        <AlertDialogContent
          style={{
            backgroundColor: C.card,
            borderWidth: 1.5,
            borderStyle: "solid",
            borderColor: "#B8AC93",
          }}
        >
          <AlertDialogHeader>
            <AlertDialogTitle
              className="text-[24px] font-bold"
              style={{ fontFamily: F.display, color: C.ink }}
            >
              Clear all stamps in your Pasaporte?
            </AlertDialogTitle>
            <AlertDialogDescription
              className="text-[14px]"
              style={{ fontFamily: F.body, color: C.mute }}
            >
              All earned rubber visa stamps and quiz verification scores on this device will be
              erased so you can begin a fresh CALABARZON heritage expedition.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              style={{
                borderColor: "#B8AC93",
                backgroundColor: C.paper,
                color: C.ink,
                fontFamily: F.mono,
              }}
            >
              Keep Stamps
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleReset}
              style={{
                backgroundColor: C.red,
                color: "#FFFFFF",
                fontFamily: F.mono,
              }}
            >
              Clear Pasaporte
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
