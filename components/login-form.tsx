"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { buttonClass } from "@/components/ui/buttons";

type Mode = "mobile" | "application";

const copy: Record<
  Mode,
  { label: string; placeholder: string; switchTo: string; error: string }
> = {
  mobile: {
    label: "Mobile number",
    placeholder: "Mobile number",
    switchTo: "Use your application number instead",
    error: "Enter your 10-digit mobile number.",
  },
  application: {
    label: "Application number",
    placeholder: "Application number",
    switchTo: "Use your mobile number instead",
    error: "Enter the 11-digit number from your application.",
  },
};

/**
 * Sign in. There's no backend: any well-formed number opens the dashboard.
 * The link under the button switches to an application number.
 */
export function LoginForm() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("mobile");
  const [value, setValue] = useState("");
  const [invalid, setInvalid] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const text = copy[mode];

  function isValid(raw: string) {
    const digits = raw.replace(/[\s#-]/g, "");
    return mode === "mobile" ? /^\d{10}$/.test(digits) : /^\d{11}$/.test(digits);
  }

  function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!isValid(value)) {
      setInvalid(true);
      inputRef.current?.focus();
      return;
    }
    setSubmitting(true);
    router.push("/dashboard");
  }

  function switchMode() {
    setMode((current) => (current === "mobile" ? "application" : "mobile"));
    setValue("");
    setInvalid(false);
    inputRef.current?.focus();
  }

  return (
    <form noValidate onSubmit={onSubmit} className="mt-10 flex w-full max-w-[360px] flex-col items-center">
      <label htmlFor="login-id" className="sr-only">
        {text.label}
      </label>
      <div
        className={`flex h-[52px] w-full items-center rounded-control bg-surface pl-4 transition-shadow duration-150 ${
          invalid
            ? "shadow-[0_0_0_1.5px_var(--color-red-text)] has-[:focus-visible]:shadow-[0_0_0_2px_var(--color-red-text),0_0_0_6px_rgb(196_30_58_/_0.12)]"
            : "shadow-[0_0_0_1px_rgb(0_0_0_/_0.1),0_1px_2px_rgb(0_0_0_/_0.04)] has-[:focus-visible]:shadow-[0_0_0_2px_var(--color-accent),0_0_0_6px_rgb(0_113_227_/_0.15)]"
        }`}
      >
        {mode === "mobile" ? (
          <>
            <span className="text-[17px] leading-6 text-label">+91</span>
            <span aria-hidden className="mx-3 h-5 w-px bg-separator" />
          </>
        ) : null}
        <input
          ref={inputRef}
          id="login-id"
          name={mode === "mobile" ? "mobile" : "application-number"}
          type={mode === "mobile" ? "tel" : "text"}
          inputMode="numeric"
          autoComplete={mode === "mobile" ? "tel-national" : "off"}
          maxLength={mode === "mobile" ? 10 : 12}
          placeholder={text.placeholder}
          value={value}
          aria-invalid={invalid || undefined}
          aria-describedby={invalid ? "login-error" : undefined}
          onChange={(event) => {
            setValue(event.target.value);
            if (invalid && isValid(event.target.value)) setInvalid(false);
          }}
          className="h-full min-w-0 flex-1 rounded-r-control bg-transparent pr-4 text-[17px] leading-6 text-label tabular-nums placeholder:text-label-tertiary focus:outline-none"
        />
      </div>
      {invalid ? (
        <p id="login-error" className="mt-2 self-start px-1 text-[13px] leading-[18px] text-red-text">
          {text.error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={submitting}
        className={`${buttonClass("filled", "large")} mt-4 w-full disabled:cursor-progress disabled:opacity-80`}
      >
        {submitting ? "Signing in…" : "Continue"}
      </button>

      <button
        type="button"
        onClick={switchMode}
        className="mt-5 rounded-control px-3 py-1.5 text-[15px] leading-5 text-accent-text transition-colors duration-150 active:bg-accent-tint [@media(hover:hover)]:hover:underline [@media(hover:hover)]:hover:underline-offset-4"
      >
        {text.switchTo}
      </button>
    </form>
  );
}
