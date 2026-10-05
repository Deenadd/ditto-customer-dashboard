"use client";

import { useEffect, useId, useRef, useState, type FormEvent, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ChoiceCard, ChoiceGroup, ClaimingOn, Note } from "@/components/claims/claim-bits";
import { ClaimTicket } from "@/components/claims/claim-ticket";
import { ErrorLine, FlowBack, FlowBar, flowEase, stepSwap, today } from "@/components/claims/flow-parts";
import { MiniPolicyCard } from "@/components/dashboard/health-card";
import { CoverGlyph } from "@/components/policy/policy-detail-cards";
import { IconCheck, IconDocuments } from "@/components/ui/icons";
import { InsurerLogo } from "@/components/ui/insurer-logo";
import {
  addClaim,
  ageFrom,
  categoryLabel,
  claimHref,
  documentKinds,
  formatDate,
  policyPeriod,
  reimbursementCategories,
  rupees,
  type Claim,
  type ClaimCategory,
  type DocumentKind,
} from "@/lib/claims";
import { covered, policyDetail } from "@/lib/policy-detail";
import type { Customer } from "@/lib/routes";

type Draft = {
  category?: ClaimCategory;
  patient: string;
  /** Digits only. */
  amount: string;
  reason: string;
  hospital: string;
  admission: string;
  discharge: string;
  policy?: string;
  documents: Record<DocumentKind, string[]>;
  confirmed: boolean;
};

const steps = [
  { label: "Category", title: "What are you claiming for?", subtitle: "Choose what the bills are for." },
  { label: "Details", title: "Treatment details", subtitle: "Enter them exactly as they appear on your documents." },
  { label: "Policy", title: "Which policy?", subtitle: "Choose the policy to claim on." },
  { label: "Documents", title: "Add your documents", subtitle: "Photos or PDFs. Clear, uncropped pages are approved fastest." },
  { label: "Review", title: "Check and send", subtitle: "You can't change the amount once the claim is sent." },
];

/* The sum insured caps a claim: ₹5,00,00,000. */
const MAX_AMOUNT = 50_000_000;

const coverIcon = (title: string) => covered.find((item) => item.title === title)!.icon;
const categoryIcons: Record<ClaimCategory, ReturnType<typeof coverIcon>> = {
  hospitalisation: coverIcon("Hospitalisation"),
  "pre-post": coverIcon("Before hospitalisation"),
  "day-care": coverIcon("Day-care treatments"),
};

const field =
  "h-[52px] w-full rounded-control bg-surface px-4 text-[17px] leading-6 text-label shadow-field transition-shadow duration-150 placeholder:text-label-tertiary focus:shadow-[0_0_0_2px_var(--color-accent)] focus:outline-none aria-[invalid=true]:shadow-[0_0_0_1.5px_var(--color-red-text)]";

/**
 * A reimbursement claim: you've paid, and claim the costs back. Five steps
 * after Plum's flow (category, treatment details, policy, documents, review),
 * in the cashless flow's parts and look. Each step checks itself on
 * Continue, says what's missing and focuses that field. Sending prints the
 * claim ticket.
 */
