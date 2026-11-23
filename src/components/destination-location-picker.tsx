import { useEffect, useState } from "react";
import { MapContainer, Marker, TileLayer, useMap, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

type Result = { display_name: string; lat: string; lon: string };
const pin = L.divIcon({
  className: "destination-location-pin",
  html: "<span></span>",
  iconSize: [26, 36],
  iconAnchor: [13, 34],
});

function Viewport({ position }: { position: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(position, Math.max(map.getZoom(), 14));
  }, [map, position]);
  return null;
}

function PickOnMap({ onPick }: { onPick: (position: [number, number]) => void }) {
  useMapEvents({ click: (event) => onPick([event.latlng.lat, event.latlng.lng]) });
  return null;
}

export default function DestinationLocationPicker({
  latitude,
  longitude,
  onPick,
}: {
  latitude: number | null;
  longitude: number | null;
  onPick: (lat: number, lng: number) => void;
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Result[]>([]);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState("");
  const position: [number, number] =
    latitude != null && longitude != null ? [latitude, longitude] : [14.1, 121.15];

  async function search(event: React.FormEvent) {
    event.preventDefault();
    if (!query.trim()) return;
    setSearching(true);
    setError("");
    setResults([]);
    try {
      const url = new URL("https://nominatim.openstreetmap.org/search");
      url.search = new URLSearchParams({
        q: `${query.trim()}, CALABARZON, Philippines`,
        format: "jsonv2",
        limit: "5",
        addressdetails: "1",
      }).toString();
      const response = await fetch(url, { headers: { Accept: "application/json" } });
      if (!response.ok)
        throw new Error(
          "Place search is temporarily unavailable. Try again or tap the map to set the pin.",
        );
      const found = (await response.json()) as Result[];
      setResults(found);
      if (found.length === 0)
        setError("No matching places found. Try a nearby town or landmark name.");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not search for that place.");
    } finally {
      setSearching(false);
    }
  }

  return (
    <section className="space-y-2">
      <div>
        <p className="text-sm font-bold">Map pin</p>
        <p className="text-xs text-slate-600">
          Search for the heritage place, choose a result, or tap its location on the map.
        </p>
      </div>
      <form onSubmit={search} className="flex gap-2">
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search place or landmark"
          aria-label="Search map for a place"
          className="min-w-0 flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
        />
        <button
          disabled={searching}
          className="rounded-lg bg-[#0038A8] px-4 py-2 text-sm font-bold text-white disabled:opacity-60"
        >
          {searching ? "Searching…" : "Search"}
        </button>
      </form>
      {results.length > 0 && (
        <div className="max-h-36 space-y-1 overflow-auto rounded-lg border border-slate-200 p-1">
          {results.map((result) => (
            <button
              key={`${result.lat},${result.lon}`}
              type="button"
              onClick={() => {
                onPick(Number(result.lat), Number(result.lon));
                setQuery(result.display_name);
                setResults([]);
              }}
              className="block w-full rounded px-2 py-1.5 text-left text-xs hover:bg-slate-100"
            >
              {result.display_name}
            </button>
          ))}
        </div>
      )}
      {error && <p className="text-xs text-red-700">{error}</p>}
      <MapContainer
        center={position}
        zoom={latitude != null ? 14 : 9}
        className="h-64 w-full rounded-xl"
        style={{ zIndex: 0 }}
      >
        <TileLayer
          url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        <Viewport position={position} />
        <PickOnMap onPick={([lat, lng]) => onPick(lat, lng)} />
        {latitude != null && longitude != null && (
          <Marker position={[latitude, longitude]} icon={pin} />
        )}
      </MapContainer>
      {latitude != null && longitude != null && (
        <p className="text-xs text-slate-600">Pin selected. Saved automatically with this place.</p>
      )}
    </section>
  );
}
