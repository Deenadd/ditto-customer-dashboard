"use client";

import { NewClaimFlow } from "@/components/claims/new-claim-flow";
import { OneClaimFlow } from "@/components/claims/one-claim-flow";
import { useClaimFlowVersion } from "@/lib/claim-flow-version";
import type { Customer } from "@/lib/routes";

/** Make a claim in whichever version the switch at its foot has chosen. */
export function ClaimFlow({ customer }: { customer: Customer }) {
  const version = useClaimFlowVersion();
  return version === "v1" ? <OneClaimFlow customer={customer} /> : <NewClaimFlow customer={customer} />;
}
