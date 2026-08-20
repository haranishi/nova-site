"use client";

import { useFrame } from "@react-three/fiber";
import { easing } from "maath";
import { useRef, type ReactNode } from "react";
import * as THREE from "three";
import { dampNum } from "@/lib/damp";
import {
  clamp,
  clamp01,
  easeInOut,
  mix,
  motionState,
  smoothstep,
  type MotionState,
} from "@/lib/motion-state";
import { TECH_BAND } from "@/lib/scroll-engine";
import { HALO_TARGET, PARTS, runtime, TECH_PARTS } from "./runtime";

type Pose = {
  x: number;
  y: number;
  z: number;
  s: number;
  rx: number;
  rz: number;
  spin: number;
  /**
   * How much of this pose came from the 16:9-authored desktop column, 0..1.
   * It rides along through `blend` so a cross-fade between a tablet-authored
   * pose and a desktop one gets a proportional correction instead of an
   * all-or-nothing module flag decided by whichever `read` ran last.
   */
  desk: number;
};

type Stage = "d" | "t" | "m";

type PoseDef = {
  /** desktop (≥1024) x,y,z,scale */
  d: [number, number, number, number];
  /** tablet (768–1023) — authored for the real stage, so no lateral fudge */
  t?: [number, number, number, number];
  /** mobile (<768) x,y,z,scale */
  m: [number, number, number, number];
  rx: number;
  rz: number;
  /** idle spin rate, rad/s */
  spin: number;
};

/**
 * 04-SPEC §ポーズ表 with a tablet column added (WS3-3 / WS4-2): at 768 the
 * desktop offsets are authored for 16:9 and were eating the text column, and
 * the "off-screen on mobile" shortcut left three widths with no device at all.
 */
