import { chromium } from "playwright-core";
import { channel } from "../browser.mjs";
/* Empty states, next steps and confirmations: notifications with nothing new,
   the empty Pending tab and the cards waiting on you, a hospital search with
   no match, the card download, log out, the skip link, the welcome sheet
   keeping focus, and a long message in Buddy. */
const base = process.argv[2] ?? "http://localhost:3123";
const b = await chromium.launch({ channel });
const errors = [];
const fail = (msg) => errors.push(msg);
const watch = (p) => {
  p.on("pageerror", (e) => errors.push(e.message));
  p.on("console", (m) => m.type() === "error" && errors.push(m.text()));
};

/* Desktop */
const ctx = await b.newContext({ viewport: { width: 1280, height: 900 }, acceptDownloads: true });
const p = await ctx.newPage(); watch(p);

await p.goto(base + "/dashboard?customer=new"); await p.waitForTimeout(900);
await p.keyboard.press("Tab"); await p.waitForTimeout(250);
const skip = await p.evaluate(() => ({ text: document.activeElement?.textContent, top: document.activeElement?.getBoundingClientRect().top }));
console.log("first Tab:", skip.text, "| on screen:", skip.top >= 0);
if (skip.text !== "Skip to content" || skip.top < 0) fail("skip link isn't the first, visible stop");
await p.keyboard.press("Enter"); await p.waitForTimeout(200);
console.log("skip goes to:", new URL(p.url()).hash);

await p.getByRole("button", { name: /^Notifications/ }).click(); await p.waitForTimeout(300);
const empty = await p.getByRole("dialog", { name: "Notifications" }).innerText();
console.log("no updates:", empty.replace(/\n/g, " | "));
if (!/No updates yet/.test(empty)) fail("notifications have no empty state");
await p.keyboard.press("Escape");

await p.goto(base + "/dashboard?tab=pending&customer=new"); await p.waitForTimeout(700);
const talk = await p.getByRole("link", { name: "Talk to our team" }).getAttribute("href");
console.log("empty Pending → Talk to our team:", talk?.slice(0, 40));
if (!talk?.startsWith("https://wa.me/")) fail("Talk to our team goes nowhere");

await p.goto(base + "/dashboard?tab=pending"); await p.waitForTimeout(700);
const steps = await p.getByRole("link", { name: /on WhatsApp/ }).evaluateAll((links) => links.map((a) => `${a.textContent.trim()} → ${decodeURIComponent(a.href).match(/\((\d+)\)/)?.[1]}`));
console.log("next steps on cards:", steps.join(" ; "));
if (steps.length !== 2 || steps.some((s) => s.endsWith("undefined"))) fail(`expected 2 next steps naming the application, got ${steps.length}`);

await p.goto(base + "/dashboard/policies/474-981-34EDH20"); await p.waitForTimeout(900);
const download = p.waitForEvent("download");
await p.getByRole("button", { name: "Download card" }).first().click();
console.log("download:", (await download).suggestedFilename());
await p.waitForTimeout(300);
/* Confirmed by a toast, in Sonner's live region. */
const saved = await p.locator("[data-sonner-toaster]").filter({ hasText: /Card downloaded/ }).count();
console.log("download toast:", saved > 0, "|", (await p.locator("[data-sonner-toast]").first().innerText().catch(() => "")).replace(/\n/g, " · "));
if (!saved) fail("download isn't confirmed");

await p.getByRole("button", { name: /Network hospitals/ }).click(); await p.waitForTimeout(900);
await p.fill("#network-q", "zzzz"); await p.waitForTimeout(200);
const none = await p.getByRole("dialog").getByText(/No hospitals match/).count();
console.log("no match message:", none > 0);
if (!none) fail("no-match search is blank");
await p.getByRole("button", { name: "Clear search" }).click(); await p.waitForTimeout(200);
const back = await p.evaluate(() => ({ value: document.querySelector("#network-q").value, focus: document.activeElement?.id }));
console.log("after Clear search:", back, "| rows:", await p.getByRole("dialog").getByRole("button", { expanded: false }).count());
if (back.value || back.focus !== "network-q") fail("Clear search doesn't reset and refocus");
await p.keyboard.press("Escape"); await p.waitForTimeout(400);

await p.getByRole("button", { name: /^Account/ }).click(); await p.waitForTimeout(200);
await p.getByRole("menuitem", { name: "Log out" }).click();
await p.waitForURL((url) => url.pathname === "/"); await p.waitForTimeout(900);
const out = await p.getByText(/You've signed out/).count();
console.log("signed out note:", out > 0, "| url:", new URL(p.url()).pathname + new URL(p.url()).search);
if (!out) fail("log out isn't confirmed");
await ctx.close();

/* Phone */
const phone = await b.newContext({ viewport: { width: 320, height: 640 }, deviceScaleFactor: 2, hasTouch: true, isMobile: true });
const m = await phone.newPage(); watch(m);
await m.goto(base + "/dashboard"); await m.waitForTimeout(900);
await m.getByRole("button", { name: /Show your summary/ }).click(); await m.waitForTimeout(700);
const inside = [];
for (let i = 0; i < 6; i++) {
  await m.keyboard.press("Tab");
  inside.push(await m.evaluate(() => !!document.activeElement?.closest("[role=dialog]")));
}
console.log("welcome sheet keeps focus:", inside.every(Boolean), inside.join(","));
if (!inside.every(Boolean)) fail("focus escapes the welcome sheet");
await m.keyboard.press("Escape"); await m.waitForTimeout(500);

await m.getByRole("button", { name: "Ask Ditto Buddy" }).click(); await m.waitForTimeout(1500);
await m.fill("#buddy-question", "a".repeat(80)); await m.keyboard.press("Enter"); await m.waitForTimeout(400);
const bubble = await m.evaluate(() => {
  const mine = [...document.querySelectorAll("[role=dialog] p")].find((n) => n.textContent.includes("aaaa"));
  const sheet = mine.closest("[role=dialog]").getBoundingClientRect();
  return { right: Math.round(mine.getBoundingClientRect().right), edge: Math.round(sheet.right), scroll: mine.scrollWidth - mine.clientWidth };
});
console.log("long message bubble:", bubble);
if (bubble.right > bubble.edge || bubble.scroll > 1) fail("a long message spills out of its bubble");
await m.screenshot({ path: "out-bc/states-buddy-long.png" });
console.log("errors:", errors.length ? errors : "none");
await b.close();
