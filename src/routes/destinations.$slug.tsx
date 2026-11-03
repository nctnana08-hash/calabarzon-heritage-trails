import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { SiteHeader, MobileBottomNav } from "@/components/site-nav";
import { DestinationForm } from "@/components/destination-form";
import { MapView } from "@/components/map-view";
import { SulyapArt360Map } from "@/components/sulyap-art-360";
import { SulyapQuiz, SulyapTour } from "@/components/sulyap-tour-quiz";
import { Btn, Chip, Cover, Label, Pop, Stamp } from "@/components/sulyap-ui";
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

type DetailTab = "overview" | "tour" | "art360" | "quiz";

export const Route = createFileRoute("/destinations/$slug")({
  head: () => ({
    meta: [
      { title: "Place Details | Sulyap" },
      {
        name: "description",
        content: "Explore this CALABARZON heritage site, take the virtual tour, and earn a stamp.",
      },
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

  const [tab, setTab] = useState<DetailTab>("overview");
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  useEffect(() => {
    setTab("overview");
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

      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-6 sm:py-8">
        {isPending && (
          <div className="space-y-4">
            <div className="h-64 animate-pulse rounded-2xl" style={{ backgroundColor: C.sand }} />
            <div
              className="h-8 w-1/2 animate-pulse rounded-lg"
              style={{ backgroundColor: C.sand }}
            />
          </div>
        )}

        {isError && (
          <Pop className="my-6 p-6">
            <p className="text-[15px]" style={{ color: C.red }}>
              Could not load this place: {error.message}
            </p>
            <div className="mt-4 w-40">
              <Btn label="Back to Places" color={C.card} onClick={goBackToList} />
            </div>
          </Pop>
        )}

        {!isPending && !isError && !destination && (
          <div className="mx-auto max-w-md py-12 text-center">
            <Pop className="p-6">
              <h1 className="text-[24px] font-bold" style={{ fontFamily: F.display, color: C.ink }}>
                Place not found
              </h1>
              <p className="my-2 text-[14px]" style={{ fontFamily: F.body, color: C.mute }}>
                This place may have been removed.
              </p>
              <Btn label="Back to Places" color={C.cover} onClick={goBackToList} />
            </Pop>
          </div>
        )}

        {destination &&
          (() => {
            const cat = getCategoryMeta(destination.category);
            const pr = getDestinationProgress(destination, progress);
            const enrichment = getEnrichment(destination);
            const isStamped = pr?.toured === 1;

            const mapsQuery =
              destination.latitude != null && destination.longitude != null
                ? `${destination.latitude},${destination.longitude}`
                : `${destination.name}, ${destination.address}, ${destination.province}, Philippines`;
            const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
              mapsQuery,
            )}`;

            return (
              <article className="pb-12">
                {/* Minimal Top Action Row */}
                <div className="mb-4 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={goBackToList}
                    className="inline-flex cursor-pointer items-center gap-1.5 text-[14px] font-medium hover:underline"
                    style={{ fontFamily: F.body, color: C.ink }}
                  >
                    ← Back to Places
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setEditOpen(true)}
                      className="cursor-pointer rounded-lg border border-[#D5CBB4] bg-[#FCF9F0] px-3 py-1 text-[12px] font-medium hover:bg-[#EAE2CE]"
                      style={{ fontFamily: F.body, color: C.ink }}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteOpen(true)}
                      className="cursor-pointer rounded-lg border border-[#D5CBB4] bg-[#FCF9F0] px-3 py-1 text-[12px] font-medium hover:bg-[#F9E3E3]"
                      style={{ fontFamily: F.body, color: C.red }}
                    >
                      Delete
                    </button>
                  </div>
                </div>

                {/* Clean Hero Card */}
                <Pop className="overflow-hidden">
                  <Cover destination={destination} className="h-56 w-full sm:h-72" />
                  <div className="p-5 sm:p-6">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span
                        className="text-[13px] font-semibold"
                        style={{ fontFamily: F.body, color: cat.deep }}
                      >
                        {destination.province} · {cat.fil} ({destination.category})
                      </span>
                      <div className="flex items-center gap-2">
                        {isStamped ? (
                          <span
                            className="rounded-full px-2.5 py-0.5 text-[12px] font-semibold"
                            style={{
                              backgroundColor: "rgba(35, 99, 67, 0.12)",
                              color: C.green,
                            }}
                          >
                            ✓ Stamped
                          </span>
                        ) : null}
                        {pr && pr.attempts > 0 && pr.total > 0 ? (
                          <span
                            className="rounded-full px-2.5 py-0.5 text-[12px] font-medium"
                            style={{
                              backgroundColor: C.sand,
                              color: C.ink,
                            }}
                          >
                            Quiz {pr.best}/{pr.total}
                          </span>
                        ) : null}
                      </div>
                    </div>

                    <h1
                      className="mt-1 text-[28px] font-bold leading-tight sm:text-[36px]"
                      style={{ fontFamily: F.display, color: C.ink }}
                    >
                      {destination.name}
                    </h1>
                    <p className="mt-1 text-[14px]" style={{ fontFamily: F.body, color: C.mute }}>
                      {destination.address}, {destination.province}
                    </p>

                    {/* Purposeful 4-Tab Bar */}
                    <div className="mt-5 flex flex-wrap gap-2 border-t border-[#E5DEC9] pt-4">
                      <Chip
                        label="Overview"
                        on={tab === "overview"}
                        color={C.cover}
                        onClick={() => setTab("overview")}
                      />
                      <Chip
                        label="Virtual Tour"
                        on={tab === "tour"}
                        color={C.cover}
                        onClick={() => setTab("tour")}
                      />
                      <Chip
                        label="360° Art & Highlights"
                        on={tab === "art360"}
                        color={C.cover}
                        onClick={() => setTab("art360")}
                      />
                      <Chip
                        label="Quiz"
                        on={tab === "quiz"}
                        color={C.cover}
                        onClick={() => setTab("quiz")}
                      />
                    </div>
                  </div>
                </Pop>

                {/* Tab 1: Overview */}
                {tab === "overview" && (
                  <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-[1fr_280px]">
                    <div className="space-y-5">
                      <Pop className="p-5 sm:p-6">
                        <h2
                          className="mb-2 text-[20px] font-bold"
                          style={{ fontFamily: F.display, color: C.ink }}
                        >
                          About this place
                        </h2>
                        <p
                          className="whitespace-pre-line text-[15px] leading-relaxed"
                          style={{ fontFamily: F.body, color: C.ink }}
                        >
                          {destination.description}
                        </p>

                        {enrichment.sources ? (
                          <p
                            className="mt-4 border-t border-[#E5DEC9] pt-3 text-[12px]"
                            style={{ fontFamily: F.body, color: C.mute }}
                          >
                            Source: {enrichment.sources}
                          </p>
                        ) : null}

                        <div className="mt-5 flex flex-wrap gap-2.5">
                          <Btn
                            label={isStamped ? "Revisit Virtual Tour" : "Start Virtual Tour"}
                            color={C.cover}
                            onClick={() => setTab("tour")}
                          />
                          <Btn
                            label="Explore 360° Art"
                            color={C.foil}
                            onClick={() => setTab("art360")}
                          />
                          <Btn
                            label="Open in Google Maps ↗"
                            color={C.card}
                            onClick={() => window.open(mapsUrl, "_blank", "noopener,noreferrer")}
                          />
                        </div>
                      </Pop>

                      <Pop className="overflow-hidden p-1">
                        <MapView
                          destinations={[destination]}
                          center={
                            destination.latitude != null && destination.longitude != null
                              ? [destination.latitude, destination.longitude]
                              : undefined
                          }
                          zoom={destination.latitude != null ? 13 : 9}
                          className="h-60 w-full rounded-lg"
                        />
                      </Pop>
                    </div>

                    {/* Minimal Stamp Box Sidebar */}
                    <aside>
                      <Pop className="flex flex-col items-center p-5 text-center">
                        <Label className="mb-3">PASSPORT STAMP</Label>
                        {isStamped ? (
                          <>
                            <Stamp
                              destination={destination}
                              size={132}
                              tilt={-5}
                              label={
                                pr && pr.attempts > 0 && pr.total > 0
                                  ? `${pr.best}/${pr.total}`
                                  : "✓"
                              }
                            />
                            <p
                              className="mt-3 text-[13px] font-medium"
                              style={{ fontFamily: F.body, color: C.green }}
                            >
                              Stamped in your passport
                            </p>
                            <div className="mt-4 w-full">
                              <Btn
                                label="View Passport"
                                color={C.card}
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
                            <div className="my-2 flex size-28 items-center justify-center rounded-full border border-dashed border-[#C7BCA4] p-3 text-center">
                              <span
                                className="text-[12px]"
                                style={{ fontFamily: F.body, color: C.mute }}
                              >
                                Complete the tour to earn this stamp
                              </span>
                            </div>
                            <div className="mt-4 w-full">
                              <Btn
                                label="Start Tour"
                                color={C.cover}
                                onClick={() => setTab("tour")}
                              />
                            </div>
                          </>
                        )}
                      </Pop>
                    </aside>
                  </div>
                )}

                {/* Tab 2: Virtual Tour */}
                {tab === "tour" && (
                  <div className="mt-6">
                    <SulyapTour
                      destination={destination}
                      onBack={() => setTab("overview")}
                      onStartQuiz={() => setTab("quiz")}
                    />
                  </div>
                )}

                {/* Tab 3: 360° Art & Highlights */}
                {tab === "art360" && (
                  <div className="mt-6">
                    <SulyapArt360Map destination={destination} onBack={() => setTab("overview")} />
                  </div>
                )}

                {/* Tab 4: Quiz */}
                {tab === "quiz" && (
                  <div className="mt-6">
                    <SulyapQuiz
                      destination={destination}
                      onBack={() => setTab("overview")}
                      onReviewTour={() => setTab("tour")}
                      onOpenPassport={() =>
                        navigate({ to: "/destinations", search: { view: "passport" } })
                      }
                    />
                  </div>
                )}
              </article>
            );
          })()}
      </main>

      {/* Edit Modal */}
      {destination ? (
        <Dialog open={editOpen} onOpenChange={setEditOpen}>
          <DialogContent
            className="max-h-[90vh] overflow-y-auto sm:max-w-xl"
            style={{
              backgroundColor: C.card,
              borderColor: "#DED5C0",
            }}
          >
            <DialogHeader>
              <DialogTitle
                className="text-[24px] font-bold"
                style={{ fontFamily: F.display, color: C.ink }}
              >
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
            backgroundColor: C.card,
            borderColor: "#DED5C0",
          }}
        >
          <AlertDialogHeader>
            <AlertDialogTitle
              className="text-[22px] font-bold"
              style={{ fontFamily: F.display, color: C.ink }}
            >
              Delete {destination?.name}?
            </AlertDialogTitle>
            <AlertDialogDescription
              className="text-[14px]"
              style={{ fontFamily: F.body, color: C.mute }}
            >
              This place and its stamp progress will be removed.
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
              onClick={confirmDelete}
              style={{
                backgroundColor: C.red,
                color: "#FFFFFF",
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