const POSES = {
  hero: {
    // dropped and trimmed again in loop 3: the fold now ends on a button row,
    // and the device has to clear it by a margin rather than crowd it
    d: [0, -1.36, 0, 0.66],
    t: [0, -1.06, 0, 0.62],
    m: [0, -1.3, 0, 0.5],
    rx: 0.95,
    rz: 0,
    spin: 0.12,
  },
  /** dedicated 1200×630 share-card pose (no nav, no cue, full silhouette) */
  og: {
    // the whole silhouette sits above the caption strip — nothing bleeds off
    // the bottom edge of the card (WS-A4)
    d: [0, -0.75, 0, 0.98],
    m: [0, -0.75, 0, 0.98],
    rx: 0.95,
    rz: 0,
    spin: 0.12,
  },
  /*
   * Reveal, 768–1023 (周4ミニ / 修正1). The tablet band is now the phone's
   * stacked composition — device above, copy below (see Reveal.tsx) — so all
   * three steps sit on the centre line with no lateral offset at all. That is
   * what kills the two 768 defects at the root: a device at x0 cannot cross a
   * centred heading, and it cannot reach the right edge to be clipped by it.
   * The stage is 1024px tall against the phone's 844, so the scale is lifted
   * from the mobile column rather than copied — the silhouette stays inside the
   * band above the copy while still reading as the product.
   */
  reveal1: {
    d: [1.35, -0.05, 0, 0.82],
    t: [0, 0.55, 0, 0.7],
    m: [0, 0.55, 0, 0.55],
    rx: 1.25,
    rz: 0,
    spin: 0.12,
  },
  reveal2: {
    d: [-1.35, 0, 0, 0.85],
    t: [0, 0.55, 0, 0.7],
    m: [0, 0.55, 0, 0.55],
    rx: 0.12,
    rz: 0.06,
    spin: 0.12,
  },
  reveal3: {
    // 04-SPEC reads "centre, behind, under the text": with all three bands on
    // the same centre line the device has to sit below them, not through them.
    // Loop 3 drops it further — the copy needs ≥48px of air, not 15 (WS-B3).
    // On a tablet the copy is below the device instead, so the pose follows the
    // mobile shape (above, slightly further back) rather than the desktop one.
    d: [0, -1.52, -0.6, 0.64],
    t: [0, 0.6, -0.4, 0.62],
    m: [0, 0.62, -0.4, 0.46],
    rx: 0.6,
    rz: -0.08,
    spin: 0.12,
  },
  /**
   * Experience has no device on stage at any width (WS-D3). The panel and the
   * orb are the subject here; a small metal ellipse floating beside them read
   * as decoration, and on a 1440 screen it sat in the left margin doing
   * nothing. It leaves downwards, the same direction as specs / footer.
   */
  experience: {
    d: [0, -3.4, -0.6, 0.42],
    m: [0, -3.4, -0.6, 0.42],
    rx: 0.8,
    rz: 0,
    spin: 0.05,
  },
  technology: {
    d: [0.55, 0, 0, 0.8],
    // tablet: inside the free band right of the ≥380px text column
    t: [0.82, 0, 0, 0.58],
    // mobile: the exploded stack has to clear the H2 above and the item below
    m: [0, -0.35, 0, 0.52],
    rx: 0.55,
    rz: 0,
    spin: 0.25,
  },
  everyday: {
    // ×1.5 of loop 1, optical centre on the quote block
    d: [-1.5, -0.75, 0, 0.66],
    /*
     * tablet: the empty right half. The copy column ends at x439 (58% of the
     * 688px shell), and loop 3's pose put the rim at x449 — a 10–15px gutter
     * that read as a collision. Pushed out and trimmed so the silhouette starts
     * ≥32px clear of the tab row and still lands ~50px inside the right edge
     * (周4ミニ / 修正1).
     */
    t: [0.91, -0.15, 0, 0.52],
    // mobile: big enough to be the product rather than a doodle — 191px wide
    // inside its own 22vh band, not a 130px ornament above the tabs (WS-D4)
    m: [0, 0.34, -0.2, 0.47],
    rx: 1.1,
    rz: 0,
    spin: 0.05,
  },
  offscreen: {
    d: [0, -3.2, 0, 0.62],
    m: [0, -3.2, 0, 0.5],
    rx: 0.8,
    rz: 0,
    spin: 0.05,
  },
  cta: {
    // the middle band between the headline and the price block is the device's
    // stage; loop 2 let it drift down until $299 sat on the rim
    d: [0, 0.26, 0.4, 0.87],
    t: [0, 0.2, 0.3, 0.84],
    m: [0, 0.3, 0.2, 0.68],
    rx: 0.75,
    rz: 0,
    spin: 0.18,
  },
} satisfies Record<string, PoseDef>;

type PoseName = keyof typeof POSES;

const read = (name: PoseName, stage: Stage, out: Pose) => {
  const def: PoseDef = POSES[name];
  const v = stage === "m" ? def.m : stage === "t" ? (def.t ?? def.d) : def.d;
  out.desk = stage === "d" || (stage === "t" && !def.t) ? 1 : 0;
  out.x = v[0];
  out.y = v[1];
  out.z = v[2];
  out.s = v[3];
  out.rx = def.rx;
  out.rz = def.rz;
  out.spin = def.spin;
  return out;
};

const blend = (a: Pose, b: Pose, t: number, out: Pose) => {
  out.x = mix(a.x, b.x, t);
  out.y = mix(a.y, b.y, t);
  out.z = mix(a.z, b.z, t);
  out.s = mix(a.s, b.s, t);
  out.rx = mix(a.rx, b.rx, t);
  out.rz = mix(a.rz, b.rz, t);
  out.spin = mix(a.spin, b.spin, t);
  out.desk = mix(a.desk, b.desk, t);
  return out;
};

const blank = (): Pose => ({
  x: 0,
  y: 0,
  z: 0,
  s: 1,
  rx: 0,
  rz: 0,
  spin: 0,
  desk: 0,
});

// frame-local scratch — no allocations inside useFrame
const tA = blank();
const tB = blank();
const target = blank();
const REVEAL: PoseName[] = ["reveal1", "reveal2", "reveal3"];

