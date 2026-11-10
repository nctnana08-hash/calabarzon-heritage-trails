import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { MapPin, Palette, Smartphone, Shield, Lock } from "lucide-react";
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
import { useAuth } from "@/hooks/use-auth";
import type { Destination } from "@/lib/destinations";
import { isDestinationToured, useSulyapProgress } from "@/lib/sulyap-data";
import { C, F, getCategoryMeta } from "@/lib/sulyap-theme";

type ManageTab = "places" | "branding" | "android";

export const Route = createFileRoute("/manage")({
  head: () => ({
    meta: [{ title: "Control Center & Branding | SulyapPH" }],
  }),
  component: ManagePage,
});

function ManagePage() {
  const navigate = useNavigate();
  const { data: destinations, isPending, isError, error } = useDestinations();
  const { branding } = useAppBranding();
  const { user, isAdmin, signInDemoAdmin } = useAuth();
  const progress = useSulyapProgress();
  const [activeTab, setActiveTab] = useState<ManageTab>("places");
  const [editing, setEditing] = useState<Destination | undefined>(undefined);
  const [formOpen, setFormOpen] = useState(false);
  const [deleting, setDeleting] = useState<Destination | null>(null);
  const deleteMutation = useDeleteDestination();

  function openNew() {
    if (!isAdmin) {
      toast.error("Administrator access required to create destinations.");
      return;
    }
    setEditing(undefined);
    setFormOpen(true);
  }

  function openEdit(destination: Destination) {
    if (!isAdmin) {
      toast.error("Administrator access required to edit destinations.");
      return;
    }
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
    <div className="flex min-h-screen flex-col bg-[#F4F7FB] dark:bg-[#090D16] text-[#0F172A] dark:text-[#F8FAFC] transition-colors">
      <SiteHeader />

      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-8">
        {/* Title Header */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1
              className="text-[28px] font-extrabold leading-tight sm:text-[34px]"
              style={{ fontFamily: F.display, color: branding.primaryColor }}
            >
              Control Center &amp; Management
            </h1>
            <Label>Manage CALABARZON destinations, brand identity, and mobile packages</Label>
          </div>
          {activeTab === "places" && isAdmin ? (
            <Btn label="+ Add Place" color={C.foil} onClick={openNew} />
          ) : null}
        </div>

        {/* Administrator Status Banner */}
        {!isAdmin ? (
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#CBD5E1] dark:border-[#334155] bg-[#EFF6FF] dark:bg-[#1E3A8A]/20 p-4">
            <div className="flex items-center gap-2.5">
              <span className="flex size-9 items-center justify-center rounded-xl bg-[#0038A8] text-white">
                <Lock className="size-4" />
              </span>
              <div>
                <p className="text-[13px] font-bold text-[#0038A8] dark:text-[#93C5FD]">
                  Public View Mode (Read-Only)
                </p>
                <p className="text-[12px] text-[#475569] dark:text-[#94A3B8]">
                  Sign in as Regional Administrator to unlock adding places, editing, and app
                  branding.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={signInDemoAdmin}
              className="cursor-pointer rounded-xl bg-[#0038A8] px-4 py-2 text-[12.5px] font-bold text-white shadow-xs hover:bg-[#002366]"
            >
              Sign In as Admin (Demo)
            </button>
          </div>
        ) : (
          <div className="mb-6 flex items-center justify-between rounded-2xl border border-[#16A34A]/30 bg-[#ECFDF5] dark:bg-[#064E3B]/20 p-3.5">
            <div className="flex items-center gap-2">
              <span className="flex size-6 items-center justify-center rounded-full bg-[#16A34A] text-white text-[11px] font-extrabold">
                ✓
              </span>
              <p className="text-[12.5px] font-bold text-[#16A34A] dark:text-[#6EE7B7]">
                Logged in as Regional Administrator: {user?.name}
              </p>
            </div>
          </div>
        )}

        {/* Modular Navigation Tabs */}
        <div className="mb-6 flex flex-wrap gap-2 border-b border-[#CBD5E1] dark:border-[#22314E] pb-3">
          <button
            type="button"
            onClick={() => setActiveTab("places")}
            className="flex cursor-pointer items-center gap-2 rounded-xl px-4 py-2.5 text-[13.5px] font-bold transition"
            style={{
              backgroundColor: activeTab === "places" ? C.cover : "transparent",
              color: activeTab === "places" ? "#FFFFFF" : undefined,
              border: activeTab === "places" ? "none" : "1px solid #CBD5E1",
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
              backgroundColor: activeTab === "branding" ? C.cover : "transparent",
              color: activeTab === "branding" ? "#FFFFFF" : undefined,
              border: activeTab === "branding" ? "none" : "1px solid #CBD5E1",
            }}
          >
            <Palette className="size-4" />
            <span>App Branding &amp; Logo</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("android")}
            className="flex cursor-pointer items-center gap-2 rounded-xl px-4 py-2.5 text-[13.5px] font-bold transition"
            style={{
              backgroundColor: activeTab === "android" ? C.cover : "transparent",
              color: activeTab === "android" ? "#FFFFFF" : undefined,
              border: activeTab === "android" ? "none" : "1px solid #CBD5E1",
            }}
          >
            <Smartphone className="size-4" />
            <span>Android &amp; React Native</span>
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
                    className="h-20 animate-pulse rounded-xl bg-[#E2E8F0] dark:bg-[#1E293B]"
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
                      className="flex items-center justify-between gap-4 p-3.5 border border-[#E2E8F0] dark:border-[#22314E] dark:bg-[#131C31]"
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
                              <span className="rounded-full bg-[#ECFDF5] dark:bg-[#064E3B] px-2 py-0.5 text-[10px] font-extrabold text-[#16A34A] dark:text-[#6EE7B7]">
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
                            className="block cursor-pointer truncate text-left text-[17px] font-bold hover:text-[#0038A8] dark:hover:text-[#93C5FD] hover:underline"
                            style={{ fontFamily: F.display, color: C.ink }}
                          >
                            {destination.name}
                          </button>
                        </div>
                      </div>

                      <div className="flex shrink-0 items-center gap-2">
                        {isAdmin ? (
                          <>
                            <button
                              type="button"
                              onClick={() => openEdit(destination)}
                              className="cursor-pointer rounded-lg border border-[#CBD5E1] dark:border-[#334155] bg-white dark:bg-[#1E293B] px-3 py-1.5 text-[12px] font-bold hover:bg-[#EFF6FF]"
                              style={{ fontFamily: F.body }}
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeleting(destination)}
                              className="cursor-pointer rounded-lg border border-[#CBD5E1] dark:border-[#334155] bg-white dark:bg-[#1E293B] px-3 py-1.5 text-[12px] font-bold hover:bg-[#FEF2F2] text-[#CE1126]"
                              style={{ fontFamily: F.body }}
                            >
                              Delete
                            </button>
                          </>
                        ) : (
                          <button
                            type="button"
                            onClick={() =>
                              navigate({
                                to: "/destinations/$slug",
                                params: { slug: destination.slug },
                              })
                            }
                            className="cursor-pointer rounded-lg border border-[#CBD5E1] dark:border-[#334155] bg-white dark:bg-[#1E293B] px-3 py-1.5 text-[12px] font-bold text-[#0038A8] dark:text-[#93C5FD]"
                          >
                            View →
                          </button>
                        )}
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

        {/* Tab 3: Android App Package (.APK) & React Native */}
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
