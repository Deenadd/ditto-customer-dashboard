import { chromium } from "playwright-core";
import { channel } from "../browser.mjs";
const base = process.argv[2] ?? "http://localhost:3123";
const mobile = process.argv[3] === "mobile";
const tag = mobile ? "m" : "d";
const b = await chromium.launch({ channel });
const ctx = await b.newContext(mobile ? { viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, hasTouch: true, isMobile: true } : { viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 });
const p = await ctx.newPage();
const errors = [];
p.on("pageerror", (e) => errors.push(e.message));
p.on("console", (m) => m.type() === "error" && errors.push(m.text()));
const log = (...a) => console.log(...a);
const shot = (n, full = false) => p.screenshot({ path: `out-fc/${tag}-${n}.png`, fullPage: full });
const click = (loc) => (mobile ? loc.tap() : loc.click());
const pol = "/dashboard/policies/474-981-34EDH20";

// home: stat + cards
await p.goto(base + "/dashboard"); await p.waitForTimeout(1500);
log("stat:", (await p.locator("dl").first().innerText()).replace(/\n/g, " | "));
log("health card:", (await p.locator("article[aria-label='Your Health complete']").first().innerText()).replace(/\n/g, " | "));
log("term card:", (await p.locator("article[aria-label='Smart Secure Plus']").first().innerText()).replace(/\n/g, " | "));
await shot("home", true);
// whatsapp
await click(p.getByRole("button", { name: "Help on WhatsApp" })); await p.waitForTimeout(400);
const wa = p.getByRole("dialog", { name: "Help on WhatsApp" });
log("whatsapp link:", await wa.getByRole("link", { name: "Open WhatsApp" }).getAttribute("href"), "| target:", await wa.getByRole("link", { name: "Open WhatsApp" }).getAttribute("target"));
await shot("whatsapp");
await p.keyboard.press("Escape"); await p.waitForTimeout(200);
log("whatsapp closed:", await wa.count() === 0, "| focus:", await p.evaluate(() => document.activeElement?.getAttribute("aria-label")));

// policy page
await p.goto(base + pol); await p.waitForTimeout(1500);
log("header logo gone:", (await p.locator("main header img, main header [class*=logo]").count()) === 0, "| h1:", await p.locator("h1").innerText());
log("quick actions:", (await p.getByRole("region", { name: /Quick actions/ }).or(p.locator("section[aria-labelledby=quick-title]")).first().innerText()).replace(/\n/g, " | "));
await shot("policy", true);
await click(p.getByRole("button", { name: /^Network hospitals/ })); await p.waitForTimeout(1200);
const sheet = p.getByRole("dialog");
await click(sheet.getByRole("button", { name: /Riverside/ })); await p.waitForTimeout(500);
log("riverside expanded:", await sheet.getByRole("button", { name: /Riverside/ }).getAttribute("aria-expanded"));
const links = await sheet.locator("#hospital-riverside a").evaluateAll((as) => as.map((a) => `${a.innerText.trim()} → ${a.getAttribute("href").slice(0, 70)}`));
log("actions:", links.join(" ; "));
await shot("hospital");
await click(sheet.getByRole("button", { name: /Guindy/ })); await p.waitForTimeout(400);
log("one at a time:", await sheet.getByRole("button", { name: /Riverside/ }).getAttribute("aria-expanded"), await sheet.getByRole("button", { name: /Guindy/ }).getAttribute("aria-expanded"));
await p.keyboard.press("Escape"); await p.waitForTimeout(700);

