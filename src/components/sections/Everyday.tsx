"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useRef, useState } from "react";
import { EVERYDAY } from "@/lib/copy";
import { usePageHidden } from "@/lib/hooks";
import { useUi } from "@/lib/store";

const SCENES = EVERYDAY.scenes;

/**
 * One unique metaphor per moment, stroke 1.5 (WS4-3): a scene is never told by
 * hue alone — shape, label and colour all carry it.
 */
function SceneIcon({ kind, size = 14 }: { kind: string; size?: number }) {
  const common = {
    width: size,
    height: size,
    viewBox: "0 0 16 16",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.5,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };
  switch (kind) {
    // sunrise: horizon + half disc + rays
    case "sunrise":
      return (
        <svg {...common}>
          <path d="M1.4 12.6h13.2M4.9 12.6a3.1 3.1 0 0 1 6.2 0" />
          <path d="M8 3.1v1.6M3.4 5.1l1.1 1.1M12.6 5.1l-1.1 1.1" />
        </svg>
      );
    // work: briefcase
    case "work":
      return (
        <svg {...common}>
          <rect x="1.8" y="5.4" width="12.4" height="8.2" rx="1.6" />
          <path d="M6 5.4V4.2a1.4 1.4 0 0 1 1.4-1.4h1.2A1.4 1.4 0 0 1 10 4.2v1.2" />
        </svg>
      );
    // travel: aeroplane
    case "travel":
      return (
        <svg {...common}>
          <path d="M8 1.9c.62 0 1.05.62 1.05 1.35v2.9l4.75 2.72v1.4L9.05 8.85v2.86l1.6 1.2v1.05L8 13.2l-2.65.76V12.9l1.6-1.19V8.85L2.2 10.27v-1.4l4.75-2.72v-2.9C6.95 2.52 7.38 1.9 8 1.9Z" />
        </svg>
      );
    // home: house with a door
    default:
      return (
        <svg {...common}>
          <path d="M2.1 7.2 8 2.4l5.9 4.8v6.4H2.1V7.2Z" />
          <path d="M6.6 13.6V9.9h2.8v3.7" />
        </svg>
      );
  }
}

