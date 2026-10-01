import Link from "next/link";
import type { ReactNode } from "react";
import { Chevron } from "@/components/dashboard/policy-pair";
import { StatusPill } from "@/components/ui/card-bits";
import { IconClaim } from "@/components/ui/icons";
import { formatDate, type Claim } from "@/lib/claims";

/**
 * One answer among several, as a card: the whole card is the hit area, the
 * radio is real (so arrow keys move between answers), and the chosen card
 * gets an accent ring as well as a filled radio.
 */
export function ChoiceCard({
  name,
  checked,
  onChange,
  title,
  hint,
  leading,
  trailing,
}: {
  name: string;
  checked: boolean;
  onChange: () => void;
  title: string;
  hint?: string;
  leading?: ReactNode;
  trailing?: ReactNode;
}) {
  return (
    <label
      className={`flex min-h-16 cursor-pointer items-center gap-3 rounded-[14px] bg-surface px-4 py-3 transition-[box-shadow,background-color] duration-150 ease-out has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-accent [@media(hover:hover)]:hover:bg-[#fbfbfd] ${
        checked
          ? "shadow-[0_0_0_2px_var(--color-accent)]"
          : "shadow-[0_0_0_1px_rgb(0_0_0_/_0.08),0_1px_2px_rgb(0_0_0_/_0.04)]"
      }`}
    >
      {leading}
      <span className="min-w-0 flex-1">
        <span className="block text-[15px] leading-5 font-medium text-pretty text-label">{title}</span>
        {hint ? <span className="mt-0.5 block text-[13px] leading-[18px] text-pretty text-label-secondary">{hint}</span> : null}
      </span>
      {trailing}
      <input
        type="radio"
        name={name}
        checked={checked}
        onChange={onChange}
        className="size-5 shrink-0 cursor-pointer appearance-none rounded-full border-[1.5px] border-label-tertiary/70 bg-surface transition-[border-width,border-color] duration-150 ease-out checked:border-[6px] checked:border-accent focus-visible:outline-none"
      />
    </label>
  );
}

/** A note with an info glyph: guidance, not an error. */
export function Note({ children, tone = "info" }: { children: ReactNode; tone?: "info" | "warning" }) {
  return (
    <p
      className={`flex gap-2.5 rounded-[12px] px-3.5 py-3 text-[13px] leading-[18px] text-pretty ${
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

/** A claim in a list: what, who and where, its status, and the way in. */
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
          Cashless · {claim.treatment}
        </span>
        <span className="block truncate text-[13px] leading-[18px] text-label-secondary tabular-nums">
          {claim.id} · {claim.patient.name} · {claim.hospital?.name ?? "Hospital not chosen"}
        </span>
        <span className="mt-1.5 flex items-center gap-2">
          <StatusPill status="received" />
          <span className="text-[12px] leading-4 text-label-tertiary tabular-nums">{formatDate(claim.createdAt)}</span>
        </span>
      </span>
      <Chevron className="text-label-tertiary" />
    </Link>
  );
}
