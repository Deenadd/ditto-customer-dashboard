import { chromium } from "playwright-core";
import { channel } from "../browser.mjs";
/* Home card v2: the renewal strip at each stage, desktop and phone; the rest
   of the card opens the policy. */
const base = process.argv[2] ?? "http://localhost:3123";
const b = await chromium.launch({ channel });
const errors = [];
/* The prototype's switches live in the account menu (the avatar). */
/* A row's name starts with its label; its hint, if any, follows. */
const row = (p, item) => p.getByRole("menuitemradio", { name: new RegExp(`^${item.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`) });
const choose = async (p, item) => {
  await p.getByRole("button", { name: /^Account,/ }).click();
  await row(p, item).click();
  await p.waitForTimeout(400);
};
const checked = async (p, item) => {
  await p.getByRole("button", { name: /^Account,/ }).click();
  const value = await row(p, item).getAttribute("aria-checked");
  await p.keyboard.press("Escape");
  return value;
};
for (const [tag, viewport, mobile] of [["d", { width: 1280, height: 900 }, false], ["m", { width: 390, height: 844 }, true]]) {
  const p = await (await b.newContext({ viewport, deviceScaleFactor: 2, hasTouch: mobile, isMobile: mobile })).newPage();
  p.on("pageerror", (e) => errors.push(e.message));
  p.on("console", (m) => m.type() === "error" && errors.push(m.text()));
  await p.goto(base + "/dashboard"); await p.waitForTimeout(1200);
  console.log(tag, "on-page switch gone:", (await p.getByRole("group", { name: "Home card" }).count()) === 0, "| v1 strips:", await p.getByRole("link", { name: /^Renew / }).count());
  await p.getByRole("button", { name: /^Account,/ }).click();
  console.log(tag, "stages hidden in v1:", (await p.getByRole("menuitemradio", { name: "Overdue" }).count()) === 0);
  await p.keyboard.press("Escape");
  await choose(p, "v2 · Renewal due");
  const renew = p.getByRole("link", { name: /^Renew / });
  console.log(tag, "v2 strips:", await renew.count(), "| titles:", (await p.locator("article p.font-semibold").allInnerTexts()).filter((t) => /Renew/.test(t)).join(" / "));
  for (const label of ["In 18 days", "In 5 days", "Today", "Overdue"]) {
    await choose(p, label);
    const card = p.getByRole("article", { name: "Your Health complete", exact: true });
    console.log(tag, label, "→", (await card.locator("p.font-semibold").first().innerText()), "|", await card.locator("p.truncate.text-label-secondary").innerText());
    if (label === "In 18 days" || label === "Overdue") await card.screenshot({ path: `out-bc/renewal-${tag}-${label.replace(/ /g, "")}.png` });
  }
  await p.reload(); await p.waitForTimeout(1000);
  console.log(tag, "remembered:", await renew.count(), await checked(p, "Overdue"));
  // Renew sits above the card's own link
  const box = await renew.first().boundingBox();
  const hit = await p.evaluate(([x, y]) => document.elementFromPoint(x, y)?.closest("a")?.textContent, [box.x + box.width / 2, box.y + box.height / 2]);
  console.log(tag, "tap lands on:", hit, "| href:", await renew.first().getAttribute("href"));
  const over = await p.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  console.log(tag, "overflow:", over);
  await p.screenshot({ path: `out-bc/renewal-${tag}-page.png`, fullPage: false });
  await choose(p, "In 18 days");
  // the rest of the card still opens the policy
  const spot = p.getByRole("article", { name: "Your Health complete", exact: true }).getByText("Policy number");
  await spot.evaluate((n) => n.scrollIntoView({ block: "center" })); await p.waitForTimeout(300); const at = await spot.boundingBox();
  await p.mouse.click(at.x + 10, at.y + at.height / 2);
  await p.waitForURL("**/policies/**"); console.log(tag, "card opens:", new URL(p.url()).pathname);
  await p.goBack(); await p.waitForTimeout(800);
  /* The menu is on the policy page too, and the card there follows. */
  await p.goto(base + "/dashboard/policies/474-981-34EDH20"); await p.waitForTimeout(1000);
  await choose(p, "Today");
  console.log(tag, "policy page:", await p.getByRole("article", { name: "Your Health complete", exact: true }).locator("p.font-semibold").first().innerText());
  await choose(p, "In 18 days");
  await choose(p, "v1 · Standard");
  console.log(tag, "back to v1:", await p.getByRole("link", { name: /^Renew / }).count());
}
console.log("errors:", errors.length ? errors : "none");
await b.close();
