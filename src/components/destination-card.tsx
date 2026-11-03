import { useNavigate } from "@tanstack/react-router";
import type { Destination } from "@/lib/destinations";
import { isDestinationToured, useSulyapProgress } from "@/lib/sulyap-data";
import { C, F, PROVINCE_CODES, getCategoryMeta, seedFromId } from "@/lib/sulyap-theme";
import { Cover, Pop } from "./sulyap-ui";

export function DestinationCard({ destination }: { destination: Destination }) {
  const navigate = useNavigate();
  const progress = useSulyapProgress();
  const toured = isDestinationToured(destination, progress);
  const cat = getCategoryMeta(destination.category);
  const provCode = PROVINCE_CODES[destination.province] ?? "IVA";
  const seed = seedFromId(destination.slug || destination.id);
  const visaSerial = `IV-A-${provCode}-${String(seed).padStart(3, "0")}`;

  return (
    <Pop
      onClick={() =>
        navigate({
          to: "/destinations/$slug",
          params: { slug: destination.slug },
        })
      }
      ariaLabel={`${destination.name}, ${destination.province}, ${cat.fil} (${destination.category})`}
      className="passport-page-surface flex h-full flex-col"
    >
      {/* Framed Passport Photograph */}
      <div className="relative h-44 w-full overflow-hidden border-b border-[#D5CBB4] bg-[#EAE2CE] p-2">
        <div className="relative h-full w-full overflow-hidden rounded-xs border border-[#B8AC93]">
          <Cover destination={destination} className="h-full w-full" />
          <span
            className="absolute bottom-1.5 left-1.5 rounded-xs px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.12em]"
            style={{
              fontFamily: F.mono,
              backgroundColor: "rgba(30, 35, 42, 0.85)",
              color: C.foil,
            }}
          >
            {visaSerial}
          </span>
          {toured ? (
            <span
              className="absolute top-2 right-2 rounded-xs border px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.1em]"
              style={{
                fontFamily: F.mono,
                backgroundColor: "rgba(252, 249, 240, 0.94)",
                borderColor: C.green,
                color: C.green,
              }}
            >
              ★ STAMPED
            </span>
          ) : null}
        </div>
      </div>

      <div className="flex flex-1 flex-col justify-between p-4">
        <div>
          <span
            className="text-[11px] font-bold uppercase tracking-[0.12em]"
            style={{ fontFamily: F.mono, color: cat.deep }}
          >
            {cat.fil} · {destination.province}
          </span>
          <h3
            className="mt-1 text-[21px] font-bold leading-snug"
            style={{ fontFamily: F.display, color: C.ink }}
          >
            {destination.name}
          </h3>
          <p
            className="mt-1.5 line-clamp-2 text-[13px] leading-relaxed"
            style={{ fontFamily: F.body, color: C.mute }}
          >
            {destination.description}
          </p>
        </div>

        <div
          className="mt-3 flex items-center justify-between border-t border-dashed border-[#D5CBB4] pt-2 text-[10px] font-bold uppercase tracking-[0.12em]"
          style={{ fontFamily: F.mono, color: C.cover }}
        >
          <span>{destination.province}</span>
          <span>OPEN DOSSIER →</span>
        </div>
      </div>
    </Pop>
  );
}
