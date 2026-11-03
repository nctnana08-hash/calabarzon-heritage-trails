import { Link, createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";
import { ArrowLeft, MapPin } from "lucide-react";

import { SiteHeader, MobileBottomNav } from "@/components/site-nav";
import { MapView } from "@/components/map-view";
import { useDestination } from "@/hooks/use-destinations";
import { imageUrl } from "@/lib/destinations";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/destinations/$slug")({
  head: () => ({
    meta: [
      { title: "Destination | Lakbay Kultura" },
      {
        name: "description",
        content:
          "Discover a CALABARZON heritage destination: its story, location, and cultural context.",
      },
      { property: "og:title", content: "Destination | Lakbay Kultura" },
      {
        property: "og:description",
        content:
          "Discover a CALABARZON heritage destination: its story, location, and cultural context.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: DestinationDetail,
});

function DestinationDetail() {
  const { slug } = Route.useParams();
  const { data: destination, isPending, isError, error } = useDestination(slug);

  useEffect(() => {
    if (destination) document.title = `${destination.name} | Lakbay Kultura`;
  }, [destination]);

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />

      <main className="flex-1">
        <div className="mx-auto w-full max-w-6xl px-4 pt-6">
          <Button variant="ghost" size="sm" asChild className="-ml-2 text-muted-foreground">
            <Link to="/destinations">
              <ArrowLeft className="size-4" /> Back to destinations
            </Link>
          </Button>
        </div>

        {isPending && (
          <div className="mx-auto w-full max-w-6xl px-4 py-6">
            <div className="h-72 animate-pulse rounded-lg bg-muted sm:h-96" />
            <div className="mt-6 h-8 w-2/3 animate-pulse rounded bg-muted" />
            <div className="mt-4 h-24 animate-pulse rounded bg-muted" />
          </div>
        )}

        {isError && (
          <div className="mx-auto w-full max-w-6xl px-4 py-10">
            <p className="rounded-md border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
              Could not load this destination: {error.message}
            </p>
          </div>
        )}

        {!isPending && !isError && !destination && (
          <div className="mx-auto w-full max-w-6xl px-4 py-16 text-center">
            <h1 className="font-display text-3xl font-semibold text-foreground">
              Destination not found
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              It may have been removed. Explore the remaining destinations instead.
            </p>
            <Button className="mt-6" asChild>
              <Link to="/destinations">Explore destinations</Link>
            </Button>
          </div>
        )}

        {destination && (
          <article className="mx-auto w-full max-w-6xl px-4 pb-12">
            <div className="relative overflow-hidden rounded-lg border border-border bg-muted">
              {imageUrl(destination) ? (
                <img
                  src={imageUrl(destination)!}
                  alt={destination.name}
                  className="h-72 w-full object-cover sm:h-96"
                />
              ) : (
                <div className="flex h-72 w-full items-center justify-center bg-secondary sm:h-96">
                  <MapPin className="size-10 text-muted-foreground/50" />
                </div>
              )}
              <Badge
                variant="secondary"
                className="absolute left-4 top-4 border border-border/60 bg-background/90 font-medium text-primary backdrop-blur"
              >
                {destination.category}
              </Badge>
            </div>

            <header className="mt-6">
              <h1 className="font-display text-4xl font-semibold leading-tight text-foreground sm:text-5xl">
                {destination.name}
              </h1>
              <p className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted-foreground">
                <MapPin className="size-4" />
                <span>
                  {destination.address} · {destination.province} Province
                </span>
                <span className="text-border">|</span>
                <span>Region IV-A, CALABARZON</span>
              </p>
            </header>

            <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-[1fr_380px]">
              <div>
                <h2 className="text-[0.65rem] font-semibold uppercase tracking-[0.3em] text-muted-foreground">
                  About this destination
                </h2>
                <p className="mt-3 whitespace-pre-line text-base leading-relaxed text-foreground/90">
                  {destination.description || "No description has been added yet."}
                </p>
                <div className="mt-8 flex flex-wrap gap-3">
                  <Button asChild>
                    <Link to="/destinations" search={{ view: "map" }}>
                      View on the cultural map
                    </Link>
                  </Button>
                  <Button variant="outline" asChild>
                    <Link to="/manage">Edit in Manage</Link>
                  </Button>
                </div>
              </div>

              <aside className="space-y-4">
                <div className="overflow-hidden rounded-lg border border-border">
                  <MapView
                    destinations={[destination]}
                    center={
                      destination.latitude != null && destination.longitude != null
                        ? [destination.latitude, destination.longitude]
                        : undefined
                    }
                    zoom={destination.latitude != null ? 13 : 9}
                    className="h-64 w-full"
                  />
                </div>
                <dl className="rounded-lg border border-border bg-card p-4 text-sm">
                  <div className="flex justify-between gap-4 py-1.5">
                    <dt className="text-muted-foreground">Province</dt>
                    <dd className="font-medium text-foreground">{destination.province}</dd>
                  </div>
                  <div className="flex justify-between gap-4 border-t border-border py-1.5">
                    <dt className="text-muted-foreground">Category</dt>
                    <dd className="text-right font-medium text-foreground">
                      {destination.category}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-4 border-t border-border py-1.5">
                    <dt className="text-muted-foreground">Coordinates</dt>
                    <dd className="text-right font-medium text-foreground">
                      {destination.latitude != null && destination.longitude != null
                        ? `${destination.latitude.toFixed(4)}, ${destination.longitude.toFixed(4)}`
                        : "—"}
                    </dd>
                  </div>
                </dl>
              </aside>
            </div>
          </article>
        )}
      </main>

      <MobileBottomNav />
    </div>
  );
}
