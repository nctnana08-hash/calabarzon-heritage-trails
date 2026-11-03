import { useEffect } from "react";
import L from "leaflet";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import { Link } from "@tanstack/react-router";
import "leaflet/dist/leaflet.css";

import type { Destination } from "@/lib/destinations";

// Loaded only on the client through React.lazy — never imported from an SSR route directly.

const PIN = L.divIcon({
  className: "lk-map-pin",
  html: "<span></span>",
  iconSize: [16, 16],
  iconAnchor: [8, 8],
  popupAnchor: [0, -8],
});

export default function CulturalMap({
  destinations,
  center = [14.1, 121.15],
  zoom = 9,
  className = "h-[420px] w-full",
  interactive = true,
}: {
  destinations: Destination[];
  center?: [number, number] | undefined;
  zoom?: number | undefined;
  className?: string | undefined;
  interactive?: boolean | undefined;
}) {
  useEffect(() => {
    // Leaflet needs a resize nudge when it mounts inside a hidden/animated container.
    window.dispatchEvent(new Event("resize"));
  }, []);

  const placed = destinations.filter(
    (d) => d.latitude != null && d.longitude != null,
  );

  return (
    <MapContainer
      center={center}
      zoom={zoom}
      scrollWheelZoom={interactive}
      dragging={interactive}
      className={className}
      style={{ zIndex: 0 }}
    >
      <TileLayer
        url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      {placed.map((d) => (
        <Marker key={d.id} position={[d.latitude!, d.longitude!]} icon={PIN}>
          <Popup>
            <div>
              <Link to="/destinations/$slug" params={{ slug: d.slug }}>
                {d.name}
              </Link>
              <p className="mt-1 text-xs text-muted-foreground">
                {d.address} · {d.province}
              </p>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
