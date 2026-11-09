import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Code2,
  Compass,
  Copy,
  Check,
  DoorOpen,
  Maximize2,
  Minimize2,
  MoveDown,
  MoveLeft,
  MoveRight,
  MoveUp,
  RotateCcw,
  RotateCw,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import {
  DEFAULT_MUSEUM_PANO_URL,
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

  if (Math.abs(nx) > 1.18 || Math.abs(ny) > 1.18) {
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

const FRAGMENT_SHADER_SRC = `
precision highp float;
varying vec2 v_ndc;
uniform sampler2D u_panorama;
uniform vec3 u_camF;
uniform vec3 u_camR;
uniform vec3 u_camU;
uniform float u_tanHalfFov;
uniform float u_aspect;

const float PI = 3.14159265358979323846;

void main() {
  vec3 ray = normalize(
    u_camF +
    (v_ndc.x * u_aspect * u_tanHalfFov) * u_camR +
    (v_ndc.y * u_tanHalfFov) * u_camU
  );

  float lon = atan(ray.x, ray.z);
  float lat = asin(clamp(ray.y, -1.0, 1.0));

  float u = fract((lon / (2.0 * PI)) + 0.5);
  float v = clamp(0.5 - (lat / PI), 0.001, 0.999);

  gl_FragColor = texture2D(u_panorama, vec2(u, v));
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

export function KrpanoViewer({
  panoramaUrl,
  fallbackPanoramaUrl = DEFAULT_MUSEUM_PANO_URL,
  sceneName = "scene_sulyap_museum_rotunda",
  sceneTitle = "SulyapPH 360° Heritage Museum Rotunda",
  scenes = DEFAULT_MUSEUM_SCENES,
  activeSceneId,
  onSceneChange,
  hotspots,
  selectedHotspotId,
  onSelectHotspot,
  initialHlookat = 0,
  initialVlookat = 2,
  initialFov = 86,
  targetView,
  autoRotateDefault = false,
  heightClass = "h-[380px] sm:h-[480px]",
  children,
}: {
  panoramaUrl?: string;
  fallbackPanoramaUrl?: string;
  sceneName?: string;
  sceneTitle?: string;
  /** Optional multi-scene array (defaults to Room 1 Rotunda + Room 2 Fine Arts Hall) */
  scenes?: KrpanoSceneConfig[];
  activeSceneId?: string;
  onSceneChange?: (sceneId: string) => void;
  hotspots?: KrpanoHotspot[];
  selectedHotspotId?: string;
  onSelectHotspot?: (hotspot: KrpanoHotspot) => void;
  initialHlookat?: number;
  initialVlookat?: number;
  initialFov?: number;
  /** Optional external camera target { ath, atv, fov, sceneId, key } to trigger smooth krpano lookto() */
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

  const [internalSceneId, setInternalSceneId] = useState<string>(
    activeSceneId ?? scenes[0]?.id ?? "rotunda",
  );
  const currentSceneId = activeSceneId ?? internalSceneId;
  const activeScene = useMemo(
    () => scenes.find((s) => s.id === currentSceneId) ?? scenes[0],
    [scenes, currentSceneId],
  );

  const resolvedPanoUrl = panoramaUrl ?? activeScene?.panoramaUrl ?? DEFAULT_MUSEUM_PANO_URL;
  const resolvedHotspots = hotspots ?? activeScene?.hotspots ?? [];
  const resolvedSceneName = activeScene?.name ?? sceneName;
  const resolvedSceneTitle = activeScene?.title ?? sceneTitle;

  const [cam, setCam] = useState<CameraState>({
    hlookat: wrapDeg180(activeScene?.initialHlookat ?? initialHlookat),
    vlookat: clamp(activeScene?.initialVlookat ?? initialVlookat, -82, 82),
    fov: clamp(activeScene?.initialFov ?? initialFov, 35, 115),
  });
  const camRef = useRef<CameraState>(cam);
  camRef.current = cam;

  const [viewport, setViewport] = useState<{ width: number; height: number }>({
    width: 800,
    height: 450,
  });
  const [isDragging, setIsDragging] = useState(false);
  const [autoRotate, setAutoRotate] = useState(autoRotateDefault);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [webglReady, setWebglReady] = useState(false);
  const [activeTexUrl, setActiveTexUrl] = useState(resolvedPanoUrl);
  const [isTransitioning, setIsTransitioning] = useState(false);
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

  useEffect(() => {
    setActiveTexUrl(resolvedPanoUrl);
  }, [resolvedPanoUrl]);

  // Smooth krpano lookto(ath, atv, fov) camera interpolation
  const lookTo = useCallback((ath: number, atv: number, fov = 62, duration = 680) => {
    velocityRef.current = { h: 0, v: 0 };
    const current = camRef.current;
    const deltaH = shortestAngleDelta(ath, current.hlookat);
    lookToRef.current = {
      startH: current.hlookat,
      startV: current.vlookat,
      startFov: current.fov,
      targetH: current.hlookat + deltaH,
      targetV: clamp(atv, -82, 82),
      targetFov: clamp(fov, 35, 115),
      startTime: performance.now(),
      duration,
    };
  }, []);

  // Switch 360° room (krpano loadscene equivalent with smooth blend)
  const switchScene = useCallback(
    (nextSceneId: string, customLook?: { ath: number; atv: number; fov?: number }) => {
      const nextScene = scenes.find((s) => s.id === nextSceneId);
      if (!nextScene) return;
      setIsTransitioning(true);
      setInternalSceneId(nextSceneId);
      onSceneChange?.(nextSceneId);
      window.setTimeout(() => {
        setIsTransitioning(false);
        lookTo(
          customLook?.ath ?? nextScene.initialHlookat ?? 0,
          customLook?.atv ?? nextScene.initialVlookat ?? 2,
          customLook?.fov ?? nextScene.initialFov ?? 84,
          650,
        );
      }, 160);
    },
    [scenes, onSceneChange, lookTo],
  );

  // Trigger smooth lookto (and optional scene switch) whenever targetView prop changes
  useEffect(() => {
    if (!targetView) return;
    if (targetView.sceneId && targetView.sceneId !== currentSceneId) {
      switchScene(targetView.sceneId, {
        ath: targetView.ath,
        atv: targetView.atv,
        fov: targetView.fov,
      });
    } else {
      lookTo(targetView.ath, targetView.atv, targetView.fov ?? 64, 700);
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

  // Initialize WebGL 360° Equirectangular Spherical Renderer
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let gl: WebGLRenderingContext | null = null;
    try {
      gl =
        (canvas.getContext("webgl", {
          antialias: true,
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
    if (!vs || !fs) {
      setWebglReady(false);
      return;
    }

    const program = gl.createProgram();
    if (!program) return;
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

    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.RGBA,
      1,
      1,
      0,
      gl.RGBA,
      gl.UNSIGNED_BYTE,
      new Uint8Array([15, 23, 42, 255]),
    );

    let cancelled = false;
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      if (cancelled || !gl) return;
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 0);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      setWebglReady(true);
    };
    img.onerror = () => {
      if (!cancelled && activeTexUrl !== fallbackPanoramaUrl) {
        setActiveTexUrl(fallbackPanoramaUrl);
      }
    };
    img.src = activeTexUrl;

    let rafId = 0;
    const renderLoop = (now: number) => {
      if (cancelled || !gl) return;

      const anim = lookToRef.current;
      if (anim) {
        const t = clamp((now - anim.startTime) / anim.duration, 0, 1);
        const ease = 1 - Math.pow(1 - t, 3);
        const nextCam: CameraState = {
          hlookat: wrapDeg180(anim.startH + (anim.targetH - anim.startH) * ease),
          vlookat: clamp(anim.startV + (anim.targetV - anim.startV) * ease, -82, 82),
          fov: clamp(anim.startFov + (anim.targetFov - anim.startFov) * ease, 35, 115),
        };
        if (t >= 1) {
          lookToRef.current = null;
        }
        camRef.current = nextCam;
        setCam(nextCam);
      } else if (!dragRef.current) {
        const vel = velocityRef.current;
        if (Math.abs(vel.h) > 0.01 || Math.abs(vel.v) > 0.01) {
          vel.h *= 0.9;
          vel.v *= 0.9;
          const nextCam: CameraState = {
            hlookat: wrapDeg180(camRef.current.hlookat + vel.h),
            vlookat: clamp(camRef.current.vlookat + vel.v, -82, 82),
            fov: camRef.current.fov,
          };
          camRef.current = nextCam;
          setCam(nextCam);
        } else if (autoRotate) {
          const nextCam: CameraState = {
            ...camRef.current,
            hlookat: wrapDeg180(camRef.current.hlookat + 0.18),
          };
          camRef.current = nextCam;
          setCam(nextCam);
        }
      }

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
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

      gl.drawArrays(gl.TRIANGLES, 0, 6);
      rafId = window.requestAnimationFrame(renderLoop);
    };

    rafId = window.requestAnimationFrame(renderLoop);

    return () => {
      cancelled = true;
      window.cancelAnimationFrame(rafId);
    };
  }, [activeTexUrl, fallbackPanoramaUrl, autoRotate]);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest("button")) return;
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

    const speed = (camRef.current.fov / 90) * 0.22;
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
    e.preventDefault();
    lookToRef.current = null;
    const nextFov = clamp(camRef.current.fov + (e.deltaY > 0 ? 5 : -5), 35, 115);
    const nextCam = { ...camRef.current, fov: nextFov };
    camRef.current = nextCam;
    setCam(nextCam);
  };

  const nudgeCamera = (dH: number, dV: number, dFov = 0) => {
    setAutoRotate(false);
    const cur = camRef.current;
    lookTo(cur.hlookat + dH, clamp(cur.vlookat + dV, -82, 82), clamp(cur.fov + dFov, 35, 115), 320);
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

  const generatedXml = useMemo(
    () =>
      buildKrpanoXml({
        sceneName: resolvedSceneName,
        sceneTitle: resolvedSceneTitle,
        panoramaUrl: activeTexUrl,
        cam,
        hotspots: resolvedHotspots,
      }),
    [resolvedSceneName, resolvedSceneTitle, activeTexUrl, cam, resolvedHotspots],
  );

  const handleCopyXml = () => {
    navigator.clipboard?.writeText(generatedXml);
    setCopiedXml(true);
    window.setTimeout(() => setCopiedXml(false), 1800);
  };

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
      {/* True 360°×180° WebGL Equirectangular Spherical Canvas */}
      <canvas
        ref={canvasRef}
        className={`block h-full w-full transition-opacity duration-200 ${
          isTransitioning ? "opacity-40" : "opacity-100"
        }`}
      />

      {/* Fallback CSS Spherical Pan Layer for non-WebGL / Headless Test Environments */}
      {!webglReady && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-cover bg-center transition-transform duration-75"
          style={{
            backgroundImage: `url(${activeTexUrl})`,
            backgroundPosition: `${50 + (cam.hlookat / 180) * 50}% ${50 - (cam.vlookat / 90) * 45}%`,
            transform: `scale(${clamp(115 / cam.fov, 1.05, 2.2)})`,
          }}
        />
      )}

      {/* Subtle Vignette for HUD Readability */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-950/65 via-transparent to-slate-950/35"
      />

      {/* Top Bar: Multi-Room Switcher + Live Spherical Compass & Pitch Telemetry */}
      <div className="pointer-events-none absolute inset-x-0 top-3 z-20 flex flex-wrap items-center justify-between gap-2 px-3.5">
        <div className="pointer-events-auto flex flex-wrap items-center gap-1.5 rounded-full border border-white/20 bg-slate-950/80 p-1 text-[11px] font-bold text-white backdrop-blur-md">
          {scenes.map((sc) => {
            const on = sc.id === currentSceneId;
            return (
              <button
                key={sc.id}
                type="button"
                onClick={() => switchScene(sc.id)}
                className="flex cursor-pointer items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-extrabold transition-all"
                style={{
                  backgroundColor: on ? C.foil : "transparent",
                  color: on ? C.ink : "#FFFFFF",
                }}
              >
                <DoorOpen className="size-3.5" />
                <span>{sc.shortLabel}</span>
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-2">
          <span
            className="inline-flex items-center gap-1.5 rounded-full border border-[#FCD116]/45 bg-slate-950/80 px-3 py-1 text-[11px] font-bold text-[#FCD116] backdrop-blur-md"
            style={{ fontFamily: F.mono }}
          >
            <Compass className="size-3.5" />
            {Math.round(wrapDeg360(cam.hlookat))}° {cardinalDirection(cam.hlookat)} · Pitch{" "}
            {cam.vlookat >= 0 ? `+${Math.round(cam.vlookat)}°` : `${Math.round(cam.vlookat)}°`} ·
            FOV {Math.round(cam.fov)}°
          </span>

          <button
            type="button"
            onClick={() => setXmlModalOpen(true)}
            className="pointer-events-auto inline-flex cursor-pointer items-center gap-1 rounded-full border border-white/25 bg-slate-950/80 px-2.5 py-1 text-[11px] font-bold text-white backdrop-blur-md hover:bg-slate-900"
            title="Inspect krpano XML configuration"
          >
            <Code2 className="size-3.5 text-[#FCD116]" /> krpano XML
          </button>
        </div>
      </div>

      {/* 3D Spherical Hotspots Projected onto the 360° Sphere */}
      {resolvedHotspots.map((hs, idx) => {
        const proj = projectHotspotToScreen(hs.ath, hs.atv, cam, viewport.width, viewport.height);
        if (!proj.visible) return null;

        const isSelected = hs.id === selectedHotspotId;
        const isPortal = Boolean(hs.targetSceneId);

        return (
          <button
            key={hs.id}
            type="button"
            onClick={() => {
              setAutoRotate(false);
              if (hs.targetSceneId) {
                switchScene(hs.targetSceneId);
              } else {
                lookTo(hs.ath, hs.atv, hs.fov ?? 60, 680);
                onSelectHotspot?.(hs);
              }
            }}
            aria-label={isPortal ? hs.title : `Art piece ${idx + 1}: ${hs.title}`}
            className="group absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-transform duration-150 hover:scale-110"
            style={{
              left: `${proj.x}px`,
              top: `${proj.y}px`,
              zIndex: isSelected || isPortal ? 30 : 20,
            }}
          >
            <span
              className="pointer-events-none absolute -inset-1.5 animate-ping rounded-full opacity-35"
              style={{
                backgroundColor: isPortal ? "#10B981" : isSelected ? C.foil : "#FFFFFF",
                animationDuration: "2.4s",
              }}
            />
            <div
              className="relative flex items-center gap-2 rounded-full border-2 px-3 py-1.5 shadow-xl backdrop-blur-md"
              style={{
                backgroundColor: isPortal
                  ? "#059669"
                  : isSelected
                    ? C.foil
                    : "rgba(15, 23, 42, 0.88)",
                borderColor: isPortal ? "#A7F3D0" : isSelected ? "#FFFFFF" : C.foil,
                color: isPortal ? "#FFFFFF" : isSelected ? C.ink : "#FFFFFF",
              }}
            >
              <span
                className="flex size-5 shrink-0 items-center justify-center rounded-full text-[11px] font-extrabold"
                style={{
                  backgroundColor: isPortal ? "#FFFFFF" : isSelected ? C.cover : C.foil,
                  color: isPortal ? "#059669" : isSelected ? "#FFFFFF" : C.ink,
                }}
              >
                {hs.badge ?? idx + 1}
              </span>
              <span
                className="max-w-[140px] truncate text-[12px] font-bold sm:max-w-[185px]"
                style={{ fontFamily: F.body }}
              >
                {hs.title}
              </span>
            </div>
          </button>
        );
      })}

      {/* Optional Custom Overlay */}
      {children}

      {/* krpano Floating Control Dock */}
      <div className="absolute bottom-3 left-1/2 z-30 flex -translate-x-1/2 items-center gap-1 rounded-full border border-white/20 bg-slate-950/80 px-2.5 py-1.5 text-white shadow-2xl backdrop-blur-md">
        <button
          type="button"
          onClick={() => nudgeCamera(-35, 0)}
          aria-label="Rotate left"
          className="flex size-8 cursor-pointer items-center justify-center rounded-full hover:bg-white/15"
          title="Pan Left"
        >
          <MoveLeft className="size-4" />
        </button>
        <button
          type="button"
          onClick={() => nudgeCamera(35, 0)}
          aria-label="Rotate right"
          className="flex size-8 cursor-pointer items-center justify-center rounded-full hover:bg-white/15"
          title="Pan Right"
        >
          <MoveRight className="size-4" />
        </button>
        <button
          type="button"
          onClick={() => nudgeCamera(0, 22)}
          aria-label="Tilt up"
          className="flex size-8 cursor-pointer items-center justify-center rounded-full hover:bg-white/15"
          title="Look Up (Ceiling)"
        >
          <MoveUp className="size-4" />
        </button>
        <button
          type="button"
          onClick={() => nudgeCamera(0, -22)}
          aria-label="Tilt down"
          className="flex size-8 cursor-pointer items-center justify-center rounded-full hover:bg-white/15"
          title="Look Down (Floor)"
        >
          <MoveDown className="size-4" />
        </button>

        <span className="mx-0.5 h-4 w-px bg-white/20" />

        <button
          type="button"
          onClick={() => nudgeCamera(0, 0, -14)}
          aria-label="Zoom in"
          className="flex size-8 cursor-pointer items-center justify-center rounded-full hover:bg-white/15"
          title="Zoom In"
        >
          <ZoomIn className="size-4" />
        </button>
        <button
          type="button"
          onClick={() => nudgeCamera(0, 0, 14)}
          aria-label="Zoom out"
          className="flex size-8 cursor-pointer items-center justify-center rounded-full hover:bg-white/15"
          title="Zoom Out"
        >
          <ZoomOut className="size-4" />
        </button>

        <span className="mx-0.5 h-4 w-px bg-white/20" />

        <button
          type="button"
          onClick={() => setAutoRotate((v) => !v)}
          className="flex h-8 cursor-pointer items-center gap-1 rounded-full px-2.5 text-[11px] font-bold transition-colors"
          style={{
            backgroundColor: autoRotate ? C.foil : "transparent",
            color: autoRotate ? C.ink : "#FFFFFF",
          }}
          title="Toggle 360° Auto-Rotation"
        >
          <RotateCw className="size-3.5" />
          <span className="hidden sm:inline">{autoRotate ? "Pause" : "Auto-Spin"}</span>
        </button>

        <button
          type="button"
          onClick={() => lookTo(0, 54, 72, 700)}
          className="hidden h-8 cursor-pointer items-center gap-1 rounded-full px-2.5 text-[11px] font-bold hover:bg-white/15 sm:flex"
          title="Look up at the Skylight Vault"
        >
          Ceiling ↑
        </button>

        <button
          type="button"
          onClick={() => lookTo(0, 2, 86, 600)}
          aria-label="Reset 360 view"
          className="flex size-8 cursor-pointer items-center justify-center rounded-full hover:bg-white/15"
          title="Reset View"
        >
          <RotateCcw className="size-4" />
        </button>

        <button
          type="button"
          onClick={toggleFullscreen}
          aria-label="Toggle fullscreen"
          className="flex size-8 cursor-pointer items-center justify-center rounded-full hover:bg-white/15"
          title="Fullscreen 360°"
        >
          {isFullscreen ? <Minimize2 className="size-4" /> : <Maximize2 className="size-4" />}
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
                  krpano 1.21 Multi-Scene Configuration
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
