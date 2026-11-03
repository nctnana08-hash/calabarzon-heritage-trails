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
      { title: "Places & Passport | Sulyap" },
      {
        name: "description",
        content: "Explore heritage destinations across CALABARZON.",
      },
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

      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-8">
        {view === "passport" ? (
          <SulyapPassport destinations={allDestinations} />
        ) : (
          <>
            {/* Clean Header */}
            <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
              <div>
                <h1
                  className="text-[30px] font-bold leading-tight sm:text-[36px]"
                  style={{ fontFamily: F.display, color: C.ink }}
                >
                  Places
                </h1>
                <Label>
                  {filtered.length} {filtered.length === 1 ? "destination" : "destinations"}
                </Label>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <Chip
                  label="List"
                  on={view === "list"}
                  color={C.cover}
                  onClick={() => setSearch({ view: "list" })}
                />
                <Chip
                  label="Map"
                  on={view === "map"}
                  color={C.green}
                  onClick={() => setSearch({ view: "map" })}
                />
                <Chip
                  label="Passport"
                  on={false}
                  color={C.cover}
                  onClick={() => setSearch({ view: "passport" })}
                />
                <Btn label="+ Add Place" color={C.foil} onClick={() => setAddOpen(true)} />
              </div>
            </div>

            {/* Clean Search & Filter Bar */}
            <div className="mb-6 space-y-3">
              <input
                type="search"
                value={search.q ?? ""}
                onChange={(e) => setSearch({ q: e.target.value || undefined })}
                placeholder="Search by name, town, or province..."
                aria-label="Search by name, town, or province"
                className="w-full rounded-xl border px-4 py-2.5 text-[15px] focus-visible:outline-2"
                style={{
                  fontFamily: F.body,
                  color: C.ink,
                  backgroundColor: C.card,
                  borderColor: "#DED5C0",
                  outlineColor: C.cover,
                }}
              />

              <div className="flex flex-wrap items-center gap-1.5">
                <Chip
                  label="All"
                  on={!search.category && !search.province}
                  color={C.cover}
                  onClick={() => setSearch({ category: undefined, province: undefined })}
                />
                {PROVINCES.map((p) => (
                  <Chip
                    key={p}
                    label={p}
                    on={search.province === p}
                    color={C.cover}
                    onClick={() =>
                      setSearch({
                        province: search.province === p ? undefined : p,
                      })
                    }
                  />
                ))}
                <span className="mx-1 text-[#C8BDA4]">|</span>
                {CATEGORIES.map((c) => {
                  const meta = getCategoryMeta(c);
                  return (
                    <Chip
                      key={c}
                      label={meta.fil}
                      on={search.category === c}
                      color={meta.deep}
                      onClick={() =>
                        setSearch({
                          category: search.category === c ? undefined : c,
                        })
                      }
                    />
                  );
                })}
                {hasFilters ? (
                  <button
                    type="button"
                    onClick={() =>
                      setSearch({
                        q: undefined,
                        category: undefined,
                        province: undefined,
                      })
                    }
                    className="ml-2 cursor-pointer text-[12px] font-medium underline"
                    style={{ fontFamily: F.body, color: C.mute }}
                  >
                    Clear
                  </button>
                ) : null}
              </div>
            </div>

            {isError ? (
              <Pop className="my-4 p-5">
                <p className="text-[14px]" style={{ color: C.red }}>
                  Could not load places: {error.message}
                </p>
              </Pop>
            ) : null}

            {!isError && isPending ? (
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-24 animate-pulse rounded-xl"
                    style={{ backgroundColor: C.sand }}
                  />
                ))}
              </div>
            ) : null}

            {!isError && !isPending ? (
              view === "map" ? (
                <Pop className="overflow-hidden p-1">
                  <MapView destinations={filtered} className="h-[520px] w-full rounded-lg" />
                </Pop>
              ) : filtered.length === 0 ? (
                <Pop className="p-6 text-center">
                  <h2
                    className="text-[22px] font-bold"
                    style={{ fontFamily: F.display, color: C.ink }}
                  >
                    No places found
                  </h2>
                  <p className="mt-1 text-[14px]" style={{ fontFamily: F.body, color: C.mute }}>
                    Try clearing your filters or add a new place.
                  </p>
                </Pop>
              ) : (
                <div className="space-y-2.5">
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

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
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
              Add a Place
            </DialogTitle>
          </DialogHeader>
          <DestinationForm onDone={() => setAddOpen(false)} />
        </DialogContent>
      </Dialog>

      <MobileBottomNav />
    </div>
  );
}