export function ReimbursementFlow({ customer, onExit }: { customer: Customer; onExit: () => void }) {
  const router = useRouter();
  const reduced = !!useReducedMotion();
  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState(1);
  const [draft, setDraft] = useState<Draft>({
    patient: "",
    amount: "",
    reason: "",
    hospital: "",
    admission: "",
    discharge: "",
    policy: policyDetail.id,
    documents: { bills: [], discharge: [], reports: [] },
    confirmed: false,
  });
  const [error, setError] = useState<{ text: string; field?: string } | null>(null);
  const [ticket, setTicket] = useState<Claim | null>(null);
  const moved = useRef(false);

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

  const focusHeading = (node: HTMLHeadingElement | null) => {
    if (!node || !moved.current) return;
    moved.current = false;
    node.focus({ preventScroll: true });
  };

  /* Focus the field the message is about. */
  useEffect(() => {
    if (error?.field) document.getElementById(error.field)?.focus();
  }, [error]);

  function problem(): { text: string; field?: string } | null {
    if (step === 1 && !draft.category) return { text: "Choose what you're claiming for." };
    if (step === 2) {
      if (!draft.patient) return { text: "Choose the patient.", field: "r-patient" };
      const amount = Number(draft.amount);
      if (!amount) return { text: "Enter the total amount you're claiming.", field: "r-amount" };
      if (amount > MAX_AMOUNT) return { text: `Enter an amount up to your sum insured, ${rupees(MAX_AMOUNT)}.`, field: "r-amount" };
      if (!draft.reason.trim()) return { text: "Enter the reason for treatment.", field: "r-reason" };
      if (!draft.hospital.trim()) return { text: "Enter the hospital's name.", field: "r-hospital" };
      if (!draft.admission) return { text: "Choose the date of admission.", field: "r-admission" };
      if (draft.admission < policyPeriod.start || draft.admission > policyPeriod.end)
        return {
          text: `Choose an admission date between ${formatDate(policyPeriod.start)} and ${formatDate(policyPeriod.end)}, when the policy covers you.`,
          field: "r-admission",
        };
      if (draft.admission > today()) return { text: "You can claim back treatment that's happened. Choose today or an earlier date.", field: "r-admission" };
      if (!draft.discharge) return { text: "Choose the date of discharge.", field: "r-discharge" };
      if (draft.discharge < draft.admission) return { text: "Discharge can't be before admission.", field: "r-discharge" };
      if (draft.discharge > today()) return { text: "Choose a discharge date of today or earlier.", field: "r-discharge" };
    }
    if (step === 3 && !draft.policy) return { text: "Choose a policy." };
    if (step === 4) {
      if (!draft.documents.bills.length) return { text: "Add at least one bill or receipt.", field: "r-doc-bills" };
      if (draft.category !== "pre-post" && !draft.documents.discharge.length)
        return { text: "Add the discharge summary.", field: "r-doc-discharge" };
    }
    if (step === 5 && !draft.confirmed) return { text: "Confirm the details match your documents.", field: "r-confirm" };
    return null;
  }

  function onContinue(event: FormEvent) {
    event.preventDefault();
    const issue = problem();
    if (issue) {
      setError(issue);
      return;
    }
    if (step < 5) return go(step + 1);
    const person = policyDetail.family.find((member) => member.name === draft.patient)!;
    const claim = addClaim({
      policyId: policyDetail.id,
      type: "reimbursement",
      patient: { name: person.name, relation: person.relation, age: ageFrom(person.dob) },
      category: draft.category!,
      treatment: draft.reason.trim(),
      stage: "after",
      admission: draft.admission,
      discharge: draft.discharge,
      hospital: { name: draft.hospital.trim(), address: "", network: true },
      amount: Number(draft.amount),
      documents: draft.documents,
    });
    window.scrollTo({ top: 0 });
    setTicket(claim);
  }

  if (ticket) {
    return (
      <div className="mx-auto w-full max-w-[640px] px-4 pt-8 sm:px-6 sm:pt-12">
        <ClaimTicket claim={ticket} policyName={policyDetail.name} onView={() => router.replace(claimHref(policyDetail.id, ticket.id, customer))} />
      </div>
    );
  }

  const meta = steps[step - 1];

  return (
    <form onSubmit={onContinue} noValidate className="flex min-h-[calc(100dvh-64px)] flex-col">
      <div className="mx-auto w-full max-w-[640px] flex-1 px-4 pt-5 pb-10 sm:px-6 sm:pt-8">
        <FlowBack onClick={() => (step === 1 ? onExit() : go(step - 1))} />
        <AnimatePresence mode="wait" initial={false}>
          <motion.div key={step} {...stepSwap(direction, reduced)} transition={{ duration: reduced ? 0.12 : 0.2, ease: flowEase }} className="mt-4">
            <ClaimingOn name={policyDetail.name} />
            <h1
              ref={focusHeading}
              tabIndex={-1}
              className="mt-5 text-[28px] leading-[34px] font-bold tracking-[-0.025em] text-balance text-label focus:outline-none"
            >
              {meta.title}
            </h1>
            <p className="mt-1.5 text-[15px] leading-5 text-pretty text-label-secondary">{meta.subtitle}</p>

            <div className="mt-6">
              {step === 1 ? <CategoryStep draft={draft} set={set} /> : null}
              {step === 2 ? <DetailsStep draft={draft} set={set} invalid={error?.field} /> : null}
              {step === 3 ? <PolicyStep draft={draft} set={set} /> : null}
              {step === 4 ? <DocumentsStep draft={draft} set={set} /> : null}
              {step === 5 ? <ReviewStep draft={draft} set={set} edit={go} /> : null}
            </div>
            {error ? <ErrorLine>{error.text}</ErrorLine> : null}
          </motion.div>
        </AnimatePresence>
      </div>
      <FlowBar labels={steps.map((item) => item.label)} step={step} submitLabel={step === 5 ? "Send claim" : "Continue"} />
    </form>
  );
}

