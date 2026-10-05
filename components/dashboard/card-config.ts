"use client";

import { useSyncExternalStore } from "react";

/**
 * Tuning for the hover effect on the dashboard's policy cards. Every field
 * is a control in the card panel (Shift+Option+C on the dashboard).
 */
export type CardConfig = {
  /** Press: Bencho's tilt card, which sinks under the pointer. Glare: the
      card turns toward the pointer and catches a glare. */
  effect: "press" | "glare";
  /** Press: the most either axis turns (°), how dark the dent gets (0–100),
      the spring (0–100, 50 is Bencho's), the room's depth (px) and how far
      the card retreats (px). */
  pressTilt: number;
  shade: number;
  spring: number;
  depth: number;
  sink: number;
  /** Tilt toward the pointer; 0.4 is the reference (about ±5°). */
  tilt: number;
  /** Perspective distance in px; smaller looks deeper. */
  perspective: number;
  /** Scale while hovered. */
  lift: number;
  /** The white glare that follows the pointer, 0 to 1. */
  glare: number;
  /** The holographic foil finish (card-foil.tsx), for both effects: how
      strong it is (0 turns it off), how much shows at rest, a base tint
      (#ffffff for none), the dimple size (px), how many rainbow bands cross
      the card, their saturation and hue shift, the glitter, how deep the
      dimples read, and whether it covers the whole card or only its edges
      around the panel. */
  foil: number;
  foilRest: number;
  foilTint: string;
  foilScale: number;
  foilBand: number;
  foilSaturation: number;
  foilHue: number;
  sparkle: number;
  emboss: number;
  foilCover: "card" | "edge";
  /** How long the card takes to settle back (ms). */
  settle: number;
};

/* Glare values tuned in the card panel on 1 Oct 2026. */
export const defaultCardConfig: CardConfig = {
  effect: "press",
  /* Bencho's own values. */
  pressTilt: 10,
  shade: 60,
  spring: 50,
  depth: 800,
  sink: 14,
  tilt: 0.15,
  perspective: 350,
  lift: 1.055,
  glare: 0.2,
  settle: 600,
  /* After the reference's Foil preset, toned for a white card. */
  foil: 0.5,
  foilRest: 0.45,
  foilTint: "#ffffff",
  foilScale: 10,
  foilBand: 0.6,
  foilSaturation: 0.65,
  foilHue: 10,
  sparkle: 0.35,
  emboss: 0.4,
  foilCover: "card",
};

/* One shared config, remembered in this browser, defaults on the server.
   v7: the holographic foil replaces the glare's own rainbow. */
const KEY = "ditto.card-config.v7";
const listeners = new Set<() => void>();
let current: CardConfig | null = null;

function load(): CardConfig {
  try {
    const saved = window.localStorage.getItem(KEY);
    if (saved) return { ...defaultCardConfig, ...(JSON.parse(saved) as Partial<CardConfig>) };
  } catch {
    /* Storage can be blocked; the defaults still work. */
  }
  return defaultCardConfig;
}

export function setCardConfig(next: CardConfig) {
  current = next;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    /* Not saved, but the change still applies for this visit. */
  }
  listeners.forEach((listener) => listener());
}

export function useCardConfig(): CardConfig {
  return useSyncExternalStore(
    (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    () => (current ??= load()),
    () => defaultCardConfig,
  );
}
