"use client";

import type { Renewal, RenewalStage } from "@/lib/renewal";

/* Where Renew leads: the renewal flow, a sibling prototype. */
const RENEW_URL = "https://ditto-renewal-flow.vercel.app";

/* Calm while there's time, orange in the last week, red once it's overdue;
   the words say the same, so colour is never the only cue. */
const tones: Record<RenewalStage, { panel: string; ring: string; title: string }> = {
  upcoming: { panel: "bg-accent-tint/70", ring: "text-accent", title: "text-label" },
  soon: { panel: "bg-orange-tint", ring: "text-orange-dot", title: "text-orange-text" },
  today: { panel: "bg-orange-tint", ring: "text-orange-dot", title: "text-orange-text" },
  grace: { panel: "bg-red-tint", ring: "text-red-dot", title: "text-red-text" },
};

/** The card's dot takes the renewal's colour once it's close. */
export const renewalDot: Record<RenewalStage, string> = {
  upcoming: "bg-accent",
  soon: "bg-orange-dot",
  today: "bg-orange-dot",
  grace: "bg-red-dot",
};

/**
 * The renewal, at the foot of a health card's front, kept compact: a small
 * ring of the days left in the 30-day window (or the grace after it), a
 * title and one short line, and Renew.
 * Its inset matches the facts panel above, so the radii stay concentric.
 */
export function RenewalStrip({ renewal, policyName }: { renewal: Renewal; policyName: string }) {
  const tone = tones[renewal.stage];
  return (
    <div className={`relative mx-2 mb-2 flex items-center gap-2.5 rounded-[14px] p-2 pl-2.5 ${tone.panel}`}>
      <DaysRing left={renewal.left} share={renewal.share} className={tone.ring} titleClass={tone.title} />
      <div className="min-w-0 flex-1">
        <p className={`truncate text-[13px] leading-[18px] font-semibold tracking-[-0.01em] ${tone.title}`}>{renewal.title}</p>
        <p className="truncate text-[12px] leading-4 text-label-secondary">{renewal.detail}</p>
      </div>
      {/* The card's faces let taps through to its link; this one keeps its own. */}
      <a
        href={RENEW_URL}
        aria-label={`Renew ${policyName}`}
        onClick={(event) => event.stopPropagation()}
        className="touch-hit pointer-events-auto relative inline-flex h-7 shrink-0 items-center rounded-full bg-accent px-3 text-[12px] font-semibold text-white shadow-accent transition-[transform,background-color,box-shadow] duration-150 ease-out active:scale-[0.96] active:shadow-accent-pressed focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent [@media(hover:hover)]:hover:bg-accent-hover"
      >
        Renew
      </a>
    </div>
  );
}

/** Days left, in a ring that empties as the date comes closer. */
function DaysRing({ left, share, className, titleClass }: { left: number; share: number; className: string; titleClass: string }) {
  const r = 13.5;
  const length = 2 * Math.PI * r;
  return (
    <span aria-hidden className={`relative grid size-8 shrink-0 place-items-center ${className}`}>
      <svg width="32" height="32" viewBox="0 0 32 32" className="absolute inset-0 -rotate-90">
        <circle cx="16" cy="16" r={r} fill="none" stroke="currentColor" strokeOpacity="0.18" strokeWidth="3" />
        <circle
          cx="16"
          cy="16"
          r={r}
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray={`${Math.max(share, 0.001) * length} ${length}`}
        />
      </svg>
      {/* The number alone; the title beside it says what it counts. */}
      <span className={`relative text-[12px] leading-none font-semibold tabular-nums ${titleClass}`}>{left}</span>
    </span>
  );
}
