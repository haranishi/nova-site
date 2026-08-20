import { expect, test } from "@playwright/test";
import { expectNoErrors, ready, watchErrors } from "./helpers";

test("nav shows every link and jumps to the anchored section", async ({
  page,
  isMobile,
}) => {
  const errors = watchErrors(page);
  await page.goto("/");
  await ready(page);

  const header = page.locator("[data-nav]");
  await expect(header).toBeVisible();
  await expect(header.getByText("NOVA").first()).toBeVisible();

  if (isMobile) {
    await expect(page.getByTestId("nav-preorder-mobile")).toBeVisible();
    await expect(page.getByTestId("nav-burger")).toBeVisible();
  } else {
    for (const label of ["Product", "Technology", "Experience", "Specs"]) {
      await expect(header.getByRole("link", { name: label })).toBeVisible();
    }
    await expect(page.getByTestId("nav-preorder")).toBeVisible();
  }

  // anchor jump: Technology has to reach the viewport within 2.5s
  if (isMobile) {
    await page.getByTestId("nav-burger").click();
    await expect(page.getByTestId("nav-overlay")).toBeVisible();
    await page
      .getByTestId("nav-overlay")
      .getByRole("link", { name: "Technology" })
      .click();
  } else {
    await header.getByRole("link", { name: "Technology" }).click();
  }

  await expect
    .poll(
      async () =>
        page.evaluate(() => {
          const el = document.querySelector("#technology");
          if (!el) return false;
          const r = el.getBoundingClientRect();
          return r.top < window.innerHeight && r.bottom > 0;
        }),
      { timeout: 2500 },
    )
    .toBe(true);

  await expect(header).toHaveAttribute("data-scrolled", "true");

  expectNoErrors(errors);
});

test("mobile menu opens, closes on Escape and locks the page", async ({
  page,
  isMobile,
}) => {
  test.skip(!isMobile, "mobile menu only exists below md");
  const errors = watchErrors(page);
  await page.goto("/");
  await ready(page);

  const burger = page.getByTestId("nav-burger");
  const overlay = page.getByTestId("nav-overlay");

  await expect(overlay).toBeHidden();
  await burger.click();
  await expect(overlay).toBeVisible();
  await expect(burger).toHaveAttribute("aria-expanded", "true");
  await expect(
    overlay.getByRole("link", { name: "Product" }),
  ).toBeVisible();

  // the menu carries the offer + action, and stays the only primary button
  await expect(page.getByTestId("nav-menu-offer")).toHaveText(
    "$299 · Ships early 2027",
  );
  await expect(page.getByTestId("nav-menu-preorder")).toBeVisible();
  await expect(page.getByTestId("nav-preorder-mobile")).toBeHidden();
  expect(
    await page.evaluate(
      () => getComputedStyle(document.documentElement).overflow,
    ),
  ).toBe("hidden");

  await page.keyboard.press("Escape");
  await expect(overlay).toBeHidden();
  await expect(burger).toHaveAttribute("aria-expanded", "false");
  await expect(burger).toBeFocused();

  expectNoErrors(errors);
});
