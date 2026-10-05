"use client";

import { useEffect, useId, useRef, useState, type CSSProperties, type FormEvent, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ChoiceCard, ChoiceGroup, ClaimingOn, Note } from "@/components/claims/claim-bits";
import { ClaimTicket } from "@/components/claims/claim-ticket";
import { defaultSideSheetConfig, hexToRgb } from "@/components/ui/frosted-side-sheet/config";
import { Chevron } from "@/components/dashboard/policy-pair";
import { Asset } from "@/components/ui/asset";
import { BackLink } from "@/components/ui/back-link";
import { Button } from "@/components/ui/buttons";
import { IconClaim, IconDocuments } from "@/components/ui/icons";
import {
  addClaim,
  ageFrom,
  categories,
  claimHref,
  claimsHref,
  formatDate,
  hospitals,
  policyPeriod,
  stages,
  type Claim,
  type ClaimCategory,
  type Hospital,
} from "@/lib/claims";
import { policyDetail } from "@/lib/policy-detail";
import type { Customer } from "@/lib/routes";
import { lockScroll, unlockScroll } from "@/lib/use-scroll-lock";

type Draft = {
  patient?: string;
  category?: ClaimCategory;
  treatment: string;
  stage?: string;
  knowsDate?: boolean;
  admission: string;
  hospital?: { name: string; address: string; network: boolean; id?: string } | "undecided";
};

const steps = [
  { label: "Patient", title: "Who is the claim for?", subtitle: "Choose the person being treated." },
  { label: "Treatment", title: "Tell us about the treatment", subtitle: "This helps us guide you through the claim." },
  { label: "Dates", title: "When is the admission?", subtitle: "We'll share the date with the hospital and Care Health." },
  { label: "Hospital", title: "Which hospital?", subtitle: "Cashless works at hospitals in Care Health's network." },
];

const ease = [0.23, 1, 0.32, 1] as const;

/* The side sheet's material (config: 28px blur, #F7F7F7 at 72%). */
const sheet = defaultSideSheetConfig;
const barMask = "linear-gradient(to bottom, transparent, #000 40px)";
const barBlur: CSSProperties = {
  WebkitBackdropFilter: `blur(${sheet.blurStrength}px) saturate(180%)`,
  backdropFilter: `blur(${sheet.blurStrength}px) saturate(180%)`,
  WebkitMaskImage: barMask,
  maskImage: barMask,
};
const barTint: CSSProperties = {
  background: `rgb(${Object.values(hexToRgb(sheet.sheetColor)).join(" ")} / ${sheet.sheetTint})`,
  WebkitMaskImage: barMask,
  maskImage: barMask,
};

const today = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
};

/**
 * Making a cashless claim on the health policy: pick the claim type, then
 * four steps (patient, treatment, dates, hospital) with Continue in a bar at
 * the bottom. Each step checks its answers on Continue and says what's
 * missing beside the question. The last step sends the request and opens
 * the new claim.
 */
