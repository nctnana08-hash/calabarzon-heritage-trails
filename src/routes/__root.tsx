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
import { C, F } from "@/lib/sulyap-theme";

function NotFoundComponent() {
  const navigate = useNavigate();
  return (
    <div
      className="flex min-h-screen items-center justify-center px-4 pb-20"
      style={{ backgroundColor: C.paper }}
    >
      <div className="w-full max-w-md">
        <Pop className="flex flex-col items-center p-7 text-center" depth={5} radius={12}>
          <Mark size={52} />
          <h1
            className="mt-4 text-[56px] leading-none"
            style={{ fontFamily: F.display, color: C.ink }}
          >
            404
          </h1>
          <h2 className="mt-2 text-[22px]" style={{ fontFamily: F.display, color: C.ink }}>
            Naligaw ka yata
          </h2>
          <p
            className="mt-2 text-[15px] leading-[22px]"
            style={{ fontFamily: F.body, color: C.mute }}
          >
            The page you are looking for does not exist or has been moved. Head back to Tahanan to
            continue exploring CALABARZON.
          </p>
          <div className="mt-6 w-full">
            <Btn
              label="Go to Tahanan"
              sub="Back to Home"
              color={C.blue}
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
        <Pop className="flex flex-col items-center p-7 text-center" depth={5} radius={12}>
          <Mark size={52} />
          <h1 className="mt-4 text-[26px]" style={{ fontFamily: F.display, color: C.ink }}>
            May nangyaring aberya
          </h1>
          <p
            className="mt-2 text-[15px] leading-[22px]"
            style={{ fontFamily: F.body, color: C.mute }}
          >
            This page could not load right now. Try refreshing or return to the home screen.
          </p>
          <div className="mt-6 w-full space-y-2.5">
            <Btn
              label="Try again"
              color={C.blue}
              onClick={() => {
                router.invalidate();
                reset();
              }}
            />
            <Btn
              label="Go to Tahanan"
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
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Sulyap — CALABARZON Virtual Tour and Cultural Mapping" },
      {
        name: "description",
        content:
          "Walk through the heritage sites of Region IV-A (Cavite, Laguna, Batangas, Rizal, Quezon), take the quiz, and collect passport stamps.",
      },
      { name: "theme-color", content: "#FAF8F1" },
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
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Alfa+Slab+One&family=Figtree:wght@500;700&display=swap",
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

  return (
    <QueryClientProvider client={queryClient}>
      <div
        className="min-h-screen pb-20 md:pb-0"
        style={{ backgroundColor: C.paper, color: C.ink }}
      >
        {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
        <Outlet />
      </div>
      <Toaster />
    </QueryClientProvider>
  );
}
