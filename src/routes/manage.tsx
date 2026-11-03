import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";

import { SiteHeader, MobileBottomNav } from "@/components/site-nav";
import { DestinationForm } from "@/components/destination-form";
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
import type { Destination } from "@/lib/destinations";
import { isDestinationToured, useSulyapProgress } from "@/lib/sulyap-data";
import { C, F, PROVINCE_CODES, getCategoryMeta, seedFromId } from "@/lib/sulyap-theme";

export const Route = createFileRoute("/manage")({
  head: () => ({
    meta: [
      { title: "Pamahalaan — Passport Registry Desk | Sulyap" },
      {
        name: "description",
        content:
          "Add, edit, and remove the heritage visa dossiers shown in the Sulyap CALABARZON virtual tour.",
      },
      { property: "og:title", content: "Pamahalaan — Passport Registry Desk | Sulyap" },
      {
        property: "og:description",
        content:
          "Add, edit, and remove the heritage visa dossiers shown in the Sulyap CALABARZON virtual tour.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ManagePage,
});

function ManagePage() {
  const navigate = useNavigate();
  const { data: destinations, isPending, isError, error } = useDestinations();
  const progress = useSulyapProgress();
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
      onSuccess: () => toast.success(`Removed "${deleting.name}" from registry.`),
      onError: (e) => toast.error(e.message),
    });
    setDeleting(null);
  }

  return (
    <div className="flex min-h-screen flex-col" style={{ backgroundColor: C.paper }}>
      <SiteHeader />

      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6 sm:py-8">
        <div
          className="mb-6 flex flex-wrap items-end justify-between gap-4 border-b pb-4"
          style={{ borderColor: "#D6CCB5" }}
        >
          <div>
            <Label>OFFICIAL ARCHIVAL REGISTRY DESK · REHIYON IV-A</Label>
            <h1
              className="mt-0.5 text-[32px] font-bold leading-tight sm:text-[40px]"
              style={{ fontFamily: F.display, color: C.ink }}
            >
              Pamahalaan ang mga Dossier
            </h1>
            <p className="mt-1 text-[14px]" style={{ fontFamily: F.body, color: C.mute }}>
              Register, amend, and maintain the heritage sites in the CALABARZON Pasaporte ng
              Pamana.
            </p>
          </div>
          <div className="w-44">
            <Btn label="+ Register Site" color={C.foil} onClick={openNew} />
          </div>
        </div>

        {isError ? (
          <Pop className="my-4 p-5">
            <p className="text-[14px] font-bold" style={{ fontFamily: F.mono, color: C.red }}>
              Could not load registry records: {error.message}
            </p>
          </Pop>
        ) : null}

        {isPending ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="h-24 animate-pulse rounded-lg border"
                style={{
                  backgroundColor: C.sand,
                  borderColor: "#C8BDA4",
                }}
              />
            ))}
          </div>
        ) : null}

        {!isPending && !isError ? (
          <div className="space-y-3">
            {(destinations ?? []).length === 0 ? (
              <Pop className="passport-page-surface p-7 text-center">
                <h2
                  className="text-[24px] font-bold"
                  style={{ fontFamily: F.display, color: C.ink }}
                >
                  Wala Pang Nakatalang Lugar
                </h2>
                <p className="my-2 text-[14px]" style={{ fontFamily: F.body, color: C.mute }}>
                  Register your first CALABARZON heritage visa dossier to begin.
                </p>
                <div className="mx-auto mt-4 w-44">
                  <Btn label="+ Register Site" color={C.foil} onClick={openNew} />
                </div>
              </Pop>
            ) : (
              (destinations ?? []).map((destination) => {
                const cat = getCategoryMeta(destination.category);
                const toured = isDestinationToured(destination, progress);
                const provCode = PROVINCE_CODES[destination.province] ?? "IVA";
                const seed = seedFromId(destination.slug || destination.id);
                const visaSerial = `IV-A-${provCode}-${String(seed).padStart(3, "0")}`;

                return (
                  <Pop
                    key={destination.id}
                    className="passport-page-surface flex flex-col gap-3.5 p-3.5 sm:flex-row sm:items-center"
                  >
                    <div className="h-16 w-24 shrink-0 overflow-hidden rounded-xs border border-[#B8AC93] bg-[#EAE2CE] p-1">
                      <Cover destination={destination} className="h-full w-full rounded-xs" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className="text-[11px] font-bold uppercase tracking-[0.12em]"
                          style={{ fontFamily: F.mono, color: cat.deep }}
                        >
                          {visaSerial} · {cat.fil} ({destination.category})
                        </span>
                        {destination.featured ? (
                          <span
                            className="rounded-xs border px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.1em]"
                            style={{
                              fontFamily: F.mono,
                              backgroundColor: "rgba(212, 175, 55, 0.2)",
                              borderColor: "#9A701E",
                              color: C.ink,
                            }}
                          >
                            Priority Dossier
                          </span>
                        ) : null}
                        {toured ? (
                          <span
                            className="rounded-xs border px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.1em]"
                            style={{
                              fontFamily: F.mono,
                              backgroundColor: "rgba(35, 99, 67, 0.12)",
                              borderColor: C.green,
                              color: C.green,
                            }}
                          >
                            ★ Stamped
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
                        className="mt-0.5 block cursor-pointer truncate text-left text-[20px] font-bold hover:underline"
                        style={{ fontFamily: F.display, color: C.ink }}
                      >
                        {destination.name}
                      </button>

                      <p
                        className="truncate text-[12px]"
                        style={{ fontFamily: F.mono, color: C.mute }}
                      >
                        {destination.address}, {destination.province}
                      </p>
                    </div>

                    <div className="flex shrink-0 items-center gap-2">
                      <button
                        type="button"
                        onClick={() => openEdit(destination)}
                        aria-label={`Edit ${destination.name}`}
                        className="min-h-[38px] cursor-pointer rounded-xs border border-[#B8AC93] bg-[#FCF9F0] px-3.5 py-1.5 text-[12px] font-bold uppercase tracking-[0.1em] transition-colors hover:bg-[#EAE2CE]"
                        style={{
                          fontFamily: F.mono,
                          color: C.ink,
                        }}
                      >
                        ✎ Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleting(destination)}
                        aria-label={`Delete ${destination.name}`}
                        className="min-h-[38px] cursor-pointer rounded-xs border px-3.5 py-1.5 text-[12px] font-bold uppercase tracking-[0.1em] text-white transition-opacity hover:opacity-90"
                        style={{
                          fontFamily: F.mono,
                          backgroundColor: C.red,
                          borderColor: C.red,
                        }}
                      >
                        ✕ Delete
                      </button>
                    </div>
                  </Pop>
                );
              })
            )}
          </div>
        ) : null}
      </main>

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
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
              {editing ? `Edit Dossier: ${editing.name}` : "Register New Heritage Site"}
            </DialogTitle>
          </DialogHeader>
          <DestinationForm destination={editing} onDone={() => setFormOpen(false)} />
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleting} onOpenChange={(open) => !open && setDeleting(null)}>
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
              "{deleting?.name}" and its associated visa stamp progress will be permanently removed.
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
