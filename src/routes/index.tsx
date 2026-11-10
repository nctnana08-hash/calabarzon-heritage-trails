import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  Award,
  BookOpenCheck,
  Compass,
  Eye,
  Map,
  MapPin,
  ShieldCheck,
  Smartphone,
  Sparkles,
} from "lucide-react";
import { useState } from "react";

import { SiteHeader, MobileBottomNav } from "@/components/site-nav";
import { DestinationCard } from "@/components/destination-card";
import { KrpanoViewer } from "@/components/krpano-viewer";
import { AndroidDownloadModal } from "@/components/android-download-modal";
import { AuthModal } from "@/components/auth-modal";
import { Banig, Label, Pop, Sec, Stamp } from "@/components/sulyap-ui";
import { useDestinations } from "@/hooks/use-destinations";
import { useAppBranding } from "@/hooks/use-app-branding";
import { useAuth } from "@/hooks/use-auth";
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
          "Explore 19 heritage sites across Cavite, Laguna, Batangas, Rizal, and Quezon in 360°, view curated artworks, and collect digital travel stamps.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  const navigate = useNavigate();
  const { data: destinations, isPending, isError, error } = useDestinations();
  const { branding } = useAppBranding();
  const { user, isAuthenticated } = useAuth();
  const progress = useSulyapProgress();

  const [appModalOpen, setAppModalOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);

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
    <div className="flex min-h-screen flex-col bg-[#F4F7FB] dark:bg-[#090D16] text-[#0F172A] dark:text-[#F8FAFC] transition-colors">
      <SiteHeader />

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:py-8">
        {/* eGovPH-Style Civic Hero Banner */}
        <div
          className="passport-leather-cover relative overflow-hidden rounded-3xl border shadow-xl"
          style={{ borderColor: "rgba(255, 255, 255, 0.18)" }}
        >
          <div className="p-6 sm:p-10">
            <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-12">
              <div className="lg:col-span-7">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className="inline-flex items-center gap-1.5 rounded-full px-3.5 py-1 text-[11px] font-extrabold uppercase tracking-wider text-white"
                    style={{
                      backgroundColor: "rgba(252, 209, 22, 0.2)",
                      color: C.foil,
                      border: "1px solid rgba(252, 209, 22, 0.45)",
                    }}
                  >
                    <Compass className="size-3.5" /> Republika ng Pilipinas · Region IV-A
                  </span>
                  {isAuthenticated && user ? (
                    <span className="rounded-full bg-white/20 px-3 py-1 text-[11px] font-bold text-white">
                      Welcome, {user.name.split(" ")[0]}!
                    </span>
                  ) : null}
                </div>

                <h1
                  className="mt-4 text-[32px] font-extrabold tracking-tight leading-[1.12] text-white sm:text-[44px]"
                  style={{ fontFamily: F.display }}
                >
                  {branding.appName}: Explore CALABARZON.{" "}
                  <span style={{ color: C.foil }}>Collect every digital stamp.</span>
                </h1>

                <p
                  className="mt-3 max-w-xl text-[15px] leading-relaxed text-white/90 sm:text-[16px]"
                  style={{ fontFamily: F.body }}
                >
                  Discover 19 historical shrines, colonial churches, living art museums, and natural
                  wonders across Cavite, Laguna, Batangas, Rizal, and Quezon.
                </p>

                {/* Primary Action Buttons */}
                <div className="mt-6 flex flex-wrap gap-2.5">
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
                    className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-white/30 bg-white/10 px-5 py-3 text-[14px] font-bold text-white backdrop-blur-xs transition-colors hover:bg-white/20"
                    style={{ fontFamily: F.body }}
                  >
                    <BookOpenCheck className="size-4" /> My e-Passport ({toured}/{ds.length})
                  </button>

                  <button
                    type="button"
                    onClick={() => setAppModalOpen(true)}
                    className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-white/30 bg-white/15 px-4 py-3 text-[14px] font-extrabold text-white backdrop-blur-xs transition-colors hover:bg-white/25"
                    style={{ fontFamily: F.body }}
                  >
                    <Smartphone className="size-4" /> Android App
                  </button>
                </div>
              </div>

              {/* Right Digital Passport Card */}
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
                        <ShieldCheck className="size-3.5" /> Verified Heritage Passport
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
                        Open Passport →
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

          <div className="egov-tricolor-bar h-1.5 w-full" />
        </div>

        {/* 3 Clean Quick Service Steps */}
        <div className="mt-6 grid grid-cols-1 gap-3.5 sm:grid-cols-3">
          {[
            {
              icon: MapPin,
              step: "01 · CHOOSE",
              title: "Pick a Landmark",
              desc: "Filter by province or category across Region IV-A.",
              color: "#0038A8",
              tint: "#EFF6FF",
            },
            {
              icon: Eye,
              step: "02 · EXPLORE",
              title: "View in 16K 360°",
              desc: "Inspect curated artworks, relics, and architecture in full 360° view.",
              color: "#CE1126",
              tint: "#FEF2F2",
            },
            {
              icon: Award,
              step: "03 · COLLECT",
              title: "Claim Official Stamp",
              desc: "Complete the 4-item field quiz and stamp your citizen passport.",
              color: "#059669",
              tint: "#ECFDF5",
            },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.step}
                className="flex items-start gap-3.5 rounded-2xl border border-[#E2E8F0] dark:border-[#22314E] bg-white dark:bg-[#131C31] p-4 shadow-2xs"
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
                    className="text-[16px] font-extrabold leading-snug text-[#0F172A] dark:text-[#F8FAFC]"
                    style={{ fontFamily: F.display }}
                  >
                    {item.title}
                  </h2>
                  <p className="mt-0.5 text-[13px] text-[#64748B] dark:text-[#94A3B8]">
                    {item.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Live Multi-Gallery 16K Virtual Tour Preview */}
        <Sec
          fil="360° Living Museum Tour (Smooth 16K UHD · 5 Connected Galleries)"
          en="Explore our sunlit 16,000 × 8,000 Grand Pavilion, restored 12K Bahay na Bato Salon, 2F Mezzanine, Rotunda & Fine Arts Hall"
        />
        <KrpanoViewer autoRotateDefault={false} heightClass="h-[410px] sm:h-[530px]" />

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
                className="group overflow-hidden border border-[#E2E8F0] dark:border-[#22314E] dark:bg-[#131C31]"
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
                      className="text-[17px] font-extrabold leading-tight text-[#0F172A] dark:text-[#F8FAFC] group-hover:text-[#0038A8] dark:group-hover:text-[#93C5FD]"
                      style={{ fontFamily: F.display }}
                    >
                      {p}
                    </h3>
                    <span className="rounded-full bg-[#ECFDF5] dark:bg-[#064E3B] px-2 py-0.5 text-[11px] font-bold text-[#059669] dark:text-[#6EE7B7]">
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
              className="cursor-pointer rounded-full border border-[#CBD5E1] dark:border-[#334155] bg-white dark:bg-[#1E293B] px-4 py-1.5 text-[13px] font-bold text-[#0038A8] dark:text-[#93C5FD] shadow-2xs transition-colors hover:bg-[#EFF6FF] dark:hover:bg-[#1E3A8A]/30"
              style={{ fontFamily: F.body }}
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
                  className="h-64 animate-pulse rounded-2xl bg-[#E2E8F0] dark:bg-[#1E293B]"
                />
              ))
            : featured.map((destination) => (
                <DestinationCard key={destination.id} destination={destination} />
              ))}
        </div>
      </main>

      <footer className="mx-auto max-w-6xl px-4 py-8 text-center border-t border-[#E2E8F0] dark:border-[#22314E] mt-8">
        <Label>
          {branding.appName}
          {branding.appBadge ? ` ${branding.appBadge}` : ""} · {branding.appTagline}
        </Label>
        <p className="mt-1 text-[11px] text-[#64748B] dark:text-[#94A3B8]">
          Republic of the Philippines · Bagong Pilipinas Cultural Heritage Portal
        </p>
      </footer>

      <AndroidDownloadModal open={appModalOpen} onOpenChange={setAppModalOpen} />
      <AuthModal open={authModalOpen} onOpenChange={setAuthModalOpen} />
      <MobileBottomNav />
    </div>
  );
}
