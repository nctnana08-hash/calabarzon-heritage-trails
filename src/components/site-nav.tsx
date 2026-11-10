import { Link, useLocation } from "@tanstack/react-router";
import {
  BookOpenCheck,
  Compass,
  Map,
  MapPin,
  PlusCircle,
  Smartphone,
  Sun,
  Moon,
  LogIn,
  LogOut,
  User,
  Shield,
} from "lucide-react";
import React, { useState } from "react";
import { AndroidDownloadModal } from "@/components/android-download-modal";
import { AuthModal } from "@/components/auth-modal";
import { useAppBranding } from "@/hooks/use-app-branding";
import { useTheme } from "@/hooks/use-theme";
import { useAuth } from "@/hooks/use-auth";
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
  const { isDark, toggleTheme } = useTheme();
  const { user, isAuthenticated, isAdmin, signOut } = useAuth();

  const [appModalOpen, setAppModalOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);

  const stampedCount = Object.values(progress).filter((p) => p?.toured === 1).length;

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-[#E2E8F0] dark:border-[#22314E] bg-white/95 dark:bg-[#0B1120]/95 backdrop-blur-md transition-colors">
        {/* Official Philippine Flag Tri-Color Accent Strip */}
        <div className="egov-tricolor-bar h-1 w-full" />

        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          {/* Logo & Dynamic Branding */}
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
                  style={{ fontFamily: F.display, color: branding.primaryColor }}
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
              <span className="mt-0.5 block truncate text-[11px] font-semibold text-[#64748B] dark:text-[#94A3B8]">
                {branding.appTagline}
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
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
                  className="flex items-center gap-2 rounded-full px-4 py-2 text-[13.5px] font-bold transition-all hover:bg-[#EFF6FF] dark:hover:bg-[#1E3A8A]/30 hover:text-[#0038A8] dark:hover:text-[#93C5FD]"
                  style={{
                    fontFamily: F.body,
                    backgroundColor: on ? C.cover : "transparent",
                    color: on ? "#FFFFFF" : undefined,
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
          </nav>

          {/* Right Action Tools: Dark Mode, App Download & User Auth */}
          <div className="flex items-center gap-2">
            {/* Dark / Light Mode Switcher */}
            <button
              type="button"
              onClick={toggleTheme}
              aria-label="Toggle Dark or Light Mode"
              className="flex size-9 cursor-pointer items-center justify-center rounded-xl border border-[#CBD5E1] dark:border-[#334155] bg-white dark:bg-[#1E293B] text-[#334155] dark:text-[#FCD116] shadow-2xs hover:bg-[#F1F5F9] dark:hover:bg-[#2A374F] transition"
            >
              {isDark ? <Sun className="size-4.5" /> : <Moon className="size-4.5" />}
            </button>

            {/* Android APK Download Pill */}
            <button
              type="button"
              onClick={() => setAppModalOpen(true)}
              className="hidden sm:inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-[#0038A8]/30 bg-[#EFF6FF] dark:bg-[#1E3A8A]/30 px-3.5 py-1.5 text-[12.5px] font-extrabold text-[#0038A8] dark:text-[#93C5FD] shadow-2xs hover:bg-[#0038A8] hover:text-white transition"
              style={{ fontFamily: F.body }}
            >
              <Smartphone className="size-3.5" />
              <span>App</span>
            </button>

            {/* User Auth / Profile */}
            {isAuthenticated && user ? (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                  className="flex cursor-pointer items-center gap-2 rounded-full border border-[#CBD5E1] dark:border-[#334155] bg-white dark:bg-[#1E293B] px-3 py-1.5 text-[12.5px] font-bold text-[#0F172A] dark:text-[#F8FAFC] shadow-2xs hover:bg-[#F1F5F9]"
                >
                  <span className="flex size-6 items-center justify-center rounded-full bg-[#0038A8] text-[11px] font-extrabold text-white">
                    {user.name.charAt(0).toUpperCase()}
                  </span>
                  <span className="max-w-[90px] truncate sm:max-w-[130px]">{user.name}</span>
                  {isAdmin ? (
                    <span className="rounded-md bg-[#FEF3C7] dark:bg-[#78350F] px-1.5 py-0.5 text-[9px] font-extrabold text-[#B45309] dark:text-[#FDE68A]">
                      ADMIN
                    </span>
                  ) : null}
                </button>

                {profileMenuOpen && (
                  <div className="absolute right-0 top-11 z-50 w-56 rounded-2xl border border-[#CBD5E1] dark:border-[#334155] bg-white dark:bg-[#131C31] p-3 shadow-lg">
                    <p className="text-[13px] font-bold text-[#0F172A] dark:text-[#F8FAFC]">
                      {user.name}
                    </p>
                    <p className="truncate text-[11px] text-[#64748B] dark:text-[#94A3B8]">
                      {user.email}
                    </p>
                    {user.province ? (
                      <p className="mt-1 text-[11px] font-semibold text-[#0038A8] dark:text-[#93C5FD]">
                        📍 {user.province} Passport Holder
                      </p>
                    ) : null}

                    <div className="mt-3 border-t border-[#E2E8F0] dark:border-[#22314E] pt-2 space-y-1">
                      {isAdmin ? (
                        <Link
                          to="/manage"
                          onClick={() => setProfileMenuOpen(false)}
                          className="flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-[12px] font-bold text-[#0038A8] dark:text-[#93C5FD] hover:bg-[#EFF6FF] dark:hover:bg-[#1E3A8A]/30"
                        >
                          <Shield className="size-3.5" />
                          <span>Admin Control Center</span>
                        </Link>
                      ) : null}
                      <button
                        type="button"
                        onClick={() => {
                          setProfileMenuOpen(false);
                          void signOut();
                        }}
                        className="flex w-full cursor-pointer items-center gap-2 rounded-lg px-2.5 py-1.5 text-[12px] font-bold text-[#CE1126] hover:bg-[#FEF2F2] dark:hover:bg-[#450A0A]/40"
                      >
                        <LogOut className="size-3.5" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setAuthModalOpen(true)}
                className="inline-flex cursor-pointer items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[12.5px] font-extrabold text-white shadow-md transition hover:-translate-y-0.5"
                style={{ backgroundColor: C.cover, fontFamily: F.body }}
              >
                <LogIn className="size-3.5" />
                <span>Sign In</span>
              </button>
            )}
          </div>
        </div>
      </header>

      <AndroidDownloadModal open={appModalOpen} onOpenChange={setAppModalOpen} />
      <AuthModal open={authModalOpen} onOpenChange={setAuthModalOpen} />
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
      className="fixed inset-x-0 bottom-0 z-40 border-t border-[#E2E8F0] dark:border-[#22314E] bg-white/95 dark:bg-[#0B1120]/95 backdrop-blur-md md:hidden"
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
                color: on ? C.cover : undefined,
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
