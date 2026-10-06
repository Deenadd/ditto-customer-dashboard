"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Note } from "@/components/claims/claim-bits";
import { useCardConfig } from "@/components/dashboard/card-config";
import { PolicyCardFront } from "@/components/dashboard/health-card";
import { Asset } from "@/components/ui/asset";
import { BackLink } from "@/components/ui/back-link";
import { Button } from "@/components/ui/buttons";
import { StatusPill, cardClass } from "@/components/ui/card-bits";
import { IconCheck, IconDocuments, IconTrash } from "@/components/ui/icons";
import { GlareFace, GlareGroup } from "@/components/ui/glare";
import {
  categoryLabel,
  claimsHref,
  deleteClaim,
  formatDate,
  rupees,
  typeLabel,
  stageLabel,
  useClaims,
  useHydrated,
  type Claim,
} from "@/lib/claims";
import { activePolicyGroups } from "@/lib/dashboard-data";
import { policyDetail } from "@/lib/policy-detail";
import type { Customer } from "@/lib/routes";
import { lockScroll, unlockScroll } from "@/lib/use-scroll-lock";

const cardTitle = "text-[17px] leading-[22px] font-semibold tracking-[-0.022em] text-label";

const reimbursementJourney = [
  { title: "Request received", body: "We have your claim and documents." },
  { title: "Document check", body: "We review your documents within two working days, and tell you if anything's missing." },
  { title: "Care Health's review", body: "Care Health assesses the claim. You'll courier them the originals at this point." },
  { title: "Payout", body: "The approved amount goes to your bank account, usually within 30 days of the claim." },
];

const cashlessJourney = [
  { title: "Request received", body: "We have your request and will share it with the hospital." },
  { title: "Pre-authorisation", body: "The hospital asks Care Health to approve the treatment, ideally 2 to 3 days before admission." },
  { title: "Approval", body: "Care Health approves the request and tells the hospital how much it covers." },
  { title: "Discharge", body: "The hospital bills Care Health directly. You pay only for anything the policy doesn't cover." },
];

/**
 * A cashless claim: where it stands, the health card to show at the hospital
 * (with its glare, as on the dashboard), what happens next, and its details.
 * Delete sits quietly at the foot, behind a confirmation.
 */
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

/* The health policy as the dashboard draws it, for the card. */
const card = activePolicyGroups.flatMap((group) => group.items).find((item) => item.id === policyDetail.id)!;

