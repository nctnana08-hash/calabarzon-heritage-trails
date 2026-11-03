import { useEffect } from "react";
import L from "leaflet";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import { Link } from "@tanstack/react-router";
import "leaflet/dist/leaflet.css";

import type { Destination } from "@/lib/destinations";
import { C, F, getCategoryMeta } from "@/lib/sulyap-theme";

// Loaded only on the client through React.lazy — never imported from an SSR route directly.

function createCategoryPin(category: string) {
  const cat = getCategoryMeta(category);
  return L.divIcon({
    className: "lk-map-pin",
    html: `<span style="display:block;width:18px;height:18px;transform:rotate(45deg);background:${cat.color};border:2px solid ${C.ink};box-shadow:2px 2px 0 ${C.ink};"></span>`,
    iconSize: [20, 20],
    iconAnchor: [10, 10],
    popupAnchor: [0, -10],
  });
}

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

  const placed = destinations.filter((d) => d.latitude != null && d.longitude != null);

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
      {placed.map((d) => {
        const cat = getCategoryMeta(d.category);
        return (
          <Marker
            key={d.id}
            position={[d.latitude!, d.longitude!]}
            icon={createCategoryPin(d.category)}
          >
            <Popup>
              <div style={{ fontFamily: F.body }}>
                <div
                  style={{
                    fontFamily: F.bold,
                    fontSize: 11,
                    color: cat.deep,
                  }}
                >
                  {cat.fil} ({d.category})
                </div>
                <Link
                  to="/destinations/$slug"
                  params={{ slug: d.slug }}
                  style={{
                    fontFamily: F.display,
                    fontSize: 16,
                    color: C.ink,
                    textDecoration: "none",
                  }}
                >
                  {d.name}
                </Link>
                <p className="mt-1 text-xs" style={{ fontFamily: F.body, color: C.mute }}>
                  {d.address}, {d.province}
                </p>
              </div>
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
}