export function NewClaimFlow({ customer }: { customer: Customer }) {
  const router = useRouter();
  const reduced = useReducedMotion();
  /* 0 is the claim type; 1–4 are the steps. */
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [draft, setDraft] = useState<Draft>({ treatment: "", admission: "" });
  const [error, setError] = useState<string | null>(null);
  /* Once sent, the flow gives way to the printed claim ticket. */
  const [ticket, setTicket] = useState<Claim | null>(null);
  const [open, setOpen] = useState<"category" | "treatment" | "stage" | null>("category");
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

  /* A new step takes focus to its heading, so it's announced and Tab starts
     from the top of it. The old step is still leaving when the step changes,
     so this waits for the new heading to mount. */
  const focusHeading = (node: HTMLHeadingElement | null) => {
    if (!node || !moved.current) return;
    moved.current = false;
    node.focus({ preventScroll: true });
  };

  function problem(): string | null {
    if (step === 1 && !draft.patient) return "Choose who the claim is for.";
    if (step === 2) {
      /* Open the question that needs an answer, so the message sits by it. */
      if (!draft.category) {
        setOpen("category");
        return "Choose a category.";
      }
      if (!draft.treatment.trim()) {
        setOpen("treatment");
        return "Enter the treatment's name.";
      }
      if (!draft.stage) {
        setOpen("stage");
        return "Choose the stage you're at.";
      }
    }
    if (step === 3) {
      if (draft.knowsDate === undefined) return "Tell us whether you know the date.";
      if (draft.knowsDate) {
        if (!draft.admission) return "Choose the date of admission.";
        if (draft.admission < policyPeriod.start || draft.admission > policyPeriod.end)
          return `Choose a date between ${formatDate(policyPeriod.start)} and ${formatDate(policyPeriod.end)}, when the policy covers you.`;
        if (draft.stage === "planning" && draft.admission < today())
          return "A planned stay can't be in the past. Choose today or a later date.";
        if (draft.stage !== "planning" && draft.stage !== "today" && draft.admission > today())
          return "You've been admitted already, so choose today or an earlier date.";
      }
    }
    if (step === 4 && !draft.hospital) return "Choose a hospital, or enter one.";
    return null;
  }

  function onContinue(event: FormEvent) {
    event.preventDefault();
    const issue = problem();
    if (issue) {
      setError(issue);
      return;
    }
    if (step < 4) return go(step + 1);
    const person = policyDetail.family.find((member) => member.name === draft.patient)!;
    const claim = addClaim({
      policyId: policyDetail.id,
      type: "cashless",
      patient: { name: person.name, relation: person.relation, age: ageFrom(person.dob) },
      category: draft.category!,
      treatment: draft.treatment.trim(),
      stage: draft.stage!,
      admission: draft.knowsDate ? draft.admission : null,
      hospital:
        draft.hospital && draft.hospital !== "undecided"
          ? { name: draft.hospital.name, address: draft.hospital.address, network: draft.hospital.network }
          : null,
    });
    window.scrollTo({ top: 0 });
    setTicket(claim);
  }

  if (ticket) {
    return (
      <div className="mx-auto w-full max-w-[640px] px-4 pt-8 sm:px-6 sm:pt-12">
        <ClaimTicket
          claim={ticket}
          policyName={policyDetail.name}
          onView={() => router.replace(claimHref(policyDetail.id, ticket.id, customer))}
        />
      </div>
    );
  }

  const meta = steps[step - 1];
  const swap = reduced
    ? { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } }
    : {
        initial: { opacity: 0, transform: `translateX(${direction * 16}px)` },
        animate: { opacity: 1, transform: "translateX(0px)" },
        exit: { opacity: 0, transform: `translateX(${direction * -16}px)` },
      };

  return (
    <form onSubmit={onContinue} noValidate className="flex min-h-[calc(100dvh-64px)] flex-col">
      <div className="mx-auto w-full max-w-[640px] flex-1 px-4 pt-5 pb-10 sm:px-6 sm:pt-8">
        {step === 0 ? (
          <BackLink href={claimsHref(policyDetail.id, customer)}>Claims</BackLink>
        ) : (
          <button
            type="button"
            onClick={() => go(step - 1)}
            className="group -ml-2 inline-flex h-9 items-center gap-1 rounded-control pr-3 pl-2 text-[15px] leading-5 font-medium text-accent-text transition-opacity duration-150 active:opacity-50 [@media(hover:hover)]:hover:opacity-70"
          >
            <svg aria-hidden width="9" height="15" viewBox="0 0 9 15" fill="none" className="transition-transform duration-200 ease-out [@media(hover:hover)]:group-hover:-translate-x-0.5">
              <path d="M7.5 1.5 1.75 7.5l5.75 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Back
          </button>
        )}

        <AnimatePresence mode="wait" initial={false}>
          <motion.div key={step} {...swap} transition={{ duration: reduced ? 0.12 : 0.2, ease }} className="mt-4">
            <ClaimingOn name={policyDetail.name} />
            <h1
              ref={focusHeading}
              tabIndex={-1}
              className="mt-5 text-[28px] leading-[34px] font-bold tracking-[-0.025em] text-balance text-label focus:outline-none"
            >
              {step === 0
                ? "Make a claim"
                : step === 3 && draft.stage && draft.stage !== "planning" && draft.stage !== "today"
                  ? "When were you admitted?"
                  : meta.title}
            </h1>
            <p className="mt-1.5 text-[15px] leading-5 text-pretty text-label-secondary">
              {step === 0 ? "Choose how you'd like to claim." : meta.subtitle}
            </p>

            <div className="mt-6">
              {step === 0 ? <TypeStep onCashless={() => go(1)} /> : null}
              {step === 1 ? <PatientStep draft={draft} set={set} /> : null}
              {step === 2 ? <TreatmentStep draft={draft} set={set} open={open} setOpen={setOpen} /> : null}
              {step === 3 ? <DateStep draft={draft} set={set} /> : null}
              {step === 4 ? <HospitalStep draft={draft} set={set} /> : null}
            </div>

            {error ? (
              <p role="alert" className="mt-4 flex items-start gap-1.5 text-[13px] leading-[18px] text-red-text">
                <svg aria-hidden width="16" height="16" viewBox="0 0 16 16" className="mt-px shrink-0">
                  <circle cx="8" cy="8" r="6.75" fill="none" stroke="currentColor" strokeWidth="1.5" />
                  <path d="M8 4.75v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  <circle cx="8" cy="11.25" r="0.9" fill="currentColor" />
                </svg>
                {error}
              </p>
            ) : null}
          </motion.div>
        </AnimatePresence>
      </div>

      {step > 0 ? (
        /* Above the dashboard's bottom progressive blur (z-20), which would
           wash it out. Finished like the side sheet: its blur and tint, faded
           in through a mask over the 40px above the bar, so there's no edge. */
        <div className="sticky bottom-0 z-30">
          <div aria-hidden className="bar-blur pointer-events-none absolute inset-x-0 -top-10 bottom-0" style={barBlur} />
          <div aria-hidden className="bar-tint pointer-events-none absolute inset-x-0 -top-10 bottom-0" style={barTint} />
          <div className="relative mx-auto flex w-full max-w-[640px] items-center gap-4 px-4 py-3 pb-[max(12px,env(safe-area-inset-bottom))] sm:px-6">
            <div className="min-w-0 flex-1">
              <div
                role="progressbar"
                aria-label="Claim progress"
                aria-valuemin={1}
                aria-valuemax={4}
                aria-valuenow={step}
                aria-valuetext={`Step ${step} of 4, ${meta.label}`}
                className="flex max-w-[220px] gap-1"
              >
                {steps.map((item, index) => (
                  <span key={item.label} className="h-1 flex-1 overflow-hidden rounded-full bg-fill-strong">
                    <span
                      className="block h-full origin-left rounded-full bg-accent transition-transform duration-300 ease-[cubic-bezier(0.23,1,0.32,1)]"
                      style={{ transform: `scaleX(${index < step ? 1 : 0})` }}
                    />
                  </span>
                ))}
              </div>
              <p className="mt-1.5 text-[13px] leading-[18px] text-label-secondary">
                <span className="font-medium text-label">{meta.label}</span>
                <span aria-hidden> · </span>
                <span className="tabular-nums">Step {step} of 4</span>
              </p>
            </div>
            <Button type="submit" size="large" className="min-w-[140px]">
              {step === 4 ? "Send request" : "Continue"}
            </Button>
          </div>
        </div>
      ) : null}
    </form>
  );
}

