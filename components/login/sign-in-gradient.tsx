"use client";

import { motion, useReducedMotion } from "motion/react";
import { buildSheetTransition, defaultSideSheetConfig } from "@/components/ui/frosted-side-sheet/config";
import { glowFeather, glowRamps } from "./glow-ramps";

export type GlowPosition = "bottom" | "top";
export type GlowTone = keyof typeof glowRamps;

/**
 * The sign-in glow, rebuilt from the reference (pinterest.com/pin/16747829862479363).
 * The colours were sampled from the reference down its full height: white
 * until about 42%, a soft domed edge into cyan #00ccff, then deepening to
 * #0471fa at the edge of the screen. The rebuild matches it to within about
 * 3% per channel.
 *
 * It's one lens-shaped glow, twice as tall as its reach, centred on an edge
 * of the screen so only half of it shows. The colour bands are flat across
 * the width and only the soft edge is domed, as in the reference. Moving
 * between the bottom and the top is a single translate, so the light
 * travels up the screen and settles, mirrored, at the top.
 *
 * The red and green versions keep every stop's lightness and chroma and
 * change only the hue (OKLCH), so they carry the same light and depth.
 */
function colourBands(tone: GlowTone) {
  const { stops, edge } = glowRamps[tone];
  const ramp = [...stops, [100, edge] as [number, string]];
  const top = [...ramp].reverse().map(([p, c]) => `${c} ${(50 - p / 2).toFixed(2)}%`);
  const bottom = ramp.map(([p, c]) => `${c} ${(50 + p / 2).toFixed(2)}%`);
  return `linear-gradient(to bottom, ${[...top, ...bottom].join(", ")})`;
}

const feather = `radial-gradient(closest-side ellipse at 50% 50%, ${glowFeather
  .map(([p, a]) => `rgb(0 0 0 / ${a}) ${p}%`)
  .join(", ")})`;

const tones: GlowTone[] = ["blue", "red", "green"];

export function SignInGradient({ position, tone }: { position: GlowPosition; tone: GlowTone }) {
  const reduced = useReducedMotion();
  /* The same spring as the frosted side sheet, so both surfaces move alike. */
  const travel = reduced ? { duration: 0 } : buildSheetTransition(defaultSideSheetConfig, "in");

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <motion.div
        className="absolute top-0 left-1/2 h-[116dvh] w-[250vw] will-change-transform"
        style={{ maskImage: feather, WebkitMaskImage: feather }}
        initial={false}
        animate={{
          transform:
            position === "bottom"
              ? "translate(-50%, -50%) translateY(100dvh) scale(1)"
              : "translate(-50%, -50%) translateY(0dvh) scale(0.72)",
        }}
        transition={travel}
      >
        {tones.map((name) => (
          <motion.div
            key={name}
            className="absolute inset-0"
            style={{ background: colourBands(name) }}
            initial={false}
            /* Blue is the base; red and green fade in over it. */
            animate={{ opacity: name === "blue" || name === tone ? 1 : 0 }}
            transition={{ duration: reduced ? 0.12 : 0.48, ease: [0.22, 1, 0.36, 1] }}
          />
        ))}
      </motion.div>
    </div>
  );
}
