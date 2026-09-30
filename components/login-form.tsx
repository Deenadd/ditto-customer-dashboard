"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { CircleAlert } from "lucide-react";
import { Button } from "@/registry/components/button/button";
import { OtpInput } from "@/registry/components/otp-input/otp-input";
import { motionTokens } from "@/lib/motion-tokens";
import { SignInGradient, type GlowTone } from "@/components/login/sign-in-gradient";

type Mode = "mobile" | "policy";

const CODE_LENGTH = 4;
const RESEND_SECONDS = 30;
/** No SMS is sent in this prototype; this is the code that signs you in. */
const DEMO_CODE = "2168";
/** The mobile number on file for a policy, for this prototype. */
const POLICY_MOBILE = "9876543210";

const modeCopy: Record<Mode, { label: string; placeholder: string; switchTo: string; error: string }> = {
  mobile: {
    label: "Mobile number",
    placeholder: "Mobile number",
    switchTo: "Use your policy number instead",
    error: "Enter your 10-digit mobile number.",
  },
  policy: {
    label: "Policy number",
    placeholder: "Policy number",
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

/**
 * Sign in, in two steps, over the glow from the reference. The glow rests at
 * the bottom while you enter a number, travels to the top for the code, and
 * turns red for a wrong code or green for the right one before the dashboard
 * opens.
 */
export function SignInFlow() {
  const [step, setStep] = useState<"number" | "code">("number");
  const [mode, setMode] = useState<Mode>("mobile");
  const [value, setValue] = useState("");
  const [tone, setTone] = useState<GlowTone>("blue");
  const reduced = useReducedMotion();

  const stepMotion = reduced
    ? { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } }
    : {
        initial: { opacity: 0, y: 12, filter: `blur(${motionTokens.blur.soft}px)` },
        animate: { opacity: 1, y: 0, filter: "blur(0px)" },
        exit: {
          opacity: 0,
          y: -8,
          filter: `blur(${motionTokens.blur.soft}px)`,
          transition: {
            duration: motionTokens.duration.exit,
            ease: [...motionTokens.ease.exit] as [number, number, number, number],
          },
        },
      };

  return (
    <>
      <SignInGradient position={step === "number" ? "bottom" : "top"} tone={tone} />
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={step}
          {...stepMotion}
          transition={reduced ? { duration: 0.16 } : { ...motionTokens.spring.smooth, delay: 0.12 }}
          className="flex min-h-dvh w-full flex-col items-center"
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
    </>
  );
}

function Logo({ inverted = false }: { inverted?: boolean }) {
  return (
    <Image
      src="/brand/ditto-logo.png"
      alt="Ditto"
      width={663}
      height={307}
      priority
      className={`h-10 w-[86px] object-contain ${inverted ? "brightness-0 invert" : ""}`}
    />
  );
}

/* Controls that sit on the glow draw their focus ring in the foreground
   colour, which holds contrast over both the cyan and the deep blue. */
const onGlow = { "--focus-ring": "var(--foreground)" } as CSSProperties;

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
      <header className="flex flex-col items-center px-6 pt-[max(56px,12dvh)] text-center">
        <Logo />
        <h1 className="mt-8 max-w-[420px] font-display text-3xl font-medium tracking-[-0.03em] text-balance text-label">
          Insurance, made simple
        </h1>
        <p className="mt-3 max-w-[320px] text-base text-pretty text-label-secondary">
          Sign in to see your policies, applications and claims.
        </p>
      </header>

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
        style={onGlow}
        className="mt-auto flex w-full max-w-[400px] flex-col gap-3 px-6 pt-12 pb-[max(40px,6dvh)]"
      >
        <label htmlFor="login-id" className="sr-only">
          {copy.label}
        </label>
        <div className="flex h-[52px] items-center rounded-control bg-surface pl-4 shadow-resting has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-[var(--focus-ring)]">
          {mode === "mobile" ? (
            <>
              <span className="text-base text-label">+91</span>
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
            placeholder={copy.placeholder}
            value={value}
            aria-invalid={invalid || undefined}
            aria-describedby={invalid ? "login-error" : undefined}
            onChange={(event) => {
              onValueChange(event.target.value);
              if (invalid && isValid(mode, event.target.value)) setInvalid(false);
            }}
            className="h-full min-w-0 flex-1 rounded-r-control bg-transparent pr-4 text-base text-label tabular-nums placeholder:text-label-tertiary focus:outline-none"
          />
        </div>

        <AnimatePresence initial={false}>
          {invalid ? (
            <motion.p
              id="login-error"
              role="alert"
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, transition: { duration: motionTokens.duration.exit } }}
              transition={motionTokens.spring.smooth}
              className="flex items-start gap-2 rounded-control bg-surface px-3.5 py-2.5 text-sm text-danger shadow-resting"
            >
              <CircleAlert size={16} strokeWidth={1.75} aria-hidden className="mt-0.5 shrink-0" />
              {copy.error}
            </motion.p>
          ) : null}
        </AnimatePresence>

        <Button type="submit" variant="secondary" size="lg" className="w-full">
          Continue
        </Button>
        <button
          type="button"
          onClick={() => {
            onModeChange(mode === "mobile" ? "policy" : "mobile");
            onValueChange("");
            setInvalid(false);
            inputRef.current?.focus();
          }}
          className="h-[50px] w-full rounded-control border border-white/25 bg-[rgb(0_32_110_/_0.16)] text-sm font-medium text-white backdrop-blur-md transition-[background-color,transform] duration-150 ease-[var(--ease-standard)] active:scale-[0.97] [@media(hover:hover)]:hover:bg-[rgb(0_32_110_/_0.24)]"
        >
          {copy.switchTo}
        </button>
      </form>
    </>
  );
}

