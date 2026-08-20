import { expect, test } from "@playwright/test";
import { expectNoErrors, ready, scrollToSection, watchErrors } from "./helpers";

test("scene tabs switch the quote and move aria-selected", async ({ page }) => {
  const errors = watchErrors(page);
  await page.goto("/");
  await ready(page);
  await scrollToSection(page, "everyday");

  const tabs = page.getByTestId("scene-tab");
  await expect(tabs).toHaveCount(4);

  // a manual pick takes over from the 5s autoplay
  await tabs.first().click();
  await expect(tabs.first()).toHaveAttribute("aria-selected", "true");
  const morning = await page.getByTestId("scene-quote").textContent();
  expect(morning).toContain("Good morning.");

  const travel = tabs.nth(2);
  await expect(travel).toHaveText(/Travel/);
  await travel.click();

  await expect(travel).toHaveAttribute("aria-selected", "true");
  await expect(tabs.first()).toHaveAttribute("aria-selected", "false");
  await expect(page.getByTestId("scene-quote")).toContainText(
    "Gate changed to B12.",
  );
  await expect(page.getByTestId("scene-context")).toHaveText(
    "18:03 — TERMINAL B",
  );
  expect(await page.getByTestId("scene-quote").textContent()).not.toBe(morning);

  expectNoErrors(errors);
});
