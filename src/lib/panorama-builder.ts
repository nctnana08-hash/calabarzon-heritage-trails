import { supabase } from "@/integrations/supabase/client";
import {
  DEFAULT_MUSEUM_SCENES,
  type KrpanoArtDetails,
  type EightTileTuple,
  type KrpanoHotspot,
  type KrpanoHotspotKind,
  type KrpanoSceneConfig,
} from "./krpano-scenes";

export type PanoramaTourStatus = "draft" | "published" | "archived";
export type PanoramaSceneStatus = "active" | "draft" | "archived";
export type PanoramaHotspotKind = "art" | "door" | "stairs-up" | "stairs-down" | "info" | "path";

export interface PanoramaTour {
  id: string;
  destination_id?: string | null;
  destination_slug: string;
  title: string;
  description: string;
  cover_image_path?: string | null;
  status: PanoramaTourStatus;
  created_by: string;
  created_at: string;
  updated_at: string;
  scenes?: PanoramaScene[];
}

export interface PanoramaScene {
  id: string;
  tour_id: string;
  title: string;
  location_label: string;
  original_image_path: string;
  preview_image_path?: string | null;
  tile_configuration: {
    tileUrls?: string[];
    gridTileUrls?: string[];
    isUltraHd16k?: boolean;
    isUltraHd12k?: boolean;
    tilePadFrac?: number;
    tilePadFracY?: number;
    tilePixelSize?: [number, number];
    nativeWidth?: number;
    nativeHeight?: number;
  };
  initial_view: {
    hlookat: number;
    vlookat: number;
    fov: number;
  };
  display_order: number;
  status: PanoramaSceneStatus;
  created_at: string;
  hotspots?: PanoramaHotspot[];
}

export interface PanoramaHotspot {
  id: string;
  scene_id: string;
  hotspot_type: PanoramaHotspotKind;
  title: string;
  subtitle?: string;
  bearing: number; // ath: -180.0 to 180.0 degrees
  pitch: number; // atv: -90.0 to 90.0 degrees
  target_scene_id?: string | null;
  display_order: number;
  metadata: {
    badge?: string;
    accentColor?: string;
    lookAtAth?: number;
    lookAtAtv?: number;
    fov?: number;
    arrivalView?: { ath: number; atv: number; fov?: number };
    pathOrder?: number;
  };
  artwork?: PanoramaArtwork | null;
  created_at?: string;
}

export interface PanoramaArtwork {
  id: string;
  scene_id: string;
  hotspot_id?: string | null;
  title: string;
  filipino_title?: string;
  artist?: string;
  historical_period?: string;
  medium?: string;
  dimensions?: string;
  description: string;
  historical_significance?: string;
  conservation_notes?: string;
  image_path?: string | null;
  display_order: number;
  status: "draft" | "published" | "archived";
  created_at?: string;
  updated_at?: string;
}

const PANORAMA_BUCKET = "panorama-assets";

export function panoramaAssetUrl(path: string | null | undefined): string | undefined {
  if (!path) return undefined;
  if (/^(?:https?:|data:|blob:|\/)/.test(path)) return path;
  return `/api/public/images/${PANORAMA_BUCKET}/${path}`;
}

/**
 * Converts a 2D screen coordinate (e.g. from canvas click) into exact
 * spherical equirectangular coordinates (ath = azimuth/yaw in degrees, atv = pitch in degrees).
 */
