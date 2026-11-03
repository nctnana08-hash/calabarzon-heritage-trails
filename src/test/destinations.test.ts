import { describe, expect, it } from "vitest";

import {
  CATEGORIES,
  PROVINCES,
  filterDestinations,
  imageUrl,
  slugify,
  type Destination,
} from "@/lib/destinations";

const row = (over: Partial<Destination>): Destination => ({
  id: "id",
  slug: "test",
  name: "Test Site",
  description: "An old church and shrine",
  address: "Some street",
  province: "Laguna",
  category: "Historical Shrines",
  image_path: null,
  latitude: null,
  longitude: null,
  featured: false,
  created_at: "2026-01-01T00:00:00Z",
  updated_at: "2026-01-01T00:00:00Z",
  ...over,
});

describe("destination data rules", () => {
  it("covers exactly the five CALABARZON provinces", () => {
    expect([...PROVINCES]).toEqual(["Cavite", "Laguna", "Batangas", "Rizal", "Quezon"]);
  });

  it("covers the four heritage categories", () => {
    expect([...CATEGORIES]).toEqual([
      "Historical Shrines",
      "Religious Landmarks",
      "Museums",
      "Natural Heritage",
    ]);
  });

  it("filters by category, province, and search text", () => {
    const data = [
      row({ id: "1", name: "Rizal Shrine", province: "Laguna", category: "Historical Shrines" }),
      row({ id: "2", name: "Taal Basilica", province: "Batangas", category: "Religious Landmarks" }),
      row({ id: "3", name: "Taal Volcano", province: "Batangas", category: "Natural Heritage" }),
    ];

    expect(filterDestinations(data, { category: "Religious Landmarks" })).toHaveLength(1);
    expect(filterDestinations(data, { province: "Batangas" })).toHaveLength(2);
    expect(filterDestinations(data, { q: "taal" })).toHaveLength(2);
    expect(
      filterDestinations(data, { province: "Batangas", category: "Natural Heritage" }),
    ).toHaveLength(1);
    expect(filterDestinations(data, { q: "Rizal" })).toHaveLength(1);
    expect(filterDestinations(data, { q: "nomatch" })).toHaveLength(0);
  });

  it("builds proxied image URLs from the stored path", () => {
    expect(
      imageUrl({ image_path: "taal-volcano.jpg", updated_at: "2026-01-01T00:00:00Z" }),
    ).toBe("/api/public/images/destination-images/taal-volcano.jpg?v=2026-01-01T00%3A00%3A00Z");
    expect(imageUrl({ image_path: null, updated_at: "x" })).toBeNull();
  });

  it("slugifies destination names", () => {
    expect(slugify("Minor Basilica of St. Martin de Tours")).toBe(
      "minor-basilica-of-st-martin-de-tours",
    );
  });
});
