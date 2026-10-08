import { chromium } from "playwright-core";
import { channel } from "../browser.mjs";
/* The visit log in the controls panel (Shift+Option+C on the home page).
   Not connected: the panel says so and nothing is sent. Connected (Upstash,
   or scripts/qa/fake-upstash.mjs locally): each new browser is a new User,
   a new session of the same browser is a new visit by the same User, and
   more pages in one session add nothing. Automated browsers only count
   when they opt in (ditto.visits.test), so other checks never add visits. */
const base = process.argv[2] ?? "http://localhost:3123";
const b = await chromium.launch({ channel });
const errors = [];
const watch = (p) => {
  p.on("pageerror", (e) => errors.push(e.message));
  p.on("console", (m) => m.type() === "error" && !/api\/visits/.test(m.location()?.url ?? "") && !/503/.test(m.text()) && errors.push(m.text()));
};
const status = await (await fetch(base + "/api/visits")).json();
console.log("connected:", status.connected);
const panel = async (p) => {
  await p.keyboard.press("Shift+Alt+KeyC"); await p.waitForTimeout(1200);
  const box = p.getByRole("dialog", { name: "Controls" });
  return box.getByRole("region", { name: "Visitors" }).innerText();
};

/* An automated browser that hasn't opted in sends nothing. */
const quiet = await b.newContext();
const q = await quiet.newPage(); watch(q);
let posts = 0;
q.on("request", (r) => r.url().endsWith("/api/visits") && r.method() === "POST" && posts++);
await q.goto(base + "/dashboard"); await q.waitForTimeout(800);
console.log("automated, not opted in, posts:", posts);
await quiet.close();

if (!status.connected) {
  const c = await b.newContext({ viewport: { width: 1280, height: 900 } });
  const p = await c.newPage(); watch(p);
  await p.goto(base + "/dashboard"); await p.waitForTimeout(1000);
  console.log("panel:", (await panel(p)).replace(/\n/g, " | "));
  await c.close();
} else {
  const before = status.total;
  const visit = async (opts, path, state) => {
    const c = await b.newContext({ ...opts, storageState: state });
    await c.addInitScript(() => localStorage.setItem("ditto.visits.test", "1"));
    const p = await c.newPage(); watch(p);
    await p.goto(base + path); await p.waitForTimeout(900);
    return { c, p };
  };
  /* A desktop visit, then a second page in the same session. */
  const one = await visit({ viewport: { width: 1280, height: 900 } }, "/dashboard");
  await one.p.goto(base + "/dashboard/policies/474-981-34EDH20"); await one.p.waitForTimeout(700);
  const saved = await one.c.storageState();
  /* A phone, a new person. */
  const two = await visit({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true }, "/");
  await two.c.close();
  /* The first browser again, in a new session: same User, new visit. */
  const again = await visit({ viewport: { width: 1280, height: 900 } }, "/dashboard", { ...saved, origins: saved.origins });
  await one.c.close();
  const after = await (await fetch(base + "/api/visits")).json();
  const latest = after.visits.slice(0, 3).map((v) => `User ${v.user} ${v.device} ${v.page}`);
  console.log("new visits:", after.total - before, "|", latest.join(" ; "));
  const [third, second, first] = after.visits;
  console.log("same browser keeps its number:", third.user === first.user, "| phone is someone new:", second.user !== first.user);
  const text = await panel(again.p);
  console.log("panel:", text.split("\n").slice(0, 8).join(" | "));
  await again.p.screenshot({ path: "out-bc/visits-panel.png" });
  await again.c.close();
}
console.log("errors:", errors.length ? errors : "none");
await b.close();
