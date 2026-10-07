"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useReducedMotion } from "motion/react";
import { ChoiceCard, ChoiceGroup, Note } from "@/components/claims/claim-bits";
import { ClaimTicket } from "@/components/claims/claim-ticket";
import {
  ErrorLine,
  FlowBack,
  FlowBar,
  FlowTop,
  FlowVersionSwitch,
  focusIssue,
  OpeningClaim,
  QuestionPart,
  QuestionSwap,
  Resumed,
  useFlowMemory,
} from "@/components/claims/flow-parts";
import { HospitalStep, type HospitalChoice } from "@/components/claims/new-claim-flow";
import { DocumentsStep } from "@/components/claims/reimbursement-flow";
import { Asset } from "@/components/ui/asset";
import { Breadcrumbs } from "@/components/ui/breadcrumb";
import { IconClaim, IconDocuments } from "@/components/ui/icons";
import {
  addClaim,
  ageFrom,
  claimHref,
  claimsHref,
  rupees,
  type Claim,
  type DocumentKind,
} from "@/lib/claims";
import { policyDetail } from "@/lib/policy-detail";
import { dashboardHref, policyHref, type Customer } from "@/lib/routes";

type ClaimType = "cashless" | "reimbursement";

type Draft = {
  hospital?: HospitalChoice;
  type?: ClaimType;
  patient?: string;
  treatment: string;
  amount: string;
  documents: Record<DocumentKind, string[]>;
};

const MAX_AMOUNT = 50_000_000;
const freshDraft: Draft = { treatment: "", amount: "", documents: { bills: [], discharge: [], reports: [] } };

const field =
  "h-[52px] w-full rounded-control bg-surface px-4 text-[17px] leading-6 text-label shadow-field transition-shadow duration-150 placeholder:text-label-tertiary focus:shadow-[0_0_0_2px_var(--color-accent)] focus:outline-none aria-[invalid=true]:shadow-[0_0_0_1.5px_var(--color-red-text)]";

/**
 * Make a claim, v1: one flow, hospital first. Where you're treated decides
 * what's possible, so it comes first:
 *
 *   Hospital > Cashless > Member details > ticket
 *   Hospital > Reimbursement > Member details > Documents > ticket
 *
 * A hospital outside Care Health's network can't take cashless, so that
 * choice is shown but greyed, with the reason. Same parts as v2 (the bar,
 * the step swap, errors beside the question and focused, answers kept for
 * this tab, a request sent once) and the same claim ticket.
 */
