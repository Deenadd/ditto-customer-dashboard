"use client";

import { useRef, useState, type ReactNode } from "react";
import { Note } from "@/components/claims/claim-bits";
import { Chevron } from "@/components/dashboard/policy-pair";
import { cardClass } from "@/components/ui/card-bits";
import { FrostedSideSheet } from "@/components/ui/frosted-side-sheet/frosted-side-sheet";
import {
  IconClock,
  IconDirections,
  IconExcluded,
  IconHelp,
  IconHospital,
  IconPhone,
  IconPin,
  IconWebsite,
  type Icon,
} from "@/components/ui/icons";
import { excludedHospitals, hospitalLinks, hospitals, type Hospital } from "@/lib/claims";

type ActionId = "network" | "excluded" | "faqs";

const actions: { id: ActionId; label: string; hint: string; icon: Icon }[] = [
  { id: "network", label: "Network hospitals", hint: "Where cashless works", icon: IconHospital },
  { id: "excluded", label: "Excluded hospitals", hint: "Where claims aren't paid", icon: IconExcluded },
  { id: "faqs", label: "FAQs", hint: "Claims, cover and payouts", icon: IconHelp },
];

/**
 * Quick actions for the policy, after Plum's: each opens the frosted side
 * sheet with what it names, so you stay on the policy page.
 */
export function QuickActions() {
  const [open, setOpen] = useState<ActionId | null>(null);
  const [shown, setShown] = useState<ActionId>("network");
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const action = actions.find((item) => item.id === shown)!;

  return (
    <section aria-labelledby="quick-title" className={`${cardClass} pb-2`}>
      <h2 id="quick-title" className="px-5 pt-5 text-[17px] leading-[22px] font-semibold tracking-[-0.022em] text-label">
        Quick actions
      </h2>
      <ul className="mt-2 flex flex-col gap-0.5 px-2">
        {actions.map((item) => {
          const Glyph = item.icon;
          return (
            <li key={item.id}>
              <button
                type="button"
                data-sheet-trigger
                aria-haspopup="dialog"
                aria-expanded={open === item.id}
                onClick={(event) => {
                  triggerRef.current = event.currentTarget;
                  setShown(item.id);
                  setOpen(item.id);
                }}
                className="group flex h-14 w-full items-center gap-3 rounded-[14px] px-3 text-left transition-colors duration-150 ease-out active:bg-fill aria-expanded:bg-fill [@media(hover:hover)]:hover:bg-fill"
              >
                <span className="grid size-9 shrink-0 place-items-center rounded-[10px] bg-surface text-accent shadow-tile">
                  <Glyph size={18} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[15px] leading-5 font-medium text-label">{item.label}</span>
                  <span className="block truncate text-[12px] leading-4 text-label-secondary">{item.hint}</span>
                </span>
                <Chevron className="text-label-tertiary" />
              </button>
            </li>
          );
        })}
      </ul>

      <FrostedSideSheet open={open !== null} onClose={() => setOpen(null)} title={action.label} returnFocusRef={triggerRef}>
        <div data-scroll-lock-scrollable className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 pt-2 pb-[calc(24px+env(safe-area-inset-bottom))]">
          {shown === "network" ? <NetworkList /> : null}
          {shown === "excluded" ? <ExcludedList /> : null}
          {shown === "faqs" ? <Faqs /> : null}
        </div>
      </FrostedSideSheet>
    </section>
  );
}

