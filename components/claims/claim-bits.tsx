import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";
import { MiniPolicyCard } from "@/components/dashboard/health-card";
import { Chevron } from "@/components/dashboard/policy-pair";
import { IconClaim } from "@/components/ui/icons";
import { formatShortDate, type Claim } from "@/lib/claims";

/**
 * A set of answers as one card, rows split by hairlines (inset to line up
 * with the text when rows have a leading icon). `nested` is for a group
 * inside another card: a hairline ring instead of a shadow.
 */
export function ChoiceGroup({
  label,
  showLabel = false,
  inset = 16,
  nested = false,
  children,
}: {
  label: string;
  /** Show the question above the group rather than only to screen readers. */
  showLabel?: boolean;
  inset?: number;
  nested?: boolean;
  children: ReactNode;
}) {
  return (
    <fieldset>
      <legend className={showLabel ? "mb-3 text-[15px] leading-5 font-medium text-label" : "sr-only"}>{label}</legend>
      <div
        className={`choice-group overflow-hidden bg-surface ${nested ? "rounded-[14px] shadow-[0_0_0_1px_rgb(0_0_0_/_0.08)]" : "rounded-[18px] shadow-soft"}`}
        style={{ "--sep-inset": `${inset}px` } as CSSProperties}
      >
        {children}
      </div>
    </fieldset>
  );
}

/**
 * One answer, as a row in a ChoiceGroup: the whole row is the hit area, the
 * radio is real (so arrow keys move between answers), and the chosen row is
 * tinted as well as having a filled radio.
 */
export function ChoiceCard({
  name,
  checked,
  onChange,
  title,
  hint,
  leading,
  trailing,
  disabled = false,
}: {
  name: string;
  checked: boolean;
  onChange: () => void;
  title: string;
  hint?: string;
  leading?: ReactNode;
  trailing?: ReactNode;
  /** Shown but not choosable; the hint should say why. */
  disabled?: boolean;
}) {
  return (
    <label
      className={`choice-row relative flex min-h-[60px] items-center gap-3 px-4 py-3 transition-colors duration-150 ease-out has-[:focus-visible]:outline-2 has-[:focus-visible]:-outline-offset-2 has-[:focus-visible]:outline-accent ${
        disabled
          ? "cursor-not-allowed [&>*:not(input)]:opacity-50"
          : checked
            ? "cursor-pointer bg-accent-tint/60"
            : "cursor-pointer [@media(hover:hover)]:hover:bg-fill/70"
      }`}
    >
      {leading}
      <span className="min-w-0 flex-1">
        <span className={`block text-[15px] leading-5 text-pretty text-label ${checked ? "font-semibold" : "font-medium"}`}>{title}</span>
        {hint ? <span className="mt-0.5 block text-[13px] leading-[18px] text-pretty text-label-secondary">{hint}</span> : null}
      </span>
      {trailing}
      <input
        type="radio"
        name={name}
        checked={checked}
        onChange={onChange}
        disabled={disabled}
        className="size-5 shrink-0 cursor-pointer appearance-none disabled:cursor-not-allowed disabled:opacity-40 rounded-full border-[1.5px] border-label-tertiary/70 bg-surface transition-[border-width,border-color] duration-150 ease-out checked:border-[6px] checked:border-accent focus-visible:outline-none"
      />
    </label>
  );
}

/** Which policy the claim is on: the card in miniature and its name. */
export function ClaimingOn({ name }: { name: string }) {
  return (
    <div className="flex items-center gap-3">
      <MiniPolicyCard />
      <div className="min-w-0">
        <p className="text-[12px] leading-4 text-label-secondary">Claiming on</p>
        <p className="truncate text-[14px] leading-5 font-medium text-label">{name}</p>
      </div>
    </div>
  );
}

/** A note with an info glyph: guidance, not an error. */
export function Note({ children, tone = "info" }: { children: ReactNode; tone?: "info" | "warning" }) {
  return (
    <p
      className={`flex gap-2.5 rounded-[14px] px-3.5 py-3 text-[13px] leading-[18px] text-pretty ${
        tone === "warning" ? "bg-orange-tint text-orange-text" : "bg-fill text-label-secondary"
      }`}
    >
      <svg aria-hidden width="16" height="16" viewBox="0 0 16 16" className="mt-px shrink-0">
        <circle cx="8" cy="8" r="6.75" fill="none" stroke="currentColor" strokeWidth="1.5" />
        <path d="M8 7.25v3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="8" cy="5" r="0.9" fill="currentColor" />
      </svg>
      <span>{children}</span>
    </p>
  );
}

/**
 * A claim in a list, named for who and where, as the claim page is: the
 * patient and hospital, then when it was asked for and where it stands, the
 * status as green text rather than a pill so the row stays quiet.
 */
export function ClaimRow({ claim, href }: { claim: Claim; href: string }) {
  return (
    <Link
      href={href}
      className="group flex items-center gap-3 rounded-[14px] px-3 py-3 transition-colors duration-150 ease-out active:bg-fill [@media(hover:hover)]:hover:bg-fill"
    >
      <span className="grid size-11 shrink-0 place-items-center rounded-[11px] bg-accent-tint text-accent">
        <IconClaim />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[15px] leading-5 font-medium text-label">
          {claim.patient.name} · {claim.hospital?.name ?? "Hospital not chosen"}
        </span>
        <span className="mt-0.5 block truncate text-[13px] leading-[18px] text-label-secondary tabular-nums">
          {formatShortDate(claim.createdAt)} · <span className="font-medium text-green-text">Request received</span>
        </span>
      </span>
      <Chevron className="text-label-tertiary" />
    </Link>
  );
}
