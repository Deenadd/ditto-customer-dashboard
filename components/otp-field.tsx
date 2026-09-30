"use client";

import { forwardRef, useState } from "react";

/**
 * A one-time code drawn as separate boxes but typed into a single real input,
 * so paste, SMS autofill (`one-time-code`) and screen readers all behave as
 * they would with one field. The input sits invisibly over the boxes and
 * takes every click; the box after the last digit shows a caret.
 */
export const OtpField = forwardRef<
  HTMLInputElement,
  {
    length: number;
    value: string;
    onChange: (value: string) => void;
    invalid?: boolean;
    describedBy?: string;
    disabled?: boolean;
  }
>(function OtpField({ length, value, onChange, invalid, describedBy, disabled }, ref) {
  const [focused, setFocused] = useState(false);
  const active = Math.min(value.length, length - 1);

  return (
    <div className="relative flex justify-center gap-2.5">
      {Array.from({ length }, (_, index) => {
        const digit = value[index];
        const isActive = focused && index === active;
        return (
          <div
            key={index}
            aria-hidden
            className={`grid h-[52px] w-14 place-items-center rounded-control bg-surface text-[24px] leading-none font-semibold tracking-[-0.02em] text-label tabular-nums transition-shadow duration-150 ${
              invalid
                ? "shadow-[0_0_0_1.5px_var(--color-red-text)]"
                : isActive
                  ? "shadow-[0_0_0_2px_var(--color-accent),0_0_0_6px_rgb(0_113_227_/_0.15)]"
                  : "shadow-[0_0_0_1px_rgb(0_0_0_/_0.1),0_1px_2px_rgb(0_0_0_/_0.04)]"
            }`}
          >
            {digit ?? (isActive ? <span className="h-7 w-0.5 rounded-full bg-accent motion-safe:animate-caret" /> : null)}
          </div>
        );
      })}
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
