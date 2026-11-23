import { useEffect, useRef, useState } from "react";
import {
  cameraPose,
  captureTargets,
  direction,
  dot,
  stitchCameraShots,
  type CameraShot,
  type Pose,
} from "@/lib/camera-panorama";

export function PanoramaCamera({
  onResult,
  onBusy,
  disabled,
}: {
  onResult: (file: File) => void;
  onBusy: (value: boolean) => void;
  disabled: boolean;
}) {
  const video = useRef<HTMLVideoElement>(null);
  const stream = useRef<MediaStream | null>(null);
  const sensor = useRef<{ pose: Pose; time: number } | null>(null);
  const abort = useRef<AbortController | null>(null);
  const mounted = useRef(true);
  const captureShape = useRef<{ width: number; height: number; angle: number } | null>(null);
  const [running, setRunning] = useState(false);
  const [opening, setOpening] = useState(false);
  const [pose, setPose] = useState<Pose | null>(null);
  const [shots, setShots] = useState<CameraShot[]>([]);
  const [targets, setTargets] = useState<ReturnType<typeof captureTargets>>([]);
  const [fov, setFov] = useState(55);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");
  const [result, setResult] = useState<Awaited<ReturnType<typeof stitchCameraShots>> | null>(null);
  const [preview, setPreview] = useState("");
  const target = targets[shots.length];
  const angle =
    pose && target
      ? (Math.acos(
          Math.max(-1, Math.min(1, dot(pose.forward, direction(target.yaw, target.pitch)))),
        ) *
          180) /
        Math.PI
      : 180;
  const stop = () => {
    stream.current?.getTracks().forEach((track) => track.stop());
    stream.current = null;
  };
  useEffect(() => {
    mounted.current = true;
    const listener = (event: DeviceOrientationEvent) => {
      if (event.alpha === null || event.beta === null || event.gamma === null) return;
      sensor.current = {
        pose: cameraPose(
          event.alpha,
          event.beta,
          event.gamma,
          window.screen.orientation?.angle ?? 0,
        ),
        time: performance.now(),
      };
    };
    window.addEventListener("deviceorientation", listener);
    const timer = window.setInterval(
      () =>
        setPose(
          sensor.current && performance.now() - sensor.current.time < 1000
            ? sensor.current.pose
            : null,
        ),
      150,
    );
    const hide = () => {
      if (document.hidden) {
        stop();
        setRunning(false);
        setError(
          "Camera paused. Start again when you return; stay in the same spot for one complete capture session.",
        );
      }
    };
    document.addEventListener("visibilitychange", hide);
    return () => {
      mounted.current = false;
      stop();
      abort.current?.abort();
      window.clearInterval(timer);
      window.removeEventListener("deviceorientation", listener);
      document.removeEventListener("visibilitychange", hide);
    };
  }, []);
  useEffect(() => {
    if (!result) {
      setPreview("");
      return;
    }
    const url = URL.createObjectURL(result.file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [result]);

  const start = async () => {
    setError("");
    setOpening(true);
    setShots([]);
    setTargets([]);
    setResult(null);
    sensor.current = null;
    setPose(null);
    try {
      if (!navigator.mediaDevices?.getUserMedia)
        throw new Error("Open the published HTTPS site in your phone browser to use the camera.");
      if (typeof DeviceOrientationEvent === "undefined")
        throw new Error(
          "This device has no supported motion sensors. Use a phone with motion access enabled.",
        );
      const orientation = DeviceOrientationEvent as typeof DeviceOrientationEvent & {
        requestPermission?: () => Promise<string>;
      };
      if (orientation.requestPermission && (await orientation.requestPermission()) !== "granted")
        throw new Error("Allow motion access to align the photos.");
      const media = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: {
          facingMode: { exact: "environment" },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      });
      if (!mounted.current) {
        media.getTracks().forEach((track) => track.stop());
        return;
      }
      stream.current = media;
      if (!video.current) throw new Error("Camera preview is unavailable.");
      video.current.srcObject = media;
      await video.current.play();
      captureShape.current = {
        width: video.current.videoWidth,
        height: video.current.videoHeight,
        angle: window.screen.orientation?.angle ?? 0,
      };
      setRunning(true);
    } catch (reason) {
      stop();
      if (mounted.current)
        setError(reason instanceof Error ? reason.message : "Camera permission was denied.");
    } finally {
      if (mounted.current) setOpening(false);
    }
  };
  const capture = async () => {
    const v = video.current,
      reading = sensor.current;
    if (!v?.videoWidth || !reading || performance.now() - reading.time > 1000) return;
    if (
      captureShape.current &&
      (v.videoWidth !== captureShape.current.width ||
        v.videoHeight !== captureShape.current.height ||
        (window.screen.orientation?.angle ?? 0) !== captureShape.current.angle)
    ) {
      setError(
        "Return the phone to the same portrait or landscape position you used when opening the camera.",
      );
      return;
    }
    if (
      target &&
      dot(reading.pose.forward, direction(target.yaw, target.pitch)) < Math.cos((4 * Math.PI) / 180)
    )
      return;
    setBusy(true);
    setError("");
    setResult(null);
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(
      v.videoWidth * Math.min(1, 960 / Math.max(v.videoWidth, v.videoHeight)),
    );
    canvas.height = Math.round(
      v.videoHeight * Math.min(1, 960 / Math.max(v.videoWidth, v.videoHeight)),
    );
    try {
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Camera capture is unavailable.");
      ctx.drawImage(v, 0, 0, canvas.width, canvas.height);
      const blob = await new Promise<Blob>((resolve, reject) =>
        canvas.toBlob(
          (value) => (value ? resolve(value) : reject(new Error("Please retake this photo."))),
          "image/jpeg",
          0.92,
        ),
      );
      if (mounted.current) setShots((current) => [...current, { blob, pose: reading.pose }]);
    } catch (reason) {
      if (mounted.current) setError(reason instanceof Error ? reason.message : "Capture failed.");
    } finally {
      canvas.width = canvas.height = 1;
      if (mounted.current) setBusy(false);
    }
  };
  const stitch = async () => {
    setBusy(true);
    onBusy(true);
    setError("");
    setProgress(0);
    abort.current = new AbortController();
    try {
      const output = await stitchCameraShots(shots, fov, abort.current.signal, (value) => {
        if (mounted.current) setProgress(value);
      });
      if (mounted.current) setResult(output);
    } catch (reason) {
      if (mounted.current && !abort.current.signal.aborted)
        setError(reason instanceof Error ? reason.message : "Stitching failed.");
    } finally {
      if (mounted.current) {
        setBusy(false);
        onBusy(false);
      }
    }
  };
  return (
    <div className="space-y-3 rounded-lg bg-slate-100 p-3 text-xs dark:bg-slate-800">
      <h3 className="text-sm font-bold">Create a panorama with your phone camera</h3>
      <p>
        Stand in one spot and rotate around the camera lens. Keep the same phone orientation and
        zoom throughout. Follow each target, hold still, and tap Capture. We combine your photos
        here; review seams before saving.
      </p>
      <button
        type="button"
        disabled={disabled || busy || opening}
        onClick={() => void start()}
        className="rounded-lg bg-blue-700 px-3 py-2 font-bold text-white disabled:opacity-50"
      >
        {opening ? "Opening camera…" : running ? "Restart capture" : "Open rear camera"}
      </button>
      <video
        ref={video}
        autoPlay
        muted
        playsInline
        className={running ? "max-h-64 w-full rounded-lg bg-black object-contain" : "hidden"}
      />
      {running && (
        <>
          {!pose && (
            <p role="status">
              Waiting for motion sensors. Allow camera and motion access, then gently move your
              phone. If this message stays, this browser/device cannot guide capture; open the site
              in your phone’s browser.
            </p>
          )}
          <label className="block">
            Camera horizontal view: {fov}°{" "}
            <input
              type="range"
              min="40"
              max="75"
              value={fov}
              disabled={busy || shots.length > 0}
              onChange={(event) => setFov(Number(event.target.value))}
              className="w-full"
            />
          </label>
          <p>
            55° is an estimate. For best alignment, use your camera’s horizontal field of view. Lens
            differences and moving objects may cause seams.
          </p>
          {!targets.length ? (
            <button
              type="button"
              disabled={!pose || !video.current?.videoWidth}
              onClick={() => {
                if (pose && video.current)
                  setTargets(
                    captureTargets(
                      fov,
                      video.current.videoWidth / video.current.videoHeight,
                      (Math.atan2(pose.forward[0], pose.forward[1]) * 180) / Math.PI,
                    ),
                  );
              }}
              className="rounded border px-3 py-2"
            >
              Begin guided capture
            </button>
          ) : (
            <>
              <p className="font-bold">
                {shots.length} photos captured · {targets.length} guided positions
              </p>
              {target && (
                <p>
                  Target: turn to {Math.round(((target.yaw % 360) + 360) % 360)}°, tilt{" "}
                  {Math.round(target.pitch)}° (
                  {target.pitch > 0 ? "up" : target.pitch < 0 ? "down" : "level"}).{" "}
                  {pose &&
                    `Current: ${Math.round(((Math.atan2(pose.forward[0], pose.forward[1]) * 180) / Math.PI + 360) % 360)}°, tilt ${Math.round((Math.asin(pose.forward[2]) * 180) / Math.PI)}°. ${angle < 4 ? "Aligned — hold still and capture." : `${Math.round(angle)}° away.`}`}
                </p>
              )}
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  disabled={
                    busy ||
                    !pose ||
                    (Boolean(target) && angle >= 4) ||
                    shots.length >= targets.length + 20
                  }
                  onClick={() => void capture()}
                  className="rounded-lg bg-blue-700 px-3 py-2 font-bold text-white disabled:opacity-40"
                >
                  {target ? "Capture this view" : "Capture extra view"}
                </button>
                <button
                  type="button"
                  disabled={busy || !shots.length}
                  onClick={() => {
                    setShots((current) => current.slice(0, -1));
                    setResult(null);
                  }}
                  className="rounded border px-3 py-2"
                >
                  Retake last
                </button>
                <button
                  type="button"
                  disabled={busy || shots.length < targets.length}
                  onClick={() => void stitch()}
                  className="rounded-lg bg-green-700 px-3 py-2 font-bold text-white disabled:opacity-40"
                >
                  Stitch panorama
                </button>
              </div>
            </>
          )}
        </>
      )}
      {busy && (
        <p role="status">{progress ? `Combining photos: ${progress}%` : "Processing photos…"}</p>
      )}
      {error && (
        <p role="alert" className="text-red-600 dark:text-red-400">
          {error}
        </p>
      )}
      {result && (
        <>
          <img
            src={preview}
            alt="Stitched camera panorama; check for seams and black gaps"
            className="aspect-[2/1] w-full rounded-lg"
          />
          <p>
            2048 × 1024 · 2:1 · {((1 - result.missing) * 100).toFixed(2)}% coverage. Check alignment
            and seams.{" "}
            {result.missing > 0 &&
              "Black gaps are uncaptured views. Aim at those areas and capture extra views, then stitch again."}
          </p>
          <button
            type="button"
            disabled={busy || result.missing > 0}
            onClick={() => {
              stop();
              setRunning(false);
              onResult(result.file);
            }}
            className="rounded-lg bg-blue-700 px-3 py-2 font-bold text-white disabled:opacity-40"
          >
            Use this panorama
          </button>
        </>
      )}
    </div>
  );
}
