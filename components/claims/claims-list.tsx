"use client";

import Link from "next/link";
import { ClaimRow } from "@/components/claims/claim-bits";
import { BackLink } from "@/components/ui/back-link";
import { buttonClass } from "@/components/ui/buttons";
import { cardClass } from "@/components/ui/card-bits";
import { IconClaim } from "@/components/ui/icons";
import { SegmentedLinks } from "@/components/ui/segmented";
import { claimHref, claimsHref, newClaimHref, useClaims, useHydrated } from "@/lib/claims";
import { policyDetail } from "@/lib/policy-detail";
import { policyHref, type Customer } from "@/lib/routes";

/**
 * Every claim on the health policy. Open claims are under Active; Past is
 * where settled ones will go, and is empty for now. After a delete, a note
 * says which claim went.
 */
export function ClaimsList({ customer, view, deleted }: { customer: Customer; view: "active" | "past"; deleted?: string }) {
  const hydrated = useHydrated();
  const claims = useClaims(policyDetail.id);
  const shown = view === "active" ? claims : [];

  return (
    <>
      <BackLink href={policyHref(policyDetail.id, customer)}>Policy</BackLink>

      <header className="mt-4 flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-[28px] leading-[34px] font-bold tracking-[-0.025em] text-label">Claims</h1>
          <p className="mt-1 text-[15px] leading-5 text-pretty text-label-secondary">On {policyDetail.name}</p>
        </div>
        <Link href={newClaimHref(policyDetail.id, customer)} className={buttonClass("filled", "medium")}>
          Start a claim
        </Link>
      </header>

      {deleted ? (
        <p role="status" className="mt-5 rounded-[14px] bg-fill px-4 py-3 text-[15px] leading-5 text-label-secondary">
          Claim <span className="font-medium text-label tabular-nums">{deleted}</span> was deleted.
        </p>
      ) : null}

      <div className="mt-6">
        <SegmentedLinks
          label="Claims"
          value={view}
          segments={[
            { value: "active", href: claimsHref(policyDetail.id, customer), label: "Active" },
            { value: "past", href: claimsHref(policyDetail.id, customer, "?view=past"), label: "Past" },
          ]}
        />
      </div>

      <section aria-label={view === "active" ? "Active claims" : "Past claims"} className={`${cardClass} mt-4 p-2`}>
        {!hydrated ? (
          <div className="h-[180px]" />
        ) : shown.length ? (
          <ul className="flex flex-col gap-0.5">
            {shown.map((claim) => (
              <li key={claim.id}>
                <ClaimRow claim={claim} href={claimHref(policyDetail.id, claim.id, customer)} />
              </li>
            ))}
          </ul>
        ) : (
          <div className="flex flex-col items-center px-6 py-12 text-center">
            <span className="grid size-14 place-items-center rounded-[16px] bg-accent-tint text-accent">
              <IconClaim size={26} />
            </span>
            <p className="mt-4 text-[17px] leading-[22px] font-semibold text-label">
              {view === "active" ? "No open claims" : "No past claims"}
            </p>
            <p className="mt-1 max-w-[320px] text-[15px] leading-5 text-pretty text-label-secondary">
              {view === "active"
                ? "When you start a claim, you can follow it here until it's settled."
                : "Settled claims move here, with what was paid."}
            </p>
          </div>
        )}
      </section>
    </>
  );
}
