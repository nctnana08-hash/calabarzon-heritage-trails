import { useNavigate } from "@tanstack/react-router";
import type { Destination } from "@/lib/destinations";
import { isDestinationToured, useSulyapProgress } from "@/lib/sulyap-data";
import { C, F, getCategoryMeta } from "@/lib/sulyap-theme";
import { Cover, Pop } from "./sulyap-ui";

export function DestinationCard({ destination }: { destination: Destination }) {
  const navigate = useNavigate();
  const progress = useSulyapProgress();
  const toured = isDestinationToured(destination, progress);
  const cat = getCategoryMeta(destination.category);

  return (
    <Pop
      onClick={() =>
        navigate({
          to: "/destinations/$slug",
          params: { slug: destination.slug },
        })
      }
      ariaLabel={`${destination.name}, ${destination.province}`}
      className="flex h-full flex-col"
    >
      <div className="relative h-44 w-full overflow-hidden">
        <Cover destination={destination} className="h-full w-full" />
        {toured ? (
          <span
            className="absolute top-2.5 right-2.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold shadow-xs"
            style={{
              fontFamily: F.body,
              backgroundColor: C.card,
              color: C.green,
            }}
          >
            ✓ Stamped
          </span>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col justify-between p-4">
        <div>
          <span className="text-[12px] font-medium" style={{ fontFamily: F.body, color: cat.deep }}>
            {destination.province} · {cat.fil}
          </span>
          <h3
            className="mt-1 text-[20px] font-bold leading-snug"
            style={{ fontFamily: F.display, color: C.ink }}
          >
            {destination.name}
          </h3>
        </div>

        <p className="mt-2 truncate text-[12px]" style={{ fontFamily: F.body, color: C.mute }}>
          {destination.address}
        </p>
      </div>
    </Pop>
  );
}
