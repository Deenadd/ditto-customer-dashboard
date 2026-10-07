import { chromium } from "playwright-core";
import { channel } from "../browser.mjs";
const base = process.argv[2] ?? "http://localhost:3123";
const out = process.argv[3];
const b = await chromium.launch({ channel });
const errors = [];
const p = await b.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, hasTouch: false });
p.on("pageerror", (e) => errors.push(e.message));
p.on("console", (m) => m.type() === "error" && errors.push(m.text()));
const box = () => p.getByRole("dialog").boundingBox();
const open = async () => { await p.getByRole("button", { name: "Ask Ditto Buddy" }).click(); await p.waitForTimeout(1200); };
await p.goto(base + "/dashboard"); await p.waitForTimeout(1200);
await open();
let bb = await box();
console.log("sheet:", Math.round(bb.x), Math.round(bb.y), Math.round(bb.width), "x", Math.round(bb.height), "| radius:", await p.getByRole("dialog").evaluate((n) => getComputedStyle(n).borderTopLeftRadius));
await p.screenshot({ path: `${out}/open.png` });
// chat works inside
await p.getByRole("dialog").getByRole("button", { name: "Check what's covered" }).click(); await p.waitForTimeout(1300);
console.log("chat replied:", (await p.getByRole("dialog").getByRole("log").innerText()).includes("What would you like to check"));
// short drag springs back
const hx = bb.x + bb.width / 2, hy = bb.y + 24;
await p.mouse.move(hx, hy); await p.mouse.down(); await p.mouse.move(hx, hy + 60, { steps: 12 }); await p.mouse.up(); await p.waitForTimeout(900);
console.log("short drag, still open:", await p.getByRole("dialog").count(), "| y back to:", Math.round((await box()).y));
// long drag dismisses
await p.mouse.move(hx, hy); await p.mouse.down(); await p.mouse.move(hx, hy + 260, { steps: 20 }); await p.mouse.up(); await p.waitForTimeout(1500);
console.log("long drag closed:", (await p.getByRole("dialog").count()) === 0, "| focus back on:", await p.evaluate(() => document.activeElement?.textContent));
// tap scrim
await open(); await p.mouse.click(195, 40); await p.waitForTimeout(800);
console.log("scrim tap closed:", (await p.getByRole("dialog").count()) === 0);
await open(); await p.keyboard.press("Escape"); await p.waitForTimeout(800);
console.log("escape closed:", (await p.getByRole("dialog").count()) === 0, "| overflow:", JSON.stringify(await p.evaluate(() => document.documentElement.style.overflow)));
// quick actions + claims support on policy page
await p.goto(base + "/dashboard/policies/474-981-34EDH20"); await p.waitForTimeout(1200);
await p.screenshot({ path: `${out}/card.png` });
await p.keyboard.press("Escape"); await p.waitForTimeout(700);
await p.getByRole("button", { name: /Which kind of claim/ }).evaluate((n) => n.click()); await p.waitForTimeout(1300);
await p.screenshot({ path: `${out}/claims.png` });
await p.keyboard.press("Escape"); await p.waitForTimeout(600);
// desktop unchanged
const d = await b.newPage({ viewport: { width: 1440, height: 900 } });
await d.goto(base + "/dashboard"); await d.waitForTimeout(1200);
await d.getByRole("button", { name: "Ask Ditto Buddy" }).click(); await d.waitForTimeout(1200);
const db = await d.getByRole("dialog").boundingBox();
console.log("desktop side sheet:", Math.round(db.x), Math.round(db.y), Math.round(db.width), "x", Math.round(db.height));
console.log("errors:", errors.length ? errors : "none");
await b.close();
