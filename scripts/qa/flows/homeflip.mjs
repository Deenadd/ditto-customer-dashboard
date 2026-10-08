import { chromium } from "playwright-core";
import { channel } from "../browser.mjs";
/* Home cards on a phone: a tap opens the policy; only Show who's covered
   turns the card; Renew takes its own tap. On a desktop the pair is a link. */
const base = process.argv[2] ?? "http://localhost:3123";
const b = await chromium.launch({ channel });
const errors = [];
/* The prototype's switches live in the account menu (the avatar). */
/* A row's name starts with its label; its hint, if any, follows. */
const row = (p, item) => p.getByRole("menuitemradio", { name: new RegExp(`^${item.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`) });
const choose = async (p, item) => {
  await p.getByRole("button", { name: /^Account,/ }).click();
  await row(p, item).click();
  await p.waitForTimeout(400);
};
const checked = async (p, item) => {
  await p.getByRole("button", { name: /^Account,/ }).click();
  const value = await row(p, item).getAttribute("aria-checked");
  await p.keyboard.press("Escape");
  return value;
};
const ctx = await b.newContext({ viewport: { width: 375, height: 667 }, deviceScaleFactor: 2, hasTouch: true, isMobile: true });
const p = await ctx.newPage();
p.on("pageerror", (e) => errors.push(e.message));
await p.goto(base + "/dashboard"); await p.waitForTimeout(1200);
const flips = p.getByRole("button", { name: /Show who/ });
console.log("flip buttons:", await flips.count(), "| separate View policy links:", await p.getByRole("link", { name: /^View / }).count());
/* A tap on the card opens the policy; it doesn't turn it. */
const front = p.getByRole("article", { name: "Your Health complete", exact: true });
await front.evaluate((n) => n.scrollIntoView({ block: "center" })); await p.waitForTimeout(300);
let box = await front.boundingBox();
await p.mouse.click(box.x + 40, box.y + box.height - 40);
await p.waitForURL("**/policies/**", { timeout: 5000 }).catch(() => {});
console.log("card tap opens:", new URL(p.url()).pathname);
await p.goto(base + "/dashboard"); await p.waitForTimeout(1200);
/* Only the button turns it; then a tap on the back opens the policy too. */
await flips.first().evaluate((n) => n.scrollIntoView({ block: "center" })); await p.waitForTimeout(300);
await flips.first().tap(); await p.waitForTimeout(800);
console.log("button turns it:", await p.getByRole("button", { name: /Show the policy details/ }).first().getAttribute("aria-pressed"), "| url:", new URL(p.url()).pathname);
await p.screenshot({ path: "out-bc/homeflip-back.png" });
/* The space beside the button doesn't open the policy. */
const btn = await p.getByRole("button", { name: /Show the policy details/ }).first().boundingBox();
await p.mouse.click(btn.x + btn.width + 30, btn.y + btn.height / 2); await p.waitForTimeout(600);
console.log("beside the button stays:", new URL(p.url()).pathname);
const back = p.getByRole("article", { name: "People on Your Health complete" });
box = await back.boundingBox();
await p.mouse.click(box.x + box.width / 2, box.y + 60);
await p.waitForURL("**/policies/**", { timeout: 5000 }).catch(() => {});
console.log("back tap opens:", new URL(p.url()).pathname);
await p.goto(base + "/dashboard"); await p.waitForTimeout(1200);
/* A card with no page of its own: a tap does nothing, the button still turns it. */
const senior = p.getByRole("article", { name: "Care Senior", exact: true });
await senior.evaluate((n) => n.scrollIntoView({ block: "center" })); await p.waitForTimeout(300);
box = await senior.boundingBox();
await p.mouse.click(box.x + 40, box.y + 80); await p.waitForTimeout(800);
console.log("no-page card tap:", new URL(p.url()).pathname, "| turned:", await flips.nth(1).getAttribute("aria-pressed"));
// v2: Renew takes its own tap
await choose(p, "v2 · Renewal due");
await p.evaluate(() => document.querySelectorAll("a[href^='https://ditto-renewal']").forEach((a) => a.addEventListener("click", (e) => { e.preventDefault(); window.__renew = (window.__renew ?? 0) + 1; })));
await p.getByRole("link", { name: "Renew Your Health complete" }).tap(); await p.waitForTimeout(800);
console.log("renew tapped:", await p.evaluate(() => window.__renew), "| url:", new URL(p.url()).pathname, "| still front:", await flips.first().getAttribute("aria-pressed"));
await choose(p, "v1 · Standard");
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
