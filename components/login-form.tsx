"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";

type Mode = "mobile" | "application";

const copy: Record<
  Mode,
  { label: string; placeholder: string; submit: string; switchTo: string; error: string }
> = {
  mobile: {
    label: "Mobile number",
    placeholder: "Mobile number",
    submit: "Continue with mobile number",
    switchTo: "application number?",
    error: "Enter your 10-digit mobile number",
  },
  application: {
    label: "Application number",
    placeholder: "Application number",
    submit: "Continue with application number",
    switchTo: "mobile number?",
    error: "Enter the 11-digit application number from your proposal",
  },
};

/**
 * Sign-in (node 149:10705). There's no backend: any well-formed number opens
 * the dashboard. The link under the button swaps to signing in with an
 * application number instead.
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
    <form noValidate onSubmit={onSubmit} className="mt-12 flex w-full max-w-[357px] flex-col items-center">
      <label htmlFor="login-id" className="sr-only">
        {text.label}
      </label>
      <div
        className={`flex h-11 w-full items-center rounded-xl border bg-field pl-3 transition-[border-color] duration-150 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-primary-strong ${
          invalid ? "border-danger-text" : "border-field-border"
        }`}
      >
        {mode === "mobile" ? (
          <>
            <span className="text-[14px] leading-5 text-ink">+91</span>
            <span aria-hidden className="mx-2.5 h-4 w-px bg-field-border" />
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
          className="h-full min-w-0 flex-1 rounded-r-xl bg-transparent pr-3 text-[16px] leading-5 text-ink placeholder:text-field-placeholder focus:outline-none sm:text-[14px]"
        />
      </div>
      {invalid ? (
        <p id="login-error" className="mt-2 self-start text-[13px] leading-[18px] text-danger-text">
          {text.error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={submitting}
        className="relative mt-5 flex h-11 w-full items-center justify-center rounded-xl border border-[#0772c8] px-[30px] text-[16px] leading-[normal] font-medium text-white shadow-[0_7.417px_9.889px_0_rgb(0_0_0_/_0.12),0_0.5px_1px_0_rgb(31_42_52_/_0.15),0_7px_9px_0_rgb(31_42_52_/_0.07)] transition-transform duration-150 ease-out active:scale-[0.96] disabled:cursor-progress"
        style={{ background: "linear-gradient(to bottom, #1788e5 0%, #107ed8 234.62%)" }}
      >
        {text.submit}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-[inherit] shadow-[inset_0_-2px_0_0_rgb(0_104_197_/_0.8)]"
        />
      </button>

      <p className="mt-5 text-center text-[15px] leading-[1.5] text-login-ink">
        Login using your{" "}
        <button
          type="button"
          onClick={switchMode}
          className="rounded text-link underline-offset-2 [@media(hover:hover)]:hover:underline"
        >
          {text.switchTo}
        </button>
      </p>
    </form>
  );
}
