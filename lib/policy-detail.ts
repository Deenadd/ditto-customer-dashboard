/**
 * The one policy with a detail page in the design: node 149:9188,
 * "customer dashboard / home screen / active policies / policy view".
 */

import { ownFamily } from "@/lib/people";

export type CoverIcon = {
  src: string;
  /** Where the icon's group sits inside its 28px frame, as Figma exports it. */
  group: string;
  /** How far the exported SVG overflows that group (stroke width). */
  bleed: string;
};

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

const icon = (name: string, group: string, bleed: string): CoverIcon => ({
  src: `/dashboard/cover/${name}.svg`,
  group,
  bleed,
});

/** Two columns, read across then down, as laid out in node 149:9378. */
export const covered: CoverItem[] = [
  {
    title: "Hospitalisation",
    description: "Hospital stays of 24 hours or more, up to ₹10 lakh a year",
    icon: icon("hospitalization", "0", "0"),
  },
  {
    title: "Room category",
    description: "A single private room with air conditioning",
    icon: icon("room-category", "6.25% 3.13% 3.13% 3.13%", "-1.31% -2.86% -2.96% -2.86%"),
  },
  {
    title: "Before hospitalisation",
    description: "Medical costs in the 60 days before you’re admitted",
    icon: icon("pre-hospitalization", "10.71% 3.57% 3.57% 3.57%", "-3.13% -2.88%"),
  },
  {
    title: "After hospitalisation",
    description: "Medical costs in the 90 days after you’re discharged",
    icon: icon("post-hospitalization", "14.58% 4.16% 14.59% 4.17%", "-3.78% -2.92%"),
  },
  {
    title: "Maternity",
    description: "Delivery and newborn care, up to ₹30,000",
    icon: icon("maternity", "3.57% 16.98% 3.57% 17.86%", "-2.88% -4.11%"),
  },
  {
    title: "Day-care treatments",
    description: "Procedures that don’t need an overnight stay, like cataract surgery or dialysis",
    icon: icon("day-care", "3.57% 17.55% 3.57% 17.86%", "-2.88% -4.15%"),
  },
  {
    title: "Treatment at home",
    description: "When a doctor advises it and a hospital bed isn’t available",
    icon: icon("domiciliary", "7.14% 4.76% 5.36% 3.57%", "-3.96% -2.92% -3.06% -2.92%"),
  },
  {
    title: "AYUSH treatments",
    description: "Ayurveda, yoga, Unani, Siddha and homeopathy, in a recognised hospital",
    icon: icon("ayush", "5%", "-2.98%"),
  },
];

/** Node 149:9470. */
export const notCovered: Exclusion[] = [
  {
    label: "Self-inflicted injury",
    icon: icon("ex-self-harm", "4.17% 8.75% 4.58% 8.75%", "-4.11% -4.55%"),
  },
  {
    label: "Treatment at home by choice, when a hospital bed is available",
    icon: icon("ex-home", "0", "0"),
  },
  {
    label: "Unproven or experimental treatment",
    icon: icon("ex-experimental", "4.47% 12.5% 3.13% 12.49%", "-4.06% -5%"),
  },
];