export function OneClaimFlow({ customer }: { customer: Customer }) {
  const router = useRouter();
  const reduced = !!useReducedMotion();
  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState(1);
  const [draft, setDraft] = useState<Draft>(freshDraft);
  const [error, setError] = useState<{ text: string; field?: string } | null>(null);
  const [ticket, setTicket] = useState<Claim | null>(null);
  const moved = useRef(false);
  const sending = useRef(false);

  const memory = useFlowMemory<{ step: number; draft: Draft }>(
    "ditto.claim-draft.v1",
    { step, draft },
    ticket?.id ?? null,
    (kept) => {
      if (typeof kept.step !== "number" || kept.step < 1 || kept.step > 4 || typeof kept.draft?.amount !== "string") return;
      setStep(kept.step);
      setDraft({ ...freshDraft, ...kept.draft, documents: { ...freshDraft.documents, ...kept.draft.documents } });
    },
    customer,
  );

  function startOver() {
    memory.forget();
    setDraft(freshDraft);
    go(1);
  }

  const reimbursing = draft.type === "reimbursement";
  const labels = ["Hospital", "Claim type", "Member", ...(reimbursing ? ["Documents"] : [])];
  const last = labels.length;
  const hospital = draft.hospital && draft.hospital !== "undecided" ? draft.hospital : undefined;
  const cashlessClosed = !!hospital?.id && !hospital.network;

  const set = (patch: Partial<Draft>) => {
    setDraft((value) => ({ ...value, ...patch }));
    setError(null);
  };

  function go(next: number) {
    setDirection(next > step ? 1 : -1);
    setStep(next);
    setError(null);
    moved.current = true;
  }

  useEffect(() => {
    if (moved.current) window.scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" });
  }, [step, reduced]);

  /* Focus what the message is about: an input by its id, a set of answers
     by its first radio. */
  useEffect(() => {
    if (!error?.field) return;
    focusIssue(document.getElementById(error.field) ?? document.querySelector<HTMLElement>(`input[name=${error.field}]`));
  }, [error]);

  const focusHeading = (node: HTMLHeadingElement | null) => {
    if (!node || !moved.current) return;
    moved.current = false;
    node.focus({ preventScroll: true });
  };

  function problem(): { text: string; field?: string } | null {
    if (step === 1 && !draft.hospital) return { text: "Choose the hospital, or tell us you haven't chosen one.", field: "hospital-search" };
    if (step === 2 && !draft.type) return { text: "Choose cashless or reimbursement.", field: "claim-type" };
    if (step === 3) {
      if (!draft.patient) return { text: "Choose who the claim is for.", field: "patient" };
      if (!draft.treatment.trim()) return { text: "Enter the treatment's name, for example knee surgery.", field: "one-treatment" };
    }
    if (step === 4) {
      const amount = Number(draft.amount);
      if (!amount) return { text: "Enter the total amount you paid.", field: "one-amount" };
      if (amount > MAX_AMOUNT) return { text: `Enter an amount up to your sum insured, ${rupees(MAX_AMOUNT)}.`, field: "one-amount" };
      if (!draft.documents.bills.length) return { text: "Add your bills and payment receipts.", field: "r-doc-bills" };
      if (!draft.documents.discharge.length) return { text: "Add the discharge summary.", field: "r-doc-discharge" };
    }
    return null;
  }

  function onContinue(event: FormEvent) {
    event.preventDefault();
    const issue = problem();
    if (issue) {
      setError(issue);
      return;
    }
    if (step < last) return go(step + 1);
    /* A second tap while the first is sending would make a second claim. */
    if (sending.current) return;
    sending.current = true;
    const person = policyDetail.family.find((member) => member.name === draft.patient)!;
    const claim = addClaim({
      policyId: policyDetail.id,
      type: draft.type!,
      patient: { name: person.name, relation: person.relation, age: ageFrom(person.dob) },
      category: "hospitalisation",
      treatment: draft.treatment.trim(),
      /* Cashless is asked for ahead of a stay; a reimbursement comes after. */
      stage: reimbursing ? "after" : "planning",
      admission: null,
      hospital: hospital ? { name: hospital.name, address: hospital.address, network: hospital.network } : null,
      ...(reimbursing ? { amount: Number(draft.amount), discharge: null, documents: draft.documents } : {}),
    });
    window.scrollTo({ top: 0 });
    setTicket(claim);
  }

  if (memory.reopening) return <OpeningClaim />;

  if (ticket) {
    return (
      <div className="mx-auto w-full max-w-[640px] px-3.5 pt-8 sm:px-6 sm:pt-12">
        <ClaimTicket
          claim={ticket}
          policyName={policyDetail.name}
          onView={() => router.replace(claimHref(policyDetail.id, ticket.id, customer))}
        />
      </div>
    );
  }

  const titles: Record<number, [string, string]> = {
    1: ["Where's the treatment?", "Choose the hospital first. It decides whether cashless is possible."],
    2: ["How would you like to claim?", hospital ? `At ${hospital.name}.` : "You can change the hospital later."],
    3: ["Who is the claim for?", "Choose the person being treated, and tell us the treatment."],
    4: ["Add your documents", "What you paid, and the papers that show it."],
  };
  const [title, subtitle] = titles[step];
  const grouped = draft.amount ? new Intl.NumberFormat("en-IN").format(Number(draft.amount)) : "";

  return (
    <form onSubmit={onContinue} noValidate className="flex min-h-[calc(100dvh-64px)] flex-col">
      <div className="mx-auto w-full max-w-[640px] flex-1 px-3.5 pt-5 pb-10 sm:px-6 sm:pt-8">
        <FlowTop
          nav={
            step === 1 ? (
              <Breadcrumbs
                items={[
                  { label: "Active policies", href: dashboardHref({ tab: "active", customer }) },
                  { label: policyDetail.name, href: policyHref(policyDetail.id, customer) },
                  { label: "Claims", href: claimsHref(policyDetail.id, customer) },
                  { label: "New claim" },
                ]}
              />
            ) : (
              <FlowBack onClick={() => go(step - 1)} />
            )
          }
          name={policyDetail.name}
          notice={memory.resumed && step > 1 ? <Resumed onStartOver={startOver} /> : null}
        />
        <QuestionSwap step={step} direction={direction}>
          <QuestionPart>
            <h1
              ref={focusHeading}
              tabIndex={-1}
              className="text-[28px] leading-[34px] font-bold tracking-[-0.025em] text-balance text-label focus:outline-none"
            >
              {title}
            </h1>
            <p className="mt-1.5 text-[15px] leading-5 text-pretty text-label-secondary">{subtitle}</p>
          </QuestionPart>
          <QuestionPart>
            <div className="mt-6">
              {step === 1 ? (
                <HospitalStep
                  hospital={draft.hospital}
                  onChange={(next) => {
                    /* A hospital outside the network can't take cashless. */
                    const closed = next !== "undecided" && !!next.id && !next.network;
                    set({ hospital: next, type: closed && draft.type === "cashless" ? undefined : draft.type });
                  }}
                />
              ) : null}

              {step === 2 ? (
                <div className="flex flex-col gap-3">
                  <ChoiceGroup label="Claim type" inset={70}>
                    <ChoiceCard
                      name="claim-type"
                      checked={draft.type === "cashless"}
                      onChange={() => set({ type: "cashless" })}
                      disabled={cashlessClosed}
                      title="Cashless"
                      hint={
                        cashlessClosed
                          ? `Not available: ${hospital!.name} isn't in Care Health's network`
                          : "The hospital bills Care Health directly, with nothing to pay upfront"
                      }
                      leading={
                        <span className="grid size-10 shrink-0 place-items-center rounded-[10px] bg-accent-tint text-accent">
                          <IconClaim />
                        </span>
                      }
                    />
                    <ChoiceCard
                      name="claim-type"
                      checked={draft.type === "reimbursement"}
                      onChange={() => set({ type: "reimbursement" })}
                      title="Reimbursement"
                      hint="You've paid, and claim the costs back"
                      leading={
                        <span className="grid size-10 shrink-0 place-items-center rounded-[10px] bg-accent-tint text-accent">
                          <IconDocuments />
                        </span>
                      }
                    />
                  </ChoiceGroup>
                  {draft.hospital === "undecided" || (hospital && !hospital.id) ? (
                    <Note>We&apos;ll check whether the hospital is in Care Health&apos;s network before cashless goes ahead.</Note>
                  ) : null}
                </div>
              ) : null}

              {step === 3 ? (
                <div className="flex flex-col gap-6">
                  <ChoiceGroup label="Patient" inset={60}>
                    {policyDetail.family.map((person) => (
                      <ChoiceCard
                        key={person.name}
                        name="patient"
                        checked={draft.patient === person.name}
                        onChange={() => set({ patient: person.name })}
                        title={person.name}
                        hint={`${person.relation} · ${ageFrom(person.dob)} years`}
                        leading={
                          <Asset
                            src={`/dashboard/health-card/${person.relation === "You" ? "member-primary" : "member"}.svg`}
                            className="size-8 shrink-0"
                          />
                        }
                      />
                    ))}
                  </ChoiceGroup>
                  <div>
                    <label htmlFor="one-treatment" className="block text-[15px] leading-5 font-medium text-label">
                      Treatment
                    </label>
                    <input
                      id="one-treatment"
                      value={draft.treatment}
                      onChange={(event) => set({ treatment: event.target.value })}
                      placeholder="For example, knee surgery"
                      autoComplete="off"
                      aria-invalid={error?.field === "one-treatment" || undefined}
                      aria-describedby={error?.field === "one-treatment" ? "one-treatment-error" : undefined}
                      className={`${field} mt-2`}
                    />
                    {error?.field === "one-treatment" ? (
                      <ErrorLine id="one-treatment-error" className="mt-2">
                        {error.text}
                      </ErrorLine>
                    ) : null}
                  </div>
                </div>
              ) : null}

              {step === 4 ? (
                <div className="flex flex-col gap-6">
                  <div>
                    <label htmlFor="one-amount" className="block text-[15px] leading-5 font-medium text-label">
                      Total amount you paid
                    </label>
                    <div className="relative mt-2 max-w-[320px]">
                      <span aria-hidden className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-[17px] text-label-secondary">
                        ₹
                      </span>
                      <input
                        id="one-amount"
                        inputMode="numeric"
                        autoComplete="off"
                        placeholder="50,000"
                        value={grouped}
                        aria-invalid={error?.field === "one-amount" || undefined}
                        aria-describedby={error?.field === "one-amount" ? "one-amount-error" : undefined}
                        onChange={(event) => set({ amount: event.target.value.replace(/\D/g, "").slice(0, 9) })}
                        className={`${field} pl-9 tabular-nums`}
                      />
                    </div>
                    {error?.field === "one-amount" ? (
                      <ErrorLine id="one-amount-error" className="mt-2">
                        {error.text}
                      </ErrorLine>
                    ) : null}
                  </div>
                  <DocumentsStep documents={draft.documents} issue={error} onChange={(documents) => set({ documents })} />
                </div>
              ) : null}
            </div>

            {/* Field messages sit under their field; the rest go here. */}
            {error && !/^(one-|r-doc-)/.test(error.field ?? "") ? <ErrorLine>{error.text}</ErrorLine> : null}
            {step === 1 ? <FlowVersionSwitch /> : null}
          </QuestionPart>
        </QuestionSwap>
      </div>

      <FlowBar labels={labels} step={step} submitLabel={step === last && draft.type ? "Send request" : "Continue"} />
    </form>
  );
}
