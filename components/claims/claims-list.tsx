"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ClaimRow } from "@/components/claims/claim-bits";
import { Breadcrumbs } from "@/components/ui/breadcrumb";
import { buttonClass } from "@/components/ui/buttons";
import { cardClass } from "@/components/ui/card-bits";
import { IconClaim } from "@/components/ui/icons";
import { SegmentedLinks } from "@/components/ui/segmented";
import { Bone, Loading } from "@/components/ui/skeleton";
import {
  canRestoreClaim,
  claimHref,
  claimsHref,
  newClaimHref,
  restoreClaim,
  useClaims,
  useHydrated,
} from "@/lib/claims";
import { policyDetail } from "@/lib/policy-detail";
import { dashboardHref, policyHref, type Customer } from "@/lib/routes";

/**
 * Every claim on the health policy. Open claims are under Active; Past is
 * where settled ones will go, and is empty for now. After a delete, a note
 * says which claim went, with Undo while this visit lasts.
 */
export function ClaimsList({ customer, view, deleted }: { customer: Customer; view: "active" | "past"; deleted?: string }) {
  const router = useRouter();
  const hydrated = useHydrated();
  const claims = useClaims(policyDetail.id);
  const shown = view === "active" ? claims : [];
  const [restored, setRestored] = useState<string | null>(null);

  return (
    <>
      <Breadcrumbs
        items={[
          { label: "Active policies", href: dashboardHref({ tab: "active", customer }) },
          { label: policyDetail.name, href: policyHref(policyDetail.id, customer) },
          { label: "Claims" },
        ]}
      />

      <header className="mt-4 flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-[28px] leading-[34px] font-bold tracking-[-0.025em] text-label">Claims</h1>
          <p className="mt-1 text-[15px] leading-5 text-pretty text-label-secondary">On {policyDetail.name}</p>
        </div>
        <Link href={newClaimHref(policyDetail.id, customer)} className={buttonClass("filled", "medium")}>
          Start a claim
        </Link>
      </header>

      {deleted || restored ? (
        <p
          role="status"
          className="mt-5 flex min-h-12 flex-wrap items-center justify-between gap-x-3 gap-y-1 rounded-[14px] bg-fill py-2 pr-2 pl-4 text-[15px] leading-5 text-label-secondary"
        >
          {restored ? (
            <span>
              Claim <span className="font-medium text-label tabular-nums">{restored}</span> is back in your claims.
            </span>
          ) : (
            <>
              <span>
                Claim <span className="font-medium text-label tabular-nums">{deleted}</span> was deleted.
              </span>
              {hydrated && deleted && canRestoreClaim(deleted) ? (
                <button
                  type="button"
                  onClick={() => {
                    if (!restoreClaim(deleted)) return;
                    setRestored(deleted);
                    router.replace(claimsHref(policyDetail.id, customer));
                  }}
                  className={buttonClass("plain", "medium")}
                >
                  Undo
                </button>
              ) : null}
            </>
          )}
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

      <section aria-label={view === "active" ? "Active claims" : "Past claims"} className="mt-4">
        {!hydrated ? (
          <Loading label="Loading your claims" className="flex flex-col gap-3">
            {[0, 1].map((row) => (
              <div key={row} className={`${cardClass} flex items-center gap-3 p-5`}>
                <Bone className="size-11 rounded-[11px]" />
                <div className="flex flex-1 flex-col gap-2">
                  <Bone className="h-4 w-3/5" />
                  <Bone className="h-3 w-2/5" />
                </div>
              </div>
            ))}
          </Loading>
        ) : shown.length ? (
          /* Each claim is its own card. The row inside keeps an 8px inset, so
             its 14px hover corners sit concentric with the card's 22px. */
          <ul className="flex flex-col gap-3">
            {shown.map((claim) => (
              <li key={claim.id} className={`${cardClass} p-2`}>
                <ClaimRow claim={claim} href={claimHref(policyDetail.id, claim.id, customer)} />
              </li>
            ))}
          </ul>
        ) : (
          <div className={`${cardClass} flex flex-col items-center px-6 py-12 text-center`}>
            <span className="grid size-14 place-items-center rounded-[14px] bg-accent-tint text-accent">
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
