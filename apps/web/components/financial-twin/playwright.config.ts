import { tmpdir } from "node:os";
import { join } from "node:path";
import { defineConfig } from "@playwright/test";

/** Isolated ownership: exercises the real app without editing shared test config. */
export default defineConfig({
  testDir: ".",
  testMatch: "journey.e2e.ts",
  outputDir: join(tmpdir(), "gullak-financial-twin-results"),
  use: { baseURL: "http://localhost:4312", headless: true },
  workers: 1,
  reporter: "list",
  timeout: 60000,
  webServer: {
    command: "pnpm --filter @gullak/web start --port 4312",
    url: "http://localhost:4312",
    reuseExistingServer: !process.env.CI,
  },
});
