export function panoramaFit(width: number, height: number) {
  const ratio = width / height;
  if (!Number.isFinite(ratio) || width <= 0 || height <= 0 || ratio < 1.8 || ratio > 2.2) {
    throw new Error(
      "This does not look like a full-sphere export. Export a 360° × 180° equirectangular image from your capture app or 360 camera, then select it here. A normal photo or partial panorama cannot be converted into a complete sphere by resizing.",
    );
  }
  const outputWidth = Math.min(4096, Math.ceil(Math.max(width, height * 2) / 2) * 2);
  const outputHeight = outputWidth / 2;
  const scale = Math.min(outputWidth / width, outputHeight / height);
  const drawWidth = width * scale;
  const drawHeight = height * scale;
  return {
    width: outputWidth,
    height: outputHeight,
    x: (outputWidth - drawWidth) / 2,
    y: (outputHeight - drawHeight) / 2,
    drawWidth,
    drawHeight,
  };
}

export async function preparePanorama(
  file: File,
): Promise<{ file: File; padded: boolean; width: number; height: number }> {
  if (!["image/jpeg", "image/webp", "image/png"].includes(file.type))
    throw new Error("Choose a JPG, PNG, or WebP image.");
  if (file.size > 50 * 1024 * 1024) throw new Error("Choose an image no larger than 50 MB.");
  const url = URL.createObjectURL(file);
  const canvas = document.createElement("canvas");
  try {
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () =>
        reject(new Error("This image could not be opened. Export it as JPG and try again."));
      img.src = url;
    });
    const fit = panoramaFit(image.naturalWidth, image.naturalHeight);
    canvas.width = fit.width;
    canvas.height = fit.height;
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Image preparation is unavailable in this browser.");
    context.fillStyle = "#0f172a";
    context.fillRect(0, 0, fit.width, fit.height);
    context.drawImage(image, fit.x, fit.y, fit.drawWidth, fit.drawHeight);
    const blob = await new Promise<Blob>((resolve, reject) =>
      canvas.toBlob(
        (value) => (value ? resolve(value) : reject(new Error("Could not prepare this image."))),
        "image/jpeg",
        0.94,
      ),
    );
    return {
      file: new File([blob], `${file.name.replace(/\.[^.]+$/, "")}-360.jpg`, {
        type: "image/jpeg",
      }),
      padded: fit.x > 0 || fit.y > 0,
      width: fit.width,
      height: fit.height,
    };
  } finally {
    URL.revokeObjectURL(url);
    canvas.width = canvas.height = 1;
  }
}