function TypeStep({ onCashless }: { onCashless: () => void }) {
  return (
    <ul className="overflow-hidden rounded-[18px] bg-surface shadow-soft">
      <li>
        <button
          type="button"
          onClick={onCashless}
          className="group flex min-h-[72px] w-full items-center gap-3.5 px-4 py-3.5 text-left transition-colors duration-150 ease-out active:bg-fill [@media(hover:hover)]:hover:bg-fill/70"
        >
          <span className="grid size-10 shrink-0 place-items-center rounded-[10px] bg-accent-tint text-accent">
            <IconClaim />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-[16px] leading-5 font-semibold tracking-[-0.01em] text-label">Cashless</span>
            <span className="mt-0.5 block text-[13px] leading-[18px] text-pretty text-label-secondary">
              Treatment at a network hospital, with nothing to pay upfront
            </span>
          </span>
          <Chevron className="text-label-tertiary" />
        </button>
      </li>
      <li className="relative before:absolute before:top-0 before:right-0 before:left-[70px] before:h-px before:bg-separator">
        <div aria-disabled="true" className="flex min-h-[72px] w-full items-center gap-3.5 px-4 py-3.5">
          <span className="grid size-10 shrink-0 place-items-center rounded-[10px] bg-fill text-label-tertiary">
            <IconDocuments />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-[16px] leading-5 font-semibold tracking-[-0.01em] text-label-secondary">Reimbursement</span>
            <span className="mt-0.5 block text-[13px] leading-[18px] text-pretty text-label-secondary">
              Claim back treatment you&apos;ve already paid for
            </span>
          </span>
          <span className="shrink-0 rounded-full bg-fill-strong px-2.5 py-1 text-[12px] leading-4 font-medium text-grey-text">
            Coming soon
          </span>
        </div>
      </li>
    </ul>
  );
}