export function screenToSpherical(
  screenX: number,
  screenY: number,
  viewportWidth: number,
  viewportHeight: number,
  cam: { hlookat: number; vlookat: number; fov: number },
): { ath: number; atv: number } {
  if (viewportWidth <= 0 || viewportHeight <= 0) {
    return { ath: cam.hlookat, atv: cam.vlookat };
  }

  const aspect = viewportWidth / viewportHeight;
  const tanHalfFov =
    aspect > 0 && aspect < 1
      ? Math.tan((cam.fov * Math.PI) / 360) * Math.pow(1 / Math.max(aspect, 0.42), 0.62)
      : Math.tan((cam.fov * Math.PI) / 360);

  // Normalized Device Coordinates (-1..1)
  const nx = (2 * screenX) / viewportWidth - 1;
  const ny = 1 - (2 * screenY) / viewportHeight;

  // Ray in camera coordinate space
  const xc = nx * aspect * tanHalfFov;
  const yc = ny * tanHalfFov;
  const zc = 1.0;

  // Camera orientation basis vectors
  const psi = (cam.hlookat * Math.PI) / 180;
  const theta = (cam.vlookat * Math.PI) / 180;
  const cosT = Math.cos(theta);
  const sinT = Math.sin(theta);
  const cosP = Math.cos(psi);
  const sinP = Math.sin(psi);

  const Fvec: [number, number, number] = [cosT * sinP, sinT, cosT * cosP];
  const Rvec: [number, number, number] = [cosP, 0, -sinP];
  const Uvec: [number, number, number] = [-sinT * sinP, cosT, -sinT * cosP];

  // World ray vector
  const Vx = xc * Rvec[0] + yc * Uvec[0] + zc * Fvec[0];
  const Vy = xc * Rvec[1] + yc * Uvec[1] + zc * Fvec[1];
  const Vz = xc * Rvec[2] + yc * Uvec[2] + zc * Fvec[2];

  const len = Math.hypot(Vx, Vy, Vz);
  if (len === 0) return { ath: 0, atv: 0 };

  const normY = Math.max(-1, Math.min(1, Vy / len));
  const beta = Math.asin(normY);
  const alpha = Math.atan2(Vx, Vz);

  const atvDeg = Math.round(((beta * 180) / Math.PI) * 10) / 10;
  let athDeg = Math.round(((alpha * 180) / Math.PI) * 10) / 10;

  while (athDeg > 180) athDeg -= 360;
  while (athDeg < -180) athDeg += 360;

  return { ath: athDeg, atv: atvDeg };
}

/**
 * Generates an optimized WebP preview data URL from an uploaded panorama image.
 * Uses client-side canvas downsampling (2048x1024) so mobile devices load zero-lag preview spheres.
 */
export async function generatePanoramaPreview(file: File | Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      const canvas = document.createElement("canvas");
      canvas.width = 2048;
      canvas.height = 1024;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        resolve(url);
        return;
      }
      ctx.drawImage(img, 0, 0, 2048, 1024);
      resolve(canvas.toDataURL("image/webp", 0.82));
    };
    img.onerror = (e) => {
      URL.revokeObjectURL(url);
      reject(e);
    };
    img.src = url;
  });
}

/**
 * Validates equirectangular 2:1 aspect ratio with reasonable tolerance.
 */
export function validatePanoramaDimensions(
  width: number,
  height: number,
): { valid: boolean; ratio: number; message: string } {
  if (width <= 0 || height <= 0) {
    return { valid: false, ratio: 0, message: "Invalid image dimensions." };
  }
  const ratio = width / height;
  const isApprox2To1 = ratio >= 1.8 && ratio <= 2.2;
  if (!isApprox2To1) {
    return {
      valid: false,
      ratio,
      message: `Aspect ratio is ${ratio.toFixed(2)}:1. Standard 360° panoramas must be approximately 2:1 (e.g. 4096×2048, 8000×4000, 12000×6000, or 16000×8000).`,
    };
  }
  return {
    valid: true,
    ratio,
    message: `Valid equirectangular panorama (${width} × ${height}, ratio ${ratio.toFixed(2)}:1).`,
  };
}

/**
 * Converts dynamic database records (Tour & Scenes) into KrpanoSceneConfig structures
 * compatible with the existing KrpanoViewer.
 */
