"use client";

import { useEffect, useState, type CSSProperties } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/buttons";
import { defaultSideSheetConfig } from "@/components/ui/frosted-side-sheet/config";
import { setClaimFlowVersion, useClaimFlowVersion } from "@/lib/claim-flow-version";
import { Bone, Loading } from "@/components/ui/skeleton";
import { VersionSwitch } from "@/components/ui/version-switch";
import { claimsHref, findClaim, useHydrated } from "@/lib/claims";
import { policyDetail } from "@/lib/policy-detail";
import type { Customer } from "@/lib/routes";

/** The parts both claim flows share: back, the error line, the bottom bar. */

export const flowEase = [0.23, 1, 0.32, 1] as const;

/** Steps slide in from the side they come from; reduced motion crossfades. */
export function stepSwap(direction: number, reduced: boolean) {
  return reduced
    ? { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } }
    : {
        initial: { opacity: 0, transform: `translateX(${direction * 16}px)` },
        animate: { opacity: 1, transform: "translateX(0px)" },
        exit: { opacity: 0, transform: `translateX(${direction * -16}px)` },
      };
}

export const today = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
};

export function FlowBack({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group -ml-2 inline-flex h-9 items-center gap-1 rounded-control pr-3 pl-2 text-[15px] leading-5 font-medium text-accent-text transition-opacity duration-150 active:opacity-50 [@media(hover:hover)]:hover:opacity-70"
    >
      <svg aria-hidden width="9" height="15" viewBox="0 0 9 15" fill="none" className="transition-transform duration-200 ease-out [@media(hover:hover)]:group-hover:-translate-x-0.5">
        <path d="M7.5 1.5 1.75 7.5l5.75 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      Back
    </button>
  );
}

/**
 * A claim flow's progress, kept for this tab (sessionStorage), so a refresh
 * or a trip to another page and back picks up where you were. `restore`
 * runs once, after hydration, with what was kept (it validates it); every
 * change after that is saved. Once a claim is sent the flow keeps only its
 * reference, so a refresh on the ticket opens the claim instead of an empty
 * form, and leaving the ticket forgets it. Only a reload counts, soon after
 * and while the claim exists: arriving any other way starts afresh.
 */
export type FlowMemory<T> = { progress?: T; sent?: string; at?: number };

const REOPEN_WITHIN_MS = 30 * 60_000;
/* Read once, when the flow first restores, never while it renders after. */
const reloaded = () =>
  (performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming | undefined)?.type === "reload";
const recent = (at?: number) => typeof at === "number" && Date.now() - at < REOPEN_WITHIN_MS;

export function useFlowMemory<T>(
  key: string,
  progress: T,
  sent: string | null,
  restore: (progress: T) => void,
  customer: Customer,
) {
  const router = useRouter();
  const hydrated = useHydrated();
  const [seeded, setSeeded] = useState(false);
  const [reopen, setReopen] = useState<string | null>(null);
  const [resumed, setResumed] = useState(false);
  if (hydrated && !seeded) {
    setSeeded(true);
    let kept: FlowMemory<T> | null = null;
    try {
      kept = JSON.parse(window.sessionStorage.getItem(key) ?? "null");
    } catch {
      /* Storage blocked or garbled: start fresh. */
    }
    if (kept?.sent) {
      if (recent(kept.at) && reloaded() && findClaim(kept.sent)) setReopen(kept.sent);
    } else if (kept?.progress) {
      restore(kept.progress);
      setResumed(true);
    }
  }

  const json = JSON.stringify(progress);
  useEffect(() => {
    if (!seeded || reopen) return;
    try {
      window.sessionStorage.setItem(key, sent ? JSON.stringify({ sent, at: Date.now() }) : `{"progress":${json}}`);
    } catch {
      /* Kept for this visit only. */
    }
  }, [key, json, sent, seeded, reopen]);

  /* Sent already: open the claim. */
  useEffect(() => {
    if (!reopen) return;
    try {
      window.sessionStorage.removeItem(key);
    } catch {
      /* Nothing was kept. */
    }
    router.replace(claimsHref(policyDetail.id, customer, `/${reopen}?created=1`));
  }, [reopen, key, router, customer]);

  /* Leaving the ticket (View claim, or anywhere else) forgets the claim. */
  useEffect(() => {
    if (!sent) return;
    return () => {
      try {
        window.sessionStorage.removeItem(key);
      } catch {
        /* Nothing was kept. */
      }
    };
  }, [sent, key]);

  return {
    /** Restored from earlier, rather than started fresh. */
    resumed,
    /** On the way to a claim that was sent before a refresh. */
    reopening: Boolean(reopen),
    forget: () => {
      setResumed(false);
      try {
        window.sessionStorage.removeItem(key);
      } catch {
        /* Nothing was kept. */
      }
    },
  };
}

/** A sent claim being reopened after a refresh: its outline for a beat. */
export function OpeningClaim() {
  return (
    <Loading label="Opening your claim" className="mx-auto w-full max-w-[640px] px-3.5 pt-8 sm:px-6 sm:pt-12">
      <Bone className="mx-auto h-8 w-64 max-w-full" />
      <Bone className="mx-auto mt-3 h-4 w-80 max-w-full" />
      <Bone className="mx-auto mt-8 h-96 w-full max-w-[300px] rounded-[4px]" />
    </Loading>
  );
}

