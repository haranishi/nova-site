"use client";

import Lenis from "lenis";
import { useEffect } from "react";
import {
  SECTION_KEYS,
  clamp01,
  motionState,
  runTicks,
  type SectionKey,
} from "./motion-state";
import { useUi } from "./store";

type Box = { top: number; height: number };

/**
 * Technology pin timeline (04-SPEC §ポーズ表).
 *
 * Loop 2 held item 01 for the whole explode ramp, so the first of five items
 * owned 49% of the section and the other four shared the rest. The five items
 * now take an equal fifth each and the explode runs underneath them: it starts
 * just after the pin does and is fully open by the time item 02 comes up.
 */
export const TECH_BAND = { start: 0.05, open: 0.28, close: 0.95 } as const;

/** five equal bands across the pin — no lead-in stolen from item 01 */
export const techIndexFrom = (pin: number) =>
  Math.min(4, Math.max(0, Math.floor(pin * 5)));

let lenis: Lenis | null = null;

/**
 * Scroll lock, reference counted.
 *
 * The mobile menu and the modal each used to own `overflow` and Lenis outright.
 * The menu carries its own Pre-order row, so the dialog could be opened on top
 * of it — and closing the dialog then handed the page back while the menu was
 * still covering the screen. `openDialog` now closes the menu, so the two no
 * longer overlap in practice, but ownership stays in one place with a count:
 * the page is released when the last holder lets go, not when any one of them
 * decides it is done.
 */
let locks = 0;

export function lockScroll() {
  locks += 1;
  if (locks > 1) return;
  document.documentElement.style.overflow = "hidden";
  lenis?.stop();
}

export function unlockScroll() {
  if (locks === 0) return;
  locks -= 1;
  if (locks > 0) return;
  document.documentElement.style.overflow = "";
  lenis?.start();
}

/** Smooth-scroll to an element; native jump when Lenis is disabled. */
export function scrollToTarget(target: string | HTMLElement) {
  const el =
    typeof target === "string"
      ? document.querySelector<HTMLElement>(target)
      : target;
  if (!el) return;
  if (lenis) {
    // force: the mobile menu stops Lenis while it is open, and the tap that
    // closes it also asks for the jump in the same frame
    lenis.scrollTo(el, { offset: -64, duration: 1.1, force: true });
  } else {
    window.scrollTo({
      top: Math.max(0, el.getBoundingClientRect().top + window.scrollY - 64),
      behavior: "auto",
    });
  }
}

/**
 * Single rAF loop: measures sections, fills motionState, drives Lenis, runs the
 * DOM tick subscribers and pushes band crossings into the store.
 */
export function useScrollEngine() {
  const setScroll = useUi((s) => s.setScroll);
  const setReduced = useUi((s) => s.setReduced);

  useEffect(() => {
    const boxes = {} as Record<SectionKey, Box>;
    let raf = 0;
    let start = 0;
    let disposed = false;

    const reduceQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const mobileQuery = window.matchMedia("(max-width: 767px)");

    const last = {
      scrolled: false,
      active: "hero" as SectionKey,
      techIndex: 0,
    };

    const measure = () => {
      motionState.vw = window.innerWidth;
      motionState.vh = window.innerHeight;
      motionState.mobile = mobileQuery.matches;
      for (const key of SECTION_KEYS) {
        const el = document.querySelector<HTMLElement>(
          `[data-section="${key}"]`,
        );
        if (!el) continue;
        boxes[key] = {
          top: el.getBoundingClientRect().top + window.scrollY,
          height: el.offsetHeight,
        };
      }
    };

    const applyReduced = () => {
      const reduced = reduceQuery.matches;
      motionState.reduced = reduced;
      setReduced(reduced);
      if (reduced) {
        lenis?.destroy();
        lenis = null;
      } else if (!lenis && !disposed) {
        lenis = new Lenis({
          lerp: 0.1,
          smoothWheel: true,
          syncTouch: false,
          autoRaf: false,
        });
        // a fresh instance must inherit whatever an open overlay is holding
        if (locks > 0) lenis.stop();
      }
    };

    const onPointer = (e: PointerEvent) => {
      motionState.pointerX = (e.clientX / window.innerWidth) * 2 - 1;
      motionState.pointerY = (e.clientY / window.innerHeight) * 2 - 1;
    };

    const frame = (t: number) => {
      raf = requestAnimationFrame(frame);
      if (!start) start = t;
      // frozen clock: every sin(time·k) driver settles on its phase-0 value, so
      // two captures of the same scroll position are comparable
      motionState.time = motionState.freeze ? 0 : (t - start) / 1000;
      lenis?.raf(t);

      const y = window.scrollY;
      const vh = motionState.vh;
      motionState.y = y;

      let active: SectionKey = last.active;
      const centre = y + vh / 2;

      for (const key of SECTION_KEYS) {
        const box = boxes[key];
        if (!box) continue;
        motionState.progress[key] = clamp01(
          (y - box.top + vh) / (box.height + vh),
        );
        motionState.pinPx[key] = y - box.top;
        motionState.pin[key] =
          box.height > vh + 1
            ? clamp01((y - box.top) / (box.height - vh))
            : motionState.progress[key];
        if (centre >= box.top && centre < box.top + box.height) active = key;
      }
      motionState.active = active;

      const techIndex = techIndexFrom(motionState.pin.technology);
      motionState.techIndex = techIndex;

      const scrolled = y > 40;
      if (
        scrolled !== last.scrolled ||
        active !== last.active ||
        techIndex !== last.techIndex
      ) {
        last.scrolled = scrolled;
        last.active = active;
        last.techIndex = techIndex;
        setScroll({ scrolled, active, techIndex });
      }

      runTicks();
    };

    applyReduced();
    measure();
    raf = requestAnimationFrame(frame);

    const onResize = () => measure();
    // sections grow when fonts land / images decode
    const ro = new ResizeObserver(onResize);
    ro.observe(document.body);
    window.addEventListener("resize", onResize);
    window.addEventListener("pointermove", onPointer, { passive: true });
    reduceQuery.addEventListener("change", applyReduced);
    mobileQuery.addEventListener("change", onResize);
    const settle = window.setTimeout(measure, 600);

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      window.clearTimeout(settle);
      ro.disconnect();
      window.removeEventListener("resize", onResize);
      window.removeEventListener("pointermove", onPointer);
      reduceQuery.removeEventListener("change", applyReduced);
      mobileQuery.removeEventListener("change", onResize);
      lenis?.destroy();
      lenis = null;
    };
  }, [setScroll, setReduced]);
}
