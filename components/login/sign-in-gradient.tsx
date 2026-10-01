import type { CSSProperties } from "react";
import type { GlowConfig } from "./glow-config";
import { meshLayers } from "@/lib/mesh";
import { inTone, type GlowStop, type GlowTone } from "./glow-ramps";

const tones: GlowTone[] = ["blue", "red", "green"];

const hexToRgb = (hex: string) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16)).join(" ");

const sorted = (stops: GlowStop[]) => [...stops].sort((a, b) => a.at - b.at);

/**
 * The sign-in wash, hanging from the top of the screen: a deep blue dome in a
 * cyan band that pales into the page (colours in glow-ramps.ts). It stays put
 * for the whole flow; red and green crossfade over the blue for a wrong or
 * right code, made from whatever blue is set.
 *
 * The dome is an ellipse `coreWidth` wide and `coreDepth` deep, centred at
 * (`domeX`, `domeY`). Its rim fades to transparent in its own colour, so it
 * melts into the band without a grey seam. The wash's lower edge fades
 * through a mask that bows down in the middle by `curve`.
 *
 * Mesh points from the panel layer over the dome and band.
 *
 * Every number and colour comes from GlowConfig, which the glow panel edits.
 */
function layers(tone: GlowTone, config: GlowConfig) {
  const core = sorted(config.core).map((stop) => ({ ...stop, color: inTone(stop.color, tone) }));
  const base = sorted(config.base).map((stop) => ({ ...stop, color: inTone(stop.color, tone) }));
  const rim = core[core.length - 1].color;
  const dome = `radial-gradient(ellipse ${config.coreWidth}% ${config.coreDepth}% at ${config.domeX}% ${config.domeY}%, ${core
    .map((stop) => `${stop.color} ${stop.at}%`)
    .join(", ")}, rgb(${hexToRgb(rim)} / 0) 100%)`;
  const band = `linear-gradient(to bottom, ${base.map((stop) => `${stop.color} ${stop.at}%`).join(", ")})`;
  /* Mesh points sit over the dome and band, in the same tone. */
  return [...meshLayers(config.mesh ?? [], (hex) => inTone(hex, tone)), dome, band].join(", ");
}

/** The blue wash's layers as one background, for the panel's mesh pad. */
export function SignInGradientPreview(config: GlowConfig) {
  return layers("blue", config);
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