/**
 * Ring colour targets. `dampC` re-parses a CSS string on every call, which is
 * a hex parse and a colour-space conversion 60 times a second for a value that
 * changes four times on the whole page. The scene colour is parsed once per
 * scene instead, keyed on the string the store handed over.
 */
const RING_DEFAULT = new THREE.Color("#7c8cff");
const ringScene = new THREE.Color();
let ringSceneKey = "";

function ringColorFor(m: MotionState) {
  if (m.active !== "everyday") return RING_DEFAULT;
  if (m.sceneColor !== ringSceneKey) {
    ringSceneKey = m.sceneColor;
    ringScene.set(m.sceneColor);
  }
  return ringScene;
}

function computeTarget(m: MotionState, out: Pose) {
  const stage: Stage = m.mobile ? "m" : m.vw < 1024 ? "t" : "d";
  if (m.og) return read("og", "d", out);
  switch (m.active) {
    case "reveal": {
      // hold each step around its band centre, cross-fade in between
      const u = Math.min(2, Math.max(0, m.pin.reveal * 3 - 0.5));
      const i = Math.min(1, Math.floor(u));
      const f = smoothstep(0, 1, u - i);
      return blend(
        read(REVEAL[i], stage, tA),
        read(REVEAL[i + 1], stage, tB),
        f,
        out,
      );
    }
    case "experience":
      return read("experience", stage, out);
    case "technology":
      return read("technology", stage, out);
    case "everyday":
      return read("everyday", stage, out);
    case "specs":
    case "footer":
      return read("offscreen", stage, out);
    case "cta":
      return read("cta", stage, out);
    default:
      return read("hero", stage, out);
  }
}

/**
 * Environment intensity per pose. Reveal step 2 shows the flat profile almost
 * edge-on, where the studio HDRI's light panel lands as one blown-out slab —
 * damping the env there (plus the rotated environment and the higher Bloom
 * threshold) keeps the ring the only thing that glows (WS5-1).
 */
function envFor(m: MotionState) {
  if (m.active !== "reveal") return 1.15;
  const u = clamp01(m.pin.reveal * 3 - 0.5);
  // weight peaks over step 2 (u≈1) and falls off towards steps 1 and 3
  const near2 = 1 - clamp01(Math.abs(u - 1) / 0.85);
  return mix(1.0, 0.6, near2);
}

/** Explode amount across the technology pin: ramp up, item bands, ramp down. */
function explodeFor(m: MotionState) {
  if (m.active !== "technology") return 0;
  const p = m.pin.technology;
  const up = smoothstep(TECH_BAND.start, TECH_BAND.open, p);
  const down = 1 - smoothstep(TECH_BAND.close, 1, p);
  return easeInOut(Math.min(up, down));
}

function ringTarget(m: MotionState) {
  switch (m.active) {
    case "hero":
      return m.reduced ? 2.2 : 2.2 + Math.sin(m.time * 0.9) * 0.3;
    case "experience":
      if (!m.speaking) return 2;
      return m.reduced ? 3.6 : 2.8 + Math.sin(m.time * Math.PI * 4) * 0.8;
    case "cta":
      return mix(2.6, 3.8, m.ctaHover);
    case "specs":
    case "footer":
      return 1.6;
    default:
      return 2.2;
  }
}

