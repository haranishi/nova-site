import { expect, test } from "@playwright/test";
import {
  CANONICAL,
  expectNoErrors,
  ready,
  scrollToSection,
  SHARE_TEXT,
  watchErrors,
} from "./helpers";

test("share row links out correctly and copies the canonical URL", async ({
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
  await scrollToSection(page, "footer");

  const expectedX = `https://x.com/intent/post?text=${encodeURIComponent(
    SHARE_TEXT,
  )}&url=${encodeURIComponent(CANONICAL)}`;
  const expectedLine = `https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(
    CANONICAL,
  )}`;

  await expect(page.getByTestId("share-x")).toHaveAttribute("href", expectedX);
  await expect(page.getByTestId("share-line")).toHaveAttribute(
    "href",
    expectedLine,
  );

  // navigator.share does not exist in chromium → button hidden, note visible
  expect(await page.evaluate(() => "share" in navigator)).toBe(false);
  await expect(page.getByTestId("share-native")).toHaveCount(0);
  await expect(page.getByTestId("share-note")).toBeVisible();
  // 05 改訂3: with no share sheet available the note must not point at one
  await expect(page.getByTestId("share-note")).toHaveText(
    "Instagram and YouTube don’t accept shared links from the web — copy the link instead.",
  );

  await page.getByTestId("share-copy").click();
  await expect(page.getByTestId("share-copied")).toHaveText("Copied");
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(
    CANONICAL,
  );

  expectNoErrors(errors);
});
