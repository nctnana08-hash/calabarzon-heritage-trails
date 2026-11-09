import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Award, BookOpenCheck, Compass, Eye, Map, MapPin, ShieldCheck } from "lucide-react";

import { SiteHeader, MobileBottomNav } from "@/components/site-nav";
import { DestinationCard } from "@/components/destination-card";
import { KrpanoViewer } from "@/components/krpano-viewer";
import { Banig, Label, Pop, Sec, Stamp } from "@/components/sulyap-ui";
import { useDestinations } from "@/hooks/use-destinations";
import { PROVINCES } from "@/lib/destinations";
import { isDestinationToured, useSulyapProgress } from "@/lib/sulyap-data";
import { C, F, PROVINCE_TONES } from "@/lib/sulyap-theme";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "SulyapPH — CALABARZON Heritage Portal & e-Passport" },
      {
        name: "description",
        content:
          "Explore 19 heritage sites across Cavite, Laguna, Batangas, Rizal, and Quezon, view 360° art highlights, and collect digital travel stamps.",
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
  const pct = ds.length > 0 ? Math.round((toured / ds.length) * 100) : 0;
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
        {/* eGovPH-Style Royal Blue Hero Banner */}
        <div
          className="passport-leather-cover relative overflow-hidden rounded-3xl border shadow-xl"
          style={{ borderColor: "rgba(255, 255, 255, 0.18)" }}
        >
          <div className="p-6 sm:p-10">
            <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-12">
              <div className="lg:col-span-7">
                <span
                  className="inline-flex items-center gap-1.5 rounded-full px-3.5 py-1 text-[11px] font-extrabold uppercase tracking-wider"
                  style={{
                    backgroundColor: "rgba(252, 209, 22, 0.18)",
                    color: C.foil,
                    border: "1px solid rgba(252, 209, 22, 0.45)",
                  }}
                >
                  <Compass className="size-3.5" /> Region IV-A · Official Heritage Guide
                </span>

                <h1
                  className="mt-4 text-[32px] font-extrabold tracking-tight leading-[1.12] text-white sm:text-[44px]"
                  style={{ fontFamily: F.display }}
                >
                  Explore CALABARZON.{" "}
                  <span style={{ color: C.foil }}>Collect every digital stamp.</span>
                </h1>

                <p
                  className="mt-3 max-w-xl text-[15px] leading-relaxed text-white/90 sm:text-[16px]"
                  style={{ fontFamily: F.body }}
                >
                  Discover 19 historical shrines, churches, museums, and natural wonders across
                  Cavite, Laguna, Batangas, Rizal, and Quezon in one clean portal.
                </p>

                {/* Primary eGovPH Action Buttons */}
                <div className="mt-6 flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => navigate({ to: "/destinations", search: { view: "list" } })}
                    className="inline-flex cursor-pointer items-center gap-2 rounded-xl px-5 py-3 text-[14px] font-extrabold shadow-md transition-transform hover:-translate-y-0.5"
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
                    className="inline-flex cursor-pointer items-center gap-2 rounded-xl border bg-white/10 px-5 py-3 text-[14px] font-bold text-white backdrop-blur-xs transition-colors hover:bg-white/20"
                    style={{
                      fontFamily: F.body,
                      borderColor: "rgba(255,255,255,0.3)",
                    }}
                  >
                    <BookOpenCheck className="size-4" /> My e-Passport ({toured}/{ds.length})
                  </button>

                  <button
                    type="button"
                    onClick={() => navigate({ to: "/destinations", search: { view: "map" } })}
                    className="inline-flex cursor-pointer items-center gap-2 rounded-xl border px-4 py-3 text-[14px] font-bold text-white/95 transition-colors hover:bg-white/15"
                    style={{
                      fontFamily: F.body,
                      borderColor: "rgba(255,255,255,0.25)",
                    }}
                  >
                    <Map className="size-4" /> Interactive Map
                  </button>
                </div>
              </div>

              {/* Right Digital e-Passport ID Card (eGovPH Digital ID style) */}
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
                  className="passport-page-surface overflow-hidden rounded-2xl border border-white/80 shadow-2xl transition-transform hover:scale-[1.015]"
                >
                  <div className="egov-tricolor-bar h-1.5 w-full" />
                  <div className="flex items-center justify-between gap-4 p-5">
                    <div className="min-w-0 flex-1">
                      <div className="inline-flex items-center gap-1.5 rounded-full bg-[#ECFDF5] px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-[#059669]">
                        <ShieldCheck className="size-3.5" /> Digital Travel Pass
                      </div>
                      <div
                        className="mt-2 text-[32px] font-extrabold leading-none"
                        style={{ fontFamily: F.display, color: C.ink }}
                      >
                        {toured} <span className="text-[18px] text-[#64748B]">/ {ds.length}</span>
                      </div>
                      <p
                        className="mt-1 text-[12px] font-medium"
                        style={{ fontFamily: F.body, color: C.mute }}
                      >
                        Official stamps collected ({pct}%)
                      </p>

                      {/* Progress Bar */}
                      <div className="mt-2.5 h-2 w-full overflow-hidden rounded-full bg-[#E2E8F0]">
                        <div
                          className="h-full rounded-full transition-all duration-300"
                          style={{
                            width: `${Math.max(8, pct)}%`,
                            backgroundColor: C.cover,
                          }}
                        />
                      </div>

                      <span
                        className="mt-3.5 inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-[12px] font-bold text-white"
                        style={{ backgroundColor: C.cover }}
                      >
                        Open e-Passport →
                      </span>
                    </div>

                    <div className="shrink-0">
                      <Stamp destination={samplePlace} label="✓" size={108} tilt={-5} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Philippine Flag Tri-Color Accent Strip */}
          <div className="egov-tricolor-bar h-1.5 w-full" />
        </div>

        {/* 3 Quick Service Steps (eGovPH Service Cards style) */}
        <div className="mt-6 grid grid-cols-1 gap-3.5 sm:grid-cols-3">
          {[
            {
              icon: MapPin,
              step: "01 · CHOOSE",
              title: "Pick a Landmark",
              desc: "Filter by province or category across Region IV-A.",
              color: C.cover,
              tint: "#EFF6FF",
            },
            {
              icon: Eye,
              step: "02 · EXPLORE",
              title: "View in 360°",
              desc: "Inspect 4 curated artworks and relics in 360° view.",
              color: C.red,
              tint: "#FEF2F2",
            },
            {
              icon: Award,
              step: "03 · COLLECT",
              title: "Claim Your Stamp",
              desc: "Stamp your e-Passport and take the 4-item quick quiz.",
              color: C.green,
              tint: "#ECFDF5",
            },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.step}
                className="flex items-start gap-3.5 rounded-2xl border border-[#E2E8F0] bg-white p-4 shadow-2xs"
              >
                <div
                  className="flex size-11 shrink-0 items-center justify-center rounded-xl"
                  style={{ backgroundColor: item.tint, color: item.color }}
                >
                  <Icon className="size-5" />
                </div>
                <div>
                  <span
                    className="text-[10px] font-extrabold uppercase tracking-wider"
                    style={{ color: item.color }}
                  >
                    {item.step}
                  </span>
                  <h2
                    className="text-[16px] font-extrabold leading-snug"
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

        {/* Live Multi-Room 360° Museum Virtual Tour Showcase */}
        <Sec
          fil="360° Virtual Museum Walkthrough (2 Rooms)"
          en="Drag 360°×180°, switch between the Grand Rotunda & Fine Arts Hall, or click the green 🚪 portal door"
        />
        <KrpanoViewer autoRotateDefault={true} heightClass="h-[360px] sm:h-[460px]" />

        {/* 5 Visual Province Cards */}
        <Sec fil="Explore by Province" en="Select any CALABARZON province to view its landmarks" />
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
                  <span className="absolute right-2.5 bottom-2 rounded-full bg-slate-900/75 px-2.5 py-0.5 text-[11px] font-bold text-white backdrop-blur-xs">
                    {provSites.length} places
                  </span>
                </div>
                <div className="p-3.5">
                  <div className="flex items-baseline justify-between">
                    <h3
                      className="text-[17px] font-extrabold leading-tight group-hover:text-[#0038A8]"
                      style={{ fontFamily: F.display, color: C.ink }}
                    >
                      {p}
                    </h3>
                    <span
                      className="rounded-full bg-[#ECFDF5] px-2 py-0.5 text-[11px] font-bold"
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
          en="Priority cultural sites across Region IV-A"
          right={
            <button
              type="button"
              onClick={() => navigate({ to: "/destinations", search: { view: "list" } })}
              className="cursor-pointer rounded-full border border-[#CBD5E1] bg-white px-4 py-1.5 text-[13px] font-bold shadow-2xs transition-colors hover:border-[#0038A8] hover:bg-[#EFF6FF]"
              style={{ fontFamily: F.body, color: C.cover }}
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
        <Label>SulyapPH · CALABARZON Digital Heritage Portal &amp; e-Passport</Label>
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
