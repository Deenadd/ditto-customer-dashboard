"use client";

import { useSyncExternalStore } from "react";
import type { MeshPoint } from "@/lib/mesh";
import type { GlowStop } from "./glow-ramps";

/**
 * Tuning for the sign-in wash at the top of the screen. Every field is a
 * control in the glow panel (Shift+Option+C on the sign-in page).
 */
export type GlowConfig = {
  /** How far down the wash reaches, soft edge included (dvh). */
  heightVh: number;
  /** How much the lower edge bows down in the middle, 0 (flat) to 1. */
  curve: number;
  /** The share of the height that fades into the page (%). */
  softness: number;
  /** The blue dome's width, as % of the screen width. */
  coreWidth: number;
  /** How far the blue dome hangs, as % of the wash's height. */
  coreDepth: number;
  /** Where the dome's centre sits: across the screen and down the wash (%). */
  domeX: number;
  domeY: number;
  /** The dome's colours, heart outward; `at` is % of its radius. */
  core: GlowStop[];
  /** The band's colours, top down; `at` is % of the wash's height. */
  base: GlowStop[];
  /** Extra colour points over the dome and band, for a mesh gradient. */
  mesh: MeshPoint[];
  /** Overall strength of the wash, 0 to 1. */
  intensity: number;
  /** Blue, red and green crossfade over this long (ms). */
  toneDuration: number;
};

/* Tuned in the glow panel on 6 Oct 2026: the dome moved left of centre and
   a little down, bluer at its heart, with a cyan mesh point at the top
   right; the wash reaches 40% of the screen. */
export const defaultGlowConfig: GlowConfig = {
  heightVh: 40,
  curve: 1,
  softness: 66,
  coreWidth: 48,
  coreDepth: 53,
  domeX: 32,
  domeY: 6,
  core: [
    { color: "#2f87da", at: 0 },
    { color: "#339bdb", at: 20 },
    { color: "#3f8ae4", at: 38 },
    { color: "#4497e4", at: 54 },
    { color: "#4ea1e8", at: 68 },
  ],
  base: [
    { color: "#65c9f1", at: 0 },
    { color: "#62c2f5", at: 24 },
    { color: "#60c3f1", at: 44 },
    { color: "#c0e6f9", at: 64 },
    { color: "#f2f9fc", at: 100 },
    { color: "#ffffff", at: 94 },
  ],
  mesh: [{ id: "1tf29p", x: 95, y: 0, color: "#62d6fa", size: 45, strength: 0.8 }],
  intensity: 0.45,
  toneDuration: 1950,
};

/* A tiny store so the glow and the panel share one config, it survives a
   reload in this browser, and the server render always uses the defaults. */
/* v2: the wash replaced the moving circle, so v1 settings no longer apply.
   v3: the wash sits higher; settings saved before would hold it low.
   v4: the 6 Oct tuning is the default; older saves would hide it. */
const KEY = "ditto.glow-config.v4";
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
