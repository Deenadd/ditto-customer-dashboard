"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { OtpField } from "@/components/otp-field";
import { buttonClass } from "@/components/ui/buttons";

type Mode = "mobile" | "application";

const CODE_LENGTH = 4;
const RESEND_SECONDS = 30;

const copy: Record<Mode, { label: string; switchTo: string; error: string }> = {
  mobile: {
    label: "Mobile number",
    switchTo: "Use your application number instead",
    error: "Enter your 10-digit mobile number.",
  },
  application: {
    label: "Application number",
    switchTo: "Use your mobile number instead",
    error: "Enter the 11-digit number from your application.",
  },
};

const digitsOf = (raw: string) => raw.replace(/[\s#-]/g, "");

/** "9876543210" → "+91 98765 43210" */
const formatMobile = (digits: string) => `+91 ${digits.slice(0, 5)} ${digits.slice(5)}`;

/**
 * Sign in, in two steps. A mobile number gets a one-time code by SMS, and
 * the code is checked on the next step; an application number signs in
 * directly. There's no backend: any well-formed number and any full code
 * open the dashboard.
 */
export function SignInFlow() {
  const [step, setStep] = useState<"number" | "code">("number");
  /* Null until the first step change, so nothing slides in on page load. */
  const [direction, setDirection] = useState<"forward" | "back" | null>(null);
  const [mobile, setMobile] = useState("");

  return (
    <div
      key={step}
      className={`flex w-full flex-col items-center ${
        direction === null
          ? ""
          : `motion-safe:animate-step-in ${direction === "back" ? "[--step-from:-16px]" : "[--step-from:16px]"}`
      }`}
    >
      {step === "number" ? (
        <NumberStep
          initialMobile={mobile}
          onCodeSent={(digits) => {
            setMobile(digits);
            setDirection("forward");
            setStep("code");
          }}
        />
      ) : (
        <CodeStep
          mobile={mobile}
          onChangeNumber={() => {
            setDirection("back");
            setStep("number");
          }}
        />
      )}
    </div>
  );
}

function NumberStep({
  initialMobile,
  onCodeSent,
}: {
  initialMobile: string;
  onCodeSent: (digits: string) => void;
}) {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("mobile");
  const [value, setValue] = useState(initialMobile);
  const [invalid, setInvalid] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const text = copy[mode];

  /* Coming back from the code step, put the cursor back in the number. */
  useEffect(() => {
    if (initialMobile) inputRef.current?.focus();
  }, [initialMobile]);

  function isValid(raw: string) {
    const digits = digitsOf(raw);
    return mode === "mobile" ? /^\d{10}$/.test(digits) : /^\d{11}$/.test(digits);
  }

  function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!isValid(value)) {
      setInvalid(true);
      inputRef.current?.focus();
      return;
    }
    if (mode === "mobile") {
      onCodeSent(digitsOf(value));
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
    <>
      <h1 className="mt-8 max-w-[440px] text-center text-[40px] leading-[44px] font-bold tracking-[-0.035em] text-balance text-label max-sm:text-[32px] max-sm:leading-9">
        Insurance, made simple.
      </h1>
      <p className="mt-3 max-w-[340px] text-center text-[17px] leading-6 text-pretty text-label-secondary">
        Sign in to see your policies, applications and saved documents.
      </p>

      <form
        noValidate
        onSubmit={onSubmit}
        className="mt-10 flex w-full max-w-[360px] flex-col items-center"
      >
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
            placeholder={text.label}
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
    </>
  );
}

function CodeStep({ mobile, onChangeNumber }: { mobile: string; onChangeNumber: () => void }) {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [invalid, setInvalid] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(RESEND_SECONDS);
  const [status, setStatus] = useState("");
  const codeRef = useRef<HTMLInputElement>(null);
  const shakeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    codeRef.current?.focus();
  }, []);

  useEffect(() => {
    if (secondsLeft <= 0) return;
    const timer = window.setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [secondsLeft]);

  function verify(value: string) {
    if (value.length < CODE_LENGTH) {
      setInvalid(true);
      codeRef.current?.focus();
      if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        shakeRef.current?.animate(
          [
            { transform: "translateX(0)" },
            { transform: "translateX(-8px)" },
            { transform: "translateX(6px)" },
            { transform: "translateX(-4px)" },
            { transform: "translateX(2px)" },
            { transform: "translateX(0)" },
          ],
          { duration: 360, easing: "cubic-bezier(0.23, 1, 0.32, 1)" },
        );
      }
      return;
    }
    setVerifying(true);
    setStatus("Code verified. Signing you in.");
    router.push("/dashboard");
  }

  function resend() {
    setCode("");
    setInvalid(false);
    setSecondsLeft(RESEND_SECONDS);
    setStatus(`We sent a new code to ${formatMobile(mobile)}.`);
    codeRef.current?.focus();
  }

  const clock = `0:${String(secondsLeft).padStart(2, "0")}`;

  return (
    <>
      <h1 className="mt-8 text-center text-[32px] leading-9 font-bold tracking-[-0.03em] text-balance text-label">
        Verify your number
      </h1>
      <p
        id="otp-hint"
        className="mt-3 max-w-[340px] text-center text-[17px] leading-6 text-pretty text-label-secondary"
      >
        Enter the {CODE_LENGTH}-digit code we sent by SMS to{" "}
        <span className="font-medium whitespace-nowrap text-label tabular-nums">
          {formatMobile(mobile)}
        </span>
        .
      </p>
      <button
        type="button"
        onClick={onChangeNumber}
        className="mt-1 rounded-control px-3 py-1.5 text-[15px] leading-5 text-accent-text transition-colors duration-150 active:bg-accent-tint [@media(hover:hover)]:hover:underline [@media(hover:hover)]:hover:underline-offset-4"
      >
        Change number
      </button>

      <form
        noValidate
        onSubmit={(event) => {
          event.preventDefault();
          verify(code);
        }}
        className="mt-7 flex w-full max-w-[360px] flex-col items-center"
      >
        <div ref={shakeRef}>
          <OtpField
            ref={codeRef}
            length={CODE_LENGTH}
            value={code}
            invalid={invalid}
            disabled={verifying}
            describedBy={invalid ? "otp-hint otp-error" : "otp-hint"}
            onChange={(next) => {
              setCode(next);
              if (invalid) setInvalid(false);
              /* A full code verifies itself, as it does on iPhone. */
              if (next.length === CODE_LENGTH) verify(next);
            }}
          />
        </div>
        {invalid ? (
          <p id="otp-error" className="mt-3 text-[13px] leading-[18px] text-red-text">
            Enter all {CODE_LENGTH} digits of the code.
          </p>
        ) : null}

        <button
          type="submit"
          disabled={verifying}
          className={`${buttonClass("filled", "large")} mt-6 w-full disabled:cursor-progress disabled:opacity-80`}
        >
          {verifying ? "Verifying…" : "Verify"}
        </button>

        <p className="mt-5 text-center text-[15px] leading-5 text-label-secondary">
          Didn&rsquo;t get a code?{" "}
          {secondsLeft > 0 ? (
            <span className="tabular-nums">Resend in {clock}</span>
          ) : (
            <button
              type="button"
              onClick={resend}
              className="rounded-control px-1 text-accent-text [@media(hover:hover)]:hover:underline [@media(hover:hover)]:hover:underline-offset-4"
            >
              Resend code
            </button>
          )}
        </p>
      </form>

      <p role="status" className="sr-only">
        {status}
      </p>
    </>
  );
}
