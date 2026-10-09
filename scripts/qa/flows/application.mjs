import { chromium } from "playwright-core";
import { channel } from "../browser.mjs";
/* An application's page. The pending cards open it; Next steps for you says
   where it stands (done, in progress, to come) and turns orange with a
   WhatsApp link when the insurer is waiting on you; the questions fold; the
   bell's "Your policy is active" update opens the issued screen, with the
   card, Open policy and Share (which copies the link); an unknown id is
   lost. Then the same pages on a phone: no overflow, the side card after
   the top of the page, the mascot kept off the narrow card. */
const base = process.argv[2] ?? "http://localhost:3123";
const b = await chromium.launch({ channel });
const errors = [];
const fail = (msg) => errors.push(msg);
const watch = (p) => {
  p.on("pageerror", (e) => errors.push(e.message));
  p.on("console", (m) => m.type() === "error" && errors.push(m.text()));
};
const top = (loc) => loc.evaluate((el) => el.getBoundingClientRect().top + window.scrollY);

/* Desktop */
const ctx = await b.newContext({ viewport: { width: 1280, height: 900 }, permissions: ["clipboard-read", "clipboard-write"] });
const p = await ctx.newPage(); watch(p);

await p.goto(base + "/dashboard?tab=pending"); await p.waitForTimeout(800);
const cardLinks = await p.locator("a[data-card-link]").evaluateAll((links) => links.map((a) => new URL(a.href).pathname));
console.log("pending cards open:", cardLinks.join(" "));
if (cardLinks.length !== 4 || !cardLinks.every((href) => href.startsWith("/dashboard/applications/"))) fail("pending cards don't open their application");
const whatsapp = await p.getByRole("link", { name: /on WhatsApp/ }).count();
if (whatsapp !== 2) fail(`WhatsApp links on the cards: ${whatsapp}, expected 2`);
await p.locator("a[data-card-link]").nth(3).click();
await p.waitForURL(/\/dashboard\/applications\/care-verification$/); await p.waitForTimeout(900);

/* With the insurer: step 2 in progress */
const h1 = await p.getByRole("heading", { level: 1 }).innerText();
console.log("h1:", h1);
if (!/application is submitted/.test(h1)) fail(`submitted heading: ${h1}`);
const crumb = await p.getByRole("link", { name: "Pending applications" }).getAttribute("href");
console.log("breadcrumb:", crumb);
if (crumb !== "/dashboard?tab=pending") fail("breadcrumb doesn't lead to Pending");
const region = p.getByRole("region", { name: "Next steps for you" });
const stepTitles = await region.getByRole("heading", { level: 3 }).allInnerTexts();
console.log("steps:", stepTitles.join(" | "));
if (stepTitles.length !== 3) fail(`${stepTitles.length} steps, expected 3`);
const current = await region.locator("li[aria-current='step']").getByRole("heading", { level: 3 }).innerText().catch(() => "");
console.log("in progress:", current);
if (!/Insurer underwriting/.test(current)) fail("underwriting isn't the current step for a verification application");
if (!/Application submitted\s*, done/.test(stepTitles[0]) || !/to come/.test(stepTitles[2])) fail("step states aren't spoken");
if (await region.getByRole("link", { name: /WhatsApp/ }).count()) fail("a verification application shows a WhatsApp step");
await p.screenshot({ path: "out-bc/application-submitted.png", fullPage: true });

const faq = p.locator("details").first();
await faq.locator("summary").click(); await p.waitForTimeout(250);
const opened = await faq.evaluate((el) => el.open);
await faq.locator("summary").click(); await p.waitForTimeout(250);
const closed = !(await faq.evaluate((el) => el.open));
console.log("faq opens and closes:", opened, closed);
if (!opened || !closed) fail("faq doesn't fold");
const advisor = await p.getByRole("link", { name: /Message on WhatsApp/ }).getAttribute("href");
if (!decodeURIComponent(advisor ?? "").includes("12345678958")) fail("the advisor's WhatsApp message doesn't name the application");

/* Needs you: the orange tile with WhatsApp, and no step in progress */
await p.goto(base + "/dashboard/applications/maxlife-uploads"); await p.waitForTimeout(900);
const needs = p.getByRole("region", { name: "Next steps for you" });
const send = await needs.getByRole("link", { name: /Send on WhatsApp/ }).getAttribute("href");
console.log("needs you →", decodeURIComponent(send ?? "").match(/\((\d+)\)/)?.[1]);
if (!decodeURIComponent(send ?? "").includes("12345678921")) fail("the needs-you step doesn't offer WhatsApp for the right application");
if (await needs.locator("li[aria-current='step']").count()) fail("a waiting application shows a step in progress");
const orange = await needs.locator(".bg-orange-tint").count();
if (!orange) fail("the needs-you tile isn't orange");

