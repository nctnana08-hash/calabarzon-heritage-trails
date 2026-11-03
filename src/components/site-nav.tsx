import { Link, useLocation } from "@tanstack/react-router";
import { useSulyapProgress } from "@/lib/sulyap-data";
import { C, F } from "@/lib/sulyap-theme";
import { Mark } from "./sulyap-ui";

type NavItem = {
  label: string;
  to: "/" | "/destinations" | "/manage";
  search?: { view?: "list" | "map" | "passport" };
  isActive: (pathname: string, searchStr: string) => boolean;
};

const NAV_ITEMS: NavItem[] = [
  {
    label: "Home",
    to: "/",
    isActive: (path) => path === "/",
  },
  {
    label: "Places",
    to: "/destinations",
    search: { view: "list" },
    isActive: (path, searchStr) =>
      path.startsWith("/destinations") &&
      !searchStr.includes("view=passport") &&
      !searchStr.includes("view=map"),
  },
  {
    label: "Passport",
    to: "/destinations",
    search: { view: "passport" },
    isActive: (path, searchStr) =>
      path.startsWith("/destinations") && searchStr.includes("view=passport"),
  },
  {
    label: "Map",
    to: "/destinations",
    search: { view: "map" },
    isActive: (path, searchStr) =>
      path.startsWith("/destinations") && searchStr.includes("view=map"),
  },
  {
    label: "Manage",
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
        backgroundColor: "rgba(252, 249, 240, 0.92)",
        borderColor: "#E0D7C3",
      }}
    >
      <div className="mx-auto flex h-15 max-w-5xl items-center justify-between px-4">
        <Link to="/" aria-label="Sulyap Home" className="flex items-center gap-2.5">
          <Mark size={32} />
          <span
            className="text-[22px] font-bold tracking-tight"
            style={{ fontFamily: F.display, color: C.ink }}
          >
            Sulyap
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex" aria-label="Primary navigation">
          {NAV_ITEMS.map((item) => {
            const on = item.isActive(pathname, searchStr);
            const isPassport = item.label === "Passport";
            return (
              <Link
                key={item.label}
                to={item.to}
                {...(item.search ? { search: item.search } : {})}
                aria-current={on ? "page" : undefined}
                className="flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[14px] font-medium transition-colors"
                style={{
                  fontFamily: F.body,
                  backgroundColor: on ? C.cover : "transparent",
                  color: on ? "#FCF9F0" : C.ink,
                }}
              >
                <span>{item.label}</span>
                {isPassport && stampedCount > 0 ? (
                  <span
                    className="rounded-full px-1.5 py-0.2 text-[11px] font-bold"
                    style={{
                      backgroundColor: on ? C.foil : C.sand,
                      color: C.ink,
                    }}
                  >
                    {stampedCount}
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

  const mobileTabs = NAV_ITEMS.filter((i) =>
    ["Home", "Places", "Passport", "Manage"].includes(i.label),
  );

  return (
    <nav
      aria-label="Mobile bottom navigation"
      className="fixed inset-x-0 bottom-0 z-40 border-t md:hidden"
      style={{
        backgroundColor: C.card,
        borderColor: "#E0D7C3",
      }}
    >
      <div className="mx-auto grid max-w-lg grid-cols-4">
        {mobileTabs.map((item) => {
          const on = item.isActive(pathname, searchStr);
          const isPassport = item.label === "Passport";
          return (
            <Link
              key={item.label}
              to={item.to}
              {...(item.search ? { search: item.search } : {})}
              aria-current={on ? "page" : undefined}
              className="flex min-h-[54px] items-center justify-center gap-1 text-[13px] font-semibold"
              style={{
                fontFamily: F.body,
                color: on ? C.cover : C.mute,
              }}
            >
              <span>{item.label}</span>
              {isPassport && stampedCount > 0 ? (
                <span
                  className="rounded-full px-1.5 py-0.2 text-[10px] font-bold"
                  style={{
                    backgroundColor: C.foil,
                    color: C.ink,
                  }}
                >
                  {stampedCount}
                </span>
              ) : null}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
