import type { Insurer } from "@/lib/dashboard-data";

/**
 * The claims support conversation: a small decision tree. Each step says a
 * few things, may end with an outcome card, and offers answers that lead to
 * other steps. A step with no answers of its own falls back to
 * `closingChoices`; an empty list ends the conversation. Guidance is general
 * and written for this prototype; the policy wording has the exact terms.
 */

export type TopicId = "make-claim" | "documents" | "covered" | "track";

export type Choice = {
  label: string;
  next: string;
  /** A second line, which also turns the answers into a list of rows. */
  hint?: string;
  insurer?: Insurer;
};

export type Outcome =
  | { kind: "steps"; title: string; steps: string[]; note?: string }
  | { kind: "documents"; title: string; documents: { label: string; onFile?: boolean }[]; note?: string }
  | { kind: "booked"; title: string; rows: { label: string; value: string }[]; note?: string };

export type Step = {
  say: string[];
  outcome?: Outcome;
  choices?: Choice[];
};

export type Topic = {
  id: TopicId;
  label: string;
  hint: string;
  start: string;
};

export const topics: Topic[] = [
  { id: "make-claim", label: "Make a claim", hint: "Cashless or reimbursement", start: "which-policy" },
  { id: "documents", label: "Documents you'll need", hint: "What to keep for a claim", start: "documents" },
  { id: "covered", label: "Check what's covered", hint: "Before a hospital stay", start: "covered" },
  { id: "track", label: "Track a claim", hint: "See where it stands", start: "track" },
];

const HEALTH = "Care health NCB Super Premium";
const NOTE = "General guidance for this prototype. Your policy wording has the exact terms.";

const expert: Choice = { label: "Talk to a claims expert", next: "expert" };
const documents: Choice = { label: "See the documents I'll need", next: "documents" };
const makeClaim: Choice = { label: "Make a claim", next: "which-policy" };

