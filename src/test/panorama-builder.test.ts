import { describe, expect, it } from "vitest";

import {
  convertDynamicTourToKrpanoScenes,
  screenToSpherical,
  validatePanoramaDimensions,
  type PanoramaTour,
} from "@/lib/panorama-builder";

describe("dynamic panorama builder helpers", () => {
  it("accepts standard equirectangular ratios and rejects ordinary photos", () => {
    expect(validatePanoramaDimensions(8000, 4000).valid).toBe(true);
    expect(validatePanoramaDimensions(1200, 1200).valid).toBe(false);
  });

  it("maps the center of the viewer to the current camera direction", () => {
    expect(screenToSpherical(500, 250, 1000, 500, { hlookat: 35, vlookat: 8, fov: 80 })).toEqual({
      ath: 35,
      atv: 8,
    });
  });

  it("converts saved artwork and room links to viewer scenes", () => {
    const tour: PanoramaTour = {
      id: "tour-1",
      destination_slug: "sample",
      title: "Sample Tour",
      description: "",
      status: "published",
      created_by: "admin-1",
      created_at: "2026-01-01T00:00:00Z",
      updated_at: "2026-01-01T00:00:00Z",
      scenes: [
        {
          id: "scene-1",
          tour_id: "tour-1",
          title: "Gallery",
          location_label: "Ground Floor",
          original_image_path: "tours/tour-1/scenes/scene-1/original.jpg",
          preview_image_path: "tours/tour-1/scenes/scene-1/preview.webp",
          tile_configuration: {},
          initial_view: { hlookat: 0, vlookat: 0, fov: 80 },
          display_order: 0,
          status: "active",
          created_at: "2026-01-01T00:00:00Z",
          hotspots: [
            {
              id: "hotspot-1",
              scene_id: "scene-1",
              hotspot_type: "art",
              title: "Artifact",
              bearing: 12,
              pitch: -4,
              target_scene_id: null,
              display_order: 0,
              metadata: {},
              artwork: {
                id: "art-1",
                scene_id: "scene-1",
                hotspot_id: "hotspot-1",
                title: "Artifact",
                description: "A saved artifact.",
                display_order: 0,
                status: "published",
                image_path: "tours/tour-1/art.jpg",
              },
            },
          ],
        },
      ],
    };

    const [scene] = convertDynamicTourToKrpanoScenes(tour, []);
    expect(scene?.panoramaUrl).toBe(
      "/api/public/images/panorama-assets/tours/tour-1/scenes/scene-1/original.jpg",
    );
    expect(scene?.hotspots[0]?.targetSceneId).toBeUndefined();
    expect(scene?.hotspots[0]?.artDetails?.description).toBe("A saved artifact.");
  });
});
