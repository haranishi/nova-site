import { expect, test } from "@playwright/test";
import {
  CANONICAL,
  expectNoErrors,
  ready,
  scrollToSection,
  watchErrors,
} from "./helpers";

test("pre-order opens the concept dialog and returns focus on close", async ({
  page,
}) => {
  const errors = watchErrors(page);
  await page.goto("/");
  await ready(page);
  await scrollToSection(page, "cta", 0.4);

  const button = page.getByTestId("cta-preorder");
  await button.click();

  const dialog = page.getByTestId("preorder-dialog");
  await expect(dialog).toBeVisible();
  await expect(dialog).toHaveAttribute("role", "dialog");
  await expect(dialog).toHaveAttribute("aria-modal", "true");
  await expect(
    dialog.getByRole("heading", { name: "A concept, for now." }),
  ).toBeVisible();
  await expect(dialog).toContainText("NOVA is a fictional product");

  // focus moved inside
  await expect(page.getByTestId("dialog-close")).toBeFocused();

  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
  await expect(button).toBeFocused();

  // and again via the Close button
  await button.click();
  await expect(dialog).toBeVisible();
  await page.getByTestId("dialog-close").click();
  await expect(dialog).toBeHidden();
  await expect(button).toBeFocused();

  // and via the corner × (WS5-4)
  await button.click();
  await expect(dialog).toBeVisible();
  await page.getByTestId("dialog-x").click();
  await expect(dialog).toBeHidden();
  await expect(button).toBeFocused();

  expectNoErrors(errors);
});

test("the fold carries the action: hero pre-order opens the same dialog", async ({
  page,
}) => {
  const errors = watchErrors(page);
  await page.goto("/");
  await ready(page);

  const hero = page.getByTestId("hero-preorder");
  await expect(hero).toBeVisible();
  await hero.click();

  const dialog = page.getByTestId("preorder-dialog");
  await expect(dialog).toBeVisible();
  /*
   * 05 改訂4: the forward door is the primary and wears the white pill; the link
   * is the ghost beside it. Asserting the fill, not just the labels — loop 3
   * shipped these two strings in the opposite roles and the copy check passed.
   */
  const fill = (testId: string) =>
    page
      .getByTestId(testId)
      .evaluate((el) => getComputedStyle(el).backgroundColor);
  await expect(page.getByTestId("dialog-forward")).toHaveText(
    "Explore the technology",
  );
  expect(await fill("dialog-forward")).toBe("rgb(255, 255, 255)");
  await expect(page.getByTestId("dialog-copy")).toHaveText("Copy link");
  expect(await fill("dialog-copy")).not.toBe("rgb(255, 255, 255)");
  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
  await expect(hero).toBeFocused();

  // and the ghost next to it goes to the specs
  await page.getByTestId("hero-specs").click();
  await expect
    .poll(
      async () =>
        page.evaluate(() => {
          const el = document.querySelector("#specs");
          if (!el) return false;
          const r = el.getBoundingClientRect();
          return r.top < window.innerHeight && r.bottom > 0;
        }),
      { timeout: 3000 },
    )
    .toBe(true);

  expectNoErrors(errors);
});

test("the dialog can hand over the link", async ({
  page,
  context,
  baseURL,
}) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"], {
    origin: baseURL,
  });
  const errors = watchErrors(page);
  await page.goto("/");
  await ready(page);
  await scrollToSection(page, "cta", 0.4);

  await page.getByTestId("cta-preorder").click();
  const copy = page.getByTestId("dialog-copy");
  await expect(copy).toHaveText("Copy link");
  await copy.click();
  await expect(copy).toHaveText("Copied");
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(
    CANONICAL,
  );

  expectNoErrors(errors);
});

test("the dialog's forward door closes it and lands on Technology", async ({
  page,
}) => {
  const errors = watchErrors(page);
  await page.goto("/");
  await ready(page);
  await scrollToSection(page, "cta", 0.4);

  await page.getByTestId("cta-preorder").click();
  const dialog = page.getByTestId("preorder-dialog");
  await expect(dialog).toBeVisible();

  await page.getByTestId("dialog-forward").click();
  await expect(dialog).toBeHidden();
  await expect
    .poll(
      async () =>
        page.evaluate(() => {
          const el = document.querySelector("#technology");
          if (!el) return false;
          const r = el.getBoundingClientRect();
          return r.top < window.innerHeight && r.bottom > 0;
        }),
      { timeout: 3000 },
    )
    .toBe(true);
  // the page has to be free to move again once the modal is gone
  expect(
    await page.evaluate(
      () => getComputedStyle(document.documentElement).overflow,
    ),
  ).not.toBe("hidden");

  expectNoErrors(errors);
});

test("the CTA offers a way on for people who are not buying", async ({
  page,
}) => {
  const errors = watchErrors(page);
  await page.goto("/");
  await ready(page);
  await scrollToSection(page, "cta", 0.4);

  const ghost = page.getByTestId("cta-technology");
  await expect(ghost).toHaveText("See the technology");
  await ghost.click();
  await expect
    .poll(
      async () =>
        page.evaluate(() => {
          const el = document.querySelector("#technology");
          if (!el) return false;
          const r = el.getBoundingClientRect();
          return r.top < window.innerHeight && r.bottom > 0;
        }),
      { timeout: 3000 },
    )
    .toBe(true);

  expectNoErrors(errors);
});
