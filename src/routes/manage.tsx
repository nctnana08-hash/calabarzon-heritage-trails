import { useState } from "react";
import { toast } from "sonner";
import { Pencil, Plus, Trash2 } from "lucide-react";

import { SiteHeader, MobileBottomNav } from "@/components/site-nav";
import { DestinationForm } from "@/components/destination-form";
import {
  useDeleteDestination,
  useDestinations,
} from "@/hooks/use-destinations";
import { imageUrl, type Destination } from "@/lib/destinations";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { MapPin } from "lucide-react";

export const Route = createFileRoute("/manage")({
  head: () => ({
    meta: [
      { title: "Manage Destinations | Lakbay Kultura" },
      {
        name: "description",
        content:
          "Add, edit, and remove the heritage destinations shown in the CALABARZON virtual tour.",
      },
      { property: "og:title", content: "Manage Destinations | Lakbay Kultura" },
      {
        property: "og:description",
        content: "Add, edit, and remove the heritage destinations shown in the CALABARZON virtual tour.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ManagePage,
});

function ManagePage() {
  const { data: destinations, isPending, isError, error } = useDestinations();
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
      onSuccess: () => toast.success(`Deleted “${deleting.name}”.`),
      onError: (e) => toast.error(e.message),
    });
    setDeleting(null);
  }

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-[0.65rem] font-semibold uppercase tracking-[0.3em] text-muted-foreground">
              Destination management
            </p>
            <h1 className="mt-2 font-display text-4xl font-semibold text-foreground">
              Manage destinations
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Add, edit, and remove the records behind the tour.
            </p>
          </div>
          <Button onClick={openNew}>
            <Plus className="size-4" /> Add destination
          </Button>
        </div>

        {isError && (
          <p className="mt-6 rounded-md border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
            Could not load destinations: {error.message}
          </p>
        )}

        {isPending && (
          <div className="mt-8 space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-20 animate-pulse rounded-lg bg-muted" />
            ))}
          </div>
        )}

        {!isPending && !isError && (
          <div className="mt-6 space-y-3">
            {(destinations ?? []).length === 0 && (
              <div className="rounded-lg border border-dashed border-border p-10 text-center">
                <p className="font-display text-2xl text-foreground">No destinations yet</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  Add your first CALABARZON heritage destination.
                </p>
                <Button className="mt-4" onClick={openNew}>
                  <Plus className="size-4" /> Add destination
                </Button>
              </div>
            )}
            {(destinations ?? []).map((destination) => {
              const img = imageUrl(destination);
              return (
                <div
                  key={destination.id}
                  className="flex items-center gap-4 rounded-lg border border-border bg-card p-3"
                >
                  <div className="size-14 shrink-0 overflow-hidden rounded-md bg-secondary">
                    {img && (
                      <img
                        src={img}
                        alt=""
                        loading="lazy"
                        className="h-full w-full object-cover"
                      />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h2 className="truncate font-display text-lg font-semibold text-foreground">
                      {destination.name}
                    </h2>
                    <p className="flex items-center gap-1 truncate text-xs text-muted-foreground">
                      <MapPin className="size-3" />
                      {destination.address} · {destination.province} · {destination.category}
                      {destination.featured && (
                        <span className="ml-1 rounded bg-secondary px-1.5 py-0.5 font-semibold text-primary">
                          Featured
                        </span>
                      )}
                    </p>
                  </div>
                  <div className="flex shrink-0 gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openEdit(destination)}
                      aria-label={`Edit ${destination.name}`}
                    >
                      <Pencil className="size-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:text-destructive"
                      onClick={() => setDeleting(destination)}
                      aria-label={`Delete ${destination.name}`}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl">
              {editing ? "Edit destination" : "Add destination"}
            </DialogTitle>
          </DialogHeader>
          <DestinationForm
            destination={editing}
            onDone={() => setFormOpen(false)}
          />
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleting} onOpenChange={(open) => !open && setDeleting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete destination?</AlertDialogTitle>
            <AlertDialogDescription>
              “{deleting?.name}” will be permanently removed along with its image. This
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={confirmDelete}
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
