import { Link, useLocation } from "@tanstack/react-router";
import { useSulyapProgress } from "@/lib/sulyap-data";
import { C, F } from "@/lib/sulyap-theme";
import { Mark } from "./sulyap-ui";

type NavItem = {
  fil: string;
  en: string;
  to: "/" | "/destinations" | "/manage";
  search?: { view?: "list" | "map" | "passport" };
  isActive: (pathname: string, searchStr: string) => boolean;
};

const NAV_ITEMS: NavItem[] = [
  {
    fil: "Tahanan",
    en: "Port of Entry",
    to: "/",
    isActive: (path) => path === "/",
  },
  {
    fil: "Destinasyon",
    en: "Visa Directory",
    to: "/destinations",
    search: { view: "list" },
    isActive: (path, searchStr) =>
      path.startsWith("/destinations") &&
      !searchStr.includes("view=passport") &&
      !searchStr.includes("view=map"),
  },
  {
    fil: "Pasaporte",
    en: "Stamp Booklet",
    to: "/destinations",
    search: { view: "passport" },
    isActive: (path, searchStr) =>
      path.startsWith("/destinations") && searchStr.includes("view=passport"),
  },
  {
    fil: "Mapa",
    en: "Cartography",
    to: "/destinations",
    search: { view: "map" },
    isActive: (path, searchStr) =>
      path.startsWith("/destinations") && searchStr.includes("view=map"),
  },
  {
    fil: "Pamahalaan",
    en: "Registry Desk",
    to: "/manage",
    isActive: (path) => path.startsWith("/manage"),
  },
];

function GoldFoilRule() {
  return (
    <div
      className="h-[3px] w-full"
      aria-hidden="true"
      style={{
        background:
          "linear-gradient(90deg, #8B6914 0%, #D4AF37 25%, #F3E5AB 50%, #D4AF37 75%, #8B6914 100%)",
      }}
    />
  );
}

export function SiteHeader() {
  const location = useLocation();
  const pathname = location.pathname;
  const searchStr = location.searchStr ?? "";
  const progress = useSulyapProgress();
  const stampedCount = Object.values(progress).filter((p) => p?.toured === 1).length;

  return (
    <header
      className="passport-leather-cover sticky top-0 z-40 shadow-md"
      style={{
        borderBottomWidth: 1,
        borderBottomStyle: "solid",
        borderBottomColor: "rgba(212, 175, 55, 0.45)",
      }}
    >
      <GoldFoilRule />
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link
          to="/"
          aria-label="Sulyap: Pasaporte ng Pamana ng CALABARZON (Home)"
          className="flex items-center gap-3"
        >
          <Mark size={40} />
          <div className="flex flex-col leading-none">
            <span
              className="text-[10px] font-semibold uppercase tracking-[0.2em]"
              style={{ fontFamily: F.mono, color: C.foil }}
            >
              REPUBLIKA NG PILIPINAS · IV-A
            </span>
            <span
              className="mt-0.5 text-[24px] font-bold tracking-[0.03em] leading-none"
              style={{ fontFamily: F.display, color: "#FCF9F0" }}
            >
              Sulyap Pasaporte
            </span>
          </div>
        </Link>

        <nav className="hidden items-center gap-1.5 md:flex" aria-label="Primary navigation">
          {NAV_ITEMS.map((item) => {
            const on = item.isActive(pathname, searchStr);
            const isPassportTab = item.fil === "Pasaporte";
            return (
              <Link
                key={item.fil}
                to={item.to}
                {...(item.search ? { search: item.search } : {})}
                aria-label={`${item.fil} (${item.en})`}
                aria-current={on ? "page" : undefined}
                className="relative flex min-h-[42px] items-center gap-2.5 rounded-md px-3.5 py-1.5 transition-all hover:bg-white/10"
                style={{
                  borderWidth: 1,
                  borderStyle: "solid",
                  borderColor: on ? C.foil : "transparent",
                  backgroundColor: on ? "rgba(212, 175, 55, 0.16)" : "transparent",
                }}
              >
                <span className="flex flex-col leading-tight">
                  <span
                    className="flex items-center gap-1.5 text-[14px] font-semibold"
                    style={{
                      fontFamily: F.bold,
                      color: on ? C.foil : "#FCF9F0",
                    }}
                  >
                    {item.fil}
                    {isPassportTab && (
                      <span
                        className="inline-flex items-center rounded-xs px-1.5 py-0.5 text-[10px] font-bold leading-none"
                        style={{
                          fontFamily: F.mono,
                          backgroundColor: C.foil,
                          color: C.ink,
                        }}
                      >
                        ★ {stampedCount}
                      </span>
                    )}
                  </span>
                  <span
                    className="text-[10px] uppercase tracking-[0.12em]"
                    style={{
                      fontFamily: F.mono,
                      color: on ? "#F6F1E3" : "rgba(246, 241, 227, 0.68)",
                    }}
                  >
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
  const progress = useSulyapProgress();
  const stampedCount = Object.values(progress).filter((p) => p?.toured === 1).length;

  const mobileTabs = NAV_ITEMS.filter((i) =>
    ["Tahanan", "Destinasyon", "Pasaporte", "Pamahalaan"].includes(i.fil),
  );

  return (
    <nav
      aria-label="Mobile bottom navigation"
      className="passport-leather-cover fixed inset-x-0 bottom-0 z-40 md:hidden"
      style={{
        borderTopWidth: 1,
        borderTopStyle: "solid",
        borderTopColor: "rgba(212, 175, 55, 0.45)",
      }}
    >
      <GoldFoilRule />
      <div className="mx-auto grid max-w-lg grid-cols-4">
        {mobileTabs.map((item) => {
          const on = item.isActive(pathname, searchStr);
          const isPassportTab = item.fil === "Pasaporte";
          return (
            <Link
              key={item.fil}
              to={item.to}
              {...(item.search ? { search: item.search } : {})}
              aria-label={`${item.fil} (${item.en})`}
              aria-current={on ? "page" : undefined}
              className="relative flex min-h-[60px] flex-col items-center justify-center pt-2 pb-2"
              style={{
                backgroundColor: on ? "rgba(212, 175, 55, 0.15)" : "transparent",
              }}
            >
              <span
                className="flex items-center gap-1 text-[13px] font-semibold leading-none"
                style={{
                  fontFamily: F.bold,
                  color: on ? C.foil : "#FCF9F0",
                }}
              >
                {item.fil}
                {isPassportTab && (
                  <span
                    className="rounded-xs px-1 py-0.5 text-[9px] font-bold"
                    style={{
                      fontFamily: F.mono,
                      backgroundColor: C.foil,
                      color: C.ink,
                    }}
                  >
                    {stampedCount}
                  </span>
                )}
              </span>
              <span
                className="mt-1 text-[9px] uppercase tracking-[0.1em] leading-none"
                style={{
                  fontFamily: F.mono,
                  color: on ? "#F6F1E3" : "rgba(246, 241, 227, 0.65)",
                }}
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
