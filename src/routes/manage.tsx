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
import { C, F, getCategoryMeta } from "@/lib/sulyap-theme";

export const Route = createFileRoute("/manage")({
  head: () => ({
    meta: [
      { title: "Pamahalaan — Manage Places | Sulyap" },
      {
        name: "description",
        content:
          "Add, edit, and remove the heritage destinations shown in the Sulyap CALABARZON virtual tour.",
      },
      { property: "og:title", content: "Pamahalaan — Manage Places | Sulyap" },
      {
        property: "og:description",
        content:
          "Add, edit, and remove the heritage destinations shown in the Sulyap CALABARZON virtual tour.",
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
      onSuccess: () => toast.success(`Deleted "${deleting.name}".`),
      onError: (e) => toast.error(e.message),
    });
    setDeleting(null);
  }

  return (
    <div className="flex min-h-screen flex-col" style={{ backgroundColor: C.paper }}>
      <SiteHeader />

      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6 sm:py-8">
        <div className="flex flex-wrap items-end justify-between gap-4 pb-6">
          <div>
            <Label>Destination management</Label>
            <h1
              className="mt-1 text-[32px] leading-tight sm:text-[38px]"
              style={{ fontFamily: F.display, color: C.ink }}
            >
              Pamahalaan
            </h1>
            <p className="mt-1 text-[15px]" style={{ fontFamily: F.body, color: C.mute }}>
              Add, edit, and remove the places behind the virtual tour.
            </p>
          </div>
          <div className="w-40">
            <Btn label="Add place" color={C.gold} onClick={openNew} />
          </div>
        </div>

        {isError ? (
          <Pop className="my-4 p-5">
            <p className="text-[15px] font-bold" style={{ fontFamily: F.bold, color: C.red }}>
              Could not load places: {error.message}
            </p>
          </Pop>
        ) : null}

        {isPending ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="h-24 animate-pulse rounded-[10px]"
                style={{
                  backgroundColor: C.sand,
                  borderWidth: 2,
                  borderStyle: "solid",
                  borderColor: C.ink,
                }}
              />
            ))}
          </div>
        ) : null}

        {!isPending && !isError ? (
          <div className="space-y-3">
            {(destinations ?? []).length === 0 ? (
              <Pop className="p-7 text-center">
                <h2 className="text-[22px]" style={{ fontFamily: F.display, color: C.ink }}>
                  Wala pang lugar
                </h2>
                <p className="my-2 text-[15px]" style={{ fontFamily: F.body, color: C.mute }}>
                  Add your first CALABARZON heritage place to get started.
                </p>
                <div className="mx-auto mt-4 w-40">
                  <Btn label="Add place" color={C.gold} onClick={openNew} />
                </div>
              </Pop>
            ) : (
              (destinations ?? []).map((destination) => {
                const cat = getCategoryMeta(destination.category);
                const toured = isDestinationToured(destination, progress);
                return (
                  <Pop
                    key={destination.id}
                    className="flex flex-col gap-3 p-3.5 sm:flex-row sm:items-center"
                  >
                    <Cover
                      destination={destination}
                      className="h-16 w-20 shrink-0 rounded-lg"
                      style={{
                        borderWidth: 2,
                        borderStyle: "solid",
                        borderColor: C.ink,
                      }}
                    />

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className="text-[12px] font-bold"
                          style={{ fontFamily: F.bold, color: cat.deep }}
                        >
                          {cat.fil} ({destination.category})
                        </span>
                        {destination.featured ? (
                          <span
                            className="rounded-full px-2 py-0.5 text-[11px] font-bold"
                            style={{
                              fontFamily: F.bold,
                              backgroundColor: C.gold,
                              color: C.ink,
                              borderWidth: 1.5,
                              borderStyle: "solid",
                              borderColor: C.ink,
                            }}
                          >
                            Featured
                          </span>
                        ) : null}
                        {toured ? (
                          <span
                            className="rounded-full px-2 py-0.5 text-[11px] font-bold"
                            style={{
                              fontFamily: F.bold,
                              backgroundColor: C.green,
                              color: "#FFFFFF",
                            }}
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
                        className="mt-0.5 block cursor-pointer truncate text-left text-[20px] hover:underline"
                        style={{ fontFamily: F.display, color: C.ink }}
                      >
                        {destination.name}
                      </button>

                      <p
                        className="truncate text-[13px]"
                        style={{ fontFamily: F.body, color: C.mute }}
                      >
                        {destination.address}, {destination.province}
                      </p>
                    </div>

                    <div className="flex shrink-0 items-center gap-2">
                      <button
                        type="button"
                        onClick={() => openEdit(destination)}
                        aria-label={`Edit ${destination.name}`}
                        className="min-h-[42px] cursor-pointer rounded-lg px-3.5 py-1.5 text-[14px] font-bold transition-colors hover:bg-[#FAF8F1]"
                        style={{
                          fontFamily: F.bold,
                          color: C.ink,
                          backgroundColor: C.card,
                          borderWidth: 2,
                          borderStyle: "solid",
                          borderColor: C.ink,
                        }}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleting(destination)}
                        aria-label={`Delete ${destination.name}`}
                        className="min-h-[42px] cursor-pointer rounded-lg px-3.5 py-1.5 text-[14px] font-bold text-white transition-opacity hover:opacity-90"
                        style={{
                          fontFamily: F.bold,
                          backgroundColor: C.red,
                          borderWidth: 2,
                          borderStyle: "solid",
                          borderColor: C.ink,
                        }}
                      >
                        Delete
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
            backgroundColor: C.paper,
            borderWidth: 2,
            borderStyle: "solid",
            borderColor: C.ink,
          }}
        >
          <DialogHeader>
            <DialogTitle className="text-[26px]" style={{ fontFamily: F.display, color: C.ink }}>
              {editing ? `Edit ${editing.name}` : "Add a place"}
            </DialogTitle>
          </DialogHeader>
          <DestinationForm destination={editing} onDone={() => setFormOpen(false)} />
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleting} onOpenChange={(open) => !open && setDeleting(null)}>
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
              "{deleting?.name}" and its quiz progress will be permanently removed.
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
