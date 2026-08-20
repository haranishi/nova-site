import { expect, test } from "@playwright/test";
import {
  CANONICAL,
  expectNoErrors,
  ready,
  TITLE,
  watchErrors,
} from "./helpers";

const content = (name: string) =>
  `meta[property="${name}"], meta[name="${name}"]`;

test("metadata, OGP, canonical, favicon and viewport are in place", async ({
  page,
}) => {
  const errors = watchErrors(page);
  await page.goto("/");
  // the head is server-rendered, but expectNoErrors below is a claim about the
  // whole page: without waiting for the client to come up it only ever proved
  // that nothing threw before hydration
  await ready(page);

  const description =
    "NOVA is a palm-sized personal AI device. Ask, remember, control — no screens needed. A concept study built with Next.js and React Three Fiber.";

  await expect(page.locator('meta[name="description"]')).toHaveAttribute(
    "content",
    description,
  );
  await expect(page.locator(content("og:title")).first()).toHaveAttribute(
    "content",
    TITLE,
  );
  await expect(page.locator(content("og:description")).first()).toHaveAttribute(
    "content",
    description,
  );
  const ogImage = await page
    .locator(content("og:image"))
    .first()
    .getAttribute("content");
  expect(ogImage).toContain("/og.png");
  await expect(page.locator(content("og:url")).first()).toHaveAttribute(
    "content",
    CANONICAL,
  );
  await expect(page.locator(content("twitter:card")).first()).toHaveAttribute(
    "content",
    "summary_large_image",
  );

  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    "href",
    CANONICAL,
  );

  const icon = page.locator('link[rel="icon"]').first();
  await expect(icon).toHaveCount(1);
  expect(await icon.getAttribute("href")).toContain("icon.svg");

  const viewport = await page
    .locator('meta[name="viewport"]')
    .getAttribute("content");
  expect(viewport).toContain("width=device-width");
  expect(viewport).toContain("initial-scale=1");

  expectNoErrors(errors);
});
