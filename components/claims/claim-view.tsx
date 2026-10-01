"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Note } from "@/components/claims/claim-bits";
import { Monogram } from "@/components/dashboard/policy-pair";
import { BackLink } from "@/components/ui/back-link";
import { Button } from "@/components/ui/buttons";
import { StatusPill, cardClass } from "@/components/ui/card-bits";
import { IconCheck } from "@/components/ui/icons";
import { InsurerLogo } from "@/components/ui/insurer-logo";
import {
  categoryLabel,
  claimsHref,
  deleteClaim,
  formatDate,
  stageLabel,
  useClaims,
  useHydrated,
  type Claim,
} from "@/lib/claims";
import { policyDetail } from "@/lib/policy-detail";
import type { Customer } from "@/lib/routes";

const cardTitle = "text-[17px] leading-[22px] font-semibold tracking-[-0.022em] text-label";

const journey = [
  { title: "Request received", body: "We have your request and will share it with the hospital." },
  { title: "Pre-authorisation", body: "The hospital asks Care Health to approve the treatment, ideally 2 to 3 days before admission." },
  { title: "Approval", body: "Care Health approves the request and tells the hospital how much it covers." },
  { title: "Discharge", body: "The hospital bills Care Health directly. You pay only for anything the policy doesn't cover." },
];

/** A cashless claim: where it stands, what happens next, what to show at the hospital, and its details. */
export function ClaimView({ claimId, customer, created }: { claimId: string; customer: Customer; created: boolean }) {
  const hydrated = useHydrated();
  const claims = useClaims(policyDetail.id);
  const claim = claims.find((item) => item.id === claimId);

  if (!hydrated) return <div className="min-h-[60dvh]" />;

  if (!claim) {
    return (
      <div className={`${cardClass} mx-auto mt-6 max-w-[520px] px-6 py-10 text-center`}>
        <h1 className="text-[22px] leading-7 font-semibold tracking-[-0.02em] text-label">This claim isn&apos;t here</h1>
        <p className="mt-2 text-[15px] leading-5 text-pretty text-label-secondary">
          It may have been deleted, or made in another browser. Claims in this prototype stay in the browser they were made in.
        </p>
        <div className="mt-5">
          <BackLink href={claimsHref(policyDetail.id, customer)}>All claims</BackLink>
        </div>
      </div>
    );
  }

  return <ClaimDetail claim={claim} customer={customer} created={created} />;
}

