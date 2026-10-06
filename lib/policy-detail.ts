/**
 * The one policy with a detail page in the design: node 149:9188,
 * "customer dashboard / home screen / active policies / policy view".
 */

import { ownFamily } from "@/lib/people";

/** Which line icon a benefit or exclusion is drawn with (see coverIcons in
    components/ui/icons.tsx): one simple set, in the interface's stroke. */
export type CoverIcon =
  | "hospital"
  | "room"
  | "before"
  | "after"
  | "maternity"
  | "day-care"
  | "home"
  | "ayush"
  | "self-harm"
  | "home-by-choice"
  | "experimental";

export type CoverItem = {
  title: string;
  description: string;
  icon: CoverIcon;
};

export type Exclusion = {
  label: string;
  icon: CoverIcon;
};

export const policyDetail = {
  id: "474-981-34EDH20",
  insurer: "care" as const,
  name: "Care health NCB Super Premium with UAR",
  kind: "Health insurance",
  fields: [
    { label: "Policy number", value: "474-981-34EDH20" },
    { label: "Sum insured", value: "₹5,00,00,000" },
    { label: "Coverage type", value: "Family floater" },
    { label: "Members covered", value: "Family of 4" },
    { label: "Status", value: "Policy issued" },
    { label: "Premium", value: "₹14,998 a year" },
    { label: "Booked on", value: "24 Sep 2021" },
    { label: "Valid till", value: "19 Aug 2027" },
  ],
  /* Arjun's own family floater: him, his wife and their two children. */
  family: ownFamily,
  addOns: ["Personal accident cover", "Room rent waiver", "Top-up cover", "OPD care"],
};


/** Two columns, read across then down, as laid out in node 149:9378. */
export const covered: CoverItem[] = [
  {
    title: "Hospitalisation",
    description: "Hospital stays of 24 hours or more, up to ₹10 lakh a year",
    icon: "hospital",
  },
  {
    title: "Room category",
    description: "A single private room with air conditioning",
    icon: "room",
  },
  {
    title: "Before hospitalisation",
    description: "Medical costs in the 60 days before you’re admitted",
    icon: "before",
  },
  {
    title: "After hospitalisation",
    description: "Medical costs in the 90 days after you’re discharged",
    icon: "after",
  },
  {
    title: "Maternity",
    description: "Delivery and newborn care, up to ₹30,000",
    icon: "maternity",
  },
  {
    title: "Day-care treatments",
    description: "Procedures that don’t need an overnight stay, like cataract surgery or dialysis",
    icon: "day-care",
  },
  {
    title: "Treatment at home",
    description: "When a doctor advises it and a hospital bed isn’t available",
    icon: "home",
  },
  {
    title: "AYUSH treatments",
    description: "Ayurveda, yoga, Unani, Siddha and homeopathy, in a recognised hospital",
    icon: "ayush",
  },
];

/** Node 149:9470. */
export const notCovered: Exclusion[] = [
  {
    label: "Self-inflicted injury",
    icon: "self-harm",
  },
  {
    label: "Treatment at home by choice, when a hospital bed is available",
    icon: "home-by-choice",
  },
  {
    label: "Unproven or experimental treatment",
    icon: "experimental",
  },
];
