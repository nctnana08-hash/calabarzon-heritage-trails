export const PROVINCES = ["Cavite", "Laguna", "Batangas", "Rizal", "Quezon"] as const;
export type Province = (typeof PROVINCES)[number];

export const CATEGORIES = [
  "Historical Shrines",
  "Religious Landmarks",
  "Museums",
  "Natural Heritage",
] as const;
export type Category = (typeof CATEGORIES)[number];

export type Destination = {
  id: string;
  slug: string;
  name: string;
  description: string;
  address: string;
  province: string;
  category: string;
  image_path: string | null;
  latitude: number | null;
  longitude: number | null;
  featured: boolean;
  created_at: string;
  updated_at: string;
};

/**
 * Images live in the private `destination-images` storage bucket and are served
 * through the same-origin proxy route /api/public/images. The database stores
 * only the object path — never an absolute storage URL.
 */
export function imageUrl(
  destination: Pick<Destination, "image_path" | "updated_at">,
): string | null {
  if (!destination.image_path) return null;
  return `/api/public/images/destination-images/${destination.image_path}?v=${encodeURIComponent(
    destination.updated_at,
  )}`;
}

export function filterDestinations(
  destinations: Destination[],
  filters: { q?: string; category?: string; province?: string },
): Destination[] {
  const q = filters.q?.trim().toLowerCase();
  return destinations.filter((d) => {
    if (filters.category && d.category !== filters.category) return false;
    if (filters.province && d.province !== filters.province) return false;
    if (q) {
      const haystack = `${d.name} ${d.address} ${d.province} ${d.description} ${d.category}`.toLowerCase();
      if (!haystack.includes(q)) return false;
    }
    return true;
  });
}

export function slugify(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}
