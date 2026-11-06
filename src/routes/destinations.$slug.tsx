import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  Award,
  BookOpen,
  Check,
  Compass,
  Edit3,
  ExternalLink,
  HelpCircle,
  MapPin,
  RotateCw,
  Trash2,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { SiteHeader, MobileBottomNav } from "@/components/site-nav";
import { DestinationForm } from "@/components/destination-form";
import { MapView } from "@/components/map-view";
import { SulyapArt360Map } from "@/components/sulyap-art-360";
import { SulyapQuiz, SulyapTour } from "@/components/sulyap-tour-quiz";
import { Btn, Cover, Label, Pop, Stamp } from "@/components/sulyap-ui";
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
import { getDestinationProgress, markToured, useSulyapProgress } from "@/lib/sulyap-data";
import { C, F, conciseText, getCategoryMeta } from "@/lib/sulyap-theme";

type DetailTab = "overview" | "art360" | "tour" | "quiz";

export const Route = createFileRoute("/destinations/$slug")({
  head: () => ({
    meta: [
      { title: "Place Details | SulyapPH" },
      {
        name: "description",
        content: "Explore this CALABARZON heritage site in 360° and collect your travel stamp.",
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
  const [expanded, setExpanded] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  useEffect(() => {
    setTab("overview");
    setExpanded(false);
  }, [slug]);

  useEffect(() => {
    if (destination) document.title = `${destination.name} | SulyapPH`;
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

      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-6">
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
            <div className="mt-4">
              <Btn label="Back to Places" color={C.card} onClick={goBackToList} />
            </div>
          </Pop>
        )}

        {!isPending && !isError && !destination && (
          <div className="mx-auto max-w-md py-12 text-center">
            <Pop className="p-6">
              <h1
                className="text-[22px] font-extrabold"
                style={{ fontFamily: F.display, color: C.ink }}
              >
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
            const isStamped = pr?.toured === 1;
            const { short, hasMore } = conciseText(destination.description, 2);

            const mapsQuery =
              destination.latitude != null && destination.longitude != null
                ? `${destination.latitude},${destination.longitude}`
                : `${destination.name}, ${destination.address}, ${destination.province}, Philippines`;
            const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
              mapsQuery,
            )}`;

            const handleQuickStamp = () => {
              markToured(destination.id, destination.slug);
              toast.success(`Stamped "${destination.name}" in your e-Passport!`);
            };

            const TABS: {
              id: DetailTab;
              label: string;
              icon: React.ComponentType<{ className?: string }>;
            }[] = [
              { id: "overview", label: "Overview", icon: BookOpen },
              { id: "art360", label: "360° Art View", icon: RotateCw },
              { id: "tour", label: "3-Step Tour", icon: Compass },
              { id: "quiz", label: "Quick Quiz", icon: HelpCircle },
            ];

            return (
              <article className="pb-12">
                {/* Top Navigation & Edit Bar */}
                <div className="mb-4 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={goBackToList}
                    className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-[#CBD5E1] bg-white px-3.5 py-1.5 text-[13px] font-bold transition-colors hover:border-[#0038A8] hover:bg-[#EFF6FF]"
                    style={{ fontFamily: F.body, color: C.ink }}
                  >
                    ← All Places
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setEditOpen(true)}
                      className="inline-flex cursor-pointer items-center gap-1 rounded-full border border-[#CBD5E1] bg-white px-3 py-1.5 text-[12px] font-bold transition-colors hover:bg-[#EFF6FF]"
                      style={{ color: C.ink }}
                    >
                      <Edit3 className="size-3.5" /> Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteOpen(true)}
                      className="inline-flex cursor-pointer items-center gap-1 rounded-full border border-[#CBD5E1] bg-white px-3 py-1.5 text-[12px] font-bold transition-colors hover:bg-[#FEF2F2]"
                      style={{ color: C.red }}
                    >
                      <Trash2 className="size-3.5" /> Delete
                    </button>
                  </div>
                </div>

                {/* Hero Banner Card */}
                <Pop className="overflow-hidden">
                  <div className="egov-tricolor-bar h-1 w-full" />
                  <div className="relative h-56 w-full sm:h-72">
                    <Cover destination={destination} className="h-full w-full" />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/25 to-transparent" />

                    {/* Top-Left Category Badge */}
                    <span
                      className="absolute top-3.5 left-3.5 rounded-full px-3 py-1 text-[12px] font-bold text-white backdrop-blur-xs"
                      style={{ backgroundColor: "rgba(15, 23, 42, 0.78)" }}
                    >
                      {cat.en}
                    </span>

                    {/* Top-Right One-Tap Stamp Action */}
                    <div className="absolute top-3.5 right-3.5">
                      {isStamped ? (
                        <button
                          type="button"
                          onClick={() =>
                            navigate({ to: "/destinations", search: { view: "passport" } })
                          }
                          className="inline-flex cursor-pointer items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[12px] font-extrabold text-white shadow-md"
                          style={{ backgroundColor: C.green }}
                        >
                          <Check className="size-4" /> Stamped in e-Passport
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={handleQuickStamp}
                          className="inline-flex cursor-pointer items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[12px] font-extrabold shadow-md transition-transform hover:scale-105"
                          style={{ backgroundColor: C.foil, color: C.ink }}
                        >
                          <Award className="size-4" /> Stamp My e-Passport
                        </button>
                      )}
                    </div>

                    {/* Bottom Title Overlay */}
                    <div className="absolute inset-x-0 bottom-0 p-5 text-white sm:p-6">
                      <h1
                        className="text-[26px] font-extrabold leading-tight sm:text-[34px]"
                        style={{ fontFamily: F.display }}
                      >
                        {destination.name}
                      </h1>
                      <p className="mt-1 inline-flex items-center gap-1.5 text-[14px] text-white/90">
                        <MapPin className="size-4 shrink-0 text-[#FCD116]" /> {destination.address},{" "}
                        {destination.province}
                      </p>
                    </div>
                  </div>

                  {/* Clear 4-Button Icon Navigation Bar */}
                  <div className="grid grid-cols-2 gap-2 bg-[#F8FAFC] p-2.5 sm:grid-cols-4">
                    {TABS.map((item) => {
                      const active = tab === item.id;
                      const Icon = item.icon;
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => setTab(item.id)}
                          className="flex cursor-pointer items-center justify-center gap-2 rounded-xl py-2.5 text-[13px] font-bold transition-all"
                          style={{
                            fontFamily: F.body,
                            backgroundColor: active ? C.cover : "#FFFFFF",
                            color: active ? "#FFFFFF" : C.ink,
                            border: active ? `1px solid ${C.cover}` : "1px solid #E2E8F0",
                            boxShadow: active ? "0 2px 8px rgba(0, 56, 168, 0.22)" : "none",
                          }}
                        >
                          <Icon className="size-4" />
                          <span>{item.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </Pop>

                {/* Tab 1: Overview */}
                {tab === "overview" && (
                  <div className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-[1fr_270px]">
                    <div className="space-y-5">
                      {/* Concise Description Card */}
                      <Pop className="p-5 sm:p-6">
                        <Label className="mb-1.5">QUICK OVERVIEW</Label>
                        <p
                          className="text-[15.5px] leading-relaxed"
                          style={{ fontFamily: F.body, color: C.ink }}
                        >
                          {expanded ? destination.description : short}
                        </p>
                        {hasMore ? (
                          <button
                            type="button"
                            onClick={() => setExpanded((v) => !v)}
                            className="mt-2 cursor-pointer text-[13px] font-bold underline"
                            style={{ color: C.cover }}
                          >
                            {expanded ? "Show less" : "Read more"}
                          </button>
                        ) : null}

                        {/* 2 Big Visual Feature Launchers */}
                        <div className="mt-5 grid grid-cols-1 gap-3 border-t border-[#E2E8F0] pt-4 sm:grid-cols-2">
                          <button
                            type="button"
                            onClick={() => setTab("art360")}
                            className="flex cursor-pointer items-center gap-3 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-3.5 text-left transition-colors hover:border-[#93C5FD] hover:bg-[#EFF6FF]"
                          >
                            <div
                              className="flex size-10 shrink-0 items-center justify-center rounded-xl text-white"
                              style={{ backgroundColor: C.cover }}
                            >
                              <RotateCw className="size-5" />
                            </div>
                            <div>
                              <div className="text-[14px] font-extrabold" style={{ color: C.ink }}>
                                360° Art &amp; Relics
                              </div>
                              <div className="text-[12px]" style={{ color: C.mute }}>
                                Pan around 4 artworks →
                              </div>
                            </div>
                          </button>

                          <button
                            type="button"
                            onClick={() => setTab("tour")}
                            className="flex cursor-pointer items-center gap-3 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] p-3.5 text-left transition-colors hover:border-[#93C5FD] hover:bg-[#EFF6FF]"
                          >
                            <div
                              className="flex size-10 shrink-0 items-center justify-center rounded-xl text-white"
                              style={{ backgroundColor: C.red }}
                            >
                              <Compass className="size-5" />
                            </div>
                            <div>
                              <div className="text-[14px] font-extrabold" style={{ color: C.ink }}>
                                3-Step Virtual Tour
                              </div>
                              <div className="text-[12px]" style={{ color: C.mute }}>
                                Quick story &amp; stamp →
                              </div>
                            </div>
                          </button>
                        </div>
                      </Pop>

                      {/* Map Card */}
                      <Pop className="overflow-hidden p-2">
                        <div className="mb-2 flex items-center justify-between px-2 pt-1">
                          <Label>LOCATION MAP</Label>
                          <a
                            href={mapsUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[12px] font-bold hover:underline"
                            style={{ color: C.cover }}
                          >
                            Open in Google Maps <ExternalLink className="size-3" />
                          </a>
                        </div>
                        <MapView
                          destinations={[destination]}
                          center={
                            destination.latitude != null && destination.longitude != null
                              ? [destination.latitude, destination.longitude]
                              : undefined
                          }
                          zoom={destination.latitude != null ? 13 : 9}
                          className="h-56 w-full rounded-xl"
                        />
                      </Pop>
                    </div>

                    {/* Right Passport Stamp Card */}
                    <aside>
                      <Pop className="flex flex-col items-center p-5 text-center">
                        <Label className="mb-2">DIGITAL STAMP</Label>
                        {isStamped ? (
                          <>
                            <Stamp
                              destination={destination}
                              size={132}
                              tilt={-4}
                              label={
                                pr && pr.attempts > 0 && pr.total > 0
                                  ? `${pr.best}/${pr.total}`
                                  : "✓"
                              }
                            />
                            <span
                              className="mt-2 inline-flex items-center gap-1 rounded-full bg-[#ECFDF5] px-3 py-0.5 text-[12px] font-extrabold"
                              style={{ color: C.green }}
                            >
                              <Check className="size-3.5" /> Verified in e-Passport
                            </span>
                            <div className="mt-4 w-full space-y-2">
                              <Btn
                                label="Take Quick Quiz"
                                color={C.foil}
                                onClick={() => setTab("quiz")}
                                className="w-full"
                              />
                              <Btn
                                label="Open e-Passport"
                                color={C.card}
                                onClick={() =>
                                  navigate({
                                    to: "/destinations",
                                    search: { view: "passport" },
                                  })
                                }
                                className="w-full"
                              />
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="my-2 flex size-28 flex-col items-center justify-center rounded-full border-2 border-dashed border-[#CBD5E1] bg-[#F8FAFC] p-3 text-center">
                              <Award className="mb-1 size-6 text-[#0038A8]" />
                              <span className="text-[11px] font-semibold" style={{ color: C.mute }}>
                                Not stamped yet
                              </span>
                            </div>
                            <div className="mt-4 w-full space-y-2">
                              <Btn
                                label="★ Stamp Now"
                                color={C.foil}
                                onClick={handleQuickStamp}
                                className="w-full"
                              />
                              <Btn
                                label="Take 3-Step Tour"
                                color={C.cover}
                                onClick={() => setTab("tour")}
                                className="w-full"
                              />
                            </div>
                          </>
                        )}
                      </Pop>
                    </aside>
                  </div>
                )}

                {/* Tab 2: 360° Art & Relics */}
                {tab === "art360" && (
                  <div className="mt-5">
                    <SulyapArt360Map destination={destination} onBack={() => setTab("overview")} />
                  </div>
                )}

                {/* Tab 3: Virtual Tour */}
                {tab === "tour" && (
                  <div className="mt-5">
                    <SulyapTour
                      destination={destination}
                      onBack={() => setTab("overview")}
                      onStartQuiz={() => setTab("quiz")}
                    />
                  </div>
                )}

                {/* Tab 4: Quiz */}
                {tab === "quiz" && (
                  <div className="mt-5">
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
              backgroundColor: "#FFFFFF",
              borderColor: "#E2E8F0",
            }}
          >
            <DialogHeader>
              <DialogTitle
                className="text-[22px] font-extrabold"
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
            backgroundColor: "#FFFFFF",
            borderColor: "#E2E8F0",
          }}
        >
          <AlertDialogHeader>
            <AlertDialogTitle
              className="text-[20px] font-extrabold"
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
                borderColor: "#CBD5E1",
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
