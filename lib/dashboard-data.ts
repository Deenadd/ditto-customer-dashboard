/**
 * Everything the dashboard shows, copied from the Figma page (file
 * kalCtplJimHm1xtOJGC60d, page 5:5). There is no backend: one customer, Peter
 * Parker, in two states: with pending applications, and with none.
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
  memberSince: "2 Jan 2024",
};

const termFields = (): Field[] => [
  { label: "Sum insured", value: "₹5,00,00,000" },
  { label: "Coverage type", value: "Protection plan" },
  { label: "Cover till", value: "Age 70" },
  { label: "Nominee", value: "Pavithra Luthra" },
];

const healthFields = (): Field[] => [
  { label: "Sum insured", value: "₹5,00,00,000" },
  { label: "Coverage type", value: "Family floater" },
  { label: "Members covered", value: "Family of 4" },
  { label: "Valid till", value: "19 Aug 2025" },
];

const termAddOns = [
  "Partner care rider",
  "Accidental death benefit",
  "Terminal illness benefit",
];

const healthAddOns = [
  "Personal accident cover",
  "Room rent waiver",
  "Top-up cover",
  "OPD care",
];

/** Card view, node 149:8862: grouped by what the customer has to do next. */
export const applicationGroups: { title: string; items: Application[] }[] = [
  {
    title: "Needs your attention",
    items: [
      {
        id: "maxlife-uploads",
        insurer: "maxlife",
        name: "Max Life Smart Secure Plus",
        kind: "Term insurance",
        applicationNo: "12345678921",
        status: "pending-uploads",
        fields: termFields(),
        addOns: termAddOns,
      },
      {
        id: "care-missing",
        insurer: "care",
        name: "Care health NCB Super Premium with UAR",
        kind: "Health insurance",
        applicationNo: "12345678934",
        status: "missing-details",
        fields: healthFields(),
        addOns: termAddOns,
      },
    ],
  },
  {
    title: "With the insurer",
    items: [
      {
        id: "maxlife-verification",
        insurer: "maxlife",
        name: "Max Life Smart Secure Plus",
        kind: "Term insurance",
        applicationNo: "12345678947",
        status: "verification",
        fields: termFields(),
        addOns: termAddOns,
      },
      {
        id: "care-verification",
        insurer: "care",
        name: "Care health NCB Super Premium with UAR",
        kind: "Health insurance",
        applicationNo: "12345678958",
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
  { date: "19 Aug 2024", items: [byId("care-missing")] },
  { date: "5 Jun 2024", items: [byId("maxlife-verification")] },
];

export const applicationCount = applicationGroups.reduce(
  (count, group) => count + group.items.length,
  0,
);

const familyMembers: Member[] = [
  { name: "Bhanu Harish", dob: "17 Nov 1990", primary: true },
  { name: "Kanya Parameswari", dob: "2 Jan 1998" },
  { name: "Venkata Ramesh", dob: "22 Feb 2001" },
  { name: "Sanya Gupta", dob: "19 Oct 2003" },
];

/** Active policies, node 149:9845. */
export const activePolicyGroups: { title: string; items: ActivePolicy[] }[] = [
  {
    title: "Health insurance",
    items: [
      {
        id: "474-981-34EDH20",
        insurer: "care",
        name: "Your Health complete",
        kind: "Health insurance",
        policyNumber: "417734634188200",
        sumInsured: "₹15,00,000",
        coverageType: "Protection plan",
        term: { label: "Valid till", value: "17 Aug 2043" },
        people: { layout: "members", members: familyMembers },
        hasDetail: true,
      },
    ],
  },
  {
    title: "Term insurance",
    items: [
      {
        id: "892145367201933",
        insurer: "maxlife",
        name: "Smart Secure Plus",
        kind: "Term insurance",
        policyNumber: "892145367201933",
        sumInsured: "₹2,50,00,000",
        coverageType: "Protection plan",
        term: { label: "Cover till", value: "Age 65" },
        people: {
          layout: "member-nominee",
          member: { name: "Bhanu Harish", dob: "17 Nov 1990", primary: true },
          nominee: { name: "Kanya Parameswari", dob: "2 Jan 1998" },
        },
      },
      {
        id: "574309218765432",
        insurer: "maxlife",
        name: "Smart Secure Plus",
        kind: "Term insurance",
        policyNumber: "574309218765432",
        sumInsured: "₹2,50,00,000",
        coverageType: "Super Protection",
        term: { label: "Cover till", value: "Age 72" },
        people: {
          layout: "member-nominee",
          member: {
            name: "Kanya Parameswari",
            dob: "2 Jan 1998",
            primary: true,
          },
          nominee: { name: "Bhanu Harish", dob: "17 Nov 1990" },
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
    kind: "Health insurance",
    policyNumber: "417734634188200",
    sumInsured: "₹15,00,000",
    coverageType: "Protection plan",
    term: { label: "Expired on", value: "17 Aug 2024" },
    people: { layout: "members", members: familyMembers },
  },
];


export const rejectedApplications: RejectedApplication[] = [
  {
    id: "rejected-1",
    insurer: "care",
    name: "Care health NCB Super Premium with UAR",
    kind: "Health insurance",
    applicationNo: "12345678902",
    reason:
      "Your ITR and salary slips didn't match the income on your proposal, and we need proof of Indian citizenship.",
  },
  {
    id: "rejected-2",
    insurer: "care",
    name: "Care health NCB Super Premium with UAR",
    kind: "Health insurance",
    applicationNo: "12345678915",
    reason:
      "The insurer couldn't offer cover for the pre-existing conditions declared on this proposal.",
  },
];

export const inactiveCount = expiredPolicies.length + rejectedApplications.length;

/** Requirement Request count on the welcome card. */
export const requirementRequests = 4;

/** Document Stack, node 149:8955. */
export const savedDocuments: SavedDocument[] = [
  {
    id: "income",
    title: "Income proof",
    owner: "Peter Parker",
    type: "Salary slip",
    multiPage: true,
  },
  { id: "photo", title: "Photo ID", owner: "Sanya Gupta", type: "Aadhaar card" },
  {
    id: "address",
    title: "Address proof",
    owner: "Peter Parker",
    type: "Aadhaar card",
  },
  { id: "age", title: "Age proof", owner: "Peter Parker", type: "Aadhaar card" },
];
