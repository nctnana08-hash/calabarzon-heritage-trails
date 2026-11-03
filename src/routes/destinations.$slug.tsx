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
import { C, F, getCategoryMeta } from "@/lib/sulyap-theme";

type DetailMode = "detail" | "tour" | "quiz";

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div
      className="flex items-start py-2.5"
      style={{
        borderBottomWidth: 2,
        borderBottomStyle: "dotted",
        borderBottomColor: C.mute,
      }}
    >
      <Label className="w-24 shrink-0">{k}</Label>
      <span
        className="flex-1 text-[15px] font-bold leading-[21px]"
        style={{ fontFamily: F.bold, color: C.ink }}
      >
        {v}
      </span>
    </div>
  );
}

export const Route = createFileRoute("/destinations/$slug")({
  head: () => ({
    meta: [
      { title: "Place Details | Sulyap" },
      {
        name: "description",
        content:
          "Explore a CALABARZON heritage site: take its three-stop virtual tour, answer the quiz, and earn a Pasaporte stamp.",
      },
      { property: "og:title", content: "Place Details | Sulyap" },
      {
        property: "og:description",
        content:
          "Explore a CALABARZON heritage site: take its three-stop virtual tour, answer the quiz, and earn a Pasaporte stamp.",
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
    if (destination) document.title = `${destination.name} | Sulyap`;
  }, [destination]);

  const goBackToList = () => navigate({ to: "/destinations", search: { view: "list" } });

  const confirmDelete = () => {
    if (!destination) return;
    deleteMutation.mutate(destination, {
      onSuccess: () => {
        toast.success(`Deleted "${destination.name}".`);
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
              className="h-64 animate-pulse rounded-xl sm:h-80"
              style={{
                backgroundColor: C.sand,
                borderWidth: 2,
                borderStyle: "solid",
                borderColor: C.ink,
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
            <h1 className="text-[24px]" style={{ fontFamily: F.display, color: C.red }}>
              Hindi nabuksan ang pahina
            </h1>
            <p className="my-2 text-[15px]" style={{ fontFamily: F.body, color: C.ink }}>
              Could not load this place: {error.message}
            </p>
            <div className="mt-4 w-48">
              <Btn label="Back to places" color={C.card} onClick={goBackToList} />
            </div>
          </Pop>
        )}

        {/* M1.8: Handle getDestination returning null (deleted or missing id) with message and back button */}
        {!isPending && !isError && !destination && (
          <div className="mx-auto max-w-lg py-10">
            <Pop className="p-6 text-center" depth={5} radius={12}>
              <h1 className="text-[28px]" style={{ fontFamily: F.display, color: C.ink }}>
                Wala na ang lugar na ito
              </h1>
              <p
                className="my-3 text-[15px] leading-[22px]"
                style={{ fontFamily: F.body, color: C.mute }}
              >
                This place could not be found or has been removed. Return to Destinasyon to pick
                another heritage site.
              </p>
              <Btn label="Back to Destinasyon" color={C.blue} onClick={goBackToList} />
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

            // M6.2: Open in Maps URL using verified coordinates or address + province
            const mapsQuery =
              destination.latitude != null && destination.longitude != null
                ? `${destination.latitude},${destination.longitude}`
                : `${destination.name}, ${destination.address}, ${destination.province}, Philippines`;
            const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
              mapsQuery,
            )}`;

            return (
              <article className="pb-12">
                <Top onBack={goBackToList} kicker={`${cat.fil} (${destination.category})`} />

                <div className="mt-2 grid grid-cols-1 gap-8 lg:grid-cols-[1fr_360px]">
                  {/* Left Column: Cover, Metadata, Story, Tour & Quiz CTAs */}
                  <div>
                    <Cover
                      destination={destination}
                      className="h-60 w-full rounded-xl sm:h-80"
                      style={{
                        borderWidth: 2,
                        borderStyle: "solid",
                        borderColor: C.ink,
                      }}
                    />

                    <h1
                      className="mt-4 text-[32px] leading-[38px] sm:text-[40px] sm:leading-[46px]"
                      style={{ fontFamily: F.display, color: C.ink }}
                    >
                      {destination.name}
                    </h1>

                    {/* Tour & Quiz Status Pills */}
                    {pr && (pr.toured === 1 || pr.attempts > 0) ? (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {pr.toured === 1 ? (
                          <span
                            className="rounded-full px-3 py-1 text-[13px] font-bold"
                            style={{
                              fontFamily: F.bold,
                              backgroundColor: C.green,
                              color: "#FFFFFF",
                              borderWidth: 2,
                              borderStyle: "solid",
                              borderColor: C.ink,
                            }}
                          >
                            Tour finished
                          </span>
                        ) : null}
                        {pr.attempts > 0 && pr.total > 0 ? (
                          <span
                            className="rounded-full px-3 py-1 text-[13px] font-bold"
                            style={{
                              fontFamily: F.bold,
                              backgroundColor: C.gold,
                              color: C.ink,
                              borderWidth: 2,
                              borderStyle: "solid",
                              borderColor: C.ink,
                            }}
                          >
                            Best score {pr.best}/{pr.total}
                          </span>
                        ) : null}
                      </div>
                    ) : null}

                    {/* Metadata Rows */}
                    <div className="mt-4">
                      <Row k="Address" v={destination.address} />
                      <Row k="Province" v={destination.province} />
                      <Row k="Category" v={`${cat.fil} (${destination.category})`} />
                      {destination.latitude != null && destination.longitude != null ? (
                        <Row
                          k="Coords"
                          v={`${destination.latitude.toFixed(4)}, ${destination.longitude.toFixed(4)}`}
                        />
                      ) : null}
                    </div>

                    {/* Description */}
                    <p
                      className="mt-4 whitespace-pre-line text-[16px] leading-[26px]"
                      style={{ fontFamily: F.body, color: C.ink }}
                    >
                      {destination.description || "No description has been added yet."}
                    </p>

                    {/* M3.2: Mga Sanggunian (Sources) on Detail */}
                    {enrichment.sources ? (
                      <div
                        className="mt-5 rounded-[10px] p-3.5"
                        style={{
                          backgroundColor: C.card,
                          borderWidth: 2,
                          borderStyle: "dashed",
                          borderColor: C.ink,
                        }}
                      >
                        <Label>Mga Sanggunian (Sources)</Label>
                        <p
                          className="mt-1 text-[14px] leading-[20px]"
                          style={{ fontFamily: F.body, color: C.ink }}
                        >
                          {enrichment.sources}
                        </p>
                      </div>
                    ) : null}

                    {/* Primary Learning Actions: Tour + Quiz */}
                    <Sec fil="Maglakbay tayo" en="Learn it, then test it" />
                    <div className="space-y-2.5">
                      <Btn
                        label="Start the virtual tour"
                        sub="Simulan ang paglilibot"
                        color={C.blue}
                        onClick={() => setMode("tour")}
                      />
                      <Btn
                        label="Take the quiz"
                        sub="Pagsusulit"
                        color={C.gold}
                        onClick={() => setMode("quiz")}
                      />
                      {/* M6.2: Open in Maps external link */}
                      <Btn
                        label="Open in Maps"
                        sub="Buksan sa Mapa"
                        color={C.green}
                        onClick={() => window.open(mapsUrl, "_blank", "noopener,noreferrer")}
                      />
                    </div>

                    {/* CRUD Edit / Delete Actions */}
                    <div className="mt-6 grid grid-cols-2 gap-3">
                      <Btn label="Edit" color={C.card} onClick={() => setEditOpen(true)} />
                      <Btn label="Delete" color={C.red} onClick={() => setDeleteOpen(true)} />
                    </div>
                  </div>

                  {/* Right Sidebar: Stamp Preview + Cultural Map */}
                  <aside className="space-y-5">
                    {pr?.toured === 1 ? (
                      <Pop className="flex flex-col items-center p-5 text-center">
                        <Stamp
                          destination={destination}
                          size={128}
                          tilt={-6}
                          label={pr.attempts > 0 && pr.total > 0 ? `${pr.best}/${pr.total}` : "✓"}
                        />
                        <span
                          className="mt-2 text-[18px]"
                          style={{ fontFamily: F.display, color: C.ink }}
                        >
                          Selyo sa Pasaporte
                        </span>
                        <Label>Completed virtual tour</Label>
                      </Pop>
                    ) : null}

                    <Pop className="overflow-hidden">
                      <MapView
                        destinations={[destination]}
                        center={
                          destination.latitude != null && destination.longitude != null
                            ? [destination.latitude, destination.longitude]
                            : undefined
                        }
                        zoom={destination.latitude != null ? 13 : 9}
                        className="h-64 w-full"
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
              backgroundColor: C.paper,
              borderWidth: 2,
              borderStyle: "solid",
              borderColor: C.ink,
            }}
          >
            <DialogHeader>
              <DialogTitle className="text-[26px]" style={{ fontFamily: F.display, color: C.ink }}>
                Edit {destination.name}
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
              Delete this place?
            </AlertDialogTitle>
            <AlertDialogDescription
              className="text-[15px]"
              style={{ fontFamily: F.body, color: C.mute }}
            >
              "{destination?.name}" and its quiz progress will be removed.
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
              Keep it
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              style={{
                borderWidth: 2,
                borderStyle: "solid",
                borderColor: C.ink,
                backgroundColor: C.red,
                color: "#FFFFFF",
                fontFamily: F.bold,
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <MobileBottomNav />
    </div>
  );
}
