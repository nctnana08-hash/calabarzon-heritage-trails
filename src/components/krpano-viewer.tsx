import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowUpDown,
  Check,
  ChevronRight,
  Code2,
  Compass,
  Copy,
  DoorOpen,
  Footprints,
  Info,
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
  CALABARZON_12K_PANO_URL,
  DEFAULT_MUSEUM_SCENES,
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
  preview?: ImageBitmap;
  tiles?: [ImageBitmap, ImageBitmap, ImageBitmap, ImageBitmap];
  padFrac: number;
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

  const tanHalfFov = Math.tan((cam.fov * Math.PI) / 360);
  const aspect = width / height;

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
 * Progressive Instant-Preview + 4-Sector 12K Native GPU Tile Shader
 * + AMD FidelityFX Contrast-Adaptive Sharpening (CAS) for Zero Fullscreen Blur.
 */
const FRAGMENT_SHADER_SRC = `
precision highp float;
varying vec2 v_ndc;

uniform sampler2D u_tex0;
uniform sampler2D u_tex1;
uniform sampler2D u_tex2;
uniform sampler2D u_tex3;
uniform sampler2D u_previewTex;

uniform vec3 u_camF;
uniform vec3 u_camR;
uniform vec3 u_camU;
uniform float u_tanHalfFov;
uniform float u_aspect;
uniform float u_padFrac;
uniform vec2 u_texelStep;
uniform float u_sharpness;
uniform float u_useTiles;

const float PI = 3.14159265358979323846;

vec3 sampleSphere(vec2 uv) {
  float u = fract(uv.x);
  float v = clamp(uv.y, 0.0005, 0.9995);

  if (u_useTiles < 0.5) {
    return texture2D(u_previewTex, vec2(u, v)).rgb;
  }

  float scaled = u * 4.0;
  float sector = floor(scaled);
  float localFrac = scaled - sector;
  float tileU = u_padFrac + localFrac * (1.0 - 2.0 * u_padFrac);
  vec2 tuv = vec2(tileU, v);

  if (sector < 0.5) {
    return texture2D(u_tex0, tuv).rgb;
  } else if (sector < 1.5) {
    return texture2D(u_tex1, tuv).rgb;
  } else if (sector < 2.5) {
    return texture2D(u_tex2, tuv).rgb;
  } else {
    return texture2D(u_tex3, tuv).rgb;
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

  vec2 uv = vec2(fract((lon / (2.0 * PI)) + 0.5), clamp(0.5 - (lat / PI), 0.0005, 0.9995));
  vec3 c = sampleSphere(uv);

  if (u_sharpness > 0.01 && u_useTiles > 0.5) {
    float cosLat = max(0.25, cos(lat));
    vec2 stepUV = vec2(u_texelStep.x / cosLat, u_texelStep.y);

    vec3 n = sampleSphere(uv + vec2(0.0, -stepUV.y));
    vec3 s = sampleSphere(uv + vec2(0.0,  stepUV.y));
    vec3 e = sampleSphere(uv + vec2( stepUV.x, 0.0));
    vec3 w = sampleSphere(uv + vec2(-stepUV.x, 0.0));

    vec3 minRGB = min(min(min(n, s), min(e, w)), c);
    vec3 maxRGB = max(max(max(n, s), max(e, w)), c);
    vec3 amp = sqrt(clamp(min(minRGB, 1.0 - maxRGB) / max(maxRGB, vec3(0.0001)), 0.0, 1.0));
    vec3 weight = -amp / mix(8.5, 4.8, u_sharpness);

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
  previewTex: WebGLTexture | null;
  maxAniso: number;
  anisoExt: EXT_texture_filter_anisotropic | null;
  maxTexSize: number;
  padFrac: number;
  texelStep: [number, number];
  useTiles: number;
};

export function KrpanoViewer({
  panoramaUrl,
  fallbackPanoramaUrl = CALABARZON_12K_PANO_URL,
  sceneName = "scene_sulyap_calabarzon_12k",
  sceneTitle = "SulyapPH 12K Ultra-HD Heritage Atrium",
  scenes = DEFAULT_MUSEUM_SCENES,
  activeSceneId,
  onSceneChange,
  hotspots,
  selectedHotspotId,
  onSelectHotspot,
  initialHlookat = 0,
  initialVlookat = 2,
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
    activeSceneId ?? scenes[0]?.id ?? "salon12k",
  );
  const currentSceneId = activeSceneId ?? internalSceneId;
  const activeScene = useMemo(
    () => scenes.find((s) => s.id === currentSceneId) ?? scenes[0],
    [scenes, currentSceneId],
  );

  const resolvedPanoUrl = panoramaUrl ?? activeScene?.panoramaUrl ?? CALABARZON_12K_PANO_URL;
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
    fov: clamp(activeScene?.initialFov ?? initialFov, 20, 115),
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
  const [activeArtCard, setActiveArtCard] = useState<KrpanoHotspot | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
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
  const velocityRef = useRef<{ h: number; v: number }>({ h: 0, v: 0 });
  const lookToRef = useRef<LookToAnimation | null>(null);

  const autoRotateRef = useRef<boolean>(autoRotate);
  autoRotateRef.current = autoRotate;
  const hdCrispRef = useRef<boolean>(hdCrisp);
  hdCrispRef.current = hdCrisp;

  // Smooth krpano lookto(ath, atv, fov) camera interpolation (supports deep 20° Macro UHD zoom!)
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
      targetFov: clamp(fov, 20, 115),
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
      setPathStepIdx(0);

      const performSwitch = () => {
        setIsTransitioning(true);
        setInternalSceneId(nextSceneId);
        onSceneChange?.(nextSceneId);

        const arriveH = customLook?.ath ?? nextScene.initialHlookat ?? 0;
        const arriveV = customLook?.atv ?? nextScene.initialVlookat ?? 2;
        const arriveFov = customLook?.fov ?? nextScene.initialFov ?? 80;

        const nextCam: CameraState = {
          hlookat: wrapDeg180(arriveH),
          vlookat: clamp(arriveV, -82, 82),
          fov: clamp(arriveFov + 8, 20, 115),
        };
        camRef.current = nextCam;
        setCam(nextCam);

        window.setTimeout(() => {
          setIsTransitioning(false);
          setTransitionBanner(null);
          lookTo(arriveH, arriveV, arriveFov, 520);
        }, 160);
      };

      if (viaPortal) {
        // Walk toward the door / climb stairs smoothly first!
        setTransitionBanner(viaPortal.label);
        lookTo(viaPortal.ath, viaPortal.atv, 44, 300);
        window.setTimeout(performSwitch, 280);
      } else {
        performSwitch();
      }
    },
    [scenes, onSceneChange, lookTo],
  );

  // Trigger smooth lookto (and optional scene switch) whenever external targetView prop changes
  useEffect(() => {
    if (!targetView) return;
    if (targetView.sceneId && targetView.sceneId !== currentSceneId) {
      switchScene(targetView.sceneId, {
        ath: targetView.ath,
        atv: targetView.atv,
        fov: targetView.fov,
      });
    } else {
      lookTo(targetView.ath, targetView.atv, targetView.fov ?? 46, 650);
    }
  }, [targetView, currentSceneId, switchScene, lookTo]);

  // Observe container size for crisp retina WebGL viewport and accurate 3D hotspot coordinates
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
    if (typeof ResizeObserver !== "undefined") {
      const ro = new ResizeObserver(updateSize);
      ro.observe(el);
      return () => ro.disconnect();
    }
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  // Track fullscreen changes
  useEffect(() => {
    const onFs = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener("fullscreenchange", onFs);
    return () => document.removeEventListener("fullscreenchange", onFs);
  }, []);

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
    const uPadFrac = gl.getUniformLocation(program, "u_padFrac");
    const uTexelStep = gl.getUniformLocation(program, "u_texelStep");
    const uSharpness = gl.getUniformLocation(program, "u_sharpness");
    const uUseTiles = gl.getUniformLocation(program, "u_useTiles");

    const texLocs = [
      gl.getUniformLocation(program, "u_tex0"),
      gl.getUniformLocation(program, "u_tex1"),
      gl.getUniformLocation(program, "u_tex2"),
      gl.getUniformLocation(program, "u_tex3"),
    ];
    const previewLoc = gl.getUniformLocation(program, "u_previewTex");

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

    const textures = [0, 1, 2, 3].map((u) => initPlaceholderTex(u, texLocs[u] ?? null));
    const previewTex = initPlaceholderTex(4, previewLoc);

    const handle: GlHandle = {
      gl,
      textures,
      previewTex,
      maxAniso,
      anisoExt,
      maxTexSize,
      padFrac: 16 / 3032,
      texelStep: [1 / 12000, 1 / 6000],
      useTiles: 0,
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
          fov: clamp(anim.startFov + (anim.targetFov - anim.startFov) * ease, 20, 115),
        };
        if (t >= 1) {
          lookToRef.current = null;
          lastReactSync = 0; // Guarantee exact final sync
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
            hlookat: wrapDeg180(camRef.current.hlookat + 0.15),
          };
          moved = true;
        }
      }

      // Sync React HUD / Hotspot projections smoothly at ~30Hz during automated motion (zero main-thread lag!)
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
      const tanHalfFov = Math.tan((camRef.current.fov * Math.PI) / 360);
      const aspect = canvas.width / Math.max(1, canvas.height);

      gl.uniform3fv(uCamF, Fvec);
      gl.uniform3fv(uCamR, Rvec);
      gl.uniform3fv(uCamU, Uvec);
      gl.uniform1f(uTanHalfFov, tanHalfFov);
      gl.uniform1f(uAspect, aspect);
      gl.uniform1f(uPadFrac, handle.padFrac);
      gl.uniform2fv(uTexelStep, handle.texelStep);
      gl.uniform1f(uSharpness, hdCrispRef.current ? 0.72 : 0.0);
      gl.uniform1f(uUseTiles, handle.useTiles);

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
      if (previewTex) gl.deleteTexture(previewTex);
    };
  }, []);

  // 2. ZERO-LAG PROGRESSIVE TEXTURE STREAMER (Instant <35ms Preview + Staggered Off-Thread 12K Tiles!)
  const activeTileUrls = activeScene?.tileUrls;
  const activePreviewUrl = activeScene?.previewUrl;
  const activeTilePadFrac = activeScene?.tilePadFrac ?? 16 / 3032;
  const activeNativeW = activeScene?.nativeWidth;
  const activeNativeH = activeScene?.nativeHeight;
  const useCustomSingleUrl = Boolean(panoramaUrl);

  useEffect(() => {
    const handle = glHandleRef.current;
    if (!handle) return;
    const { gl, textures, previewTex, anisoExt, maxAniso, maxTexSize } = handle;

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
      const cacheKey =
        !useCustomSingleUrl && activeTileUrls
          ? `tiles:${currentSceneId}`
          : `url:${resolvedPanoUrl}`;

      // Fast path: already decoded in RAM cache -> upload across frames with 0ms decode!
      const cached = ROOM_BITMAP_CACHE.get(cacheKey);
      if (cached?.tiles) {
        if (cached.preview) {
          uploadToUnit(4, previewTex, cached.preview, true);
          handle.useTiles = 0;
        }
        setPanoDimensions({ w: cached.w, h: cached.h });
        handle.padFrac = cached.padFrac;
        handle.texelStep = [1 / cached.w, 1 / cached.h];
        for (let k = 0; k < 4; k++) {
          if (aborted) return;
          uploadToUnit(k, textures[k] ?? null, cached.tiles[k]!);
          await nextAnimationFrame();
        }
        if (!aborted) {
          handle.useTiles = 1;
          setStreamingTiles(false);
        }
        return;
      }

      // Progressive Pre-Cut Tile Path (Zero Main-Thread Canvas Slicing!)
      if (!useCustomSingleUrl && activeTileUrls && activePreviewUrl) {
        setStreamingTiles(true);
        try {
          // Phase A: Instant <35ms 2048x1024 WebP preview sphere!
          const prevBmp = await fetchBitmap(activePreviewUrl, abortCtrl.signal);
          if (aborted) return;
          uploadToUnit(4, previewTex, prevBmp, true);
          handle.useTiles = 0;
          const wEst = activeNativeW ?? 12000;
          const hEst = activeNativeH ?? 6000;
          setPanoDimensions({ w: wEst, h: hEst });

          // Phase B: Off-main-thread parallel decode of all 4 pre-cut UHD GPU tiles!
          const decodedTiles = await Promise.all(
            activeTileUrls.map((u) => fetchBitmap(u, abortCtrl.signal)),
          );
          if (aborted) return;

          // Upload ONE tile per animation frame so pan/drag never drops a single frame!
          for (let k = 0; k < 4; k++) {
            if (aborted) return;
            await nextAnimationFrame();
            if (aborted) return;
            uploadToUnit(k, textures[k] ?? null, decodedTiles[k]!);
          }

          if (aborted) return;
          handle.padFrac = activeTilePadFrac;
          handle.texelStep = [1 / wEst, 1 / hEst];
          handle.useTiles = 1;
          setStreamingTiles(false);

          if (
            typeof ImageBitmap !== "undefined" &&
            prevBmp instanceof ImageBitmap &&
            decodedTiles.every((b): b is ImageBitmap => b instanceof ImageBitmap)
          ) {
            if (ROOM_BITMAP_CACHE.size >= 4) {
              const oldest = ROOM_BITMAP_CACHE.keys().next().value;
              if (oldest) ROOM_BITMAP_CACHE.delete(oldest);
            }
            ROOM_BITMAP_CACHE.set(cacheKey, {
              preview: prevBmp,
              tiles: decodedTiles as [ImageBitmap, ImageBitmap, ImageBitmap, ImageBitmap],
              padFrac: activeTilePadFrac,
              w: wEst,
              h: hEst,
            });
          }
          return;
        } catch {
          if (aborted) return;
          // Fall through to single-URL loader if tiles aren't reachable
        }
      }

      // Fallback Single-Image Equirectangular Loader (still staggered per frame)
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
          for (let k = 0; k < 4; k++) {
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
          handle.padFrac = padPx / srcTileW;
          handle.texelStep = [1 / Math.max(1024, dstTileW * 4), 1 / Math.max(512, dstTileH)];
          handle.useTiles = 1;
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
    activeTileUrls,
    activePreviewUrl,
    activeTilePadFrac,
    activeNativeW,
    activeNativeH,
  ]);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest("button, [data-art-card='true']")) return;
    lookToRef.current = null;
    setAutoRotate(false);
    setIsDragging(true);
    dragRef.current = {
      lastX: e.clientX,
      lastY: e.clientY,
      velH: 0,
      velV: 0,
    };
    velocityRef.current = { h: 0, v: 0 };
    e.currentTarget.setPointerCapture?.(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
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
  };

  const handlePointerUp = () => {
    if (dragRef.current) {
      velocityRef.current = {
        h: dragRef.current.velH * 0.85,
        v: dragRef.current.velV * 0.85,
      };
    }
    dragRef.current = null;
    setIsDragging(false);
  };

  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest("[data-art-card='true']")) return;
    e.preventDefault();
    lookToRef.current = null;
    const nextFov = clamp(camRef.current.fov + (e.deltaY > 0 ? 4.5 : -4.5), 20, 115);
    const nextCam = { ...camRef.current, fov: nextFov };
    camRef.current = nextCam;
    setCam(nextCam);
  };

  const nudgeCamera = (dH: number, dV: number, dFov = 0) => {
    setAutoRotate(false);
    const cur = camRef.current;
    lookTo(cur.hlookat + dH, clamp(cur.vlookat + dV, -82, 82), clamp(cur.fov + dFov, 20, 115), 300);
  };

  const toggleFullscreen = () => {
    const el = containerRef.current;
    if (!el) return;
    if (!document.fullscreenElement) {
      el.requestFullscreen?.().catch(() => {});
    } else {
      document.exitFullscreen?.().catch(() => {});
    }
  };

  const handleHotspotActivate = useCallback(
    (hs: KrpanoHotspot) => {
      setAutoRotate(false);
      if (hs.targetSceneId) {
        const isStairs = hs.kind === "stairs-up" || hs.kind === "stairs-down";
        const banner =
          hs.kind === "stairs-up"
            ? "Climbing Grand Staircase → 2nd Floor Mezzanine…"
            : hs.kind === "stairs-down"
              ? "Descending Staircase → 1F Ground Atrium…"
              : `Walking Through Doorway → ${hs.title.replace(/→|←/g, "").trim()}…`;
        switchScene(hs.targetSceneId, hs.arrivalView, {
          ath: hs.ath,
          atv: isStairs ? hs.atv : hs.atv,
          label: banner,
        });
      } else {
        lookTo(hs.ath, hs.atv, hs.fov ?? 38, 620);
        setActiveArtCard(hs);
        onSelectHotspot?.(hs);
      }
    },
    [switchScene, lookTo, onSelectHotspot],
  );

  // Ordered interactive path items (artworks + stairs + doors in pathOrder)
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

  // Compute XML lazily ONLY when inspector modal is opened (0ms cost during normal viewing!)
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

  const is12kActive = (panoDimensions?.w ?? 0) >= 10000 || activeScene?.isUltraHd12k;

  // Project 3D Floor Walking Path points for SVG trail & clickable floor discs
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
      onWheel={handleWheel}
      className={`relative w-full overflow-hidden rounded-2xl border border-[#CBD5E1] bg-[#0F172A] select-none shadow-lg ${
        isFullscreen ? "h-screen w-screen rounded-none border-0" : heightClass
      } ${isDragging ? "cursor-grabbing" : "cursor-grab"}`}
      style={{ touchAction: "none" }}
    >
      {/* Multi-Tile 12K WebGL Equirectangular Spherical Canvas */}
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

      {/* Subtle Vignette for HUD Readability */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-slate-950/25"
      />

      {/* Walk-Through Door / Climb Stairs Transition Banner */}
      {transitionBanner && (
        <div className="pointer-events-none absolute top-1/2 left-1/2 z-40 -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-[#FCD116] bg-slate-950/90 px-5 py-2.5 text-[13px] font-extrabold text-[#FCD116] shadow-2xl backdrop-blur-md">
          {transitionBanner}
        </div>
      )}

      {/* 3D Projected SVG Guided Museum Floor Path */}
      {showPath && projectedFloorSteps.length > 1 && (
        <svg aria-hidden="true" className="pointer-events-none absolute inset-0 z-10 h-full w-full">
          {projectedFloorSteps.map((curr, idx) => {
            const next = projectedFloorSteps[idx + 1];
            if (!next || !curr.proj.visible || !next.proj.visible) return null;
            // Avoid drawing segments that wrap wildly across opposite screen edges
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
                strokeOpacity="0.65"
                strokeWidth="3"
                strokeDasharray="8 7"
                strokeLinecap="round"
              />
            );
          })}
        </svg>
      )}

      {/* Clickable 3D Perspective Floor Footstep Discs */}
      {showPath &&
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
                // Find matching art piece near lookAtAth to pop open its details plaque too!
                const nearbyArt = resolvedHotspots.find(
                  (h) => !h.targetSceneId && Math.abs(shortestAngleDelta(h.ath, targetAth)) < 8,
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
                className="flex size-10 items-center justify-center rounded-full border-2 border-[#FCD116] bg-slate-950/75 text-[#FCD116] shadow-lg transition-transform duration-150 group-hover:scale-125 group-hover:bg-[#FCD116] group-hover:text-slate-950"
                style={{
                  transform: "perspective(240px) rotateX(48deg)",
                  boxShadow: "0 0 18px rgba(252, 209, 22, 0.45)",
                }}
              >
                <Footprints className="size-4" />
              </div>
              {fp.label ? (
                <span className="pointer-events-none absolute bottom-full left-1/2 mb-1 hidden -translate-x-1/2 rounded-full border border-white/25 bg-slate-950/90 px-2.5 py-0.5 text-[10.5px] font-bold whitespace-nowrap text-white shadow-md group-hover:block">
                  {fp.label}
                </span>
              ) : null}
            </button>
          );
        })}

      {/* Top Bar: Multi-Floor / Multi-Room Switcher + Live 12K UHD Resolution & Compass Telemetry */}
      <div className="pointer-events-none absolute inset-x-0 top-3 z-20 flex flex-wrap items-center justify-between gap-2 px-3.5">
        <div className="pointer-events-auto flex flex-wrap items-center gap-1 rounded-full border border-white/20 bg-slate-950/85 p-1 text-[11px] font-bold text-white backdrop-blur-md">
          {scenes.map((sc) => {
            const on = sc.id === currentSceneId;
            const isUpstairsTab = sc.id.includes("upstairs") || sc.floorLabel?.includes("2F");
            return (
              <button
                key={sc.id}
                type="button"
                onClick={() => switchScene(sc.id)}
                className="flex cursor-pointer items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-extrabold transition-all"
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

        <div className="flex flex-wrap items-center gap-1.5">
          {panoDimensions ? (
            <span
              className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10.5px] font-extrabold uppercase tracking-wider text-white backdrop-blur-md"
              style={{
                backgroundColor: is12kActive ? "#059669" : "rgba(15, 23, 42, 0.82)",
                border: is12kActive ? "1px solid #6EE7B7" : "1px solid rgba(255, 255, 255, 0.2)",
              }}
            >
              {streamingTiles
                ? "Instant Preview · Streaming UHD…"
                : `${is12kActive ? "12K NATIVE · " : ""}${panoDimensions.w.toLocaleString()}×${panoDimensions.h.toLocaleString()}`}
            </span>
          ) : null}

          <span
            className="hidden items-center gap-1.5 rounded-full border border-[#FCD116]/45 bg-slate-950/80 px-3 py-1 text-[11px] font-bold text-[#FCD116] backdrop-blur-md lg:inline-flex"
            style={{ fontFamily: F.mono }}
          >
            <Compass className="size-3.5" />
            {Math.round(wrapDeg360(cam.hlookat))}° {cardinalDirection(cam.hlookat)} · FOV{" "}
            {Math.round(cam.fov)}°
          </span>

          <button
            type="button"
            onClick={() => setXmlModalOpen(true)}
            className="pointer-events-auto inline-flex cursor-pointer items-center gap-1 rounded-full border border-white/25 bg-slate-950/80 px-2.5 py-1 text-[11px] font-bold text-white backdrop-blur-md hover:bg-slate-900"
            title="Inspect krpano XML configuration"
          >
            <Code2 className="size-3.5 text-[#FCD116]" /> XML
          </button>
        </div>
      </div>

      {/* 3D Spherical Hotspots: Art Pieces, Doors & Upstairs/Downstairs Stairs */}
      {resolvedHotspots.map((hs, idx) => {
        const proj = projectHotspotToScreen(hs.ath, hs.atv, cam, viewport.width, viewport.height);
        if (!proj.visible) return null;

        const isSelected = hs.id === selectedHotspotId || hs.id === activeArtCard?.id;
        const isStairs = hs.kind === "stairs-up" || hs.kind === "stairs-down";
        const isDoor = Boolean(hs.targetSceneId) && !isStairs;
        const isPortal = isStairs || isDoor;

        const bg = isStairs
          ? "#B45309"
          : isDoor
            ? "#059669"
            : isSelected
              ? C.foil
              : "rgba(15, 23, 42, 0.90)";
        const border = isStairs ? "#FDE68A" : isDoor ? "#A7F3D0" : isSelected ? "#FFFFFF" : C.foil;
        const textCol = isPortal ? "#FFFFFF" : isSelected ? C.ink : "#FFFFFF";

        return (
          <button
            key={hs.id}
            type="button"
            onClick={() => handleHotspotActivate(hs)}
            aria-label={isPortal ? hs.title : `Art piece ${idx + 1}: ${hs.title}`}
            className="group absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-transform duration-150 hover:scale-110"
            style={{
              left: `${proj.x}px`,
              top: `${proj.y}px`,
              zIndex: isSelected || isPortal ? 30 : 22,
            }}
          >
            <span
              className="pointer-events-none absolute -inset-1.5 animate-ping rounded-full opacity-35"
              style={{
                backgroundColor: isStairs
                  ? "#F59E0B"
                  : isDoor
                    ? "#10B981"
                    : isSelected
                      ? C.foil
                      : "#FFFFFF",
                animationDuration: "2.5s",
              }}
            />
            <div
              className="relative flex items-center gap-2 rounded-full border-2 px-3 py-1.5 shadow-xl backdrop-blur-md"
              style={{
                backgroundColor: bg,
                borderColor: border,
                color: textCol,
              }}
            >
              <span
                className="flex size-5 shrink-0 items-center justify-center rounded-full text-[11px] font-extrabold"
                style={{
                  backgroundColor: isPortal ? "#FFFFFF" : isSelected ? C.cover : C.foil,
                  color: isStairs ? "#B45309" : isDoor ? "#059669" : isSelected ? "#FFFFFF" : C.ink,
                }}
              >
                {hs.badge ?? idx + 1}
              </span>
              <div className="text-left">
                <div
                  className="max-w-[145px] truncate text-[12px] font-extrabold sm:max-w-[205px]"
                  style={{ fontFamily: F.body }}
                >
                  {hs.title}
                </div>
                {hs.subtitle ? (
                  <div
                    className="hidden max-w-[185px] truncate text-[9.5px] font-semibold opacity-90 sm:block"
                    style={{ fontFamily: F.body }}
                  >
                    {hs.subtitle}
                  </div>
                ) : null}
              </div>
            </div>
          </button>
        );
      })}

      {/* In-Viewer Curatorial Art Piece Details Plaque (Appears on Artwork Click — Works in Fullscreen too!) */}
      {activeArtCard && !activeArtCard.targetSceneId && (
        <aside
          data-art-card="true"
          aria-label={`Artwork details: ${activeArtCard.title}`}
          className="pointer-events-auto absolute right-3 bottom-16 z-35 w-[calc(100%-1.5rem)] max-w-[360px] rounded-2xl border border-[#CBD5E1] bg-white/96 p-4 shadow-2xl backdrop-blur-md sm:right-4 sm:bottom-16"
        >
          <div className="flex items-start justify-between gap-2">
            <span
              className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10.5px] font-extrabold uppercase tracking-wider"
              style={{ backgroundColor: "#EFF6FF", color: C.cover }}
            >
              <Info className="size-3" />{" "}
              {activeArtCard.artDetails?.zone ?? activeScene?.shortLabel ?? "360° Exhibit"}
            </span>
            <button
              type="button"
              onClick={() => setActiveArtCard(null)}
              aria-label="Close art piece details"
              className="flex size-6 cursor-pointer items-center justify-center rounded-full border border-[#CBD5E1] text-[#475569] hover:bg-[#F1F5F9]"
            >
              <X className="size-3.5" />
            </button>
          </div>

          <h4
            className="mt-2 text-[17px] leading-snug font-extrabold"
            style={{ fontFamily: F.display, color: C.ink }}
          >
            {activeArtCard.title}
          </h4>

          <p className="mt-0.5 text-[11.5px] font-bold" style={{ color: C.mute }}>
            {activeArtCard.artDetails?.period ??
              activeArtCard.subtitle ??
              "CALABARZON Heritage Collection"}
            {activeArtCard.artDetails?.medium ? ` · ${activeArtCard.artDetails.medium}` : ""}
          </p>

          <p
            className="mt-2.5 text-[13px] leading-relaxed font-medium"
            style={{ fontFamily: F.body, color: C.ink }}
          >
            {activeArtCard.artDetails?.description ??
              "Click Macro Zoom to inspect this heritage artwork closely in full 360° spherical projection, or continue along the museum floor path."}
          </p>

          {activeArtCard.artDetails?.highlight ? (
            <div className="mt-2 rounded-xl border border-[#FDE68A] bg-[#FFFBEB] px-3 py-1.5 text-[11.5px] font-semibold text-[#92400E]">
              ✨ {activeArtCard.artDetails.highlight}
            </div>
          ) : null}

          <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-[#E2E8F0] pt-2.5">
            <button
              type="button"
              onClick={() => {
                const zoomedIn = camRef.current.fov <= 26;
                lookTo(
                  activeArtCard.ath,
                  activeArtCard.atv,
                  zoomedIn ? (activeArtCard.fov ?? 44) : 22,
                  520,
                );
              }}
              className="inline-flex cursor-pointer items-center gap-1 rounded-lg bg-[#EFF6FF] px-2.5 py-1.5 text-[11.5px] font-extrabold text-[#0038A8] hover:bg-[#DBEAFE]"
            >
              <ZoomIn className="size-3.5" />
              {cam.fov <= 26 ? "Frame View" : "Macro Zoom (22°)"}
            </button>

            <button
              type="button"
              onClick={stepAlongPath}
              className="inline-flex cursor-pointer items-center gap-1 rounded-lg px-3 py-1.5 text-[11.5px] font-extrabold text-white"
              style={{ backgroundColor: C.cover }}
            >
              Next on Path <ChevronRight className="size-3.5" />
            </button>
          </div>
        </aside>
      )}

      {/* Optional Custom Overlay */}
      {children}

      {/* krpano Floating Control Dock (Pan, Tilt, UHD Zoom, Floor Path Walk, HD Crisp, Fullscreen) */}
      <div className="absolute bottom-3 left-1/2 z-30 flex max-w-[calc(100%-1rem)] -translate-x-1/2 items-center gap-1 overflow-x-auto rounded-full border border-white/20 bg-slate-950/88 px-2.5 py-1.5 text-white shadow-2xl backdrop-blur-md">
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
          title="Look Up (Ceiling)"
        >
          <MoveUp className="size-4" />
        </button>
        <button
          type="button"
          onClick={() => nudgeCamera(0, -22)}
          aria-label="Tilt down"
          className="hidden size-8 shrink-0 cursor-pointer items-center justify-center rounded-full hover:bg-white/15 sm:flex"
          title="Look Down (Floor Path)"
        >
          <MoveDown className="size-4" />
        </button>

        <span className="mx-0.5 h-4 w-px shrink-0 bg-white/20" />

        <button
          type="button"
          onClick={() => nudgeCamera(0, 0, -14)}
          aria-label="Zoom in"
          className="flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-full hover:bg-white/15"
          title="Zoom In (down to 20° Macro UHD)"
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
          <span>HD Crisp</span>
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
            lookTo(
              activeScene?.initialHlookat ?? 0,
              activeScene?.initialVlookat ?? 2,
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
          className="flex h-8 shrink-0 cursor-pointer items-center gap-1 rounded-full bg-[#0038A8] px-3 text-[11px] font-extrabold text-white hover:bg-[#1D4ED8]"
          title="Fullscreen 12K Ultra-HD 360°"
        >
          {isFullscreen ? <Minimize2 className="size-3.5" /> : <Maximize2 className="size-3.5" />}
          <span className="hidden md:inline">{isFullscreen ? "Exit" : "Fullscreen HD"}</span>
        </button>
      </div>

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
                  krpano 1.21 Multi-Floor 12K Configuration
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
