"use client";

import Link from "next/link";
import { ClaimRow } from "@/components/claims/claim-bits";
import { ClaimsTopics } from "@/components/claims/claims-support";
import { buttonClass } from "@/components/ui/buttons";
import { cardClass } from "@/components/ui/card-bits";
import { claimHref, claimsHref, newClaimHref, useClaims, useHydrated } from "@/lib/claims";
import type { Customer } from "@/lib/routes";

/**
 * Claims beside the policy: the open ones (up to two), Start a claim (the
 * page's one filled action), All claims once there are some, and the claims
 * questions from Claims support. Laid out for the 330px column.
 */
export function PolicyClaimsCard({ policyId, customer }: { policyId: string; customer: Customer }) {
  const hydrated = useHydrated();
  const claims = useClaims(policyId);

  return (
    <section aria-labelledby="claims-card-title" className={`${cardClass} p-5 pb-3`}>
      <h2 id="claims-card-title" className="text-[17px] leading-[22px] font-semibold tracking-[-0.022em] text-label">
        Claims
      </h2>
      <p className={`mt-0.5 text-[13px] leading-[18px] text-pretty text-label-secondary tabular-nums ${hydrated ? "" : "min-h-9"}`}>
        {!hydrated
          ? null
          : claims.length === 0
            ? "No open claims."
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

      {/* Claims support, folded in: the questions people have before claiming. */}
      <div className="-mx-5 mt-5 border-t border-separator pt-4">
        <h3 className="px-5 text-[13px] leading-[18px] font-semibold text-label-secondary">Questions about claims</h3>
        <ClaimsTopics
          only={["make-claim", "documents", "covered"]}
          rename={{ "make-claim": { label: "Which kind of claim?", hint: "Cashless or reimbursement" } }}
          className="mt-1.5 px-2"
        />
      </div>
    </section>
  );
}
