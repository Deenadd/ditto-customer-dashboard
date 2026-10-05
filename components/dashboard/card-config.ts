"use client";

import { useSyncExternalStore } from "react";

/**
 * Tuning for the glare and tilt on the dashboard's policy cards. Every field
 * is a control in the card panel (Shift+Option+C on the dashboard).
 */
export type CardConfig = {
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

/* Tuned in the card panel on 1 Oct 2026. */
export const defaultCardConfig: CardConfig = {
  tilt: 0.15,
  perspective: 350,
  lift: 1.055,
  glare: 0.2,
  foil: 0.15,
  settle: 600,
};

/* One shared config, remembered in this browser, defaults on the server.
   v5: the white Figma cards, so the colour settings of earlier versions are
   gone. */
const KEY = "ditto.card-config.v5";
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
