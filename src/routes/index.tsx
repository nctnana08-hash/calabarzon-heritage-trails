import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Award, BookOpenCheck, Compass, Eye, Map, MapPin } from "lucide-react";

import { SiteHeader, MobileBottomNav } from "@/components/site-nav";
import { DestinationCard } from "@/components/destination-card";
import { Banig, Label, Pop, Sec, Stamp } from "@/components/sulyap-ui";
import { useDestinations } from "@/hooks/use-destinations";
import { PROVINCES } from "@/lib/destinations";
import { isDestinationToured, useSulyapProgress } from "@/lib/sulyap-data";
import { C, F, PROVINCE_TONES } from "@/lib/sulyap-theme";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Sulyap — CALABARZON Travel Passport" },
      {
        name: "description",
        content:
          "Explore 19 heritage sites across Cavite, Laguna, Batangas, Rizal, and Quezon, view 360° art highlights, and collect travel stamps.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  const navigate = useNavigate();
  const { data: destinations, isPending, isError, error } = useDestinations();
  const progress = useSulyapProgress();

  const ds = destinations ?? [];
  const has = (d: (typeof ds)[number]) => isDestinationToured(d, progress);
  const toured = ds.filter(has).length;
  const featured = ds.filter((d) => d.featured).slice(0, 4);
  const samplePlace = ds[0] ?? {
    name: "Aguinaldo Shrine",
    province: "Cavite",
    category: "Historical Shrines",
  };

  return (
    <div className="flex min-h-screen flex-col" style={{ backgroundColor: C.paper }}>
      <SiteHeader />

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:py-8">
        {/* Engaging Visual Hero */}
        <div
          className="passport-leather-cover relative overflow-hidden rounded-3xl border p-6 shadow-xl sm:p-10"
          style={{ borderColor: "rgba(212, 175, 55, 0.45)" }}
        >
          <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-12">
            <div className="lg:col-span-7">
              <span
                className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[12px] font-bold uppercase tracking-wider"
                style={{
                  backgroundColor: "rgba(212, 175, 55, 0.2)",
                  color: C.foil,
                  border: "1px solid rgba(212, 175, 55, 0.4)",
                }}
              >
                <Compass className="size-3.5" /> Region IV-A Interactive Travel Guide
              </span>

              <h1
                className="mt-4 text-[34px] font-bold leading-[1.1] text-white sm:text-[46px]"
                style={{ fontFamily: F.display }}
              >
                Explore CALABARZON. Collect every travel stamp.
              </h1>

              <p
                className="mt-3 max-w-xl text-[15px] leading-relaxed text-white/85 sm:text-[16px]"
                style={{ fontFamily: F.body }}
              >
                Discover 19 historical shrines, churches, museums, and natural wonders across
                Cavite, Laguna, Batangas, Rizal, and Quezon.
              </p>

              {/* Clear Icon CTAs */}
              <div className="mt-6 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => navigate({ to: "/destinations", search: { view: "list" } })}
                  className="inline-flex cursor-pointer items-center gap-2 rounded-xl px-5 py-3 text-[15px] font-bold shadow-md transition-transform hover:-translate-y-0.5"
                  style={{
                    fontFamily: F.body,
                    backgroundColor: C.foil,
                    color: C.ink,
                  }}
                >
                  <MapPin className="size-4" /> Browse All 19 Places
                </button>

                <button
                  type="button"
                  onClick={() => navigate({ to: "/destinations", search: { view: "passport" } })}
                  className="inline-flex cursor-pointer items-center gap-2 rounded-xl border px-5 py-3 text-[15px] font-semibold text-white transition-colors hover:bg-white/10"
                  style={{
                    fontFamily: F.body,
                    borderColor: "rgba(255,255,255,0.35)",
                  }}
                >
                  <BookOpenCheck className="size-4" /> My Stamp Book ({toured}/{ds.length})
                </button>

                <button
                  type="button"
                  onClick={() => navigate({ to: "/destinations", search: { view: "map" } })}
                  className="inline-flex cursor-pointer items-center gap-2 rounded-xl border px-4 py-3 text-[14px] font-semibold text-white/90 transition-colors hover:bg-white/10"
                  style={{
                    fontFamily: F.body,
                    borderColor: "rgba(255,255,255,0.25)",
                  }}
                >
                  <Map className="size-4" /> Map View
                </button>
              </div>
            </div>

            {/* Right Interactive Stamp Showcase Card */}
            <div className="lg:col-span-5">
              <div
                onClick={() => navigate({ to: "/destinations", search: { view: "passport" } })}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    navigate({ to: "/destinations", search: { view: "passport" } });
                  }
                }}
                className="passport-page-surface flex cursor-pointer items-center justify-between gap-4 rounded-2xl border-2 p-5 shadow-lg transition-transform hover:scale-[1.02]"
                style={{ borderColor: C.foil }}
              >
                <div>
                  <span
                    className="text-[11px] font-bold uppercase tracking-wider"
                    style={{ fontFamily: F.mono, color: C.cover }}
                  >
                    YOUR PASSPORT BOOK
                  </span>
                  <div
                    className="mt-1 text-[34px] font-bold leading-none"
                    style={{ fontFamily: F.display, color: C.ink }}
                  >
                    {toured} of {ds.length}
                  </div>
                  <p className="mt-1 text-[13px]" style={{ fontFamily: F.body, color: C.mute }}>
                    Stamps collected so far
                  </p>
                  <span
                    className="mt-3 inline-block rounded-lg px-3 py-1.5 text-[12px] font-bold text-white"
                    style={{ backgroundColor: C.cover }}
                  >
                    View Stamp Book →
                  </span>
                </div>

                <div className="shrink-0">
                  <Stamp destination={samplePlace} label="✓" size={112} tilt={-6} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 3 Simple Steps: How It Works */}
        <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
          {[
            {
              icon: MapPin,
              step: "Step 1",
              title: "Pick a Place",
              desc: "Choose any landmark by province or category.",
              color: C.red,
            },
            {
              icon: Eye,
              step: "Step 2",
              title: "Explore in 360°",
              desc: "Read quick highlights and pan around 360° artworks.",
              color: C.blue,
            },
            {
              icon: Award,
              step: "Step 3",
              title: "Get Your Stamp",
              desc: "Stamp your passport and test yourself with a 4-item quiz.",
              color: C.green,
            },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.step}
                className="flex items-start gap-3.5 rounded-2xl border bg-white p-4 shadow-2xs"
                style={{ borderColor: "#E6DFCE" }}
              >
                <div
                  className="flex size-10 shrink-0 items-center justify-center rounded-xl text-white"
                  style={{ backgroundColor: item.color }}
                >
                  <Icon className="size-5" />
                </div>
                <div>
                  <span
                    className="text-[11px] font-bold uppercase tracking-wider"
                    style={{ color: item.color }}
                  >
                    {item.step}
                  </span>
                  <h2
                    className="text-[18px] font-bold leading-snug"
                    style={{ fontFamily: F.display, color: C.ink }}
                  >
                    {item.title}
                  </h2>
                  <p className="mt-0.5 text-[13px]" style={{ fontFamily: F.body, color: C.mute }}>
                    {item.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* 5 Visual Province Cards */}
        <Sec fil="Explore by Province" en="Tap a province to see its landmarks" />
        <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-3 lg:grid-cols-5">
          {PROVINCES.map((p, idx) => {
            const provSites = ds.filter((d) => d.province === p);
            const stampedInProv = provSites.filter(has).length;
            const tone = PROVINCE_TONES[p] ?? C.blue;
            return (
              <Pop
                key={p}
                onClick={() =>
                  navigate({
                    to: "/destinations",
                    search: { province: p, view: "list" },
                  })
                }
                className="group overflow-hidden"
              >
                <div className="relative h-24 w-full overflow-hidden">
                  <Banig color={tone} seed={idx + 3} />
                  <span className="absolute right-2.5 bottom-2 rounded-full bg-black/65 px-2.5 py-0.5 text-[11px] font-bold text-white">
                    {provSites.length} places
                  </span>
                </div>
                <div className="p-3.5">
                  <div className="flex items-baseline justify-between">
                    <h3
                      className="text-[20px] font-bold leading-tight"
                      style={{ fontFamily: F.display, color: C.ink }}
                    >
                      {p}
                    </h3>
                    <span
                      className="text-[12px] font-bold"
                      style={{ fontFamily: F.body, color: C.green }}
                    >
                      {stampedInProv}/{provSites.length} ★
                    </span>
                  </div>
                </div>
              </Pop>
            );
          })}
        </div>

        {/* Featured Places */}
        <Sec
          fil="Featured Landmarks"
          en="Top heritage sites to start your trip"
          right={
            <button
              type="button"
              onClick={() => navigate({ to: "/destinations", search: { view: "list" } })}
              className="cursor-pointer rounded-full bg-white px-4 py-1.5 text-[13px] font-semibold shadow-2xs hover:bg-[#F6F1E3]"
              style={{ fontFamily: F.body, color: C.cover, border: "1px solid #DED5C0" }}
            >
              See all {ds.length} places →
            </button>
          }
        />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {isPending
            ? Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="h-64 animate-pulse rounded-2xl"
                  style={{ backgroundColor: C.sand }}
                />
              ))
            : featured.map((destination) => (
                <DestinationCard key={destination.id} destination={destination} />
              ))}
        </div>
      </main>

      <footer className="mx-auto max-w-6xl px-4 py-8 text-center">
        <Label>Sulyap · CALABARZON Interactive Travel Passport</Label>
        {isError ? (
          <p className="mt-1 text-[12px]" style={{ color: C.red }}>
            {error.message}
          </p>
        ) : null}
      </footer>

      <MobileBottomNav />
    </div>
  );
}
