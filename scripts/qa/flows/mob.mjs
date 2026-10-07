import { chromium } from "playwright-core";
const base = process.argv[2] ?? "http://localhost:3123";
const b = await chromium.launch({ channel: "chrome" });
const errors = [];
const ctx = await b.newContext({ viewport: { width: 375, height: 667 }, deviceScaleFactor: 2, hasTouch: true, isMobile: true });
const p = await ctx.newPage();
p.on("pageerror", (e) => errors.push(e.message)); p.on("console", (m) => m.type() === "error" && errors.push(m.text()));
const shot = (n) => p.screenshot({ path: `out-mob/${n}.png` });
await p.goto(base + "/dashboard"); await p.waitForTimeout(1500);
const pad = await p.evaluate(() => { const m = document.querySelector("main"); const s = getComputedStyle(m); return `${s.paddingLeft}/${s.paddingRight}`; });
console.log("main padding:", pad, "| header pad:", await p.evaluate(() => getComputedStyle(document.querySelector("header > div")).paddingLeft));
const tabs = p.locator("main nav[aria-label=Policies]");
console.log("segmented visible:", await tabs.isVisible(), "| tabs:", (await tabs.innerText()).replace(/\n/g, " "));
console.log("current tab:", (await tabs.locator("a[aria-current=page]").innerText()).replace(/\n/g, " "));
await shot("1-home");
// welcome sheet
await p.getByRole("button", { name: /Hi, Arjun/ }).tap(); await p.waitForTimeout(700);
const sheet = p.getByRole("dialog", { name: /Welcome/ });
console.log("sheet open:", await sheet.isVisible(), "| focus:", await p.evaluate(() => document.activeElement?.getAttribute("aria-label")), "| scroll locked:", await p.evaluate(() => getComputedStyle(document.documentElement).overflow + "/" + getComputedStyle(document.body).overflow));
await shot("2-welcome-open");
await p.getByRole("button", { name: "Hide your summary" }).tap(); await p.waitForTimeout(700);
console.log("sheet closed:", await sheet.count() === 0, "| focus back:", await p.evaluate(() => document.activeElement?.textContent?.trim().slice(0, 12)));
// drag up to close
await p.getByRole("button", { name: /Hi, Arjun/ }).tap(); await p.waitForTimeout(700);
const cb = await p.getByRole("button", { name: "Hide your summary" }).boundingBox();
await p.mouse.move(cb.x + cb.width / 2, cb.y + cb.height / 2); await p.mouse.down(); await p.mouse.move(cb.x + cb.width / 2, cb.y - 140, { steps: 10 }); await p.mouse.up(); await p.waitForTimeout(800);
console.log("drag up closed:", await sheet.count() === 0);
// nav to pending
await tabs.getByRole("link", { name: /Pending/ }).tap(); await p.waitForURL("**tab=pending"); await p.waitForTimeout(800);
console.log("pending current:", (await tabs.locator("a[aria-current=page]").innerText()).replace(/\n/g, " "));
await shot("3-pending");
// a bottom sheet floats white, 8px in
await p.goto(base + "/dashboard"); await p.waitForTimeout(1200);
await p.getByRole("button", { name: "Ask Ditto Buddy" }).tap(); await p.waitForTimeout(900);
const sb = await p.getByRole("dialog").boundingBox();
console.log("sheet box:", Math.round(sb.x), Math.round(667 - sb.y - sb.height), Math.round(sb.width), "| bg:", await p.getByRole("dialog").evaluate((n) => getComputedStyle(n).backgroundColor));
await p.keyboard.press("Escape"); await p.waitForTimeout(600);
// policy page
await p.goto(base + "/dashboard/policies/474-981-34EDH20"); await p.waitForTimeout(1500);
const order = await p.evaluate(() => [...document.querySelectorAll("main h1, main article[aria-label='Your Health complete'], main section")].map((n) => n.getAttribute("aria-label") || n.getAttribute("aria-labelledby") || n.tagName).slice(0, 6));
console.log("order:", order.join(" > "));
const flipBtn = p.getByRole("button", { name: /Show who/ });
await shot("5-policy");
await flipBtn.tap(); await p.waitForTimeout(800);
console.log("flipped:", await p.getByRole("button", { name: /Show the policy details/ }).getAttribute("aria-pressed"));
await shot("6-policy-flipped");
await p.getByText("Member details").tap(); await p.waitForTimeout(800);
console.log("tap back face flips back:", await p.getByRole("button", { name: /Show who/ }).count());
console.log("errors:", errors.length ? errors : "none");
await b.close();
