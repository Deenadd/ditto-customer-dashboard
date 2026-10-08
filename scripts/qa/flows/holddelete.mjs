import { chromium } from "playwright-core";
import { channel } from "../browser.mjs";
/* Deleting a claim: a plain row (no card) with the action on the right; the
   confirmation's Delete is press and hold. Letting go early keeps the claim
   and says to keep holding; a full hold deletes; so does holding Space. */
const base = process.argv[2] ?? "http://localhost:3123";
const b = await chromium.launch({ channel });
const errors = [];
const claim = { id: "CL9001", policyId: "474-981-34EDH20", type: "cashless", patient: { name: "Kavya Raghavan", relation: "Wife", age: 33 }, category: "hospitalisation", treatment: "Knee surgery", stage: "planning", admission: null, hospital: { name: "Lakeview Hospital", address: "Velachery, Chennai", network: true }, createdAt: new Date().toISOString() };
for (const [tag, viewport, mobile] of [["d", { width: 1280, height: 900 }, false], ["m", { width: 390, height: 844 }, true]]) {
  const ctx = await b.newContext({ viewport, deviceScaleFactor: 2, hasTouch: mobile, isMobile: mobile });
  const p = await ctx.newPage();
  p.on("pageerror", (e) => errors.push(e.message));
  p.on("console", (m) => m.type() === "error" && errors.push(m.text()));
  /* A claim to delete, made through the real flow's storage. */
  await p.goto(base + "/dashboard/policies/474-981-34EDH20/claims/new"); await p.waitForTimeout(800);
  const key = "ditto.claims.v2";
  await p.evaluate(([k, c]) => { const all = JSON.parse(localStorage.getItem(k) ?? "[]"); localStorage.setItem(k, JSON.stringify([...(Array.isArray(all) ? all : []), c])); }, [key, claim]);
  await p.goto(base + `/dashboard/policies/474-981-34EDH20/claims/${claim.id}`); await p.waitForTimeout(1200);
  const row = p.getByRole("region", { name: "Delete claim" });
  const look = await row.evaluate((n) => { const s = getComputedStyle(n); const btn = n.querySelector("button").getBoundingClientRect(); const txt = n.querySelector("p").getBoundingClientRect(); return { shadow: s.boxShadow, bg: s.backgroundColor, buttonRight: btn.left > txt.left }; });
  console.log(tag, "row:", look.shadow === "none" && look.bg === "rgba(0, 0, 0, 0)" ? "no card" : "CARD", "| button on the right:", look.buttonRight);
  await row.getByRole("button", { name: /Delete claim/ }).click(); await p.waitForTimeout(400);
  const dlg = p.getByRole("dialog");
  console.log(tag, "focus starts on:", await p.evaluate(() => document.activeElement?.textContent?.trim()));
  const del = dlg.getByRole("button", { name: "Delete claim" });
  /* Let go at about half way. */
  const box = await del.boundingBox();
  await p.mouse.move(box.x + box.width / 2, box.y + box.height / 2); await p.mouse.down(); await p.waitForTimeout(500);
  const mid = await del.evaluate((n) => getComputedStyle(n.lastElementChild).clipPath);
  await p.waitForTimeout(500); await p.mouse.up(); await p.waitForTimeout(400);
  console.log(tag, "filling:", mid, "| early release keeps it:", new URL(p.url()).pathname.endsWith(claim.id), "| hint:", await dlg.getByRole("status").innerText());
  if (tag === "d") {
    /* The keyboard: hold Space. */
    await del.focus(); await p.keyboard.down(" "); await p.waitForTimeout(2300); await p.keyboard.up(" ");
  } else {
    await p.mouse.move(box.x + box.width / 2, box.y + box.height / 2); await p.mouse.down(); await p.waitForTimeout(2300); await p.mouse.up();
  }
  await p.waitForURL("**/claims?deleted=*", { timeout: 5000 });
  console.log(tag, "full hold deletes:", new URL(p.url()).search);
  await ctx.close();
}
console.log("errors:", errors.length ? errors : "none");
await b.close();
