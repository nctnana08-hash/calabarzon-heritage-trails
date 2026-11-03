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
      ariaLabel={`${destination.name}, ${destination.province}, ${cat.fil} (${destination.category})`}
      className="flex h-full flex-col"
    >
      <div className="relative h-44 w-full overflow-hidden">
        <Cover destination={destination} className="h-full w-full" />
        {toured ? (
          <span
            className="absolute top-3 right-3 rounded-full px-2.5 py-0.5 text-[12px] font-bold"
            style={{
              fontFamily: F.bold,
              backgroundColor: C.green,
              color: "#FFFFFF",
              borderWidth: 2,
              borderStyle: "solid",
              borderColor: C.ink,
            }}
          >
            ✓ Stamped
          </span>
        ) : null}
      </div>
      <div
        className="flex flex-1 flex-col p-4"
        style={{
          borderTopWidth: 2,
          borderTopStyle: "solid",
          borderTopColor: C.ink,
        }}
      >
        <span className="text-[13px] font-bold" style={{ fontFamily: F.bold, color: cat.deep }}>
          {cat.fil}, {destination.province}
        </span>
        <h3
          className="mt-1 text-[20px] leading-[25px]"
          style={{ fontFamily: F.display, color: C.ink }}
        >
          {destination.name}
        </h3>
        <p
          className="mt-1.5 line-clamp-2 text-[14px] leading-[20px]"
          style={{ fontFamily: F.body, color: C.mute }}
        >
          {destination.description}
        </p>
      </div>
    </Pop>
  );
}
