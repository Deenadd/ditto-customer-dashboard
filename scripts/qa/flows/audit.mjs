import { chromium } from "playwright-core";
const base = process.argv[2] ?? "http://localhost:3123";
const b = await chromium.launch({ channel: "chrome" });
const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, hasTouch: true, isMobile: true });
const p = await ctx.newPage();
const errors = [];
p.on("pageerror", (e) => errors.push(e.message));
p.on("console", (m) => m.type() === "error" && errors.push(m.text()));

const audit = (label) => p.evaluate((label) => {
  const W = innerWidth;
  const vis = (el) => { const r = el.getBoundingClientRect(); const s = getComputedStyle(el); return r.width > 0 && r.height > 0 && s.visibility !== "hidden" && s.display !== "none" && !el.closest("[aria-hidden=true],[inert]"); };
  const name = (el) => (el.getAttribute("aria-label") || el.innerText || el.value || el.name || el.tagName).trim().replace(/\s+/g, " ").slice(0, 40);
  const out = { label, overflow: document.documentElement.scrollWidth - W };
  // elements sticking out the right edge, not inside a clipping/scrolling ancestor
  const clipped = (el) => { for (let a = el.parentElement; a && a !== document.body; a = a.parentElement) { const s = getComputedStyle(a); if (/(hidden|auto|scroll|clip)/.test(s.overflowX)) return true; } return false; };
  out.wide = [...document.querySelectorAll("body *")].filter((el) => vis(el) && el.getBoundingClientRect().right > W + 1 && !clipped(el)).slice(0, 6).map((el) => `${el.tagName}.${(el.className?.baseVal ?? el.className ?? "").toString().slice(0, 50)} r=${el.getBoundingClientRect().right | 0}`);
  out.small = [...document.querySelectorAll("a[href],button,input:not([type=hidden]),select,textarea,[role=button],[role=tab],[role=radio],[role=checkbox],summary")]
    .filter(vis).map((el) => { const r = el.getBoundingClientRect(); let w = r.width, h = r.height;
      for (const pe of ["::after", "::before"]) { const s = getComputedStyle(el, pe); if (s.content !== "none" && s.position === "absolute") { w = Math.max(w, r.width - parseFloat(s.left) - parseFloat(s.right)); h = Math.max(h, r.height - parseFloat(s.top) - parseFloat(s.bottom)); } }
      return { el, w, h }; })
    .filter(({ el, w, h }) => !(el.matches("input[type=radio],input[type=checkbox]") && el.closest("label")) && (w < 40 || h < 40))
    .map(({ el, w, h }) => `${name(el)} ${w | 0}x${h | 0}`);
  out.inputs = [...document.querySelectorAll("input,textarea,select")].filter(vis).filter((el) => parseFloat(getComputedStyle(el).fontSize) < 16).map((el) => `${name(el)} ${getComputedStyle(el).fontSize}`);
  out.tiny = [...new Set([...document.querySelectorAll("body *")].filter((el) => vis(el) && el.childNodes.length && [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim())).filter((el) => parseFloat(getComputedStyle(el).fontSize) < 12).map((el) => `${getComputedStyle(el).fontSize} "${el.textContent.trim().slice(0, 25)}"`))].slice(0, 8);
  out.noTouchAction = [...document.querySelectorAll("button,a[href]")].filter(vis).filter((el) => !["manipulation", "none", "pan-y", "pan-x"].includes(getComputedStyle(el).touchAction)).length;
  out.selectable = [...document.querySelectorAll("button,[role=tab]")].filter(vis).filter((el) => getComputedStyle(el).userSelect !== "none" && getComputedStyle(el).webkitUserSelect !== "none").length;
  return out;
}, label);

const report = (r) => {
  console.log(`\n## ${r.label}  overflow=${r.overflow}px  buttons/links without touch-action=${r.noTouchAction}  selectable buttons=${r.selectable}`);
  if (r.wide.length) console.log("  wide:", r.wide.join(" ; "));
  if (r.small.length) console.log("  small targets:", r.small.join(" ; "));
  if (r.inputs.length) console.log("  inputs <16px:", r.inputs.join(" ; "));
  if (r.tiny.length) console.log("  text <12px:", r.tiny.join(" ; "));
};
const go = async (path, label) => { await p.goto(base + path); await p.waitForTimeout(1200); report(await audit(label)); await p.screenshot({ path: `out-m/${label}.png`, fullPage: true }); };

await go("/", "signin");
await go("/dashboard", "home");
const pol = "/dashboard/policies/474-981-34EDH20";
await go(pol, "policy");
await go(pol + "/claims", "claims");
const claimHref = await p.locator("a[href*='/claims/']:not([href$='/new'])").first().getAttribute("href").catch(() => null);
if (claimHref) await go(claimHref, "claim");
await go(pol + "/claims/new", "newclaim");
// sheets
await p.goto(base + "/dashboard"); await p.waitForTimeout(1000);
await p.getByRole("button", { name: /Ask Ditto Buddy/ }).click().catch((e) => console.log("buddy:", e.message.slice(0, 80)));
await p.waitForTimeout(900);
report(await audit("buddy-sheet")); await p.screenshot({ path: "out-m/buddy-sheet.png" });
await p.keyboard.press("Escape"); await p.waitForTimeout(600);
await p.getByRole("button", { name: /Chat now/ }).click().catch((e) => console.log("chat:", e.message.slice(0, 80)));
await p.waitForTimeout(900);
report(await audit("chat-sheet")); await p.screenshot({ path: "out-m/chat-sheet.png" });
// stylesheets: ungated :hover, 100vh
const css = await p.evaluate(() => {
  const hov = []; let vh = 0;
  const walk = (rules, gated) => { for (const r of rules) { if (r.media) walk(r.cssRules, gated || /hover:\s*hover/.test(r.media.mediaText)); else if (r.cssRules && !r.selectorText) walk(r.cssRules, gated); else if (r.selectorText) { if (r.selectorText.includes(":hover") && !gated) hov.push(r.selectorText.slice(0, 70)); if (/100vh/.test(r.cssText)) vh++; } } };
  for (const s of document.styleSheets) try { walk(s.cssRules, false); } catch {}
  return { hov, vh };
});
console.log("\nungated :hover rules:", css.hov.length, css.hov.slice(0, 10)); console.log("100vh rules:", css.vh);
console.log("errors:", errors.length ? errors : "none");
await b.close();