export function convertDynamicTourToKrpanoScenes(
  tour: PanoramaTour,
  fallbackScenes: KrpanoSceneConfig[] = DEFAULT_MUSEUM_SCENES,
): KrpanoSceneConfig[] {
  if (!tour.scenes || tour.scenes.length === 0) {
    return fallbackScenes;
  }

  return tour.scenes.map((scene, idx) => {
    const hotspots: KrpanoHotspot[] = (scene.hotspots ?? []).map((hs) => {
      let artDetails: KrpanoArtDetails | undefined = undefined;
      if (hs.artwork) {
        artDetails = {
          imageUrl: panoramaAssetUrl(hs.artwork.image_path),
          filTitle: hs.artwork.filipino_title ?? undefined,
          artist: hs.artwork.artist ?? undefined,
          period: hs.artwork.historical_period || "Heritage Era",
          medium: hs.artwork.medium || "Mixed Medium",
          dimensions: hs.artwork.dimensions ?? undefined,
          zone: scene.location_label || "Gallery",
          description: hs.artwork.description,
          conservationNote: hs.artwork.conservation_notes ?? undefined,
          highlight: hs.artwork.historical_significance ?? undefined,
        };
      }

      return {
        id: hs.id,
        kind: hs.hotspot_type as KrpanoHotspotKind,
        title: hs.title,
        subtitle: hs.subtitle,
        badge:
          hs.metadata.badge ??
          (hs.hotspot_type === "door"
            ? "🚪"
            : hs.hotspot_type === "stairs-up"
              ? "🪜"
              : hs.hotspot_type === "stairs-down"
                ? "🪜"
                : "🏛️"),
        ath: Number(hs.bearing),
        atv: Number(hs.pitch),
        lookAtAth: hs.metadata.lookAtAth ?? Number(hs.bearing),
        lookAtAtv: hs.metadata.lookAtAtv ?? Number(hs.pitch),
        fov: hs.metadata.fov ?? 55,
        accentColor: hs.metadata.accentColor,
        targetSceneId: hs.target_scene_id ?? undefined,
        arrivalView: hs.metadata.arrivalView,
        pathOrder: hs.metadata.pathOrder,
        artDetails,
      };
    });

    return {
      id: scene.id,
      name: `scene_${tour.id}_${scene.id}`,
      shortLabel: scene.location_label || `Room ${idx + 1}`,
      floorLabel: scene.location_label || `Area ${idx + 1}`,
      title: scene.title,
      panoramaUrl: panoramaAssetUrl(scene.original_image_path) ?? scene.original_image_path,
      previewUrl: panoramaAssetUrl(scene.preview_image_path),
      tileUrls:
        scene.tile_configuration.tileUrls?.length === 4
          ? (scene.tile_configuration.tileUrls.map((url) => panoramaAssetUrl(url) ?? url) as [
              string,
              string,
              string,
              string,
            ])
          : undefined,
      gridTileUrls:
        scene.tile_configuration.gridTileUrls?.length === 8
          ? (scene.tile_configuration.gridTileUrls.map(
              (url) => panoramaAssetUrl(url) ?? url,
            ) as EightTileTuple)
          : undefined,
      tilePadFrac: scene.tile_configuration.tilePadFrac,
      tilePadFracY: scene.tile_configuration.tilePadFracY,
      tilePixelSize: scene.tile_configuration.tilePixelSize,
      nativeWidth: scene.tile_configuration.nativeWidth,
      nativeHeight: scene.tile_configuration.nativeHeight,
      isUltraHd16k: scene.tile_configuration.isUltraHd16k,
      isUltraHd12k: scene.tile_configuration.isUltraHd12k,
      initialHlookat: scene.initial_view.hlookat ?? 0,
      initialVlookat: scene.initial_view.vlookat ?? 0,
      initialFov: scene.initial_view.fov ?? 80,
      hotspots,
    };
  });
}

type TourQueryRow = Omit<PanoramaTour, "scenes"> & {
  scenes?: Array<
    Omit<PanoramaScene, "hotspots"> & {
      hotspots?: Array<Omit<PanoramaHotspot, "artwork"> & { artwork?: PanoramaArtwork[] }>;
    }
  >;
};

const TOUR_SELECT =
  "*, scenes:panorama_scenes(*, hotspots:panorama_hotspots(*, artwork:panorama_artworks(*)))";

