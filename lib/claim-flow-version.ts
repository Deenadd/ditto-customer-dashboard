"use client";

import { useSyncExternalStore } from "react";

/**
 * Which Make a claim flow to show, for comparing the two:
 * v1, hospital first (hospital, claim type, member, then documents for a
 * reimbursement), and v2, type first (the step-by-step flows). Chosen with
 * the switch at the foot of the flow's first page, and remembered in this
 * browser. v2 on the server and by default.
 */
export type ClaimFlowVersion = "v1" | "v2";

const KEY = "ditto.claim-flow";
const listeners = new Set<() => void>();
let current: ClaimFlowVersion | null = null;

function load(): ClaimFlowVersion {
  try {
    return window.localStorage.getItem(KEY) === "v1" ? "v1" : "v2";
  } catch {
    return "v2";
  }
}

export function setClaimFlowVersion(next: ClaimFlowVersion) {
  current = next;
  try {
    window.localStorage.setItem(KEY, next);
  } catch {
    /* Applies for this visit only. */
  }
  listeners.forEach((listener) => listener());
}

export function useClaimFlowVersion(): ClaimFlowVersion {
  return useSyncExternalStore(
    (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    () => (current ??= load()),
    () => "v2",
  );
}
