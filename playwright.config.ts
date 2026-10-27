import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "./tests",
  webServer: {
    command: "npx expo start --web --localhost --port 8081",
    url: "http://localhost:8081",
    reuseExistingServer: true,
    timeout: 120000,
  },
  workers: 2,
  timeout: 90000,
  expect: { timeout: 15000 },
  use: {
    baseURL: "http://localhost:8081",
    viewport: { width: 390, height: 908 },
    launchOptions: process.env.PLAYWRIGHT_EXECUTABLE_PATH
      ? { executablePath: process.env.PLAYWRIGHT_EXECUTABLE_PATH }
      : process.env.PLAYWRIGHT_CHROMIUM
        ? {}
        : { channel: "chrome" },
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  reporter: "list",
});
