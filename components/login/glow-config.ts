"use client";

import { useSyncExternalStore } from "react";

/**
 * Tuning for the sign-in glow. Every field is a control in the glow panel
 * (Shift+Option+C on the sign-in page). Lengths scale with the glow's radius
 * unless noted; durations are ms.
 */
export type GlowConfig = {
  /** Radius as a share of the viewport height (dvh). */
  radiusVh: number;
  /** Cap on the radius as a share of the viewport width (vw). */
  maxRadiusVw: number;
  /** Where the soft edge begins, as % of the radius. Lower is softer. */
  featherStart: number;
  /** Overall strength of the glow, 0 to 1. */
  intensity: number;

  /** Resting at the bottom: centre below the edge (× radius), across (%), scale. */
  bottomOffset: number;
  bottomX: number;
  bottomScale: number;

  /** Resting at the top: centre above the edge (× radius), across (%), scale. */
  topOffset: number;
  topX: number;
  topScale: number;

  /** The move between bottom and top. */
  moveDuration: number;
  cubic: [number, number, number, number];
  /** Blue, red and green crossfade over this long. */
  toneDuration: number;
};

export const defaultGlowConfig: GlowConfig = {
  radiusVh: 59,
  maxRadiusVw: 100,
  featherStart: 67.2,
  intensity: 1,
  bottomOffset: 0.12,
  bottomX: 50,
  bottomScale: 1,
  topOffset: 0.06,
  topX: 50,
  topScale: 0.56,
  moveDuration: 1000,
  cubic: [0.32, 0.72, 0, 1],
  toneDuration: 500,
};

export const easingPresets: { label: string; cubic: GlowConfig["cubic"] }[] = [
  { label: "Sheet", cubic: [0.32, 0.72, 0, 1] },
  { label: "Snappy", cubic: [0.23, 1, 0.32, 1] },
  { label: "Gentle", cubic: [0.45, 0, 0.2, 1] },
  { label: "Linear", cubic: [0, 0, 1, 1] },
];

/* A tiny store so the glow and the panel share one config, it survives a
   reload in this browser, and the server render always uses the defaults. */
const KEY = "ditto.glow-config.v1";
const listeners = new Set<() => void>();
let current: GlowConfig | null = null;

function load(): GlowConfig {
  try {
    const saved = window.localStorage.getItem(KEY);
    if (saved) return { ...defaultGlowConfig, ...(JSON.parse(saved) as Partial<GlowConfig>) };
  } catch {
    /* Storage can be blocked; the defaults still work. */
  }
  return defaultGlowConfig;
}

function snapshot() {
  if (!current) current = load();
  return current;
}

export function setGlowConfig(next: GlowConfig) {
  current = next;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    /* Not saved, but the change still applies for this visit. */
  }
  listeners.forEach((listener) => listener());
}

export function useGlowConfig(): GlowConfig {
  return useSyncExternalStore(
    (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    snapshot,
    () => defaultGlowConfig,
  );
}
