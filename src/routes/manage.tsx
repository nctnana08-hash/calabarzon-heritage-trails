import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Compass, Lock, MapPin, Palette, Shield, Smartphone } from "lucide-react";
import { toast } from "sonner";

import { SiteHeader, MobileBottomNav } from "@/components/site-nav";
import { DestinationForm } from "@/components/destination-form";
import { AppBrandingEditor } from "@/components/app-branding-editor";
import { AndroidManager } from "@/components/android-manager";
import { PanoramaTourBuilder } from "@/components/panorama-tour-builder";
import { AuthModal } from "@/components/auth-modal";
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

type ManageTab = "overview" | "places" | "tours" | "branding" | "android" | "settings";

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
  const { user, isAdmin, loading: authLoading, signOut } = useAuth();
  const progress = useSulyapProgress();
  const [activeTab, setActiveTab] = useState<ManageTab>("places");
  const [editing, setEditing] = useState<Destination | undefined>(undefined);
  const [formOpen, setFormOpen] = useState(false);
  const [deleting, setDeleting] = useState<Destination | null>(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [tourDestinationSlug, setTourDestinationSlug] = useState<string | undefined>();
  const deleteMutation = useDeleteDestination();

  if (authLoading) {
    return (
      <div className="grid min-h-screen place-items-center bg-[#F4F7FB] p-6 text-center">
        Checking administrator access…
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex min-h-screen flex-col bg-[#F4F7FB] dark:bg-[#090D16]">
        <SiteHeader />
        <main className="mx-auto flex w-full max-w-xl flex-1 flex-col items-center justify-center px-5 py-12 text-center">
          <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-700 dark:bg-slate-900">
            <Lock className="mx-auto mb-4 size-10 text-[#0038A8]" />
            <h1 className="text-2xl font-extrabold" style={{ fontFamily: F.display }}>
              Administrator sign-in required
            </h1>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
              This management area is limited to approved Sulyap administrators.
            </p>
            {user ? (
              <p className="mt-2 text-xs text-slate-500">
                Signed in as {user.email}, but this account has no administrator access.
              </p>
            ) : null}
            {!user ? (
              <button
                type="button"
                onClick={() => setAuthModalOpen(true)}
                className="mt-5 rounded-xl bg-[#0038A8] px-5 py-3 font-bold text-white"
              >
                Sign in
              </button>
            ) : null}
          </div>
        </main>
        <AuthModal open={authModalOpen} onOpenChange={setAuthModalOpen} />
        <MobileBottomNav />
      </div>
    );
  }

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
        {!authLoading && !isAdmin ? (
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
                  Sign in with an authorized administrator account to manage protected content.
                </p>
              </div>
            </div>
          </div>
        ) : isAdmin ? (
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
        ) : null}

        {/* Modular Navigation Tabs */}
        <div className="mb-6 flex flex-wrap gap-2 border-b border-[#CBD5E1] dark:border-[#22314E] pb-3">
          <button
            type="button"
            onClick={() => setActiveTab("overview")}
            className="flex cursor-pointer items-center gap-2 rounded-xl px-4 py-2.5 text-[13.5px] font-bold transition"
            style={{
              backgroundColor: activeTab === "overview" ? C.cover : "transparent",
              color: activeTab === "overview" ? "#FFFFFF" : undefined,
              border: activeTab === "overview" ? "none" : "1px solid #CBD5E1",
            }}
          >
            <Shield className="size-4" />
            <span>Dashboard Overview</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("settings")}
            className="flex cursor-pointer items-center gap-2 rounded-xl px-4 py-2.5 text-[13.5px] font-bold transition"
            style={{
              backgroundColor: activeTab === "settings" ? C.cover : "transparent",
              color: activeTab === "settings" ? "#FFFFFF" : undefined,
              border: activeTab === "settings" ? "none" : "1px solid #CBD5E1",
            }}
          >
            <Shield className="size-4" />
            <span>Administrator Settings</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("tours")}
            className="flex cursor-pointer items-center gap-2 rounded-xl px-4 py-2.5 text-[13.5px] font-bold transition"
            style={{
              backgroundColor: activeTab === "tours" ? C.cover : "transparent",
              color: activeTab === "tours" ? "#FFFFFF" : undefined,
              border: activeTab === "tours" ? "none" : "1px solid #CBD5E1",
            }}
          >
            <Compass className="size-4" />
            <span>360° Virtual Tours</span>
          </button>

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

        {activeTab === "overview" && (
          <div className="grid gap-4 sm:grid-cols-3">
            <Pop className="p-5">
              <p className="text-[11px] font-extrabold uppercase tracking-wider text-[#64748B]">
                Heritage destinations
              </p>
              <p className="mt-2 text-[30px] font-extrabold" style={{ fontFamily: F.display }}>
                {destinations?.length ?? 0}
              </p>
              <p className="text-[12px] text-[#64748B]">
                Browse and manage the CALABARZON directory.
              </p>
            </Pop>
            <Pop className="p-5">
              <p className="text-[11px] font-extrabold uppercase tracking-wider text-[#64748B]">
                Virtual tours
              </p>
              <p className="mt-2 text-[30px] font-extrabold" style={{ fontFamily: F.display }}>
                360°
              </p>
              <p className="text-[12px] text-[#64748B]">
                Build rooms, artwork markers, and visitor paths.
              </p>
            </Pop>
            <Pop className="p-5">
              <p className="text-[11px] font-extrabold uppercase tracking-wider text-[#64748B]">
                Access status
              </p>
              <p className="mt-2 text-[22px] font-extrabold" style={{ fontFamily: F.display }}>
                {isAdmin ? "Administrator" : "Read-only"}
              </p>
              <p className="text-[12px] text-[#64748B]">
                Database authorization controls protected actions.
              </p>
            </Pop>
          </div>
        )}

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

                      <div className="flex shrink-0 flex-wrap items-center justify-end gap-2">
                        <>
                          <button
                            type="button"
                            onClick={() => {
                              setTourDestinationSlug(destination.slug);
                              setActiveTab("tours");
                            }}
                            className="cursor-pointer rounded-lg border border-[#0038A8]/30 bg-[#EFF6FF] px-3 py-1.5 text-xs font-bold text-[#0038A8]"
                          >
                            Upload 360° panorama
                          </button>
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

        {activeTab === "tours" &&
          (isAdmin ? (
            <PanoramaTourBuilder initialDestinationSlug={tourDestinationSlug} />
          ) : (
            <Pop className="p-6 text-center">
              <Lock className="mx-auto mb-2 size-6 text-[#0038A8]" />
              <p className="font-bold">Administrator sign-in required</p>
              <Label>Only authorized accounts can upload or publish virtual tours.</Label>
            </Pop>
          ))}

        {/* Tab 3: Android App Package (.APK) & React Native */}
        {activeTab === "android" && <AndroidManager />}

        {activeTab === "settings" && (
          <Pop className="space-y-4 p-6">
            <div>
              <h2 className="text-[20px] font-extrabold" style={{ fontFamily: F.display }}>
                Administrator Settings
              </h2>
              <Label>Review the signed-in account used for protected content management.</Label>
            </div>
            <div className="rounded-xl border border-[#CBD5E1] bg-[#F8FAFC] p-4 dark:border-[#334155] dark:bg-[#1E293B]">
              <p className="text-[11px] font-extrabold uppercase tracking-wider text-[#64748B]">
                Signed-in account
              </p>
              <p className="mt-1 text-[15px] font-bold">{user?.name || "No account"}</p>
              <p className="text-[13px] text-[#64748B]">{user?.email || "Sign in required"}</p>
            </div>
            {isAdmin ? (
              <button
                type="button"
                onClick={() => void signOut()}
                className="rounded-xl border border-[#CE1126]/30 px-4 py-2.5 text-[13px] font-bold text-[#CE1126]"
              >
                Sign out of administrator account
              </button>
            ) : null}
          </Pop>
        )}
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
