import { Link, useLocation } from "@tanstack/react-router";
import { BookOpenCheck, Compass, Map, MapPin, PlusCircle, Smartphone } from "lucide-react";
import React, { useState } from "react";
import { AndroidDownloadModal } from "@/components/android-download-modal";
import { useAppBranding } from "@/hooks/use-app-branding";
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
    label: "e-Passport",
    icon: BookOpenCheck,
    to: "/destinations",
    search: { view: "passport" },
    isActive: (path, searchStr) =>
      path.startsWith("/destinations") && searchStr.includes("view=passport"),
  },
  {
    label: "Manage",
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
  const { branding } = useAppBranding();
  const [appModalOpen, setAppModalOpen] = useState(false);
  const stampedCount = Object.values(progress).filter((p) => p?.toured === 1).length;

  return (
    <>
      <header
        className="sticky top-0 z-40 border-b backdrop-blur-md"
        style={{
          backgroundColor: "rgba(255, 255, 255, 0.94)",
          borderColor: "#E2E8F0",
        }}
      >
        {/* Official Philippine Flag Tri-Color Accent Strip */}
        <div className="egov-tricolor-bar h-1 w-full" />

        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <Link
            to="/"
            aria-label={`${branding.appName} Home`}
            className="flex min-w-0 items-center gap-3"
          >
            <Mark
              size={38}
              customLogoUrl={branding.logoType === "custom" ? branding.customLogoUrl : null}
              presetId={branding.presetId}
            />
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span
                  className="truncate text-[20px] font-extrabold tracking-tight leading-none"
                  style={{ fontFamily: F.display, color: C.cover }}
                >
                  {branding.appName}
                </span>
                {branding.appBadge ? (
                  <span
                    className="shrink-0 rounded-md px-1.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-white"
                    style={{ backgroundColor: C.red }}
                  >
                    {branding.appBadge}
                  </span>
                ) : null}
              </div>
              <span
                className="mt-0.5 block truncate text-[11px] font-semibold"
                style={{ fontFamily: F.body, color: C.mute }}
              >
                {branding.appTagline}
              </span>
            </div>
          </Link>

          {/* Mobile Direct Download APK Button */}
          <div className="flex items-center gap-2 md:hidden">
            <button
              type="button"
              onClick={() => setAppModalOpen(true)}
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-[#0038A8]/30 bg-[#EFF6FF] px-2.5 py-1 text-[11px] font-extrabold text-[#0038A8] shadow-2xs hover:bg-[#0038A8] hover:text-white"
              style={{ fontFamily: F.body }}
              aria-label="Download Android App"
            >
              <Smartphone className="size-3.5" />
              <span>App</span>
            </button>
          </div>

          <nav className="hidden items-center gap-1.5 md:flex" aria-label="Primary navigation">
            {NAV_ITEMS.map((item) => {
              const on = item.isActive(pathname, searchStr);
              const isPassport = item.label === "e-Passport";
              const Icon = item.icon;
              return (
                <Link
                  key={item.label}
                  to={item.to}
                  {...(item.search ? { search: item.search } : {})}
                  aria-current={on ? "page" : undefined}
                  className="flex items-center gap-2 rounded-full px-4 py-2 text-[13.5px] font-bold transition-all hover:bg-[#EFF6FF] hover:text-[#0038A8]"
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
                      className="rounded-full px-2 py-0.5 text-[11px] font-extrabold leading-none"
                      style={{
                        backgroundColor: on ? C.foil : "#EFF6FF",
                        color: on ? C.ink : C.cover,
                      }}
                    >
                      {stampedCount}/19
                    </span>
                  ) : null}
                </Link>
              );
            })}

            <button
              type="button"
              onClick={() => setAppModalOpen(true)}
              className="ml-2 inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-[#0038A8]/30 bg-[#EFF6FF] px-3.5 py-2 text-[13px] font-extrabold text-[#0038A8] shadow-2xs transition-all hover:bg-[#0038A8] hover:text-white"
              style={{ fontFamily: F.body }}
            >
              <Smartphone className="size-4" />
              <span>Android App</span>
            </button>
          </nav>
        </div>
      </header>

      <AndroidDownloadModal open={appModalOpen} onOpenChange={setAppModalOpen} />
    </>
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
      className="fixed inset-x-0 bottom-0 z-40 border-t border-[#E2E8F0] bg-white/95 backdrop-blur-md md:hidden"
    >
      <div className="mx-auto grid max-w-lg grid-cols-5">
        {NAV_ITEMS.map((item) => {
          const on = item.isActive(pathname, searchStr);
          const isPassport = item.label === "e-Passport";
          const Icon = item.icon;
          return (
            <Link
              key={item.label}
              to={item.to}
              {...(item.search ? { search: item.search } : {})}
              aria-current={on ? "page" : undefined}
              className="relative flex min-h-[58px] flex-col items-center justify-center gap-1 py-1.5 text-[11px] font-bold"
              style={{
                fontFamily: F.body,
                color: on ? C.cover : C.mute,
              }}
            >
              {on ? (
                <span
                  className="absolute top-0 h-0.5 w-8 rounded-full"
                  style={{ backgroundColor: C.cover }}
                />
              ) : null}
              <div className="relative">
                <Icon className="size-5" />
                {isPassport && stampedCount > 0 ? (
                  <span
                    className="absolute -top-1.5 -right-3 rounded-full px-1 text-[9px] font-extrabold"
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
