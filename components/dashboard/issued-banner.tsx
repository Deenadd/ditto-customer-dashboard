"use client";

import Link from "next/link";
import { useState, type TransitionEvent } from "react";
import { Glow } from "@/components/ui/asset";
import { IconCheck, IconChevronRight, IconClose } from "@/components/ui/icons";
import type { Application } from "@/lib/dashboard-data";
import { applicationHref, seenCookie, type Customer } from "@/lib/routes";

/*
 * The good news, at the top of the policies: an application's verification
 * is done and it's a policy now. One line and the policy number, the whole
 * banner opens the issued screen, and the cross dismisses it for a year.
 * Green, like the issued pill and the issued screen's glow, with the words
 * carrying the meaning too.
 */
export function IssuedBanner({ application, customer }: { application: Application; customer: Customer }) {
  const [state, setState] = useState<"shown" | "leaving" | "gone">("shown");
  if (state === "gone" || !application.policyId) return null;

  const dismiss = () => {
    document.cookie = `${seenCookie(application.id)}=1; path=/; max-age=31536000; samesite=lax`;
    setState("leaving");
  };
  /* The rows below slide up as the banner folds; a rare, one-time exit. */
  const settle = (event: TransitionEvent) => {
    if (event.propertyName === "grid-template-rows") setState("gone");
  };

  return (
    <div
      data-issued-banner
      onTransitionEnd={settle}
      className={`grid transition-[grid-template-rows,opacity] duration-200 ease-strong motion-reduce:transition-none ${
        state === "leaving" ? "grid-rows-[0fr] opacity-0" : "grid-rows-[1fr]"
      }`}
    >
      <div className="min-h-0 overflow-hidden">
        <section
          aria-labelledby="issued-banner-title"
          className="relative isolate mb-6 overflow-hidden rounded-[22px] bg-green-tint transition-[transform,box-shadow] duration-150 ease-out has-[[data-card-link]:active]:scale-[0.99] has-[[data-card-link]:focus-visible]:outline-2 has-[[data-card-link]:focus-visible]:outline-offset-2 has-[[data-card-link]:focus-visible]:outline-accent"
        >
          <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
            <Glow src="/dashboard/glow-card-green.svg" size={220} style={{ right: -60, top: -110 }} />
          </div>
          <div className="flex items-start gap-3.5 p-4 pr-14 sm:p-5 sm:pr-16">
            {/* The tick pops in once, like the issued screen's: good news is seen once. */}
            <span
              aria-hidden
              className="grid size-10 shrink-0 animate-pop place-items-center rounded-[12px] bg-surface text-green-text shadow-tile motion-reduce:animate-none"
            >
              <IconCheck size={20} />
            </span>
            <div className="min-w-0 pt-0.5">
              <h2 id="issued-banner-title" className="text-[15px] leading-5 font-semibold tracking-[-0.01em] text-green-text">
                Verification completed
              </h2>
              <p className="mt-0.5 text-[14px] leading-5 text-pretty text-label-secondary">
                {application.name} is active now. Policy number{" "}
                <span className="whitespace-nowrap tabular-nums">{application.policyId}</span>.
              </p>
              <Link
                data-card-link
                href={applicationHref(application.id, customer)}
                className="mt-2 inline-flex items-center gap-0.5 text-[14px] leading-5 font-semibold text-green-text after:absolute after:inset-0 after:rounded-[22px] focus-visible:outline-none [@media(hover:hover)]:hover:underline"
              >
                View policy
                <IconChevronRight size={16} className="-mr-1" />
                <span className="sr-only">, {application.name}</span>
              </Link>
            </div>
          </div>
          <button
            type="button"
            onClick={dismiss}
            aria-label="Dismiss this notice"
            className="touch-hit absolute top-3.5 right-3.5 z-10 grid size-8 place-items-center rounded-full text-green-text transition-[transform,background-color] duration-150 ease-out active:scale-[0.96] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent sm:top-4 sm:right-4 [@media(hover:hover)]:hover:bg-green-dot/15"
          >
            <IconClose size={18} />
          </button>
        </section>
      </div>
    </div>
  );
}
