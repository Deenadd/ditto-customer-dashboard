import type { CSSProperties } from "react";
import type { GlowConfig } from "./glow-config";
import { glowFeather, glowRamps } from "./glow-ramps";

export type GlowPosition = "bottom" | "top";
export type GlowTone = keyof typeof glowRamps;

/** Where the reference's solid colour ends and its soft edge begins (%). */
const SAMPLED_FEATHER_START = 67.2;

/**
 * The sign-in glow: a circle of light in the colours of the reference
 * (pinterest.com/pin/16747829862479363), sampled from its pixels. From the
 * core outward: deep blue #0471fa, cyan #00ccff, then a soft edge that
 * dissolves into the page.
 *
 * Its radius is min(radiusVh dvh, maxRadiusVw vw), so it stays a circle on
 * any screen. It rests at the bottom with its centre a little below the edge,
 * and for the code step travels up the screen to hang from the top edge. The
 * page content never moves; only the light does. The move is one CSS
 * transform transition, so a second change mid-way retargets smoothly. Red
 * and green keep every stop's lightness and chroma and change only the hue
 * (OKLCH); the three crossfade.
 *
 * Every number comes from GlowConfig, which the glow panel edits live.
 */
function rings(tone: GlowTone, featherStart: number) {
  const { stops, edge } = glowRamps[tone];
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(edge.slice(i, i + 2), 16));
  /* Softness moves the start of the soft edge; the colour bands scale with it. */
  const inner = featherStart / SAMPLED_FEATHER_START;
  const outer = (100 - featherStart) / (100 - SAMPLED_FEATHER_START);
  const solid = stops.map(([p, c]) => `${c} ${(p * inner).toFixed(2)}%`);
  const feather = glowFeather
    .filter(([p]) => p >= SAMPLED_FEATHER_START)
    .map(
      ([p, a]) =>
        `rgb(${r} ${g} ${b} / ${a}) ${(featherStart + (p - SAMPLED_FEATHER_START) * outer).toFixed(2)}%`,
    );
  return `radial-gradient(circle closest-side at 50% 50%, ${[...solid, ...feather].join(", ")})`;
}

const tones: GlowTone[] = ["blue", "red", "green"];

export function glowTransform(config: GlowConfig, position: GlowPosition) {
  return position === "bottom"
    ? `translate(-50%, -50%) translateX(${config.bottomX - 50}vw) translateY(calc(100dvh + ${config.bottomOffset} * var(--glow-r))) scale(${config.bottomScale})`
    : `translate(-50%, -50%) translateX(${config.topX - 50}vw) translateY(calc(${-config.topOffset} * var(--glow-r))) scale(${config.topScale})`;
}

export function SignInGradient({
  position,
  tone,
  config,
}: {
  position: GlowPosition;
  tone: GlowTone;
  config: GlowConfig;
}) {
  const curve = `cubic-bezier(${config.cubic.join(", ")})`;
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
      style={
        {
          "--glow-r": `min(${config.radiusVh}dvh, ${config.maxRadiusVw}vw)`,
          opacity: config.intensity,
        } as CSSProperties
      }
    >
      <div
        className="absolute top-0 left-1/2 aspect-square w-[calc(2*var(--glow-r))] will-change-transform"
        style={{
          transform: glowTransform(config, position),
          transition: `transform ${config.moveDuration}ms ${curve}`,
        }}
      >
        {tones.map((name) => (
          <div
            key={name}
            className="absolute inset-0"
            /* A true crossfade: a layer left underneath would show through the
               next one's soft edge as a fringe of the old colour. */
            style={{
              background: rings(name, config.featherStart),
              opacity: name === tone ? 1 : 0,
              transition: `opacity ${config.toneDuration}ms cubic-bezier(0.23, 1, 0.32, 1)`,
            }}
          />
        ))}
      </div>
    </div>
  );
}
