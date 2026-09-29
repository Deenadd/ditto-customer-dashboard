/**
 * Everything the dashboard shows, copied from the Figma page (file
 * kalCtplJimHm1xtOJGC60d, page 5:5). There is no backend: one customer, Peter
 * Parker, in two states — with pending applications, and with none.
 */

export type Insurer = "maxlife" | "care";

export type Field = { label: string; value: string };

export type ApplicationStatus =
  | "pending-uploads"
  | "missing-details"
  | "verification";

export type Application = {
  id: string;
  insurer: Insurer;
  name: string;
  kind: string;
  applicationNo: string;
  status: ApplicationStatus;
  fields: Field[];
  addOns: string[];
};

export type Member = { name: string; dob: string; primary?: boolean };

export type ActivePolicy = {
  id: string;
  insurer: Insurer;
  name: string;
  kind: string;
  policyNumber: string;
  sumInsured: string;
  coverageType: string;
  /** "Valid Till" for health cover, "Coverage till" for term cover. */
  term: Field;
  /** Health cards list everyone covered; term cards split member and nominee. */
  people:
    | { layout: "members"; members: Member[] }
    | { layout: "member-nominee"; member: Member; nominee: Member };
  /** Only the health policy has a detail page in the design. */
  hasDetail?: boolean;
};

export type RejectedApplication = {
  id: string;
  insurer: Insurer;
  name: string;
  kind: string;
  applicationNo: string;
  reason: string;
};

export type SavedDocument = {
  id: string;
  title: string;
  owner: string;
  type: string;
  /** Income Proof is drawn as a stack of two pages. */
  multiPage?: boolean;
};

export const customer = {
  firstName: "Peter",
  name: "Peter Parker",
  memberSince: "02 Jan, 2024",
};

const termFields = (): Field[] => [
  { label: "Sum Insured", value: "₹5,00,00,000" },
  { label: "Coverage Type", value: "Protection plan" },
  { label: "Cover till", value: "70 years" },
  { label: "Nominee", value: "Pavithra Luthra" },
];

const healthFields = (): Field[] => [
  { label: "Sum Insured", value: "₹5,00,00,000" },
  { label: "Coverage Type", value: "Family floater" },
  { label: "Members Covered", value: "Family of 4" },
  { label: "Valid Till", value: "19 Aug, 2025" },
];

const termAddOns = [
  "Partner Care Rider",
  "Accidental Death Benefit",
  "Terminal Illness Benefit",
];

const healthAddOns = [
  "Personal accident cover",
  "Room rent waiver",
  "Top-up cover",
  "OPD Care",
];

/** Card view, node 149:8862: grouped by what the customer has to do next. */
export const applicationGroups: { title: string; items: Application[] }[] = [
  {
    title: "Pending uploads and missing details",
    items: [
      {
        id: "maxlife-uploads",
        insurer: "maxlife",
        name: "Max Life Smart Secure Plus",
        kind: "Term Insurance",
        applicationNo: "#12345678921",
        status: "pending-uploads",
        fields: termFields(),
        addOns: termAddOns,
      },
      {
        id: "care-missing",
        insurer: "care",
        name: "Care health NCB Super Premium with UAR",
        kind: "Health Insurance",
        applicationNo: "#12345678921",
        status: "missing-details",
        fields: healthFields(),
        addOns: termAddOns,
      },
    ],
  },
  {
    title: "Awaiting insurer confirmation",
    items: [
      {
        id: "maxlife-verification",
        insurer: "maxlife",
        name: "Max Life Smart Secure Plus",
        kind: "Term Insurance",
        applicationNo: "#12345678921",
        status: "verification",
        fields: termFields(),
        addOns: termAddOns,
      },
      {
        id: "care-verification",
        insurer: "care",
        name: "Care health NCB Super Premium with UAR",
        kind: "Health Insurance",
        applicationNo: "#12345678921",
        status: "verification",
        fields: healthFields(),
        addOns: healthAddOns,
      },
    ],
  },
];

const byId = (id: string) =>
  applicationGroups.flatMap((group) => group.items).find((a) => a.id === id)!;

/** Timeline view, node 149:9509: the same applications by latest update. */
export const applicationTimeline: {
  date: string;
  current?: boolean;
  items: Application[];
}[] = [
  {
    date: "Today",
    current: true,
    items: [byId("care-verification"), byId("maxlife-uploads")],
  },
  { date: "19 Aug, 2024", items: [byId("care-missing")] },
  { date: "05 Jun, 2024", items: [byId("maxlife-verification")] },
];

