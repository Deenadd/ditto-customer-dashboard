"use client";

import { Toaster as Sonner, toast } from "sonner";
import { IconCheck } from "@/components/ui/icons";

/**
 * The app's one toaster (Sonner), mounted in the root layout: bottom centre,
 * clear of the home indicator on a phone. Toasts are drawn headless, in the
 * site's own style, while Sonner keeps the stacking, timing, swipe to
 * dismiss and the polite announcement.
 */
export function Toaster() {
  return (
    <Sonner
      position="bottom-center"
      offset={24}
      mobileOffset={{ bottom: "max(16px, env(safe-area-inset-bottom))", left: 16, right: 16 }}
    />
  );
}

/** A short confirmation: a green tick, what happened, and where it went. */
export function notifySuccess(title: string, description?: string) {
  toast.custom(
    () => (
      <div className="flex w-full items-center gap-3 rounded-[18px] bg-surface py-3 pr-4 pl-3 shadow-raised ring-1 ring-black/[0.04]">
        <span aria-hidden className="grid size-8 shrink-0 place-items-center rounded-full bg-green-tint text-green-text">
          <IconCheck size={16} />
        </span>
        <div className="min-w-0">
          <p className="text-[14px] leading-[18px] font-semibold text-label">{title}</p>
          {description ? <p className="truncate text-[13px] leading-[18px] text-label-secondary">{description}</p> : null}
        </div>
      </div>
    ),
    { duration: 3200 },
  );
}
