"use client";

import { useSyncExternalStore } from "react";
import type { Customer } from "@/lib/routes";

/**
 * Claims made on the health policy. There's no backend in this prototype,
 * so claims live in this browser: made in the claim flow, read by the claims
 * list, the claim page and the policy page, and gone when deleted.
 */

export type ClaimCategory = "hospitalisation" | "day-care" | "pre-post";

export type Stage = { id: string; label: string; hint: string };

export const categories: { id: ClaimCategory; label: string; hint: string }[] = [
  { id: "hospitalisation", label: "Hospitalisation", hint: "A hospital stay of 24 hours or more" },
  { id: "day-care", label: "Day care", hint: "Treatment in under 24 hours that isn't an outpatient visit" },
];

/** A reimbursement can also be for the costs either side of a stay alone. */
export const reimbursementCategories: { id: ClaimCategory; label: string; hint: string }[] = [
  { id: "hospitalisation", label: "Hospitalisation", hint: "A hospital stay of 24 hours or more" },
  { id: "pre-post", label: "Only before and after a stay", hint: "Costs in the 60 days before admission or 90 days after discharge" },
  { id: "day-care", label: "Day care", hint: "Treatment in under 24 hours that isn't an outpatient visit" },
];

export type DocumentKind = "bills" | "discharge" | "reports";

export const documentKinds: { id: DocumentKind; label: string; hint: string }[] = [
  { id: "bills", label: "Bills and payment receipts", hint: "Hospital bills, pharmacy bills and receipts" },
  { id: "discharge", label: "Discharge summary", hint: "The summary the hospital gave you when you left" },
  { id: "reports", label: "Reports", hint: "Investigation and lab reports" },
];

export const stages: Record<ClaimCategory, Stage[]> = {
  hospitalisation: [
    { id: "planning", label: "Planning a stay", hint: "I need help planning treatment that's coming up" },
    { id: "admission", label: "Waiting to be admitted", hint: "I'm at the hospital and need help with admission" },
    { id: "discharge", label: "Waiting to be discharged", hint: "I've been admitted and need help with cashless approval" },
    { id: "after", label: "Already discharged", hint: "I've left the hospital and need more help" },
  ],
  "pre-post": [{ id: "after", label: "Costs before or after a stay", hint: "" }],
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
  /** The desk to call, as dialled from India, and opening hours. */
  phone: string;
  hours: string;
};

/** A sample network list for the prototype; the names, numbers and hours
    are made up. */
export const hospitals: Hospital[] = [
  { id: "lakeview", name: "Lakeview Hospital", address: "12, 100 Feet Road, Velachery", city: "Chennai", pin: "600042", network: true, phone: "044 4000 1200", hours: "Open 24 hours" },
  { id: "riverside", name: "Riverside Multispeciality", address: "4, Gandhi Nagar, Adyar", city: "Chennai", pin: "600020", network: true, phone: "044 4211 3300", hours: "Open 24 hours" },
  { id: "guindy", name: "Guindy Care Hospital", address: "88, Mount Road, Guindy", city: "Chennai", pin: "600032", network: true, phone: "044 4590 2200", hours: "Open 24 hours" },
  { id: "family", name: "T. Nagar Family Hospital", address: "21, Usman Road, T. Nagar", city: "Chennai", pin: "600017", network: false, phone: "044 4313 7700", hours: "Open 8 am to 10 pm" },
  { id: "sunrise", name: "Sunrise Hospital", address: "5, 12th Main, Indiranagar", city: "Bengaluru", pin: "560038", network: true, phone: "080 4110 5500", hours: "Open 24 hours" },
  { id: "cityview", name: "Cityview Hospital", address: "40, 80 Feet Road, Koramangala", city: "Bengaluru", pin: "560034", network: true, phone: "080 4290 6600", hours: "Open 24 hours" },
  { id: "meadows", name: "Meadows Hospital", address: "2, ITPL Main Road, Whitefield", city: "Bengaluru", pin: "560066", network: true, phone: "080 4370 8800", hours: "Open 24 hours" },
  { id: "harbour", name: "Harbour Hospital", address: "17, Link Road, Andheri West", city: "Mumbai", pin: "400053", network: true, phone: "022 4020 9900", hours: "Open 24 hours" },
  { id: "lakeside", name: "Powai Lakeside Hospital", address: "9, Hiranandani Gardens, Powai", city: "Mumbai", pin: "400076", network: false, phone: "022 4150 4400", hours: "Open 8 am to 10 pm" },
];

/** Hospitals Care Health won't pay claims from; made up for the prototype. */
export const excludedHospitals = [
  { name: "Greenfield Nursing Home", city: "Chennai", reason: "Excluded for billing irregularities" },
  { name: "City Care Clinic", city: "Bengaluru", reason: "Excluded for incomplete records" },
  { name: "Seaside Medical Centre", city: "Mumbai", reason: "Excluded for billing irregularities" },
];

export type Patient = { name: string; relation: string; age: number };

export type Claim = {
  id: string;
  policyId: string;
  type: "cashless" | "reimbursement";
  patient: Patient;
  category: ClaimCategory;
  treatment: string;
  stage: string;
  /** ISO date, or null when it isn't decided yet. */
  admission: string | null;
  hospital: { name: string; address: string; network: boolean } | null;
  createdAt: string;
  /** Reimbursement only: what you're claiming (₹), when you left, and the
      names of the files you added, by kind. */
  amount?: number;
  discharge?: string | null;
  documents?: Partial<Record<DocumentKind, string[]>>;
};

/** The policy year a claim's dates must fall in. */
export const policyPeriod = { start: "2026-08-20", end: "2027-08-19" };

/* v2: the family was renamed (people.ts); claims made under the old names
   would name people the policy no longer has. */
const KEY = "ditto.claims.v2";
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

/** A short date for lists: 6 Oct 26. */
export function formatShortDate(iso: string) {
  const date = new Date(iso);
  return `${date.getDate()} ${date.toLocaleString("en-GB", { month: "short" })} ${String(date.getFullYear()).slice(-2)}`;
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
  reimbursementCategories.find((item) => item.id === category)?.label ?? category;

export const typeLabel = (claim: Claim) => (claim.type === "reimbursement" ? "Reimbursement" : "Cashless");

/** ₹ in Indian grouping: 150000 → "₹1,50,000". */
export const rupees = (amount: number) => `₹${new Intl.NumberFormat("en-IN").format(amount)}`;

/** Where a hospital's actions go. Directions open Google Maps to its
    address; the website is a search, since the sample hospitals have none. */
export const hospitalLinks = (h: Hospital) => {
  const place = `${h.name}, ${h.address}, ${h.city} ${h.pin}`;
  return {
    directions: `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(place)}`,
    call: `tel:+91${h.phone.replace(/\D/g, "").replace(/^0/, "")}`,
    website: `https://www.google.com/search?q=${encodeURIComponent(`${h.name} ${h.city}`)}`,
  };
};
