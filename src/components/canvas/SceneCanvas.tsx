"use client";

import { Environment, Sparkles } from "@react-three/drei";
import { Canvas, useFrame, type RootState } from "@react-three/fiber";
import { Bloom, EffectComposer } from "@react-three/postprocessing";
import { useEffect, useMemo, useRef, useState } from "react";
import { suspend } from "suspend-react";
import type * as THREE from "three";
import { dampNum } from "@/lib/damp";
import { motionState } from "@/lib/motion-state";
import { useUi } from "@/lib/store";
import NovaDevice from "./NovaDevice";
import Rig from "./Rig";

/** studio HDRI from @pmndrs/assets (Poly Haven, CC0) — inlined data URI */
const HDRI_KEY: string[] = ["nova/hdri/studio"];
const loadHdri = () =>
  import("@pmndrs/assets/hdri/studio.exr").then((m) => m.default as string);

function Studio() {
  const file = suspend(loadHdri, HDRI_KEY);
  return (
    /* the studio's big light panel used to sit straight in front of the camera
       and blow out the flat profile in Reveal step 2 — rotated away, and a
       notch dimmer, with per-pose damping handled by the rig (WS5-1) */
    <Environment
      files={file}
      environmentIntensity={0.45}
      environmentRotation={[0, Math.PI * 0.62, 0]}
    />
  );
}

function FirstFrame({ onReady }: { onReady: () => void }) {
  const done = useRef(false);
  useFrame(() => {
    // one counter, always on: scripts/shots.mjs and the e2e helpers both prove
    // the render loop is still advancing before they photograph or measure
    // anything. Headless WebGL2 sometimes dies mid-session, and a stalled loop
    // looks exactly like "the device is gone".
    const w = window as Window & { __novaFrames?: number };
    w.__novaFrames = (w.__novaFrames ?? 0) + 1;
    if (done.current) return;
    done.current = true;
    onReady();
  });
  return null;
}

const DUST = 90;

/** Background particles; opacity eases down where text must dominate. */
function Dust({ reduced, freeze }: { reduced: boolean; freeze: boolean }) {
  const points = useRef<THREE.Points>(null);
  const base = useMemo(
    () => Float32Array.from({ length: DUST }, () => 0.45 + Math.random() * 0.55),
    [],
  );
  const opacity = useMemo(
    () => Float32Array.from(base, (v) => v * 0.3),
    [base],
  );
  const level = useRef(0.3);

  useFrame((_, delta) => {
    const m = motionState;
    const quiet =
      m.active === "specs" || m.active === "experience" || m.active === "footer";
    /*
     * Below 1024 the Technology list runs down the middle of the stage, and a
     * particle landing between two words is read as punctuation — "360°.Voice"
     * in the loop 2 review. Nothing about a dust mote is worth that, so it
     * steps out of that one section at those widths (WS-C4).
     */
    const collides = m.vw < 1024 && m.active === "technology";
    const goal = collides ? 0 : quiet ? 0.12 : 0.3;
    // capture mode settles in one frame instead of damping over time
    const next = m.freeze
      ? goal
      : dampNum(level.current, goal, m.reduced ? 8 : 2.2, Math.min(delta, 1 / 20));
    if (Math.abs(next - level.current) < 0.0004) return;
    level.current = next;
    for (let i = 0; i < DUST; i++) opacity[i] = base[i] * next;
    const attr = points.current?.geometry.getAttribute("opacity");
    if (attr) attr.needsUpdate = true;
  });

  return (
    <Sparkles
      ref={points}
      count={DUST}
      scale={[9, 5, 4]}
      size={1.2}
      speed={reduced || freeze ? 0 : 0.18}
      opacity={opacity}
      color="#8fa0ff"
    />
  );
}

export default function SceneCanvas({
  onContextLost,
}: {
  /** the GPU dropped the context: nothing this canvas draws will ever land */
  onContextLost?: () => void;
}) {
  const [ready, setReady] = useState(false);
  const [mobile, setMobile] = useState(false);
  const reduced = useUi((s) => s.reduced);
  const freeze = useUi((s) => s.freeze);

  // dpr, multisampling and the Bloom resolution are all phone/desktop choices.
  // Sampling innerWidth once at mount meant a tablet that rotated, or a window
  // dragged across the breakpoint, kept the settings of the width it loaded at.
  useEffect(() => {
    const phone = window.matchMedia("(max-width: 767px)");
    const sync = () => setMobile(phone.matches);
    sync();
    phone.addEventListener("change", sync);
    return () => phone.removeEventListener("change", sync);
  }, []);

  const onCreated = ({ gl }: RootState) => {
    /*
     * A lost context leaves a canvas that still exists, still reports a size
     * and still sits at opacity 1 — it simply never paints again, so the page
     * keeps a dead rectangle where the device used to be. Mark it for the
     * capture script and let the shell hand the stage to the CSS fallback.
     */
    gl.domElement.addEventListener("webglcontextlost", () => {
      document.documentElement.dataset.glLost = "true";
      onContextLost?.();
    });
  };

  return (
    <div
      data-canvas-layer
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 transition-opacity duration-[400ms] ease-[cubic-bezier(0.165,0.84,0.44,1)]"
      style={{ opacity: ready ? 1 : 0 }}
    >
      <Canvas
        aria-hidden="true"
        dpr={[1, mobile ? 1.5 : 2]}
        gl={{
          antialias: false,
          powerPreference: "high-performance",
          alpha: true,
          // keeps a presented frame around: without it headless screenshots
          // intermittently capture an empty drawing buffer
          preserveDrawingBuffer: true,
        }}
        camera={{ fov: 35, position: [0, 0, 7] }}
        onCreated={onCreated}
      >
        <FirstFrame onReady={() => setReady(true)} />
        <Studio />
        {/* decay 0 so the spec's intensities read as studio lights, not
            inverse-square candela; dialled down from 2.5/6 because anything
            over ~1.3 blows the clearcoat specular past the Bloom threshold */}
        <spotLight
          position={[4, 5, 4]}
          angle={0.62}
          penumbra={1}
          intensity={0.72}
          decay={0}
          color="#ffffff"
        />
        <pointLight
          position={[-3, 1, -3]}
          intensity={1.9}
          decay={0}
          color="#7c8cff"
        />
        <Rig>
          <NovaDevice />
        </Rig>
        <Dust reduced={reduced} freeze={freeze} />
        <EffectComposer multisampling={mobile ? 0 : 4} enableNormalPass={false}>
          {/* threshold nudged above 1.0: clearcoat specular peaks just over 1
              and would bloom too, which fights "Bloom は光輪限定" */}
          <Bloom
            mipmapBlur
            intensity={0.9}
            luminanceThreshold={1.34}
            luminanceSmoothing={0.28}
            resolutionScale={mobile ? 0.5 : 1}
          />
        </EffectComposer>
      </Canvas>
    </div>
  );
}
