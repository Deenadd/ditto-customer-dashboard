"use client";

import type { CSSProperties } from "react";
import { Button } from "@/components/ui/buttons";
import { defaultSideSheetConfig } from "@/components/ui/frosted-side-sheet/config";
import { setClaimFlowVersion, useClaimFlowVersion, type ClaimFlowVersion } from "@/lib/claim-flow-version";

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

export function ErrorLine({ children }: { children: string }) {
  return (
    <p role="alert" className="mt-4 flex items-start gap-1.5 text-[13px] leading-[18px] text-red-text">
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
      <div className={`relative mx-auto flex w-full ${width} items-center gap-4 px-4 py-3 pb-[max(12px,env(safe-area-inset-bottom))] sm:px-6`}>
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
  const options: { value: ClaimFlowVersion; label: string }[] = [
    { value: "v1", label: "v1 · Hospital first" },
    { value: "v2", label: "v2 · Claim type first" },
  ];
  return (
    <div className="mt-14 flex flex-col items-center gap-2 text-center">
      <p id="flow-version-label" className="text-[12px] leading-4 font-medium text-label-secondary">
        Claim flow
      </p>
      <div role="group" aria-labelledby="flow-version-label" className="inline-flex h-9 rounded-control bg-fill-strong p-[3px]">
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            aria-pressed={version === option.value}
            onClick={() => setClaimFlowVersion(option.value)}
            className={`touch-hit flex items-center rounded-control-inner px-3.5 text-[13px] font-medium whitespace-nowrap transition-[color,background-color,box-shadow] duration-150 ease-out ${
              version === option.value ? "bg-surface text-label shadow-thumb" : "text-label-secondary [@media(hover:hover)]:hover:text-label"
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}
