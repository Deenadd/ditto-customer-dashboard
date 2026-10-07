import { chromium } from "playwright-core";
/* Lost: an unknown address and an unknown policy get the branded page with
   a way home, on a computer and at 320px; a crash gets the error boundary
   (checked when the build has the /qa-crash page, which only local runs add). */
const base = process.argv[2] ?? "http://localhost:3123";
const b = await chromium.launch({ channel: "chrome" });
const errors = [];
const fail = (msg) => errors.push(msg);
for (const [tag, viewport, mobile] of [["d", { width: 1280, height: 860 }, false], ["m", { width: 320, height: 640 }, true]]) {
  const p = await (await b.newContext({ viewport, deviceScaleFactor: 2, hasTouch: mobile, isMobile: mobile })).newPage();
  p.on("pageerror", (e) => errors.push(e.message));
  for (const path of ["/no-such-page", "/dashboard/policies/NOT-A-POLICY"]) {
    const res = await p.goto(base + path); await p.waitForTimeout(600);
    const h1 = await p.locator("h1").innerText();
    const home = p.getByRole("link", { name: "Go to your policies" });
    const over = await p.evaluate(() => document.documentElement.scrollWidth - innerWidth);
    console.log(tag, path, "→", res.status(), `"${await p.title()}"`, "|", h1, "| home:", await home.getAttribute("href"), "| overflow:", over);
    if (res.status() !== 404) fail(`${path} answered ${res.status()}`);
    if (h1 !== "This page isn't here") fail(`${path} heading: ${h1}`);
    if (over > 0) fail(`${path} overflows by ${over}px`);
  }
  await p.screenshot({ path: `out-bc/lost-${tag}.png` });
  await p.getByRole("link", { name: "Go to your policies" }).click(); await p.waitForURL(/\/dashboard$/);
  console.log(tag, "way home lands on:", new URL(p.url()).pathname);
  const crash = await p.goto(base + "/qa-crash");
  if (crash.status() === 404) console.log(tag, "crash page: not in this build, skipped");
  else {
    await p.waitForTimeout(900);
    const h1 = await p.locator("h1").innerText();
    console.log(tag, "crash →", h1, "| try again:", await p.getByRole("button", { name: "Try again" }).count());
    if (h1 !== "This page didn't load") fail(`crash heading: ${h1}`);
    await p.screenshot({ path: `out-bc/crash-${tag}.png` });
    errors.splice(0, errors.length, ...errors.filter((e) => !/QA crash/.test(e)));
  }
}
console.log("errors:", errors.length ? errors : "none");
await b.close();
