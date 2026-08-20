import { expect, test } from "@playwright/test";
import { expectNoErrors, ready, scrollToSection, watchErrors } from "./helpers";

const FIRST_REPLY_START = "Three meetings. The first is your design review";
const SECOND_QUESTION = "Translate “Where is the station?”";

test("tapping a question shows the user line and types NOVA's reply", async ({
  page,
}) => {
  const errors = watchErrors(page);
  await page.goto("/");
  await ready(page);
  await scrollToSection(page, "experience");

  const chips = page.getByTestId("chat-chip");
  await expect(chips).toHaveCount(5);

  const transcript = page.getByTestId("chat-transcript");
  await expect(transcript).toHaveAttribute("aria-live", "polite");

  // idle: the panel tells you what to do instead of sitting empty (WS4-1)
  await expect(page.getByTestId("chat-status")).toHaveText("NOVA — LISTENING");
  await expect(page.getByTestId("chat-placeholder")).toContainText(
    "Try one of the five prompts below",
  );

  await chips.first().click();
  await expect(page.getByTestId("chat-user")).toHaveText(
    "What’s on my schedule today?",
  );
  // the placeholder is gone for good once a question has been asked
  await expect(page.getByTestId("chat-placeholder")).toHaveCount(0);
  await expect(page.getByTestId("chat-reply")).toContainText(FIRST_REPLY_START, {
    timeout: 6000,
  });
  // LISTENING → THINKING → SPEAKING → READY: the reply ends on READY
  await expect(page.getByTestId("chat-status")).toHaveText("NOVA — READY", {
    timeout: 8000,
  });

  // a second tap replaces the running answer instead of queueing it
  await chips.nth(1).click();
  await expect(page.getByTestId("chat-user")).toHaveText(SECOND_QUESTION);
  await expect(page.getByTestId("chat-reply")).toContainText("駅はどこですか", {
    timeout: 6000,
  });
  await expect(page.getByTestId("chat-user")).toHaveCount(1);
  await expect(page.getByTestId("chat-reply")).toHaveCount(1);

  expectNoErrors(errors);
});

test("the state row walks LISTENING → THINKING → SPEAKING → READY", async ({
  page,
}) => {
  const errors = watchErrors(page);
  await page.goto("/");
  await ready(page);
  await scrollToSection(page, "experience");

  const status = page.getByTestId("chat-status");
  await expect(status).toHaveText("NOVA — LISTENING");

  const seen = new Set<string>();
  await page.getByTestId("chat-chip").first().click();
  // sample the row while the answer runs; the order is enforced by the ends
  for (let i = 0; i < 60; i++) {
    seen.add((await status.textContent()) ?? "");
    if (seen.has("NOVA — READY")) break;
    await page.waitForTimeout(120);
  }

  expect([...seen]).toContain("NOVA — THINKING");
  expect([...seen]).toContain("NOVA — SPEAKING");
  expect([...seen]).toContain("NOVA — READY");

  expectNoErrors(errors);
});
