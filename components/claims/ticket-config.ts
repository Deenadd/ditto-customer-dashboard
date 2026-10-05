"use client";

import { useSyncExternalStore } from "react";

/**
 * Tuning for the claim ticket's print animation. Every field is a control in
 * the print panel (Shift+Option+C while the ticket is on screen).
 */
export type TicketConfig = {
  /** Pulls: the paper feeds in jerks with pauses, like a thermal printer.
      Spring: one physical pull that settles. */
  feedMode: "pulls" | "spring";
  /** Pulls mode: total feed time (ms), how many pulls, and the share of each
      pull spent paused. */
  feedDuration: number;
  pulls: number;
  pause: number;
  /** Spring mode physics. */
  feedStiffness: number;
  feedDamping: number;
  feedMass: number;
  /** How far the printer shakes while feeding (px) and how fast (ms a cycle). */
  hum: number;
  humSpeed: number;
  /** The stamp: wait after the feed (ms), where it starts (size, tilt), where
      it lands (tilt), and the spring it lands on. */
  stampDelay: number;
  stampFrom: number;
  stampTiltFrom: number;
  stampTilt: number;
  stampStiffness: number;
  stampDamping: number;
  stampMass: number;
  /** How far the paper dips when the stamp hits (px). */
  knock: number;
  /** Plays everything slower, for checking feel. 1 is real time. */
  speed: number;
};

/* Tuned in the print panel on 5 Oct 2026. */
export const defaultTicketConfig: TicketConfig = {
  feedMode: "pulls",
  feedDuration: 3400,
  pulls: 7,
  pause: 0.27,
  feedStiffness: 90,
  feedDamping: 18,
  feedMass: 1.4,
  hum: 0.6,
  humSpeed: 250,
  stampDelay: 150,
  stampFrom: 1.9,
  stampTiltFrom: -22,
  stampTilt: -10,
  stampStiffness: 520,
  stampDamping: 22,
  stampMass: 1,
  knock: 3,
  speed: 1,
};

/* v2: new defaults, so earlier saved settings don't hide them. */
const KEY = "ditto.ticket-config.v2";
const listeners = new Set<() => void>();
let current: TicketConfig | null = null;

function load(): TicketConfig {
  try {
    const saved = window.localStorage.getItem(KEY);
    if (saved) return { ...defaultTicketConfig, ...(JSON.parse(saved) as Partial<TicketConfig>) };
  } catch {
    /* Storage can be blocked; the defaults still work. */
  }
  return defaultTicketConfig;
}

export function setTicketConfig(next: TicketConfig) {
  current = next;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    /* Not saved, but the change still applies for this visit. */
  }
  listeners.forEach((listener) => listener());
}

export function useTicketConfig(): TicketConfig {
  return useSyncExternalStore(
    (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    () => (current ??= load()),
    () => defaultTicketConfig,
  );
}