export default function Rig({ children }: { children: ReactNode }) {
  const group = useRef<THREE.Group>(null);
  const spin = useRef(0);
  const rate = useRef(0.12);
  const state = useRef({
    explode: 0,
    ringEI: 2.2,
    haloY: 0.305,
    haloR: 0.68,
    envInt: 1.15,
  });

  useFrame((_, rawDelta) => {
    const g = group.current;
    if (!g) return;
    const m = motionState;
    const dt = Math.min(rawDelta, 1 / 20);
    const lambdaPos = m.reduced ? 8 : 3.2;
    const lambdaRot = m.reduced ? 8 : 3;
    const lambdaS = m.reduced ? 8 : 3;

    computeTarget(m, target);
    // the desktop column is authored for a ~16:9 stage. On a narrower viewport
    // the world offset would push the device off the side and its
    // height-relative size would eat the text column, so both follow the
    // visible half-width. Poses with their own tablet column skip this.
    if (target.desk > 0 && !m.og) {
      const lateral = clamp(m.vw / Math.max(1, m.vh) / 1.6, 0.42, 1);
      target.x *= mix(1, lateral, target.desk);
      target.s *= mix(1, mix(1, lateral, 0.45), target.desk);
    }

    // short stages (laptop windows): the hero text stack is sized in px while
    // the device is sized in vh, so drop it further. The OG frame has its own
    // composition and must not be corrected twice.
    if (m.active === "hero" && !m.og) {
      target.y -= clamp((820 - m.vh) / 820, 0, 0.4) * 1.4;
    }

    // hero-only float + pointer parallax (user driven, desktop only)
    let px = 0;
    let py = 0;
    let rxOffset = 0;
    let ryOffset = 0;
    if (m.active === "hero" && !m.reduced && !m.freeze) {
      py += Math.sin(m.time * 1.15) * 0.06;
      if (!m.mobile) {
        px += m.pointerX * 0.1;
        py += -m.pointerY * 0.1;
        rxOffset = m.pointerY * 0.06;
        ryOffset = m.pointerX * 0.06;
      }
    }

    const speakingBump =
      m.active === "experience" && m.speaking && !m.reduced ? 1.02 : 1;

    g.position.x = dampNum(g.position.x, target.x + px, lambdaPos, dt);
    g.position.y = dampNum(g.position.y, target.y + py, lambdaPos, dt);
    g.position.z = dampNum(g.position.z, target.z, lambdaPos, dt);

    g.rotation.x = dampNum(g.rotation.x, target.rx + rxOffset, lambdaRot, dt);
    g.rotation.z = dampNum(g.rotation.z, target.rz, lambdaRot, dt);

    if (m.freeze) {
      // deterministic capture: no accumulated idle rotation at all
      rate.current = 0;
      spin.current = 0;
    } else {
      rate.current = dampNum(rate.current, m.reduced ? 0 : target.spin, 2, dt);
      spin.current += rate.current * dt;
    }
    g.rotation.y = spin.current + ryOffset;

    const s = dampNum(g.scale.x, target.s * speakingBump, lambdaS, dt);
    g.scale.setScalar(s);

    // ── device internals ───────────────────────────────────────────────
    state.current.explode = dampNum(
      state.current.explode,
      explodeFor(m),
      m.reduced ? 8 : 3,
      dt,
    );
    runtime.explode = state.current.explode;

    state.current.ringEI = dampNum(
      state.current.ringEI,
      ringTarget(m),
      m.reduced ? 8 : 4.5,
      dt,
    );
    runtime.ringEI = state.current.ringEI;

    state.current.envInt = dampNum(
      state.current.envInt,
      envFor(m),
      m.reduced ? 8 : 2.6,
      dt,
    );
    runtime.envInt = state.current.envInt;

    easing.dampC(runtime.ringColor, ringColorFor(m), 0.3, dt);

    const key = TECH_PARTS[Math.min(4, Math.max(0, m.techIndex))];
    const halo = HALO_TARGET[key];
    const part = PARTS[halo.part];
    const pulse = m.reduced ? 1 : 1 + Math.sin(m.time * 4) * 0.015;
    state.current.haloY = dampNum(
      state.current.haloY,
      part.y + part.e * runtime.explode,
      m.reduced ? 8 : 3.2,
      dt,
    );
    state.current.haloR = dampNum(
      state.current.haloR,
      halo.r,
      m.reduced ? 8 : 3.2,
      dt,
    );
    runtime.haloY = state.current.haloY;
    runtime.haloR = state.current.haloR * pulse;
    runtime.haloEI = 2.5 * (m.reduced ? 1 : 1 + Math.sin(m.time * 4) * 0.18);
    runtime.chipEI = key === "neural" ? 1.4 * 2.2 : 1.4;
    // keep the exploded internals from over-glowing when parked off-screen
    runtime.chipEI *= clamp01(0.35 + runtime.explode);
  });

  return <group ref={group}>{children}</group>;
}