/** "Picked up where you left off", with a way to start again. */
export function Resumed({ onStartOver }: { onStartOver: () => void }) {
  return (
    <p
      role="status"
      className="mt-5 flex min-h-11 flex-wrap items-center justify-between gap-x-3 gap-y-1 rounded-[14px] bg-fill py-1.5 pr-1.5 pl-3.5 text-[13px] leading-[18px] text-label-secondary"
    >
      <span>We kept your answers.</span>
      <Button variant="plain" size="small" onClick={onStartOver}>
        Start over
      </Button>
    </p>
  );
}

/** After a failed Continue: focus the answer at fault, then make sure its
    message isn't hidden under the Continue bar (ErrorLine's scroll margin
    clears it). */
export function focusIssue(target: HTMLElement | null) {
  target?.focus();
  requestAnimationFrame(() => document.querySelector("form [role=alert]")?.scrollIntoView({ block: "nearest" }));
}

export function ErrorLine({ children, id, className = "mt-4" }: { children: string; id?: string; className?: string }) {
  return (
    <p
      id={id}
      role="alert"
      className={`${className} flex scroll-mt-24 scroll-mb-32 items-start gap-1.5 text-[13px] leading-[18px] text-pretty text-red-text`}
    >
      <svg aria-hidden width="16" height="16" viewBox="0 0 16 16" className="mt-px shrink-0">
        <circle cx="8" cy="8" r="6.75" fill="none" stroke="currentColor" strokeWidth="1.5" />
        <path d="M8 4.75v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="8" cy="11.25" r="0.9" fill="currentColor" />
      </svg>
      {children}
    </p>
  );
}

/* The side sheet's blur (28px) with a white tint, so the bar matches the
   page, faded in through a mask over the 40px above it: no box, no edge. */
const barMask = "linear-gradient(to bottom, transparent, #000 40px)";
const barBlur: CSSProperties = {
  WebkitBackdropFilter: `blur(${defaultSideSheetConfig.blurStrength}px) saturate(180%)`,
  backdropFilter: `blur(${defaultSideSheetConfig.blurStrength}px) saturate(180%)`,
  WebkitMaskImage: barMask,
  maskImage: barMask,
};
const barTint: CSSProperties = { background: "rgb(255 255 255 / 0.82)", WebkitMaskImage: barMask, maskImage: barMask };

/**
 * Progress and the step's main action, stuck to the bottom. It sits above
 * the dashboard's bottom progressive blur (z-20), which would wash it out.
 */
export function FlowBar({
  labels,
  step,
  submitLabel,
  width = "max-w-[640px]",
}: {
  labels: string[];
  /** 1-based. */
  step: number;
  submitLabel: string;
  width?: string;
}) {
  const total = labels.length;
  return (
    <div className="sticky bottom-0 z-30">
      <div aria-hidden className="bar-blur pointer-events-none absolute inset-x-0 -top-10 bottom-0" style={barBlur} />
      <div aria-hidden className="bar-tint pointer-events-none absolute inset-x-0 -top-10 bottom-0" style={barTint} />
      <div className={`relative mx-auto flex w-full ${width} items-center gap-4 px-3.5 py-3 pb-[max(12px,env(safe-area-inset-bottom))] sm:px-6`}>
        <div className="min-w-0 flex-1">
          <div
            role="progressbar"
            aria-label="Claim progress"
            aria-valuemin={1}
            aria-valuemax={total}
            aria-valuenow={step}
            aria-valuetext={`Step ${step} of ${total}, ${labels[step - 1]}`}
            className="flex max-w-[240px] gap-1"
          >
            {labels.map((label, index) => (
              <span key={label} className="h-1 flex-1 overflow-hidden rounded-full bg-fill-strong">
                <span
                  className="block h-full origin-left rounded-full bg-accent transition-transform duration-300 ease-[cubic-bezier(0.23,1,0.32,1)]"
                  style={{ transform: `scaleX(${index < step ? 1 : 0})` }}
                />
              </span>
            ))}
          </div>
          <p className="mt-1.5 truncate text-[13px] leading-[18px] text-label-secondary">
            <span className="font-medium text-label">{labels[step - 1]}</span>
            <span aria-hidden> · </span>
            <span className="tabular-nums">
              Step {step} of {total}
            </span>
          </p>
        </div>
        <Button type="submit" size="large" className="min-w-[140px]">
          {submitLabel}
        </Button>
      </div>
    </div>
  );
}

/**
 * Switch between the two Make a claim flows, at the foot of each flow's
 * first page: v1 starts with the hospital, v2 with the claim type. Two
 * toggle buttons in a segmented track; the choice is remembered.
 */
export function FlowVersionSwitch() {
  const version = useClaimFlowVersion();
  return (
    <VersionSwitch
      label="Claim flow"
      value={version}
      onChange={setClaimFlowVersion}
      options={[
        { value: "v1", label: "v1 · Hospital first" },
        { value: "v2", label: "v2 · Claim type first" },
      ]}
    />
  );
}