export const steps: Record<string, Step> = {
  "which-policy": {
    say: ["Let's get your claim started. Which policy is it for?"],
    choices: [
      { label: HEALTH, hint: "Health insurance · 474-981-34EDH20", insurer: "care", next: "treatment" },
      { label: "Max Life Smart Secure Plus", hint: "Term insurance", insurer: "maxlife", next: "term" },
    ],
  },
  term: {
    say: [
      "Claims on a term policy are made by the nominee, after the loss of the person insured. We're sorry if that's why you're here.",
      "A claims expert can take the nominee through it one step at a time and help gather the documents.",
    ],
    choices: [expert],
  },
  treatment: {
    say: ["Has the treatment happened yet?"],
    choices: [
      { label: "It's planned", next: "network" },
      { label: "It's an emergency", next: "emergency" },
      { label: "I've been discharged", next: "reimbursement" },
    ],
  },
  network: {
    say: [
      "Is the hospital in Care Health's network?",
      "Network hospitals bill the insurer directly, so you don't pay upfront.",
    ],
    choices: [
      { label: "Yes, it's in the network", next: "cashless" },
      { label: "No", next: "reimbursement" },
      { label: "I'm not sure", next: "network-unsure" },
    ],
  },
  "network-unsure": {
    say: [
      "The hospital's insurance desk can tell you in a minute. You can also ask us.",
      "Once you know, pick the answer that fits.",
    ],
    choices: [
      { label: "It's in the network", next: "cashless" },
      { label: "It isn't", next: "reimbursement" },
      expert,
    ],
  },
  emergency: {
    say: [
      "Get treatment first. Most policies ask you to tell the insurer within 24 hours of admission, and we can do that with you.",
      "Is the hospital in Care Health's network?",
    ],
    choices: [
      { label: "Yes, it's in the network", next: "cashless-emergency" },
      { label: "No, or I'm not sure", next: "reimbursement" },
    ],
  },
  cashless: {
    say: ["You can use a cashless claim. Here's how it goes."],
    outcome: {
      kind: "steps",
      title: "Cashless claim",
      steps: [
        "Show your health card and photo ID at the hospital's insurance desk.",
        "The hospital sends a pre-authorisation request to Care Health, ideally 2 to 3 days before admission.",
        "Care Health approves the request, and the hospital bills them directly.",
        "At discharge, you pay only for items your policy doesn't cover.",
      ],
      note: NOTE,
    },
    choices: [documents, expert],
  },
  "cashless-emergency": {
    say: ["You can use a cashless claim, even in an emergency. Here's how it goes."],
    outcome: {
      kind: "steps",
      title: "Cashless claim in an emergency",
      steps: [
        "Show your health card and photo ID at the hospital's insurance desk when you're admitted.",
        "The hospital sends a pre-authorisation request to Care Health right away.",
        "Care Health approves the request, and the hospital bills them directly.",
        "At discharge, you pay only for items your policy doesn't cover.",
      ],
      note: NOTE,
    },
    choices: [expert, documents],
  },
  reimbursement: {
    say: ["You'll make a reimbursement claim: you pay first, and Care Health pays you back."],
    outcome: {
      kind: "steps",
      title: "Reimbursement claim",
      steps: [
        "Pay the hospital and keep every original bill, receipt and report.",
        "Send the claim form and your documents within 30 days of discharge.",
        "Care Health reviews the claim and pays the approved amount to your bank account.",
      ],
      note: NOTE,
    },
    choices: [documents, expert],
  },
  documents: {
    say: ["Here's what to keep for a hospitalisation claim. Tick each one off as you gather it."],
    outcome: {
      kind: "documents",
      title: "Documents for a claim",
      documents: [
        { label: "Signed claim form" },
        { label: "Discharge summary" },
        { label: "Final hospital bill and payment receipts" },
        { label: "Pharmacy bills with prescriptions" },
        { label: "Test and investigation reports" },
        { label: "Photo ID of the patient", onFile: true },
        { label: "A cancelled cheque, for the payout" },
      ],
      note: "We already have an Aadhaar card on file, so photo ID is covered.",
    },
    choices: [makeClaim, expert],
  },
  covered: {
    say: [`What would you like to check on ${HEALTH}?`],
    choices: [
      { label: "Room rent", next: "covered-room" },
      { label: "Before and after a stay", next: "covered-stay" },
      { label: "Maternity", next: "covered-maternity" },
      { label: "Treatment at home", next: "covered-home" },
    ],
  },
  "covered-room": {
    say: ["You can take a single private room with air conditioning."],
    choices: [{ label: "Check something else", next: "covered" }, makeClaim],
  },
  "covered-stay": {
    say: [
      "Medical costs in the 60 days before you're admitted are covered.",
      "So are costs in the 90 days after you're discharged.",
    ],
    choices: [{ label: "Check something else", next: "covered" }, makeClaim],
  },
  "covered-maternity": {
    say: ["Delivery and newborn care are covered up to ₹30,000."],
    choices: [{ label: "Check something else", next: "covered" }, makeClaim],
  },
  "covered-home": {
    say: [
      "Treatment at home is covered when a doctor advises it and a hospital bed isn't available.",
      "Choosing treatment at home when a bed is available isn't covered.",
    ],
    choices: [{ label: "Check something else", next: "covered" }, makeClaim],
  },
  track: {
    say: [
      "You don't have an open claim right now.",
      "When you make one, you can follow it here and in your notifications.",
    ],
    choices: [makeClaim],
  },
  expert: {
    say: ["A claims expert will call you. When suits you?"],
    choices: [
      { label: "Now", next: "booked-now" },
      { label: "Later today", next: "booked-today" },
      { label: "Tomorrow morning", next: "booked-tomorrow" },
    ],
  },
  "booked-now": booked("Within 10 minutes"),
  "booked-today": booked("Between 4 and 6 pm today"),
  "booked-tomorrow": booked("Between 9 and 11 am tomorrow"),
};

function booked(when: string): Step {
  return {
    say: ["Done. Your expert will have this conversation in front of them, so you won't need to repeat yourself."],
    outcome: {
      kind: "booked",
      title: "Callback booked",
      rows: [
        { label: "We'll call", value: "+91 98765 43210" },
        { label: "When", value: when },
      ],
      note: "This prototype doesn't place a call.",
    },
    choices: [],
  };
}

/** Where a conversation can go once a step has nothing more to offer. */
export const closingChoices: Choice[] = [expert];
