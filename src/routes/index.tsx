import { createFileRoute, useNavigate } from "@tanstack/react-router";

import { SiteHeader, MobileBottomNav } from "@/components/site-nav";
import { DestinationCard } from "@/components/destination-card";
import { Btn, Label, Mark, Pop, Sec } from "@/components/sulyap-ui";
import { useDestinations } from "@/hooks/use-destinations";
import { PROVINCES } from "@/lib/destinations";
import { isDestinationToured, useSulyapProgress } from "@/lib/sulyap-data";
import { C, F } from "@/lib/sulyap-theme";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Sulyap — CALABARZON Heritage Passport" },
      {
        name: "description",
        content:
          "Explore 19 heritage sites across Cavite, Laguna, Batangas, Rizal, and Quezon, and collect passport stamps as you go.",
      },
      { property: "og:title", content: "Sulyap — CALABARZON Heritage Passport" },
      {
        property: "og:description",
        content: "Virtual tours and cultural passport for Region IV-A.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
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
  const pct = ds.length ? Math.round((100 * toured) / ds.length) : 0;

  return (
    <div className="flex min-h-screen flex-col" style={{ backgroundColor: C.paper }}>
      <SiteHeader />

      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8 sm:py-10">
        {/* Clean Minimal Passport Hero */}
        <div
          className="passport-leather-cover overflow-hidden rounded-2xl border p-6 shadow-md sm:p-9"
          style={{ borderColor: "rgba(212, 175, 55, 0.45)" }}
        >
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
            <div className="max-w-xl">
              <div className="flex items-center gap-2.5">
                <Mark size={28} />
                <span
                  className="text-[12px] font-semibold uppercase tracking-[0.14em]"
                  style={{ fontFamily: F.mono, color: C.foil }}
                >
                  CALABARZON Heritage Passport
                </span>
              </div>

              <h1
                className="mt-3 text-[32px] font-bold leading-tight sm:text-[42px]"
                style={{ fontFamily: F.display, color: "#FCF9F0" }}
              >
                Explore the region. Stamp your passport.
              </h1>

              <p
                className="mt-2 text-[15px] leading-relaxed"
                style={{ fontFamily: F.body, color: "#E6DEC8" }}
              >
                Take a short 3-stop tour of each historical shrine, church, museum, and natural
                landmark across Region IV-A to collect its rubber stamp.
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <Btn
                  label="Explore Places"
                  color={C.foil}
                  onClick={() => navigate({ to: "/destinations", search: { view: "list" } })}
                />
                <Btn
                  label={`My Passport (${toured}/${ds.length})`}
                  color={C.card}
                  onClick={() => navigate({ to: "/destinations", search: { view: "passport" } })}
                />
              </div>
            </div>

            {/* Simple Stamp Progress Card */}
            <button
              type="button"
              onClick={() => navigate({ to: "/destinations", search: { view: "passport" } })}
              className="flex shrink-0 cursor-pointer flex-col justify-between rounded-xl border p-5 text-left transition-transform hover:scale-[1.02] md:w-64"
              style={{
                backgroundColor: "rgba(252, 249, 240, 0.96)",
                borderColor: C.foil,
              }}
            >
              <Label>PASSPORT PROGRESS</Label>
              <div
                className="my-2 text-[36px] font-bold leading-none"
                style={{ fontFamily: F.display, color: C.cover }}
              >
                {toured}{" "}
                <span className="text-[20px] font-normal" style={{ color: C.mute }}>
                  / {ds.length} stamps
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-[#E5DEC9]">
                <div
                  className="h-full transition-all duration-300"
                  style={{ width: `${pct}%`, backgroundColor: C.cover }}
                />
              </div>
              <span
                className="mt-3 text-[12px] font-semibold"
                style={{ fontFamily: F.body, color: C.cover }}
              >
                Open stamp booklet →
              </span>
            </button>
          </div>
        </div>

        {/* Provinces */}
        <Sec fil="Provinces" en="Choose a province to explore" />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
          {PROVINCES.map((p) => {
            const provSites = ds.filter((d) => d.province === p);
            const stampedInProv = provSites.filter(has).length;
            return (
              <Pop
                key={p}
                onClick={() =>
                  navigate({
                    to: "/destinations",
                    search: { province: p, view: "list" },
                  })
                }
                className="p-4"
              >
                <h3
                  className="text-[20px] font-bold leading-tight"
                  style={{ fontFamily: F.display, color: C.ink }}
                >
                  {p}
                </h3>
                <p className="mt-1 text-[12px]" style={{ fontFamily: F.body, color: C.mute }}>
                  {stampedInProv} of {provSites.length} stamped
                </p>
              </Pop>
            );
          })}
        </div>

        {/* Featured Places */}
        <Sec
          fil="Featured Places"
          en="Start your journey with these landmarks"
          right={
            <button
              type="button"
              onClick={() => navigate({ to: "/destinations", search: { view: "list" } })}
              className="cursor-pointer text-[13px] font-semibold hover:underline"
              style={{ fontFamily: F.body, color: C.cover }}
            >
              View all {ds.length} →
            </button>
          }
        />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {isPending
            ? Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="h-64 animate-pulse rounded-xl"
                  style={{ backgroundColor: C.sand }}
                />
              ))
            : featured.map((destination) => (
                <DestinationCard key={destination.id} destination={destination} />
              ))}
        </div>
      </main>

      <footer className="mx-auto max-w-5xl px-4 py-6 text-center">
        <Label>Sulyap · CALABARZON Heritage Passport</Label>
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
