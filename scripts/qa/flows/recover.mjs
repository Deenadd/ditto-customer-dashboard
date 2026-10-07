import { chromium } from "playwright-core";
import { channel } from "../browser.mjs";
/* Nothing is lost: a pasted number and a refresh in sign-in, a refresh mid
   claim and on the ticket, errors beside the field and focused, Undo after a
   delete, and files that can't be added saying why (on a phone, with 40px
   remove targets). */
const base = process.argv[2] ?? "http://localhost:3123";
const S = process.argv[3];
const b = await chromium.launch({ channel });
const errors = [];
const fail = (msg) => errors.push(msg);
const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, hasTouch: true, isMobile: true });
const p = await ctx.newPage();
p.on("pageerror", (e) => errors.push(e.message));
p.on("console", (m) => m.type() === "error" && errors.push(m.text()));
const h1 = () => p.locator("h1").first().innerText();
const focused = () => p.evaluate(() => { const a = document.activeElement; return a?.id || a?.getAttribute("name") || a?.tagName; });
const next = async (name = /^(Continue|Send request|Send claim)$/) => { await p.getByRole("button", { name }).evaluate((n) => n.click()); await p.waitForTimeout(450); };

/* Sign in */
await p.goto(base + "/"); await p.waitForTimeout(1200);
await p.getByLabel("Mobile number").fill("+91 98765-43210");
const typed = await p.getByLabel("Mobile number").inputValue();
console.log("pasted +91 98765-43210 →", typed);
if (typed !== "9876543210") fail(`pasted number kept as ${typed}`);
await p.getByRole("button", { name: "Continue" }).click(); await p.waitForTimeout(900);
await p.reload(); await p.waitForTimeout(1500);
console.log("after refresh on the code step:", await h1());
if ((await h1()) !== "Verify your number") fail("refresh lost the code step");

/* Cashless, v2 */
const claim = base + "/dashboard/policies/474-981-34EDH20/claims/new";
await p.goto(claim); await p.waitForTimeout(1000);
await p.getByRole("button", { name: /Cashless/ }).click(); await p.waitForTimeout(400);
await next();
console.log("no patient:", await p.locator("p[role=alert]").innerText(), "| focus:", await focused());
if ((await focused()) !== "patient") fail("missing patient isn't focused");
await p.getByLabel(/Kavya Raghavan/).check({ force: true });
await next();
await next();
const inside = await p.locator("section:has(button[aria-expanded=true]) p[role=alert]").count();
console.log("no category:", await p.locator("p[role=alert]").innerText(), "| inside the question:", inside > 0, "| focus:", await focused());
if (!inside || (await focused()) !== "category") fail("category message isn't beside the question, focused");
await p.getByLabel(/^Hospitalisation/).check({ force: true }); await p.waitForTimeout(350);
await p.getByLabel("Treatment name").fill("Knee surgery");
await p.reload(); await p.waitForTimeout(1500);
const kept = await p.getByLabel("Treatment name").inputValue().catch(() => "");
console.log("after refresh:", await h1(), "| treatment kept:", kept, "| note:", await p.getByText("We kept your answers").count());
if (kept !== "Knee surgery") fail("refresh lost the claim's answers");
await p.getByRole("button", { name: /Where are you in the treatment|Choose where you are|Stage/ }).first().click(); await p.waitForTimeout(300);
await p.getByLabel(/^Planning a stay/).check({ force: true }); await next();
await p.getByLabel(/No, it isn/).check({ force: true }); await next();
await p.getByLabel(/^Lakeview Hospital/).check({ force: true });
await p.getByRole("button", { name: "Send request" }).evaluate((n) => { n.click(); n.click(); });
await p.waitForTimeout(1500);
const stored = await p.evaluate(() => JSON.parse(localStorage.getItem("ditto.claims.v2") ?? "[]").length);
console.log("double tap on Send request made", stored, "claim(s)");
if (stored !== 1) fail(`double tap made ${stored} claims`);
await p.reload(); await p.waitForURL(/claims\/CL\d{4}\?created=1/, { timeout: 8000 }).catch(() => {});
await p.waitForTimeout(900);
console.log("refresh on the ticket opens:", new URL(p.url()).pathname + new URL(p.url()).search, "|", (await h1()).replace(/\n/g, " "));
if (!/claims\/CL\d{4}/.test(p.url())) fail("refresh on the ticket didn't open the claim");

