/**
 * The one policy with a detail page in the design: node 149:9188,
 * "customer dashboard / home screen / active policies / policy view".
 */

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
  kind: "Health Insurance",
  fields: [
    { label: "Policy No", value: "474-981-34EDH20" },
    { label: "Sum Insured", value: "₹5,00,00,000" },
    { label: "Coverage Type", value: "Family floater" },
    { label: "Members Covered", value: "Family of 4" },
    { label: "Status", value: "Policy Issued" },
    { label: "Your Premium", value: "₹14,998.00" },
    { label: "Booking date", value: "24, Sep 2021" },
    { label: "Valid Till", value: "19 Aug, 2025" },
  ],
  family: [
    { name: "Pavithra Luthra", relation: "You", dob: "14 Jul, 1995" },
    { name: "Kelly Williams", relation: "Wife", dob: "25 Oct, 1998" },
    { name: "Rich Wilson", relation: "Son", dob: "19 Oct, 2010" },
    { name: "Mason Phillips", relation: "Father", dob: "07 Sep, 1970" },
  ],
  addOns: ["Personal accident cover", "Room rent waiver", "Top-up cover", "OPD Care"],
};

const icon = (name: string, group: string, bleed: string): CoverIcon => ({
  src: `/dashboard/cover/${name}.svg`,
  group,
  bleed,
});

/** Two columns, read across then down, as laid out in node 149:9378. */
export const covered: CoverItem[] = [
  {
    title: "Hospitalization",
    description: "Covered upto ₹10 Lakh",
    icon: icon("hospitalization", "0", "0"),
  },
  {
    title: "Room Category",
    description: "Can take Single Private A/C room",
    icon: icon("room-category", "6.25% 3.13% 3.13% 3.13%", "-1.31% -2.86% -2.96% -2.86%"),
  },
  {
    title: "Pre-Hospitalization",
    description: "Expenses incurred in 60 days leading to hospitalization are covered",
    icon: icon("pre-hospitalization", "10.71% 3.57% 3.57% 3.57%", "-3.13% -2.88%"),
  },
  {
    title: "Post-Hospitalization",
    description: "All medical expenses during 90 days post discharge are covered",
    icon: icon("post-hospitalization", "14.58% 4.16% 14.59% 4.17%", "-3.78% -2.92%"),
  },
  {
    title: "Maternity",
    description: "Covers maternity expenses upto 30,000/-",
    icon: icon("maternity", "3.57% 16.98% 3.57% 17.86%", "-2.88% -4.11%"),
  },
  {
    title: "Day Care Treatments",
    description: "Covers maternity expenses upto 30,000/-",
    icon: icon("day-care", "3.57% 17.55% 3.57% 17.86%", "-2.88% -4.15%"),
  },
  {
    title: "Domiciliary Treatment",
    description: "Covers maternity expenses upto 30,000/-",
    icon: icon("domiciliary", "7.14% 4.76% 5.36% 3.57%", "-3.96% -2.92% -3.06% -2.92%"),
  },
  {
    title: "Ayush Treatments",
    description: "Covers maternity expenses upto 30,000/-",
    icon: icon("ayush", "5%", "-2.98%"),
  },
];

/** Node 149:9470. */
export const notCovered: Exclusion[] = [
  {
    label: "Suicide or Self-inflicted injury",
    icon: icon("ex-self-harm", "4.17% 8.75% 4.58% 8.75%", "-4.11% -4.55%"),
  },
  {
    label: "Domiciliary Treatment (Treatments taken at home)",
    icon: icon("ex-home", "0", "0"),
  },
  {
    label: "Unproven, experimental Treatments",
    icon: icon("ex-experimental", "4.47% 12.5% 3.13% 12.49%", "-4.06% -5%"),
  },
];

/** The eight links in node 149:9201, repeats and all, in the drawn order. */
export const quickLinks = [
  "Guide to cashless claims",
  "Guide to Reimbursement",
  "Network Hospitals",
  "Look into FAQs",
  "Guide to cashless claims",
  "Guide to Reimbursement",
  "Network Hospitals",
  "Look into FAQs",
];