// v2 default + switch
await p.goto(base + pol + "/claims/new"); await p.waitForTimeout(1200);
log("default h1:", await p.locator("h1").innerText(), "| switch:", await p.getByRole("button", { name: /v2/ }).getAttribute("aria-pressed"));
await shot("v2-start", true);
await click(p.getByRole("button", { name: /v1 · Hospital first/ })); await p.waitForTimeout(700);
log("v1 h1:", await p.locator("h1").innerText());
await shot("v1-hospital", true);
// v1 reimbursement at a non-network hospital
await click(p.getByRole("button", { name: "Continue" })); await p.waitForTimeout(200);
log("v1 step1 error:", await p.locator("p[role=alert]").innerText());
await p.getByLabel(/T\. Nagar Family Hospital/).check({ force: true }); await p.waitForTimeout(200);
await click(p.getByRole("button", { name: "Continue" })); await p.waitForTimeout(600);
log("v1 step2:", await p.locator("h1").innerText(), "|", await p.locator("h1 + p").innerText());
log("cashless disabled:", await p.getByLabel(/^Cashless/).isDisabled());
await shot("v1-type");
await p.getByLabel(/^Reimbursement/).check({ force: true });
await click(p.getByRole("button", { name: "Continue" })); await p.waitForTimeout(600);
log("v1 step3:", await p.locator("h1").innerText(), "| bar:", await p.getByRole("progressbar").getAttribute("aria-valuetext"));
await click(p.getByRole("button", { name: "Continue" })); await p.waitForTimeout(200);
log("err:", await p.locator("p[role=alert]").innerText());
await p.getByLabel(/Kavya Raghavan/).check({ force: true });
await p.getByLabel("Treatment").fill("Appendix surgery");
await click(p.getByRole("button", { name: "Continue" })); await p.waitForTimeout(600);
log("v1 step4:", await p.locator("h1").innerText());
await click(p.getByRole("button", { name: "Send request" })); await p.waitForTimeout(200);
log("err:", await p.locator("p[role=alert]").innerText(), "| focus:", await p.evaluate(() => document.activeElement?.id));
await p.getByLabel("Total amount you paid").fill("42500");
await p.getByLabel("Add bills and payment receipts").setInputFiles({ name: "bill.pdf", mimeType: "application/pdf", buffer: Buffer.from("x") });
await p.getByLabel("Add discharge summary").setInputFiles({ name: "discharge.pdf", mimeType: "application/pdf", buffer: Buffer.from("x") });
await shot("v1-docs", true);
await click(p.getByRole("button", { name: "Send request" })); await p.waitForTimeout(5500);
log("ticket:", (await p.locator("main").innerText()).replace(/\n/g, " | ").slice(0, 300));
await shot("v1-ticket", true);
await click(p.getByRole("button", { name: "View claim" })); await p.waitForURL("**/claims/CL*"); await p.waitForTimeout(1200);
log("claim page:", await p.locator("h1").innerText());
await shot("claim", true);
// delete
await click(p.getByRole("button", { name: /^Delete claim/ }).first()); await p.waitForTimeout(400);
const dlg = p.getByRole("dialog");
log("dialog:", (await dlg.innerText()).replace(/\n/g, " | "), "| focus:", await p.evaluate(() => document.activeElement?.textContent));
await shot("delete");
await click(dlg.getByRole("button", { name: "Delete claim" })); await p.waitForTimeout(1200);
log("after delete:", await p.locator("p[role=status]").first().innerText());

// v1 cashless at network hospital; switch remembered
await p.goto(base + pol + "/claims/new"); await p.waitForTimeout(1200);
log("remembered v1:", await p.locator("h1").innerText());
await p.getByLabel(/Lakeview Hospital/).check({ force: true });
await click(p.getByRole("button", { name: "Continue" })); await p.waitForTimeout(600);
log("cashless enabled:", !(await p.getByLabel(/^Cashless/).isDisabled()));
await p.getByLabel(/^Cashless/).check({ force: true });
await click(p.getByRole("button", { name: "Continue" })); await p.waitForTimeout(600);
await p.getByLabel(/Kavya Raghavan/).check({ force: true });
await p.getByLabel("Treatment").fill("Knee surgery");
log("submit label:", await p.locator("button[type=submit]").innerText(), "| bar:", await p.getByRole("progressbar").getAttribute("aria-valuetext"));
await click(p.getByRole("button", { name: "Send request" })); await p.waitForTimeout(5500);
log("cashless ticket:", (await p.locator("main").innerText()).replace(/\n/g, " | ").slice(0, 200));
// health card claims count
await p.goto(base + "/dashboard"); await p.waitForTimeout(1500);
log("health card now:", (await p.locator("article[aria-label='Your Health complete']").first().innerText()).replace(/\n/g, " | "));
// back to v2
await p.goto(base + pol + "/claims/new"); await p.waitForTimeout(1200);
await click(p.getByRole("button", { name: /v2 · Claim type first/ })); await p.waitForTimeout(700);
log("v2 again:", await p.locator("h1").innerText());
await p.evaluate(() => localStorage.clear());
log("errors:", errors.length ? errors : "none");
await b.close();
