import * as React from "react";

import { cn } from "@/lib/utils";
import type { Destination } from "@/lib/destinations";

const CulturalMap = React.lazy(() => import("@/components/cultural-map"));

/**
 * SSR-safe wrapper around the Leaflet map. The map module is loaded lazily and
 * only rendered after hydration so SSR never evaluates Leaflet.
 */
export function MapView({
  destinations,
  center,
  zoom,
  className,
  interactive = true,
}: {
  destinations: Destination[];
  center?: [number, number];
  zoom?: number;
  className?: string;
  interactive?: boolean;
}) {
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);

  if (!mounted) {
    return (
      <div
        className={cn(
          "w-full animate-pulse rounded-lg bg-muted",
          className ?? "h-[420px]",
        )}
      />
    );
  }

  return (
    <React.Suspense
      fallback={
        <div
          className={cn(
            "w-full animate-pulse rounded-lg bg-muted",
            className ?? "h-[420px]",
          )}
        />
      }
    >
      <CulturalMap
        destinations={destinations}
        center={center}
        zoom={zoom}
        className={className ?? "h-[420px] w-full"}
        interactive={interactive}
      />
    </React.Suspense>
  );
}
