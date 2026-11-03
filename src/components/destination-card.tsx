import { Link } from "@tanstack/react-router";
import { MapPin } from "lucide-react";

import { imageUrl, type Destination } from "@/lib/destinations";
import { Badge } from "@/components/ui/badge";

export function DestinationCard({ destination }: { destination: Destination }) {
  const img = imageUrl(destination);

  return (
    <Link
      to="/destinations/$slug"
      params={{ slug: destination.slug }}
      className="group flex flex-col overflow-hidden rounded-lg border border-border bg-card transition-shadow hover:shadow-md"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        {img ? (
          <img
            src={img}
            alt={destination.name}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-secondary">
            <MapPin className="size-8 text-muted-foreground/50" />
          </div>
        )}
        <Badge
          variant="secondary"
          className="absolute left-3 top-3 border border-border/60 bg-background/90 font-medium text-primary backdrop-blur"
        >
          {destination.category}
        </Badge>
      </div>
      <div className="flex flex-1 flex-col p-4">
        <h3 className="font-display text-xl font-semibold leading-snug text-foreground">
          {destination.name}
        </h3>
        <p className="mt-1.5 flex items-center gap-1 text-xs text-muted-foreground">
          <MapPin className="size-3.5 shrink-0" />
          <span className="line-clamp-1">
            {destination.address} · {destination.province}
          </span>
        </p>
      </div>
    </Link>
  );
}
