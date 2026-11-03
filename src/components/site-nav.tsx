import { Link, useLocation } from "@tanstack/react-router";
import { Compass, Home, LibraryBig, MapPinned } from "lucide-react";

import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { to: "/", label: "Home", icon: Home, active: (path: string) => path === "/" },
  {
    to: "/destinations",
    label: "Explore",
    icon: Compass,
    active: (path: string) => path.startsWith("/destinations"),
  },
  {
    to: "/destinations",
    label: "Map",
    icon: MapPinned,
    search: { view: "map" as const },
    active: () => false,
  },
  {
    to: "/manage",
    label: "Manage",
    icon: LibraryBig,
    active: (path: string) => path.startsWith("/manage"),
  },
] as const;

function Wordmark() {
  return (
    <Link to="/" className="flex flex-col leading-none">
      <span className="font-display text-2xl font-semibold tracking-tight text-primary">
        Lakbay Kultura
      </span>
      <span className="mt-1 text-[0.6rem] font-semibold uppercase tracking-[0.28em] text-muted-foreground">
        CALABARZON Virtual Tour
      </span>
    </Link>
  );
}

export function SiteHeader() {
  const { pathname } = useLocation();

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/85">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Wordmark />
        <nav className="hidden items-center gap-1 md:flex">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.label}
              to={item.to}
              {...("search" in item && item.search ? { search: item.search } : {})}
              className={cn(
                "rounded-md px-3 py-2 text-sm font-medium transition-colors",
                item.active(pathname)
                  ? "bg-secondary text-primary"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground",
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}

export function MobileBottomNav() {
  const { pathname } = useLocation();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card/95 backdrop-blur md:hidden">
      <div className="mx-auto grid max-w-lg grid-cols-4">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const active = item.active(pathname);
          return (
            <Link
              key={item.label}
              to={item.to}
              {...("search" in item && item.search ? { search: item.search } : {})}
              className={cn(
                "flex flex-col items-center gap-1 py-2.5 text-[0.65rem] font-medium transition-colors",
                active ? "text-primary" : "text-muted-foreground",
              )}
            >
              <Icon className="size-5" />
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
