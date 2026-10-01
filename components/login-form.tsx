"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { OtpField } from "@/components/otp-field";
import { Button } from "@/components/ui/buttons";
import { useGlowConfig } from "@/components/login/glow-config";
import { GlowControls, type GlowPreview } from "@/components/login/glow-controls";
import type { GlowTone } from "@/components/login/glow-ramps";
import { SignInGradient } from "@/components/login/sign-in-gradient";

type Mode = "mobile" | "policy";

const CODE_LENGTH = 4;
const RESEND_SECONDS = 30;
/** No SMS is sent in this prototype; this is the code that signs you in. */
const DEMO_CODE = "2168";
/** The mobile number on file for a policy, for this prototype. */
const POLICY_MOBILE = "9876543210";

const modeCopy: Record<Mode, { label: string; switchTo: string; error: string }> = {
  mobile: {
    label: "Mobile number",
    switchTo: "Use your policy number instead",
    error: "Enter your 10-digit mobile number.",
  },
  policy: {
    label: "Policy number",
    switchTo: "Use your mobile number instead",
    error: "Enter your policy number, as it appears on your policy document.",
  },
};

const isValid = (mode: Mode, raw: string) =>
  mode === "mobile"
    ? /^\d{10}$/.test(raw.replace(/\s/g, ""))
    : /^[A-Za-z0-9-]{8,20}$/.test(raw.trim());

/** "9876543210" → "+91 98765 43210" */
const formatMobile = (digits: string) => `+91 ${digits.slice(0, 5)} ${digits.slice(5)}`;

/** Where the code went: an optional lead-in, then the number, kept on one line. */
type Destination = { lead: string; number: string };

const ease = [0.23, 1, 0.32, 1] as const;

/**
 * Sign in, in two steps. The logo, heading, subtitle and input row sit in
 * the same place on both steps; only the words change. A blue wash rests at
 * the top throughout, and turns red for a wrong code or green for the right
 * one before the dashboard opens.
 */
