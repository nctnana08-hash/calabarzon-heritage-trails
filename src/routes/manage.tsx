import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { MapPin, Palette, Smartphone } from "lucide-react";
import { toast } from "sonner";

import { SiteHeader, MobileBottomNav } from "@/components/site-nav";
import { DestinationForm } from "@/components/destination-form";
import { AppBrandingEditor } from "@/components/app-branding-editor";
import { AndroidManager } from "@/components/android-manager";
import { Btn, Cover, Label, Pop } from "@/components/sulyap-ui";
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
import { useDeleteDestination, useDestinations } from "@/hooks/use-destinations";
import { useAppBranding } from "@/hooks/use-app-branding";
import type { Destination } from "@/lib/destinations";
import { isDestinationToured, useSulyapProgress } from "@/lib/sulyap-data";
import { C, F, getCategoryMeta } from "@/lib/sulyap-theme";

type ManageTab = "places" | "branding" | "android";

export const Route = createFileRoute("/manage")({
  head: () => ({
    meta: [{ title: "App Management & Branding | SulyapPH" }],
  }),
  component: ManagePage,
});

function ManagePage() {
  const navigate = useNavigate();
  const { data: destinations, isPending, isError, error } = useDestinations();
  const { branding } = useAppBranding();
  const progress = useSulyapProgress();
  const [activeTab, setActiveTab] = useState<ManageTab>("places");
  const [editing, setEditing] = useState<Destination | undefined>(undefined);
  const [formOpen, setFormOpen] = useState(false);
  const [deleting, setDeleting] = useState<Destination | null>(null);
  const deleteMutation = useDeleteDestination();

  function openNew() {
    setEditing(undefined);
    setFormOpen(true);
  }

  function openEdit(destination: Destination) {
    setEditing(destination);
    setFormOpen(true);
  }

  function confirmDelete() {
    if (!deleting) return;
    deleteMutation.mutate(deleting, {
      onSuccess: () => toast.success(`Deleted "${deleting.name}".`),
      onError: (e) => toast.error(e.message),
    });
    setDeleting(null);
  }

  return (
    <div className="flex min-h-screen flex-col" style={{ backgroundColor: C.paper }}>
      <SiteHeader />

      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-8">
        {/* Title Header */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1
              className="text-[28px] font-extrabold leading-tight sm:text-[34px]"
              style={{ fontFamily: F.display, color: C.ink }}
            >
              Control Center & Branding
            </h1>
            <Label>Manage places, customize app name & logo, or download Android APK</Label>
          </div>
          {activeTab === "places" ? (
            <Btn label="+ Add Place" color={C.foil} onClick={openNew} />
          ) : null}
        </div>

        {/* Modular Navigation Tabs */}
        <div className="mb-6 flex flex-wrap gap-2 border-b border-[#CBD5E1] pb-3">
          <button
            type="button"
            onClick={() => setActiveTab("places")}
            className="flex cursor-pointer items-center gap-2 rounded-xl px-4 py-2.5 text-[13.5px] font-bold transition"
            style={{
              backgroundColor: activeTab === "places" ? C.cover : "#FFFFFF",
              color: activeTab === "places" ? "#FFFFFF" : C.ink,
              border: activeTab === "places" ? "none" : "1px solid #E2E8F0",
            }}
          >
            <MapPin className="size-4" />
            <span>Places Directory ({destinations?.length ?? 19})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("branding")}
            className="flex cursor-pointer items-center gap-2 rounded-xl px-4 py-2.5 text-[13.5px] font-bold transition"
            style={{
              backgroundColor: activeTab === "branding" ? C.cover : "#FFFFFF",
              color: activeTab === "branding" ? "#FFFFFF" : C.ink,
              border: activeTab === "branding" ? "none" : "1px solid #E2E8F0",
            }}
          >
            <Palette className="size-4" />
            <span>App Branding & Logo</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("android")}
            className="flex cursor-pointer items-center gap-2 rounded-xl px-4 py-2.5 text-[13.5px] font-bold transition"
            style={{
              backgroundColor: activeTab === "android" ? C.cover : "#FFFFFF",
              color: activeTab === "android" ? "#FFFFFF" : C.ink,
              border: activeTab === "android" ? "none" : "1px solid #E2E8F0",
            }}
          >
            <Smartphone className="size-4" />
            <span>Android App (.APK)</span>
          </button>
        </div>

        {/* Tab 1: Places Directory */}
        {activeTab === "places" && (
          <>
            {isError ? (
              <Pop className="my-4 p-5">
                <p className="text-[14px]" style={{ color: C.red }}>
                  Could not load places: {error.message}
                </p>
              </Pop>
            ) : null}

            {isPending ? (
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-20 animate-pulse rounded-xl"
                    style={{ backgroundColor: C.sand }}
                  />
                ))}
              </div>
            ) : null}

            {!isPending && !isError ? (
              <div className="space-y-2.5">
                {(destinations ?? []).map((destination) => {
                  const cat = getCategoryMeta(destination.category);
                  const toured = isDestinationToured(destination, progress);

                  return (
                    <Pop
                      key={destination.id}
                      className="flex items-center justify-between gap-4 p-3.5"
                    >
                      <div className="flex min-w-0 items-center gap-3.5">
                        <Cover
                          destination={destination}
                          className="h-14 w-18 shrink-0 rounded-lg"
                        />
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span
                              className="text-[12px] font-bold"
                              style={{ fontFamily: F.body, color: cat.deep }}
                            >
                              {destination.province} · {cat.fil}
                            </span>
                            {toured ? (
                              <span
                                className="rounded-full bg-[#ECFDF5] px-2 py-0.5 text-[10px] font-extrabold"
                                style={{ color: C.green }}
                              >
                                ✓ Stamped
                              </span>
                            ) : null}
                          </div>

                          <button
                            type="button"
                            onClick={() =>
                              navigate({
                                to: "/destinations/$slug",
                                params: { slug: destination.slug },
                              })
                            }
                            className="block cursor-pointer truncate text-left text-[17px] font-bold hover:text-[#0038A8] hover:underline"
                            style={{ fontFamily: F.display, color: C.ink }}
                          >
                            {destination.name}
                          </button>
                        </div>
                      </div>

                      <div className="flex shrink-0 items-center gap-2">
                        <button
                          type="button"
                          onClick={() => openEdit(destination)}
                          className="cursor-pointer rounded-lg border border-[#CBD5E1] bg-white px-3 py-1.5 text-[12px] font-bold hover:bg-[#EFF6FF]"
                          style={{ fontFamily: F.body, color: C.ink }}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleting(destination)}
                          className="cursor-pointer rounded-lg border border-[#CBD5E1] bg-white px-3 py-1.5 text-[12px] font-bold hover:bg-[#FEF2F2]"
                          style={{ fontFamily: F.body, color: C.red }}
                        >
                          Delete
                        </button>
                      </div>
                    </Pop>
                  );
                })}
              </div>
            ) : null}
          </>
        )}

        {/* Tab 2: App Branding & Customization */}
        {activeTab === "branding" && <AppBrandingEditor />}

        {/* Tab 3: Android App Package (.APK) */}
        {activeTab === "android" && <AndroidManager />}
      </main>

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent
          className="max-h-[90vh] overflow-y-auto sm:max-w-xl"
          style={{
            backgroundColor: C.card,
            borderColor: "#E2E8F0",
          }}
        >
          <DialogHeader>
            <DialogTitle
              className="text-[22px] font-extrabold"
              style={{ fontFamily: F.display, color: C.ink }}
            >
              {editing ? `Edit ${editing.name}` : "Add Place"}
            </DialogTitle>
          </DialogHeader>
          <DestinationForm destination={editing} onDone={() => setFormOpen(false)} />
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleting} onOpenChange={(open) => !open && setDeleting(null)}>
        <AlertDialogContent
          style={{
            backgroundColor: C.card,
            borderColor: "#E2E8F0",
          }}
        >
          <AlertDialogHeader>
            <AlertDialogTitle
              className="text-[20px] font-extrabold"
              style={{ fontFamily: F.display, color: C.ink }}
            >
              Delete {deleting?.name}?
            </AlertDialogTitle>
            <AlertDialogDescription
              className="text-[14px]"
              style={{ fontFamily: F.body, color: C.mute }}
            >
              This place and its stamp progress will be permanently removed.
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
