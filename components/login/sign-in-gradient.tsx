import type { CSSProperties } from "react";
import { glowFeather, glowRamps } from "./glow-ramps";

export type GlowPosition = "bottom" | "top";
export type GlowTone = keyof typeof glowRamps;

/**
 * The sign-in glow: a circle of light rising from the bottom of the screen,
 * in the colours of the reference (pinterest.com/pin/16747829862479363),
 * sampled from its pixels. From the core outward: deep blue #0471fa, cyan
 * #00ccff, then a soft edge that dissolves into the page.
 *
 * Its radius is min(59dvh, 100vw), so it stays a circle on any screen: on a
 * wide screen it meets the bottom edge well inside the corners, and on a
 * phone it spans the width. Its centre sits a little below the edge, so the
 * soft edge begins just under the sign-in form.
 *
 * Moving to the top is a single transform: the circle travels up the screen
 * and hangs from the top edge, smaller, for the code step. The page content
 * never moves; only the light does. At the top it's sized so the logo sits in
 * the cyan and the heading on its soft edge, where dark text stays legible.
 * It's a CSS transition on the sheet's easing curve, so a second change
 * mid-way retargets smoothly. Red and green keep every stop's lightness and
 * chroma and change only the hue (OKLCH); the three crossfade.
 */
function rings(tone: GlowTone) {
  const { stops, edge } = glowRamps[tone];
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(edge.slice(i, i + 2), 16));
  const solid = stops.map(([p, c]) => `${c} ${p}%`);
  const feather = glowFeather
    .filter(([p]) => p > stops[stops.length - 1][0])
    .map(([p, a]) => `rgb(${r} ${g} ${b} / ${a}) ${p}%`);
  return `radial-gradient(circle closest-side at 50% 50%, ${[...solid, ...feather].join(", ")})`;
}

const tones: GlowTone[] = ["blue", "red", "green"];

export function SignInGradient({ position, tone }: { position: GlowPosition; tone: GlowTone }) {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
      style={{ "--glow-r": "min(59dvh, 100vw)" } as CSSProperties}
    >
      <div
        data-position={position}
        className="absolute top-0 left-1/2 aspect-square w-[calc(2*var(--glow-r))] transition-transform duration-1000 ease-[cubic-bezier(0.32,0.72,0,1)] will-change-transform data-[position=bottom]:[transform:translate(-50%,-50%)_translateY(calc(100dvh+0.12*var(--glow-r)))] data-[position=top]:[transform:translate(-50%,-50%)_translateY(calc(-0.06*var(--glow-r)))_scale(0.56)]"
      >
        {tones.map((name) => (
          <div
            key={name}
            className="absolute inset-0 transition-opacity duration-500 ease-[cubic-bezier(0.23,1,0.32,1)]"
            /* A true crossfade: a layer left underneath would show through the
               next one's soft edge as a fringe of the old colour. */
            style={{ background: rings(name), opacity: name === tone ? 1 : 0 }}
          />
        ))}
      </div>
    </div>
  );
}