/* Delete, then Undo */
await p.getByRole("button", { name: "Delete claim" }).click(); await p.waitForTimeout(300);
await p.getByRole("dialog").getByRole("button", { name: "Delete claim" }).click();
await p.waitForURL(/deleted=/); await p.waitForTimeout(500);
await p.getByRole("button", { name: "Undo" }).click(); await p.waitForTimeout(700);
const rows = await p.getByRole("region", { name: "Active claims" }).getByRole("link").count();
console.log("after Undo:", await p.locator("p[role=status]").first().innerText(), "| claims:", rows);
if (rows !== 1) fail("Undo didn't bring the claim back");

/* Starting again after that is a fresh form */
await p.goto(claim); await p.waitForTimeout(1000);
console.log("new claim after sending one:", await h1());
if ((await h1()) !== "Make a claim") fail("a sent claim's answers came back");

/* Reimbursement: details beside each field, then documents */
await p.getByRole("button", { name: /Reimbursement/ }).click(); await p.waitForTimeout(400);
await p.getByLabel(/^Hospitalisation/).check({ force: true }); await next();
await next();
console.log("empty details:", await p.locator("#r-patient-error").innerText().catch(() => "(none)"), "| focus:", await focused());
if ((await focused()) !== "r-patient") fail("details error isn't under the patient field");
await p.locator("#r-patient").selectOption({ label: "Kavya Raghavan (Wife)" });
await p.locator("#r-amount").fill("52500"); await p.locator("#r-reason").fill("Appendix surgery"); await p.locator("#r-hospital").fill("Lakeview Hospital");
await p.locator("#r-admission").fill("2026-09-28"); await p.locator("#r-discharge").fill("2026-10-01");
await next(); await next();
await p.locator("#r-doc-bills").setInputFiles(`${S}/bill1.pdf`); await p.waitForTimeout(200);
await p.locator("#r-doc-bills").setInputFiles(`${S}/bill1.pdf`); await p.waitForTimeout(300);
const notes = await p.locator("[id^=r-doc-bills-notice] li").allInnerTexts().catch(() => []);
console.log("same file twice:", notes.join(" / ") || "(nothing)", "|", await p.getByText(/files? added/).first().innerText());
if (!notes.some((t) => /already added/.test(t))) fail("a duplicate file isn't explained");
await p.locator("#r-doc-bills").setInputFiles([
  { name: "notes.txt", mimeType: "text/plain", buffer: Buffer.from("not a bill") },
  { name: "scan.pdf", mimeType: "application/pdf", buffer: Buffer.alloc(11 * 1024 * 1024) },
]);
await p.waitForTimeout(300);
const rejected = await p.locator("[id^=r-doc-bills-notice] li").allInnerTexts();
console.log("wrong type and too big:", rejected.join(" / "));
if (!rejected.some((t) => /isn't a photo or PDF/.test(t)) || !rejected.some((t) => /over 10 MB/.test(t))) fail("bad files aren't explained");
const hit = await p.getByRole("button", { name: "Remove bill1.pdf" }).evaluate((n) => {
  const r = n.getBoundingClientRect(); const a = getComputedStyle(n, "::after");
  return Math.round(Math.min(r.width - parseFloat(a.left) - parseFloat(a.right), r.height - parseFloat(a.top) - parseFloat(a.bottom)));
});
console.log("remove target:", hit, "px");
if (hit < 40) fail(`remove target is ${hit}px`);
await p.screenshot({ path: "out-bc/recover-docs.png", fullPage: true });
console.log("errors:", errors.length ? errors : "none");
await b.close();
