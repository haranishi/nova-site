import { expect, test } from "@playwright/test";
import { expectNoErrors, ready, watchErrors } from "./helpers";

test("every button has a name, focus is visible, the canvas is hidden from AT", async ({
  page,
}) => {
  const errors = watchErrors(page);
  await page.goto("/");
  await ready(page);

  // 1. accessible names
  const unnamed = await page.evaluate(() =>
    Array.from(document.querySelectorAll("button"))
      .filter((b) => {
        const label = (
          b.getAttribute("aria-label") ??
          b.textContent ??
          ""
        ).trim();
        return label.length === 0;
      })
      .map((b) => b.outerHTML.slice(0, 120)),
  );
  expect(unnamed, `buttons without an accessible name:\n${unnamed.join("\n")}`)
    .toEqual([]);

  // 2. keyboard focus reaches Pre-order and paints a visible ring
  let focused = "";
  for (let i = 0; i < 14; i++) {
    await page.keyboard.press("Tab");
    focused = await page.evaluate(
      () => document.activeElement?.getAttribute("data-testid") ?? "",
    );
    if (focused.startsWith("nav-preorder")) break;
  }
  expect(focused).toContain("nav-preorder");

  const ring = await page.evaluate(() => {
    const el = document.activeElement as HTMLElement;
    const cs = getComputedStyle(el);
    return { style: cs.outlineStyle, width: parseFloat(cs.outlineWidth) };
  });
  expect(ring.style).not.toBe("none");
  expect(ring.width).toBeGreaterThanOrEqual(2);

  // 3. skip link is the first stop and points at the content
  const skip = page.getByRole("link", { name: "Skip to content" });
  await expect(skip).toHaveAttribute("href", "#main");
  await expect(page.locator("#main")).toHaveCount(1);

  // 4. the WebGL layer is inert for assistive tech
  const canvasHidden = await page.evaluate(() => {
    const canvas = document.querySelector("canvas");
    if (!canvas) return "no-canvas";
    return canvas.closest('[aria-hidden="true"]') ? "hidden" : "exposed";
  });
  expect(canvasHidden).toBe("hidden");
  expect(
    await page.evaluate(() => {
      const layer = document.querySelector("[data-canvas-layer]");
      return layer ? getComputedStyle(layer).pointerEvents : "none";
    }),
  ).toBe("none");

  // 5. heading order: the first heading on the page is the one h1, and no
  //    level is skipped on the way down (arrayContaining only ever proved an
  //    h1 existed somewhere, which the count below already says)
  const levels = await page.evaluate(() =>
    Array.from(document.querySelectorAll("h1,h2,h3,h4,h5,h6")).map((h) =>
      Number(h.tagName.slice(1)),
    ),
  );
  expect(levels.length).toBeGreaterThan(1);
  expect(levels[0]).toBe(1);
  for (let i = 1; i < levels.length; i++) {
    expect(
      levels[i] - levels[i - 1],
      `heading ${i} jumps from h${levels[i - 1]} to h${levels[i]}`,
    ).toBeLessThanOrEqual(1);
  }
  await expect(page.locator("h1")).toHaveCount(1);

  expectNoErrors(errors);
});
