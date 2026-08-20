import { expect, test } from "@playwright/test";
import {
  expectNoErrors,
  ready,
  SECTIONS,
  scrollToSection,
  watchErrors,
} from "./helpers";

test("?nogl=1 drops the canvas and keeps the whole site usable", async ({
  page,
}) => {
  const errors = watchErrors(page);
  await page.goto("/?nogl=1");
  await ready(page);

  await expect(page.locator("canvas")).toHaveCount(0);
  await expect(page.locator("[data-canvas-fallback]")).toHaveCount(1);

  for (const key of SECTIONS) {
    await scrollToSection(page, key, 0.5);
    await expect(page.locator(`[data-section="${key}"]`)).toBeVisible();
  }

  // interactions still work without WebGL
  await scrollToSection(page, "experience");
  await page.getByTestId("chat-chip").first().click();
  await expect(page.getByTestId("chat-reply")).toContainText("Three meetings.", {
    timeout: 6000,
  });

  expectNoErrors(errors);
});
