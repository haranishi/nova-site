import { expect, test } from "@playwright/test";
import {
  expectNoErrors,
  opacityOf,
  ready,
  scrollToSection,
  watchErrors,
} from "./helpers";

/** five items, one equal fifth of the pin each (WS-C3) */
const bandCentre = (i: number) => (i + 0.5) / 5;

test("technology pin walks through all five items", async ({
  page,
  isMobile,
}) => {
  const errors = watchErrors(page);
  await page.goto("/");
  await ready(page);

  /*
   * Below md the desktop list is display:none and the section shows a single
   * swapped item instead. The old selector matched the hidden list on both
   * projects, so the mobile run was asserting against markup no phone renders.
   */
  const active = isMobile
    ? page.locator("[data-tech-item-mobile]")
    : page.locator('[data-tech-item][data-active="true"]');

  for (let i = 0; i < 5; i++) {
    await scrollToSection(page, "technology", bandCentre(i));
    await expect(active).toHaveCount(1);
    await expect(active).toHaveAttribute("data-index", String(i));
    await expect(active).toBeVisible();
  }

  expectNoErrors(errors);
});

test("reveal bands fade in one after another", async ({ page }) => {
  const errors = watchErrors(page);
  await page.goto("/");
  await ready(page);

  const centres = [1 / 6, 1 / 2, 5 / 6];
  for (let i = 0; i < centres.length; i++) {
    await scrollToSection(page, "reveal", centres[i]);
    const here = await opacityOf(page, `[data-testid="reveal-band-${i}"]`);
    expect(here).toBeGreaterThan(0.9);
    for (let j = 0; j < centres.length; j++) {
      if (j === i) continue;
      const other = await opacityOf(page, `[data-testid="reveal-band-${j}"]`);
      expect(other).toBeLessThan(0.6);
    }
  }

  expectNoErrors(errors);
});
