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
      { title: "Visa Directory & Pasaporte | Sulyap" },
      {
        name: "description",
        content:
          "Search and filter the heritage destinations of CALABARZON by category and province, browse the cultural cartography map, or inspect your Pasaporte stamps.",
      },
      { property: "og:title", content: "Visa Directory & Pasaporte | Sulyap" },
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
            {/* Top Passport Registry Header Row */}
            <div
              className="mb-5 flex flex-wrap items-end justify-between gap-4 border-b pb-4"
              style={{ borderColor: "#D6CCB5" }}
            >
              <div>
                <Label>OFFICIAL REGIONAL DIRECTORY · REHIYON IV-A</Label>
                <h1
                  className="mt-0.5 text-[32px] font-bold leading-tight sm:text-[40px]"
                  style={{ fontFamily: F.display, color: C.ink }}
                >
                  Talaan ng mga Destinasyon
                </h1>
                <span
                  className="text-[12px] font-semibold"
                  style={{ fontFamily: F.mono, color: C.mute }}
                >
                  {filtered.length} {filtered.length === 1 ? "VISA DOSSIER" : "VISA DOSSIERS"}{" "}
                  AVAILABLE FOR INSPECTION
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <Chip
                  label="Visa Dossiers"
                  on={view === "list"}
                  color={C.cover}
                  onClick={() => setSearch({ view: "list" })}
                />
                <Chip
                  label="Cartography Map"
                  on={view === "map"}
                  color={C.green}
                  onClick={() => setSearch({ view: "map" })}
                />
                <Chip
                  label="Stamp Booklet"
                  on={false}
                  color={C.cover}
                  onClick={() => setSearch({ view: "passport" })}
                />
                <div className="w-36">
                  <Btn label="+ Register Site" color={C.foil} onClick={() => setAddOpen(true)} />
                </div>
              </div>
            </div>

            {/* Search & Filter Control Panel */}
            <div className="passport-page-surface mb-6 rounded-lg border border-[#C8BDA4] p-4 shadow-xs">
              <div className="mb-3">
                <Label className="mb-1">SEARCH HERITAGE REGISTRY</Label>
                <input
                  type="search"
                  value={search.q ?? ""}
                  onChange={(e) => setSearch({ q: e.target.value || undefined })}
                  placeholder="Search destination name, municipality, or province..."
                  aria-label="Search name, town, or province"
                  className="w-full rounded-md border px-4 py-2.5 text-[15px] focus-visible:outline-2"
                  style={{
                    fontFamily: F.body,
                    color: C.ink,
                    backgroundColor: C.card,
                    borderColor: "#BFB399",
                    outlineColor: C.cover,
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
                  label="All Seals"
                  on={!search.category}
                  color={C.cover}
                  onClick={() => setSearch({ category: undefined })}
                />
                {CATEGORIES.map((c) => {
                  const meta = getCategoryMeta(c);
                  return (
                    <Chip
                      key={c}
                      label={`${meta.fil} · ${meta.code}`}
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
              </div>

              {/* Province Filter Chips */}
              <div
                className="flex flex-wrap items-center gap-2 border-t border-dashed border-[#D5CBB4] pt-2.5"
                role="group"
                aria-label="Filter by province"
              >
                <span
                  className="mr-1 text-[11px] font-bold uppercase tracking-[0.12em]"
                  style={{ fontFamily: F.mono, color: C.mute }}
                >
                  PROVINCE:
                </span>
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
                    className="ml-auto cursor-pointer text-[11px] font-bold uppercase tracking-[0.12em] underline"
                    style={{ fontFamily: F.mono, color: C.red }}
                  >
                    Reset Filters ✕
                  </button>
                ) : null}
              </div>
            </div>

            {/* Error State */}
            {isError ? (
              <Pop className="my-4 p-5">
                <h2
                  className="text-[20px] font-bold"
                  style={{ fontFamily: F.display, color: C.red }}
                >
                  Hindi nabuksan ang listahan
                </h2>
                <p className="mt-1 text-[14px]" style={{ fontFamily: F.body, color: C.ink }}>
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
                    className="h-32 animate-pulse rounded-lg border"
                    style={{
                      backgroundColor: C.sand,
                      borderColor: "#C8BDA4",
                    }}
                  />
                ))}
              </div>
            ) : null}

            {/* Loaded View */}
            {!isError && !isPending ? (
              view === "map" ? (
                <Pop className="overflow-hidden p-1.5">
                  <MapView destinations={filtered} className="h-[540px] w-full rounded-md" />
                </Pop>
              ) : filtered.length === 0 ? (
                <Pop className="passport-page-surface p-6">
                  <h2
                    className="text-[24px] font-bold"
                    style={{ fontFamily: F.display, color: C.ink }}
                  >
                    Walang Nakitang Dossier
                  </h2>
                  <p
                    className="my-2 text-[14px] leading-relaxed"
                    style={{ fontFamily: F.body, color: C.mute }}
                  >
                    No heritage visa entry matches your current search or filter criteria. Clear a
                    filter or register a new heritage site below.
                  </p>
                  <div className="mt-4 flex flex-wrap gap-3">
                    {hasFilters ? (
                      <div className="w-40">
                        <Btn
                          label="Clear Filters"
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
                    <div className="w-44">
                      <Btn
                        label="+ Register Site"
                        color={C.foil}
                        onClick={() => setAddOpen(true)}
                      />
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
              Register a Heritage Site in the Passport Directory
            </DialogTitle>
          </DialogHeader>
          <DestinationForm onDone={() => setAddOpen(false)} />
        </DialogContent>
      </Dialog>

      <MobileBottomNav />
    </div>
  );
}
