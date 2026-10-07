import { chromium } from "playwright-core";
import { channel } from "../browser.mjs";
/* Claim questions: the Claiming on card stays at one spot on every question
   of every flow (v2, reimbursement, v1); questions move vertically, and the
   way they came when you go back. */
const base = process.argv[2] ?? "http://localhost:3123";
const b = await chromium.launch({ channel });
const errors = [];
for (const [tag, viewport, mobile] of [["d", { width: 1280, height: 900 }, false], ["m", { width: 390, height: 844 }, true]]) {
  const p = await (await b.newContext({ viewport, deviceScaleFactor: 2, hasTouch: mobile, isMobile: mobile })).newPage();
  p.on("pageerror", (e) => errors.push(e.message));
  p.on("console", (m) => m.type() === "error" && errors.push(m.text()));
  const ys = [];
  const at = async (label) => {
    await p.waitForTimeout(900);
    const y = await p.evaluate(() => {
      const label = [...document.querySelectorAll("p")].find((n) => n.textContent === "Claiming on");
      return Math.round((label.parentElement.parentElement.getBoundingClientRect().top + scrollY) * 10) / 10;
    });
    ys.push(`${label} ${y}`);
    return y;
  };
  /* Sample the question's movement just after a step changes. */
  const motion = async () => {
    const seen = [];
    for (let i = 0; i < 10; i++) {
      seen.push(await p.evaluate(() => {
        const h = document.querySelector("h1");
        const m = getComputedStyle(h.parentElement.parentElement).transform;
        return m === "none" ? "none" : m.split(",").slice(4).map((v) => Math.round(parseFloat(v))).join("/");
      }));
      await p.waitForTimeout(35);
    }
    return [...new Set(seen)].join(" ");
  };
  await p.goto(base + "/dashboard/policies/474-981-34EDH20/claims/new"); await p.waitForTimeout(800);
  await at("v2-type");
  await p.getByRole("button", { name: /Cashless/ }).click();
  console.log(tag, "forward (x/y):", await motion());
  await at("v2-patient");
  await p.getByLabel(/Kavya Raghavan/).check({ force: true });
  await p.getByRole("button", { name: "Continue" }).click();
  await at("v2-treatment");
  await p.getByRole("button", { name: "Back" }).click();
  console.log(tag, "back (x/y):", await motion());
  await at("v2-patient-again");
  await p.getByRole("button", { name: "Back" }).click();
  await at("v2-type-again");
  await p.getByRole("button", { name: /Reimbursement/ }).click();
  console.log(tag, "into reimbursement (x/y):", await motion());
  await at("reimb-category");
  await p.getByRole("button", { name: "Back" }).click();
  await at("v2-type-from-reimb");
  await p.getByRole("button", { name: /v1 · Hospital first/ }).click();
  await at("v1-hospital");
  await p.getByLabel(/T\. Nagar Family Hospital/).check({ force: true });
  await p.getByRole("button", { name: "Continue" }).click();
  await at("v1-type");
  const values = ys.map((v) => Number(v.split(" ")[1]));
  const still = Math.max(...values) - Math.min(...values) < 0.6;
  console.log(tag, still ? "card still on every question:" : "CARD MOVED:", ys.join(" · "));
  if (!still) errors.push(`${tag}: the Claiming on card moved`);
  await p.getByRole("button", { name: /v2 · Claim type first/ }).count();
}
console.log("errors:", errors.length ? errors : "none");
await b.close();
