"use client";

import { useSyncExternalStore } from "react";
import type { Customer } from "@/lib/routes";

/**
 * Claims made on the health policy. There's no backend in this prototype,
 * so claims live in this browser: made in the claim flow, read by the claims
 * list, the claim page and the policy page, and gone when deleted.
 */

export type ClaimCategory = "hospitalisation" | "day-care";

export type Stage = { id: string; label: string; hint: string };

export const categories: { id: ClaimCategory; label: string; hint: string }[] = [
  { id: "hospitalisation", label: "Hospitalisation", hint: "A hospital stay of 24 hours or more" },
  { id: "day-care", label: "Day care", hint: "Treatment in under 24 hours that isn't an outpatient visit" },
];

export const stages: Record<ClaimCategory, Stage[]> = {
  hospitalisation: [
    { id: "planning", label: "Planning a stay", hint: "I need help planning treatment that's coming up" },
    { id: "admission", label: "Waiting to be admitted", hint: "I'm at the hospital and need help with admission" },
    { id: "discharge", label: "Waiting to be discharged", hint: "I've been admitted and need help with cashless approval" },
    { id: "after", label: "Already discharged", hint: "I've left the hospital and need more help" },
  ],
  "day-care": [
    { id: "planning", label: "Planning treatment", hint: "I need help planning treatment that's coming up" },
    { id: "today", label: "At the hospital today", hint: "Treatment is today and I need help with cashless" },
    { id: "after", label: "Treatment is done", hint: "I've had the treatment and need more help" },
  ],
};

export type Hospital = {
  id: string;
  name: string;
  address: string;
  city: string;
  pin: string;
  /** In Care Health's network, so cashless is available. */
  network: boolean;
};

/** A sample network list for the prototype; the names are made up. */
export const hospitals: Hospital[] = [
  { id: "lakeview", name: "Lakeview Hospital", address: "12, 100 Feet Road, Velachery", city: "Chennai", pin: "600042", network: true },
  { id: "riverside", name: "Riverside Multispeciality", address: "4, Gandhi Nagar, Adyar", city: "Chennai", pin: "600020", network: true },
  { id: "guindy", name: "Guindy Care Hospital", address: "88, Mount Road, Guindy", city: "Chennai", pin: "600032", network: true },
  { id: "family", name: "T. Nagar Family Hospital", address: "21, Usman Road, T. Nagar", city: "Chennai", pin: "600017", network: false },
  { id: "sunrise", name: "Sunrise Hospital", address: "5, 12th Main, Indiranagar", city: "Bengaluru", pin: "560038", network: true },
  { id: "cityview", name: "Cityview Hospital", address: "40, 80 Feet Road, Koramangala", city: "Bengaluru", pin: "560034", network: true },
  { id: "meadows", name: "Meadows Hospital", address: "2, ITPL Main Road, Whitefield", city: "Bengaluru", pin: "560066", network: true },
  { id: "harbour", name: "Harbour Hospital", address: "17, Link Road, Andheri West", city: "Mumbai", pin: "400053", network: true },
  { id: "lakeside", name: "Powai Lakeside Hospital", address: "9, Hiranandani Gardens, Powai", city: "Mumbai", pin: "400076", network: false },
];

export type Patient = { name: string; relation: string; age: number };

export type Claim = {
  id: string;
  policyId: string;
  type: "cashless";
  patient: Patient;
  category: ClaimCategory;
  treatment: string;
  stage: string;
  /** ISO date, or null when it isn't decided yet. */
  admission: string | null;
  hospital: { name: string; address: string; network: boolean } | null;
  createdAt: string;
};

/** The policy year a claim's dates must fall in. */
export const policyPeriod = { start: "2026-08-20", end: "2027-08-19" };

const KEY = "ditto.claims.v1";
const NONE: Claim[] = [];
const listeners = new Set<() => void>();
let current: Claim[] | null = null;

function load(): Claim[] {
  try {
    const saved = window.localStorage.getItem(KEY);
    if (saved) return JSON.parse(saved) as Claim[];
  } catch {
    /* Storage can be blocked; start with none. */
  }
  return NONE;
}

function save(next: Claim[]) {
  current = next;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    /* Kept for this visit only. */
  }
  listeners.forEach((listener) => listener());
}

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

/** Every claim on the policy, newest first. Empty on the server. */
export function useClaims(policyId: string) {
  const all = useSyncExternalStore(
    subscribe,
    () => (current ??= load()),
    () => NONE,
  );
  return all.filter((claim) => claim.policyId === policyId);
}

const noSubscribe = () => () => {};

/** False on the server and the first client render, so pages that read
    claims can wait rather than flash "not found". */
export function useHydrated() {
  return useSyncExternalStore(noSubscribe, () => true, () => false);
}

export function addClaim(claim: Omit<Claim, "id" | "createdAt">): Claim {
  const all = current ?? load();
  let id: string;
  do id = `CL${Math.floor(1000 + Math.random() * 9000)}`;
  while (all.some((existing) => existing.id === id));
  const made = { ...claim, id, createdAt: new Date().toISOString() };
  save([made, ...all]);
  return made;
}

export function deleteClaim(id: string) {
  save((current ?? load()).filter((claim) => claim.id !== id));
}

/** "14 Jul 1995" → age today. */
export function ageFrom(dob: string, today = new Date()) {
  const born = new Date(dob);
  let age = today.getFullYear() - born.getFullYear();
  const birthday = new Date(today.getFullYear(), born.getMonth(), born.getDate());
  if (today < birthday) age -= 1;
  return age;
}

/** "2026-10-01" → "1 Oct 2026". */
export function formatDate(iso: string) {
  return new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric" }).format(
    new Date(`${iso.slice(0, 10)}T00:00:00`),
  );
}

export function claimsHref(policyId: string, customer: Customer = "default", extra = "") {
  const base = `/dashboard/policies/${encodeURIComponent(policyId)}/claims${extra}`;
  return customer === "new" ? `${base}${base.includes("?") ? "&" : "?"}customer=new` : base;
}

export const newClaimHref = (policyId: string, customer?: Customer) => claimsHref(policyId, customer, "/new");
export const claimHref = (policyId: string, claimId: string, customer?: Customer) =>
  claimsHref(policyId, customer, `/${claimId}`);

export const stageLabel = (claim: Claim) =>
  stages[claim.category].find((stage) => stage.id === claim.stage)?.label ?? claim.stage;
export const categoryLabel = (category: ClaimCategory) =>
  categories.find((item) => item.id === category)?.label ?? category;
