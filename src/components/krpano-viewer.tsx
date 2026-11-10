import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowUpDown,
  Check,
  ChevronLeft,
  ChevronRight,
  Code2,
  Compass,
  Copy,
  DoorOpen,
  Eye,
  EyeOff,
  Footprints,
  Maximize2,
  Minimize2,
  MoveDown,
  MoveLeft,
  MoveRight,
  MoveUp,
  RotateCcw,
  RotateCw,
  Sparkles,
  X,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import {
  DEFAULT_MUSEUM_SCENES,
  GRAND_16K_PANO_URL,
  buildKrpanoXml,
  type KrpanoHotspot,
  type KrpanoSceneConfig,
} from "@/lib/krpano-scenes";
import { C, F } from "@/lib/sulyap-theme";

type CameraState = {
  hlookat: number;
  vlookat: number;
  fov: number;
};

type LookToAnimation = {
  startH: number;
  startV: number;
  startFov: number;
  targetH: number;
  targetV: number;
  targetFov: number;
  startTime: number;
  duration: number;
};

type CachedRoomEntry = {
  mode: 1 | 2;
  preview?: ImageBitmap;
  tiles: ImageBitmap[];
  padFracX: number;
  padFracY: number;
  tilePixelSize: [number, number];
  w: number;
  h: number;
};

// Module-level off-main-thread decoded ImageBitmap cache (instant 0ms room switching!)
const ROOM_BITMAP_CACHE = new Map<string, CachedRoomEntry>();

function nextAnimationFrame(): Promise<void> {
  return new Promise((resolve) => {
    if (typeof window !== "undefined" && typeof window.requestAnimationFrame === "function") {
      window.requestAnimationFrame(() => resolve());
    } else {
      setTimeout(resolve, 0);
    }
  });
}