function ClaimDetail({ claim, customer, created }: { claim: Claim; customer: Customer; created: boolean }) {
  const router = useRouter();
  const [copied, setCopied] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);

  async function copy() {
    try {
      await navigator.clipboard.writeText(claim.id);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      /* The reference is on screen to copy by hand. */
    }
  }

  const details = [
    { label: "Treatment", value: claim.treatment },
    { label: "Category", value: categoryLabel(claim.category) },
    { label: "Stage", value: stageLabel(claim) },
    { label: "Admission", value: claim.admission ? formatDate(claim.admission) : "Not decided yet" },
    { label: "Requested on", value: formatDate(claim.createdAt) },
  ];

  return (
    <>
      <BackLink href={claimsHref(policyDetail.id, customer)}>All claims</BackLink>

      <header className="mt-4">
        <h1 className="text-[28px] leading-[34px] font-bold tracking-[-0.025em] text-balance text-label">Your cashless claim</h1>
        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-2">
          <StatusPill status="received" />
          <span className="text-[13px] leading-[18px] text-label-secondary">
            Reference <span className="font-medium text-label tabular-nums">{claim.id}</span>
          </span>
          <button
            type="button"
            onClick={copy}
            className="-mx-1 h-7 rounded-[8px] px-2 text-[13px] leading-none font-medium text-accent-text transition-colors hover:bg-accent-tint"
          >
            {copied ? "Copied" : "Copy"}
          </button>
          <span role="status" className="sr-only">
            {copied ? "Reference copied." : ""}
          </span>
        </div>
      </header>

      {created ? (
        <p role="status" className="mt-5 flex items-center gap-2.5 rounded-[14px] bg-green-tint px-4 py-3 text-[15px] leading-5 text-green-text">
          <span aria-hidden className="grid size-6 shrink-0 place-items-center rounded-full bg-green-text text-white">
            <IconCheck size={14} />
          </span>
          Request sent. Updates on it will show up here.
        </p>
      ) : null}

      <div className="mt-6 flex flex-col gap-6">
        <section aria-labelledby="next-title" className={`${cardClass} p-5`}>
          <h2 id="next-title" className={cardTitle}>
            What happens next
          </h2>
          <ol className="mt-4 flex flex-col">
            {journey.map((item, index) => {
              const done = index === 0;
              return (
                <li key={item.title} className="relative flex gap-3 pb-5 last:pb-0">
                  {index < journey.length - 1 ? (
                    <span aria-hidden className="absolute top-7 bottom-1 left-[11.5px] w-px bg-separator" />
                  ) : null}
                  <span
                    aria-hidden
                    className={`grid size-6 shrink-0 place-items-center rounded-full text-[12px] font-semibold tabular-nums ${
                      done ? "bg-green-text text-white" : "bg-fill-strong text-label-secondary"
                    }`}
                  >
                    {done ? <IconCheck size={14} /> : index + 1}
                  </span>
                  <div className="min-w-0 pt-0.5">
                    <p className="text-[15px] leading-5 font-medium text-label">
                      {item.title}
                      <span className="sr-only">{done ? ", done" : ", to come"}</span>
                    </p>
                    <p className="mt-0.5 text-[13px] leading-[18px] text-pretty text-label-secondary">{item.body}</p>
                  </div>
                </li>
              );
            })}
          </ol>
        </section>

        <section aria-labelledby="card-title" className={`${cardClass} p-5`}>
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 id="card-title" className={cardTitle}>
                Show this at the hospital
              </h2>
              <p className="mt-0.5 text-[13px] leading-[18px] text-label-secondary">At the insurance desk, with a photo ID.</p>
            </div>
            <InsurerLogo insurer={policyDetail.insurer} size={44} />
          </div>
          <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-4 rounded-[14px] bg-fill px-4 py-4">
            {[
              { label: "Patient", value: claim.patient.name },
              { label: "Insurer", value: "Care Health" },
              { label: "Policy number", value: policyDetail.id },
              { label: "Sum insured", value: policyDetail.fields.find((f) => f.label === "Sum insured")?.value ?? "" },
              { label: "Valid till", value: policyDetail.fields.find((f) => f.label === "Valid till")?.value ?? "" },
            ].map((field) => (
              /* The policy number is too long to share a row on a phone. */
              <div key={field.label} className={`min-w-0 ${field.label === "Policy number" ? "max-sm:col-span-2" : ""}`}>
                <dt className="text-[12px] leading-4 text-label-secondary">{field.label}</dt>
                <dd className="mt-1 text-[15px] leading-5 font-medium tracking-[-0.01em] whitespace-nowrap text-label tabular-nums">{field.value}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section aria-labelledby="details-title" className={`${cardClass} p-5`}>
          <h2 id="details-title" className={cardTitle}>
            Claim details
          </h2>
          <div className="mt-4 flex items-center gap-3">
            <Monogram name={claim.patient.name} primary={claim.patient.relation === "You"} />
            <div className="min-w-0">
              <p className="text-[15px] leading-5 font-medium text-label">{claim.patient.name}</p>
              <p className="text-[13px] leading-[18px] text-label-secondary tabular-nums">
                {claim.patient.relation} · {claim.patient.age} years
              </p>
            </div>
          </div>
          <dl className="mt-4 divide-y divide-separator">
            {details.map((row) => (
              <div key={row.label} className="flex items-baseline justify-between gap-4 py-3 text-[15px] leading-5">
                <dt className="shrink-0 text-label-secondary">{row.label}</dt>
                <dd className="min-w-0 text-right font-medium break-words text-label tabular-nums">{row.value}</dd>
              </div>
            ))}
            <div className="flex items-baseline justify-between gap-4 py-3 text-[15px] leading-5">
              <dt className="shrink-0 text-label-secondary">Hospital</dt>
              <dd className="min-w-0 text-right">
                <span className="block font-medium break-words text-label">{claim.hospital?.name ?? "Not chosen yet"}</span>
                {claim.hospital ? (
                  <span className="block text-[13px] leading-[18px] text-label-secondary">{claim.hospital.address}</span>
                ) : null}
              </dd>
            </div>
          </dl>
          {claim.hospital && !claim.hospital.network ? (
            <div className="mt-3">
              <Note tone="warning">
                This hospital may not be in Care Health&apos;s network. We&apos;ll confirm, and help you claim the costs back if cashless isn&apos;t possible.
              </Note>
            </div>
          ) : null}
        </section>

        <section aria-labelledby="delete-title" className={`${cardClass} flex flex-wrap items-center justify-between gap-3 p-5`}>
          <div>
            <h2 id="delete-title" className="text-[15px] leading-5 font-semibold text-label">
              Didn&apos;t mean to make this claim?
            </h2>
            <p className="mt-0.5 text-[13px] leading-[18px] text-label-secondary">You can delete it while it&apos;s still a request.</p>
          </div>
          <Button variant="plain" className="text-red-text [@media(hover:hover)]:hover:bg-red-tint" onClick={() => dialogRef.current?.showModal()}>
            Delete claim
          </Button>
        </section>
      </div>

      <dialog
        ref={dialogRef}
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-body"
        className="m-auto w-[min(400px,calc(100vw-32px))] rounded-[22px] bg-surface p-0 text-label shadow-raised backdrop:bg-black/30 open:animate-pop"
      >
        <div className="p-6">
          <h2 id="delete-dialog-title" className="text-[20px] leading-6 font-semibold tracking-[-0.02em]">
            Delete this claim?
          </h2>
          <p id="delete-dialog-body" className="mt-2 text-[15px] leading-5 text-pretty text-label-secondary">
            {claim.id} for {claim.treatment} will be deleted. You can&apos;t undo this.
          </p>
          <div className="mt-6 grid grid-cols-2 gap-2">
            {/* Cancel comes first, so it has focus when the dialog opens. */}
            <Button variant="tinted" size="large" onClick={() => dialogRef.current?.close()} autoFocus>
              Cancel
            </Button>
            <Button
              variant="destructive"
              size="large"
              onClick={() => {
                deleteClaim(claim.id);
                router.replace(claimsHref(policyDetail.id, customer, `?deleted=${claim.id}`));
              }}
            >
              Delete claim
            </Button>
          </div>
        </div>
      </dialog>
    </>
  );
}
