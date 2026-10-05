"use client";

import { useSyncExternalStore } from "react";
import type { MeshPoint } from "@/lib/mesh";

/**
 * Tuning for the policy cards on the dashboard: each tone's gradient frame,
 * and the glare and tilt on hover. Every field is a control in the card panel
 * (Shift+Option+C on the dashboard).
 */
export type CardTone = "blue" | "green";

export type CardPalette = {
  /** The frame's radial gradient (Figma node 152:12882): heart, ring, rim. */
  center: string;
  mid: string;
  edge: string;
  /** Where the ring colour sits, % of the gradient's reach. */
  midAt: number;
  /** The gradient's centre, % across and down the card. */
  focusX: number;
  focusY: number;
  /** How far the gradient reaches; 1 is the Figma size. */
  spread: number;
  /** Wave lines, the faint shade behind them, and the corner glow. */
  wave: string;
  shade: string;
  glow: string;
  /** Extra colour points over the frame, for a mesh gradient. */
  mesh: MeshPoint[];
};

export type CardConfig = {
  blue: CardPalette;
  green: CardPalette;
  /** Tilt toward the pointer; 0.4 is the reference (about ±5°). */
  tilt: number;
  /** Perspective distance in px; smaller looks deeper. */
  perspective: number;
  /** Scale while hovered. */
  lift: number;
  /** The white glare that follows the pointer, 0 to 1. */
  glare: number;
  /** The rainbow foil sheen, 0 to 1. */
  foil: number;
  /** How long the card takes to settle back (ms). */
  settle: number;
};

/* A plain plastic card, the same for health and term: soft white to pale
   grey, lit from the top right, with only the three wave rings (their faint
   shading and the corner glow) in Ditto blue. Ring position and reach are
   the ones tuned in the card panel on 1 Oct 2026. */
const plastic: CardPalette = {
  center: "#ffffff",
  mid: "#f7f8fa",
  edge: "#e9ecf1",
  midAt: 30,
  focusX: 100,
  focusY: 11,
  spread: 1.1,
  wave: "#3dabf5",
  shade: "#3dabf5",
  glow: "#70befc",
  mesh: [],
};

export const defaultCardConfig: CardConfig = {
  blue: plastic,
  green: plastic,
  tilt: 0.15,
  perspective: 350,
  lift: 1.055,
  glare: 0.2,
  foil: 0.15,
  settle: 600,
};

/* The glow config's store pattern: one shared config, remembered in this
   browser, defaults on the server. */
/* v3: the plastic defaults, so earlier saved settings don't hide them. */
const KEY = "ditto.card-config.v3";
const listeners = new Set<() => void>();
let current: CardConfig | null = null;

function load(): CardConfig {
  try {
    const saved = window.localStorage.getItem(KEY);
    if (saved) {
      const parsed = JSON.parse(saved) as Partial<CardConfig>;
      return {
        ...defaultCardConfig,
        ...parsed,
        blue: { ...defaultCardConfig.blue, ...parsed.blue },
        green: { ...defaultCardConfig.green, ...parsed.green },
      };
    }
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

/** A light card (like the plastic default) takes dark text and no inner
    white panel; a dark or saturated one keeps the Figma's white text. */
export function isLightCard(palette: CardPalette) {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(palette.mid.slice(i, i + 2), 16) / 255);
  const lin = (c: number) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b) > 0.6;
}
