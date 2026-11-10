import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  createRootRouteWithContext,
  useNavigate,
  useRouter,
  HeadContent,
  Scripts,
  type ErrorComponentProps,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { Toaster } from "@/components/ui/sonner";
import { Btn, Mark, Pop } from "@/components/sulyap-ui";
import { useAppBranding } from "@/hooks/use-app-branding";
import { C, F } from "@/lib/sulyap-theme";

function NotFoundComponent() {
  const navigate = useNavigate();
  return (
    <div
      className="flex min-h-screen items-center justify-center px-4 pb-20"
      style={{ backgroundColor: C.paper }}
    >
      <div className="w-full max-w-md">
        <Pop className="flex flex-col items-center p-8 text-center">
          <Mark size={56} />
          <span
            className="mt-4 text-[11px] tracking-[0.22em] uppercase"
            style={{ fontFamily: F.mono, color: C.mute }}
          >
            VISA ENTRY NOT FOUND · CODE 404
          </span>
          <h1
            className="mt-2 text-[34px] font-bold leading-tight"
            style={{ fontFamily: F.display, color: C.ink }}
          >
            Uncharted Heritage Page
          </h1>
          <p
            className="mt-2 text-[15px] leading-[22px]"
            style={{ fontFamily: F.body, color: C.mute }}
          >
            This passport page does not exist or has been relocated. Return to the reception desk to
            continue your CALABARZON journey.
          </p>
          <div className="mt-6 w-full">
            <Btn
              label="Return to Passport Desk"
              sub="Balik sa Tahanan"
              color={C.cover}
              onClick={() => navigate({ to: "/" })}
            />
          </div>
        </Pop>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: ErrorComponentProps) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div
      className="flex min-h-screen items-center justify-center px-4 pb-20"
      style={{ backgroundColor: C.paper }}
    >
      <div className="w-full max-w-md">
        <Pop className="flex flex-col items-center p-8 text-center">
          <Mark size={56} />
          <h1
            className="mt-4 text-[28px] font-bold"
            style={{ fontFamily: F.display, color: C.ink }}
          >
            Passport Ledger Interrupted
          </h1>
          <p
            className="mt-2 text-[15px] leading-[22px]"
            style={{ fontFamily: F.body, color: C.mute }}
          >
            This page could not load right now. Try refreshing or return to the main passport desk.
          </p>
          <div className="mt-6 w-full space-y-2.5">
            <Btn
              label="Try again"
              color={C.cover}
              onClick={() => {
                router.invalidate();
                reset();
              }}
            />
            <Btn
              label="Return to Home"
              color={C.card}
              onClick={() => {
                window.location.href = "/";
              }}
            />
          </div>
        </Pop>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1, viewport-fit=cover" },
      { title: "Pasaporte ng Pamana — CALABARZON Cultural Heritage Passport" },
      {
        name: "description",
        content:
          "Official Cultural Heritage Passport & Virtual Field Trip across Region IV-A (Cavite, Laguna, Batangas, Rizal, Quezon). Collect arrival stamps and complete field quizzes.",
      },
      { name: "theme-color", content: "#0038A8" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" },
      { rel: "icon", type: "image/png", href: "/favicon.png" },
      { rel: "apple-touch-icon", href: "/apple-touch-icon.png" },
      { rel: "manifest", href: "/manifest.webmanifest" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      {
        rel: "preconnect",
        href: "https://fonts.gstatic.com",
        crossOrigin: "anonymous",
      },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@500;700&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const { branding } = useAppBranding();

  // Sync theme-color and dynamic app branding title
  useEffect(() => {
    if (typeof document !== "undefined") {
      const themeMeta = document.querySelector('meta[name="theme-color"]');
      if (themeMeta && branding.primaryColor) {
        themeMeta.setAttribute("content", branding.primaryColor);
      }
    }
  }, [branding]);

  // Recover seamlessly if a new Vercel deployment invalidates lazy chunk hashes in an open tab
  useEffect(() => {
    const onPreloadError = (event: Event) => {
      const key = `sulyap-chunk-reload:${window.location.pathname}`;
      if (!window.sessionStorage.getItem(key)) {
        event.preventDefault();
        window.sessionStorage.setItem(key, "1");
        window.location.reload();
      }
    };
    window.addEventListener("vite:preloadError", onPreloadError);
    return () => window.removeEventListener("vite:preloadError", onPreloadError);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen pb-20 md:pb-0" style={{ color: C.ink }}>
        {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
        <Outlet />
      </div>
      <Toaster />
    </QueryClientProvider>
  );
}
