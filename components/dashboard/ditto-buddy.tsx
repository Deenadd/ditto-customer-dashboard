"use client";

import Image from "next/image";
import { useRef, useState, type ReactNode } from "react";
import { ClaimsConversation } from "@/components/claims/claims-conversation";
import { Glow } from "@/components/ui/asset";
import { Button, type ButtonVariant } from "@/components/ui/buttons";
import { cardClass } from "@/components/ui/card-bits";
import { FrostedSideSheet } from "@/components/ui/frosted-side-sheet/frosted-side-sheet";

/**
 * Ditto Buddy, the home page's helper (after Plum's "Ask Plum AI"). The card
 * opens the frosted side sheet with the claims conversation from a greeting,
 * plus a text box: what you type is matched to the topic that answers it.
 */
export function DittoBuddy() {
  return (
    <section aria-labelledby="buddy-title" className={`relative isolate overflow-hidden ${cardClass} px-5 pt-5 pb-5`}>
      <div aria-hidden className="absolute inset-0 -z-10">
        <Glow src="/dashboard/glow-1450.svg" style={{ left: 170, top: -90 }} />
        <Image
          src="/dashboard/mascot-laptop.png"
          alt=""
          width={799}
          height={786}
          sizes="148px"
          /* Peeks in from the bottom-right corner, cut off by the card's
             edge, as the mascots on the welcome card do. */
          className="absolute right-[-13px] bottom-[-33px] h-[145px] w-[148px] object-cover"
        />
      </div>
      <span className="inline-flex h-6 items-center rounded-full bg-accent-tint px-2.5 text-[12px] leading-none font-semibold text-accent-text">
        New
      </span>
      <h2 id="buddy-title" className="mt-3 text-[17px] leading-[22px] font-semibold tracking-[-0.022em] text-label">
        Ditto Buddy
      </h2>
      <p className="mt-1 max-w-[190px] text-[14px] leading-5 text-pretty text-label-secondary">
        Ask anything about your policies, claims and cover.
      </p>
      <BuddyButton variant="filled" className="mt-4">
        Ask Ditto Buddy
      </BuddyButton>
    </section>
  );
}

/**
 * A small button that opens Ditto Buddy in the frosted sheet (a bottom
 * sheet on phones). Each opening starts a fresh conversation. Used by the
 * Buddy card and by Chat now on the welcome card.
 */
export function BuddyButton({
  variant,
  className = "",
  children,
}: {
  variant: ButtonVariant;
  className?: string;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [session, setSession] = useState(0);
  const triggerRef = useRef<HTMLButtonElement | null>(null);

  return (
    <>
      <Button
        ref={triggerRef}
        variant={variant}
        size="small"
        className={className}
        data-sheet-trigger
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => {
          setSession((value) => value + 1);
          setOpen(true);
        }}
      >
        {children}
      </Button>
      <FrostedSideSheet open={open} onClose={() => setOpen(false)} title="Ditto Buddy" returnFocusRef={triggerRef}>
        <ClaimsConversation key={session} start="buddy" composer />
      </FrostedSideSheet>
    </>
  );
}
