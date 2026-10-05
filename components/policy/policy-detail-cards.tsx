"use client";

import { useState, type ReactNode } from "react";
import { Asset } from "@/components/ui/asset";
import { cardClass } from "@/components/ui/card-bits";
import { InsurerLogo } from "@/components/ui/insurer-logo";
import type { CoverIcon, CoverItem, Exclusion } from "@/lib/policy-detail";
import { policyDetail } from "@/lib/policy-detail";

const cardTitle = "text-[17px] leading-[22px] font-semibold tracking-[-0.022em] text-label";

/** Large-title header for the policy page: the insurer and the name. */
export function PolicyHeader({ policy }: { policy: typeof policyDetail }) {
  return (
    /* The logo's top lines up with the title's first line. */
    <header className="flex flex-wrap items-start gap-x-4 gap-y-4">
      <InsurerLogo insurer={policy.insurer} size={56} />
      <div className="min-w-0 flex-[1_1_240px]">
        <h1 className="text-[28px] leading-[34px] font-bold tracking-[-0.025em] text-balance text-label">
          {policy.name}
        </h1>
      </div>
    </header>
  );
}

/** A Figma icon frame: the group sits at an inset and its SVG bleeds out. */
export function CoverGlyph({ icon, size }: { icon: CoverIcon; size: number }) {
  return (
    <span aria-hidden className="relative block shrink-0" style={{ width: size, height: size }}>
      <span className="absolute" style={{ inset: icon.group }}>
        <span className="absolute" style={{ inset: icon.bleed }}>
          <Asset src={icon.src} className="size-full" />
        </span>
      </span>
    </span>
  );
}

/** What's covered: two columns of benefits, each on its own icon tile. */
export function CoveredCard({ items }: { items: CoverItem[] }) {
  return (
    <Collapsible id="covered" title="What’s covered" summary={`${items.length} benefits`}>
      <ul className="mt-4 grid gap-x-6 gap-y-5 sm:grid-cols-2">
        {items.map((item) => (
          <li key={item.title} className="flex items-start gap-3.5">
            <span className="grid size-11 shrink-0 place-items-center rounded-[11px] bg-accent-tint">
              <CoverGlyph icon={item.icon} size={24} />
            </span>
            <div className="min-w-0 pt-0.5">
              <h3 className="text-[15px] leading-5 font-semibold text-label">{item.title}</h3>
              <p className="mt-0.5 text-[13px] leading-[18px] text-pretty text-label-secondary">
                {item.description}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </Collapsible>
  );
}

/** What's not covered. */
export function NotCoveredCard({ items }: { items: Exclusion[] }) {
  return (
    <Collapsible id="not-covered" title="What’s not covered" summary={`${items.length} exclusions`}>
      <ul className="mt-3 overflow-hidden rounded-[14px] bg-fill">
        {items.map((item, index) => (
          <li key={item.label} className="relative flex items-center gap-3 px-4 py-3">
            {index > 0 ? (
              <span aria-hidden className="absolute top-0 right-0 left-12 h-px bg-separator" />
            ) : null}
            <CoverGlyph icon={item.icon} size={20} />
            <span className="text-[14px] leading-5 text-label">{item.label}</span>
          </li>
        ))}
      </ul>
    </Collapsible>
  );
}

/**
 * A card that folds on phones. Below 640px the title is a button with a
 * count, closed at first, and the content opens with a grid-rows transition;
 * from 640px the plain title shows and the content is always open. Pure CSS
 * decides which, so nothing shifts once the page loads.
 */
function Collapsible({ id, title, summary, children }: { id: string; title: string; summary: string; children: ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <section aria-labelledby={`${id}-title`} className={`${cardClass} p-5 max-sm:py-0`}>
      <h2 id={`${id}-title`} className={`${cardTitle} max-sm:hidden`}>
        {title}
      </h2>
      <h2 className="sm:hidden">
        <button
          type="button"
          aria-expanded={open}
          aria-controls={`${id}-body`}
          onClick={() => setOpen((value) => !value)}
          className="-mx-5 flex min-h-16 w-[calc(100%+40px)] items-center gap-3 px-5 text-left"
        >
          <span className="flex-1">
            <span className={`block ${cardTitle}`}>{title}</span>
            <span className="block text-[13px] leading-[18px] text-label-secondary">{summary}</span>
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
        id={`${id}-body`}
        className={`grid transition-[grid-template-rows,visibility] duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] sm:grid-rows-[1fr] ${
          open ? "grid-rows-[1fr]" : "grid-rows-[0fr] max-sm:invisible"
        }`}
      >
        <div className={`min-h-0 overflow-hidden ${open ? "max-sm:pb-5" : ""}`}>{children}</div>
      </div>
    </section>
  );
}
