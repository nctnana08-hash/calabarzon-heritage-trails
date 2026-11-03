import { createFileRoute, useNavigate } from "@tanstack/react-router";

import { SiteHeader, MobileBottomNav } from "@/components/site-nav";
import { DestinationCard } from "@/components/destination-card";
import { Banig, Btn, Cover, Label, Mark, Pop, Sec, Stamp } from "@/components/sulyap-ui";
import { useDestinations } from "@/hooks/use-destinations";
import { CATEGORIES, PROVINCES } from "@/lib/destinations";
import { isDestinationToured, useSulyapProgress } from "@/lib/sulyap-data";
import { C, F, PROVINCE_CODES, PROVINCE_TONES, getCategoryMeta } from "@/lib/sulyap-theme";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Sulyap Pasaporte — Heritage Passport & Virtual Tours of CALABARZON" },
      {
        name: "description",
        content:
          "Carry your official CALABARZON Cultural Heritage Passport. Visit 19 historical shrines, churches, museums, and natural wonders across Region IV-A and collect rubber ink entry stamps.",
      },
      {
        property: "og:title",
        content: "Sulyap Pasaporte — Heritage Passport & Virtual Tours of CALABARZON",
      },
      {
        property: "og:description",
        content:
          "A cultural passport and virtual tour dossier for Region IV-A heritage sites across Cavite, Laguna, Batangas, Rizal, and Quezon.",
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
  const next = ds.find((d) => !has(d)) || ds[0];
  const featured = ds.filter((d) => d.featured).slice(0, 4);

  const visibleSlots = ds.slice(0, 12);
  const extraCount = ds.length > 12 ? ds.length - 12 : 0;

  return (
    <div className="flex min-h-screen flex-col" style={{ backgroundColor: C.paper }}>
      <SiteHeader />

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:py-8">
        {/* Official Leather Passport Booklet Hero */}
        <div
          className="overflow-hidden rounded-xl border-2 shadow-xl"
          style={{
            backgroundColor: C.coverDeep,
            borderColor: C.foil,
          }}
        >
          <div className="grid grid-cols-1 lg:grid-cols-12">
            {/* Left Embossed Burgundy Leather Cover */}
            <div
              className="passport-leather-cover flex flex-col justify-between border-b p-6 sm:p-8 lg:col-span-7 lg:border-r lg:border-b-0"
              style={{ borderColor: "rgba(212, 175, 55, 0.35)" }}
            >
              <div>
                <div className="flex items-center gap-3">
                  <Mark size={52} />
                  <div>
                    <div
                      className="text-[11px] font-semibold uppercase tracking-[0.22em]"
                      style={{ fontFamily: F.mono, color: C.foil }}
                    >
                      REPUBLIKA NG PILIPINAS · REHIYON IV-A
                    </div>
                    <div
                      className="mt-0.5 text-[13px] uppercase tracking-[0.14em]"
                      style={{ fontFamily: F.mono, color: "#EAD8B1" }}
                    >
                      CAVITE · LAGUNA · BATANGAS · RIZAL · QUEZON
                    </div>
                  </div>
                </div>

                <h1
                  className="mt-6 text-[34px] font-bold leading-[1.1] tracking-[0.02em] sm:text-[44px]"
                  style={{ fontFamily: F.display, color: "#FCF9F0" }}
                >
                  Pasaporte ng Pamana ng CALABARZON
                </h1>

                <p
                  className="mt-3 max-w-xl text-[15px] leading-relaxed sm:text-[16px]"
                  style={{ fontFamily: F.body, color: "#EAE0C8" }}
                >
                  Step inside 19 historic shrines, centuries-old churches, curated museums, and
                  natural wonders across Region IV-A. Complete each 3-stop field inspection to stamp
                  your official heritage passport.
                </p>
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                <Btn
                  label="Open Stamp Booklet"
                  sub={`${toured} of ${ds.length} Visas Stamped`}
                  color={C.foil}
                  onClick={() => navigate({ to: "/destinations", search: { view: "passport" } })}
                />
                <Btn
                  label="Inspect Visa Directory"
                  sub="Browse All 19 Sites"
                  color={C.card}
                  onClick={() => navigate({ to: "/destinations", search: { view: "list" } })}
                />
                <Btn
                  label="Regional Cartography"
                  sub="Interactive Map"
                  color={C.cover}
                  onClick={() => navigate({ to: "/destinations", search: { view: "map" } })}
                />
              </div>
            </div>

            {/* Right Open Visa Page Preview inside the Hero */}
            <div className="passport-page-surface flex flex-col justify-between p-5 sm:p-7 lg:col-span-5">
              <div>
                <div className="flex items-center justify-between border-b border-dashed border-[#C8BDA4] pb-2">
                  <span
                    className="text-[11px] font-bold uppercase tracking-[0.16em]"
                    style={{ fontFamily: F.mono, color: C.cover }}
                  >
                    OFFICIAL STAMP LEDGER
                  </span>
                  <span
                    className="rounded-xs border px-2 py-0.5 text-[11px] font-bold"
                    style={{
                      fontFamily: F.mono,
                      borderColor: C.cover,
                      color: C.cover,
                      backgroundColor: "rgba(74, 24, 27, 0.06)",
                    }}
                  >
                    {toured}/{ds.length} STAMPED
                  </span>
                </div>

                {/* Mini Visa Stamp Slots */}
                <div className="mt-4 grid grid-cols-4 gap-2">
                  {visibleSlots.map((d, idx) => {
                    const stamped = has(d);
                    const provCode = PROVINCE_CODES[d.province] ?? "IVA";
                    const cat = getCategoryMeta(d.category);
                    return (
                      <button
                        key={d.id}
                        type="button"
                        onClick={() =>
                          navigate({
                            to: "/destinations/$slug",
                            params: { slug: d.slug },
                          })
                        }
                        title={`${d.name} (${d.province}) — ${stamped ? "Stamped" : "Click to visit"}`}
                        className="flex h-14 cursor-pointer flex-col items-center justify-center rounded-xs border p-1 text-center transition-all hover:scale-105"
                        style={{
                          borderColor: stamped ? cat.deep : "#D5CBB4",
                          borderStyle: stamped ? "solid" : "dashed",
                          backgroundColor: stamped
                            ? "rgba(252, 249, 240, 0.95)"
                            : "rgba(246, 241, 227, 0.5)",
                        }}
                      >
                        <span
                          className="text-[9px] font-bold uppercase"
                          style={{
                            fontFamily: F.mono,
                            color: stamped ? cat.deep : C.mute,
                          }}
                        >
                          {provCode}-{String(idx + 1).padStart(2, "0")}
                        </span>
                        <span
                          className="mt-0.5 text-[11px] font-bold leading-none"
                          style={{
                            fontFamily: F.mono,
                            color: stamped ? cat.deep : "#A39882",
                          }}
                        >
                          {stamped ? "★ VISA" : "○"}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {extraCount > 0 ? (
                  <div className="mt-2.5 flex items-center justify-between text-[11px]">
                    <span style={{ fontFamily: F.mono, color: C.mute }}>
                      + {extraCount} MORE VISA PAGES IN BOOKLET
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        navigate({ to: "/destinations", search: { view: "passport" } })
                      }
                      className="cursor-pointer font-bold underline"
                      style={{ fontFamily: F.mono, color: C.cover }}
                    >
                      VIEW ALL {ds.length} →
                    </button>
                  </div>
                ) : null}
              </div>

              <div
                className="mt-5 rounded-xs border border-[#D5CBB4] bg-[#EFE9D8] px-3 py-2 text-[10px] tracking-[0.16em]"
                style={{ fontFamily: F.mono, color: "#4A4338" }}
              >
                P&lt;PHLCALABARZON&lt;&lt;PASAPORTE&lt;NG&lt;PAMANA&lt;&lt;&lt;&lt;&lt;
              </div>
            </div>
          </div>
        </div>

        {/* Next Unstamped Visa Assignment: Susunod na Hintuan */}
        {next ? (
          <>
            <Sec
              fil="Susunod na Tatak sa Pasaporte"
              en="NEXT UNSTAMPED DESTINATION · COMPLETE THE 3-STOP VIRTUAL TOUR TO EARN THIS STAMP"
            />
            <Pop
              ariaLabel={`Next stop: ${next.name} in ${next.province}`}
              onClick={() =>
                navigate({
                  to: "/destinations/$slug",
                  params: { slug: next.slug },
                })
              }
              className="passport-page-surface grid grid-cols-1 overflow-hidden md:grid-cols-12"
            >
              <div className="relative h-56 md:col-span-5 md:h-auto">
                <Cover destination={next} className="h-full w-full" />
                <div
                  className="absolute top-3 left-3 rounded-xs border px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.14em]"
                  style={{
                    fontFamily: F.mono,
                    backgroundColor: "rgba(30, 35, 42, 0.88)",
                    borderColor: C.foil,
                    color: C.foil,
                  }}
                >
                  PRIORITY VISA · {PROVINCE_CODES[next.province] ?? "IVA"}
                </div>
              </div>

              <div className="flex flex-col justify-between p-5 sm:p-6 md:col-span-5">
                <div>
                  <span
                    className="text-[11px] font-bold uppercase tracking-[0.14em]"
                    style={{
                      fontFamily: F.mono,
                      color: getCategoryMeta(next.category).deep,
                    }}
                  >
                    {getCategoryMeta(next.category).fil} · {next.category}
                  </span>
                  <h3
                    className="mt-1 text-[26px] font-bold leading-tight sm:text-[30px]"
                    style={{ fontFamily: F.display, color: C.ink }}
                  >
                    {next.name}
                  </h3>
                  <p
                    className="mt-2 line-clamp-3 text-[14px] leading-relaxed"
                    style={{ fontFamily: F.body, color: C.mute }}
                  >
                    {next.description}
                  </p>
                </div>

                <div
                  className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-dashed border-[#D5CBB4] pt-3 text-[11px]"
                  style={{ fontFamily: F.mono, color: C.cover }}
                >
                  <span>
                    LOC: {next.address}, {next.province}
                  </span>
                  <span className="font-bold">BEGIN 3-STOP INSPECTION →</span>
                </div>
              </div>

              <div className="hidden items-center justify-center border-l border-dashed border-[#D5CBB4] bg-[#F2EBDC]/60 p-4 md:col-span-2 md:flex">
                <div className="opacity-75">
                  <Stamp destination={next} label="✓" size={116} tilt={-6} />
                </div>
              </div>
            </Pop>
          </>
        ) : null}

        {/* Provinces: Mga Lalawigan */}
        <Sec
          fil="Mga Lalawigan ng Rehiyon IV-A"
          en="FIVE PROVINCIAL JURISDICTIONS · SELECT A SECTOR TO INSPECT ITS HERITAGE SITES"
        />
        <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-3 lg:grid-cols-5">
          {PROVINCES.map((p, i) => {
            const provSites = ds.filter((d) => d.province === p);
            const n = provSites.length;
            const stampedInProv = provSites.filter(has).length;
            const tone = PROVINCE_TONES[p] ?? C.blue;
            const code = PROVINCE_CODES[p] ?? "IVA";
            return (
              <Pop
                key={p}
                ariaLabel={`Explore ${p}: ${n} ${n === 1 ? "place" : "places"}`}
                onClick={() =>
                  navigate({
                    to: "/destinations",
                    search: { province: p, view: "list" },
                  })
                }
                className="passport-page-surface flex flex-col justify-between"
              >
                <div className="relative h-16 overflow-hidden">
                  <Banig color={tone} seed={i + 2} />
                  <span
                    className="absolute top-2 right-2 rounded-xs px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.14em]"
                    style={{
                      fontFamily: F.mono,
                      backgroundColor: "rgba(30, 35, 42, 0.82)",
                      color: C.foil,
                    }}
                  >
                    SECTOR {code}
                  </span>
                </div>
                <div className="border-t border-[#D5CBB4] p-3.5">
                  <div className="flex items-baseline justify-between">
                    <h3
                      className="text-[21px] font-bold leading-tight"
                      style={{ fontFamily: F.display, color: C.ink }}
                    >
                      {p}
                    </h3>
                    <span
                      className="text-[11px] font-bold"
                      style={{ fontFamily: F.mono, color: tone }}
                    >
                      {stampedInProv}/{n} ★
                    </span>
                  </div>
                  <Label className="mt-1">
                    {n} {n === 1 ? "VISA SITE" : "VISA SITES"}
                  </Label>
                </div>
              </Pop>
            );
          })}
        </div>

        {/* Four Categories: Mga Kategorya ng Selyo */}
        <Sec
          fil="Mga Uri ng Selyo at Pamana"
          en="FOUR OFFICIAL STAMP CLASSIFICATIONS · EACH CATEGORY CARRIES ITS OWN CUSTOMS SEAL"
        />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {CATEGORIES.map((category, idx) => {
            const meta = getCategoryMeta(category);
            const count = ds.filter((d) => d.category === category).length;
            return (
              <Pop
                key={category}
                ariaLabel={`${meta.fil} (${category}): ${count} places`}
                onClick={() =>
                  navigate({
                    to: "/destinations",
                    search: { category, view: "list" },
                  })
                }
                className="passport-page-surface flex h-full flex-col"
              >
                <div className="relative h-12 overflow-hidden">
                  <Banig color={meta.deep} seed={idx + 11} />
                  <span
                    className="absolute top-2 right-2.5 rounded-xs px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.14em]"
                    style={{
                      fontFamily: F.mono,
                      backgroundColor: "rgba(252, 249, 240, 0.92)",
                      color: meta.deep,
                    }}
                  >
                    SEAL: {meta.code}
                  </span>
                </div>
                <div className="flex flex-1 flex-col border-t border-[#D5CBB4] p-4">
                  <span
                    className="text-[11px] font-bold uppercase tracking-[0.14em]"
                    style={{ fontFamily: F.mono, color: meta.deep }}
                  >
                    {category}
                  </span>
                  <h3
                    className="mt-0.5 text-[24px] font-bold leading-tight"
                    style={{ fontFamily: F.display, color: C.ink }}
                  >
                    {meta.fil}
                  </h3>
                  <p
                    className="mt-1.5 flex-1 text-[13px] leading-relaxed"
                    style={{ fontFamily: F.body, color: C.mute }}
                  >
                    {meta.blurb}
                  </p>
                  <div
                    className="mt-3 flex items-center justify-between border-t border-dashed border-[#D5CBB4] pt-2 text-[11px] font-bold uppercase"
                    style={{ fontFamily: F.mono, color: meta.deep }}
                  >
                    <span>
                      {count} {count === 1 ? "SITE" : "SITES"}
                    </span>
                    <span>INSPECT →</span>
                  </div>
                </div>
              </Pop>
            );
          })}
        </div>

        {/* Featured Destinations */}
        <Sec
          fil="Mga Tampok na Dossier"
          en="PRIORITY HERITAGE SITES ACROSS CALABARZON"
          right={
            <button
              type="button"
              onClick={() => navigate({ to: "/destinations", search: { view: "list" } })}
              className="cursor-pointer text-[12px] font-bold uppercase tracking-[0.12em] hover:underline"
              style={{ fontFamily: F.mono, color: C.cover }}
            >
              Open Full Directory →
            </button>
          }
        />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {isPending
            ? Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="h-64 animate-pulse rounded-lg border"
                  style={{
                    backgroundColor: C.sand,
                    borderColor: "#C8BDA4",
                  }}
                />
              ))
            : featured.map((destination) => (
                <DestinationCard key={destination.id} destination={destination} />
              ))}
        </div>
      </main>

      <footer className="mx-auto max-w-6xl px-4 pt-6 pb-8 text-center">
        <Label>
          REPUBLIKA NG PILIPINAS · SULYAP PASAPORTE NG PAMANA · REGION IV-A (CALABARZON)
        </Label>
        {isError ? (
          <p className="mt-1 text-[13px] font-bold" style={{ fontFamily: F.mono, color: C.red }}>
            Data notice: {error.message}
          </p>
        ) : null}
      </footer>

      <MobileBottomNav />
    </div>
  );
}