function ClaimDetail({ claim, customer, created }: { claim: Claim; customer: Customer; created: boolean }) {
  const router = useRouter();
  const cardConfig = useCardConfig();
  const [copied, setCopied] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const keepRef = useRef<HTMLButtonElement>(null);

  async function copy() {
    try {
      await navigator.clipboard.writeText(claim.id);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      /* The reference is on screen to copy by hand. */
    }
  }

  const reimbursement = claim.type === "reimbursement";
  const journey = reimbursement ? reimbursementJourney : cashlessJourney;
  const files = Object.values(claim.documents ?? {}).flat();
  const details = reimbursement
    ? [
        { label: "Reason", value: claim.treatment },
        { label: "For", value: categoryLabel(claim.category) },
        { label: "Amount", value: rupees(claim.amount ?? 0) },
        {
          label: "Stay",
          value: claim.admission && claim.discharge ? `${formatDate(claim.admission)} to ${formatDate(claim.discharge)}` : "",
        },
        { label: "Documents", value: `${files.length} ${files.length === 1 ? "file" : "files"}` },
      ]
    : [
        { label: "Treatment", value: claim.treatment },
        { label: "Category", value: categoryLabel(claim.category) },
        { label: "Stage", value: stageLabel(claim) },
        { label: "Admission", value: claim.admission ? formatDate(claim.admission) : "Not decided yet" },
      ];

  return (
    <>
      <BackLink href={claimsHref(policyDetail.id, customer)}>All claims</BackLink>

      <header className="mt-4">
        {/* Named for who and where, so claims tell apart at a glance. */}
        <h1 className="text-[28px] leading-[34px] font-bold tracking-[-0.025em] text-balance text-label">
          {claim.patient.name}
          <span className="text-label-secondary max-sm:block">
            <span aria-hidden className="max-sm:hidden"> · </span>
            <span className="sr-only">, at </span>
            {claim.hospital?.name ?? `${typeLabel(claim)} claim`}
          </span>
        </h1>
        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-2">
          <StatusPill status="received" />
          <span className="text-[13px] leading-[18px] text-label-secondary tabular-nums">
            {claim.hospital ? `${typeLabel(claim)} claim · ` : ""}Requested {formatDate(claim.createdAt)}
          </span>
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

      {reimbursement ? (
        <section aria-labelledby="originals-title" className="mt-6 flex gap-3.5 rounded-[18px] bg-fill px-4 py-4">
          <span aria-hidden className="grid size-10 shrink-0 place-items-center rounded-[11px] bg-surface text-accent shadow-tile">
            <IconDocuments />
          </span>
          <div className="min-w-0">
            <h2 id="originals-title" className="text-[15px] leading-5 font-semibold text-label">
              Keep your original documents
            </h2>
            <p className="mt-0.5 text-[13px] leading-[18px] text-pretty text-label-secondary">
              Once we&apos;ve checked the copies, we&apos;ll email you where to courier the originals for Care Health&apos;s review.
              Quote reference <span className="font-medium text-label tabular-nums">{claim.id}</span>.
            </p>
          </div>
        </section>
      ) : (
      <section aria-labelledby="card-title" className="mt-6 grid items-center gap-5 sm:grid-cols-[minmax(0,380px)_1fr] sm:gap-7">
        <GlareGroup settings={cardConfig}>
          <GlareFace>
            <PolicyCardFront policy={card} download />
          </GlareFace>
        </GlareGroup>
        <div>
          <h2 id="card-title" className={cardTitle}>
            Show this at the hospital
          </h2>
          <p className="mt-1 text-[15px] leading-5 text-pretty text-label-secondary">
            At the insurance desk, with a photo ID. Give them your reference so they can find the request.
          </p>
          <dl className="mt-4 flex flex-col gap-3">
            <div>
              <dt className="text-[12px] leading-4 text-label-secondary">Patient</dt>
              <dd className="mt-0.5 text-[15px] leading-5 font-medium text-label">{claim.patient.name}</dd>
            </div>
            <div>
              <dt className="text-[12px] leading-4 text-label-secondary">Reference</dt>
              <dd className="mt-0.5 flex items-center gap-2">
                <span className="text-[15px] leading-5 font-medium text-label tabular-nums">{claim.id}</span>
                <button
                  type="button"
                  onClick={copy}
                  className="-my-1 h-7 rounded-[8px] px-2 text-[13px] leading-none font-medium text-accent-text transition-opacity active:opacity-50 [@media(hover:hover)]:hover:opacity-70"
                >
                  {copied ? "Copied" : "Copy"}
                </button>
              </dd>
            </div>
          </dl>
        </div>
      </section>
      )}

      <div className="mt-8 flex flex-col gap-6">
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



        <section aria-labelledby="details-title" className={`${cardClass} p-5`}>
          <h2 id="details-title" className={cardTitle}>
            Claim details
          </h2>
          <div className="mt-4 flex items-center gap-3">
            <Asset
              src={`/dashboard/health-card/${claim.patient.relation === "You" ? "member-primary" : "member"}.svg`}
              className="size-9 shrink-0"
            />
            <div className="min-w-0">
              <p className="text-[15px] leading-5 font-medium text-label">{claim.patient.name}</p>
              <p className="text-[13px] leading-[18px] text-label-secondary tabular-nums">
                {claim.patient.relation} · {claim.patient.age} years
              </p>
            </div>
          </div>
          <dl className="mt-4 divide-y divide-separator">
            {details.filter((row) => row.value).map((row) => (
              <div key={row.label} className="flex items-baseline justify-between gap-4 py-3 text-[15px] leading-5">
                <dt className="shrink-0 text-label-secondary">{row.label}</dt>
                <dd className="min-w-0 text-right font-medium break-words text-label tabular-nums">{row.value}</dd>
              </div>
            ))}
            <div className="flex items-baseline justify-between gap-4 py-3 text-[15px] leading-5">
              <dt className="shrink-0 text-label-secondary">Hospital</dt>
              <dd className="min-w-0 text-right">
                <span className="block font-medium break-words text-label">{claim.hospital?.name ?? "Not chosen yet"}</span>
                {claim.hospital?.address ? (
                  <span className="block text-[13px] leading-[18px] text-label-secondary">{claim.hospital.address}</span>
                ) : null}
              </dd>
            </div>
          </dl>
          {!reimbursement && claim.hospital && !claim.hospital.network ? (
            <div className="mt-3">
              <Note tone="warning">
                This hospital may not be in Care Health&apos;s network. We&apos;ll confirm, and help you claim the costs back if cashless isn&apos;t possible.
              </Note>
            </div>
          ) : null}
        </section>

      </div>

      {/* Deleting is set apart in its own card, as iOS sets apart a
          destructive row: it reads as an action, not a footnote, and the
          line under it says what happens before anyone commits. */}
      <section aria-label="Delete claim" className={`${cardClass} mt-6 p-2`}>
        <button
          type="button"
          onClick={() => {
            lockScroll();
            dialogRef.current?.showModal();
            /* The dialog would focus its first button, Delete; start on the
               safe choice instead. */
            keepRef.current?.focus();
          }}
          className="group flex w-full items-center gap-3 rounded-[14px] px-3 py-3 text-left transition-colors duration-150 ease-out active:bg-red-tint [@media(hover:hover)]:hover:bg-red-tint/60"
        >
          <span className="grid size-11 shrink-0 place-items-center rounded-[11px] bg-red-tint text-red-text">
            <IconTrash size={20} />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-[15px] leading-5 font-medium text-red-text">Delete claim</span>
            <span className="block text-[13px] leading-[18px] text-pretty text-label-secondary">
              Made it by mistake? The request is withdrawn and removed from your claims.
            </span>
          </span>
        </button>
      </section>

      <dialog
        ref={dialogRef}
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-body"
        onClose={unlockScroll}
        className="m-auto w-[min(400px,calc(100vw-32px))] rounded-[22px] bg-surface p-0 text-label shadow-raised backdrop:bg-black/30 open:animate-pop"
      >
        {/* An alert, Apple style: centred, the consequence in the title and
            the body, and buttons that say what they do. */}
        <div className="flex flex-col items-center px-6 pt-7 pb-6 text-center">
          <span aria-hidden className="grid size-12 place-items-center rounded-full bg-red-tint text-red-text">
            <IconTrash size={22} />
          </span>
          <h2 id="delete-dialog-title" className="mt-4 text-[20px] leading-6 font-semibold tracking-[-0.02em]">
            Delete claim {claim.id}?
          </h2>
          <p id="delete-dialog-body" className="mt-2 text-[15px] leading-5 text-pretty text-label-secondary">
            The request for {claim.patient.name}
            {claim.hospital ? ` at ${claim.hospital.name}` : ""} is withdrawn. You can&apos;t undo this.
          </p>
          <div className="mt-6 flex w-full flex-col gap-2">
            <Button
              variant="destructive"
              size="large"
              onClick={() => {
                deleteClaim(claim.id);
                dialogRef.current?.close();
                router.replace(claimsHref(policyDetail.id, customer, `?deleted=${claim.id}`));
              }}
            >
              Delete claim
            </Button>
            <Button ref={keepRef} variant="tinted" size="large" onClick={() => dialogRef.current?.close()}>
              Keep claim
            </Button>
          </div>
        </div>
      </dialog>
    </>
  );
}
