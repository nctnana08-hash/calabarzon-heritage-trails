import { Link } from "@tanstack/react-router";
import { Building2, Church, Landmark, MapPin, Mountain } from "lucide-react";

import { SiteHeader, MobileBottomNav } from "@/components/site-nav";
import { DestinationCard } from "@/components/destination-card";
import { useDestinations } from "@/hooks/use-destinations";
import { CATEGORIES, PROVINCES, type Category } from "@/lib/destinations";

// Seed hero image served through the image proxy; kept stable for SSR.
const HERO_IMAGE = "/api/public/images/destination-images/taal-volcano.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Lakbay Kultura — CALABARZON Virtual Tour" },
      {
        name: "description",
        content:
          "Discover the historical shrines, churches, museums, and natural wonders of Region IV-A (CALABARZON) through a virtual tour built as an alternative to educational field trips.",
      },
      { property: "og:title", content: "Lakbay Kultura — CALABARZON Virtual Tour" },
      {
        property: "og:description",
        content:
          "A virtual tour of CALABARZON heritage: historical shrines, religious landmarks, museums, and natural heritage across Cavite, Laguna, Batangas, Rizal, and Quezon.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const CATEGORY_ICONS: Record<Category, typeof Landmark> = {
  "Historical Shrines": Landmark,
  "Religious Landmarks": Church,
  Museums: Building2,
  "Natural Heritage": Mountain,
};

const CATEGORY_BLURBS: Record<Category, string> = {
  "Historical Shrines": "Homes and fortresses of the revolution",
  "Religious Landmarks": "Centuries-old churches and pilgrimage sites",
  Museums: "Curated rooms of history and art",
  "Natural Heritage": "Volcanoes, lakes, falls, and sacred mountains",
};

