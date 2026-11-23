import { describe, expect, it } from "vitest";
import {
  cameraPose,
  captureTargets,
  direction,
  dot,
  project,
  type Pose,
  type Vec3,
} from "@/lib/camera-panorama";
function poseAt(yaw: number, pitch: number): Pose {
  const a = (yaw * Math.PI) / 180,
    p = (pitch * Math.PI) / 180;
  return {
    forward: direction(yaw, pitch),
    right: [Math.cos(a), -Math.sin(a), 0],
    up: [-Math.sin(a) * Math.sin(p), -Math.cos(a) * Math.sin(p), Math.cos(p)],
  };
}
describe("camera sphere projection", () => {
  it("maps an upright rear camera and screen rotation without mirroring", () => {
    const pose = cameraPose(0, 90, 0);
    expect(pose.forward[1]).toBeCloseTo(1);
    expect(pose.up[2]).toBeCloseTo(1);
    expect(project([0, 1, 0], pose, 1, 1)).toEqual({ x: 0, y: expect.closeTo(0) });
    expect(project([1, 2, 0], pose, 1, 1)?.x).toBeCloseTo(0.5);
    expect(project([0, -1, 0], pose, 1, 1)).toBeNull();
    const rotated = cameraPose(0, 90, 0, 90);
    expect(rotated.right[2]).toBeCloseTo(1);
    expect(rotated.up[0]).toBeCloseTo(-1);
  });
  it("keeps camera axes orthogonal at tilted and rolled orientations", () => {
    const pose = cameraPose(123, 52, -27, 270);
    const axes: Vec3[] = [pose.forward, pose.up, pose.right];
    axes.forEach((axis) => expect(dot(axis, axis)).toBeCloseTo(1));
    expect(dot(pose.forward, pose.up)).toBeCloseTo(0);
    expect(dot(pose.right, pose.up)).toBeCloseTo(0);
  });
  it.each([40, 55, 75])(
    "covers the entire sphere with guided targets at %i degree lens width",
    (fov) => {
      for (const aspect of [16 / 9, 9 / 16, 4 / 3]) {
        const poses = captureTargets(fov, aspect, 17).map((t) => poseAt(t.yaw, t.pitch));
        const h = Math.tan((fov * Math.PI) / 360),
          v = h / aspect;
        for (let pitch = -90; pitch <= 90; pitch += 3) {
          for (let yaw = -180; yaw < 180; yaw += 3) {
            expect(poses.some((pose) => project(direction(yaw, pitch), pose, h, v) !== null)).toBe(
              true,
            );
          }
        }
      }
    },
  );
});
