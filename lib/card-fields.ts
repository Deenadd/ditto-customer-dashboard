import type { ActivePolicy, Field } from "@/lib/dashboard-data";

/**
 * The four facts on a card's front. A term card shows what it costs a
 * year; a health card shows how many claims it has had, which lives in
 * this browser, so it's a dash until the page has read it.
 */
export function cardFields(policy: ActivePolicy, claims: number | null): Field[] {
  const third = policy.premium
    ? { label: "Yearly premium", value: policy.premium }
    : { label: "Total claims", value: claims === null ? "–" : claims === 0 ? "None yet" : String(claims) };
  return [
    { label: "Policy number", value: policy.policyNumber },
    { label: "Sum insured", value: policy.sumInsured },
    third,
    policy.term,
  ];
}
