import type * as THREE from "three";

/**
 * Exponential smoothing with the λ semantics used by the 3D spec
 * (04-SPEC: "damp3 λ3.2 / dampE λ3.0 / scalar damp λ3", reduced-motion λ→8).
 * Frame-rate independent, allocation free.
 */
export function dampNum(
  current: number,
  target: number,
  lambda: number,
  dt: number,
) {
  return current + (target - current) * (1 - Math.exp(-lambda * dt));
}

export function dampVec(
  v: THREE.Vector3,
  x: number,
  y: number,
  z: number,
  lambda: number,
  dt: number,
) {
  const k = 1 - Math.exp(-lambda * dt);
  v.x += (x - v.x) * k;
  v.y += (y - v.y) * k;
  v.z += (z - v.z) * k;
}
