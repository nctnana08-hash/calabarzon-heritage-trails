import { Link, useLocation } from "@tanstack/react-router";
import { C, F } from "@/lib/sulyap-theme";
import { Mark } from "./sulyap-ui";

type NavItem = {
  fil: string;
  en: string;
  to: "/" | "/destinations" | "/manage";
  search?: { view?: "list" | "map" | "passport" };
  color: string;
  isActive: (pathname: string, searchStr: string) => boolean;
};

const NAV_ITEMS: NavItem[] = [
  {
    fil: "Tahanan",
    en: "Home",
    to: "/",
    color: C.blue,
    isActive: (path) => path === "/",
  },
  {
    fil: "Destinasyon",
    en: "Places",
    to: "/destinations",
    // M1.3: Clear sticky province/category filter when pressing the Destinasyon tab directly
    search: { view: "list" },
    color: C.red,
    isActive: (path, searchStr) =>
      path.startsWith("/destinations") &&
      !searchStr.includes("view=passport") &&
      !searchStr.includes("view=map"),
  },
  {
    fil: "Pasaporte",
    en: "Passport",
    to: "/destinations",
    search: { view: "passport" },
    color: C.gold,
    isActive: (path, searchStr) =>
      path.startsWith("/destinations") && searchStr.includes("view=passport"),
  },
  {
    fil: "Mapa",
    en: "Map",
    to: "/destinations",
    search: { view: "map" },
    color: C.green,
    isActive: (path, searchStr) =>
      path.startsWith("/destinations") && searchStr.includes("view=map"),
  },
  {
    fil: "Pamahalaan",
    en: "Manage",
    to: "/manage",
    color: C.blue,
    isActive: (path) => path.startsWith("/manage"),
  },
];

function FourColorBar() {
  return (
    <div className="flex h-1.5 w-full" aria-hidden="true">
      {[C.blue, C.red, C.gold, C.green].map((c) => (
        <div key={c} className="flex-1" style={{ backgroundColor: c }} />
      ))}
    </div>
  );
}

export function SiteHeader() {
  const location = useLocation();
  const pathname = location.pathname;
  const searchStr = location.searchStr ?? "";

  return (
    <header
      className="sticky top-0 z-40"
      style={{
        backgroundColor: C.card,
        borderBottomWidth: 2,
        borderBottomStyle: "solid",
        borderBottomColor: C.ink,
      }}
    >
      <FourColorBar />
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link
          to="/"
          aria-label="Sulyap: Virtual tours of CALABARZON (Home)"
          className="flex items-center gap-3"
        >
          <Mark size={38} />
          <div className="flex flex-col leading-none">
            <span
              className="text-[26px] leading-none"
              style={{ fontFamily: F.display, color: C.ink }}
            >
              Sulyap
            </span>
            <span
              className="mt-1 text-[12px] font-bold"
              style={{ fontFamily: F.bold, color: C.mute }}
            >
              Virtual tours of CALABARZON
            </span>
          </div>
        </Link>

        <nav className="hidden items-center gap-1.5 md:flex" aria-label="Primary navigation">
          {NAV_ITEMS.map((item) => {
            const on = item.isActive(pathname, searchStr);
            return (
              <Link
                key={item.fil}
                to={item.to}
                {...(item.search ? { search: item.search } : {})}
                aria-label={`${item.fil} (${item.en})`}
                aria-current={on ? "page" : undefined}
                className="flex min-h-[44px] items-center gap-2.5 rounded-[10px] px-3.5 py-1.5 transition-colors hover:bg-[#FAF8F1]"
                style={{
                  borderWidth: 2,
                  borderStyle: "solid",
                  borderColor: on ? C.ink : "transparent",
                  backgroundColor: on ? C.paper : "transparent",
                }}
              >
                <span
                  aria-hidden="true"
                  className="inline-block size-3 shrink-0"
                  style={{
                    transform: "rotate(45deg)",
                    borderWidth: 2,
                    borderStyle: "solid",
                    borderColor: C.ink,
                    backgroundColor: on ? item.color : "transparent",
                  }}
                />
                <span className="flex flex-col leading-tight">
                  <span
                    className="text-[14px] font-bold"
                    style={{ fontFamily: F.bold, color: C.ink }}
                  >
                    {item.fil}
                  </span>
                  <span className="text-[11px]" style={{ fontFamily: F.body, color: C.mute }}>
                    {item.en}
                  </span>
                </span>
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

  // Match Sulyap's 3 primary mobile tabs + Manage for quick mobile access
  const mobileTabs = NAV_ITEMS.filter((i) =>
    ["Tahanan", "Destinasyon", "Pasaporte", "Pamahalaan"].includes(i.fil),
  );

  return (
    <nav
      aria-label="Mobile bottom navigation"
      className="fixed inset-x-0 bottom-0 z-40 md:hidden"
      style={{
        backgroundColor: C.card,
        borderTopWidth: 2,
        borderTopStyle: "solid",
        borderTopColor: C.ink,
      }}
    >
      <FourColorBar />
      <div className="mx-auto grid max-w-lg grid-cols-4">
        {mobileTabs.map((item) => {
          const on = item.isActive(pathname, searchStr);
          return (
            <Link
              key={item.fil}
              to={item.to}
              {...(item.search ? { search: item.search } : {})}
              aria-label={`${item.fil} (${item.en})`}
              aria-current={on ? "page" : undefined}
              className="flex min-h-[60px] flex-col items-center justify-center pt-2.5 pb-2"
            >
              <span
                aria-hidden="true"
                className="mb-1.5 inline-block size-[11px]"
                style={{
                  transform: "rotate(45deg)",
                  borderWidth: 2,
                  borderStyle: "solid",
                  borderColor: C.ink,
                  backgroundColor: on ? item.color : "transparent",
                }}
              />
              <span
                className="text-[13px] font-bold leading-none"
                style={{ fontFamily: F.bold, color: C.ink }}
              >
                {item.fil}
              </span>
              <span
                className="mt-0.5 text-[11px] leading-none"
                style={{ fontFamily: F.body, color: C.mute }}
              >
                {item.en}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
