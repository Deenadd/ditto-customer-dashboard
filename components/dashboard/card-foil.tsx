"use client";

import type { CSSProperties } from "react";
import { useCardConfig } from "@/components/dashboard/card-config";

/*
 * A holographic foil finish for a card face, after the Holy Cards carousel
 * (ryoiki-tenkai): a diagonal lattice of dimples, a rainbow band that slides
 * as the card turns, coloured glitter and a glint where the light lands.
 * The reference is WebGL; this is the same finish in CSS layers.
 *
 * The cards are white, so the colour is MULTIPLIED in: a lightening blend
 * (screen, colour-dodge) has nothing to lighten on white and would vanish.
 * Dark text stays dark under multiply, so the facts stay readable.
 *
 * The light comes from the hover effect around the face, through three
 * custom properties: --foil-x and --foil-y (where the light is, as a
 * percentage) and --foil-lit (0 at rest, 1 while the card is touched).
 * Press lights the rim opposite the pointer; Glare lights the pointer.
 * Without them the foil rests, lit from the middle.
 *
 * Every layer blends with the card beneath it, so the wrapper must not
 * start a stacking context: no z-index, opacity or transform on it.
 */

/* Sparse bright specks: fractal noise, keeping only its brightest values
   as alpha. Tiled, and used as a mask over the rainbow. */
const glitter =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.45' numOctaves='1' seed='4'/%3E%3CfeColorMatrix values='0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 16 0 0 0 -10.6'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")";

const light = "var(--foil-x, 50%) var(--foil-y, 40%)";
/* Strongest where the light lands, never quite gone elsewhere. */
const pool = `radial-gradient(circle at ${light}, #000 0%, rgba(0,0,0,0.55) 30%, rgba(0,0,0,0.2) 75%)`;
/* Follows the hover effect's own settle in Glare; Press sets it to 0ms,
   since its spring already moves the light every frame. */
const follow = "opacity var(--g-dur, 300ms) ease-out, background-position var(--g-dur, 300ms) ease-out";

export function CardFoil() {
  const c = useCardConfig();
  if (c.foil <= 0) return null;

  /* How much shows: some at rest, all of it while touched. */
  const amount = (k: number) => `calc(${k} * (${c.foilRest} + ${1 - c.foilRest} * var(--foil-lit, 0)))`;
  const z = c.foilCover === "card" ? 5 : -5;
  const layer: CSSProperties = {
    position: "absolute",
    inset: 0,
    zIndex: z,
    borderRadius: "inherit",
    pointerEvents: "none",
    transition: follow,
  };

  /* The rainbow, pale enough to tint rather than paint. Band sets how many
     stripes cross the card; the tile is twice the card so the light can
     slide it a whole card's width. */
  const hues = [0, 40, 70, 150, 200, 250, 300, 360].map((h) => h + c.foilHue);
  const sat = Math.round(c.foilSaturation * 100);
  const period = Math.round(260 / c.foilBand);
  const band = (lightness: number, saturation: number) =>
    `repeating-linear-gradient(115deg, ${hues
      .map((h, i) => `hsl(${h} ${saturation}% ${lightness}%) ${Math.round((i / (hues.length - 1)) * period)}px`)
      .join(", ")})`;
  const rainbow = band(78, sat);
  /* The glitter's own rainbow, deeper and fuller, so a fleck stands out
     from the pale band it sits on. */
  const flecks = band(56, Math.min(100, sat + 30));

  /* Dimples on a diagonal lattice: two square grids, the second offset by
     half a cell, which reads as diagonal rows. Each dimple is a small cup:
     a dark rim on the side away from the light and a bright lip toward it.
     The rims multiply; the lips are white OVERLAID, which brightens the
     tinted foil but leaves white card white and dark text nearly as dark
     (a plain white layer would wash the text out under the light). */
  const s = c.foilScale;
  const e = c.emboss;
  const rim = `radial-gradient(circle at 50% 50%, rgba(30,40,80,0) 22%, rgba(30,40,80,${0.5 * e}) 32%, rgba(30,40,80,0) 44%)`;
  const lip = `radial-gradient(circle at 38% 38%, rgba(255,255,255,${e}) 0%, rgba(255,255,255,0) 20%)`;
  const lattice = (cup: string): CSSProperties => ({
    backgroundImage: `${cup}, ${cup}`,
    backgroundSize: `${s}px ${s}px`,
    backgroundPosition: `0 0, ${s / 2}px ${s / 2}px`,
    maskImage: pool,
    WebkitMaskImage: pool,
    opacity: amount(Math.min(1, c.foil * 1.6)),
  });

  return (
    <span aria-hidden className="pointer-events-none absolute inset-0 rounded-[inherit]">
      {c.foilTint.toLowerCase() !== "#ffffff" ? (
        <span style={{ ...layer, background: c.foilTint, mixBlendMode: "multiply", opacity: c.foil }} />
      ) : null}
      <span
        style={{
          ...layer,
          backgroundImage: rainbow,
          backgroundSize: "200% 200%",
          backgroundPosition: light,
          mixBlendMode: "multiply",
          opacity: amount(c.foil),
        }}
      />
      <span style={{ ...layer, ...lattice(rim), mixBlendMode: "multiply" }} />
      <span style={{ ...layer, ...lattice(lip), mixBlendMode: "overlay" }} />
      <span
        style={{
          ...layer,
          backgroundImage: flecks,
          backgroundSize: "200% 200%",
          backgroundPosition: light,
          maskImage: `${glitter}, ${pool}`,
          WebkitMaskImage: `${glitter}, ${pool}`,
          maskComposite: "intersect",
          opacity: amount(Math.min(1, c.sparkle * 2.4)),
        }}
      />
      {/* The glint, overlaid for the same reason as the lips: it lights the
          foil without lifting the text off the card. */}
      <span
        style={{
          ...layer,
          backgroundImage: `radial-gradient(circle at ${light}, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.35) 25%, rgba(255,255,255,0) 50%)`,
          mixBlendMode: "overlay",
          opacity: `calc(${Math.min(1, c.foil * 1.6)} * var(--foil-lit, 0))`,
        }}
      />
    </span>
  );
}