type StepProps = { draft: Draft; set: (patch: Partial<Draft>) => void };

function PatientStep({ draft, set }: StepProps) {
  return (
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
  );
}

function TreatmentStep({
  draft,
  set,
  open,
  setOpen,
}: StepProps & {
  open: "category" | "treatment" | "stage" | null;
  setOpen: (open: "category" | "treatment" | "stage" | null) => void;
}) {
  const category = categories.find((item) => item.id === draft.category);
  const stage = draft.category ? stages[draft.category].find((item) => item.id === draft.stage) : undefined;
  const toggle = (id: "category" | "treatment" | "stage") => setOpen(open === id ? null : id);
  /* After an answer, open the next question that still needs one. */
  const next = (after: Partial<Draft>) => {
    const merged = { ...draft, ...after };
    setOpen(!merged.treatment.trim() ? "treatment" : !merged.stage ? "stage" : null);
  };

  return (
    <div className="flex flex-col gap-3">
      <Disclosure
        label="Category"
        value={category?.label}
        placeholder="Choose a category"
        question="What kind of claim is it?"
        hint="It depends on how long the hospital stay is."
        open={open === "category"}
        onToggle={() => toggle("category")}
      >
        <ChoiceGroup label="Category" nested>
          {categories.map((item) => (
            <ChoiceCard
              key={item.id}
              name="category"
              checked={draft.category === item.id}
              onChange={() => {
                /* Stages differ by category, so a change clears the stage. */
                const patch = { category: item.id, stage: draft.category === item.id ? draft.stage : undefined };
                set(patch);
                next(patch);
              }}
              title={item.label}
              hint={item.hint}
            />
          ))}
        </ChoiceGroup>
      </Disclosure>

      <Disclosure
        label="Treatment"
        value={draft.treatment.trim() || undefined}
        placeholder="Describe the treatment"
        question="What's the treatment called?"
        open={open === "treatment"}
        onToggle={() => toggle("treatment")}
      >
        <label htmlFor="treatment" className="sr-only">
          Treatment name
        </label>
        <input
          id="treatment"
          value={draft.treatment}
          onChange={(event) => set({ treatment: event.target.value })}
          onKeyDown={(event) => {
            if (event.key !== "Enter") return;
            event.preventDefault();
            if (draft.treatment.trim()) next({});
          }}
          placeholder="For example, knee surgery"
          autoComplete="off"
          className="h-[52px] w-full rounded-control bg-surface px-4 text-[17px] leading-6 text-label shadow-field transition-shadow duration-150 placeholder:text-label-tertiary focus:shadow-[0_0_0_2px_var(--color-accent)] focus:outline-none"
        />
        <div className="mt-3 flex justify-end">
          <Button variant="tinted" onClick={() => draft.treatment.trim() && next({})}>
            Next
          </Button>
        </div>
      </Disclosure>

      <Disclosure
        label="Stage"
        value={stage?.label}
        placeholder="Choose where you are"
        question="Where are you in the treatment?"
        hint="So we can guide you through the right steps."
        open={open === "stage"}
        onToggle={() => toggle("stage")}
      >
        {draft.category ? (
          <div className="flex flex-col gap-3">
            <ChoiceGroup label="Stage" nested>
              {stages[draft.category].map((item) => (
                <ChoiceCard
                  key={item.id}
                  name="stage"
                  checked={draft.stage === item.id}
                  onChange={() => {
                    set({ stage: item.id });
                    if (item.id !== "after") setOpen(null);
                  }}
                  title={item.label}
                  hint={item.hint}
                />
              ))}
            </ChoiceGroup>
            {draft.stage === "after" ? (
              <Note tone="warning">
                Once you&apos;ve left the hospital, cashless usually isn&apos;t possible. You can still send this request
                and we&apos;ll help you claim the costs back.
              </Note>
            ) : null}
          </div>
        ) : (
          <Note>Choose a category first. The stages depend on it.</Note>
        )}
      </Disclosure>
    </div>
  );
}