type StepProps = { draft: Draft; set: (patch: Partial<Draft>) => void };

function CategoryStep({ draft, set }: StepProps) {
  return (
    <ChoiceGroup label="Category" inset={68}>
      {reimbursementCategories.map((item) => (
        <ChoiceCard
          key={item.id}
          name="category"
          checked={draft.category === item.id}
          onChange={() => set({ category: item.id })}
          title={item.label}
          hint={item.hint}
          leading={
            <span className="grid size-10 shrink-0 place-items-center rounded-[11px] bg-accent-tint">
              <CoverGlyph icon={categoryIcons[item.id]} size={22} />
            </span>
          }
        />
      ))}
    </ChoiceGroup>
  );
}

function Field({ id, label, children }: { id: string; label: string; children: ReactNode }) {
  return (
    <div className="min-w-0">
      <label htmlFor={id} className="block text-[13px] leading-[18px] font-medium text-label">
        {label}
      </label>
      <div className="mt-1.5">{children}</div>
    </div>
  );
}

function DetailsStep({ draft, set, invalid }: StepProps & { invalid?: string }) {
  const isInvalid = (id: string) => (invalid === id ? true : undefined);
  const grouped = draft.amount ? new Intl.NumberFormat("en-IN").format(Number(draft.amount)) : "";
  return (
    <div className="flex flex-col gap-5">
      <div className="grid gap-x-4 gap-y-5 sm:grid-cols-2">
        <Field id="r-patient" label="Patient">
          <div className="relative">
            <select
              id="r-patient"
              value={draft.patient}
              aria-invalid={isInvalid("r-patient")}
              onChange={(event) => set({ patient: event.target.value })}
              className={`${field} appearance-none pr-10 ${draft.patient ? "" : "text-label-tertiary"}`}
            >
              <option value="" disabled>
                Choose
              </option>
              {policyDetail.family.map((person) => (
                <option key={person.name} value={person.name}>
                  {person.name} ({person.relation})
                </option>
              ))}
            </select>
            <svg aria-hidden width="12" height="8" viewBox="0 0 12 8" fill="none" className="pointer-events-none absolute top-1/2 right-4 -translate-y-1/2 text-label-tertiary">
              <path d="M1.25 1.5 6 6.25l4.75-4.75" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </Field>
        <Field id="r-amount" label="Total claim amount">
          <div className="relative">
            <span aria-hidden className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-[17px] text-label-secondary">
              ₹
            </span>
            <input
              id="r-amount"
              inputMode="numeric"
              autoComplete="off"
              placeholder="50,000"
              value={grouped}
              aria-invalid={isInvalid("r-amount")}
              onChange={(event) => set({ amount: event.target.value.replace(/\D/g, "").slice(0, 9) })}
              className={`${field} pl-9 tabular-nums`}
            />
          </div>
        </Field>
        <Field id="r-reason" label="Reason for treatment">
          <input
            id="r-reason"
            autoComplete="off"
            placeholder="For example, appendix surgery"
            value={draft.reason}
            aria-invalid={isInvalid("r-reason")}
            onChange={(event) => set({ reason: event.target.value })}
            className={field}
          />
        </Field>
        <Field id="r-hospital" label="Hospital">
          <input
            id="r-hospital"
            autoComplete="off"
            placeholder="Full name, as on your bills"
            value={draft.hospital}
            aria-invalid={isInvalid("r-hospital")}
            onChange={(event) => set({ hospital: event.target.value })}
            className={field}
          />
        </Field>
        <Field id="r-admission" label="Date of admission">
          <input
            id="r-admission"
            type="date"
            value={draft.admission}
            min={policyPeriod.start}
            max={today()}
            aria-invalid={isInvalid("r-admission")}
            onChange={(event) => set({ admission: event.target.value })}
            className={`${field} tabular-nums`}
          />
        </Field>
        <Field id="r-discharge" label="Date of discharge">
          <input
            id="r-discharge"
            type="date"
            value={draft.discharge}
            min={draft.admission || policyPeriod.start}
            max={today()}
            aria-invalid={isInvalid("r-discharge")}
            onChange={(event) => set({ discharge: event.target.value })}
            className={`${field} tabular-nums`}
          />
        </Field>
      </div>

      <section aria-labelledby="r-tips" className="rounded-[18px] bg-fill px-4 py-4">
        <h2 id="r-tips" className="text-[15px] leading-5 font-semibold text-label">
          Check before you continue
        </h2>
        <ul className="mt-3 flex flex-col gap-2.5 text-[13px] leading-[18px] text-label">
          {[
            [true, "The amount can't be changed once the claim is sent, so make sure it's right."],
            [true, "Enter the hospital's full name, exactly as on your documents."],
            [false, "Don't guess the dates. Take them from your discharge summary."],
          ].map(([ok, text]) => (
            <li key={String(text)} className="flex gap-2.5">
              <span
                aria-hidden
                className={`mt-px grid size-4 shrink-0 place-items-center rounded-full text-white ${ok ? "bg-green-text" : "bg-red-text"}`}
              >
                {ok ? (
                  <IconCheck size={10} />
                ) : (
                  <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                    <path d="M1.5 1.5l5 5M6.5 1.5l-5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                  </svg>
                )}
              </span>
              <span className="text-pretty">{text}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

function PolicyStep({ draft, set }: StepProps) {
  return (
    <ChoiceGroup label="Policy" inset={74}>
      <ChoiceCard
        name="policy"
        checked={draft.policy === policyDetail.id}
        onChange={() => set({ policy: policyDetail.id })}
        title={policyDetail.name}
        hint={`Health insurance · ${policyDetail.id}`}
        leading={<MiniPolicyCard tone="blue" />}
        trailing={<InsurerLogo insurer={policyDetail.insurer} size={40} />}
      />
    </ChoiceGroup>
  );
}

function DocumentsStep({ draft, set }: StepProps) {
  const add = (kind: DocumentKind, files: FileList | null) => {
    if (!files?.length) return;
    const names = [...files].map((file) => file.name);
    set({ documents: { ...draft.documents, [kind]: [...draft.documents[kind], ...names] } });
  };
  const remove = (kind: DocumentKind, index: number) =>
    set({ documents: { ...draft.documents, [kind]: draft.documents[kind].filter((_, i) => i !== index) } });

  return (
    <div className="flex flex-col gap-4">
      <ul className="overflow-hidden rounded-[18px] bg-surface shadow-soft">
        {documentKinds.map((kind, index) => {
          const files = draft.documents[kind.id];
          const required = kind.id === "bills" || (kind.id === "discharge" && draft.category !== "pre-post");
          return (
            <li
              key={kind.id}
              className={`relative px-4 py-4 ${index ? "before:absolute before:top-0 before:right-0 before:left-[68px] before:h-px before:bg-separator" : ""}`}
            >
              <div className="flex items-center gap-3.5">
                <span className="grid size-10 shrink-0 place-items-center rounded-[11px] bg-accent-tint text-accent">
                  <IconDocuments />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-[15px] leading-5 font-medium text-label">
                    {kind.label}
                    {required ? null : <span className="font-normal text-label-secondary"> (optional)</span>}
                  </p>
                  <p className="text-[13px] leading-[18px] text-label-secondary">
                    {files.length ? `${files.length} ${files.length === 1 ? "file" : "files"} added` : kind.hint}
                  </p>
                </div>
                <label className="relative inline-flex h-9 shrink-0 cursor-pointer items-center gap-1.5 rounded-control bg-accent-tint px-3.5 text-[14px] font-medium text-accent-text transition-[transform,background-color] duration-150 ease-out has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-accent active:scale-[0.96] [@media(hover:hover)]:hover:bg-[#dcebfb]">
                  Add
                  <input
                    id={`r-doc-${kind.id}`}
                    type="file"
                    multiple
                    accept="image/*,application/pdf"
                    aria-label={`Add ${kind.label.toLowerCase()}`}
                    onChange={(event) => {
                      add(kind.id, event.target.files);
                      event.target.value = "";
                    }}
                    className="absolute inset-0 cursor-pointer opacity-0"
                  />
                </label>
              </div>
              {files.length ? (
                <ul className="mt-3 ml-[54px] flex flex-wrap gap-1.5">
                  {files.map((name, i) => (
                    <li key={`${name}-${i}`} className="flex h-8 max-w-full items-center gap-1 rounded-full bg-fill pr-1 pl-3 text-[13px] text-label">
                      <span className="truncate">{name}</span>
                      <button
                        type="button"
                        onClick={() => remove(kind.id, i)}
                        aria-label={`Remove ${name}`}
                        className="grid size-6 shrink-0 place-items-center rounded-full text-label-secondary transition-colors hover:bg-black/[0.06] hover:text-label"
                      >
                        <svg aria-hidden width="10" height="10" viewBox="0 0 10 10" fill="none">
                          <path d="M2 2l6 6M8 2l-6 6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                        </svg>
                      </button>
                    </li>
                  ))}
                </ul>
              ) : null}
            </li>
          );
        })}
      </ul>
      <Note>Keep the originals. Once we&apos;ve reviewed your claim, you&apos;ll courier them to Care Health. Files stay in this browser in this prototype.</Note>
    </div>
  );
}

function ReviewStep({ draft, set, edit }: StepProps & { edit: (step: number) => void }) {
  const id = useId();
  const docs = documentKinds
    .map((kind) => ({ label: kind.label, count: draft.documents[kind.id].length }))
    .filter((doc) => doc.count);
  const sections: { title: string; step: number; rows: { label: string; value: string }[] }[] = [
    { title: "Claim", step: 1, rows: [{ label: "For", value: categoryLabel(draft.category!) }] },
    {
      title: "Treatment",
      step: 2,
      rows: [
        { label: "Patient", value: draft.patient },
        { label: "Amount", value: rupees(Number(draft.amount)) },
        { label: "Reason", value: draft.reason },
        { label: "Hospital", value: draft.hospital },
        { label: "Stay", value: `${formatDate(draft.admission)} to ${formatDate(draft.discharge)}` },
      ],
    },
    { title: "Policy", step: 3, rows: [{ label: "On", value: policyDetail.name }] },
    { title: "Documents", step: 4, rows: docs.map((doc) => ({ label: doc.label, value: `${doc.count} ${doc.count === 1 ? "file" : "files"}` })) },
  ];
  return (
    <div className="flex flex-col gap-4">
      {sections.map((section) => (
        <section key={section.title} aria-labelledby={`${id}-${section.step}`} className="rounded-[18px] bg-surface px-4 py-3.5 shadow-soft">
          <div className="flex items-center justify-between">
            <h2 id={`${id}-${section.step}`} className="text-[15px] leading-5 font-semibold text-label">
              {section.title}
            </h2>
            <button
              type="button"
              onClick={() => edit(section.step)}
              aria-label={`Edit ${section.title.toLowerCase()}`}
              className="-mr-2 h-8 rounded-[8px] px-2 text-[14px] font-medium text-accent-text transition-opacity active:opacity-50 [@media(hover:hover)]:hover:opacity-70"
            >
              Edit
            </button>
          </div>
          <dl className="mt-1 divide-y divide-separator">
            {section.rows.map((row) => (
              <div key={row.label} className="flex items-baseline justify-between gap-4 py-2 text-[14px] leading-5">
                <dt className="shrink-0 text-label-secondary">{row.label}</dt>
                <dd className="min-w-0 text-right font-medium break-words text-label tabular-nums">{row.value}</dd>
              </div>
            ))}
          </dl>
        </section>
      ))}
      <label className="flex cursor-pointer items-start gap-3 rounded-[14px] px-1 py-1">
        <input
          id="r-confirm"
          type="checkbox"
          checked={draft.confirmed}
          onChange={(event) => set({ confirmed: event.target.checked })}
          className="mt-0.5 size-5 shrink-0 cursor-pointer appearance-none rounded-[6px] border-[1.5px] border-label-tertiary/70 bg-surface bg-center bg-no-repeat transition-colors checked:border-accent checked:bg-accent checked:bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 16 16%22><path d=%22M3.5 8.5l3 3 6-7%22 fill=%22none%22 stroke=%22white%22 stroke-width=%222.2%22 stroke-linecap=%22round%22 stroke-linejoin=%22round%22/></svg>')]"
        />
        <span className="text-[14px] leading-5 text-pretty text-label">
          I confirm these details match my documents, and that I haven&apos;t claimed these costs elsewhere.
        </span>
      </label>
    </div>
  );
}
