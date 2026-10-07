import { chromium } from "playwright-core";
import { channel } from "../browser.mjs";
/* No pending applications: no card around it; on opening the Pending tab the
   tiles are dealt in left to right, then the text comes into focus. */
const base = process.argv[2] ?? "http://localhost:3123";
const b = await chromium.launch({ channel });
const errors = [];
for (const [tag, viewport, mobile] of [["d", { width: 1280, height: 900 }, false], ["m", { width: 390, height: 844 }, true]]) {
  const p = await (await b.newContext({ viewport, deviceScaleFactor: 2, hasTouch: mobile, isMobile: mobile })).newPage();
  p.on("pageerror", (e) => errors.push(e.message));
  p.on("console", (m) => m.type() === "error" && errors.push(m.text()));
  await p.goto(base + "/dashboard?customer=new"); await p.waitForTimeout(1200);
  await p.locator("main nav[aria-label=Policies]").getByRole("link", { name: /Pending/ }).click();
  const heading = p.getByRole("heading", { name: "No pending applications" });
  await heading.waitFor();
  /* Sample each tile's and the heading's opacity as it plays. */
  const frames = [];
  for (let i = 0; i < 9; i++) {
    frames.push(await p.evaluate(() => {
      const h = [...document.querySelectorAll("h2")].find((n) => n.textContent === "No pending applications");
      const fan = h.previousElementSibling;
      const o = (n) => Number(getComputedStyle(n).opacity).toFixed(1);
      return [...fan.children].map(o).join(" ") + " | h " + o(h);
    }));
    if (i === 2) await p.screenshot({ path: `out-bc/empty-${tag}-mid.png` });
    await p.waitForTimeout(150);
  }
  console.log(tag, "frames:", frames.join("  ·  "));
  await p.waitForTimeout(800);
  const box = await heading.evaluate((h) => { const c = h.parentElement; const s = getComputedStyle(c); return { shadow: s.boxShadow, bg: s.backgroundColor }; });
  console.log(tag, "no card:", box.shadow === "none" && box.bg === "rgba(0, 0, 0, 0)");
  console.log(tag, "Talk to our team:", (await p.getByRole("link", { name: "Talk to our team" }).getAttribute("href"))?.slice(0, 14));
  await p.screenshot({ path: `out-bc/empty-${tag}-end.png` });
}
/* Reduced motion: fades only, no transforms. */
const r = await (await b.newContext({ viewport: { width: 1280, height: 900 }, reducedMotion: "reduce" })).newPage();
await r.goto(base + "/dashboard?customer=new&tab=pending"); await r.waitForTimeout(1200);
const settled = await r.evaluate(() => { const h = [...document.querySelectorAll("h2")].find((n) => n.textContent === "No pending applications"); return [...h.previousElementSibling.children, h].map((n) => getComputedStyle(n).transform + "/" + getComputedStyle(n).opacity); });
console.log("reduced, settled in place:", settled.every((v) => /^(none|matrix\(1, 0, 0, 1, 0, 0\))\/1$/.test(v)) || settled);
console.log("errors:", errors.length ? errors : "none");
await b.close();
