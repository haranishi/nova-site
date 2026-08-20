import { expect, type Page } from "@playwright/test";

export const CANONICAL = "https://nova.example.com/";
export const TITLE = "NOVA — Your intelligence. Everywhere.";
export const SHARE_TEXT =
  "NOVA — a palm-sized AI companion. Your intelligence. Everywhere.";

export const SECTIONS = [
  "hero",
  "reveal",
  "experience",
  "technology",
  "everyday",
  "specs",
  "cta",
  "footer",
] as const;

/** Collect console errors + uncaught exceptions for the whole test. */
export function watchErrors(page: Page) {
  const errors: string[] = [];
  page.on("console", (msg) => {
    if (msg.type() === "error") errors.push(`console: ${msg.text()}`);
  });
  page.on("pageerror", (err) => errors.push(`pageerror: ${err.message}`));
  return errors;
}

export function expectNoErrors(errors: string[]) {
  expect(errors, `collected browser errors:\n${errors.join("\n")}`).toEqual([]);
}

type Probe = "height" | "scroll";

/** Wait until a probe reads the same value on `frames` consecutive rAFs. */
async function settle(page: Page, probe: Probe, frames = 6) {
  await page.waitForFunction(
    ({ probe, frames }) => {
      const w = window as Window & {
        __novaSettle?: Record<string, { v: number; n: number }>;
      };
      const now =
        probe === "height"
          ? document.documentElement.scrollHeight
          : Math.round(window.scrollY);
      const store = (w.__novaSettle ??= {});
      const seen = store[probe];
      store[probe] = { v: now, n: seen && seen.v === now ? seen.n + 1 : 0 };
      return store[probe].n >= frames;
    },
    { probe, frames },
    { timeout: 15_000 },
  );
}

/**
 * Wait for the site to be interactive.
 *
 * Loop 3 waited 1400ms on the wall clock, which is both too long on a fast
 * machine and too short on a loaded one — the classic flaky-test trade. The
 * three things a test actually depends on are asserted instead: the fonts have
 * landed, the 3D layer has settled one way or the other (frames on the canvas,
 * or the CSS fallback in its place), and the page height has stopped moving,
 * which is what the scroll engine measures its section boxes against.
 */
export async function ready(page: Page) {
  await page.waitForFunction(() => document.fonts.status === "loaded", null, {
    timeout: 15_000,
  });
  await page.waitForFunction(
    () => {
      // the shell decides between the two on mount, so "no canvas yet" and "no
      // canvas ever" are only distinguishable once one of them is on the page
      if (document.querySelector("[data-canvas-fallback]")) return true;
      const frames = (window as Window & { __novaFrames?: number })
        .__novaFrames;
      return !!document.querySelector("canvas") && (frames ?? 0) > 3;
    },
    null,
    { timeout: 15_000 },
  );
  await settle(page, "height");
}

/**
 * Scroll a section into view. `pct` walks the pinned travel of tall sections
 * and centres shorter ones.
 */
export async function scrollToSection(page: Page, key: string, pct = 0.5) {
  await page.evaluate(
    ({ key, pct }) => {
      const el = document.querySelector<HTMLElement>(
        `[data-section="${key}"]`,
      );
      if (!el) throw new Error(`missing section ${key}`);
      const top = el.getBoundingClientRect().top + window.scrollY;
      const vh = window.innerHeight;
      const h = el.offsetHeight;
      const y = h > vh + 1 ? top + (h - vh) * pct : top - (vh - h) / 2;
      window.scrollTo(0, Math.max(0, Math.round(y)));
    },
    { key, pct },
  );
  // Lenis re-syncs to a programmatic jump over the next frame or two, and the
  // scroll engine only writes the bands once the position holds still — so the
  // wait is "the page stopped moving", not a guessed 800ms.
  await settle(page, "scroll");
}

/** Walk the whole page so every scroll-driven trigger fires at least once. */
export async function stageScroll(page: Page, steps = 12) {
  for (let i = 0; i <= steps; i++) {
    await page.evaluate((ratio) => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      window.scrollTo(0, Math.round(max * ratio));
    }, i / steps);
    await page.waitForTimeout(120);
  }
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(400);
}

export function opacityOf(page: Page, selector: string) {
  return page.evaluate((sel) => {
    const el = document.querySelector(sel);
    return el ? Number(getComputedStyle(el).opacity) : -1;
  }, selector);
}

export function horizontalOverflow(page: Page) {
  return page.evaluate(() => {
    const de = document.documentElement;
    return {
      scrollWidth: Math.max(de.scrollWidth, document.body.scrollWidth),
      clientWidth: de.clientWidth,
    };
  });
}
