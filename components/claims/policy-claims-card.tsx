"use client";

import Link from "next/link";
import { ClaimRow } from "@/components/claims/claim-bits";
import { buttonClass } from "@/components/ui/buttons";
import { cardClass } from "@/components/ui/card-bits";
import { claimHref, claimsHref, newClaimHref, useClaims, useHydrated } from "@/lib/claims";
import type { Customer } from "@/lib/routes";

/**
 * Claims, on the policy page: the open ones (up to two), a way to see them
 * all, and Start a claim, the page's one filled action.
 */
export function PolicyClaimsCard({ policyId, customer }: { policyId: string; customer: Customer }) {
  const hydrated = useHydrated();
  const claims = useClaims(policyId);

  return (
    <section aria-labelledby="claims-card-title" className={`${cardClass} p-5`}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 id="claims-card-title" className="text-[17px] leading-[22px] font-semibold tracking-[-0.022em] text-label">
            Claims
          </h2>
          <p className="mt-0.5 text-[13px] leading-[18px] text-label-secondary tabular-nums">
            {!hydrated
              ? " "
              : claims.length === 0
                ? "No open claims. Start one for cashless treatment at a network hospital."
                : claims.length === 1
                  ? "1 open claim"
                  : `${claims.length} open claims`}
          </p>
        </div>
        <div className="flex gap-2">
          {hydrated && claims.length ? (
            <Link href={claimsHref(policyId, customer)} className={buttonClass("tinted", "medium")}>
              All claims
            </Link>
          ) : null}
          <Link href={newClaimHref(policyId, customer)} className={buttonClass("filled", "medium")}>
            Start a claim
          </Link>
        </div>
      </div>
      {hydrated && claims.length ? (
        <ul className="-mx-2 mt-3 flex flex-col gap-0.5">
          {claims.slice(0, 2).map((claim) => (
            <li key={claim.id}>
              <ClaimRow claim={claim} href={claimHref(policyId, claim.id, customer)} />
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}
