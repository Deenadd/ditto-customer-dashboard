import { chromium } from "playwright-core";
/* Home cards on a phone: one card that turns over, View policy beside the
   flip, Renew taking its own tap; on a desktop the pair is a link as before. */
const base = process.argv[2] ?? "http://localhost:3123";
const b = await chromium.launch({ channel: "chrome" });
const errors = [];
const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, hasTouch: true, isMobile: true });
const p = await ctx.newPage();
p.on("pageerror", (e) => errors.push(e.message));
await p.goto(base + "/dashboard"); await p.waitForTimeout(1200);
const flips = p.getByRole("button", { name: /Show who/ });
console.log("flip buttons:", await flips.count(), "| view links:", await p.getByRole("link", { name: /^View / }).count());
const front = p.getByRole("article", { name: "Your Health complete", exact: true });
const box = await front.boundingBox();
await p.mouse.click(box.x + 40, box.y + box.height - 40); await p.waitForTimeout(800);
console.log("tap turns it:", await p.getByRole("button", { name: /Show the policy details/ }).first().getAttribute("aria-pressed"), "| url:", new URL(p.url()).pathname);
await p.screenshot({ path: "out-bc/homeflip-back.png" });
await p.getByRole("button", { name: /Show the policy details/ }).first().tap(); await p.waitForTimeout(800);
await p.screenshot({ path: "out-bc/homeflip-front.png" });
// v2: Renew doesn't turn the card
await p.getByRole("group", { name: "Home card" }).getByRole("button", { name: /v2/ }).click(); await p.waitForTimeout(400);
await p.evaluate(() => document.querySelectorAll("a[href^='https://ditto-renewal']").forEach((a) => a.addEventListener("click", (e) => { e.preventDefault(); window.__renew = (window.__renew ?? 0) + 1; })));
await p.getByRole("link", { name: "Renew Your Health complete" }).tap(); await p.waitForTimeout(800);
console.log("renew tapped:", await p.evaluate(() => window.__renew), "| still front:", await flips.first().getAttribute("aria-pressed"));
await p.getByRole("group", { name: "Home card" }).getByRole("button", { name: /v1/ }).click();
await p.getByRole("link", { name: "View Your Health complete" }).tap(); await p.waitForURL("**/policies/**");
console.log("view policy:", new URL(p.url()).pathname);
const over = await p.evaluate(() => document.documentElement.scrollWidth - innerWidth);
console.log("overflow:", over);
await ctx.close();
const d = await (await b.newContext({ viewport: { width: 1280, height: 900 } })).newPage();
d.on("pageerror", (e) => errors.push(e.message));
await d.goto(base + "/dashboard"); await d.waitForTimeout(1200);
console.log("desktop flip buttons visible:", await d.getByRole("button", { name: /Show who/ }).first().isVisible());
const fb = await d.getByRole("article", { name: "Your Health complete", exact: true }).boundingBox();
await d.mouse.click(fb.x + 40, fb.y + fb.height - 40); await d.waitForURL("**/policies/**");
console.log("desktop card opens:", new URL(d.url()).pathname);
console.log("errors:", errors.length ? errors : "none");
await b.close();
