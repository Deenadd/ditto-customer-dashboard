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

/* Blue is the Figma frame. Green keeps each colour's OKLCH lightness and
   chroma and moves the hue (147 + (259 − h) × 0.35), as the sign-in glow does. */
export const defaultCardConfig: CardConfig = {
  blue: {
    center: "#069bfe",
    mid: "#17ccf9",
    edge: "#1fa0f7",
    midAt: 68,
    focusX: 51,
    focusY: 35,
    spread: 1,
    wave: "#ccecff",
    shade: "#c0e0e0",
    glow: "#70befc",
    mesh: [],
  },
  green: {
    center: "#09b458",
    mid: "#56d499",
    edge: "#2db563",
    midAt: 68,
    focusX: 51,
    focusY: 35,
    spread: 1,
    wave: "#d1f0db",
    shade: "#c4e0d5",
    glow: "#78cc91",
    mesh: [],
  },
  tilt: 0.4,
  perspective: 600,
  lift: 1,
  glare: 0.6,
  foil: 0.25,
  settle: 300,
};

/* The glow config's store pattern: one shared config, remembered in this
   browser, defaults on the server. */
const KEY = "ditto.card-config.v1";
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
