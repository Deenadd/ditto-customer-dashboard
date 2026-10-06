import { useEffect, type CSSProperties } from "react";
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

/*
 * The status bar. Safari on iOS 26 doesn't draw the page under the status
 * bar: it fills that strip with one solid colour, taken from the background
 * colour of whatever is fixed at the top, and white otherwise, which showed
 * as a white rectangle over the wash. So a strip the height of the safe area
 * carries one colour for it, the wash's colour along its top edge (the dome
 * at its middle and the band at its sides, at the wash's strength over
 * white), and a fade the same colour runs from it into the wash so there's
 * no seam. Safari (iOS 26) does draw this page under the status bar, so the
 * colour reaches Safari as the page background (app/page.tsx) and, on touch
 * screens, fades 64px into the wash. On a desktop both are 0px tall.
 */
function topColor(tone: GlowTone, config: GlowConfig) {
  const dome = sorted(config.core)[0].color;
  const band = sorted(config.base)[0].color;
  const mix = (hex: string) => [1, 3, 5].map((i) => parseInt(inTone(hex, tone).slice(i, i + 2), 16));
  const [a, b] = [mix(dome), mix(band)];
  const k = config.intensity;
  const rgb = a.map((value, i) => Math.round(k * ((value + b[i]) / 2) + (1 - k) * 255));
  return `rgb(${rgb.join(" ")})`;
}

/** Ellipse width for the lower fade: 0 is near flat (400%), 1 bows deeply (60%). */
const edgeWidth = (curve: number) => 400 - curve * 340;

export function SignInGradient({ tone, config }: { tone: GlowTone; config: GlowConfig }) {
  const mask = `radial-gradient(ellipse ${edgeWidth(config.curve)}% 100% at 50% 0%, #000 ${100 - config.softness}%, transparent 100%)`;
  const statusBar = topColor(tone, config);
  const ease = `background-color ${config.toneDuration}ms cubic-bezier(0.23, 1, 0.32, 1)`;

  /* Safari fills the status bar with the page's background colour, so it
     follows the wash through red and green too. app/page.tsx sets the blue
     for the first paint; leaving the page puts the background back. */
  useEffect(() => {
    const targets = [document.documentElement, document.body];
    for (const el of targets) {
      el.style.transition = ease;
      el.style.backgroundColor = statusBar;
    }
  }, [statusBar, ease]);
  useEffect(
    () => () => {
      for (const el of [document.documentElement, document.body]) {
        el.style.transition = "";
        el.style.backgroundColor = "";
      }
    },
    [],
  );
  return (
    <>
      <div
        aria-hidden
        className="pointer-events-none fixed inset-x-0 top-0 h-[env(safe-area-inset-top)]"
        style={{ backgroundColor: statusBar, transition: ease }}
      />
      <div
        aria-hidden
        className="pointer-events-none fixed inset-x-0 top-[env(safe-area-inset-top)] -z-[5] h-[calc(env(safe-area-inset-top)*1.4)] [mask-image:linear-gradient(to_bottom,#000,transparent)] [@media(pointer:coarse)]:h-16"
        style={{ backgroundColor: statusBar, transition: ease }}
      />
      {/* Safari takes its bottom bar's colour the same way; something fixed
          on the bottom edge keeps that white. */}
      <div aria-hidden className="pointer-events-none fixed inset-x-0 bottom-0 hidden h-6 bg-page [@media(pointer:coarse)]:block" />
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
    </>
  );
}
