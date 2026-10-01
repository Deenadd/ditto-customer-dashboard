"use client";

import Link from "next/link";
import { ClaimRow } from "@/components/claims/claim-bits";
import { buttonClass } from "@/components/ui/buttons";
import { cardClass } from "@/components/ui/card-bits";
import { claimHref, claimsHref, newClaimHref, useClaims, useHydrated } from "@/lib/claims";
import type { Customer } from "@/lib/routes";

/**
 * Claims, under Claims support beside the policy: the open ones (up to two),
 * Start a claim (the page's one filled action) and, once there are claims,
 * a way to see them all. Laid out for the 330px column.
 */
export function PolicyClaimsCard({ policyId, customer }: { policyId: string; customer: Customer }) {
  const hydrated = useHydrated();
  const claims = useClaims(policyId);

  return (
    <section aria-labelledby="claims-card-title" className={`${cardClass} p-5`}>
      <h2 id="claims-card-title" className="text-[17px] leading-[22px] font-semibold tracking-[-0.022em] text-label">
        Claims
      </h2>
      <p className={`mt-0.5 text-[13px] leading-[18px] text-pretty text-label-secondary tabular-nums ${hydrated ? "" : "min-h-9"}`}>
        {!hydrated
          ? null
          : claims.length === 0
            ? "No open claims. Start one for cashless treatment at a network hospital."
            : claims.length === 1
              ? "1 open claim"
              : `${claims.length} open claims`}
      </p>
      {hydrated && claims.length ? (
        <ul className="-mx-3 mt-2 flex flex-col gap-0.5">
          {claims.slice(0, 2).map((claim) => (
            <li key={claim.id}>
              <ClaimRow claim={claim} href={claimHref(policyId, claim.id, customer)} />
            </li>
          ))}
        </ul>
      ) : null}
      <div className="mt-4 flex gap-2">
        <Link href={newClaimHref(policyId, customer)} className={`${buttonClass("filled", "medium")} flex-1`}>
          Start a claim
        </Link>
        {hydrated && claims.length ? (
          <Link href={claimsHref(policyId, customer)} className={`${buttonClass("tinted", "medium")} flex-1`}>
            All claims
          </Link>
        ) : null}
      </div>
    </section>
  );
}
