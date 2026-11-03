import { createFileRoute } from "@tanstack/react-router";

/**
 * Image proxy. The destination-images storage bucket is private (public
 * buckets are blocked by workspace policy), but an access policy lets requests
 * carrying the publishable key read it. Browsers cannot attach an apikey
 * header to <img>, so the app serves images through this same-origin route.
 */
export const Route = createFileRoute("/api/public/images/$")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const splat = params._splat ?? "";
        if (
          !splat.startsWith("destination-images/") ||
          !/^[A-Za-z0-9._/-]+$/.test(splat) ||
          splat.includes("..")
        ) {
          return new Response("Not found", { status: 404 });
        }

        const key = process.env["SUPABASE_PUBLISHABLE_KEY"];
        const base = process.env["SUPABASE_URL"];
        if (!key || !base) {
          return new Response("Server misconfigured", { status: 500 });
        }

        const upstream = await fetch(`${base}/storage/v1/object/${splat}`, {
          headers: { apikey: key },
        });
        if (!upstream.ok) {
          return new Response("Not found", { status: upstream.status });
        }

        const headers = new Headers();
        headers.set(
          "content-type",
          upstream.headers.get("content-type") ?? "application/octet-stream",
        );
        headers.set(
          "cache-control",
          "public, max-age=86400, stale-while-revalidate=604800",
        );
        return new Response(upstream.body, { status: 200, headers });
      },
    },
  },
});