/** Where the code went: an optional lead-in, then the number, kept on one line. */
type Destination = { lead: string; number: string };

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
  const timers = useRef<number[]>([]);

  useEffect(() => {
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

  function focusFirstDigit() {
    document
      .querySelector<HTMLInputElement>(`input[aria-label="Verification code, digit 1 of ${CODE_LENGTH}"]`)
      ?.focus();
  }

  function verify(value: string) {
    if (state !== "idle") return;
    if (value.length < CODE_LENGTH) {
      setError(`Enter all ${CODE_LENGTH} digits of the code.`);
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
          focusFirstDigit();
        }, 700);
      }
    }, 450);
  }

  return (
    <>
      {/* The top of the screen belongs to the glow; the logo turns white on it. */}
      <header className="flex h-[36dvh] min-h-[180px] w-full flex-col items-center px-6 pt-[max(40px,8dvh)]">
        <Logo inverted />
      </header>

      <div className="flex w-full max-w-[400px] flex-col items-center px-6 pb-12 text-center">
        <h1 className="font-display text-3xl font-medium tracking-[-0.03em] text-balance text-label">
          Verify your number
        </h1>
        <p className="mt-3 max-w-[340px] text-base text-pretty text-label-secondary">
          Enter the {CODE_LENGTH}-digit code we sent by SMS to{" "}
          {destination.lead}
          <span className="whitespace-nowrap text-label tabular-nums">{destination.number}</span>.
        </p>
        <Button variant="ghost" size="sm" onClick={onChangeNumber} className="mt-2">
          Change number
        </Button>

        <form
          noValidate
          onSubmit={(event) => {
            event.preventDefault();
            verify(code);
          }}
          className="mt-6 flex w-full flex-col items-center gap-6"
        >
          <OtpInput
            length={CODE_LENGTH}
            label="Verification code"
            description={`This prototype sends no SMS. Use ${DEMO_CODE}.`}
            error={error}
            value={code}
            autoFocus
            disabled={state !== "idle"}
            onChange={(next) => {
              setCode(next);
              if (error) {
                setError(undefined);
                onToneChange("blue");
              }
              if (next.length === CODE_LENGTH && state === "idle") verify(next);
            }}
          />
          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="w-full"
            loading={state === "checking"}
          >
            {state === "verified" ? "Verified" : "Verify code"}
          </Button>
        </form>

        <p className="mt-5 text-sm text-label-secondary">
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
                focusFirstDigit();
              }}
              className="rounded-control px-1 font-medium text-accent [@media(hover:hover)]:hover:underline [@media(hover:hover)]:hover:underline-offset-4"
            >
              Resend code
            </button>
          )}
        </p>
      </div>

      <p role="status" className="sr-only">
        {status}
      </p>
    </>
  );
}