function Index() {
  const { data: destinations, isPending, isError, error } = useDestinations();
  const featured = (destinations ?? []).filter((d) => d.featured).slice(0, 4);

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />

      <main className="flex-1">
        {/* Hero */}
        <section className="relative isolate overflow-hidden">
          <img
            src={HERO_IMAGE}
            alt="Aerial view of Taal Volcano, Batangas"
            className="absolute inset-0 -z-10 h-full w-full object-cover"
          />
          <div className="absolute inset-0 -z-10 bg-gradient-to-b from-primary/80 via-primary/55 to-background" />
          <div className="mx-auto flex max-w-6xl flex-col items-start gap-5 px-4 pb-16 pt-20 sm:pb-24 sm:pt-28">
            <p className="text-[0.65rem] font-semibold uppercase tracking-[0.3em] text-primary-foreground/80">
              Region IV-A · Cavite · Laguna · Batangas · Rizal · Quezon
            </p>
            <h1 className="max-w-2xl font-display text-4xl font-semibold leading-tight text-primary-foreground sm:text-6xl">
              Walk the heritage of CALABARZON — from anywhere.
            </h1>
            <p className="max-w-xl text-base text-primary-foreground/90 sm:text-lg">
              A virtual alternative to educational field trips: explore the shrines,
              churches, museums, and natural wonders of Southern Luzon in one curated map.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                to="/destinations"
                className="inline-flex items-center justify-center rounded-md bg-primary-foreground px-5 py-2.5 text-sm font-semibold text-primary transition-colors hover:bg-accent hover:text-accent-foreground"
              >
                Start exploring
              </Link>
              <Link
                to="/destinations"
                search={{ view: "map" }}
                className="inline-flex items-center justify-center rounded-md border border-primary-foreground/40 px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-foreground/10"
              >
                Open the cultural map
              </Link>
            </div>
          </div>
        </section>

        {/* Categories */}
        <section className="mx-auto max-w-6xl px-4 py-12 sm:py-16">
          <p className="text-[0.65rem] font-semibold uppercase tracking-[0.3em] text-muted-foreground">
            Browse by category
          </p>
          <h2 className="mt-2 font-display text-3xl font-semibold text-foreground">
            Four doors into the region's story
          </h2>
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {CATEGORIES.map((category) => {
              const Icon = CATEGORY_ICONS[category];
              const count = (destinations ?? []).filter((d) => d.category === category).length;
              return (
                <Link
                  key={category}
                  to="/destinations"
                  search={{ category }}
                  className="group rounded-lg border border-border bg-card p-5 transition-colors hover:border-primary/40 hover:bg-secondary"
                >
                  <Icon className="size-6 text-primary" />
                  <h3 className="mt-3 font-display text-xl font-semibold text-foreground">
                    {category}
                  </h3>
                  <p className="mt-1 text-sm text-muted-foreground">{CATEGORY_BLURBS[category]}</p>
                  <p className="mt-3 text-xs font-semibold uppercase tracking-widest text-primary">
                    {count} {count === 1 ? "site" : "sites"}
                  </p>
                </Link>
              );
            })}
          </div>
        </section>

        {/* Featured destinations */}
        <section className="mx-auto max-w-6xl px-4 pb-12 sm:pb-16">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-[0.65rem] font-semibold uppercase tracking-[0.3em] text-muted-foreground">
                Curated for the classroom
              </p>
              <h2 className="mt-2 font-display text-3xl font-semibold text-foreground">
                Featured destinations
              </h2>
            </div>
            <Link
              to="/destinations"
              className="shrink-0 text-sm font-semibold text-primary hover:underline"
            >
              View all
            </Link>
          </div>
          <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {isPending
              ? Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="h-72 animate-pulse rounded-lg bg-muted" />
                ))
              : featured.map((destination) => (
                  <DestinationCard key={destination.id} destination={destination} />
                ))}
            {!isPending && featured.length === 0 && (
              <p className="text-sm text-muted-foreground">
                No featured destinations yet — add some in Manage.
              </p>
            )}
          </div>
        </section>

        {/* Provinces */}
        <section className="border-y border-border bg-secondary">
          <div className="mx-auto max-w-6xl px-4 py-12 sm:py-16">
            <p className="text-[0.65rem] font-semibold uppercase tracking-[0.3em] text-muted-foreground">
              Five provinces
            </p>
            <h2 className="mt-2 font-display text-3xl font-semibold text-foreground">
              One region, many stories
            </h2>
            <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
              {PROVINCES.map((province) => {
                const count = (destinations ?? []).filter((d) => d.province === province).length;
                return (
                  <Link
                    key={province}
                    to="/destinations"
                    search={{ province }}
                    className="rounded-lg border border-border bg-card p-4 transition-colors hover:border-primary/40"
                  >
                    <h3 className="font-display text-2xl font-semibold text-foreground">
                      {province}
                    </h3>
                    <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                      <MapPin className="size-3" />
                      {count} {count === 1 ? "destination" : "destinations"}
                    </p>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>

        {/* Closing CTA */}
        <section className="mx-auto max-w-6xl px-4 py-12 sm:py-16">
          <div className="rounded-lg bg-primary px-6 py-10 text-center sm:px-12">
            <h2 className="font-display text-3xl font-semibold text-primary-foreground sm:text-4xl">
              Bring the field trip to your classroom.
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-sm text-primary-foreground/85 sm:text-base">
              Every destination includes its story, location, and context — ready for
              self-guided virtual visits and cultural mapping activities.
            </p>
            <Link
              to="/destinations"
              search={{ view: "map" }}
              className="mt-6 inline-flex items-center justify-center rounded-md bg-primary-foreground px-6 py-3 text-sm font-semibold text-primary transition-colors hover:bg-accent hover:text-accent-foreground"
            >
              Open the cultural map
            </Link>
          </div>
        </section>
      </main>

      <footer className="mx-auto max-w-6xl px-4 pb-8 text-center text-xs text-muted-foreground">
        Lakbay Kultura · A Phase 1 virtual tour and cultural mapping app for Region IV-A
        {isError && <span className="block text-destructive">Data error: {error.message}</span>}
      </footer>

      <MobileBottomNav />
    </div>
  );
}
