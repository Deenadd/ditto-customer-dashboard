import { chromium } from "playwright-core";
const base = process.argv[2] ?? "http://localhost:3123";
const b = await chromium.launch({ channel: "chrome" });
const errors = [];
for (const [tag, opts] of [["d", { viewport: { width: 1586, height: 1030 }, deviceScaleFactor: 2 }], ["m", { viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, hasTouch: true, isMobile: true }]]) {
  const p = await (await b.newContext(opts)).newPage();
  p.on("pageerror", (e) => errors.push(e.message)); p.on("console", (m) => m.type() === "error" && errors.push(m.text()));
  await p.goto(base + "/dashboard/policies/474-981-34EDH20"); await p.waitForTimeout(1500);
  await p.getByRole("button", { name: /Which kind of claim/ }).click(); await p.waitForTimeout(2200);
  const d = p.getByRole("dialog");
  await d.getByRole("button", { name: "It's planned" }).click(); await p.waitForTimeout(2200);
  await d.getByRole("button", { name: "I'm not sure" }).click(); await p.waitForTimeout(2500);
  await d.getByRole("button", { name: /T\. Nagar Family/ }).click(); await p.waitForTimeout(600);
  const cardBox = await d.locator("section[aria-labelledby]").last().boundingBox();
  const cta = d.getByRole("button", { name: /^Continue with/ });
  const cb = await cta.boundingBox();
  console.log(tag, "not network CTA:", await cta.innerText(), "| below card:", Math.round(cb.y - (cardBox.y + cardBox.height)), "| left aligned:", Math.round(cb.x - cardBox.x));
  await p.screenshot({ path: `out-bc/cta-${tag}-re.png` });
  await d.getByRole("button", { name: /Lakeview Hospital/ }).click(); await p.waitForTimeout(500);
  console.log(tag, "network CTA:", await d.getByRole("button", { name: /^Continue with/ }).innerText());
  await p.screenshot({ path: `out-bc/cta-${tag}-cl.png` });
  await d.getByRole("button", { name: /^Continue with/ }).click(); await p.waitForTimeout(2200);
  console.log(tag, "after:", (await d.getByRole("log").innerText()).split("\n").filter(Boolean).slice(-2).join(" | "), "| CTA gone:", await d.getByRole("button", { name: /^Continue with/ }).count() === 0);
}
console.log("errors:", errors.length ? errors : "none");
await b.close();
