import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { List, MapPinned, Search, SlidersHorizontal } from "lucide-react";

import { SiteHeader, MobileBottomNav } from "@/components/site-nav";
import { DestinationCard } from "@/components/destination-card";
import { MapView } from "@/components/map-view";
import { useDestinations } from "@/hooks/use-destinations";
import { CATEGORIES, PROVINCES, filterDestinations } from "@/lib/destinations";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ExploreSearch = {
  q?: string;
  category?: string;
  province?: string;
  view?: "map" | "list";
};

export const Route = createFileRoute("/destinations")({
  validateSearch: (search: Record<string, unknown>): ExploreSearch => ({
    q: typeof search.q === "string" ? search.q : undefined,
    category: typeof search.category === "string" ? search.category : undefined,
    province: typeof search.province === "string" ? search.province : undefined,
    view: search.view === "map" ? "map" : "list",
  }),
  head: () => ({
    meta: [
      { title: "Explore Destinations | Lakbay Kultura" },
      {
        name: "description",
        content:
          "Search and filter the heritage destinations of CALABARZON by category and province, or browse them on the cultural map.",
      },
      { property: "og:title", content: "Explore Destinations | Lakbay Kultura" },
      {
        property: "og:description",
        content:
          "Search and filter the heritage destinations of CALABARZON by category and province, or browse them on the cultural map.",
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

  const setSearch = (patch: Partial<ExploreSearch>) =>
    navigate({ search: (prev) => ({ ...prev, ...patch }), replace: true });

  const filtered = filterDestinations(destinations ?? [], search);
  const hasFilters = !!(search.q || search.category || search.province);
  const isMap = search.view === "map";

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">
        <p className="text-[0.65rem] font-semibold uppercase tracking-[0.3em] text-muted-foreground">
          Cultural map of Region IV-A
        </p>
        <h1 className="mt-2 font-display text-4xl font-semibold text-foreground">
          Explore destinations
        </h1>

        {/* Filters */}
        <div className="mt-6 flex flex-col gap-3 rounded-lg border border-border bg-card p-4 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search.q ?? ""}
              onChange={(e) => setSearch({ q: e.target.value })}
              placeholder="Search destinations, places, stories…"
              className="pl-9"
              aria-label="Search destinations"
            />
          </div>
          <div className="flex gap-3">
            <Select
              value={search.category ?? "all"}
              onValueChange={(v) => setSearch({ category: v === "all" ? undefined : v })}
            >
              <SelectTrigger className="w-full sm:w-48" aria-label="Filter by category">
                <SlidersHorizontal className="size-4 text-muted-foreground" />
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All categories</SelectItem>
                {CATEGORIES.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={search.province ?? "all"}
              onValueChange={(v) => setSearch({ province: v === "all" ? undefined : v })}
            >
              <SelectTrigger className="w-full sm:w-40" aria-label="Filter by province">
                <SelectValue placeholder="Province" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All provinces</SelectItem>
                {PROVINCES.map((p) => (
                  <SelectItem key={p} value={p}>
                    {p}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex gap-1 rounded-md border border-border p-1">
            <Button
              variant="ghost"
              size="sm"
              className={cn("h-8 gap-1.5 px-3", !isMap && "bg-secondary text-primary")}
              onClick={() => setSearch({ view: "list" })}
            >
              <List className="size-4" /> List
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className={cn("h-8 gap-1.5 px-3", isMap && "bg-secondary text-primary")}
              onClick={() => setSearch({ view: "map" })}
            >
              <MapPinned className="size-4" /> Map
            </Button>
          </div>
        </div>

        {isError && (
          <p className="mt-6 rounded-md border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
            Could not load destinations: {error.message}
          </p>
        )}

        {!isError && isPending && (
          <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-72 animate-pulse rounded-lg bg-muted" />
            ))}
          </div>
        )}

        {!isError && !isPending && (
          <>
            <p className="mt-6 text-sm text-muted-foreground" aria-live="polite">
              {filtered.length} {filtered.length === 1 ? "destination" : "destinations"}
              {hasFilters && " found"}
            </p>

            {isMap ? (
              <div className="mt-4 overflow-hidden rounded-lg border border-border">
                <MapView destinations={filtered} className="h-[520px] w-full" />
              </div>
            ) : filtered.length === 0 ? (
              <div className="mt-8 rounded-lg border border-dashed border-border p-10 text-center">
                <p className="font-display text-2xl text-foreground">No destinations found</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  {hasFilters
                    ? "Try loosening your search or filters."
                    : "Destinations will appear here once added in Manage."}
                </p>
                {hasFilters && (
                  <Button
                    variant="outline"
                    className="mt-4"
                    onClick={() => setSearch({ q: undefined, category: undefined, province: undefined })}
                  >
                    Clear filters
                  </Button>
                )}
              </div>
            ) : (
              <div className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {filtered.map((destination) => (
                  <DestinationCard key={destination.id} destination={destination} />
                ))}
              </div>
            )}
          </>
        )}
      </main>

      <MobileBottomNav />
    </div>
  );
}