export default function Everyday() {
  const reduced = useUi((s) => s.reduced);
  const freeze = useUi((s) => s.freeze);
  const sceneIndex = useUi((s) => s.sceneIndex);
  const setScene = useUi((s) => s.setScene);
  const hidden = usePageHidden();
  const [hover, setHover] = useState(false);
  const [focusIn, setFocusIn] = useState(false);
  /** a manual pick hands control to the user for good (自動送りを上書き) */
  const [picked, setPicked] = useState(false);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);

  const paused = reduced || freeze || hidden || hover || focusIn || picked;

  /*
   * The bar is the clock. Loop 3 ran a 5s timer next to a 5s CSS animation:
   * pausing on hover paused the bar but restarted the timer on release, so the
   * bar finished, sat full, and the scene changed seconds later. Now the scene
   * advances when the bar it belongs to actually finishes — one source of
   * truth, and `animation-play-state` handles every pause for free.
   */
  const advance = () => {
    const next = (sceneIndex + 1) % SCENES.length;
    setScene(next, SCENES[next].color);
  };

  const pick = (i: number) => {
    setPicked(true);
    setScene(i, SCENES[i].color);
  };

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    e.preventDefault();
    const dir = e.key === "ArrowRight" ? 1 : -1;
    const next = (sceneIndex + dir + SCENES.length) % SCENES.length;
    pick(next);
    tabs.current[next]?.focus();
  };

  const scene = SCENES[sceneIndex];

  return (
    <section
      id="everyday"
      data-section="everyday"
      className="relative z-10 flex min-h-screen flex-col justify-center overflow-hidden py-12 md:py-32"
      onPointerEnter={() => setHover(true)}
      onPointerLeave={() => setHover(false)}
      onFocusCapture={() => setFocusIn(true)}
      onBlurCapture={() => setFocusIn(false)}
    >
      {/* scene glow: one layer per scene, cross-faded */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        {SCENES.map((s, i) => (
          <span
            key={s.tab}
            className="absolute inset-0 block transition-opacity duration-[800ms] ease-[cubic-bezier(0.165,0.84,0.44,1)]"
            style={{
              opacity: i === sceneIndex ? 1 : 0,
              background: `radial-gradient(60vw 60vw at 50% 46%, ${s.color}1f, transparent 68%)`,
            }}
          />
        ))}
      </div>

      {/*
        Text starts on the common container edge at every width (WS3-2 — 768 was
        indented 109px). The device takes the free half: right of the copy on a
        tablet, bottom-left on a desktop stage.
      */}
      <div className="nova-shell relative lg:flex lg:justify-end">
        <div className="w-full md:max-w-[58%] lg:max-w-[620px]">
          <div className="nova-scrim nova-scrim-soft max-w-2xl">
            <p className="nova-label text-accent-soft">{EVERYDAY.kicker}</p>
            <h2 className="nova-h2 mt-5">{EVERYDAY.heading}</h2>
            <p className="nova-lead mt-5">{EVERYDAY.sub}</p>
          </div>

          {/* 390: a dedicated band for the device so it is visible at every
              width without ever sitting under the copy (WS4-2). Loop 3 gives it
              enough height for the device to read as the product (≥180px wide)
              rather than as a small ornament above the tabs (WS-D4). */}
          <div className="h-[22vh] md:hidden" aria-hidden="true" />

          <div
            role="tablist"
            aria-label="Moments of the day"
            onKeyDown={onKey}
            className="mt-4 grid grid-cols-2 gap-2.5 md:mt-12 lg:flex lg:flex-wrap"
          >
            {SCENES.map((s, i) => {
              const on = i === sceneIndex;
              return (
                <button
                  key={s.tab}
                  ref={(el) => {
                    tabs.current[i] = el;
                  }}
                  type="button"
                  role="tab"
                  id={`scene-tab-${i}`}
                  aria-selected={on}
                  aria-controls="scene-panel"
                  data-testid="scene-tab"
                  /* roving tabIndex: a tablist is one stop, and the arrow keys
                     move inside it — four separate Tab stops is not what a
                     screen-reader user is told this control does */
                  tabIndex={on ? 0 : -1}
                  onClick={() => pick(i)}
                  /* shared selected token: white/8 fill, white ink, lit edge —
                     the accent detail here is the underline (WS-D1/D2) */
                  className={`nova-tap relative flex h-[45px] items-center justify-center gap-2.5 overflow-hidden rounded-full border px-5 text-[13px] transition-colors duration-300 ${
                    on
                      ? "nova-pick"
                      : "border-hairline text-body hover:bg-white/[0.05] hover:text-fg"
                  }`}
                >
                  <span style={{ color: on ? s.color : undefined }}>
                    <SceneIcon kind={s.icon} />
                  </span>
                  {s.tab}
                  {on ? (
                    picked || reduced ? (
                      <span
                        aria-hidden="true"
                        className="absolute inset-x-0 bottom-0 h-[2px] bg-accent-soft/70"
                      />
                    ) : (
                      <span
                        key={`p-${sceneIndex}`}
                        aria-hidden="true"
                        className="nova-progress absolute inset-x-0 bottom-0 h-[2px] bg-accent-soft/70"
                        style={{
                          animationPlayState: paused ? "paused" : "running",
                        }}
                        onAnimationEnd={advance}
                      />
                    )
                  ) : null}
                </button>
              );
            })}
          </div>

          <div
            id="scene-panel"
            role="tabpanel"
            aria-labelledby={`scene-tab-${sceneIndex}`}
            className="nova-scrim nova-scrim-soft relative mt-10 max-w-2xl md:mt-12"
          >
            <AnimatePresence initial={false} mode="wait">
              <motion.div
                key={scene.tab}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: reduced ? 0 : 0.4 }}
              >
                <p
                  data-testid="scene-quote"
                  className="font-light text-fg"
                  style={{
                    fontSize: "clamp(21px, 2.6vw, 28px)",
                    lineHeight: 1.42,
                    letterSpacing: "-0.015em",
                    /* hang the opening quote in the margin so the first letter
                       of the sentence lands on the same edge as the H2 above
                       it, not one glyph to its right (WS-B7). 0.393em is the
                       measured advance of “ in Inter — measured, not guessed,
                       because 0.42em overhangs by ¾px at 28px. */
                    textIndent: "-0.393em",
                  }}
                >
                  {scene.quote}
                </p>
                <p
                  className="nova-label mt-6 flex items-center gap-2.5"
                  style={{ color: scene.color }}
                >
                  <SceneIcon kind={scene.icon} />
                  <span data-testid="scene-context">{scene.context}</span>
                </p>
                <ul className="mt-7 flex flex-wrap gap-2">
                  {scene.chips.map((chip) => (
                    <li
                      key={chip}
                      className="rounded-full border border-hairline px-3.5 py-1.5 text-[13px] text-mute"
                    >
                      {chip}
                    </li>
                  ))}
                </ul>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}