function NetworkList() {
  const [query, setQuery] = useState("");
  const [openId, setOpenId] = useState<string | null>(null);
  const q = query.trim().toLowerCase();
  const results = hospitals.filter((h) => [h.name, h.address, h.city, h.pin].some((f) => f.toLowerCase().includes(q)));
  return (
    <div>
      <label htmlFor="network-q" className="sr-only">
        Search hospitals
      </label>
      <input
        id="network-q"
        type="search"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Hospital, area or PIN"
        autoComplete="off"
        className="h-11 w-full rounded-[12px] bg-surface px-3.5 text-[16px] leading-6 text-label shadow-field placeholder:text-label-tertiary focus:shadow-[0_0_0_2px_var(--color-accent)] focus:outline-none"
      />
      <p role="status" className="mt-2.5 text-[12px] leading-4 text-label-secondary tabular-nums">
        {results.length} of {hospitals.length} · a sample list for this prototype
      </p>
      <Rows>
        {results.map((h) => (
          <HospitalRow
            key={h.id}
            hospital={h}
            open={openId === h.id}
            onToggle={() => setOpenId((current) => (current === h.id ? null : h.id))}
          />
        ))}
      </Rows>
    </div>
  );
}

/**
 * A hospital that opens in place, one at a time, like a place card in
 * Maps: when it's open, where it is and its number, then Directions, Call
 * and Website. The details fold with a grid-rows transition, so the rows
 * below slide rather than jump.
 */
function HospitalRow({ hospital: h, open, onToggle }: { hospital: Hospital; open: boolean; onToggle: () => void }) {
  const links = hospitalLinks(h);
  const bodyId = `hospital-${h.id}`;
  const action =
    "flex h-14 flex-col items-center justify-center gap-1 rounded-[12px] text-[12px] leading-4 font-medium transition-[transform,background-color] duration-150 ease-out active:scale-[0.96]";
  return (
    <li className="relative [&+&]:before:absolute [&+&]:before:top-0 [&+&]:before:right-0 [&+&]:before:left-4 [&+&]:before:h-px [&+&]:before:bg-separator">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={bodyId}
        onClick={onToggle}
        // The hover tint is for rows you can open. On an open row it would sit behind the
        // header only and cut the card in two, gray header over white details.
        className={`flex w-full items-center gap-3 px-4 py-3 text-left transition-colors duration-150 ease-out active:bg-fill ${
          open ? "" : "[@media(hover:hover)]:hover:bg-fill/60"
        }`}
      >
        <span className="min-w-0 flex-1">
          <span className="block text-[15px] leading-5 font-medium text-pretty text-label">{h.name}</span>
          <span className="block text-[12px] leading-4 text-pretty text-label-secondary">
            {h.address}, {h.city} {h.pin}
          </span>
        </span>
        <span
          className={`shrink-0 rounded-full px-2 py-0.5 text-[12px] leading-4 font-medium ${
            h.network ? "bg-green-tint text-green-text" : "bg-grey-tint text-grey-text"
          }`}
        >
          {h.network ? "Cashless" : "Not in network"}
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
      <div
        id={bodyId}
        className={`grid transition-[grid-template-rows,visibility] duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] ${
          open ? "grid-rows-[1fr]" : "invisible grid-rows-[0fr]"
        }`}
      >
        <div className="min-h-0 overflow-hidden">
          <div className="px-4 pb-4">
            <ul className="flex flex-col gap-2 text-[13px] leading-[18px] text-label">
              <li className="flex items-center gap-2.5">
                <IconClock size={16} className="shrink-0 text-label-secondary" />
                <span className={h.hours === "Open 24 hours" ? "font-medium text-green-text" : ""}>{h.hours}</span>
              </li>
              <li className="flex items-center gap-2.5">
                <IconPin size={16} className="shrink-0 text-label-secondary" />
                <span className="text-pretty">
                  {h.address}, {h.city} {h.pin}
                </span>
              </li>
              <li className="flex items-center gap-2.5">
                <IconPhone size={16} className="shrink-0 text-label-secondary" />
                <span className="tabular-nums">{h.phone}</span>
              </li>
            </ul>
            <div className="mt-3 grid grid-cols-3 gap-2">
              <a href={links.directions} target="_blank" rel="noopener noreferrer" className={`${action} bg-accent text-white`}>
                <IconDirections size={18} />
                Directions
              </a>
              <a href={links.call} className={`${action} bg-accent-tint text-accent-text`}>
                <IconPhone size={18} />
                Call
              </a>
              <a href={links.website} target="_blank" rel="noopener noreferrer" className={`${action} bg-accent-tint text-accent-text`}>
                <IconWebsite size={18} />
                Website
              </a>
            </div>
          </div>
        </div>
      </div>
    </li>
  );
}

