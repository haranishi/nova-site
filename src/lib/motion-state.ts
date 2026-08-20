/**
 * Mutable, non-reactive motion state.
 *
 * Written once per rAF by the scroll engine, read inside useFrame / DOM tick
 * subscribers. Deliberately NOT zustand state: per-frame setState is banned
 * (07-IMPLEMENT-BRIEF), only band crossings go through the store.
 */

import { EVERYDAY } from "./copy";

export const SECTION_KEYS = [
  "hero",
  "reveal",
  "experience",
  "technology",
  "everyday",
  "specs",
  "cta",
  "footer",
] as const;

export type SectionKey = (typeof SECTION_KEYS)[number];

export type MotionState = {
  /** window.scrollY */
  y: number;
  vw: number;
  vh: number;
  /** seconds since engine start */
  time: number;
  mobile: boolean;
  reduced: boolean;
  /** ?freeze=1 — hold every time-driven animation for deterministic capture */
  freeze: boolean;
  /** ?og=1 — the purpose-built 1200×630 share-card composition */
  og: boolean;
  /** section under the viewport centre */
  active: SectionKey;
  /** 0..1 across the whole section incl. viewport travel */
  progress: Record<SectionKey, number>;
  /** 0..1 across the pinned travel of a taller-than-viewport section */
  pin: Record<SectionKey, number>;
  /**
   * Signed distance in px from the section's top to the scroll position.
   * Negative while the section is still coming: a sticky child can use it to
   * pre-position itself over the section above (Reveal's hand-off).
   */
  pinPx: Record<SectionKey, number>;
  /** pointer, -1..1, relative to viewport centre */
  pointerX: number;
  pointerY: number;
  /** mirrors of interactive UI state, for the 3D rig */
  speaking: number;
  sceneIndex: number;
  sceneColor: string;
  techIndex: number;
  ctaHover: number;
  navOpen: number;
};

const zero = (): Record<SectionKey, number> =>
  SECTION_KEYS.reduce(
    (acc, k) => {
      acc[k] = 0;
      return acc;
    },
    {} as Record<SectionKey, number>,
  );

export const motionState: MotionState = {
  y: 0,
  vw: 1440,
  vh: 900,
  time: 0,
  mobile: false,
  reduced: false,
  freeze: false,
  og: false,
  active: "hero",
  progress: zero(),
  pin: zero(),
  pinPx: zero(),
  pointerX: 0,
  pointerY: 0,
  speaking: 0,
  sceneIndex: 0,
  /* has to match `sceneIndex` from the first frame: the ring is the scene's
     colour, and arriving at Everyday without touching a tab used to show the
     Morning tab lit in amber next to a device still glowing default blue */
  sceneColor: EVERYDAY.scenes[0].color,
  techIndex: 0,
  ctaHover: 0,
  navOpen: 0,
};

/* ── math ─────────────────────────────────────────────────────────────── */

export const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);

export const clamp = (v: number, min: number, max: number) =>
  v < min ? min : v > max ? max : v;

export const mix = (a: number, b: number, t: number) => a + (b - a) * t;

/** cubic smoothstep across [edge0, edge1] */
export function smoothstep(edge0: number, edge1: number, x: number) {
  const t = clamp01((x - edge0) / (edge1 - edge0 || 1));
  return t * t * (3 - 2 * t);
}

/** 0..1 → eased 0..1 (easeInOutCubic), used for explode */
export function easeInOut(t: number) {
  const x = clamp01(t);
  return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
}

/* ── per-frame subscribers (DOM writes without React re-renders) ───────── */

type Tick = (m: MotionState) => void;
const ticks = new Set<Tick>();

export function onTick(fn: Tick) {
  ticks.add(fn);
  return () => {
    ticks.delete(fn);
  };
}

export function runTicks() {
  for (const fn of ticks) fn(motionState);
}
