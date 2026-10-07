import { chromium } from "playwright-core";
const base = process.argv[2] ?? "http://localhost:3123";
const b = await chromium.launch({ channel: "chrome" });
const errors = [];
for (const mode of ["android", "ios"]) {
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, hasTouch: true, isMobile: true });
  await ctx.addInitScript((mode) => {
    window.__haptics = [];
    if (mode === "ios") { Object.defineProperty(Navigator.prototype, "vibrate", { value: undefined, configurable: true }); }
    else { navigator.vibrate = (p) => { window.__haptics.push(JSON.stringify(p)); return true; }; }
    const orig = HTMLElement.prototype.click;
    HTMLElement.prototype.click = function () { if (this.tagName === "LABEL" && this.querySelector("input[switch]")) window.__haptics.push("switch"); return orig.call(this); };
  }, mode);
  const p = await ctx.newPage();
  p.on("pageerror", (e) => errors.push(e.message));
  await p.goto(base + "/dashboard"); await p.waitForTimeout(1500);
  const seg = p.locator("main nav[aria-label=Policies]");
  console.log(mode, "segmented visible:", await seg.isVisible(), "| bottom nav:", await p.locator("nav.material-bar").count());
  const take = () => p.evaluate(() => { const h = window.__haptics; window.__haptics = []; return h.join(","); });
  await seg.getByRole("link", { name: /Pending/ }).tap(); await p.waitForURL("**tab=pending"); await p.waitForTimeout(500);
  console.log(mode, "tab tap:", await take());
  await p.getByRole("button", { name: /Hi, Arjun/ }).tap(); await p.waitForTimeout(300);
  console.log(mode, "welcome sheet:", await take());
  await p.getByRole("button", { name: "Hide your summary" }).tap(); await p.waitForTimeout(600); await take();
  await p.goto(base + "/dashboard/policies/474-981-34EDH20"); await p.waitForTimeout(1500); await take();
  await p.getByRole("button", { name: /Show who/ }).tap(); await p.waitForTimeout(300);
  console.log(mode, "card flip:", await take());
  await p.getByRole("button", { name: /Which kind of claim/ }).tap(); await p.waitForTimeout(300);
  console.log(mode, "row tap:", await take());
  await ctx.close();
}
console.log("errors:", errors.length ? errors : "none");
await b.close();
