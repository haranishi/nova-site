import { expect, test } from "@playwright/test";
import {
  expectNoErrors,
  horizontalOverflow,
  ready,
  SECTIONS,
  scrollToSection,
  watchErrors,
} from "./helpers";

const WIDTHS = [
  { w: 390, h: 844 },
  { w: 768, h: 1024 },
  { w: 1440, h: 900 },
];

/** 03-DESIGN-SPEC §A11y: every interactive element is ≥44×44 (WS2-4) */
const MIN_TAP = 44;

type Target = { label: string; w: number; h: number };

/** Every control that is actually on screen right now, with its hit box. */
function visibleControls(page: import("@playwright/test").Page) {
  return page.evaluate(() => {
    const out: Target[] = [];
    const nodes = document.querySelectorAll<HTMLElement>("a[href], button");
    for (const el of Array.from(nodes)) {
      if (!el.getClientRects().length) continue;
      const cs = getComputedStyle(el);
      // visibility inherits, so a closed overlay's links drop out here
      if (cs.visibility === "hidden" || cs.pointerEvents === "none") continue;
      const r = el.getBoundingClientRect();
      const label =
        el.getAttribute("data-testid") ??
        el.getAttribute("aria-label") ??
        (el.textContent ?? "").trim().slice(0, 40) ??
        el.tagName;
      out.push({ label, w: Math.round(r.width), h: Math.round(r.height) });
    }
    return out;
  });
}

test("no horizontal scrolling at any width or scroll position", async ({
  page,
  isMobile,
}) => {
  test.skip(!!isMobile, "this spec drives its own viewports");
  const errors = watchErrors(page);

  for (const size of WIDTHS) {
    await page.setViewportSize({ width: size.w, height: size.h });
    await page.goto("/");
    await ready(page);

    for (const key of SECTIONS) {
      await scrollToSection(page, key, 0.5);
      const { scrollWidth, clientWidth } = await horizontalOverflow(page);
      expect(
        scrollWidth,
        `${size.w}px viewport overflows horizontally at ${key}`,
      ).toBeLessThanOrEqual(clientWidth + 1);
    }
  }

  expectNoErrors(errors);
});

test("every visible control clears 44px on a phone", async ({
  page,
  isMobile,
}) => {
  test.skip(!isMobile, "tap targets are checked on the mobile project");
  const errors = watchErrors(page);
  await page.goto("/");
  await ready(page);

  const assertAll = async (state: string) => {
    const controls = await visibleControls(page);
    expect(controls.length, `${state}: nothing to measure`).toBeGreaterThan(0);
    for (const c of controls) {
      expect(
        Math.min(c.w, c.h),
        `${state}: "${c.label}" is ${c.w}×${c.h}, under ${MIN_TAP}px`,
      ).toBeGreaterThanOrEqual(MIN_TAP);
    }
  };

  // named controls first, so a failure points at the element and not the sweep
  const named = [
    page.getByTestId("nav-preorder-mobile"),
    page.getByTestId("nav-burger"),
  ];
  await scrollToSection(page, "experience");
  named.push(page.getByTestId("chat-chip").first());
  await scrollToSection(page, "everyday");
  named.push(page.getByTestId("scene-tab").first());
  await scrollToSection(page, "cta", 0.4);
  named.push(page.getByTestId("cta-preorder"));
  for (const target of named) {
    const box = await target.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.height).toBeGreaterThanOrEqual(MIN_TAP);
    expect(box!.width).toBeGreaterThanOrEqual(MIN_TAP);
  }

  // then a sweep of the three states that expose different controls
  await scrollToSection(page, "footer");
  await assertAll("footer");

  await page.getByTestId("cta-preorder").click();
  await expect(page.getByTestId("preorder-dialog")).toBeVisible();
  // the panel scales 0.96→1 on open: measure the settled box, not a keyframe
  await page.waitForTimeout(500);
  await assertAll("dialog open");
  await page.keyboard.press("Escape");
  await expect(page.getByTestId("preorder-dialog")).toBeHidden();

  await page.getByTestId("nav-burger").click();
  await expect(page.getByTestId("nav-overlay")).toBeVisible();
  await page.waitForTimeout(700);
  await assertAll("menu open");
  await page.keyboard.press("Escape");

  expectNoErrors(errors);
});