function ExcludedList() {
  return (
    <div className="flex flex-col gap-3">
      <Note tone="warning">
        Care Health doesn&apos;t pay for treatment at these hospitals, cashless or reimbursement. Check here before you&apos;re
        admitted.
      </Note>
      <Rows>
        {excludedHospitals.map((h) => (
          <Row key={h.name} title={h.name} hint={`${h.city} · ${h.reason}`} tag="Excluded" tone="bad" />
        ))}
      </Rows>
      <p className="text-[12px] leading-4 text-label-tertiary">A sample list for this prototype.</p>
    </div>
  );
}

const faqs = [
  {
    q: "What's the difference between cashless and reimbursement?",
    a: "Cashless works at network hospitals: the hospital bills Care Health directly. With reimbursement, you pay first and claim the costs back.",
  },
  {
    q: "How soon do I need to claim?",
    a: "Tell us within 24 hours of an emergency admission. Send a reimbursement claim within 30 days of discharge.",
  },
  {
    q: "Are costs before and after a stay covered?",
    a: "Yes: medical costs in the 60 days before admission and the 90 days after discharge.",
  },
  {
    q: "What documents do I need?",
    a: "The claim form, discharge summary, final bill and receipts, pharmacy bills with prescriptions, test reports, photo ID, and a cancelled cheque for the payout.",
  },
  {
    q: "How long does a payout take?",
    a: "Usually within 30 days of a complete claim, straight to your bank account.",
  },
];

function Faqs() {
  return (
    <div className="flex flex-col gap-2">
      {faqs.map((item) => (
        <details key={item.q} className="group rounded-[14px] bg-surface shadow-soft open:shadow-tile">
          <summary className="flex min-h-12 cursor-pointer list-none items-center gap-3 px-4 py-3 text-[15px] leading-5 font-medium text-label [&::-webkit-details-marker]:hidden">
            <span className="flex-1 text-pretty">{item.q}</span>
            <svg aria-hidden width="12" height="8" viewBox="0 0 12 8" fill="none" className="shrink-0 text-label-tertiary transition-transform duration-200 group-open:rotate-180">
              <path d="M1.25 1.5 6 6.25l4.75-4.75" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </summary>
          <p className="px-4 pb-4 text-[14px] leading-5 text-pretty text-label-secondary">{item.a}</p>
        </details>
      ))}
      <p className="mt-1 text-[12px] leading-4 text-label-tertiary">General guidance. Your policy wording has the exact terms.</p>
    </div>
  );
}

function Rows({ children }: { children: ReactNode }) {
  return <ul className="mt-3 overflow-hidden rounded-[16px] bg-surface shadow-soft">{children}</ul>;
}

function Row({ title, hint, tag, tone }: { title: string; hint: string; tag: string; tone: "good" | "bad" | "plain" }) {
  const tones = { good: "bg-green-tint text-green-text", bad: "bg-red-tint text-red-text", plain: "bg-grey-tint text-grey-text" };
  return (
    <li className="relative flex items-center gap-3 px-4 py-3 [&+&]:before:absolute [&+&]:before:top-0 [&+&]:before:right-0 [&+&]:before:left-4 [&+&]:before:h-px [&+&]:before:bg-separator">
      <span className="min-w-0 flex-1">
        <span className="block text-[15px] leading-5 font-medium text-pretty text-label">{title}</span>
        <span className="block text-[12px] leading-4 text-pretty text-label-secondary">{hint}</span>
      </span>
      <span className={`shrink-0 rounded-full px-2 py-0.5 text-[12px] leading-4 font-medium ${tones[tone]}`}>{tag}</span>
    </li>
  );
}
