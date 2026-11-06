import { useNavigate } from "@tanstack/react-router";
import { Check, MapPin } from "lucide-react";
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
      className="group flex h-full flex-col"
    >
      <div className="relative h-44 w-full overflow-hidden">
        <Cover destination={destination} className="h-full w-full" />
        <span
          className="absolute top-3 left-3 rounded-full px-2.5 py-1 text-[11px] font-bold text-white shadow-xs backdrop-blur-xs"
          style={{
            fontFamily: F.body,
            backgroundColor: "rgba(15, 23, 42, 0.72)",
          }}
        >
          {cat.en}
        </span>
        {toured ? (
          <span
            className="absolute top-3 right-3 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold text-white shadow-xs"
            style={{
              fontFamily: F.body,
              backgroundColor: C.green,
            }}
          >
            <Check className="size-3" /> Stamped
          </span>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col justify-between p-4">
        <div>
          <h3
            className="text-[18px] font-bold leading-snug group-hover:text-[#0038A8]"
            style={{ fontFamily: F.display, color: C.ink }}
          >
            {destination.name}
          </h3>
          <p
            className="mt-1 inline-flex items-center gap-1 text-[13px]"
            style={{ fontFamily: F.body, color: C.mute }}
          >
            <MapPin className="size-3.5 shrink-0 text-[#0038A8]" /> {destination.address},{" "}
            {destination.province}
          </p>
        </div>

        <div className="mt-3 flex items-center justify-between border-t border-[#F1F5F9] pt-2.5 text-[12px] font-bold">
          <span
            className="rounded-md px-2 py-0.5 text-[11px]"
            style={{ backgroundColor: "#EFF6FF", color: C.cover }}
          >
            {destination.province}
          </span>
          <span style={{ color: C.cover }}>Explore →</span>
        </div>
      </div>
    </Pop>
  );
}