function normalizeTour(row: TourQueryRow): PanoramaTour {
  return {
    ...row,
    scenes: (row.scenes ?? [])
      .map((scene) => ({
        ...scene,
        tile_configuration: scene.tile_configuration ?? {},
        initial_view: scene.initial_view ?? { hlookat: 0, vlookat: 0, fov: 80 },
        hotspots: (scene.hotspots ?? [])
          .map((hotspot) => ({
            ...hotspot,
            metadata: hotspot.metadata ?? {},
            artwork: hotspot.artwork?.[0] ?? null,
          }))
          .sort((a, b) => a.display_order - b.display_order),
      }))
      .sort((a, b) => a.display_order - b.display_order),
  };
}

function throwIfError(error: { message: string } | null): void {
  if (error) throw new Error(error.message);
}

export async function getToursForDestination(destinationSlug: string): Promise<PanoramaTour[]> {
  const { data, error } = await supabase
    .from("panorama_tours")
    .select(TOUR_SELECT)
    .eq("destination_slug", destinationSlug)
    .eq("status", "published")
    .order("created_at", { ascending: false });
  throwIfError(error);
  return ((data ?? []) as unknown as TourQueryRow[]).map(normalizeTour);
}

export async function getAllTours(): Promise<PanoramaTour[]> {
  const { data, error } = await supabase
    .from("panorama_tours")
    .select(TOUR_SELECT)
    .order("created_at", { ascending: false });
  throwIfError(error);
  return ((data ?? []) as unknown as TourQueryRow[]).map(normalizeTour);
}

function dataUrlToBlob(dataUrl: string): Blob {
  const [header = "", encoded = ""] = dataUrl.split(",", 2);
  const mime = /data:([^;]+)/.exec(header)?.[1] ?? "image/webp";
  const bytes = Uint8Array.from(atob(encoded), (character) => character.charCodeAt(0));
  return new Blob([bytes], { type: mime });
}

export async function uploadPanoramaAssets(
  tourId: string,
  sceneId: string,
  file: File,
  onStage?: (stage: "validating" | "preview" | "tiles" | "original" | "complete") => void,
): Promise<{
  originalPath: string;
  previewPath: string;
  width: number;
  height: number;
  gridTilePaths?: EightTileTuple;
}> {
  if (!["image/jpeg", "image/webp"].includes(file.type)) {
    throw new Error("Choose a JPG, JPEG, or WebP panorama image.");
  }
  if (file.size > 50 * 1024 * 1024) {
    throw new Error("Panorama images must be 50 MB or smaller.");
  }

  onStage?.("validating");
  const dimensions = await new Promise<{ width: number; height: number }>((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      URL.revokeObjectURL(url);
      resolve({ width: image.naturalWidth, height: image.naturalHeight });
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("The selected image could not be read."));
    };
    image.src = url;
  });

  const validation = validatePanoramaDimensions(dimensions.width, dimensions.height);
  if (!validation.valid) throw new Error(validation.message);

  const extension = file.type === "image/webp" ? "webp" : "jpg";
  const basePath = `tours/${tourId}/scenes/${sceneId}`;
  const originalPath = `${basePath}/original.${extension}`;
  const previewPath = `${basePath}/preview.webp`;

  onStage?.("preview");
  const preview = dataUrlToBlob(await generatePanoramaPreview(file));
  const { error: previewError } = await supabase.storage
    .from(PANORAMA_BUCKET)
    .upload(previewPath, preview, { contentType: "image/webp", upsert: true });
  throwIfError(previewError);

  let gridTilePaths: EightTileTuple | undefined;
  if (dimensions.width > 8192 || dimensions.height > 4096) {
    onStage?.("tiles");
    const bitmap = await createImageBitmap(file);
    const tileWidth = Math.ceil(dimensions.width / 4);
    const tileHeight = Math.ceil(dimensions.height / 2);
    const paths: string[] = [];
    try {
      for (let row = 0; row < 2; row += 1) {
        for (let column = 0; column < 4; column += 1) {
          const sourceX = column * tileWidth;
          const sourceY = row * tileHeight;
          const sourceWidth = Math.min(tileWidth, dimensions.width - sourceX);
          const sourceHeight = Math.min(tileHeight, dimensions.height - sourceY);
          const canvas = document.createElement("canvas");
          canvas.width = tileWidth;
          canvas.height = tileHeight;
          const context = canvas.getContext("2d");
          if (!context) throw new Error("This browser cannot process panorama tiles.");
          context.drawImage(
            bitmap,
            sourceX,
            sourceY,
            sourceWidth,
            sourceHeight,
            0,
            0,
            sourceWidth,
            sourceHeight,
          );
          const blob = await new Promise<Blob>((resolve, reject) => {
            canvas.toBlob(
              (value) =>
                value ? resolve(value) : reject(new Error("A panorama tile could not be created.")),
              "image/webp",
              0.9,
            );
          });
          const tilePath = `${basePath}/tiles/tile_r${row}_c${column}.webp`;
          const { error } = await supabase.storage
            .from(PANORAMA_BUCKET)
            .upload(tilePath, blob, { contentType: "image/webp", upsert: true });
          throwIfError(error);
          paths.push(tilePath);
        }
      }
    } finally {
      bitmap.close();
    }
    gridTilePaths = paths as EightTileTuple;
  }

  onStage?.("original");
  const { error: originalError } = await supabase.storage
    .from(PANORAMA_BUCKET)
    .upload(originalPath, file, { contentType: file.type, upsert: true });
  throwIfError(originalError);
  onStage?.("complete");

  return {
    originalPath,
    previewPath,
    ...dimensions,
    ...(gridTilePaths ? { gridTilePaths } : {}),
  };
}

