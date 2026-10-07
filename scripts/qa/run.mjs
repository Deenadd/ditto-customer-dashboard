#!/usr/bin/env node
/*
 * Runs every flow check against a running site and prints a pass/fail table.
 *
 *   npm run qa                       # against http://localhost:3123
 *   npm run qa -- https://ditto-customer-dashboard.vercel.app
 *
 * Each script in flows/ drives the site in Chrome (playwright-core, channel
 * "chrome") and prints what it saw; a check passes when it exits cleanly and
 * reports "errors: none". Screenshots land in scripts/qa/.out/ (gitignored).
 * The weekly UX audit (docs/ux-audit/rubric.md) starts and ends with this.
 */
import { spawnSync } from "node:child_process";
import { mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const base = process.argv[2] ?? "http://localhost:3123";
const out = join(here, ".out");
const fixtures = join(here, "fixtures");
for (const dir of ["", "out-m", "out-m/flow", "out-fc", "out-otp", "out-mob", "out-bc"]) mkdirSync(join(out, dir), { recursive: true });

/* [name, what it covers, args after the base URL] */
const checks = [
  ["audit", "Phone audit: overflow, tap targets, inputs, hover", []],
  ["otp", "Sign in, wrong code, right code, dashboard", []],
  ["mob", "Phone: welcome sheet, segmented tabs, sheets, flip card, gutters", []],
  ["fc", "Cards, WhatsApp help, hospitals, delete, v1 flow (desktop)", ["desktop"]],
  ["fc", "Same, on a phone", ["mobile"]],
  ["claimflow2", "Cashless claim end to end, ticket, delete (desktop)", ["out-m/flow"]],
  ["claimflow2", "Cashless claim end to end (phone)", ["out-m/flow", "mobile"]],
  ["reimb", "Reimbursement flow, Buddy, quick actions", ["out-m/flow", fixtures, "desktop"]],
  ["bs", "Bottom sheets: drag, scrim, Escape, scroll lock", ["out-m/flow"]],
  ["policyq", "Claim chat skips the policy question inside a policy", []],
  ["cta", "Hospital check: Continue under the card", []],
  ["paper", "Claim ticket prints, copy reference", []],
  ["renewal", "Home card v2: renewal stages, Renew, card link", []],
  ["homeflip", "Home cards turn over on a phone; View policy; desktop link", []],
  ["hap", "Haptics on taps, Android and iOS paths", []],
];

const rows = [];
for (const [name, covers, args] of checks) {
  const run = spawnSync("node", [join(here, "flows", `${name}.mjs`), base, ...args], {
    cwd: out,
    encoding: "utf8",
    timeout: 300_000,
  });
  const text = `${run.stdout ?? ""}${run.stderr ?? ""}`;
  const pass = run.status === 0 && /errors: none/.test(text);
  rows.push({ name, covers, pass, text });
  process.stdout.write(`${pass ? "PASS" : "FAIL"}  ${name.padEnd(11)} ${covers}\n`);
}

const failed = rows.filter((row) => !row.pass);
console.log(`\n${rows.length - failed.length}/${rows.length} flow checks pass against ${base}`);
for (const row of failed) console.log(`\n--- ${row.name}: ${row.covers}\n${row.text.trim().split("\n").slice(-15).join("\n")}`);
process.exit(failed.length ? 1 : 0);
