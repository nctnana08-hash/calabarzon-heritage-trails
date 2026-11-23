export type Vec3 = [number, number, number];
export type Pose = { right: Vec3; up: Vec3; forward: Vec3 };
export type CameraShot = { blob: Blob; pose: Pose };
const rad = Math.PI / 180;
export const dot = (a: Vec3, b: Vec3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
export function direction(yaw: number, pitch: number): Vec3 {
  return [
    Math.sin(yaw * rad) * Math.cos(pitch * rad),
    Math.cos(yaw * rad) * Math.cos(pitch * rad),
    Math.sin(pitch * rad),
  ];
}
// W3C device orientation uses Rz(alpha) Rx(beta) Ry(gamma).
// The rear camera points along the negative device Z axis.
export function cameraPose(alpha: number, beta: number, gamma: number, screenAngle = 0): Pose {
  const a = alpha * rad,
    b = beta * rad,
    g = gamma * rad,
    s = screenAngle * rad;
  const ca = Math.cos(a),
    sa = Math.sin(a),
    cb = Math.cos(b),
    sb = Math.sin(b),
    cg = Math.cos(g),
    sg = Math.sin(g);
  const x: Vec3 = [ca * cg - sa * sb * sg, sa * cg + ca * sb * sg, -cb * sg];
  const y: Vec3 = [-sa * cb, ca * cb, sb];
  return {
    right: x.map((v, i) => v * Math.cos(s) + y[i]! * Math.sin(s)) as Vec3,
    up: y.map((v, i) => v * Math.cos(s) - x[i]! * Math.sin(s)) as Vec3,
    forward: [-(ca * sg + sa * sb * cg), -(sa * sg - ca * sb * cg), -cb * cg],
  };
}
export function project(ray: Vec3, pose: Pose, tanH: number, tanV: number) {
  const depth = dot(ray, pose.forward);
  if (depth <= 0) return null;
  const x = dot(ray, pose.right) / depth / tanH;
  const y = dot(ray, pose.up) / depth / tanV;
  return Math.abs(x) < 1 && Math.abs(y) < 1 ? { x, y } : null;
}
export function captureTargets(horizontalFov: number, aspect: number, startYaw: number) {
  const vfov = (2 * Math.atan(Math.tan((horizontalFov * rad) / 2) / aspect)) / rad;
  const steps = Math.ceil(180 / Math.min(35, vfov * 0.55));
  const pitches = Array.from({ length: steps - 1 }, (_, i) => -90 + ((i + 1) * 180) / steps).sort(
    (a, b) => Math.abs(a) - Math.abs(b),
  );
  const targets: { yaw: number; pitch: number }[] = [];
  for (const pitch of pitches) {
    const count = Math.ceil(360 / Math.min(75, (horizontalFov * 0.55) / Math.cos(pitch * rad)));
    for (let i = 0; i < count; i++) targets.push({ yaw: startYaw + (i * 360) / count, pitch });
  }
  return [...targets, { yaw: startYaw, pitch: 90 }, { yaw: startYaw, pitch: -90 }];
}

export async function stitchCameraShots(
  shots: CameraShot[],
  horizontalFov: number,
  signal: AbortSignal,
  progress: (value: number) => void,
) {
  const width = 2048,
    height = 1024;
  const sums = new Float32Array(width * height * 4);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) throw new Error("This device cannot combine camera photos.");
  const tanH = Math.tan((horizontalFov * rad) / 2);
  const yawSin = Array.from({ length: width }, (_, x) =>
    Math.sin((((x + 0.5) / width) * 360 - 180) * rad),
  );
  const yawCos = Array.from({ length: width }, (_, x) =>
    Math.cos((((x + 0.5) / width) * 360 - 180) * rad),
  );
  try {
    for (let index = 0; index < shots.length; index++) {
      signal.throwIfAborted();
      const shot = shots[index]!;
      const url = URL.createObjectURL(shot.blob);
      let img: HTMLImageElement;
      try {
        img = await new Promise<HTMLImageElement>((resolve, reject) => {
          const image = new Image();
          image.onload = () => resolve(image);
          image.onerror = () =>
            reject(new Error("A camera photo could not be decoded. Retake it."));
          image.src = url;
        });
      } finally {
        URL.revokeObjectURL(url);
      }
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      ctx.drawImage(img, 0, 0);
      const pixels = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
      const tanV = (tanH * canvas.height) / canvas.width;
      for (let y = 0; y < height; y++) {
        if (y % 64 === 0) {
          await new Promise((resolve) => setTimeout(resolve, 0));
          signal.throwIfAborted();
        }
        const pitch = (90 - ((y + 0.5) / height) * 180) * rad;
        const cp = Math.cos(pitch),
          sp = Math.sin(pitch);
        for (let x = 0; x < width; x++) {
          const uv = project([yawSin[x]! * cp, yawCos[x]! * cp, sp], shot.pose, tanH, tanV);
          if (!uv) continue;
          const sx = Math.min(canvas.width - 1, Math.floor(((uv.x + 1) / 2) * canvas.width));
          const sy = Math.min(canvas.height - 1, Math.floor(((1 - uv.y) / 2) * canvas.height));
          const source = (sy * canvas.width + sx) * 4,
            dest = (y * width + x) * 4;
          const weight = Math.max(0.0001, (1 - uv.x * uv.x) * (1 - uv.y * uv.y)) ** 2;
          for (let c = 0; c < 3; c++) sums[dest + c]! += pixels[source + c]! * weight;
          sums[dest + 3]! += weight;
        }
      }
      progress(Math.round(((index + 1) / shots.length) * 100));
    }
    canvas.width = width;
    canvas.height = height;
    const output = ctx.createImageData(width, height);
    let missing = 0;
    for (let p = 0; p < sums.length; p += 4) {
      const weight = sums[p + 3]!;
      if (!weight) missing++;
      for (let c = 0; c < 3; c++) output.data[p + c] = weight ? sums[p + c]! / weight : 0;
      output.data[p + 3] = 255;
    }
    ctx.putImageData(output, 0, 0);
    signal.throwIfAborted();
    const blob = await new Promise<Blob>((resolve, reject) =>
      canvas.toBlob(
        (value) =>
          value ? resolve(value) : reject(new Error("Could not save the stitched image.")),
        "image/jpeg",
        0.94,
      ),
    );
    return {
      file: new File([blob], "camera-panorama.jpg", { type: "image/jpeg" }),
      missing: missing / (width * height),
    };
  } finally {
    canvas.width = canvas.height = 1;
  }
}
