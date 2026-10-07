import { chromium } from "playwright-core";
const base = process.argv[2] ?? "http://localhost:3123";
const b = await chromium.launch({ channel: "chrome" });
const errors = [];
const p = await (await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, hasTouch: true, isMobile: true })).newPage();
p.on("pageerror", (e) => errors.push(e.message)); p.on("console", (m) => m.type() === "error" && errors.push(m.text()));
await p.goto(base + "/"); await p.waitForTimeout(1500);
await p.getByLabel("Mobile number").fill("9876543210");
await p.getByRole("button", { name: "Continue" }).click(); await p.waitForTimeout(1200);
const otp = p.locator("#otp");
const ring = () => p.evaluate(() => [...document.querySelectorAll("form span[aria-hidden]")].find((s) => s.className.includes("left-0"))?.style.transform);
const box = await otp.boundingBox();
const clip = { x: 0, y: box.y - 30, width: 390, height: 120 };
console.log("ring at start:", await ring());
for (const [i, d] of ["1", "2", "3"].entries()) {
  await p.keyboard.type(d); await p.waitForTimeout(60);
  await p.screenshot({ path: `out-otp/type-${i}-mid.png`, clip });
  await p.waitForTimeout(400);
  console.log(`after "${d}" ring:`, await ring());
}
await p.screenshot({ path: "out-otp/typed3.png", clip });
await p.keyboard.press("Backspace"); await p.waitForTimeout(400);
console.log("after delete ring:", await ring());
await p.keyboard.type("39"); // wrong code 1239
await p.waitForTimeout(250);
await p.screenshot({ path: "out-otp/checking.png", clip });
await p.waitForTimeout(330);
const shakes = [];
for (let i = 0; i < 6; i++) { shakes.push(await p.evaluate(() => document.querySelector("form .inline-flex")?.style.transform || "none")); await p.waitForTimeout(60); }
console.log("shake frames:", shakes.join(" | "));
await p.screenshot({ path: "out-otp/wrong.png", clip });
await p.waitForTimeout(900);
await p.keyboard.type("2168"); await p.waitForTimeout(650);
await p.screenshot({ path: "out-otp/verified.png", clip });
console.log("verified text:", await p.locator("[role=status]").allInnerTexts());
await p.waitForURL("**/dashboard", { timeout: 5000 }).then(() => console.log("went to dashboard")).catch(() => console.log("no nav"));
console.log("errors:", errors.length ? errors : "none");
await b.close();
