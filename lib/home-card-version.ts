"use client";

import { useSyncExternalStore } from "react";

/**
 * Which home card to show, for comparing: v1, the card as it is, and v2,
 * the card with its renewal coming up (see lib/renewal.ts). Chosen in the
 * account menu (the avatar), with how far off the family card's renewal is,
 * and remembered in this browser. v1 on the server and by default.
 */
export type HomeCardVersion = "v1" | "v2";
export type HomeCardState = { version: HomeCardVersion; days: Record<string, number> };

const KEY = "ditto.home-card.v1";
const fallback: HomeCardState = { version: "v1", days: {} };
const listeners = new Set<() => void>();
let current: HomeCardState | null = null;

function load(): HomeCardState {
  try {
    const saved = JSON.parse(window.localStorage.getItem(KEY) ?? "null");
    if (saved && (saved.version === "v1" || saved.version === "v2")) return { version: saved.version, days: saved.days ?? {} };
  } catch {
    /* Nothing saved, or storage blocked. */
  }
  return fallback;
}

export function setHomeCard(patch: Partial<HomeCardState>) {
  current = { ...(current ?? load()), ...patch };
  try {
    window.localStorage.setItem(KEY, JSON.stringify(current));
  } catch {
    /* Applies for this visit only. */
  }
  listeners.forEach((listener) => listener());
}

export function useHomeCard(): HomeCardState {
  return useSyncExternalStore(
    (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    () => (current ??= load()),
    () => fallback,
  );
}
