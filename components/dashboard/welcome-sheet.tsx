"use client";

import { haptic } from "@/lib/haptics";
import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, motion, useDragControls, useReducedMotion } from "motion/react";
import { Glow } from "@/components/ui/asset";
import { lockScroll, unlockScroll } from "@/lib/use-scroll-lock";

/* A sheet on Apple's drawer spring (damping 0.8, response 0.3): it lands
   with a hint of give, and it carries a release's speed. */
const sheetSpring = { type: "spring", duration: 0.42, bounce: 0.14 } as const;

/**
 * The welcome card on a phone, as a top sheet (Figma, iPhone 13 mini 85/86):
 * a slim bar under the header greets you, and tapping it draws the whole
 * card down from under the header over a dimmed page. The round button at
 * its foot folds it back up; so does dragging it up, tapping the page, or
 * Escape. The page doesn't scroll while it's open.
 *
 * Phones only: from 640px the card sits in the page as before.
 */
export function WelcomeSheet({ firstName, children }: { firstName: string; children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const reduced = !!useReducedMotion();
  const drag = useDragControls();
  const barRef = useRef<HTMLButtonElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const sheetId = useId();

  useEffect(() => {
    if (!open) return;
    lockScroll();
    closeRef.current?.focus({ preventScroll: true });
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      unlockScroll();
    };
  }, [open]);

  const close = () => {
    setOpen(false);
    barRef.current?.focus({ preventScroll: true });
  };

  return (
    <div className="sm:hidden">
      {/* The bar: attached under the header, edge to edge, rounded below. */}
      <button
        ref={barRef}
        type="button"
        aria-expanded={open}
        aria-controls={sheetId}
        onClick={() => {
          haptic("light");
          setOpen(true);
        }}
        className="relative isolate -mx-3.5 -mt-6 flex h-14 w-[calc(100%+28px)] items-center gap-3 overflow-hidden rounded-b-[20px] bg-surface px-3.5 text-left shadow-[0_1px_0_rgb(0_0_0_/_0.06),0_6px_16px_-10px_rgb(0_0_0_/_0.14)] transition-transform duration-150 ease-out active:scale-[0.99]"
      >
        <span aria-hidden className="absolute inset-0 -z-10 bg-gradient-to-b from-[#f0f7ff] to-white" />
        <span aria-hidden className="absolute inset-0 -z-10">
          <Glow src="/dashboard/glow-1449.svg" style={{ left: 210, top: -120 }} />
        </span>
        <span className="flex-1 truncate text-[20px] leading-6 font-bold tracking-[-0.022em] text-label">
          Hi, {firstName} <span aria-hidden>👋</span>
        </span>
        <span className="sr-only">Show your summary</span>
        <svg aria-hidden width="14" height="9" viewBox="0 0 14 9" fill="none" className="shrink-0 text-label">
          <path d="M1.5 1.75 7 7.25l5.5-5.5" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      <AnimatePresence>
        {open ? (
          <>
            {/* The page, dimmed and softened behind the sheet. */}
            <motion.div
              key="scrim"
              aria-hidden
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              onClick={close}
              className="fixed inset-0 z-20 bg-black/25 backdrop-blur-[3px]"
            />
            {/* Slides out from under the header, which stays on top. */}
            <div className="pointer-events-none fixed inset-x-0 top-[calc(env(safe-area-inset-top)+56px)] bottom-0 z-[25] overflow-hidden">
              <motion.div
                id={sheetId}
                role="dialog"
                aria-modal="true"
                aria-label={`Welcome, ${firstName}`}
                initial={reduced ? { opacity: 0 } : { y: "-100%" }}
                animate={reduced ? { opacity: 1 } : { y: 0 }}
                exit={reduced ? { opacity: 0 } : { y: "-100%" }}
                transition={reduced ? { duration: 0.15 } : sheetSpring}
                drag={reduced ? false : "y"}
                dragControls={drag}
                dragListener={false}
                dragConstraints={{ top: 0, bottom: 0 }}
                dragElastic={{ top: 0.6, bottom: 0.08 }}
                onDragEnd={(_, info) => {
                  if (info.offset.y < -70 || info.velocity.y < -450) close();
                }}
                className="pointer-events-auto relative pb-7"
              >
                <div
                  data-scroll-lock-scrollable
                  className="max-h-[calc(100dvh-env(safe-area-inset-top)-56px-72px)] overflow-y-auto overscroll-contain rounded-b-[28px] bg-surface shadow-[0_24px_48px_-16px_rgb(0_0_0_/_0.25)] [&>section]:rounded-none [&>section]:shadow-none"
                >
                  {children}
                </div>
                {/* Fold it back up: tap, or drag up from here. */}
                <button
                  ref={closeRef}
                  type="button"
                  aria-label="Hide your summary"
                  onClick={close}
                  onPointerDown={(event) => drag.start(event)}
                  className="touch-hit absolute bottom-0 left-1/2 grid size-14 -translate-x-1/2 touch-none place-items-center rounded-full bg-surface text-label shadow-[0_0_0_0.5px_rgb(0_0_0_/_0.06),0_6px_16px_-4px_rgb(0_0_0_/_0.2)] transition-transform duration-150 ease-out active:scale-[0.94]"
                >
                  <svg aria-hidden width="16" height="10" viewBox="0 0 16 10" fill="none">
                    <path d="M1.75 8.25 8 2l6.25 6.25" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              </motion.div>
            </div>
          </>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