export async function uploadArtworkImage(
  tourId: string,
  sceneId: string,
  artworkId: string,
  file: File,
): Promise<string> {
  if (!["image/jpeg", "image/webp", "image/png"].includes(file.type)) {
    throw new Error("Choose a JPG, PNG, or WebP artwork image.");
  }
  if (file.size > 10 * 1024 * 1024) throw new Error("Artwork images must be 10 MB or smaller.");
  const extension = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
  const path = `tours/${tourId}/scenes/${sceneId}/artworks/${artworkId}.${extension}`;
  const { error } = await supabase.storage
    .from(PANORAMA_BUCKET)
    .upload(path, file, { contentType: file.type, upsert: true });
  throwIfError(error);
  return path;
}

export async function saveTour(tour: Partial<PanoramaTour>): Promise<PanoramaTour> {
  const { data: authData } = await supabase.auth.getUser();
  if (!authData.user) throw new Error("Sign in as an administrator before saving a tour.");

  const now = new Date().toISOString();
  const id = tour.id || crypto.randomUUID();
  const fullTour: PanoramaTour = {
    id,
    destination_id: tour.destination_id ?? null,
    destination_slug: tour.destination_slug || "",
    title: tour.title?.trim() || "Untitled Heritage Tour",
    description: tour.description?.trim() || "",
    cover_image_path: tour.cover_image_path ?? null,
    status: tour.status || "draft",
    created_by: authData.user.id,
    created_at: tour.created_at || now,
    updated_at: now,
    scenes: tour.scenes || [],
  };

  if (!fullTour.destination_slug) throw new Error("Choose a heritage destination.");
  if (!fullTour.scenes?.length) throw new Error("Add at least one panorama room before saving.");

  const { error: tourError } = await supabase.from("panorama_tours").upsert({
    id: fullTour.id,
    destination_id: fullTour.destination_id ?? null,
    destination_slug: fullTour.destination_slug,
    title: fullTour.title,
    description: fullTour.description,
    cover_image_path: fullTour.cover_image_path ?? null,
    status: fullTour.status,
    created_by: fullTour.created_by,
    updated_at: fullTour.updated_at,
  });
  throwIfError(tourError);

  const sceneIds = fullTour.scenes.map((scene) => scene.id);
  const { error: sceneError } = await supabase.from("panorama_scenes").upsert(
    fullTour.scenes.map((scene, index) => ({
      id: scene.id,
      tour_id: fullTour.id,
      title: scene.title,
      location_label: scene.location_label,
      original_image_path: scene.original_image_path,
      preview_image_path: scene.preview_image_path ?? null,
      tile_configuration: scene.tile_configuration,
      initial_view: scene.initial_view,
      display_order: index,
      status: fullTour.status === "published" ? "active" : scene.status,
    })),
  );
  throwIfError(sceneError);

  for (const scene of fullTour.scenes) {
    const hotspots = scene.hotspots ?? [];
    const hotspotIds = hotspots.map((hotspot) => hotspot.id);
    if (hotspotIds.length) {
      const { error } = await supabase.from("panorama_hotspots").upsert(
        hotspots.map((hotspot, index) => ({
          id: hotspot.id,
          scene_id: scene.id,
          hotspot_type: hotspot.hotspot_type,
          title: hotspot.title,
          subtitle: hotspot.subtitle ?? "",
          bearing: hotspot.bearing,
          pitch: hotspot.pitch,
          target_scene_id: hotspot.target_scene_id ?? null,
          display_order: index,
          metadata: hotspot.metadata,
        })),
      );
      throwIfError(error);
    }

    const staleHotspots = supabase.from("panorama_hotspots").delete().eq("scene_id", scene.id);
    const { error: staleHotspotError } = hotspotIds.length
      ? await staleHotspots.not("id", "in", `(${hotspotIds.join(",")})`)
      : await staleHotspots;
    throwIfError(staleHotspotError);

    for (const hotspot of hotspots) {
      if (!hotspot.artwork) {
        const { error } = await supabase
          .from("panorama_artworks")
          .delete()
          .eq("hotspot_id", hotspot.id);
        throwIfError(error);
        continue;
      }
      const artwork = hotspot.artwork;
      const { error } = await supabase.from("panorama_artworks").upsert({
        id: artwork.id,
        scene_id: scene.id,
        hotspot_id: hotspot.id,
        title: artwork.title || hotspot.title,
        filipino_title: artwork.filipino_title ?? "",
        artist: artwork.artist ?? "",
        historical_period: artwork.historical_period ?? "",
        medium: artwork.medium ?? "",
        dimensions: artwork.dimensions ?? "",
        description: artwork.description ?? "",
        historical_significance: artwork.historical_significance ?? "",
        conservation_notes: artwork.conservation_notes ?? "",
        image_path: artwork.image_path ?? null,
        display_order: artwork.display_order,
        status: fullTour.status === "published" ? "published" : "draft",
        updated_at: now,
      });
      throwIfError(error);
    }
  }

  const staleScenes = supabase.from("panorama_scenes").delete().eq("tour_id", fullTour.id);
  const { error: staleSceneError } = sceneIds.length
    ? await staleScenes.not("id", "in", `(${sceneIds.join(",")})`)
    : await staleScenes;
  throwIfError(staleSceneError);

  return fullTour;
}

export async function deleteTour(tourId: string): Promise<void> {
  const storagePrefix = `tours/${tourId}`;
  const storedFiles: string[] = [];
  const collectFiles = async (prefix: string): Promise<void> => {
    const { data, error } = await supabase.storage.from(PANORAMA_BUCKET).list(prefix, {
      limit: 1000,
    });
    throwIfError(error);
    for (const entry of data ?? []) {
      const path = `${prefix}/${entry.name}`;
      if (entry.id) storedFiles.push(path);
      else await collectFiles(path);
    }
  };
  await collectFiles(storagePrefix);

  const { error } = await supabase.from("panorama_tours").delete().eq("id", tourId);
  throwIfError(error);
  if (storedFiles.length) {
    const { error: storageError } = await supabase.storage
      .from(PANORAMA_BUCKET)
      .remove(storedFiles);
    if (storageError) {
      console.warn("Tour data was deleted, but some stored files may remain", storageError);
    }
  }
}
