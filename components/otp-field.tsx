"use client";

import { forwardRef, useEffect, useState } from "react";
import { AnimatePresence, motion, useAnimate, useReducedMotion } from "motion/react";

/* One box is 56px wide with 10px between, so the ring moves 66px a digit. */
const STEP = 66;

/* Apple-style springs: critically damped for the ring that follows your
   typing, a touch of bounce only where something lands. */
const glide = { type: "spring", duration: 0.35, bounce: 0.15 } as const;
const land = { type: "spring", duration: 0.3, bounce: 0 } as const;

/**
 * A one-time code drawn as separate boxes but typed into a single real input,
 * so paste, SMS autofill (`one-time-code`) and screen readers all behave as
 * they would with one field. The input sits invisibly over the boxes and
 * takes every click.
 *
 * The motion is the iOS passcode screen's:
 * - one focus ring glides to the next box as you type or delete, on a
 *   spring, rather than each box lighting up in turn;
 * - a digit rises into its box out of a slight blur, and sinks out of it
 *   when deleted;
 * - while the code is checked the digits breathe, one after another;
 * - a wrong code shakes the row, as a wrong passcode does;
 * - a right one turns the boxes green in a quick wave, left to right.
 * Reduced motion keeps the colour changes and drops the movement.
 */
export const OtpField = forwardRef<
  HTMLInputElement,
  {
    length: number;
    value: string;
    onChange: (value: string) => void;
    invalid?: boolean;
    /** Checking: the digits breathe. Verified: the green wave. */
    status?: "idle" | "checking" | "verified";
    describedBy?: string;
    disabled?: boolean;
  }
>(function OtpField({ length, value, onChange, invalid, status = "idle", describedBy, disabled }, ref) {
  const [focused, setFocused] = useState(false);
  const reduced = !!useReducedMotion();
  const [row, animateRow] = useAnimate();
  const active = Math.min(value.length, length - 1);
  const verified = status === "verified";

  /* A wrong code shakes the row: a quick, decaying side-to-side. */
  useEffect(() => {
    if (!invalid || reduced || !row.current) return;
    animateRow(row.current, { x: [0, -10, 9, -6, 4, -2, 0] }, { duration: 0.42, ease: "easeOut" });
  }, [invalid, reduced, row, animateRow]);

  return (
    <div className="relative flex justify-center">
      <div ref={row} className="relative inline-flex gap-2.5">
        {Array.from({ length }, (_, index) => {
          const digit = value[index];
          const isActive = focused && index === active && status === "idle";
          return (
            <motion.div
              key={index}
              aria-hidden
              animate={verified && !reduced ? { scale: [1, 1.06, 1] } : { scale: 1 }}
              transition={{ duration: 0.32, ease: "easeOut", delay: verified ? index * 0.05 : 0 }}
              className={`relative grid h-[52px] w-14 place-items-center overflow-hidden rounded-control bg-surface text-[24px] leading-none font-semibold tracking-[-0.02em] tabular-nums transition-[box-shadow,background-color,color] duration-200 ease-out ${
                verified
                  ? "bg-green-tint text-green-text shadow-[0_0_0_1.5px_var(--color-green-dot)]"
                  : invalid
                    ? "text-label shadow-[0_0_0_1.5px_var(--color-red-text)]"
                    : "text-label shadow-field"
              }`}
              style={verified ? { transitionDelay: `${index * 50}ms` } : undefined}
            >
              <AnimatePresence initial={false} mode="popLayout">
                {digit ? (
                  <motion.span
                    key={`${index}-${digit}`}
                    initial={reduced ? { opacity: 0 } : { opacity: 0, y: 12, scale: 0.9, filter: "blur(4px)" }}
                    animate={
                      status === "checking" && !reduced
                        ? { opacity: [1, 0.45, 1], y: 0, scale: 1, filter: "blur(0px)" }
                        : { opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }
                    }
                    exit={reduced ? { opacity: 0 } : { opacity: 0, y: 8, scale: 0.9, filter: "blur(4px)" }}
                    transition={
                      status === "checking" && !reduced
                        ? { opacity: { duration: 0.9, repeat: Infinity, ease: "easeInOut", delay: index * 0.12 } }
                        : land
                    }
                  >
                    {digit}
                  </motion.span>
                ) : isActive ? (
                  <motion.span
                    key="caret"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.12 }}
                    className="h-7 w-0.5 rounded-full bg-accent motion-safe:animate-caret"
                  />
                ) : null}
              </AnimatePresence>
            </motion.div>
          );
        })}

        {/* The focus ring: one shape that glides between boxes. */}
        <motion.span
          aria-hidden
          initial={false}
          animate={{
            transform: `translateX(${active * STEP}px)`,
            opacity: focused && !invalid && status === "idle" ? 1 : 0,
          }}
          transition={reduced ? { duration: 0 } : { transform: glide, opacity: { duration: 0.15 } }}
          className="pointer-events-none absolute top-0 left-0 h-[52px] w-14 rounded-control shadow-[0_0_0_2px_var(--color-accent),0_0_0_6px_rgb(0_113_227_/_0.15)]"
        />
      </div>
      <input
        ref={ref}
        id="otp"
        name="otp"
        type="text"
        inputMode="numeric"
        autoComplete="one-time-code"
        pattern="[0-9]*"
        maxLength={length}
        value={value}
        disabled={disabled}
        aria-label="Verification code"
        aria-invalid={invalid || undefined}
        aria-describedby={describedBy}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        onChange={(event) => onChange(event.target.value.replace(/\D/g, "").slice(0, length))}
        className="absolute inset-0 w-full cursor-text rounded-control text-[16px] text-transparent caret-transparent opacity-0 outline-none selection:bg-transparent"
      />
    </div>
  );
});
