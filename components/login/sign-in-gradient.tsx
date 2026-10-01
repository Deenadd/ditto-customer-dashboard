import type { CSSProperties } from "react";
import type { GlowConfig } from "./glow-config";
import { glowRamps } from "./glow-ramps";

export type GlowTone = keyof typeof glowRamps;

const tones: GlowTone[] = ["blue", "red", "green"];

const hexToRgb = (hex: string) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16)).join(" ");

/**
 * The sign-in wash: the reference's gradient (see glow-ramps.ts), hanging
 * from the top of the screen. A deep blue dome sits in a cyan band, which
 * pales through sky into the page. It stays put for the whole flow; red and
 * green crossfade over the blue for a wrong or right code.
 *
 * The dome is an ellipse from the top centre, `coreWidth` wide and
 * `coreDepth` deep (% of the wash). Its rim fades to transparent in its own
 * colour, so it melts into the cyan without a grey seam. The wash's lower
 * edge fades through a mask that bows down in the middle by `curve`.
 *
 * Every number comes from GlowConfig, which the glow panel edits live.
 */
function layers(tone: GlowTone, config: GlowConfig) {
  const { core, base } = glowRamps[tone];
  const rim = core[core.length - 1][1];
  const dome = `radial-gradient(ellipse ${config.coreWidth}% ${config.coreDepth}% at 50% 0%, ${core
    .map(([p, c]) => `${c} ${p}%`)
    .join(", ")}, rgb(${hexToRgb(rim)} / 0) 100%)`;
  const band = `linear-gradient(to bottom, ${base.map(([p, c]) => `${c} ${p}%`).join(", ")})`;
  return `${dome}, ${band}`;
}

/** Ellipse width for the lower fade: 0 is near flat (400%), 1 bows deeply (60%). */
const edgeWidth = (curve: number) => 400 - curve * 340;

export function SignInGradient({ tone, config }: { tone: GlowTone; config: GlowConfig }) {
  const mask = `radial-gradient(ellipse ${edgeWidth(config.curve)}% 100% at 50% 0%, #000 ${100 - config.softness}%, transparent 100%)`;
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-x-0 top-0 -z-10"
      style={
        {
          height: `${config.heightVh}dvh`,
          opacity: config.intensity,
          maskImage: mask,
          WebkitMaskImage: mask,
        } as CSSProperties
      }
    >
      {tones.map((name) => (
        <div
          key={name}
          className="absolute inset-0"
          /* A true crossfade, so no fringe of the old colour shows through. */
          style={{
            background: layers(name, config),
            opacity: name === tone ? 1 : 0,
            transition: `opacity ${config.toneDuration}ms cubic-bezier(0.23, 1, 0.32, 1)`,
          }}
        />
      ))}
    </div>
  );
}
