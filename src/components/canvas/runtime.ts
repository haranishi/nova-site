import * as THREE from "three";

/**
 * Values the rig computes each frame and the device applies. Kept outside React
 * so nothing here can trigger a render.
 */
export const runtime = {
  /** 0..1 exploded view amount */
  explode: 0,
  /** light-ring emissive intensity (Bloom only picks up > 1) */
  ringEI: 2.2,
  /** light-ring emissive colour (lerped to the Everyday scene colour) */
  ringColor: new THREE.Color("#7c8cff"),
  /** technology halo ring */
  haloY: 0.305,
  haloR: 0.68,
  haloEI: 2.5,
  /** neural-engine chip emphasis multiplier */
  chipEI: 1.4,
  /** shell envMapIntensity, damped down on poses that catch the HDRI panel */
  envInt: 1.15,
};

/** Part layout: resting y and its explode offset (04-SPEC §Explode). */
export const PARTS = {
  bodyUpper: { y: 0, e: 0.85 },
  dish: { y: 0.246, e: 1.0 },
  ring: { y: 0.305, e: 1.15 },
  micRing: { y: 0.158, e: 0.65 },
  board: { y: -0.02, e: 0.28 },
  battery: { y: -0.1, e: -0.05 },
  coil: { y: -0.19, e: -0.35 },
  band: { y: 0, e: -0.25 },
  bodyLower: { y: 0, e: -0.75 },
} as const;

export type PartName = keyof typeof PARTS;

/** Technology item → exploded part the halo travels to, plus its ring radius. */
export const HALO_TARGET: Record<string, { part: PartName; r: number }> = {
  neural: { part: "board", r: 0.8 },
  voice: { part: "micRing", r: 0.88 },
  spatial: { part: "ring", r: 0.7 },
  battery: { part: "battery", r: 0.74 },
  secure: { part: "bodyLower", r: 1.06 },
};

export const TECH_PARTS = [
  "neural",
  "voice",
  "spatial",
  "battery",
  "secure",
] as const;
