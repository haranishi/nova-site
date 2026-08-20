import { defineConfig, devices } from "@playwright/test";

const PORT = 3000;
const BASE = `http://127.0.0.1:${PORT}`;

/**
 * Run order is build → test (06-TEST-PLAN): the webServer starts `next start`,
 * so a production build must exist. Workers are capped because every page runs
 * a WebGL2 context through SwiftShader in headless chromium.
 */
export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: false,
  workers: 2,
  timeout: 90_000,
  expect: { timeout: 10_000 },
  reporter: [["list"]],
  use: {
    baseURL: BASE,
    trace: "off",
    video: "off",
    screenshot: "off",
  },
  projects: [
    {
      name: "desktop",
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 1440, height: 900 },
        deviceScaleFactor: 1,
      },
    },
    {
      name: "mobile",
      use: {
        ...devices["Pixel 5"],
        viewport: { width: 390, height: 844 },
        deviceScaleFactor: 1,
        hasTouch: true,
        isMobile: true,
      },
    },
  ],
  webServer: {
    command: "npm run start",
    url: BASE,
    // locally, reuse whatever is already on :3000 — but never on CI, where a
    // stale server would let a run pass against a build nobody just made
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