export function SignInFlow() {
  const [step, setStep] = useState<"number" | "code">("number");
  const [mode, setMode] = useState<Mode>("mobile");
  const [value, setValue] = useState("");
  const [tone, setTone] = useState<GlowTone>("blue");
  const reduced = useReducedMotion();
  const glow = useGlowConfig();
  const [controlsOpen, setControlsOpen] = useState(false);
  const [preview, setPreview] = useState<GlowPreview>({ tone: "auto" });

  /* Shift+Option+C (Shift+Alt+C) reveals the glow controls. The key code is
     used because Option changes the typed character on a Mac. */
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (!(event.altKey && event.shiftKey && event.code === "KeyC")) return;
      event.preventDefault();
      setControlsOpen((open) => !open);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  /* The content swaps in place, so this is a crossfade, not a slide. */
  const swap = reduced
    ? { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } }
    : {
        initial: { opacity: 0, filter: "blur(4px)" },
        animate: { opacity: 1, filter: "blur(0px)" },
        exit: { opacity: 0, filter: "blur(4px)", transition: { duration: 0.14, ease } },
      };

  return (
    <>
      <SignInGradient
        config={glow}
        tone={preview.tone === "auto" ? tone : preview.tone}
      />
      <GlowControls
        open={controlsOpen}
        onClose={() => {
          /* Hand the glow back to the flow when the panel closes. */
          setControlsOpen(false);
          setPreview({ tone: "auto" });
        }}
        config={glow}
        preview={preview}
        onPreviewChange={setPreview}
      />

      {/* Centred on screen. The two steps differ in height (394 and 458px from
          logo to last line), so the column is centred on their midpoint, 424px,
          rather than on whichever is showing. Both sit within 32px of true
          centre, and the logo, heading and inputs stay put between steps and
          when an error line appears; extra lines grow downward. */}
      <div className="flex w-full flex-col items-center px-6 pt-[max(40px,calc((100dvh-424px)/2))] pb-12">
        <Image
          src="/brand/ditto-logo.png"
          alt="Ditto"
          width={663}
          height={307}
          priority
          className="h-[46px] w-[99px] object-contain"
        />
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={step}
            {...swap}
            transition={{ duration: reduced ? 0.12 : 0.24, ease }}
            className="flex w-full flex-col items-center"
          >
            {step === "number" ? (
              <NumberStep
                mode={mode}
                value={value}
                onModeChange={setMode}
                onValueChange={setValue}
                onContinue={() => {
                  setTone("blue");
                  setStep("code");
                }}
              />
            ) : (
              <CodeStep
                destination={
                  mode === "mobile"
                    ? { lead: "", number: formatMobile(value.replace(/\s/g, "")) }
                    : { lead: "the mobile number on this policy, ending ", number: POLICY_MOBILE.slice(-4) }
                }
                onToneChange={setTone}
                onChangeNumber={() => {
                  setTone("blue");
                  setStep("number");
                }}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </>
  );
}

/* Shared by both steps, so the heading, subtitle and input row line up:
   the subtitle always reserves two lines. */
function Heading({ title, children }: { title: string; children: ReactNode }) {
  return (
    <>
      <h1 className="mt-8 max-w-[440px] text-center text-[40px] leading-[44px] font-bold tracking-[-0.035em] text-balance text-label max-sm:text-[32px] max-sm:leading-9">
        {title}
      </h1>
      <p className="mt-3 min-h-12 max-w-[340px] text-center text-[17px] leading-6 text-pretty text-label-secondary">
        {children}
      </p>
    </>
  );
}

const formClass = "mt-10 flex w-full max-w-[360px] flex-col";

function ErrorLine({ id, children }: { id: string; children: ReactNode }) {
  return (
    <p
      id={id}
      role="alert"
      className="mt-2.5 flex items-start justify-center gap-1.5 text-center text-[13px] leading-[18px] text-red-text"
    >
      <svg aria-hidden width="16" height="16" viewBox="0 0 16 16" className="mt-px shrink-0">
        <circle cx="8" cy="8" r="7" fill="none" stroke="currentColor" strokeWidth="1.4" />
        <path d="M8 4.5v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="8" cy="11.2" r=".9" fill="currentColor" />
      </svg>
      {children}
    </p>
  );
}

function NumberStep({
  mode,
  value,
  onModeChange,
  onValueChange,
  onContinue,
}: {
  mode: Mode;
  value: string;
  onModeChange: (mode: Mode) => void;
  onValueChange: (value: string) => void;
  onContinue: () => void;
}) {
  const [invalid, setInvalid] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const copy = modeCopy[mode];

  return (
    <>
      <Heading title="Insurance, made simple.">
        Sign in to see your policies, applications and claims.
      </Heading>

      <form
        noValidate
        onSubmit={(event) => {
          event.preventDefault();
          if (!isValid(mode, value)) {
            setInvalid(true);
            inputRef.current?.focus();
            return;
          }
          onContinue();
        }}
        className={formClass}
      >
        <label htmlFor="login-id" className="sr-only">
          {copy.label}
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
            name={mode === "mobile" ? "mobile" : "policy-number"}
            type={mode === "mobile" ? "tel" : "text"}
            inputMode={mode === "mobile" ? "numeric" : "text"}
            autoComplete={mode === "mobile" ? "tel-national" : "off"}
            autoCapitalize={mode === "policy" ? "characters" : undefined}
            maxLength={mode === "mobile" ? 11 : 20}
            placeholder={copy.label}
            value={value}
            aria-invalid={invalid || undefined}
            aria-describedby={invalid ? "login-error" : undefined}
            onChange={(event) => {
              onValueChange(event.target.value);
              if (invalid && isValid(mode, event.target.value)) setInvalid(false);
            }}
            className="h-full min-w-0 flex-1 rounded-r-control bg-transparent pr-4 text-[17px] leading-6 text-label tabular-nums placeholder:text-label-tertiary focus:outline-none"
          />
        </div>
        {invalid ? <ErrorLine id="login-error">{copy.error}</ErrorLine> : null}

        <Button type="submit" size="large" className="mt-4 w-full">
          Continue
        </Button>
        <Button
          variant="plain"
          size="large"
          className="mt-2 w-full"
          onClick={() => {
            onModeChange(mode === "mobile" ? "policy" : "mobile");
            onValueChange("");
            setInvalid(false);
            inputRef.current?.focus();
          }}
        >
          {copy.switchTo}
        </Button>
      </form>
    </>
  );
}

function CodeStep({
  destination,
  onToneChange,
  onChangeNumber,
}: {
  destination: Destination;
  onToneChange: (tone: GlowTone) => void;
  onChangeNumber: () => void;
}) {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [error, setError] = useState<string>();
  const [state, setState] = useState<"idle" | "checking" | "verified">("idle");
  const [secondsLeft, setSecondsLeft] = useState(RESEND_SECONDS);
  const [status, setStatus] = useState("");
  const codeRef = useRef<HTMLInputElement>(null);
  const timers = useRef<number[]>([]);

  useEffect(() => {
    codeRef.current?.focus();
    const pending = timers.current;
    return () => pending.forEach(window.clearTimeout);
  }, []);

  useEffect(() => {
    if (secondsLeft <= 0) return;
    const timer = window.setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [secondsLeft]);

  const later = (fn: () => void, ms: number) => {
    timers.current.push(window.setTimeout(fn, ms));
  };

  function verify(value: string) {
    if (state !== "idle") return;
    if (value.length < CODE_LENGTH) {
      setError(`Enter all ${CODE_LENGTH} digits of the code.`);
      codeRef.current?.focus();
      return;
    }
    setError(undefined);
    setState("checking");
    /* A short pause stands in for the server checking the code. */
    later(() => {
      if (value === DEMO_CODE) {
        setState("verified");
        setStatus("Code verified. Opening your dashboard.");
        onToneChange("green");
        later(() => router.push("/dashboard"), 900);
      } else {
        setState("idle");
        setError("That code isn't right. Check the SMS and enter it again.");
        onToneChange("red");
        later(() => {
          setCode("");
          codeRef.current?.focus();
        }, 700);
      }
    }, 450);
  }

  return (
    <>
      <Heading title="Verify your number">
        Enter the {CODE_LENGTH}-digit code we sent by SMS to {destination.lead}
        <span className="whitespace-nowrap text-label tabular-nums">{destination.number}</span>.
      </Heading>

      <form
        noValidate
        onSubmit={(event) => {
          event.preventDefault();
          verify(code);
        }}
        className={formClass}
      >
        <OtpField
          ref={codeRef}
          length={CODE_LENGTH}
          value={code}
          invalid={Boolean(error)}
          disabled={state !== "idle"}
          describedBy={error ? "otp-error" : "otp-hint"}
          onChange={(next) => {
            setCode(next);
            if (error) {
              setError(undefined);
              onToneChange("blue");
            }
            if (next.length === CODE_LENGTH) verify(next);
          }}
        />
        {error ? (
          <ErrorLine id="otp-error">{error}</ErrorLine>
        ) : (
          <p id="otp-hint" className="mt-2.5 text-center text-[13px] leading-[18px] text-label-secondary">
            This prototype sends no SMS. Use {DEMO_CODE}.
          </p>
        )}

        <Button type="submit" size="large" className="mt-4 w-full" aria-busy={state === "checking"}>
          {state === "checking" ? "Checking…" : state === "verified" ? "Verified" : "Verify code"}
        </Button>
        <Button variant="plain" size="large" className="mt-2 w-full" onClick={onChangeNumber}>
          Change number
        </Button>

        <p className="mt-4 text-center text-[15px] leading-5 text-label-secondary">
          Didn&rsquo;t get a code?{" "}
          {secondsLeft > 0 ? (
            <span className="tabular-nums">Resend in 0:{String(secondsLeft).padStart(2, "0")}</span>
          ) : (
            <button
              type="button"
              onClick={() => {
                setCode("");
                setError(undefined);
                onToneChange("blue");
                setSecondsLeft(RESEND_SECONDS);
                setStatus(`We sent a new code to ${destination.lead}${destination.number}.`);
                codeRef.current?.focus();
              }}
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