export const applicationCount = applicationGroups.reduce(
  (count, group) => count + group.items.length,
  0,
);

const familyMembers: Member[] = [
  { name: "Bhanu Harish", dob: "17-Nov-1990", primary: true },
  { name: "Kanya Parameswari", dob: "02-Jan-1998" },
  { name: "Venkata Ramesh", dob: "22-Feb-2001" },
  { name: "Sanya Gupta", dob: "19-Oct-2003" },
];

/** Active policies, node 149:9845. */
export const activePolicyGroups: { title: string; items: ActivePolicy[] }[] = [
  {
    title: "Health Insurance",
    items: [
      {
        id: "474-981-34EDH20",
        insurer: "care",
        name: "Your Health complete",
        kind: "Health Insurance",
        policyNumber: "417734634188200",
        sumInsured: "₹15,00,000",
        coverageType: "Protection plan",
        term: { label: "Valid Till", value: "17 Aug, 2043" },
        people: { layout: "members", members: familyMembers },
        hasDetail: true,
      },
    ],
  },
  {
    title: "Term Insurance",
    items: [
      {
        id: "892145367201933",
        insurer: "maxlife",
        name: "Smart Secure Plus",
        kind: "Term Insurance",
        policyNumber: "892145367201933",
        sumInsured: "₹2,50,00,000",
        coverageType: "Protection plan",
        term: { label: "Coverage till", value: "65 years" },
        people: {
          layout: "member-nominee",
          member: { name: "Bhanu Harish", dob: "17-Nov-1990", primary: true },
          nominee: { name: "Kanya Parameswari", dob: "02-Jan-1998" },
        },
      },
      {
        id: "574309218765432",
        insurer: "maxlife",
        name: "Smart Secure Plus",
        kind: "Term Insurance",
        policyNumber: "574309218765432",
        sumInsured: "₹2,50,00,000",
        coverageType: "Super Protection",
        term: { label: "Coverage till", value: "72 years" },
        people: {
          layout: "member-nominee",
          member: {
            name: "Kanya Parameswari",
            dob: "02-Jan-1998",
            primary: true,
          },
          nominee: { name: "Bhanu Harish", dob: "17-Nov-1990" },
        },
      },
    ],
  },
];

export const activePolicyCount = activePolicyGroups.reduce(
  (count, group) => count + group.items.length,
  0,
);

/** Inactive policies, node 149:10213. */
export const expiredPolicies: ActivePolicy[] = [
  {
    id: "expired-417734634188200",
    insurer: "care",
    name: "Your Health complete",
    kind: "Health Insurance",
    policyNumber: "417734634188200",
    sumInsured: "₹15,00,000",
    coverageType: "Protection plan",
    term: { label: "Valid Till", value: "17 Aug, 2043" },
    people: { layout: "members", members: familyMembers },
  },
];

const rejectionReason =
  "Your ITR files and Salary slips are incorrect and you need submit Indian citizenship proof.";

export const rejectedApplications: RejectedApplication[] = [
  {
    id: "rejected-1",
    insurer: "care",
    name: "Care health NCB Super Premium with UAR",
    kind: "Health Insurance",
    applicationNo: "#12345678921",
    reason: rejectionReason,
  },
  {
    id: "rejected-2",
    insurer: "care",
    name: "Care health NCB Super Premium with UAR",
    kind: "Health Insurance",
    applicationNo: "#12345678921",
    reason: rejectionReason,
  },
];

export const inactiveCount = expiredPolicies.length + rejectedApplications.length;

/** Requirement Request count on the welcome card. */
export const requirementRequests = 4;

/** Document Stack, node 149:8955. */
export const savedDocuments: SavedDocument[] = [
  {
    id: "income",
    title: "Income Proof",
    owner: "Peter Parker",
    type: "SalarySlip",
    multiPage: true,
  },
  { id: "photo", title: "Photo ID", owner: "Sanya Gupta", type: "Aadhaar Card" },
  {
    id: "address",
    title: "Address Proof",
    owner: "Peter Parker",
    type: "Aadhaar Card",
  },
  { id: "age", title: "Age Proof", owner: "Peter Parker", type: "Aadhaar Card" },
];
