import { existsSync } from "node:fs";

/* Chrome when it's installed, else Playwright's own Chromium
   (npx playwright-core install chromium). QA_BROWSER overrides. */
export const channel =
  process.env.QA_BROWSER ?? (existsSync("/Applications/Google Chrome.app") ? "chrome" : "chromium");
