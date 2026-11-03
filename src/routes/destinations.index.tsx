import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";

import { SiteHeader, MobileBottomNav } from "@/components/site-nav";
import { DestinationForm } from "@/components/destination-form";
import { MapView } from "@/components/map-view";
import { SulyapPassport } from "@/components/sulyap-passport";
import { Btn, Chip, Label, Pop, Ticket } from "@/components/sulyap-ui";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useDestinations } from "@/hooks/use-destinations";
import { CATEGORIES, PROVINCES, filterDestinations } from "@/lib/destinations";
import { getDestinationProgress, isDestinationToured, useSulyapProgress } from "@/lib/sulyap-data";
import { C, F, getCategoryMeta } from "@/lib/sulyap-theme";

type ExploreSearch = {
  q?: string | undefined;
  category?: string | undefined;
  province?: string | undefined;
  view?: "map" | "list" | "passport" | undefined;
};

export const Route = createFileRoute("/destinations/")({
  validateSearch: (search: Record<string, unknown>): ExploreSearch => ({
    q: typeof search["q"] === "string" ? search["q"] : undefined,
    category: typeof search["category"] === "string" ? search["category"] : undefined,
    province: typeof search["province"] === "string" ? search["province"] : undefined,
    view: search["view"] === "map" ? "map" : search["view"] === "passport" ? "passport" : "list",
  }),
  head: () => ({
    meta: [
      { title: "Destinasyon & Pasaporte | Sulyap" },
      {
        name: "description",
        content:
          "Search and filter the heritage destinations of CALABARZON by category and province, browse the cultural map, or inspect your Pasaporte stamps.",
      },
      { property: "og:title", content: "Destinasyon & Pasaporte | Sulyap" },
      {
        property: "og:description",
        content:
          "Search and filter the heritage destinations of CALABARZON by category and province.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ExplorePage,
});

function ExplorePage() {
  const search = Route.useSearch();
  const navigate = useNavigate({ from: Route.fullPath });
  const { data: destinations, isPending, isError, error } = useDestinations();
  const progress = useSulyapProgress();
  const [addOpen, setAddOpen] = useState(false);

  const setSearch = (patch: Partial<ExploreSearch>) =>
    navigate({ search: (prev) => ({ ...prev, ...patch }), replace: true });

  const allDestinations = destinations ?? [];
  const filtered = filterDestinations(allDestinations, search);
  const hasFilters = !!(search.q || search.category || search.province);
  const view = search.view ?? "list";

  return (
    <div className="flex min-h-screen flex-col" style={{ backgroundColor: C.paper }}>
      <SiteHeader />

      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6 sm:py-8">
        {view === "passport" ? (
          <SulyapPassport destinations={allDestinations} />
        ) : (
          <>
            {/* Top Header Row */}
            <div className="flex flex-wrap items-end justify-between gap-4 pb-4">
              <div>
                <h1
                  className="text-[32px] leading-tight sm:text-[38px]"
                  style={{ fontFamily: F.display, color: C.ink }}
                >
                  Destinasyon
                </h1>
                <Label>
                  {filtered.length} {filtered.length === 1 ? "place" : "places"} to visit
                </Label>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                <Chip
                  label="Tickets"
                  on={view === "list"}
                  color={C.blue}
                  onClick={() => setSearch({ view: "list" })}
                />
                <Chip
                  label="Mapa"
                  on={view === "map"}
                  color={C.green}
                  onClick={() => setSearch({ view: "map" })}
                />
                <div className="w-32">
                  <Btn label="Add place" color={C.gold} onClick={() => setAddOpen(true)} />
                </div>
              </div>
            </div>

            {/* Search Input */}
            <div className="mb-3">
              <input
                type="search"
                value={search.q ?? ""}
                onChange={(e) => setSearch({ q: e.target.value || undefined })}
                placeholder="Search name, town, or province"
                aria-label="Search name, town, or province"
                className="w-full rounded-[10px] px-4 py-3 text-[16px] focus-visible:outline-2"
                style={{
                  fontFamily: F.body,
                  color: C.ink,
                  backgroundColor: C.card,
                  borderWidth: 2,
                  borderStyle: "solid",
                  borderColor: C.ink,
                  outlineColor: C.blue,
                }}
              />
            </div>

            {/* Category Filter Chips */}
            <div
              className="mb-2.5 flex flex-wrap items-center gap-2"
              role="group"
              aria-label="Filter by category"
            >
              <Chip
                label="All"
                on={!search.category}
                color={C.ink}
                onClick={() => setSearch({ category: undefined })}
              />
              {CATEGORIES.map((c) => {
                const meta = getCategoryMeta(c);
                return (
                  <Chip
                    key={c}
                    label={`${meta.fil} (${c})`}
                    on={search.category === c}
                    color={meta.color}
                    onClick={() =>
                      setSearch({
                        category: search.category === c ? undefined : c,
                      })
                    }
                  />
                );
              })}
              {search.province ? (
                <Chip
                  label={`${search.province}  ✕`}
                  on={true}
                  color={C.ink}
                  ariaLabel={`Clear province filter ${search.province}`}
                  onClick={() => setSearch({ province: undefined })}
                />
              ) : null}
            </div>

            {/* Province Filter Chips */}
            <div
              className="mb-5 flex flex-wrap items-center gap-2"
              role="group"
              aria-label="Filter by province"
            >
              {PROVINCES.map((p) => (
                <Chip
                  key={p}
                  label={p}
                  on={search.province === p}
                  color={C.blue}
                  onClick={() =>
                    setSearch({
                      province: search.province === p ? undefined : p,
                    })
                  }
                />
              ))}
            </div>

            {/* Error State */}
            {isError ? (
              <Pop className="my-4 p-5">
                <h2 className="text-[20px]" style={{ fontFamily: F.display, color: C.red }}>
                  Hindi nabuksan ang listahan
                </h2>
                <p className="mt-1 text-[15px]" style={{ fontFamily: F.body, color: C.ink }}>
                  Could not load places: {error.message}
                </p>
              </Pop>
            ) : null}

            {/* Loading State */}
            {!isError && isPending ? (
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-32 animate-pulse rounded-[10px]"
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

            {/* Loaded View */}
            {!isError && !isPending ? (
              view === "map" ? (
                <Pop className="overflow-hidden">
                  <MapView destinations={filtered} className="h-[520px] w-full" />
                </Pop>
              ) : filtered.length === 0 ? (
                <Pop className="p-6">
                  <h2 className="text-[22px]" style={{ fontFamily: F.display, color: C.ink }}>
                    Walang nakita
                  </h2>
                  <p
                    className="my-2 text-[15px] leading-[22px]"
                    style={{ fontFamily: F.body, color: C.mute }}
                  >
                    No place matches your search. Clear a filter, or add the place yourself.
                  </p>
                  <div className="mt-4 flex flex-wrap gap-3">
                    {hasFilters ? (
                      <div className="w-40">
                        <Btn
                          label="Clear filters"
                          color={C.card}
                          onClick={() =>
                            setSearch({
                              q: undefined,
                              category: undefined,
                              province: undefined,
                            })
                          }
                        />
                      </div>
                    ) : null}
                    <div className="w-40">
                      <Btn label="Add place" color={C.gold} onClick={() => setAddOpen(true)} />
                    </div>
                  </div>
                </Pop>
              ) : (
                <div className="space-y-3.5">
                  {filtered.map((item) => {
                    const prog = getDestinationProgress(item, progress);
                    return (
                      <Ticket
                        key={item.id}
                        destination={item}
                        done={isDestinationToured(item, progress)}
                        quizBest={
                          prog && prog.attempts > 0 && prog.total > 0
                            ? { best: prog.best, total: prog.total }
                            : null
                        }
                        onClick={() =>
                          navigate({
                            to: "/destinations/$slug",
                            params: { slug: item.slug },
                          })
                        }
                      />
                    );
                  })}
                </div>
              )
            ) : null}
          </>
        )}
      </main>

      {/* Add Place Modal */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
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
              Add a place
            </DialogTitle>
          </DialogHeader>
          <DestinationForm onDone={() => setAddOpen(false)} />
        </DialogContent>
      </Dialog>

      <MobileBottomNav />
    </div>
  );
}
