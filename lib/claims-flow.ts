/**
 * The claims support conversation: a small decision tree. Each step says a
 * few things, then either offers answers (each leading to another step) or
 * ends with an outcome. Guidance is general and written for this prototype;
 * the policy wording has the exact terms.
 */

export type TopicId = "make-claim" | "documents" | "covered" | "track";

export type Choice = { label: string; next: string } | { label: string; action: "expert" };

export type Outcome = {
  title: string;
  /** Numbered steps, in order. */
  steps?: string[];
  /** A checklist of documents. */
  documents?: string[];
  note?: string;
};

export type Step = {
  say: string[];
  choices?: Choice[];
  outcome?: Outcome;
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

const expert: Choice = { label: "Talk to a claims expert", action: "expert" };

export const steps: Record<string, Step> = {
  "which-policy": {
    say: ["Let's get your claim started. Which policy is it for?"],
    choices: [
      { label: "Your Health complete (Care Health)", next: "treatment" },
      { label: "Smart Secure Plus (Max Life)", next: "term" },
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
      title: "Cashless claim",
      steps: [
        "Show your health card and photo ID at the hospital's insurance desk.",
        "The hospital sends a pre-authorisation request to Care Health, ideally 2 to 3 days before admission.",
        "Care Health approves the request, and the hospital bills them directly.",
        "At discharge, you pay only for items your policy doesn't cover.",
      ],
      note: "General guidance for this prototype. Your policy wording has the exact terms.",
    },
  },
  "cashless-emergency": {
    say: ["You can use a cashless claim, even in an emergency. Here's how it goes."],
    outcome: {
      title: "Cashless claim in an emergency",
      steps: [
        "Show your health card and photo ID at the hospital's insurance desk when you're admitted.",
        "The hospital sends a pre-authorisation request to Care Health right away.",
        "Care Health approves the request, and the hospital bills them directly.",
        "At discharge, you pay only for items your policy doesn't cover.",
      ],
      note: "General guidance for this prototype. Your policy wording has the exact terms.",
    },
  },
  reimbursement: {
    say: ["You'll make a reimbursement claim: you pay first, and Care Health pays you back."],
    outcome: {
      title: "Reimbursement claim",
      steps: [
        "Pay the hospital and keep every original bill, receipt and report.",
        "Send the claim form and your documents within 30 days of discharge.",
        "Care Health reviews the claim and pays the approved amount to your bank account.",
      ],
      note: "General guidance for this prototype. Your policy wording has the exact terms.",
    },
    choices: [{ label: "See the documents I'll need", next: "documents" }],
  },
  documents: {
    say: ["Here's what to keep for a hospitalisation claim."],
    outcome: {
      title: "Documents for a claim",
      documents: [
        "Signed claim form",
        "Discharge summary",
        "Final hospital bill and payment receipts",
        "Pharmacy bills with prescriptions",
        "Test and investigation reports",
        "Photo ID of the patient",
        "A cancelled cheque, for the payout",
      ],
      note: "Your Aadhaar card is already in your saved documents, so you can reuse it as photo ID.",
    },
  },
  covered: {
    say: ["What would you like to check on Your Health complete?"],
    choices: [
      { label: "Room rent", next: "covered-room" },
      { label: "Before and after a stay", next: "covered-stay" },
      { label: "Maternity", next: "covered-maternity" },
      { label: "Treatment at home", next: "covered-home" },
    ],
  },
  "covered-room": {
    say: ["You can take a single private room with air conditioning."],
  },
  "covered-stay": {
    say: [
      "Medical costs in the 60 days before you're admitted are covered.",
      "So are costs in the 90 days after you're discharged.",
    ],
  },
  "covered-maternity": {
    say: ["Delivery and newborn care are covered up to ₹30,000."],
  },
  "covered-home": {
    say: [
      "Treatment at home is covered when a doctor advises it and a hospital bed isn't available.",
      "Choosing treatment at home when a bed is available isn't covered.",
    ],
  },
  track: {
    say: [
      "You don't have an open claim right now.",
      "When you make one, you can follow it here and in your notifications.",
    ],
    choices: [{ label: "Make a claim", next: "which-policy" }],
  },
};

/** Where every conversation can go once a step has nothing more to offer. */
export const closingChoices: Choice[] = [expert];

export const expertReply = [
  "We'll connect you with a claims expert, who'll pick up right here.",
  "This is a prototype, so no chat opens yet.",
];
