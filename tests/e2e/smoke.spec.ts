import { expect, test } from "@playwright/test";
import {
  expectNoErrors,
  opacityOf,
  ready,
  scrollToSection,
  TITLE,
  watchErrors,
} from "./helpers";

test("page loads and all nine sections come into view", async ({ page }) => {
  const errors = watchErrors(page);

  const response = await page.goto("/");
  expect(response?.status()).toBe(200);
  await ready(page);

  await expect(page).toHaveTitle(TITLE);
  await expect(page.locator("h1")).toHaveCount(1);
  await expect(page.locator("h1")).toHaveText("NOVA");

  // 1 Nav
  await expect(page.locator("[data-nav]")).toBeVisible();
  // 2 Hero — wordmark, tagline and the one-line definition (05 改訂2)
  await expect(page.getByText("Your intelligence.").first()).toBeVisible();
  await expect(page.getByText("INTRODUCING NOVA")).toBeVisible();
  // 05 改訂3: the definition says what it is, the button says what it costs
  await expect(page.getByTestId("hero-definition")).toHaveText(
    "A palm-sized AI companion. No screen — just your voice.",
  );
  await expect(page.getByTestId("hero-preorder")).toHaveText("Pre-order · $299");
  await expect(page.getByTestId("hero-specs")).toHaveText("See the specs");

  // 3 Product Reveal — bands only exist mid-pin, check each at its centre
  for (const [i, pct] of [1 / 6, 1 / 2, 5 / 6].entries()) {
    await scrollToSection(page, "reveal", pct);
    expect(await opacityOf(page, `[data-testid="reveal-band-${i}"]`)).toBeGreaterThan(
      0.9,
    );
  }
  await expect(page.getByRole("heading", { name: "Ask anything." })).toBeVisible();

  // 4 AI Experience
  await scrollToSection(page, "experience");
  await expect(page.getByRole("heading", { name: "Talk to NOVA." })).toBeVisible();
  await expect(page.getByTestId("chat-chip")).toHaveCount(5);

  // 5 Technology
  await scrollToSection(page, "technology", 0.5);
  await expect(
    page.getByRole("heading", { name: "Beneath the surface." }),
  ).toBeVisible();

  // 6 Everyday
  await scrollToSection(page, "everyday");
  await expect(
    page.getByRole("heading", { name: "From sunrise to silence." }),
  ).toBeVisible();

  // 7 Specs
  await scrollToSection(page, "specs");
  await expect(
    page.getByRole("heading", { name: "Precision, specified." }),
  ).toBeVisible();
  await expect(
    page.getByText("All figures are design targets for a fictional product."),
  ).toBeVisible();

  // 8 CTA
  await scrollToSection(page, "cta", 0.4);
  await expect(page.getByRole("heading", { name: "Meet NOVA." })).toBeVisible();
  await expect(page.getByText("$299", { exact: true })).toBeVisible();

  // 9 Footer
  await scrollToSection(page, "footer");
  await expect(
    page.getByText("© 2026 NOVA. A design study — not a real product."),
  ).toBeVisible();

  expectNoErrors(errors);
});