/**
 * One question that folds away once answered, showing its answer. Rows open
 * with a grid-rows transition; closed content is inert, so Tab skips it.
 */
function Disclosure({
  label,
  value,
  placeholder,
  question,
  hint,
  open,
  onToggle,
  children,
}: {
  label: string;
  value?: string;
  placeholder: string;
  question: string;
  hint?: string;
  open: boolean;
  onToggle: () => void;
  children: ReactNode;
}) {
  const id = useId();
  return (
    <section className={`rounded-[18px] bg-surface transition-shadow duration-200 ${open ? "shadow-card" : "shadow-soft"}`}>
      <h2>
        <button
          type="button"
          aria-expanded={open}
          aria-controls={id}
          onClick={onToggle}
          className="flex min-h-[72px] w-full items-center gap-3 rounded-[18px] px-4 py-3.5 text-left"
        >
          <span className="min-w-0 flex-1">
            {open ? (
              <>
                <span className="block text-[17px] leading-[22px] font-semibold tracking-[-0.022em] text-label">{question}</span>
                {hint ? <span className="mt-0.5 block text-[13px] leading-[18px] text-label-secondary">{hint}</span> : null}
              </>
            ) : (
              <>
                <span className="block text-[12px] leading-4 text-label-secondary">{label}</span>
                <span className={`mt-0.5 block truncate text-[15px] leading-5 font-medium ${value ? "text-label" : "text-label-tertiary"}`}>
                  {value ?? placeholder}
                </span>
              </>
            )}
          </span>
          <svg
            aria-hidden
            width="12"
            height="8"
            viewBox="0 0 12 8"
            fill="none"
            className={`shrink-0 text-label-tertiary transition-transform duration-200 ease-out ${open ? "rotate-180" : ""}`}
          >
            <path d="M1.25 1.5 6 6.25l4.75-4.75" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </h2>
      <div
        id={id}
        className="grid transition-[grid-template-rows] duration-250 ease-[cubic-bezier(0.23,1,0.32,1)]"
        style={{ gridTemplateRows: open ? "1fr" : "0fr" }}
      >
        <div className="overflow-hidden" inert={!open}>
          <div className="px-4 pt-1 pb-4">{children}</div>
        </div>
      </div>
    </section>
  );
}

function DateStep({ draft, set }: StepProps) {
  const past = draft.stage !== "planning" && draft.stage !== "today";
  return (
    <div className="flex flex-col gap-6">
      <ChoiceGroup label="Do you know the date of admission?" showLabel>
        <ChoiceCard
          name="knows-date"
          checked={draft.knowsDate === true}
          onChange={() => set({ knowsDate: true })}
          title="Yes, I know the date"
        />
        <ChoiceCard
          name="knows-date"
          checked={draft.knowsDate === false}
          onChange={() => set({ knowsDate: false, admission: "" })}
          title="No, it isn't decided yet"
        />
      </ChoiceGroup>

      {draft.knowsDate ? (
        <div>
          <label htmlFor="admission" className="block text-[15px] leading-5 font-medium text-label">
            {past ? "When were you admitted?" : "Date of admission"}
          </label>
          <input
            id="admission"
            type="date"
            value={draft.admission}
            min={policyPeriod.start}
            max={policyPeriod.end}
            onChange={(event) => set({ admission: event.target.value })}
            aria-describedby="admission-hint"
            className="mt-2 h-[52px] w-full max-w-[320px] rounded-control bg-surface px-4 text-[17px] leading-6 text-label tabular-nums shadow-field transition-shadow duration-150 focus:shadow-[0_0_0_2px_var(--color-accent)] focus:outline-none"
          />
          <p id="admission-hint" className="mt-2 text-[13px] leading-[18px] text-label-secondary tabular-nums">
            Your policy year runs from {formatDate(policyPeriod.start)} to {formatDate(policyPeriod.end)}.
          </p>
        </div>
      ) : null}

      {draft.knowsDate === false ? (
        <Note>That&apos;s fine. Tell us the date once the hospital confirms it, and we&apos;ll update your request.</Note>
      ) : null}
    </div>
  );
}

