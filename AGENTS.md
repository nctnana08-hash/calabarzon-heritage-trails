<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

# Project decisions
- Phase 1 destinations CRUD is intentionally public (anon-writable RLS on public.destinations); add auth gating before publish if the app leaves the classroom prototype stage.
- Destination images: private storage bucket `destination-images`; DB stores only image_path; images are served via the same-origin proxy /api/public/images (public buckets are blocked by workspace policy).
- Seed rows for CALABARZON sites live in drizzle/migrations/0000_create_destinations.sql as literal INSERTs; do not seed on page load.
- The cultural map uses react-leaflet, loaded client-side only via React.lazy inside src/components/map-view.tsx; never import Leaflet from an SSR route module.
