import { chromium } from "playwright-core";
/* Home card v2: the renewal strip at each stage, desktop and phone; the rest
   of the card opens the policy on a desktop and turns it over on a phone. */
const base = process.argv[2] ?? "http://localhost:3123";
const b = await chromium.launch({ channel: "chrome" });
const errors = [];
for (const [tag, viewport, mobile] of [["d", { width: 1280, height: 900 }, false], ["m", { width: 390, height: 844 }, true]]) {
  const p = await (await b.newContext({ viewport, deviceScaleFactor: 2, hasTouch: mobile, isMobile: mobile })).newPage();
  p.on("pageerror", (e) => errors.push(e.message));
  p.on("console", (m) => m.type() === "error" && errors.push(m.text()));
  await p.goto(base + "/dashboard"); await p.waitForTimeout(1200);
  const group = p.getByRole("group", { name: "Home card" });
  console.log(tag, "v1 strips:", await p.getByRole("link", { name: /^Renew / }).count());
  await group.getByRole("button", { name: /v2/ }).click(); await p.waitForTimeout(400);
  const renew = p.getByRole("link", { name: /^Renew / });
  console.log(tag, "v2 strips:", await renew.count(), "| titles:", (await p.locator("article p.font-semibold").allInnerTexts()).filter((t) => /Renew/.test(t)).join(" / "));
  const stages = p.getByRole("group", { name: /renews in/ });
  for (const label of ["18 days", "5 days", "Today", "Overdue"]) {
    await stages.getByRole("button", { name: label }).click(); await p.waitForTimeout(300);
    const card = p.getByRole("article", { name: "Your Health complete", exact: true });
    console.log(tag, label, "→", (await card.locator("p.font-semibold").first().innerText()), "|", await card.locator("p.truncate.text-label-secondary").innerText());
    if (label === "18 days" || label === "Overdue") await card.screenshot({ path: `out-bc/renewal-${tag}-${label.replace(" ", "")}.png` });
  }
  await p.reload(); await p.waitForTimeout(1000);
  console.log(tag, "remembered:", await renew.count(), await stages.getByRole("button", { name: "Overdue" }).getAttribute("aria-pressed"));
  // Renew sits above the card's own link
  const box = await renew.first().boundingBox();
  const hit = await p.evaluate(([x, y]) => document.elementFromPoint(x, y)?.closest("a")?.textContent, [box.x + box.width / 2, box.y + box.height / 2]);
  console.log(tag, "tap lands on:", hit, "| href:", await renew.first().getAttribute("href"));
  const over = await p.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  console.log(tag, "overflow:", over);
  await p.screenshot({ path: `out-bc/renewal-${tag}-page.png`, fullPage: false });
  await stages.getByRole("button", { name: "18 days" }).click();
  // the rest of the card still opens the policy
  const spot = p.getByRole("article", { name: "Your Health complete", exact: true }).getByText("Policy number");
  await spot.scrollIntoViewIfNeeded(); const at = await spot.boundingBox();
  await p.mouse.click(at.x + 10, at.y + at.height / 2);
  if (mobile) {
    /* On a phone a tap turns the card over instead. */
    await p.waitForTimeout(800);
    console.log(tag, "card turns:", await p.getByRole("button", { name: /Show the policy details/ }).first().getAttribute("aria-pressed"));
    await p.getByRole("button", { name: /Show the policy details/ }).first().tap(); await p.waitForTimeout(800);
  } else {
    await p.waitForURL("**/policies/**"); console.log(tag, "card opens:", new URL(p.url()).pathname);
    await p.goBack(); await p.waitForTimeout(800);
  }
  await p.getByRole("group", { name: "Home card" }).getByRole("button", { name: /v1/ }).click();
}
console.log("errors:", errors.length ? errors : "none");
await b.close();