function HospitalStep({ draft, set }: StepProps) {
  const [query, setQuery] = useState("");
  const [manual, setManual] = useState("");
  const dialogRef = useRef<HTMLDialogElement>(null);
  const q = query.trim().toLowerCase();
  const results = hospitals.filter((hospital) =>
    [hospital.name, hospital.address, hospital.city, hospital.pin].some((field) => field.toLowerCase().includes(q)),
  );
  const chosen = draft.hospital;
  const chosenId = chosen && chosen !== "undecided" ? chosen.id : undefined;
  const entered = chosen && chosen !== "undecided" && !chosen.id ? chosen : undefined;

  const pick = (hospital: Hospital) =>
    set({
      hospital: {
        id: hospital.id,
        name: hospital.name,
        address: `${hospital.address}, ${hospital.city} ${hospital.pin}`,
        network: hospital.network,
      },
    });

  return (
    <div>
      <label htmlFor="hospital-search" className="sr-only">
        Search hospitals
      </label>
      <div className="relative">
        <svg aria-hidden width="17" height="17" viewBox="0 0 17 17" fill="none" className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-label-tertiary">
          <circle cx="7.25" cy="7.25" r="5.5" stroke="currentColor" strokeWidth="1.6" />
          <path d="m11.5 11.5 4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
        <input
          id="hospital-search"
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search by hospital, city or PIN"
          autoComplete="off"
          className="h-[52px] w-full rounded-control bg-surface pr-4 pl-11 text-[17px] leading-6 text-label shadow-field transition-shadow duration-150 placeholder:text-label-tertiary focus:shadow-[0_0_0_2px_var(--color-accent)] focus:outline-none"
        />
      </div>

      <p role="status" className="mt-3 text-[13px] leading-[18px] text-label-secondary tabular-nums">
        {results.length === 1 ? "1 hospital" : `${results.length} hospitals`}
        {q ? ` for “${query.trim()}”` : ""} · a sample list for this prototype
      </p>

      <div className="mt-3 flex flex-col gap-3">
        {entered || chosen === "undecided" || results.length ? (
          <ChoiceGroup label="Hospital">
            {entered ? (
              <ChoiceCard
                name="hospital"
                checked
                onChange={() => {}}
                title={entered.name}
                hint="Entered by you"
              />
            ) : null}
            {results.map((hospital) => (
              <ChoiceCard
                key={hospital.id}
                name="hospital"
                checked={chosenId === hospital.id}
                onChange={() => pick(hospital)}
                title={hospital.name}
                hint={`${hospital.address}, ${hospital.city} ${hospital.pin}`}
                trailing={
                  <span
                    className={`shrink-0 rounded-full px-2 py-0.5 text-[12px] leading-4 font-medium ${
                      hospital.network ? "bg-green-tint text-green-text" : "bg-grey-tint text-grey-text"
                    }`}
                  >
                    {hospital.network ? "Cashless" : "Not in network"}
                  </span>
                }
              />
            ))}
            {chosen === "undecided" ? (
              <ChoiceCard name="hospital" checked onChange={() => {}} title="Hospital not chosen yet" hint="You can add it later" />
            ) : null}
          </ChoiceGroup>
        ) : null}
        {results.length === 0 ? (
          <p className="rounded-[14px] bg-fill px-4 py-4 text-[15px] leading-5 text-label-secondary">
            No hospitals match “{query.trim()}”. Check the spelling, or enter the hospital yourself.
          </p>
        ) : null}
      </div>

      {chosen && chosen !== "undecided" && !chosen.network ? (
        <div className="mt-3">
          <Note tone="warning">
            {chosen.id
              ? `${chosen.name} isn't in Care Health's network, so cashless isn't available there.`
              : "We'll check whether this hospital is in Care Health's network."}{" "}
            You can still send this request, and we&apos;ll help you claim the costs back if needed.
          </Note>
        </div>
      ) : null}

      <button
        type="button"
        onClick={() => {
          lockScroll();
          dialogRef.current?.showModal();
        }}
        className="group mt-4 flex w-full items-center gap-3 rounded-[14px] px-3 py-3 text-left transition-opacity duration-150 active:opacity-50 [@media(hover:hover)]:hover:opacity-70"
      >
        <span className="min-w-0 flex-1">
          <span className="block text-[15px] leading-5 font-medium text-accent-text">Can&apos;t find your hospital?</span>
          <span className="block text-[13px] leading-[18px] text-label-secondary">Enter it yourself, or tell us you haven&apos;t chosen one</span>
        </span>
        <Chevron className="text-accent-text" />
      </button>

      <dialog
        ref={dialogRef}
        aria-labelledby="manual-title"
        className="m-auto w-[min(440px,calc(100vw-32px))] rounded-[22px] bg-surface p-0 text-label shadow-raised backdrop:bg-black/30 open:animate-pop"
        onClose={() => {
          setManual("");
          unlockScroll();
        }}
      >
        <div className="p-5">
          <div className="flex items-start justify-between gap-3">
            <h2 id="manual-title" className="text-[20px] leading-6 font-semibold tracking-[-0.02em]">
              Enter your hospital
            </h2>
            <button
              type="button"
              onClick={() => dialogRef.current?.close()}
              aria-label="Close"
              className="-mt-1.5 -mr-2 grid size-9 shrink-0 place-items-center rounded-full text-label-secondary transition-colors hover:bg-black/[0.05] hover:text-label"
            >
              <svg aria-hidden width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            </button>
          </div>
          <ul className="mt-4 flex flex-col gap-3 rounded-[14px] bg-fill px-4 py-3.5 text-[13px] leading-[18px]">
            <li>
              <p className="font-semibold text-label">It may not be in the network</p>
              <p className="mt-0.5 text-label-secondary">Then cashless isn&apos;t available, but you can claim the costs back if the treatment is covered.</p>
            </li>
            <li>
              <p className="font-semibold text-label">It may be excluded</p>
              <p className="mt-0.5 text-label-secondary">Care Health doesn&apos;t cover treatment at some hospitals. Check with us before you&apos;re admitted.</p>
            </li>
          </ul>
          <label htmlFor="manual-hospital" className="mt-5 block text-[15px] leading-5 font-medium">
            Hospital name
          </label>
          <input
            id="manual-hospital"
            value={manual}
            onChange={(event) => setManual(event.target.value)}
            placeholder="For example, City General Hospital"
            autoComplete="off"
            className="mt-2 h-[52px] w-full rounded-control bg-surface px-4 text-[17px] leading-6 text-label shadow-field transition-shadow duration-150 placeholder:text-label-tertiary focus:shadow-[0_0_0_2px_var(--color-accent)] focus:outline-none"
          />
          <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button
              variant="plain"
              onClick={() => {
                set({ hospital: "undecided" });
                dialogRef.current?.close();
              }}
            >
              I haven&apos;t chosen one yet
            </Button>
            <Button
              onClick={() => {
                if (!manual.trim()) return;
                set({ hospital: { name: manual.trim(), address: "Entered by you", network: false } });
                dialogRef.current?.close();
              }}
              aria-disabled={!manual.trim()}
              className={manual.trim() ? "" : "opacity-50"}
            >
              Use this hospital
            </Button>
          </div>
        </div>
      </dialog>
    </div>
  );
}