async function fetchBitmap(
  url: string,
  signal?: AbortSignal,
): Promise<ImageBitmap | HTMLImageElement> {
  if (typeof window !== "undefined" && typeof window.createImageBitmap === "function") {
    const res = await fetch(url, { signal, cache: "force-cache" });
    if (!res.ok) throw new Error(`Failed to fetch ${url}`);
    const blob = await res.blob();
    return await window.createImageBitmap(blob, {
      premultiplyAlpha: "none",
      colorSpaceConversion: "default",
    });
  }
  return await new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Failed image ${url}`));
    img.src = url;
  });
}

function wrapDeg180(deg: number): number {
  let d = ((((deg + 180) % 360) + 360) % 360) - 180;
  if (d === -180) d = 180;
  return d;
}

function wrapDeg360(deg: number): number {
  return ((deg % 360) + 360) % 360;
}

function shortestAngleDelta(target: number, current: number): number {
  return ((target - current + 540) % 360) - 180;
}

function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v));
}

function cardinalDirection(deg: number): string {
  const dirs = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
  const norm = wrapDeg360(deg);
  return dirs[Math.round(norm / 45) % 8] ?? "N";
}

function computeCameraBasis(hlookatDeg: number, vlookatDeg: number) {
  const psi = (hlookatDeg * Math.PI) / 180;
  const theta = (vlookatDeg * Math.PI) / 180;
  const cosT = Math.cos(theta);
  const sinT = Math.sin(theta);
  const cosP = Math.cos(psi);
  const sinP = Math.sin(psi);

  const Fvec: [number, number, number] = [cosT * sinP, sinT, cosT * cosP];
  const Rvec: [number, number, number] = [cosP, 0, -sinP];
  const Uvec: [number, number, number] = [-sinT * sinP, cosT, -sinT * cosP];

  return { Rvec, Uvec, Fvec };
}

/**
 * krpano-style Max-FOV (MFOV) portrait compensation:
 * On portrait mobile screens (aspect < 1), locking FOV strictly to the vertical axis
 * shrinks horizontal FOV into a narrow ~40° "tunnel vision" slice. Boosting tanHalfFov
 * proportionally when aspect < 1 restores a wide, natural full-room 360° view on any phone
 * while keeping 3D hotspot and floor-step projection 100% aligned with WebGL shader rays.
 */
function computeEffectiveTanHalfFov(fovDeg: number, aspect: number): number {
  const base = Math.tan((fovDeg * Math.PI) / 360);
  if (aspect > 0 && aspect < 1) {
    return base * Math.pow(1 / Math.max(aspect, 0.42), 0.62);
  }
  return base;
}

function projectHotspotToScreen(
  athDeg: number,
  atvDeg: number,
  cam: CameraState,
  width: number,
  height: number,
): { x: number; y: number; visible: boolean; depth: number } {
  if (width <= 0 || height <= 0) {
    return { x: 0, y: 0, visible: false, depth: 0 };
  }
  const alpha = (athDeg * Math.PI) / 180;
  const beta = (atvDeg * Math.PI) / 180;
  const cosB = Math.cos(beta);
  const P: [number, number, number] = [
    cosB * Math.sin(alpha),
    Math.sin(beta),
    cosB * Math.cos(alpha),
  ];

  const { Rvec, Uvec, Fvec } = computeCameraBasis(cam.hlookat, cam.vlookat);

  const zc = P[0] * Fvec[0] + P[1] * Fvec[1] + P[2] * Fvec[2];
  if (zc <= 0.08) {
    return { x: 0, y: 0, visible: false, depth: zc };
  }

  const xc = P[0] * Rvec[0] + P[1] * Rvec[1] + P[2] * Rvec[2];
  const yc = P[0] * Uvec[0] + P[1] * Uvec[1] + P[2] * Uvec[2];

  const aspect = width / height;
  const tanHalfFov = computeEffectiveTanHalfFov(cam.fov, aspect);

  const nx = xc / (zc * aspect * tanHalfFov);
  const ny = yc / (zc * tanHalfFov);

  if (Math.abs(nx) > 1.22 || Math.abs(ny) > 1.22) {
    return { x: 0, y: 0, visible: false, depth: zc };
  }

  const x = (nx + 1) * 0.5 * width;
  const y = (1 - ny) * 0.5 * height;
  return { x, y, visible: true, depth: zc };
}

const VERTEX_SHADER_SRC = `
attribute vec2 a_position;
varying vec2 v_ndc;
void main() {
  v_ndc = a_position;
  gl_Position = vec4(a_position, 0.0, 1.0);
}
`;

/**
 * True 16K (16,000 × 8,000) 8-Tile (4×2 Hemisphere Grid) + 4-Sector WebGL Spherical Shader:
 * - Strictly 8 texture samplers (u_tex0..u_tex7) to satisfy 100% of WebGL1/2 hardware limits.
 * - C2-continuous Quintic Hermite sub-texel spline filtering (eliminates bilinear boxiness on zoom).
 * - Contrast-Adaptive Sharpening (CAS) for silky-smooth, zero-blur architectural clarity.
 */
const FRAGMENT_SHADER_SRC = `
precision highp float;
varying vec2 v_ndc;

uniform sampler2D u_tex0;
uniform sampler2D u_tex1;
uniform sampler2D u_tex2;
uniform sampler2D u_tex3;
uniform sampler2D u_tex4;
uniform sampler2D u_tex5;
uniform sampler2D u_tex6;
uniform sampler2D u_tex7;

uniform vec3 u_camF;
uniform vec3 u_camR;
uniform vec3 u_camU;
uniform float u_tanHalfFov;
uniform float u_aspect;
uniform float u_padFracX;
uniform float u_padFracY;
uniform vec2 u_tilePixelSize;
uniform vec2 u_texelStep;
uniform float u_sharpness;
uniform float u_tileMode;

const float PI = 3.14159265358979323846;

vec2 smoothSubTexel(vec2 tuv, vec2 dims) {
  vec2 p = tuv * dims - 0.5;
  vec2 i = floor(p);
  vec2 f = p - i;
  vec2 sf = f * f * f * (f * (f * 6.0 - 15.0) + 10.0);
  return (i + sf + 0.5) / dims;
}

vec3 sampleSphere(vec2 uv) {
  float u = fract(uv.x);
  float v = clamp(uv.y, 0.0004, 0.9996);

  // Mode 0: Instant <35ms 2048x1024 Preview Sphere in u_tex0
  if (u_tileMode < 0.5) {
    vec2 puv = smoothSubTexel(vec2(u, v), vec2(2048.0, 1024.0));
    return texture2D(u_tex0, vec2(fract(puv.x), clamp(puv.y, 0.0005, 0.9995))).rgb;
  }

  float scaledX = u * 4.0;
  float col = min(3.0, floor(scaledX));
  float fx = scaledX - col;
  float tileU = u_padFracX + fx * (1.0 - 2.0 * u_padFracX);

  // Mode 1: 4-Sector (4x1) Grid
  if (u_tileMode < 1.5) {
    vec2 tuv = smoothSubTexel(vec2(tileU, v), u_tilePixelSize);
    if (col < 0.5) return texture2D(u_tex0, tuv).rgb;
    if (col < 1.5) return texture2D(u_tex1, tuv).rgb;
    if (col < 2.5) return texture2D(u_tex2, tuv).rgb;
    return texture2D(u_tex3, tuv).rgb;
  }

  // Mode 2: 8-Tile (4x2 Hemisphere Grid) for True 16,000x8,000 (16K) & 12,000x6,000 (12K)
  float scaledY = v * 2.0;
  float row = (scaledY >= 1.0) ? 1.0 : 0.0;
  float fy = scaledY - row;
  float tileV = u_padFracY + fy * (1.0 - 2.0 * u_padFracY);
  vec2 tuv = smoothSubTexel(vec2(tileU, tileV), u_tilePixelSize);

  if (row < 0.5) {
    if (col < 0.5) return texture2D(u_tex0, tuv).rgb;
    if (col < 1.5) return texture2D(u_tex1, tuv).rgb;
    if (col < 2.5) return texture2D(u_tex2, tuv).rgb;
    return texture2D(u_tex3, tuv).rgb;
  } else {
    if (col < 0.5) return texture2D(u_tex4, tuv).rgb;
    if (col < 1.5) return texture2D(u_tex5, tuv).rgb;
    if (col < 2.5) return texture2D(u_tex6, tuv).rgb;
    return texture2D(u_tex7, tuv).rgb;
  }
}

void main() {
  vec3 ray = normalize(
    u_camF +
    (v_ndc.x * u_aspect * u_tanHalfFov) * u_camR +
    (v_ndc.y * u_tanHalfFov) * u_camU
  );

  float lon = atan(ray.x, ray.z);
  float lat = asin(clamp(ray.y, -1.0, 1.0));

  vec2 uv = vec2(fract((lon / (2.0 * PI)) + 0.5), clamp(0.5 - (lat / PI), 0.0004, 0.9996));
  vec3 c = sampleSphere(uv);

  if (u_sharpness > 0.01 && u_tileMode > 0.5) {
    float cosLat = max(0.28, cos(lat));
    vec2 stepUV = vec2(u_texelStep.x / cosLat, u_texelStep.y);

    vec3 n = sampleSphere(uv + vec2(0.0, -stepUV.y));
    vec3 s = sampleSphere(uv + vec2(0.0,  stepUV.y));
    vec3 e = sampleSphere(uv + vec2( stepUV.x, 0.0));
    vec3 w = sampleSphere(uv + vec2(-stepUV.x, 0.0));

    vec3 minRGB = min(min(min(n, s), min(e, w)), c);
    vec3 maxRGB = max(max(max(n, s), max(e, w)), c);
    vec3 amp = sqrt(clamp(min(minRGB, 1.0 - maxRGB) / max(maxRGB, vec3(0.0001)), 0.0, 1.0));
    vec3 weight = -amp / mix(9.0, 5.2, u_sharpness);

    vec3 sharpened = clamp(
      (c + (n + s + e + w) * weight) / (1.0 + 4.0 * weight),
      0.0,
      1.0
    );
    gl_FragColor = vec4(sharpened, 1.0);
  } else {
    gl_FragColor = vec4(c, 1.0);
  }
}
`;

function createShader(gl: WebGLRenderingContext, type: number, source: string): WebGLShader | null {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

type GlHandle = {
  gl: WebGLRenderingContext;
  textures: (WebGLTexture | null)[];
  maxAniso: number;
  anisoExt: EXT_texture_filter_anisotropic | null;
  maxTexSize: number;
  padFracX: number;
  padFracY: number;
  tilePixelSize: [number, number];
  texelStep: [number, number];
  tileMode: number;
};

export function KrpanoViewer({
  panoramaUrl,
  fallbackPanoramaUrl = GRAND_16K_PANO_URL,
  sceneName = "scene_sulyap_grand_pavilion_16k",
  sceneTitle = "SulyapPH 16K Living Heritage Pavilion",
  scenes = DEFAULT_MUSEUM_SCENES,
  activeSceneId,
  onSceneChange,
  hotspots,
  selectedHotspotId,
  onSelectHotspot,
  initialHlookat = 0,
  initialVlookat = 1,
  initialFov = 80,
  targetView,
  autoRotateDefault = false,
  heightClass = "h-[400px] sm:h-[510px]",
  children,
}: {
  panoramaUrl?: string;
  fallbackPanoramaUrl?: string;
  sceneName?: string;
  sceneTitle?: string;
  scenes?: KrpanoSceneConfig[];
  activeSceneId?: string;
  onSceneChange?: (sceneId: string) => void;
  hotspots?: KrpanoHotspot[];
  selectedHotspotId?: string;
  onSelectHotspot?: (hotspot: KrpanoHotspot) => void;
  initialHlookat?: number;
  initialVlookat?: number;
  initialFov?: number;
  targetView?: {
    ath: number;
    atv: number;
    fov?: number;
    sceneId?: string;
    openHotspotId?: string;
    key?: string | number;
  } | null;
  autoRotateDefault?: boolean;
  heightClass?: string;
  children?: React.ReactNode;
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const glHandleRef = useRef<GlHandle | null>(null);

  const [internalSceneId, setInternalSceneId] = useState<string>(
    activeSceneId ?? scenes[0]?.id ?? "grand16k",
  );
  const currentSceneId = activeSceneId ?? internalSceneId;
  const activeScene = useMemo(
    () => scenes.find((s) => s.id === currentSceneId) ?? scenes[0],
    [scenes, currentSceneId],
  );

  const resolvedPanoUrl = panoramaUrl ?? activeScene?.panoramaUrl ?? GRAND_16K_PANO_URL;
  const resolvedHotspots = useMemo(
    () => hotspots ?? activeScene?.hotspots ?? [],
    [hotspots, activeScene],
  );
  const resolvedFloorPath = useMemo(() => activeScene?.floorPath ?? [], [activeScene]);
  const resolvedSceneName = activeScene?.name ?? sceneName;
  const resolvedSceneTitle = activeScene?.title ?? sceneTitle;

  const [cam, setCam] = useState<CameraState>({
    hlookat: wrapDeg180(activeScene?.initialHlookat ?? initialHlookat),
    vlookat: clamp(activeScene?.initialVlookat ?? initialVlookat, -82, 82),
    fov: clamp(activeScene?.initialFov ?? initialFov, 18, 115),
  });
  const camRef = useRef<CameraState>(cam);
  camRef.current = cam;

  const [viewport, setViewport] = useState<{ width: number; height: number }>({
    width: 800,
    height: 450,
  });
  const [isDragging, setIsDragging] = useState(false);
  const [autoRotate, setAutoRotate] = useState(autoRotateDefault);
  const [hdCrisp, setHdCrisp] = useState(true);
  const [showPath, setShowPath] = useState(true);
  const [pathStepIdx, setPathStepIdx] = useState(0);

  // Foreground unboxed artwork inspection + disappearing wall pin so name NEVER covers the art piece!
  const [activeArtCard, setActiveArtCard] = useState<KrpanoHotspot | null>(null);
  const [hiddenArtPinId, setHiddenArtPinId] = useState<string | null>(null);
  const hiddenArtAnchorRef = useRef<{ ath: number; atv: number } | null>(null);
  const [showArtDetails, setShowArtDetails] = useState<boolean>(true);
  const [artZoom, setArtZoom] = useState<number>(1);
  const [artPan, setArtPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const artDragRef = useRef<{
    startX: number;
    startY: number;
    origX: number;
    origY: number;
  } | null>(null);

  // Universal Hybrid Fullscreen: Native Fullscreen API + Fixed-Viewport 100dvh Stage (for iPhone Safari, iOS Chrome, Android WebViews & iframes!)
  const [nativeFullscreen, setNativeFullscreen] = useState(false);
  const [pseudoFullscreen, setPseudoFullscreen] = useState(false);
  const wasNativeFullscreenRef = useRef(false);
  const isFullscreen = nativeFullscreen || pseudoFullscreen;

  const [webglReady, setWebglReady] = useState(false);
  const [streamingTiles, setStreamingTiles] = useState(false);
  const [panoDimensions, setPanoDimensions] = useState<{ w: number; h: number } | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [transitionBanner, setTransitionBanner] = useState<string | null>(null);
  const [xmlModalOpen, setXmlModalOpen] = useState(false);
  const [copiedXml, setCopiedXml] = useState(false);

  const dragRef = useRef<{
    lastX: number;
    lastY: number;
    velH: number;
    velV: number;
  } | null>(null);
  const pointersRef = useRef<Map<number, { x: number; y: number }>>(new Map());
  const pinchDistRef = useRef<number | null>(null);
  const velocityRef = useRef<{ h: number; v: number }>({ h: 0, v: 0 });
  const lookToRef = useRef<LookToAnimation | null>(null);

  const autoRotateRef = useRef<boolean>(autoRotate);
  autoRotateRef.current = autoRotate;
  const hdCrispRef = useRef<boolean>(hdCrisp);
  hdCrispRef.current = hdCrisp;

  // Smooth krpano lookto(ath, atv, fov) camera interpolation (down to 18° Macro 16K zoom!)
  const lookTo = useCallback((ath: number, atv: number, fov = 46, duration = 640) => {
    velocityRef.current = { h: 0, v: 0 };
    const current = camRef.current;
    const deltaH = shortestAngleDelta(ath, current.hlookat);
    lookToRef.current = {
      startH: current.hlookat,
      startV: current.vlookat,
      startFov: current.fov,
      targetH: current.hlookat + deltaH,
      targetV: clamp(atv, -82, 82),
      targetFov: clamp(fov, 18, 115),
      startTime: performance.now(),
      duration,
    };
  }, []);

  // Switch 360° room / floor (supports walking through Doors & climbing/descending Stairs!)
  const switchScene = useCallback(
    (
      nextSceneId: string,
      customLook?: { ath: number; atv: number; fov?: number },
      viaPortal?: { ath: number; atv: number; label: string },
    ) => {
      const nextScene = scenes.find((s) => s.id === nextSceneId);
      if (!nextScene) return;

      setActiveArtCard(null);
      setHiddenArtPinId(null);
      hiddenArtAnchorRef.current = null;
      setPathStepIdx(0);

      const performSwitch = () => {
        setIsTransitioning(true);
        setInternalSceneId(nextSceneId);
        onSceneChange?.(nextSceneId);

        const arriveH = customLook?.ath ?? nextScene.initialHlookat ?? 0;
        const arriveV = customLook?.atv ?? nextScene.initialVlookat ?? 1;
        const arriveFov = customLook?.fov ?? nextScene.initialFov ?? 80;

        const nextCam: CameraState = {
          hlookat: wrapDeg180(arriveH),
          vlookat: clamp(arriveV, -82, 82),
          fov: clamp(arriveFov + 8, 18, 115),
        };
        camRef.current = nextCam;
        setCam(nextCam);

        window.setTimeout(() => {
          setIsTransitioning(false);
          setTransitionBanner(null);
          lookTo(arriveH, arriveV, arriveFov, 520);
        }, 150);
      };

      if (viaPortal) {
        setTransitionBanner(viaPortal.label);
        lookTo(viaPortal.ath, viaPortal.atv, 44, 290);
        window.setTimeout(performSwitch, 270);
      } else {
        performSwitch();
      }
    },
    [scenes, onSceneChange, lookTo],
  );

  // Trigger smooth lookto (and optional scene switch + unboxed HD art spotlight) whenever targetView changes
  useEffect(() => {
    if (!targetView) return;
    const openId = targetView.openHotspotId;

    const maybeOpenArt = (sceneIdToSearch: string) => {
      if (!openId) return;
      const sc = scenes.find((s) => s.id === sceneIdToSearch) ?? activeScene;
      const found = (hotspots ?? sc?.hotspots ?? []).find(
        (h) => h.id === openId && !h.targetSceneId,
      );
      if (found) {
        setArtZoom(1);
        setArtPan({ x: 0, y: 0 });
        setShowArtDetails(true);
        setHiddenArtPinId(found.id);
        hiddenArtAnchorRef.current = {
          ath: found.lookAtAth ?? found.ath,
          atv: found.lookAtAtv ?? found.atv,
        };
        setActiveArtCard(found);
      }
    };

    if (targetView.sceneId && targetView.sceneId !== currentSceneId) {
      switchScene(targetView.sceneId, {
        ath: targetView.ath,
        atv: targetView.atv,
        fov: targetView.fov,
      });
      if (openId) {
        window.setTimeout(() => maybeOpenArt(targetView.sceneId!), 210);
      }
    } else {
      lookTo(targetView.ath, targetView.atv, targetView.fov ?? 46, 650);
      maybeOpenArt(currentSceneId);
    }
  }, [targetView, currentSceneId, switchScene, lookTo, scenes, activeScene, hotspots]);

  // Allow pressing Escape to step back from the Floating Art Piece Spotlight
  useEffect(() => {
    if (!activeArtCard) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setActiveArtCard(null);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [activeArtCard]);

  // Observe container & mobile visualViewport size for crisp retina WebGL viewport and accurate 3D hotspot coordinates
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const updateSize = () => {
      const rect = el.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        setViewport({ width: rect.width, height: rect.height });
      }
    };
    updateSize();
    const vv = typeof window !== "undefined" ? window.visualViewport : null;
    vv?.addEventListener("resize", updateSize);
    window.addEventListener("orientationchange", updateSize);
    if (typeof ResizeObserver !== "undefined") {
      const ro = new ResizeObserver(updateSize);
      ro.observe(el);
      return () => {
        ro.disconnect();
        vv?.removeEventListener("resize", updateSize);
        window.removeEventListener("orientationchange", updateSize);
      };
    }
    window.addEventListener("resize", updateSize);
    return () => {
      window.removeEventListener("resize", updateSize);
      vv?.removeEventListener("resize", updateSize);
      window.removeEventListener("orientationchange", updateSize);
    };
  }, []);

  // Track standard + WebKit fullscreen changes & sync OS Escape/Back exit with pseudo-fullscreen
  useEffect(() => {
    const doc = document as Document & { webkitFullscreenElement?: Element | null };
    const onFs = () => {
      const active = Boolean(doc.fullscreenElement || doc.webkitFullscreenElement);
      setNativeFullscreen(active);
      if (active) {
        wasNativeFullscreenRef.current = true;
      } else if (wasNativeFullscreenRef.current) {
        wasNativeFullscreenRef.current = false;
        setPseudoFullscreen(false);
      }
    };
    document.addEventListener("fullscreenchange", onFs);
    document.addEventListener("webkitfullscreenchange", onFs);
    return () => {
      document.removeEventListener("fullscreenchange", onFs);
      document.removeEventListener("webkitfullscreenchange", onFs);
    };
  }, []);

  // Lock page scroll while in Fullscreen 360° & re-measure viewport immediately on enter/exit
  useEffect(() => {
    if (typeof window === "undefined") return;
    const raf = window.requestAnimationFrame(() => {
      const rect = containerRef.current?.getBoundingClientRect();
      if (rect && rect.width > 0 && rect.height > 0) {
        setViewport({ width: rect.width, height: rect.height });
      }
    });
    if (!isFullscreen) {
      return () => window.cancelAnimationFrame(raf);
    }
    const prevBodyOverflow = document.body.style.overflow;
    const prevHtmlOverflow = document.documentElement.style.overflow;
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";
    return () => {
      window.cancelAnimationFrame(raf);
      document.body.style.overflow = prevBodyOverflow;
      document.documentElement.style.overflow = prevHtmlOverflow;
    };
  }, [isFullscreen]);

  // Allow Escape key to exit CSS fixed-viewport fullscreen when modals are closed
  useEffect(() => {
    if (!pseudoFullscreen || activeArtCard || xmlModalOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setPseudoFullscreen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [pseudoFullscreen, activeArtCard, xmlModalOpen]);

  // 1. PERSISTENT WebGL Context & 60–120 FPS Render Loop (Initialized ONCE on mount — NEVER torn down!)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let gl: WebGLRenderingContext | null = null;
    try {
      gl =
        (canvas.getContext("webgl", {
          antialias: true,
          alpha: false,
          powerPreference: "high-performance",
        }) as WebGLRenderingContext | null) ||
        (canvas.getContext("experimental-webgl") as WebGLRenderingContext | null);
    } catch {
      gl = null;
    }

    if (!gl) {
      setWebglReady(false);
      return;
    }

    const vs = createShader(gl, gl.VERTEX_SHADER, VERTEX_SHADER_SRC);
    const fs = createShader(gl, gl.FRAGMENT_SHADER, FRAGMENT_SHADER_SRC);
    const program = gl.createProgram();
    if (!vs || !fs || !program) {
      setWebglReady(false);
      return;
    }

    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      setWebglReady(false);
      return;
    }

    gl.useProgram(program);

    const posBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, posBuffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
      gl.STATIC_DRAW,
    );

    const aPos = gl.getAttribLocation(program, "a_position");
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

    const uCamF = gl.getUniformLocation(program, "u_camF");
    const uCamR = gl.getUniformLocation(program, "u_camR");
    const uCamU = gl.getUniformLocation(program, "u_camU");
    const uTanHalfFov = gl.getUniformLocation(program, "u_tanHalfFov");
    const uAspect = gl.getUniformLocation(program, "u_aspect");
    const uPadFracX = gl.getUniformLocation(program, "u_padFracX");
    const uPadFracY = gl.getUniformLocation(program, "u_padFracY");
    const uTilePixelSize = gl.getUniformLocation(program, "u_tilePixelSize");
    const uTexelStep = gl.getUniformLocation(program, "u_texelStep");
    const uSharpness = gl.getUniformLocation(program, "u_sharpness");
    const uTileMode = gl.getUniformLocation(program, "u_tileMode");

    const texLocs = [0, 1, 2, 3, 4, 5, 6, 7].map((i) =>
      gl!.getUniformLocation(program, `u_tex${i}`),
    );

    const anisoExt = (gl.getExtension("EXT_texture_filter_anisotropic") ||
      gl.getExtension("WEBKIT_EXT_texture_filter_anisotropic") ||
      gl.getExtension(
        "MOZ_EXT_texture_filter_anisotropic",
      )) as EXT_texture_filter_anisotropic | null;
    const maxAniso = anisoExt
      ? Math.min(16, (gl.getParameter(anisoExt.MAX_TEXTURE_MAX_ANISOTROPY_EXT) as number) || 4)
      : 1;
    const maxTexSize = (gl.getParameter(gl.MAX_TEXTURE_SIZE) as number) || 4096;

    const initPlaceholderTex = (unit: number, loc: WebGLUniformLocation | null) => {
      gl!.activeTexture(gl!.TEXTURE0 + unit);
      const t = gl!.createTexture();
      gl!.bindTexture(gl!.TEXTURE_2D, t);
      gl!.texImage2D(
        gl!.TEXTURE_2D,
        0,
        gl!.RGBA,
        1,
        1,
        0,
        gl!.RGBA,
        gl!.UNSIGNED_BYTE,
        new Uint8Array([15, 23, 42, 255]),
      );
      gl!.texParameteri(gl!.TEXTURE_2D, gl!.TEXTURE_WRAP_S, gl!.CLAMP_TO_EDGE);
      gl!.texParameteri(gl!.TEXTURE_2D, gl!.TEXTURE_WRAP_T, gl!.CLAMP_TO_EDGE);
      gl!.texParameteri(gl!.TEXTURE_2D, gl!.TEXTURE_MIN_FILTER, gl!.LINEAR);
      gl!.texParameteri(gl!.TEXTURE_2D, gl!.TEXTURE_MAG_FILTER, gl!.LINEAR);
      gl!.uniform1i(loc, unit);
      return t;
    };

    const textures = [0, 1, 2, 3, 4, 5, 6, 7].map((u) => initPlaceholderTex(u, texLocs[u] ?? null));

    const handle: GlHandle = {
      gl,
      textures,
      maxAniso,
      anisoExt,
      maxTexSize,
      padFracX: 16 / 4032,
      padFracY: 16 / 4032,
      tilePixelSize: [4032, 4032],
      texelStep: [1 / 16000, 1 / 8000],
      tileMode: 0,
    };
    glHandleRef.current = handle;
    setWebglReady(true);

    let cancelled = false;
    let rafId = 0;
    let lastReactSync = 0;

    const renderLoop = (now: number) => {
      if (cancelled || !gl) return;

      let moved = false;
      const anim = lookToRef.current;
      if (anim) {
        const t = clamp((now - anim.startTime) / anim.duration, 0, 1);
        const ease = 1 - Math.pow(1 - t, 3);
        camRef.current = {
          hlookat: wrapDeg180(anim.startH + (anim.targetH - anim.startH) * ease),
          vlookat: clamp(anim.startV + (anim.targetV - anim.startV) * ease, -82, 82),
          fov: clamp(anim.startFov + (anim.targetFov - anim.startFov) * ease, 18, 115),
        };
        if (t >= 1) {
          lookToRef.current = null;
          lastReactSync = 0;
        }
        moved = true;
      } else if (!dragRef.current) {
        const vel = velocityRef.current;
        if (Math.abs(vel.h) > 0.01 || Math.abs(vel.v) > 0.01) {
          vel.h *= 0.9;
          vel.v *= 0.9;
          camRef.current = {
            hlookat: wrapDeg180(camRef.current.hlookat + vel.h),
            vlookat: clamp(camRef.current.vlookat + vel.v, -82, 82),
            fov: camRef.current.fov,
          };
          if (Math.abs(vel.h) <= 0.01 && Math.abs(vel.v) <= 0.01) {
            lastReactSync = 0;
          }
          moved = true;
        } else if (autoRotateRef.current) {
          camRef.current = {
            ...camRef.current,
            hlookat: wrapDeg180(camRef.current.hlookat + 0.14),
          };
          moved = true;
        }
      }

      if (moved && now - lastReactSync > 30) {
        lastReactSync = now;
        setCam({ ...camRef.current });
      }

      const dpr = Math.min(window.devicePixelRatio || 1, 3);
      const displayW = Math.max(1, Math.floor(canvas.clientWidth * dpr));
      const displayH = Math.max(1, Math.floor(canvas.clientHeight * dpr));
      if (canvas.width !== displayW || canvas.height !== displayH) {
        canvas.width = displayW;
        canvas.height = displayH;
      }

      gl.viewport(0, 0, canvas.width, canvas.height);

      const { Rvec, Uvec, Fvec } = computeCameraBasis(
        camRef.current.hlookat,
        camRef.current.vlookat,
      );
      const aspect = canvas.width / Math.max(1, canvas.height);
      const tanHalfFov = computeEffectiveTanHalfFov(camRef.current.fov, aspect);

      gl.uniform3fv(uCamF, Fvec);
      gl.uniform3fv(uCamR, Rvec);
      gl.uniform3fv(uCamU, Uvec);
      gl.uniform1f(uTanHalfFov, tanHalfFov);
      gl.uniform1f(uAspect, aspect);
      gl.uniform1f(uPadFracX, handle.padFracX);
      gl.uniform1f(uPadFracY, handle.padFracY);
      gl.uniform2fv(uTilePixelSize, handle.tilePixelSize);
      gl.uniform2fv(uTexelStep, handle.texelStep);
      gl.uniform1f(uSharpness, hdCrispRef.current ? 0.65 : 0.0);
      gl.uniform1f(uTileMode, handle.tileMode);

      gl.drawArrays(gl.TRIANGLES, 0, 6);
      rafId = window.requestAnimationFrame(renderLoop);
    };

    rafId = window.requestAnimationFrame(renderLoop);

    return () => {
      cancelled = true;
      window.cancelAnimationFrame(rafId);
      glHandleRef.current = null;
      textures.forEach((t) => {
        if (t) gl.deleteTexture(t);
      });
    };
  }, []);

  // 2. ZERO-LAG PROGRESSIVE 16K / 12K / 6K TEXTURE STREAMER (Instant <35ms Preview + Staggered Off-Thread Tiles!)
  const activeGridTileUrls = activeScene?.gridTileUrls;
  const activeTileUrls = activeScene?.tileUrls;
  const activePreviewUrl = activeScene?.previewUrl;
  const activeTilePadFracX = activeScene?.tilePadFrac ?? 16 / 4032;
  const activeTilePadFracY = activeScene?.tilePadFracY ?? activeTilePadFracX;
  const activeTilePixelSize = activeScene?.tilePixelSize;
  const activeNativeW = activeScene?.nativeWidth;
  const activeNativeH = activeScene?.nativeHeight;
  const useCustomSingleUrl = Boolean(panoramaUrl);

  useEffect(() => {
    const handle = glHandleRef.current;
    if (!handle) return;
    const { gl, textures, anisoExt, maxAniso, maxTexSize } = handle;

    const abortCtrl = new AbortController();
    let aborted = false;

    const uploadToUnit = (
      unit: number,
      tex: WebGLTexture | null,
      source: TexImageSource,
      wrapRepeatX = false,
    ) => {
      gl.activeTexture(gl.TEXTURE0 + unit);
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 0);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, source);
      gl.texParameteri(
        gl.TEXTURE_2D,
        gl.TEXTURE_WRAP_S,
        wrapRepeatX ? gl.REPEAT : gl.CLAMP_TO_EDGE,
      );
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      if (anisoExt && maxAniso > 1) {
        gl.texParameterf(gl.TEXTURE_2D, anisoExt.TEXTURE_MAX_ANISOTROPY_EXT, maxAniso);
      }
    };

    const runStream = async () => {
      const hasPreSliced = !useCustomSingleUrl && (activeGridTileUrls || activeTileUrls);
      const cacheKey = hasPreSliced ? `tiles:${currentSceneId}` : `url:${resolvedPanoUrl}`;

      // Fast path: already decoded in RAM cache -> flicker-free upload across frames!
      const cached = ROOM_BITMAP_CACHE.get(cacheKey);
      if (cached) {
        if (cached.preview) {
          uploadToUnit(0, textures[0] ?? null, cached.preview, true);
          handle.tileMode = 0;
        }
        setPanoDimensions({ w: cached.w, h: cached.h });
        for (let k = cached.tiles.length - 1; k >= 1; k--) {
          if (aborted) return;
          uploadToUnit(k, textures[k] ?? null, cached.tiles[k]!);
          await nextAnimationFrame();
        }
        if (aborted) return;
        uploadToUnit(0, textures[0] ?? null, cached.tiles[0]!);
        handle.padFracX = cached.padFracX;
        handle.padFracY = cached.padFracY;
        handle.tilePixelSize = cached.tilePixelSize;
        handle.texelStep = [1 / cached.w, 1 / cached.h];
        handle.tileMode = cached.mode;
        setStreamingTiles(false);
        return;
      }

      // Progressive Pre-Cut 8-Tile (16K/12K) or 4-Tile (6K) Streamer
      const urlsToLoad = !useCustomSingleUrl ? (activeGridTileUrls ?? activeTileUrls) : undefined;
      const targetMode: 1 | 2 = activeGridTileUrls ? 2 : 1;

      if (urlsToLoad && activePreviewUrl) {
        setStreamingTiles(true);
        try {
          // Phase A: Instant <35ms 2048x1024 WebP preview sphere in u_tex0!
          const prevBmp = await fetchBitmap(activePreviewUrl, abortCtrl.signal);
          if (aborted) return;
          uploadToUnit(0, textures[0] ?? null, prevBmp, true);
          handle.tileMode = 0;
          const wEst = activeNativeW ?? (targetMode === 2 ? 16000 : 6000);
          const hEst = activeNativeH ?? Math.round(wEst / 2);
          setPanoDimensions({ w: wEst, h: hEst });

          // Phase B: Off-main-thread parallel decode of all 8 (or 4) pre-sliced GPU tiles!
          const decodedTiles = await Promise.all(
            urlsToLoad.map((u) => fetchBitmap(u, abortCtrl.signal)),
          );
          if (aborted) return;

          // Upload units N-1..1 first while u_tex0 keeps rendering preview.webp without any flicker!
          for (let k = decodedTiles.length - 1; k >= 1; k--) {
            if (aborted) return;
            await nextAnimationFrame();
            if (aborted) return;
            uploadToUnit(k, textures[k] ?? null, decodedTiles[k]!);
          }

          if (aborted) return;
          await nextAnimationFrame();
          if (aborted) return;

          // Final frame: upload tile 0 and atomically flip shader to full 16K/12K/6K native mode!
          uploadToUnit(0, textures[0] ?? null, decodedTiles[0]!);
          const inferredTileSize: [number, number] = activeTilePixelSize ?? [
            decodedTiles[0]!.width,
            decodedTiles[0]!.height,
          ];
          handle.padFracX = activeTilePadFracX;
          handle.padFracY = activeTilePadFracY;
          handle.tilePixelSize = inferredTileSize;
          handle.texelStep = [1 / wEst, 1 / hEst];
          handle.tileMode = targetMode;
          setStreamingTiles(false);

          if (
            typeof ImageBitmap !== "undefined" &&
            prevBmp instanceof ImageBitmap &&
            decodedTiles.every((b): b is ImageBitmap => b instanceof ImageBitmap)
          ) {
            if (ROOM_BITMAP_CACHE.size >= 5) {
              const oldest = ROOM_BITMAP_CACHE.keys().next().value;
              if (oldest) ROOM_BITMAP_CACHE.delete(oldest);
            }
            ROOM_BITMAP_CACHE.set(cacheKey, {
              mode: targetMode,
              preview: prevBmp,
              tiles: decodedTiles,
              padFracX: activeTilePadFracX,
              padFracY: activeTilePadFracY,
              tilePixelSize: inferredTileSize,
              w: wEst,
              h: hEst,
            });
          }
          return;
        } catch {
          if (aborted) return;
        }
      }

      // Fallback Single-Image Equirectangular Loader
      setStreamingTiles(true);
      try {
        let src: ImageBitmap | HTMLImageElement;
        try {
          src = await fetchBitmap(resolvedPanoUrl, abortCtrl.signal);
        } catch {
          src = await fetchBitmap(fallbackPanoramaUrl, abortCtrl.signal);
        }
        if (aborted) return;

        const W = "naturalWidth" in src ? src.naturalWidth || src.width : src.width;
        const H = "naturalHeight" in src ? src.naturalHeight || src.height : src.height;
        setPanoDimensions({ w: W, h: H });

        const sectorW = W / 4;
        const padPx = Math.max(4, Math.round(sectorW * 0.005));
        const srcTileW = sectorW + 2 * padPx;
        const dstTileW = Math.min(Math.round(srcTileW), maxTexSize);
        const dstTileH = Math.min(H, maxTexSize);

        const tileCanvas = document.createElement("canvas");
        tileCanvas.width = dstTileW;
        tileCanvas.height = dstTileH;
        const ctx = tileCanvas.getContext("2d", { alpha: false });
        if (ctx) {
          const scaleX = dstTileW / srcTileW;
          for (let k = 3; k >= 0; k--) {
            if (aborted) return;
            await nextAnimationFrame();
            if (aborted) return;
            const startX = k * sectorW - padPx;
            if (startX < 0) {
              const wrapW = -startX;
              const mainW = srcTileW - wrapW;
              ctx.drawImage(src, W - wrapW, 0, wrapW, H, 0, 0, wrapW * scaleX, dstTileH);
              ctx.drawImage(src, 0, 0, mainW, H, wrapW * scaleX, 0, mainW * scaleX, dstTileH);
            } else if (startX + srcTileW > W) {
              const mainW = W - startX;
              const wrapW = srcTileW - mainW;
              ctx.drawImage(src, startX, 0, mainW, H, 0, 0, mainW * scaleX, dstTileH);
              ctx.drawImage(src, 0, 0, wrapW, H, mainW * scaleX, 0, wrapW * scaleX, dstTileH);
            } else {
              ctx.drawImage(src, startX, 0, srcTileW, H, 0, 0, dstTileW, dstTileH);
            }
            uploadToUnit(k, textures[k] ?? null, tileCanvas);
          }
          tileCanvas.width = 1;
          tileCanvas.height = 1;
          handle.padFracX = padPx / srcTileW;
          handle.padFracY = 0;
          handle.tilePixelSize = [dstTileW, dstTileH];
          handle.texelStep = [1 / Math.max(1024, dstTileW * 4), 1 / Math.max(512, dstTileH)];
          handle.tileMode = 1;
        }
      } catch {
        // Ignore aborted or headless test environment image load errors
      } finally {
        if (!aborted) setStreamingTiles(false);
      }
    };

    void runStream();

    return () => {
      aborted = true;
      abortCtrl.abort();
    };
  }, [
    currentSceneId,
    resolvedPanoUrl,
    fallbackPanoramaUrl,
    useCustomSingleUrl,
    activeGridTileUrls,
    activeTileUrls,
    activePreviewUrl,
    activeTilePadFracX,
    activeTilePadFracY,
    activeTilePixelSize,
    activeNativeW,
    activeNativeH,
  ]);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest("button, [data-art-card='true']")) return;
    lookToRef.current = null;
    setAutoRotate(false);
    velocityRef.current = { h: 0, v: 0 };
    pointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    e.currentTarget.setPointerCapture?.(e.pointerId);

    if (pointersRef.current.size === 2) {
      const [p0, p1] = Array.from(pointersRef.current.values());
      if (p0 && p1) {
        pinchDistRef.current = Math.hypot(p1.x - p0.x, p1.y - p0.y);
      }
      dragRef.current = null;
      return;
    }

    if (pointersRef.current.size === 1) {
      pinchDistRef.current = null;
      setIsDragging(true);
      dragRef.current = {
        lastX: e.clientX,
        lastY: e.clientY,
        velH: 0,
        velV: 0,
      };
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (pointersRef.current.has(e.pointerId)) {
      pointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    }

    // Smooth 2-finger mobile pinch-to-zoom without camera jump
    if (pointersRef.current.size >= 2) {
      const [p0, p1] = Array.from(pointersRef.current.values());
      if (p0 && p1) {
        const dist = Math.hypot(p1.x - p0.x, p1.y - p0.y);
        if (pinchDistRef.current && pinchDistRef.current > 8 && dist > 8) {
          const scale = pinchDistRef.current / dist;
          const nextFov = clamp(camRef.current.fov * scale, 18, 115);
          const nextCam = { ...camRef.current, fov: nextFov };
          camRef.current = nextCam;
          setCam(nextCam);
        }
        pinchDistRef.current = dist;
      }
      return;
    }

    if (!dragRef.current) return;
    const dx = e.clientX - dragRef.current.lastX;
    const dy = e.clientY - dragRef.current.lastY;
    dragRef.current.lastX = e.clientX;
    dragRef.current.lastY = e.clientY;

    const speed = (camRef.current.fov / 90) * 0.21;
    const dH = -dx * speed;
    const dV = dy * speed;

    dragRef.current.velH = dH;
    dragRef.current.velV = dV;

    const nextCam: CameraState = {
      hlookat: wrapDeg180(camRef.current.hlookat + dH),
      vlookat: clamp(camRef.current.vlookat + dV, -82, 82),
      fov: camRef.current.fov,
    };
    camRef.current = nextCam;
    setCam(nextCam);

    // If user pans away (> 18°) from the clicked artwork, gently restore its wall pin for later discovery
    if (hiddenArtAnchorRef.current) {
      const dist = Math.hypot(
        shortestAngleDelta(nextCam.hlookat, hiddenArtAnchorRef.current.ath),
        nextCam.vlookat - hiddenArtAnchorRef.current.atv,
      );
      if (dist > 18) {
        setHiddenArtPinId(null);
        hiddenArtAnchorRef.current = null;
      }
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    pointersRef.current.delete(e.pointerId);
    pinchDistRef.current = null;

    if (pointersRef.current.size === 1) {
      const remaining = Array.from(pointersRef.current.values())[0];
      if (remaining) {
        dragRef.current = {
          lastX: remaining.x,
          lastY: remaining.y,
          velH: 0,
          velV: 0,
        };
      }
      return;
    }

    if (pointersRef.current.size === 0) {
      if (dragRef.current) {
        velocityRef.current = {
          h: dragRef.current.velH * 0.85,
          v: dragRef.current.velV * 0.85,
        };
      }
      dragRef.current = null;
      setIsDragging(false);
    }
  };

  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest("[data-art-card='true']")) return;
    e.preventDefault();
    lookToRef.current = null;
    const nextFov = clamp(camRef.current.fov + (e.deltaY > 0 ? 4.5 : -4.5), 18, 115);
    const nextCam = { ...camRef.current, fov: nextFov };
    camRef.current = nextCam;
    setCam(nextCam);
  };

  const nudgeCamera = (dH: number, dV: number, dFov = 0) => {
    setAutoRotate(false);
    const cur = camRef.current;
    lookTo(cur.hlookat + dH, clamp(cur.vlookat + dV, -82, 82), clamp(cur.fov + dFov, 18, 115), 300);
  };

  // Universal Mobile + Desktop Fullscreen Toggle (iOS Safari, Android Chrome, WebViews & iframes!)
  const toggleFullscreen = () => {
    const el = containerRef.current as
      (HTMLDivElement & { webkitRequestFullscreen?: () => Promise<void> | void }) | null;
    if (!el) return;
    const doc = document as Document & {
      webkitFullscreenElement?: Element | null;
      webkitExitFullscreen?: () => Promise<void> | void;
    };

    if (isFullscreen) {
      setPseudoFullscreen(false);
      if (doc.fullscreenElement && doc.exitFullscreen) {
        doc.exitFullscreen().catch(() => {});
      } else if (doc.webkitFullscreenElement && doc.webkitExitFullscreen) {
        try {
          void doc.webkitExitFullscreen();
        } catch {
          // Ignore WebKit exit errors
        }
      }
      return;
    }

    // Immediately promote to 100vw × 100dvh fixed viewport (guaranteed on iPhones, WebViews & iframes!)
    setPseudoFullscreen(true);

    // Also invoke native OS fullscreen when supported by the browser
    if (typeof el.requestFullscreen === "function") {
      el.requestFullscreen().catch(() => {});
    } else if (typeof el.webkitRequestFullscreen === "function") {
      try {
        void el.webkitRequestFullscreen();
      } catch {
        // Fallback already active via pseudoFullscreen (.krpano-fullscreen-stage)
      }
    }
  };

  const handleHotspotActivate = useCallback(
    (hs: KrpanoHotspot) => {
      setAutoRotate(false);
      if (hs.targetSceneId) {
        const banner =
          hs.kind === "stairs-up"
            ? "Climbing Grand Staircase → 2nd Floor Mezzanine…"
            : hs.kind === "stairs-down"
              ? "Descending Grand Staircase → 1F Pavilion…"
              : `Walking Through Archway → ${hs.title.replace(/→|←/g, "").trim()}…`;
        switchScene(hs.targetSceneId, hs.arrivalView, {
          ath: hs.ath,
          atv: hs.atv,
          label: banner,
        });
      } else {
        const targetAth = hs.lookAtAth ?? hs.ath;
        const targetAtv = hs.lookAtAtv ?? hs.atv;
        lookTo(targetAth, targetAtv, hs.fov ?? 38, 600);
        setArtZoom(1);
        setArtPan({ x: 0, y: 0 });
        setShowArtDetails(true);
        // Hide the wall hotspot badge/name immediately so it NEVER overlaps the art piece!
        setHiddenArtPinId(hs.id);
        hiddenArtAnchorRef.current = { ath: targetAth, atv: targetAtv };
        setActiveArtCard(hs);
        onSelectHotspot?.(hs);
      }
    },
    [switchScene, lookTo, onSelectHotspot],
  );

  // Art-only hotspots in current room for Previous / Next High-Res Artwork cycling
  const roomArtHotspots = useMemo(
    () => resolvedHotspots.filter((h) => !h.targetSceneId),
    [resolvedHotspots],
  );

  const cycleForegroundArt = (dir: -1 | 1) => {
    if (roomArtHotspots.length === 0 || !activeArtCard) return;
    const curIdx = Math.max(
      0,
      roomArtHotspots.findIndex((h) => h.id === activeArtCard.id),
    );
    const nextArt =
      roomArtHotspots[(curIdx + dir + roomArtHotspots.length) % roomArtHotspots.length];
    if (nextArt) {
      handleHotspotActivate(nextArt);
    }
  };

  const orderedPathHotspots = useMemo(() => {
    const withOrder = resolvedHotspots.filter((h) => typeof h.pathOrder === "number");
    if (withOrder.length > 0) {
      return [...withOrder].sort((a, b) => (a.pathOrder ?? 99) - (b.pathOrder ?? 99));
    }
    return resolvedHotspots;
  }, [resolvedHotspots]);

  const stepAlongPath = () => {
    if (orderedPathHotspots.length === 0) return;
    const nextIdx = pathStepIdx % orderedPathHotspots.length;
    const target = orderedPathHotspots[nextIdx];
    setPathStepIdx((nextIdx + 1) % orderedPathHotspots.length);
    if (target) {
      handleHotspotActivate(target);
    }
  };

  const generatedXml = useMemo(() => {
    if (!xmlModalOpen) return "";
    return buildKrpanoXml({
      sceneName: resolvedSceneName,
      sceneTitle: resolvedSceneTitle,
      panoramaUrl: resolvedPanoUrl,
      cam,
      hotspots: resolvedHotspots,
    });
  }, [xmlModalOpen, resolvedSceneName, resolvedSceneTitle, resolvedPanoUrl, cam, resolvedHotspots]);

  const handleCopyXml = () => {
    navigator.clipboard?.writeText(generatedXml);
    setCopiedXml(true);
    window.setTimeout(() => setCopiedXml(false), 1800);
  };

  const is16kActive = (panoDimensions?.w ?? 0) >= 15000 || activeScene?.isUltraHd16k;
  const is12kActive = (panoDimensions?.w ?? 0) >= 10000 || activeScene?.isUltraHd12k;

  const projectedFloorSteps = useMemo(() => {
    if (!showPath || resolvedFloorPath.length === 0) return [];
    return resolvedFloorPath.map((fp, i) => ({
      ...fp,
      index: i,
      proj: projectHotspotToScreen(fp.ath, fp.atv, cam, viewport.width, viewport.height),
    }));
  }, [showPath, resolvedFloorPath, cam, viewport.width, viewport.height]);

  return (
    <div
      ref={containerRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onLostPointerCapture={handlePointerUp}
      onWheel={handleWheel}
      className={`w-full overflow-hidden bg-[#0F172A] select-none shadow-lg ${
        isFullscreen
          ? "krpano-fullscreen-stage"
          : `relative ${heightClass} rounded-2xl border border-[#CBD5E1]`
      } ${isDragging ? "cursor-grabbing" : "cursor-grab"}`}
      style={{ touchAction: "none" }}
    >
      {/* 8-Tile 16K / 12K Smooth Quintic WebGL Equirectangular Spherical Canvas */}
      <canvas
        ref={canvasRef}
        className={`block h-full w-full transition-opacity duration-200 ${
          isTransitioning ? "opacity-35" : "opacity-100"
        }`}
      />

      {/* Fallback CSS Spherical Pan Layer for non-WebGL / Headless Test Environments */}
      {!webglReady && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-cover bg-center transition-transform duration-75"
          style={{
            backgroundImage: `url(${activePreviewUrl ?? resolvedPanoUrl})`,
            backgroundPosition: `${50 + (cam.hlookat / 180) * 50}% ${50 - (cam.vlookat / 90) * 45}%`,
            transform: `scale(${clamp(115 / cam.fov, 1.05, 2.5)})`,
          }}
        />
      )}

      {/* Subtle Ambient Vignette */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-950/55 via-transparent to-slate-950/20"
      />

      {/* Walk-Through Door / Climb Stairs Transition Pill */}
      {transitionBanner && (
        <div className="pointer-events-none absolute top-1/2 left-1/2 z-40 -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#FCD116]/70 bg-slate-950/85 px-5 py-2 text-[12.5px] font-bold text-[#FCD116] shadow-2xl backdrop-blur-md">
          {transitionBanner}
        </div>
      )}

      {/* 3D Projected SVG Guided Museum Floor Path */}
      {showPath && !activeArtCard && projectedFloorSteps.length > 1 && (
        <svg aria-hidden="true" className="pointer-events-none absolute inset-0 z-10 h-full w-full">
          {projectedFloorSteps.map((curr, idx) => {
            const next = projectedFloorSteps[idx + 1];
            if (!next || !curr.proj.visible || !next.proj.visible) return null;
            const dist = Math.hypot(next.proj.x - curr.proj.x, next.proj.y - curr.proj.y);
            if (dist > viewport.width * 0.72) return null;
            return (
              <line
                key={`fp-line-${idx}`}
                x1={curr.proj.x}
                y1={curr.proj.y}
                x2={next.proj.x}
                y2={next.proj.y}
                stroke="#FCD116"
                strokeOpacity="0.52"
                strokeWidth="2.5"
                strokeDasharray="7 8"
                strokeLinecap="round"
              />
            );
          })}
        </svg>
      )}

      {/* Clickable 3D Perspective Floor Footstep Discs */}
      {showPath &&
        !activeArtCard &&
        projectedFloorSteps.map((fp) => {
          if (!fp.proj.visible) return null;
          return (
            <button
              key={`floor-step-${fp.index}`}
              type="button"
              onClick={() => {
                setAutoRotate(false);
                if (fp.targetSceneId) {
                  const matchingPortal = resolvedHotspots.find(
                    (h) => h.targetSceneId === fp.targetSceneId,
                  );
                  if (matchingPortal) {
                    handleHotspotActivate(matchingPortal);
                  } else {
                    switchScene(fp.targetSceneId);
                  }
                  return;
                }
                const targetAth = fp.lookAtAth ?? fp.ath;
                const targetAtv = fp.lookAtAtv ?? 3;
                const nearbyArt = resolvedHotspots.find(
                  (h) =>
                    !h.targetSceneId &&
                    Math.abs(shortestAngleDelta(h.lookAtAth ?? h.ath, targetAth)) < 9,
                );
                if (nearbyArt) {
                  handleHotspotActivate(nearbyArt);
                } else {
                  lookTo(targetAth, targetAtv, 54, 580);
                }
              }}
              aria-label={fp.label ?? `Walk to floor waypoint ${fp.index + 1}`}
              title={fp.label ?? `Walk to Step ${fp.index + 1}`}
              className="group absolute z-15 cursor-pointer"
              style={{
                left: `${fp.proj.x}px`,
                top: `${fp.proj.y}px`,
                transform: "translate(-50%, -50%)",
              }}
            >
              <div
                className="flex size-9 items-center justify-center rounded-full border-2 border-[#FCD116]/90 bg-slate-950/70 text-[#FCD116] shadow-lg transition-transform duration-150 group-hover:scale-125 group-hover:bg-[#FCD116] group-hover:text-slate-950"
                style={{
                  transform: "perspective(240px) rotateX(50deg)",
                  boxShadow: "0 0 14px rgba(252, 209, 22, 0.38)",
                }}
              >
                <Footprints className="size-3.5" />
              </div>
              {fp.label ? (
                <span className="pointer-events-none absolute bottom-full left-1/2 mb-1 hidden -translate-x-1/2 rounded-full border border-white/20 bg-slate-950/90 px-2.5 py-0.5 text-[10.5px] font-bold whitespace-nowrap text-white shadow-md group-hover:block">
                  {fp.label}
                </span>
              ) : null}
            </button>
          );
        })}

      {/* Top Bar: Multi-Room Switcher + Always-Visible Mobile/Desktop Full View Button */}
      <div
        className="pointer-events-none absolute inset-x-0 top-2.5 z-30 flex items-center justify-between gap-1.5 px-2.5 sm:top-3 sm:flex-wrap sm:gap-2 sm:px-3"
        style={isFullscreen ? { top: "max(0.75rem, env(safe-area-inset-top))" } : undefined}
      >
        <div className="pointer-events-auto flex min-w-0 flex-1 items-center gap-1 overflow-x-auto rounded-full border border-white/20 bg-slate-950/82 p-1 text-[11px] font-bold text-white backdrop-blur-md sm:max-w-full sm:flex-initial">
          {scenes.map((sc) => {
            const on = sc.id === currentSceneId;
            const isUpstairsTab = sc.id.includes("upstairs") || sc.floorLabel?.includes("2F");
            return (
              <button
                key={sc.id}
                type="button"
                onClick={() => switchScene(sc.id)}
                className="flex shrink-0 cursor-pointer items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-extrabold transition-all"
                style={{
                  backgroundColor: on ? C.foil : "transparent",
                  color: on ? C.ink : "#FFFFFF",
                }}
              >
                {isUpstairsTab ? (
                  <ArrowUpDown className="size-3" />
                ) : (
                  <DoorOpen className="size-3" />
                )}
                <span>{sc.shortLabel}</span>
              </button>
            );
          })}
        </div>

        <div className="flex shrink-0 items-center gap-1.5">
          {panoDimensions ? (
            <span
              className="hidden items-center gap-1 rounded-full px-2.5 py-1 text-[10.5px] font-extrabold uppercase tracking-wider text-white backdrop-blur-md sm:inline-flex"
              style={{
                backgroundColor: is16kActive
                  ? "#047857"
                  : is12kActive
                    ? "#0369A1"
                    : "rgba(15, 23, 42, 0.80)",
                border: is16kActive
                  ? "1px solid #6EE7B7"
                  : is12kActive
                    ? "1px solid #7DD3FC"
                    : "1px solid rgba(255, 255, 255, 0.2)",
              }}
            >
              {streamingTiles
                ? "Instant Preview · Streaming UHD…"
                : `${is16kActive ? "16K SMOOTH · " : is12kActive ? "12K UHD · " : ""}${panoDimensions.w.toLocaleString()}×${panoDimensions.h.toLocaleString()}`}
            </span>
          ) : null}

          <span
            className="hidden items-center gap-1.5 rounded-full border border-[#FCD116]/40 bg-slate-950/75 px-2.5 py-1 text-[10.5px] font-bold text-[#FCD116] backdrop-blur-md xl:inline-flex"
            style={{ fontFamily: F.mono }}
          >
            <Compass className="size-3.5" />
            {Math.round(wrapDeg360(cam.hlookat))}° {cardinalDirection(cam.hlookat)} · FOV{" "}
            {Math.round(cam.fov)}°
          </span>

          <button
            type="button"
            onClick={() => setXmlModalOpen(true)}
            className="pointer-events-auto hidden cursor-pointer items-center gap-1 rounded-full border border-white/25 bg-slate-950/75 px-2.5 py-1 text-[11px] font-bold text-white backdrop-blur-md hover:bg-slate-900 sm:inline-flex"
            title="Inspect krpano XML configuration"
          >
            <Code2 className="size-3.5 text-[#FCD116]" /> XML
          </button>

          <button
            type="button"
            onClick={toggleFullscreen}
            aria-label={isFullscreen ? "Exit full screen 360 view" : "Open full screen 360 view"}
            className="pointer-events-auto inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-white/25 px-3 py-1.5 text-[11px] font-extrabold shadow-lg backdrop-blur-md transition-colors"
            style={{
              backgroundColor: isFullscreen ? "#CE1126" : "#0038A8",
              color: "#FFFFFF",
            }}
            title={isFullscreen ? "Exit Full Screen 360°" : "Open Full Screen 360° View"}
          >
            {isFullscreen ? (
              <Minimize2 className="size-3.5 shrink-0" />
            ) : (
              <Maximize2 className="size-3.5 shrink-0" />
            )}
            <span>{isFullscreen ? "Exit Full" : "Full View"}</span>
          </button>
        </div>
      </div>

      {/* 3D Spherical Hotspots: Art Pins (Compact & Disappear When Clicked!) + Doors & Stairs */}
      {!activeArtCard &&
        resolvedHotspots.map((hs, idx) => {
          const proj = projectHotspotToScreen(hs.ath, hs.atv, cam, viewport.width, viewport.height);
          if (!proj.visible) return null;

          const isStairs = hs.kind === "stairs-up" || hs.kind === "stairs-down";
          const isDoor = Boolean(hs.targetSceneId) && !isStairs;
          const isPortal = isStairs || isDoor;

          // CRITICAL UX: Once an art piece is clicked, its pin & name disappear completely so NOTHING overlaps the art piece!
          if (!isPortal && hs.id === hiddenArtPinId) {
            return null;
          }

          if (isPortal) {
            const bg = isStairs ? "rgba(180, 83, 9, 0.90)" : "rgba(5, 150, 105, 0.90)";
            const border = isStairs ? "#FDE68A" : "#A7F3D0";
            return (
              <button
                key={hs.id}
                type="button"
                onClick={() => handleHotspotActivate(hs)}
                aria-label={hs.title}
                className="group absolute z-25 -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-transform duration-150 hover:scale-110"
                style={{ left: `${proj.x}px`, top: `${proj.y}px` }}
              >
                <div
                  className="flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-white shadow-xl backdrop-blur-md"
                  style={{ backgroundColor: bg, borderColor: border }}
                >
                  <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-white text-[11px]">
                    {hs.badge}
                  </span>
                  <span
                    className="max-w-[140px] truncate text-[11.5px] font-extrabold sm:max-w-[185px]"
                    style={{ fontFamily: F.body }}
                  >
                    {hs.title}
                  </span>
                </div>
              </button>
            );
          }

          // Compact, Non-Intrusive Circular Museum Pin for Art Pieces (Title ONLY on hover BELOW pin — never blocks painting!)
          const isSelected = hs.id === selectedHotspotId;
          return (
            <button
              key={hs.id}
              type="button"
              onClick={() => handleHotspotActivate(hs)}
              aria-label={`Art piece ${idx + 1}: ${hs.title}`}
              className="group absolute z-22 -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-transform duration-150 hover:z-30 hover:scale-115"
              style={{ left: `${proj.x}px`, top: `${proj.y}px` }}
            >
              <span
                className="pointer-events-none absolute -inset-1.5 animate-ping rounded-full opacity-35"
                style={{
                  backgroundColor: C.foil,
                  animationDuration: "2.8s",
                }}
              />
              <div
                className="relative flex size-8 items-center justify-center rounded-full border-2 text-[12px] font-extrabold shadow-[0_4px_16px_rgba(0,0,0,0.65)] backdrop-blur-md transition-colors"
                style={{
                  backgroundColor: isSelected ? C.foil : "rgba(15, 23, 42, 0.86)",
                  borderColor: isSelected ? "#FFFFFF" : C.foil,
                  color: isSelected ? C.ink : "#FCD116",
                }}
              >
                {hs.badge ?? idx + 1}
              </div>
              {/* Hover-only caption positioned BELOW the pin so the painting above stays 100% clear */}
              <span className="pointer-events-none absolute top-full left-1/2 mt-1.5 hidden -translate-x-1/2 rounded-full border border-white/20 bg-slate-950/92 px-2.5 py-0.5 text-[11px] font-bold whitespace-nowrap text-white shadow-xl group-hover:block">
                {hs.title}
              </span>
            </button>
          );
        })}

      {/* UNBOXED Floating High-Resolution Art Piece Spotlight (Whole Uncropped Artwork + Separate Side Details!) */}
      {activeArtCard && !activeArtCard.targetSceneId && (
        <div
          data-art-card="true"
          role="dialog"
          aria-modal="true"
          aria-label={`High-resolution artwork inspection: ${activeArtCard.title}`}
          onClick={() => setActiveArtCard(null)}
          className="pointer-events-auto absolute inset-0 z-40 flex flex-col items-center justify-center gap-3 overflow-y-auto bg-slate-950/76 p-3 backdrop-blur-[3px] sm:p-5 md:flex-row md:items-center md:justify-center md:gap-6"
          style={
            isFullscreen
              ? {
                  paddingTop: "max(0.75rem, env(safe-area-inset-top))",
                  paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))",
                }
              : undefined
          }
        >
          {/* Open Floating Whole Art Piece Stage — ZERO Box, ZERO Cropping (object-contain), ZERO Text Overlapping Art! */}
          <div
            onClick={(e) => e.stopPropagation()}
            className={`flex flex-col items-center justify-center transition-all duration-200 ${
              showArtDetails ? "w-full md:flex-1" : "w-full max-w-5xl"
            }`}
          >
            <div
              onPointerDown={(e) => {
                if (artZoom <= 1) return;
                e.stopPropagation();
                artDragRef.current = {
                  startX: e.clientX,
                  startY: e.clientY,
                  origX: artPan.x,
                  origY: artPan.y,
                };
                e.currentTarget.setPointerCapture?.(e.pointerId);
              }}
              onPointerMove={(e) => {
                if (!artDragRef.current || artZoom <= 1) return;
                e.stopPropagation();
                const dx = e.clientX - artDragRef.current.startX;
                const dy = e.clientY - artDragRef.current.startY;
                const maxPan = 160 * (artZoom - 1);
                setArtPan({
                  x: clamp(artDragRef.current.origX + dx, -maxPan, maxPan),
                  y: clamp(artDragRef.current.origY + dy, -maxPan, maxPan),
                });
              }}
              onPointerUp={() => {
                artDragRef.current = null;
              }}
              onPointerCancel={() => {
                artDragRef.current = null;
              }}
              onDoubleClick={() => {
                if (artZoom > 1) {
                  setArtZoom(1);
                  setArtPan({ x: 0, y: 0 });
                } else {
                  setArtZoom(2.2);
                }
              }}
              className={`relative flex items-center justify-center overflow-hidden rounded-lg shadow-[0_28px_70px_rgba(0,0,0,0.92)] ring-1 ring-[#FCD116]/45 ${
                artZoom > 1 ? "cursor-grab active:cursor-grabbing" : "cursor-zoom-in"
              }`}
            >
              <img
                src={
                  activeArtCard.artDetails?.imageUrl ??
                  "/panoramas/artworks/kawit-proclamation-hd.webp"
                }
                alt={activeArtCard.title}
                draggable={false}
                className={`block w-auto max-w-full object-contain transition-transform duration-150 ${
                  isFullscreen
                    ? showArtDetails
                      ? "max-h-[38dvh] sm:max-h-[52dvh] md:max-h-[76dvh]"
                      : "max-h-[72dvh] md:max-h-[82dvh]"
                    : showArtDetails
                      ? "max-h-[215px] sm:max-h-[345px]"
                      : "max-h-[270px] sm:max-h-[410px]"
                }`}
                style={{
                  transform: `scale(${artZoom}) translate(${artPan.x / artZoom}px, ${artPan.y / artZoom}px)`,
                }}
              />
            </div>

            {/* Minimal Floating Glass Controls BELOW the Artwork — Never Overlapping the Painting! */}
            <div className="mt-2.5 flex flex-wrap items-center justify-center gap-1.5 rounded-full border border-white/15 bg-slate-950/82 px-2.5 py-1 text-[11px] font-bold text-white shadow-xl backdrop-blur-md">
              {[
                { z: 1, label: "1× Whole Art" },
                { z: 2, label: "2× Detail" },
                { z: 3.2, label: "3.2× Macro" },
              ].map((opt) => {
                const activeZ = Math.abs(artZoom - opt.z) < 0.1;
                return (
                  <button
                    key={opt.label}
                    type="button"
                    onClick={() => {
                      setArtZoom(opt.z);
                      if (opt.z === 1) setArtPan({ x: 0, y: 0 });
                    }}
                    className="cursor-pointer rounded-full px-2.5 py-0.5 transition-colors"
                    style={{
                      backgroundColor: activeZ ? C.foil : "transparent",
                      color: activeZ ? C.ink : "#E2E8F0",
                    }}
                  >
                    {opt.label}
                  </button>
                );
              })}

              <span className="h-3.5 w-px bg-white/20" />

              <button
                type="button"
                onClick={() => setShowArtDetails((v) => !v)}
                className="inline-flex cursor-pointer items-center gap-1 rounded-full px-2.5 py-0.5 text-slate-200 hover:bg-white/10"
              >
                {showArtDetails ? <EyeOff className="size-3" /> : <Eye className="size-3" />}
                <span>{showArtDetails ? "Pure Art Only" : "Show Details"}</span>
              </button>

              {!showArtDetails && (
                <button
                  type="button"
                  onClick={() => setActiveArtCard(null)}
                  className="inline-flex cursor-pointer items-center gap-1 rounded-full bg-white/15 px-2.5 py-0.5 text-white hover:bg-white/25"
                >
                  <X className="size-3" /> 360°
                </button>
              )}
            </div>
          </div>

          {/* Sleek Translucent Side Details Drawer — Artwork Name & Description Live ONLY Here (Zero Overlap!) */}
          {showArtDetails && (
            <div
              onClick={(e) => e.stopPropagation()}
              className={`flex w-full flex-col justify-between overflow-y-auto rounded-2xl border border-white/15 bg-slate-950/88 p-4 text-white shadow-2xl backdrop-blur-xl md:w-[335px] md:shrink-0 lg:w-[365px] ${
                isFullscreen ? "max-h-[42dvh] md:max-h-[78dvh]" : "max-h-[240px] sm:max-h-[410px]"
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <span className="inline-flex items-center gap-1 rounded-full border border-[#FCD116]/35 bg-[#FCD116]/15 px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-[#FCD116]">
                    {activeArtCard.artDetails?.zone ?? activeScene?.shortLabel ?? "Curated Exhibit"}
                  </span>
                  <button
                    type="button"
                    onClick={() => setActiveArtCard(null)}
                    aria-label="Close art piece spotlight"
                    className="flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-full border border-white/20 text-slate-300 hover:bg-white/15 hover:text-white"
                  >
                    <X className="size-3.5" />
                  </button>
                </div>

                <h4
                  className="mt-2 text-[17px] leading-snug font-extrabold text-white sm:text-[19px]"
                  style={{ fontFamily: F.display }}
                >
                  {activeArtCard.title}
                </h4>

                {activeArtCard.artDetails?.filTitle ? (
                  <p className="mt-0.5 text-[12px] font-medium italic text-[#93C5FD]">
                    “{activeArtCard.artDetails.filTitle}”
                  </p>
                ) : null}

                <div className="mt-2.5 space-y-1 border-y border-white/10 py-2 text-[11.5px] text-slate-300">
                  {activeArtCard.artDetails?.artist ? (
                    <div>
                      <span className="font-bold text-slate-400">Artist / Maker: </span>
                      <span className="font-semibold text-white">
                        {activeArtCard.artDetails.artist}
                      </span>
                    </div>
                  ) : null}
                  <div>
                    <span className="font-bold text-slate-400">Period: </span>
                    <span className="font-semibold text-white">
                      {activeArtCard.artDetails?.period ??
                        activeArtCard.subtitle ??
                        "CALABARZON Heritage Collection"}
                    </span>
                  </div>
                  {activeArtCard.artDetails?.medium ? (
                    <div>
                      <span className="font-bold text-slate-400">Medium: </span>
                      <span className="font-semibold text-white">
                        {activeArtCard.artDetails.medium}
                      </span>
                    </div>
                  ) : null}
                  {activeArtCard.artDetails?.dimensions ? (
                    <div>
                      <span className="font-bold text-slate-400">Scale: </span>
                      <span className="font-semibold text-white">
                        {activeArtCard.artDetails.dimensions}
                      </span>
                    </div>
                  ) : null}
                </div>

                <p
                  className="mt-2.5 text-[13px] leading-relaxed text-slate-200"
                  style={{ fontFamily: F.body }}
                >
                  {activeArtCard.artDetails?.description ??
                    "Inspect the entire uncropped artwork in high resolution, or step back to continue exploring the 360° room."}
                </p>

                {activeArtCard.artDetails?.conservationNote ||
                activeArtCard.artDetails?.highlight ? (
                  <p className="mt-2 text-[11.5px] font-medium text-[#FDE68A]">
                    ✦{" "}
                    {activeArtCard.artDetails.conservationNote ??
                      activeArtCard.artDetails.highlight}
                  </p>
                ) : null}
              </div>

              <div className="mt-3.5 flex flex-wrap items-center justify-between gap-2 border-t border-white/10 pt-3">
                {roomArtHotspots.length > 1 ? (
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => cycleForegroundArt(-1)}
                      className="inline-flex cursor-pointer items-center gap-0.5 rounded-full border border-white/20 bg-white/10 px-2.5 py-1 text-[11px] font-bold text-white hover:bg-white/20"
                    >
                      <ChevronLeft className="size-3.5" /> Prev
                    </button>
                    <button
                      type="button"
                      onClick={() => cycleForegroundArt(1)}
                      className="inline-flex cursor-pointer items-center gap-0.5 rounded-full border border-white/20 bg-white/10 px-2.5 py-1 text-[11px] font-bold text-white hover:bg-white/20"
                    >
                      Next <ChevronRight className="size-3.5" />
                    </button>
                  </div>
                ) : (
                  <span />
                )}

                <button
                  type="button"
                  onClick={() => setActiveArtCard(null)}
                  className="inline-flex cursor-pointer items-center gap-1 rounded-full px-3.5 py-1 text-[11.5px] font-extrabold shadow-sm"
                  style={{ backgroundColor: C.foil, color: C.ink }}
                >
                  Back to 360°
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Optional Custom Overlay */}
      {children}

      {/* krpano Floating Control Dock */}
      {!activeArtCard && (
        <div
          className="absolute bottom-2.5 left-1/2 z-30 flex max-w-[calc(100%-1rem)] -translate-x-1/2 items-center gap-0.5 overflow-x-auto rounded-full border border-white/20 bg-slate-950/85 px-2 py-1 text-white shadow-2xl backdrop-blur-md sm:bottom-3 sm:gap-1 sm:px-2.5 sm:py-1.5"
          style={isFullscreen ? { bottom: "max(0.75rem, env(safe-area-inset-bottom))" } : undefined}
        >
          <button
            type="button"
            onClick={() => nudgeCamera(-35, 0)}
            aria-label="Rotate left"
            className="flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-full hover:bg-white/15"
            title="Pan Left"
          >
            <MoveLeft className="size-4" />
          </button>
          <button
            type="button"
            onClick={() => nudgeCamera(35, 0)}
            aria-label="Rotate right"
            className="flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-full hover:bg-white/15"
            title="Pan Right"
          >
            <MoveRight className="size-4" />
          </button>
          <button
            type="button"
            onClick={() => nudgeCamera(0, 22)}
            aria-label="Tilt up"
            className="hidden size-8 shrink-0 cursor-pointer items-center justify-center rounded-full hover:bg-white/15 sm:flex"
            title="Look Up"
          >
            <MoveUp className="size-4" />
          </button>
          <button
            type="button"
            onClick={() => nudgeCamera(0, -22)}
            aria-label="Tilt down"
            className="hidden size-8 shrink-0 cursor-pointer items-center justify-center rounded-full hover:bg-white/15 sm:flex"
            title="Look Down"
          >
            <MoveDown className="size-4" />
          </button>

          <span className="mx-0.5 h-4 w-px shrink-0 bg-white/20" />

          <button
            type="button"
            onClick={() => nudgeCamera(0, 0, -14)}
            aria-label="Zoom in"
            className="flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-full hover:bg-white/15"
            title="Zoom In (16K Smooth Detail)"
          >
            <ZoomIn className="size-4" />
          </button>
          <button
            type="button"
            onClick={() => nudgeCamera(0, 0, 14)}
            aria-label="Zoom out"
            className="flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-full hover:bg-white/15"
            title="Zoom Out"
          >
            <ZoomOut className="size-4" />
          </button>

          <span className="mx-0.5 h-4 w-px shrink-0 bg-white/20" />

          <button
            type="button"
            onClick={stepAlongPath}
            className="flex h-8 shrink-0 cursor-pointer items-center gap-1 rounded-full bg-[#FCD116] px-3 text-[11px] font-extrabold text-[#0F172A] hover:bg-[#FDE047]"
            title="Walk to the next artwork, staircase, or doorway along the museum path"
          >
            <Footprints className="size-3.5" />
            <span>Walk Path</span>
          </button>

          <button
            type="button"
            onClick={() => setShowPath((v) => !v)}
            className="hidden h-8 shrink-0 cursor-pointer items-center gap-1 rounded-full px-2.5 text-[11px] font-bold transition-colors md:flex"
            style={{
              backgroundColor: showPath ? "rgba(252, 209, 22, 0.2)" : "transparent",
              border: showPath ? "1px solid rgba(252, 209, 22, 0.6)" : "1px solid transparent",
              color: showPath ? "#FDE68A" : "#94A3B8",
            }}
            title="Show/Hide 3D Floor Trail"
          >
            <span>Trail</span>
          </button>

          <button
            type="button"
            onClick={() => setHdCrisp((v) => !v)}
            className="hidden h-8 shrink-0 cursor-pointer items-center gap-1 rounded-full px-2.5 text-[11px] font-bold transition-colors lg:flex"
            style={{
              backgroundColor: hdCrisp ? "rgba(16, 185, 129, 0.25)" : "transparent",
              border: hdCrisp ? "1px solid #34D399" : "1px solid transparent",
              color: hdCrisp ? "#A7F3D0" : "#94A3B8",
            }}
            title="Toggle Contrast-Adaptive HD Sharpening Filter"
          >
            <Sparkles className="size-3.5" />
            <span>16K Crisp</span>
          </button>

          <button
            type="button"
            onClick={() => setAutoRotate((v) => !v)}
            className="flex h-8 shrink-0 cursor-pointer items-center gap-1 rounded-full px-2.5 text-[11px] font-bold transition-colors"
            style={{
              backgroundColor: autoRotate ? C.foil : "transparent",
              color: autoRotate ? C.ink : "#FFFFFF",
            }}
            title="Toggle 360° Auto-Rotation"
          >
            <RotateCw className="size-3.5" />
            <span className="hidden sm:inline">{autoRotate ? "Pause" : "Spin"}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveArtCard(null);
              setHiddenArtPinId(null);
              hiddenArtAnchorRef.current = null;
              lookTo(
                activeScene?.initialHlookat ?? 0,
                activeScene?.initialVlookat ?? 1,
                activeScene?.initialFov ?? 80,
                550,
              );
            }}
            aria-label="Reset 360 view"
            className="flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-full hover:bg-white/15"
            title="Reset View"
          >
            <RotateCcw className="size-4" />
          </button>

          <button
            type="button"
            onClick={toggleFullscreen}
            aria-label="Toggle fullscreen"
            className="flex h-8 shrink-0 cursor-pointer items-center gap-1 rounded-full bg-[#0038A8] px-2.5 text-[11px] font-extrabold text-white hover:bg-[#1D4ED8] sm:px-3"
            title="Fullscreen 16K Ultra-HD 360°"
          >
            {isFullscreen ? <Minimize2 className="size-3.5" /> : <Maximize2 className="size-3.5" />}
            <span className="inline md:hidden">{isFullscreen ? "Exit" : "Full"}</span>
            <span className="hidden md:inline">{isFullscreen ? "Exit" : "Fullscreen 16K"}</span>
          </button>
        </div>
      )}

      {/* krpano XML Inspector Modal */}
      {xmlModalOpen && (
        <div
          className="absolute inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-xs"
          onClick={() => setXmlModalOpen(false)}
        >
          <div
            className="flex max-h-[85%] w-full max-w-xl flex-col overflow-hidden rounded-2xl border border-[#CBD5E1] bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-[#E2E8F0] px-4 py-3">
              <div>
                <span
                  className="text-[11px] font-extrabold uppercase tracking-wider"
                  style={{ color: C.cover }}
                >
                  krpano 1.21 Smooth 16K Multi-Gallery Configuration
                </span>
                <h4 className="text-[15px] font-bold" style={{ color: C.ink }}>
                  /krpano/tour.xml ({resolvedSceneTitle})
                </h4>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopyXml}
                  className="inline-flex cursor-pointer items-center gap-1 rounded-lg bg-[#EFF6FF] px-3 py-1.5 text-[12px] font-bold text-[#0038A8] hover:bg-[#DBEAFE]"
                >
                  {copiedXml ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
                  {copiedXml ? "Copied" : "Copy XML"}
                </button>
                <button
                  type="button"
                  onClick={() => setXmlModalOpen(false)}
                  className="cursor-pointer rounded-lg border border-[#CBD5E1] px-2.5 py-1 text-[12px] font-bold text-[#475569] hover:bg-[#F8FAFC]"
                >
                  Close
                </button>
              </div>
            </div>
            <pre
              className="flex-1 overflow-auto bg-[#0F172A] p-4 text-[11.5px] leading-relaxed text-[#E2E8F0]"
              style={{ fontFamily: F.mono }}
            >
              {generatedXml}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}
