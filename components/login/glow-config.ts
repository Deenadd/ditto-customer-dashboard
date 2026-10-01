"use client";

import { useSyncExternalStore } from "react";

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
  /** Overall strength of the wash, 0 to 1. */
  intensity: number;
  /** Blue, red and green crossfade over this long (ms). */
  toneDuration: number;
};

export const defaultGlowConfig: GlowConfig = {
  heightVh: 48,
  curve: 0.15,
  softness: 25,
  coreWidth: 62,
  coreDepth: 42,
  intensity: 1,
  toneDuration: 500,
};

/* A tiny store so the glow and the panel share one config, it survives a
   reload in this browser, and the server render always uses the defaults. */
/* v2: the wash replaced the moving circle, so v1 settings no longer apply. */
const KEY = "ditto.glow-config.v2";
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
