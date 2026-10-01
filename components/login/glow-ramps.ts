/**
 * Colour for the sign-in wash. The blue stops live in GlowConfig, so the glow
 * panel can change, add and move them; red and green are made from whatever
 * blue is set, here.
 *
 * Red and green keep each stop's OKLCH lightness and chroma and change only
 * the hue (red = 25 + (259 − h) × 0.12, green = 147 + (259 − h) × 0.35),
 * lowering chroma where a stop would leave sRGB. Near-greys stay as they are,
 * so white stays white.
 */
export type GlowTone = "blue" | "red" | "green";
export type GlowStop = { color: string; at: number };

/* The reference's vectorised gradient (Fuse onboarding: a 1179 × 1817 trace
   under a 126px blur), mirrored so its deep end hangs from the top. */
export const referenceCore: GlowStop[] = [
  { color: "#3063db", at: 0 },
  { color: "#3269db", at: 20 },
  { color: "#3f8ae4", at: 38 },
  { color: "#4497e4", at: 54 },
  { color: "#4ea1e8", at: 68 },
];

export const referenceBase: GlowStop[] = [
  { color: "#65c9f1", at: 0 },
  { color: "#62c2f5", at: 24 },
  { color: "#60c3f1", at: 44 },
  { color: "#c0e6f9", at: 64 },
  { color: "#f2f9fc", at: 80 },
  { color: "#ffffff", at: 94 },
];

const toLinear = (c: number) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
const toGamma = (c: number) => (c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055);

function hexToOklch(hex: string): [number, number, number] {
  const [r, g, b] = [1, 3, 5].map((i) => toLinear(parseInt(hex.slice(i, i + 2), 16) / 255));
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  const L = 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s;
  const A = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s;
  const B = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s;
  return [L, Math.hypot(A, B), ((Math.atan2(B, A) * 180) / Math.PI + 360) % 360];
}

function oklchToRgb(L: number, C: number, H: number) {
  const a = C * Math.cos((H * Math.PI) / 180);
  const b = C * Math.sin((H * Math.PI) / 180);
  const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3;
  return [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  ].map(toGamma);
}

function oklchToHex(L: number, C: number, H: number) {
  let chroma = C;
  let rgb = oklchToRgb(L, chroma, H);
  while (rgb.some((v) => v < -1e-4 || v > 1 + 1e-4) && chroma > 1e-3) {
    chroma *= 0.97;
    rgb = oklchToRgb(L, chroma, H);
  }
  return `#${rgb.map((v) => Math.round(Math.min(1, Math.max(0, v)) * 255).toString(16).padStart(2, "0")).join("")}`;
}

const hues: Record<Exclude<GlowTone, "blue">, (h: number) => number> = {
  red: (h) => 25 + (259 - h) * 0.12,
  green: (h) => 147 + (259 - h) * 0.35,
};

/** A blue colour in the given tone. */
export function inTone(hex: string, tone: GlowTone) {
  if (tone === "blue") return hex;
  const [L, C, H] = hexToOklch(hex);
  return C < 0.01 ? hex : oklchToHex(L, C, hues[tone](H));
}