/* Issued, from the bell */
await p.goto(base + "/dashboard"); await p.waitForTimeout(800);
await p.getByRole("button", { name: /^Notifications/ }).click(); await p.waitForTimeout(300);
const first = p.getByRole("dialog", { name: "Notifications" }).getByRole("link").first();
console.log("first update:", (await first.innerText()).replace(/\n/g, " · "));
if (!/Your policy is active/.test(await first.innerText())) fail("the bell doesn't lead with the issued policy");
await first.click();
await p.waitForURL(/\/dashboard\/applications\/care-issued$/); await p.waitForTimeout(900);
const issuedH1 = await p.getByRole("heading", { level: 1 }).innerText();
console.log("issued h1:", issuedH1);
if (!/policy is active/.test(issuedH1)) fail(`issued heading: ${issuedH1}`);
const open = await p.getByRole("link", { name: "Open policy" }).getAttribute("href");
console.log("Open policy →", open);
if (open !== "/dashboard/policies/474-981-34EDH20") fail("Open policy goes elsewhere");
const filled = await p.locator("main a.bg-accent, main button.bg-accent").count();
console.log("filled actions on the page:", filled);
if (filled !== 1) fail(`${filled} filled actions, expected one (Open policy)`);
if (!(await p.getByRole("heading", { name: "Your Health complete" }).first().isVisible())) fail("the policy card isn't on the issued page");
for (const name of ["Good to know", "What’s covered", "What’s not covered", "Things to note"]) {
  if (!(await p.getByRole("region", { name }).count())) fail(`missing section: ${name}`);
}
await p.evaluate(() => { navigator.share = undefined; });
await p.getByRole("button", { name: "Share" }).click(); await p.waitForTimeout(400);
const copied = await p.locator("[data-sonner-toaster]").filter({ hasText: /Link copied/ }).count();
const clip = await p.evaluate(() => navigator.clipboard.readText()).catch(() => "(no clipboard)");
console.log("share toast:", copied > 0, "| clipboard:", clip.slice(-45));
if (!copied) fail("Share doesn't confirm the copied link");
if (clip !== "(no clipboard)" && !clip.includes("/dashboard/policies/474-981-34EDH20")) fail("the copied link isn't the policy");
await p.screenshot({ path: "out-bc/application-issued.png", fullPage: true });

/* Lost: on its own page, since the 404 itself is logged as a console error. */
const l = await ctx.newPage(); l.on("pageerror", (e) => errors.push(e.message));
const lost = await l.goto(base + "/dashboard/applications/NOT-AN-APPLICATION"); await l.waitForTimeout(600);
const home = await l.getByRole("link", { name: "Go to your policies" }).count();
console.log("unknown application:", lost?.status(), "| way home:", home > 0);
if (lost?.status() !== 404 || !home) fail("an unknown application isn't lost");
await ctx.close();

/* Phone */
const mctx = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
const m = await mctx.newPage(); watch(m);
for (const [id, side] of [["care-verification", "Next steps for you"], ["care-issued", "Good to know"]]) {
  await m.goto(base + `/dashboard/applications/${id}`); await m.waitForTimeout(1000);
  const over = await m.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  const sideTop = await top(m.getByRole("region", { name: side }));
  const lastTop = await top(m.getByRole("region", { name: id === "care-issued" ? "Things to note" : "Questions about your application" }));
  const h1Top = await top(m.getByRole("heading", { level: 1 }));
  console.log(id, "phone overflow:", over, "| side card between top and foot:", h1Top < sideTop && sideTop < lastTop);
  if (over > 0) fail(`${id} overflows on a phone by ${over}px`);
  if (!(h1Top < sideTop && sideTop < lastTop)) fail(`${id}: the side card is out of order on a phone`);
  if (id === "care-verification") {
    const mascot = await m.locator("img[src*='mascot-laptop']").isVisible().catch(() => false);
    console.log("mascot on the narrow advisor card:", mascot);
    if (mascot) fail("the mascot shows on a phone, over the text");
  }
  await m.screenshot({ path: `out-bc/application-${id}-phone.png`, fullPage: true });
}

console.log("errors:", errors.length ? errors : "none");
await b.close();
