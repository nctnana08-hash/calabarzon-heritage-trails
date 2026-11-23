import { useEffect, useRef, useState } from "react";
import { preparePanorama } from "@/lib/prepare-panorama";

export function PanoramaUploadGuide({
  onFile,
  onBusy,
  disabled = false,
}: {
  onFile: (file: File | null) => void;
  onBusy: (busy: boolean) => void;
  disabled?: boolean;
}) {
  const [prepared, setPrepared] = useState<Awaited<ReturnType<typeof preparePanorama>> | null>(
    null,
  );
  const [preview, setPreview] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const generation = useRef(0);
  useEffect(
    () => () => {
      generation.current += 1;
    },
    [],
  );
  useEffect(() => {
    if (!prepared) {
      setPreview("");
      return;
    }
    const url = URL.createObjectURL(prepared.file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [prepared]);

  return (
    <section className="space-y-3 rounded-xl border border-slate-300 p-3 text-left text-sm dark:border-slate-600">
      <details open>
        <summary className="cursor-pointer font-bold">Guide: capture a complete 360° room</summary>
        <ol className="mt-2 list-decimal space-y-2 pl-5 text-xs leading-relaxed">
          <li>
            Use a 360 camera or a camera app with a <strong>full-sphere / photo-sphere</strong>{" "}
            mode. An ordinary camera photo or short panorama will not cover the room.
          </li>
          <li>
            Stand in one spot. Keep the camera lens at the same point as you turn. Follow your
            capture app’s targets around the room, then above and below you. Overlap neighboring
            views and avoid moving people.
          </li>
          <li>
            Let that app finish stitching. Export <strong>equirectangular, 360° × 180°</strong>,
            ideally 4096 × 2048. Choose the stitched image, not the separate camera shots or a
            dual-fisheye image.
          </li>
          <li>
            Select the export below. We prepare an exact <strong>2:1</strong> image up to 4096 ×
            2048 and show what will be uploaded.
          </li>
        </ol>
      </details>
      <label className="block font-semibold">
        Select captured panorama
        <input
          className="mt-2 block w-full text-xs"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          disabled={disabled || busy}
          onChange={async (event) => {
            const file = event.target.files?.[0];
            if (!file) return;
            const token = ++generation.current;
            setPrepared(null);
            setConfirmed(false);
            setError("");
            onFile(null);
            setBusy(true);
            onBusy(true);
            try {
              const result = await preparePanorama(file);
              if (generation.current === token) setPrepared(result);
            } catch (reason) {
              if (generation.current === token)
                setError(reason instanceof Error ? reason.message : "Image preparation failed.");
            } finally {
              if (generation.current === token) {
                setBusy(false);
                onBusy(false);
              }
            }
            event.target.value = "";
          }}
        />
      </label>
      {busy && <p role="status">Preparing your panorama…</p>}
      {error && (
        <p role="alert" className="text-xs text-red-600 dark:text-red-400">
          {error}
        </p>
      )}
      {prepared && (
        <div className="space-y-2">
          {preview && (
            <img
              src={preview}
              alt="Prepared panorama that will be used for this room"
              className="aspect-[2/1] w-full rounded-lg object-contain bg-slate-900"
            />
          )}
          <p className="text-xs font-semibold">
            Ready: {prepared.width} × {prepared.height} · 2:1 · JPG
          </p>
          {prepared.padded && (
            <p className="text-xs">
              Small dark borders were added to fit 2:1 without stretching or cutting off your photo.
              For seamless edges, export an exact 2:1 sphere from your capture app.
            </p>
          )}
          <label className="flex items-start gap-2 text-xs">
            <input
              type="checkbox"
              disabled={disabled}
              checked={confirmed}
              onChange={(event) => {
                setConfirmed(event.target.checked);
                onFile(event.target.checked ? prepared.file : null);
              }}
            />
            I checked the preview. This image covers the full room, including the ceiling and floor.
            Sizing alone cannot check or create missing views.
          </label>
        </div>
      )}
    </section>
  );
}
