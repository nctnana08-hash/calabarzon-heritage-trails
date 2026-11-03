import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { SiteHeader, MobileBottomNav } from "@/components/site-nav";
import { DestinationForm } from "@/components/destination-form";
import { MapView } from "@/components/map-view";
import { SulyapQuiz, SulyapTour } from "@/components/sulyap-tour-quiz";
import { Btn, Cover, Label, Pop, Sec, Stamp, Top } from "@/components/sulyap-ui";
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
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useDeleteDestination, useDestination } from "@/hooks/use-destinations";
import { getDestinationProgress, getEnrichment, useSulyapProgress } from "@/lib/sulyap-data";
import { C, F, PROVINCE_CODES, getCategoryMeta, seedFromId } from "@/lib/sulyap-theme";

type DetailMode = "detail" | "tour" | "quiz";

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div
      className="flex items-start border-b border-dashed py-2.5"
      style={{
        borderColor: "#D5CBB4",
      }}
    >
      <Label className="w-28 shrink-0">{k}</Label>
      <span
        className="flex-1 text-[14px] font-semibold leading-snug"
        style={{ fontFamily: F.body, color: C.ink }}
      >
        {v}
      </span>
    </div>
  );
}

export const Route = createFileRoute("/destinations/$slug")({
  head: () => ({
    meta: [
      { title: "Visa Dossier | Sulyap Pasaporte" },
      {
        name: "description",
        content:
          "Explore a CALABARZON heritage site: take its three-stop virtual tour, answer the quiz, and earn a Pasaporte rubber stamp.",
      },
      { property: "og:title", content: "Visa Dossier | Sulyap Pasaporte" },
      {
        property: "og:description",
        content:
          "Explore a CALABARZON heritage site: take its three-stop virtual tour, answer the quiz, and earn a Pasaporte rubber stamp.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: DestinationDetail,
});

function DestinationDetail() {
  const { slug } = Route.useParams();
  const navigate = useNavigate();
  const { data: destination, isPending, isError, error } = useDestination(slug);
  const progress = useSulyapProgress();
  const deleteMutation = useDeleteDestination();

  const [mode, setMode] = useState<DetailMode>("detail");
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  useEffect(() => {
    setMode("detail");
  }, [slug]);

  useEffect(() => {
    if (destination) document.title = `${destination.name} | Sulyap Pasaporte`;
  }, [destination]);

  const goBackToList = () => navigate({ to: "/destinations", search: { view: "list" } });

  const confirmDelete = () => {
    if (!destination) return;
    deleteMutation.mutate(destination, {
      onSuccess: () => {
        toast.success(`Removed "${destination.name}" from the registry.`);
        goBackToList();
      },
      onError: (e) => toast.error(e.message),
    });
    setDeleteOpen(false);
  };

  return (
    <div className="flex min-h-screen flex-col" style={{ backgroundColor: C.paper }}>
      <SiteHeader />

      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6 sm:py-8">
        {isPending && (
          <div className="space-y-4 py-4">
            <div
              className="h-64 animate-pulse rounded-xl border sm:h-80"
              style={{
                backgroundColor: C.sand,
                borderColor: "#C8BDA4",
              }}
            />
            <div
              className="h-10 w-2/3 animate-pulse rounded-lg"
              style={{ backgroundColor: C.sand }}
            />
            <div className="h-28 animate-pulse rounded-lg" style={{ backgroundColor: C.sand }} />
          </div>
        )}

        {isError && (
          <Pop className="my-6 p-6">
            <h1 className="text-[24px] font-bold" style={{ fontFamily: F.display, color: C.red }}>
              Hindi nabuksan ang pahina
            </h1>
            <p className="my-2 text-[15px]" style={{ fontFamily: F.body, color: C.ink }}>
              Could not load this place: {error.message}
            </p>
            <div className="mt-4 w-48">
              <Btn label="Back to Directory" color={C.card} onClick={goBackToList} />
            </div>
          </Pop>
        )}

        {/* Handle getDestination returning null (deleted or missing id) */}
        {!isPending && !isError && !destination && (
          <div className="mx-auto max-w-lg py-10">
            <Pop className="passport-page-surface p-6 text-center">
              <h1 className="text-[28px] font-bold" style={{ fontFamily: F.display, color: C.ink }}>
                Wala na ang lugar na ito
              </h1>
              <p
                className="my-3 text-[14px] leading-relaxed"
                style={{ fontFamily: F.body, color: C.mute }}
              >
                This heritage visa dossier could not be found or has been removed. Return to the
                Visa Directory to inspect another heritage site.
              </p>
              <Btn label="Back to Visa Directory" color={C.cover} onClick={goBackToList} />
            </Pop>
          </div>
        )}

        {destination && mode === "tour" && (
          <SulyapTour
            destination={destination}
            onBack={() => setMode("detail")}
            onStartQuiz={() => setMode("quiz")}
          />
        )}

        {destination && mode === "quiz" && (
          <SulyapQuiz
            destination={destination}
            onBack={() => setMode("detail")}
            onReviewTour={() => setMode("tour")}
            onOpenPassport={() => navigate({ to: "/destinations", search: { view: "passport" } })}
          />
        )}

        {destination &&
          mode === "detail" &&
          (() => {
            const cat = getCategoryMeta(destination.category);
            const pr = getDestinationProgress(destination, progress);
            const enrichment = getEnrichment(destination);
            const provCode = PROVINCE_CODES[destination.province] ?? "IVA";
            const seed = seedFromId(destination.slug || destination.id);
            const visaSerial = `IV-A-${provCode}-${String(seed).padStart(3, "0")}`;

            const mapsQuery =
              destination.latitude != null && destination.longitude != null
                ? `${destination.latitude},${destination.longitude}`
                : `${destination.name}, ${destination.address}, ${destination.province}, Philippines`;
            const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
              mapsQuery,
            )}`;

            return (
              <article className="pb-12">
                <Top
                  onBack={goBackToList}
                  kicker={`OFFICIAL VISA DOSSIER · ${visaSerial} · ${cat.fil.toUpperCase()}`}
                />

                <div className="mt-4 grid grid-cols-1 gap-6 lg:grid-cols-[1fr_360px]">
                  {/* Left Column: Official Visa Dossier Page */}
                  <div className="passport-page-surface rounded-xl border border-[#C8BDA4] p-5 shadow-sm sm:p-7">
                    {/* Framed Archival Photograph */}
                    <div className="rounded-md border border-[#BFB399] bg-[#EAE2CE] p-2.5 shadow-inner">
                      <Cover destination={destination} className="h-60 w-full rounded-xs sm:h-80" />
                    </div>

                    <div className="mt-5 flex flex-wrap items-center justify-between gap-2">
                      <span
                        className="text-[11px] font-bold uppercase tracking-[0.16em]"
                        style={{ fontFamily: F.mono, color: cat.deep }}
                      >
                        SEAL CLASSIFICATION: {cat.code} · {destination.category}
                      </span>

                      <div className="flex flex-wrap gap-1.5">
                        {pr?.toured === 1 ? (
                          <span
                            className="rounded-xs border px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-[0.1em]"
                            style={{
                              fontFamily: F.mono,
                              backgroundColor: "rgba(35, 99, 67, 0.12)",
                              borderColor: C.green,
                              color: C.green,
                            }}
                          >
                            ★ Entry Stamped
                          </span>
                        ) : (
                          <span
                            className="rounded-xs border border-dashed px-2.5 py-0.5 text-[11px] uppercase tracking-[0.1em]"
                            style={{
                              fontFamily: F.mono,
                              borderColor: "#B8AC93",
                              color: C.mute,
                            }}
                          >
                            Unstamped Visa
                          </span>
                        )}
                        {pr && pr.attempts > 0 && pr.total > 0 ? (
                          <span
                            className="rounded-xs border px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-[0.1em]"
                            style={{
                              fontFamily: F.mono,
                              backgroundColor: "rgba(212, 168, 67, 0.2)",
                              borderColor: "#9A701E",
                              color: C.ink,
                            }}
                          >
                            Examiner {pr.best}/{pr.total}
                          </span>
                        ) : null}
                      </div>
                    </div>

                    <h1
                      className="mt-2 text-[32px] font-bold leading-tight sm:text-[40px]"
                      style={{ fontFamily: F.display, color: C.ink }}
                    >
                      {destination.name}
                    </h1>

                    {/* Metadata Rows */}
                    <div className="mt-4 rounded-md border border-[#D5CBB4] bg-[#FCF9F0]/80 px-4 py-1">
                      <Row k="VISA SERIAL" v={visaSerial} />
                      <Row k="MUNICIPALITY" v={destination.address} />
                      <Row k="PROVINCE" v={`${destination.province} (Sector ${provCode})`} />
                      <Row k="CLASSIFICATION" v={`${cat.fil} (${destination.category})`} />
                      {destination.latitude != null && destination.longitude != null ? (
                        <Row
                          k="COORDINATES"
                          v={`${destination.latitude.toFixed(4)}° N, ${destination.longitude.toFixed(4)}° E`}
                        />
                      ) : null}
                    </div>

                    {/* Description */}
                    <div className="mt-5">
                      <Label className="mb-1.5">CURATORIAL BRIEFING / PAGLALARAWAN</Label>
                      <p
                        className="whitespace-pre-line text-[15px] leading-relaxed sm:text-[16px]"
                        style={{ fontFamily: F.body, color: C.ink }}
                      >
                        {destination.description || "No description has been added yet."}
                      </p>
                    </div>

                    {/* Mga Sanggunian (Sources) */}
                    {enrichment.sources ? (
                      <div
                        className="mt-5 rounded-md border border-dashed p-3.5"
                        style={{
                          backgroundColor: "#EFE9D8",
                          borderColor: "#B8AC93",
                        }}
                      >
                        <Label>MGA SANGGUNIAN · VERIFIED ARCHIVAL SOURCES</Label>
                        <p
                          className="mt-1 text-[13px] leading-relaxed"
                          style={{ fontFamily: F.body, color: C.ink }}
                        >
                          {enrichment.sources}
                        </p>
                      </div>
                    ) : null}

                    {/* Primary Learning Actions: Tour + Quiz */}
                    <Sec
                      fil="Inspeksyon at Tatak sa Pasaporte"
                      en="COMPLETE THE 3-STOP VIRTUAL TOUR TO STAMP YOUR PASSPORT"
                    />
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                      <Btn
                        label="Start 3-Stop Tour"
                        sub="Earn Visa Stamp"
                        color={C.cover}
                        onClick={() => setMode("tour")}
                      />
                      <Btn
                        label="Examiner's Quiz"
                        sub="4-Item Verification"
                        color={C.foil}
                        onClick={() => setMode("quiz")}
                      />
                      <Btn
                        label="Open in Maps"
                        sub="Satellite Coordinates"
                        color={C.green}
                        onClick={() => window.open(mapsUrl, "_blank", "noopener,noreferrer")}
                      />
                    </div>

                    {/* CRUD Edit / Delete Actions */}
                    <div className="mt-6 flex items-center justify-between border-t border-dashed border-[#D5CBB4] pt-4">
                      <Label>REGISTRY RECORD CONTROLS</Label>
                      <div className="flex gap-2.5">
                        <button
                          type="button"
                          onClick={() => setEditOpen(true)}
                          className="cursor-pointer rounded-xs border border-[#B8AC93] bg-[#FCF9F0] px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.12em] hover:bg-[#EAE2CE]"
                          style={{ fontFamily: F.mono, color: C.ink }}
                        >
                          ✎ Edit Dossier
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteOpen(true)}
                          className="cursor-pointer rounded-xs border px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.12em] hover:opacity-90"
                          style={{
                            fontFamily: F.mono,
                            borderColor: C.red,
                            color: C.red,
                            backgroundColor: "rgba(158, 42, 43, 0.06)",
                          }}
                        >
                          ✕ Delete
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Right Sidebar: Official Visa Stamp Box + Cartography Map */}
                  <aside className="space-y-5">
                    <Pop className="passport-page-surface flex flex-col items-center p-5 text-center">
                      <div className="mb-3 flex w-full items-center justify-between border-b border-dashed border-[#D5CBB4] pb-2">
                        <span
                          className="text-[10px] font-bold uppercase tracking-[0.14em]"
                          style={{ fontFamily: F.mono, color: C.mute }}
                        >
                          OFFICIAL VISA STAMP BOX
                        </span>
                        <span
                          className="text-[10px] font-bold uppercase"
                          style={{
                            fontFamily: F.mono,
                            color: pr?.toured === 1 ? cat.deep : C.mute,
                          }}
                        >
                          {pr?.toured === 1 ? "★ STAMPED" : "AWAITING VISIT"}
                        </span>
                      </div>

                      {pr?.toured === 1 ? (
                        <>
                          <div className="my-2">
                            <Stamp
                              destination={destination}
                              size={148}
                              tilt={-6}
                              label={
                                pr.attempts > 0 && pr.total > 0 ? `${pr.best}/${pr.total}` : "✓"
                              }
                            />
                          </div>
                          <span
                            className="mt-2 text-[20px] font-bold"
                            style={{ fontFamily: F.display, color: C.ink }}
                          >
                            Tatak ng Pagbisita
                          </span>
                          <Label className="mt-0.5">
                            STAMPED IN YOUR PASAPORTE ·{" "}
                            {pr.attempts > 0 ? `QUIZ ${pr.best}/${pr.total}` : "TOUR VERIFIED"}
                          </Label>
                          <div className="mt-4 w-full">
                            <Btn
                              label="Open Stamp Booklet"
                              sub="View All Visas"
                              color={C.foil}
                              onClick={() =>
                                navigate({
                                  to: "/destinations",
                                  search: { view: "passport" },
                                })
                              }
                            />
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="my-3 flex size-36 flex-col items-center justify-center rounded-full border-2 border-dashed border-[#BFB399] p-4 text-center">
                            <span
                              className="text-[10px] font-bold uppercase tracking-[0.14em]"
                              style={{ fontFamily: F.mono, color: C.mute }}
                            >
                              {cat.code}
                            </span>
                            <span
                              className="mt-1 text-[13px] font-bold leading-tight"
                              style={{ fontFamily: F.display, color: C.mute }}
                            >
                              STAMP HERE UPON COMPLETION OF VIRTUAL TOUR
                            </span>
                          </div>
                          <div className="mt-2 w-full">
                            <Btn
                              label="Begin 3-Stop Tour"
                              sub="Earn This Stamp Now"
                              color={C.cover}
                              onClick={() => setMode("tour")}
                            />
                          </div>
                        </>
                      )}
                    </Pop>

                    <Pop className="overflow-hidden p-1.5">
                      <div className="px-2.5 py-1.5">
                        <Label>CARTOGRAPHIC LOCATION · {provCode}</Label>
                      </div>
                      <MapView
                        destinations={[destination]}
                        center={
                          destination.latitude != null && destination.longitude != null
                            ? [destination.latitude, destination.longitude]
                            : undefined
                        }
                        zoom={destination.latitude != null ? 13 : 9}
                        className="h-64 w-full rounded-xs"
                      />
                    </Pop>
                  </aside>
                </div>
              </article>
            );
          })()}
      </main>

      {/* Edit Modal */}
      {destination ? (
        <Dialog open={editOpen} onOpenChange={setEditOpen}>
          <DialogContent
            className="max-h-[90vh] overflow-y-auto sm:max-w-2xl"
            style={{
              backgroundColor: C.card,
              borderWidth: 1.5,
              borderStyle: "solid",
              borderColor: "#B8AC93",
            }}
          >
            <DialogHeader>
              <DialogTitle
                className="text-[26px] font-bold"
                style={{ fontFamily: F.display, color: C.ink }}
              >
                Edit Visa Dossier: {destination.name}
              </DialogTitle>
            </DialogHeader>
            <DestinationForm destination={destination} onDone={() => setEditOpen(false)} />
          </DialogContent>
        </Dialog>
      ) : null}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
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
              Remove this heritage site from the registry?
            </AlertDialogTitle>
            <AlertDialogDescription
              className="text-[14px]"
              style={{ fontFamily: F.body, color: C.mute }}
            >
              "{destination?.name}" and its associated visa stamp progress will be deleted.
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
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              style={{
                backgroundColor: C.red,
                color: "#FFFFFF",
                fontFamily: F.mono,
              }}
            >
              Delete Dossier
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <MobileBottomNav />
    </div>
  );
}
