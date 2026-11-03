import { Link, useLocation } from "@tanstack/react-router";
import { BookOpenCheck, Compass, Map, MapPin, PlusCircle } from "lucide-react";
import React from "react";
import { useSulyapProgress } from "@/lib/sulyap-data";
import { C, F } from "@/lib/sulyap-theme";
import { Mark } from "./sulyap-ui";

type NavItem = {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  to: "/" | "/destinations" | "/manage";
  search?: { view?: "list" | "map" | "passport" };
  isActive: (pathname: string, searchStr: string) => boolean;
};

const NAV_ITEMS: NavItem[] = [
  {
    label: "Home",
    icon: Compass,
    to: "/",
    isActive: (path) => path === "/",
  },
  {
    label: "Places",
    icon: MapPin,
    to: "/destinations",
    search: { view: "list" },
    isActive: (path, searchStr) =>
      path.startsWith("/destinations") &&
      !searchStr.includes("view=passport") &&
      !searchStr.includes("view=map"),
  },
  {
    label: "Map",
    icon: Map,
    to: "/destinations",
    search: { view: "map" },
    isActive: (path, searchStr) =>
      path.startsWith("/destinations") && searchStr.includes("view=map"),
  },
  {
    label: "Passport",
    icon: BookOpenCheck,
    to: "/destinations",
    search: { view: "passport" },
    isActive: (path, searchStr) =>
      path.startsWith("/destinations") && searchStr.includes("view=passport"),
  },
  {
    label: "Add / Edit",
    icon: PlusCircle,
    to: "/manage",
    isActive: (path) => path.startsWith("/manage"),
  },
];

export function SiteHeader() {
  const location = useLocation();
  const pathname = location.pathname;
  const searchStr = location.searchStr ?? "";
  const progress = useSulyapProgress();
  const stampedCount = Object.values(progress).filter((p) => p?.toured === 1).length;

  return (
    <header
      className="sticky top-0 z-40 border-b backdrop-blur-md"
      style={{
        backgroundColor: "rgba(255, 255, 255, 0.92)",
        borderColor: "#E6DFCE",
      }}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link to="/" aria-label="Sulyap Home" className="flex items-center gap-2.5">
          <Mark size={36} />
          <div>
            <span
              className="block text-[22px] font-bold leading-none"
              style={{ fontFamily: F.display, color: C.ink }}
            >
              Sulyap
            </span>
            <span className="text-[11px] font-medium" style={{ fontFamily: F.body, color: C.mute }}>
              CALABARZON Travel Passport
            </span>
          </div>
        </Link>

        <nav className="hidden items-center gap-1.5 md:flex" aria-label="Primary navigation">
          {NAV_ITEMS.map((item) => {
            const on = item.isActive(pathname, searchStr);
            const isPassport = item.label === "Passport";
            const Icon = item.icon;
            return (
              <Link
                key={item.label}
                to={item.to}
                {...(item.search ? { search: item.search } : {})}
                aria-current={on ? "page" : undefined}
                className="flex items-center gap-2 rounded-full px-4 py-2 text-[14px] font-semibold transition-all hover:bg-[#F6F1E3]"
                style={{
                  fontFamily: F.body,
                  backgroundColor: on ? C.cover : "transparent",
                  color: on ? "#FFFFFF" : C.ink,
                }}
              >
                <Icon className="size-4" />
                <span>{item.label}</span>
                {isPassport ? (
                  <span
                    className="rounded-full px-2 py-0.5 text-[11px] font-bold leading-none"
                    style={{
                      backgroundColor: on ? C.foil : "#F3E8C8",
                      color: C.ink,
                    }}
                  >
                    {stampedCount}/19
                  </span>
                ) : null}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}

export function MobileBottomNav() {
  const location = useLocation();
  const pathname = location.pathname;
  const searchStr = location.searchStr ?? "";
  const progress = useSulyapProgress();
  const stampedCount = Object.values(progress).filter((p) => p?.toured === 1).length;

  return (
    <nav
      aria-label="Mobile bottom navigation"
      className="fixed inset-x-0 bottom-0 z-40 border-t bg-white/95 backdrop-blur-md md:hidden"
      style={{
        borderColor: "#E6DFCE",
      }}
    >
      <div className="mx-auto grid max-w-lg grid-cols-5">
        {NAV_ITEMS.map((item) => {
          const on = item.isActive(pathname, searchStr);
          const isPassport = item.label === "Passport";
          const Icon = item.icon;
          return (
            <Link
              key={item.label}
              to={item.to}
              {...(item.search ? { search: item.search } : {})}
              aria-current={on ? "page" : undefined}
              className="relative flex min-h-[58px] flex-col items-center justify-center gap-1 py-1.5 text-[11px] font-semibold"
              style={{
                fontFamily: F.body,
                color: on ? C.cover : C.mute,
              }}
            >
              <div className="relative">
                <Icon className="size-5" />
                {isPassport && stampedCount > 0 ? (
                  <span
                    className="absolute -top-1.5 -right-3 rounded-full px-1 text-[9px] font-bold"
                    style={{
                      backgroundColor: C.foil,
                      color: C.ink,
                    }}
                  >
                    {stampedCount}
                  </span>
                ) : null}
              </div>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
