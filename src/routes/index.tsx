import { createFileRoute, useNavigate } from "@tanstack/react-router";

import { SiteHeader, MobileBottomNav } from "@/components/site-nav";
import { DestinationCard } from "@/components/destination-card";
import { Banig, Btn, Cover, Label, Mark, Pop, Sec } from "@/components/sulyap-ui";
import { useDestinations } from "@/hooks/use-destinations";
import { CATEGORIES, PROVINCES } from "@/lib/destinations";
import { isDestinationToured, useSulyapProgress } from "@/lib/sulyap-data";
import { C, F, PROVINCE_TONES, getCategoryMeta } from "@/lib/sulyap-theme";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Sulyap — Virtual Tours of CALABARZON" },
      {
        name: "description",
        content:
          "Walk through the heritage sites of CALABARZON, take the quiz, and collect a stamp for every place you finish.",
      },
      { property: "og:title", content: "Sulyap — Virtual Tours of CALABARZON" },
      {
        property: "og:description",
        content:
          "A virtual tour and cultural mapping app for Region IV-A heritage sites across Cavite, Laguna, Batangas, Rizal, and Quezon.",
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

  // M1.7: Progress diamonds beyond 12 places show "12+" gracefully
  const visibleDiamonds = ds.slice(0, 12);
  const extraCount = ds.length > 12 ? ds.length - 12 : 0;

  return (
    <div className="flex min-h-screen flex-col" style={{ backgroundColor: C.paper }}>
      <SiteHeader />

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:py-8">
        {/* Brand Title Row */}
        <div className="mb-5 flex items-center justify-between gap-4">
          <div className="flex items-center">
            <Mark size={48} />
            <div className="ml-3.5">
              <h1
                className="text-[34px] leading-[38px] sm:text-[40px] sm:leading-[44px]"
                style={{ fontFamily: F.display, color: C.ink }}
              >
                Sulyap
              </h1>
              <Label>Virtual tours of CALABARZON</Label>
            </div>
          </div>

          <div className="hidden sm:flex sm:gap-2.5">
            <Btn
              label="Open Destinasyon"
              sub="Browse all places"
              color={C.gold}
              onClick={() => navigate({ to: "/destinations", search: { view: "list" } })}
            />
            <Btn
              label="Cultural map"
              sub="Mapa ng Rehiyon"
              color={C.card}
              onClick={() => navigate({ to: "/destinations", search: { view: "map" } })}
            />
          </div>
        </div>

        {/* Hero Pop Card — Tapping navigates to Pasaporte */}
        <Pop
          bg={C.blue}
          depth={5}
          radius={12}
          ariaLabel="Ang field trip, nasa palad mo. Open your Pasaporte."
          onClick={() => navigate({ to: "/destinations", search: { view: "passport" } })}
        >
          <div className="h-12 overflow-hidden">
            <Banig color={C.blue} seed={7} />
          </div>
          <div className="p-5 sm:p-7">
            <h2
              className="text-[28px] leading-[34px] sm:text-[36px] sm:leading-[42px]"
              style={{ fontFamily: F.display, color: "#FFFFFF" }}
            >
              Ang field trip, nasa palad mo.
            </h2>
            <p
              className="mt-2 max-w-2xl text-[15px] leading-[22px] sm:text-[16px] sm:leading-[24px]"
              style={{ fontFamily: F.body, color: "#E3EAFB" }}
            >
              Walk through the heritage sites of CALABARZON, take the quiz, and collect a stamp for
              every place you finish.
            </p>

            {/* Diamond Stamp Progress Row (M1.7 handles >12 gracefully) */}
            <div className="mt-5 flex flex-wrap items-center">
              {visibleDiamonds.map((d) => (
                <span
                  key={d.id}
                  title={`${d.name}: ${has(d) ? "Stamped" : "Not stamped yet"}`}
                  className="mr-3 mb-2 inline-block size-3.5"
                  style={{
                    transform: "rotate(45deg)",
                    borderWidth: 2,
                    borderStyle: "solid",
                    borderColor: "#FFFFFF",
                    backgroundColor: has(d) ? C.gold : "transparent",
                  }}
                />
              ))}
              {extraCount > 0 ? (
                <span
                  className="mb-2 inline-flex items-center rounded-full px-2.5 py-0.5 text-[12px] font-bold"
                  style={{
                    fontFamily: F.bold,
                    backgroundColor: C.gold,
                    color: C.ink,
                    borderWidth: 2,
                    borderStyle: "solid",
                    borderColor: C.ink,
                  }}
                >
                  12+ ({ds.length} total)
                </span>
              ) : null}
            </div>

            <div
              className="mt-1 text-[15px] font-bold"
              style={{ fontFamily: F.bold, color: C.gold }}
            >
              {toured} of {ds.length} stamps in your Pasaporte
            </div>
          </div>
        </Pop>

        {/* Provinces: Mga Lalawigan */}
        <Sec fil="Mga Lalawigan" en="Pick a province to explore" />
        <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-3 lg:grid-cols-5">
          {PROVINCES.map((p, i) => {
            const n = ds.filter((d) => d.province === p).length;
            const tone = PROVINCE_TONES[p] ?? C.blue;
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
              >
                <div className="h-14 overflow-hidden">
                  <Banig color={tone} seed={i + 2} />
                </div>
                <div
                  className="p-3.5"
                  style={{
                    borderTopWidth: 2,
                    borderTopStyle: "solid",
                    borderTopColor: C.ink,
                  }}
                >
                  <h3
                    className="text-[19px] leading-tight"
                    style={{ fontFamily: F.display, color: C.ink }}
                  >
                    {p}
                  </h3>
                  <Label className="mt-0.5">
                    {n} {n === 1 ? "place" : "places"}
                  </Label>
                </div>
              </Pop>
            );
          })}
        </div>

        {/* Next Stop: Susunod na hintuan */}
        {next ? (
          <>
            <Sec fil="Susunod na hintuan" en="A place you have not stamped yet" />
            <Pop
              depth={5}
              radius={12}
              ariaLabel={`Next stop: ${next.name} in ${next.province}`}
              onClick={() =>
                navigate({
                  to: "/destinations/$slug",
                  params: { slug: next.slug },
                })
              }
            >
              <Cover destination={next} className="h-48 sm:h-60" />
              <div
                className="p-4 sm:p-5"
                style={{
                  borderTopWidth: 2,
                  borderTopStyle: "solid",
                  borderTopColor: C.ink,
                }}
              >
                <span
                  className="text-[13px] font-bold"
                  style={{
                    fontFamily: F.bold,
                    color: getCategoryMeta(next.category).deep,
                  }}
                >
                  {getCategoryMeta(next.category).fil}, {next.province}
                </span>
                <h3
                  className="mt-1 text-[24px] leading-[29px] sm:text-[28px] sm:leading-[34px]"
                  style={{ fontFamily: F.display, color: C.ink }}
                >
                  {next.name}
                </h3>
                <p
                  className="mt-1.5 line-clamp-2 text-[15px] leading-[22px]"
                  style={{ fontFamily: F.body, color: C.mute }}
                >
                  {next.description}
                </p>
              </div>
            </Pop>
          </>
        ) : null}

        {/* Four Categories: Mga Kategorya */}
        <Sec fil="Mga Kategorya" en="Four doors into the region's story" />
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
                className="flex h-full flex-col"
              >
                <div className="h-12 overflow-hidden">
                  <Banig color={meta.color} seed={idx + 11} />
                </div>
                <div
                  className="flex flex-1 flex-col p-4"
                  style={{
                    borderTopWidth: 2,
                    borderTopStyle: "solid",
                    borderTopColor: C.ink,
                  }}
                >
                  <span
                    className="text-[13px] font-bold"
                    style={{ fontFamily: F.bold, color: meta.deep }}
                  >
                    {category}
                  </span>
                  <h3
                    className="mt-0.5 text-[22px] leading-tight"
                    style={{ fontFamily: F.display, color: C.ink }}
                  >
                    {meta.fil}
                  </h3>
                  <p
                    className="mt-1.5 flex-1 text-[13px] leading-[19px]"
                    style={{ fontFamily: F.body, color: C.mute }}
                  >
                    {meta.blurb}
                  </p>
                  <span
                    className="mt-3 text-[13px] font-bold"
                    style={{ fontFamily: F.bold, color: meta.deep }}
                  >
                    {count} {count === 1 ? "place" : "places"}
                  </span>
                </div>
              </Pop>
            );
          })}
        </div>

        {/* Featured Destinations */}
        <Sec
          fil="Mga Tampok na Pook"
          en="Curated highlights across CALABARZON"
          right={
            <button
              type="button"
              onClick={() => navigate({ to: "/destinations", search: { view: "list" } })}
              className="cursor-pointer text-[14px] font-bold hover:underline"
              style={{ fontFamily: F.bold, color: C.blue }}
            >
              See all places
            </button>
          }
        />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {isPending
            ? Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="h-64 animate-pulse rounded-[10px]"
                  style={{
                    backgroundColor: C.sand,
                    borderWidth: 2,
                    borderStyle: "solid",
                    borderColor: C.ink,
                  }}
                />
              ))
            : featured.map((destination) => (
                <DestinationCard key={destination.id} destination={destination} />
              ))}
        </div>
      </main>

      <footer className="mx-auto max-w-6xl px-4 pt-6 pb-8 text-center">
        <Label>Sulyap · CALABARZON Virtual Tour and Cultural Mapping App (Region IV-A)</Label>
        {isError ? (
          <p className="mt-1 text-[13px] font-bold" style={{ fontFamily: F.bold, color: C.red }}>
            Data notice: {error.message}
          </p>
        ) : null}
      </footer>

      <MobileBottomNav />
    </div>
  );
}
