import { expect, test } from "@playwright/test";
import {
  expectNoErrors,
  horizontalOverflow,
  ready,
  SECTIONS,
  scrollToSection,
  watchErrors,
} from "./helpers";

test("reduced motion keeps everything readable and instant", async ({
  page,
}) => {
  const errors = watchErrors(page);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await ready(page);

  // the emulation itself has to be live, or the rest proves nothing
  expect(
    await page.evaluate(
      () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    ),
  ).toBe(true);

  // hero text is shown without waiting for an entrance animation
  await expect(page.locator("h1")).toBeVisible();
  await expect(page.getByText("Your intelligence.").first()).toBeVisible();

  for (const key of SECTIONS) {
    await scrollToSection(page, key, 0.5);
    await expect(page.locator(`[data-section="${key}"]`)).toBeVisible();
    const { scrollWidth, clientWidth } = await horizontalOverflow(page);
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 1);
  }

  // the typewriter is skipped: the full reply is there almost immediately
  await scrollToSection(page, "experience");
  const started = Date.now();
  await page.getByTestId("chat-chip").first().click();
  await expect(page.getByTestId("chat-reply")).toContainText(
    "I’ve kept your focus block clear until then.",
    { timeout: 1500 },
  );
  expect(Date.now() - started).toBeLessThan(1500);

  expectNoErrors(errors);
});
