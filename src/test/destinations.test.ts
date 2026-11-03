import { beforeEach, describe, expect, it } from "vitest";

import {
  CATEGORIES,
  PROVINCES,
  filterDestinations,
  imageUrl,
  slugify,
  type Destination,
} from "@/lib/destinations";
import {
  FALLBACK_DESTINATIONS,
  clearAllProgressForTests,
  deleteDestinationProgress,
  generateQuestionsForDestination,
  getEnrichment,
  getProgress,
  getQuestionsForDestination,
  listProgress,
  markToured,
  saveScore,
} from "@/lib/sulyap-data";
import { getArtPieces360 } from "@/lib/sulyap-art-360";
import { C, CATS, getCategoryMeta, onColor } from "@/lib/sulyap-theme";

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

describe("destination data rules & Sulyap milestones", () => {
  beforeEach(() => {
    clearAllProgressForTests();
  });

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
      row({
        id: "2",
        name: "Taal Basilica",
        province: "Batangas",
        category: "Religious Landmarks",
      }),
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
    expect(imageUrl({ image_path: "taal-volcano.jpg", updated_at: "2026-01-01T00:00:00Z" })).toBe(
      "/api/public/images/destination-images/taal-volcano.jpg?v=2026-01-01T00%3A00%3A00Z",
    );
    expect(imageUrl({ image_path: null, updated_at: "x" })).toBeNull();
  });

  it("slugifies destination names", () => {
    expect(slugify("Minor Basilica of St. Martin de Tours")).toBe(
      "minor-basilica-of-st-martin-de-tours",
    );
  });

  it("enforces Sulyap design tokens and contrast rule (gold uses ink text)", () => {
    expect(onColor(C.gold)).toBe(C.ink);
    expect(onColor(C.blue)).toBe("#FFFFFF");
    expect(onColor(C.red)).toBe("#FFFFFF");
    expect(onColor(C.green)).toBe("#FFFFFF");
    expect(CATS.Museum.deep).toBe("#8F6200");
    expect(getCategoryMeta("Historical Shrines").fil).toBe("Pamana");
    expect(getCategoryMeta("Religious Landmarks").fil).toBe("Simbahan");
    expect(getCategoryMeta("Museums").fil).toBe("Museo");
    expect(getCategoryMeta("Natural Heritage").fil).toBe("Kalikasan");
  });

  it("M3: every seeded destination has description, history, significance, sources, and 4+ quiz questions with explanations", () => {
    expect(FALLBACK_DESTINATIONS.length).toBeGreaterThanOrEqual(12);

    // Every province has at least 2 places
    for (const p of PROVINCES) {
      const count = FALLBACK_DESTINATIONS.filter((d) => d.province === p).length;
      expect(count).toBeGreaterThanOrEqual(2);
    }

    // Every category has at least 2 places
    for (const c of CATEGORIES) {
      const count = FALLBACK_DESTINATIONS.filter((d) => d.category === c).length;
      expect(count).toBeGreaterThanOrEqual(2);
    }

    for (const d of FALLBACK_DESTINATIONS) {
      const enrichment = getEnrichment(d);
      expect(d.description.length).toBeGreaterThan(20);
      expect(enrichment.history.length).toBeGreaterThan(20);
      expect(enrichment.significance.length).toBeGreaterThan(20);
      expect(enrichment.sources.length).toBeGreaterThan(10);

      const qs = getQuestionsForDestination(d);
      expect(qs.length).toBeGreaterThanOrEqual(4);
      for (const q of qs) {
        expect(q.options).toHaveLength(4);
        expect(new Set(q.options).size).toBe(4);
        expect(q.answer).toBeGreaterThanOrEqual(0);
        expect(q.answer).toBeLessThan(4);
        expect(q.explanation.length).toBeGreaterThan(10);
      }
    }
  });

  it("M4: quiz generator produces 4 unique options containing the correct answer", () => {
    const custom = row({
      id: "custom-1",
      slug: "custom-heritage-house",
      name: "Custom Heritage House",
      province: "Quezon",
      category: "Museums",
      address: "Poblacion, Lucban",
    });

    const qs = generateQuestionsForDestination(custom);
    expect(qs).toHaveLength(4);
    for (const q of qs) {
      expect(q.options).toHaveLength(4);
      expect(new Set(q.options).size).toBe(4);
      expect(q.options[q.answer]).toBeDefined();
    }
    expect(qs[0]?.options[qs[0].answer]).toBe("Quezon");
    expect(qs[1]?.options[qs[1].answer]).toBe("Museums");
  });

  it("M4: saveScore tracks best = max, attempts + 1, last score, and deleteDestinationProgress cascades", () => {
    markToured("dest-1", "aguinaldo-shrine");
    expect(getProgress("aguinaldo-shrine")?.toured).toBe(1);

    saveScore("dest-1", 2, 4, "aguinaldo-shrine");
    let p = getProgress("aguinaldo-shrine");
    expect(p?.best).toBe(2);
    expect(p?.total).toBe(4);
    expect(p?.attempts).toBe(1);
    expect(p?.last).toBe(2);
    expect(p?.toured).toBe(1);

    // Higher score updates best
    saveScore("dest-1", 4, 4, "aguinaldo-shrine");
    p = getProgress("aguinaldo-shrine");
    expect(p?.best).toBe(4);
    expect(p?.attempts).toBe(2);
    expect(p?.last).toBe(4);

    // Lower score keeps best = max(best, score) while updating last and attempts
    saveScore("dest-1", 1, 4, "aguinaldo-shrine");
    p = getProgress("aguinaldo-shrine");
    expect(p?.best).toBe(4);
    expect(p?.attempts).toBe(3);
    expect(p?.last).toBe(1);

    // Cascade delete removes progress row
    deleteDestinationProgress("dest-1", "aguinaldo-shrine");
    expect(getProgress("aguinaldo-shrine")).toBeNull();
    expect(listProgress()).toHaveLength(0);
  });

  it("provides 4 360-degree art pieces and architectural relics with curatorial details for every destination", () => {
    for (const d of FALLBACK_DESTINATIONS) {
      const pieces = getArtPieces360(d);
      expect(pieces).toHaveLength(4);
      for (const p of pieces) {
        expect(p.title.length).toBeGreaterThan(5);
        expect(p.artistOrMaker.length).toBeGreaterThan(3);
        expect(p.medium.length).toBeGreaterThan(5);
        expect(p.details.length).toBeGreaterThan(20);
        expect(p.bearing).toBeGreaterThanOrEqual(0);
        expect(p.bearing).toBeLessThan(360);
      }
    }

    const customPieces = getArtPieces360(
      row({
        id: "custom-art-site",
        slug: "custom-art-site",
        name: "Custom Art Sanctuary",
        province: "Rizal",
        category: "Museums",
      }),
    );
    expect(customPieces).toHaveLength(4);
  });
});
