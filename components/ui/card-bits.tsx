import type { ReactNode } from "react";
import { Asset } from "@/components/ui/asset";
import type { ApplicationStatus, Field } from "@/lib/dashboard-data";

/** Two-digit count chip beside a tab or a section title. */
export function CountBadge({
  count,
  tone = "ink",
}: {
  count: number;
  tone?: "ink" | "active" | "falcon";
}) {
  const background = {
    ink: "bg-ink",
    active: "bg-primary-strong",
    falcon: "bg-falcon",
  }[tone];

  return (
    <span
      className={`ff-case inline-flex h-[15px] items-center rounded-[4px] px-[3px] text-[10px] leading-[0.9] font-semibold tracking-[0.5px] text-white tabular-nums ${background}`}
    >
      {count === 0 ? "0" : String(count).padStart(2, "0")}
    </span>
  );
}

const statusStyles: Record<ApplicationStatus | "rejected", { label: string; className: string }> = {
  "pending-uploads": {
    label: "Pending uploads",
    className: "bg-status-pending text-status-pending-ink",
  },
  "missing-details": {
    label: "Missing details",
    className: "bg-status-pending text-status-pending-ink",
  },
  verification: {
    label: "Verification process",
    className: "bg-status-verifying text-white",
  },
  rejected: {
    label: "Rejected application",
    className: "bg-status-rejected text-status-pending-ink",
  },
};

/** Status chip in the top-right of an application card (node 149:9048). */
export function StatusLabel({ status }: { status: ApplicationStatus | "rejected" }) {
  const style = statusStyles[status];
  return (
    <span
      className={`inline-flex shrink-0 rounded-[4px] px-2 py-[3px] text-[10px] leading-[normal] font-medium tracking-[0.5px] whitespace-nowrap uppercase ${style.className}`}
    >
      {style.label}
    </span>
  );
}

/** A small blue chip followed by a hairline: "Add ons", "Family details". */
export function ChipRule({ children }: { children: ReactNode }) {
  return (
    <div className="flex items-center gap-2">
      <h4 className="flex h-5 shrink-0 items-center rounded-[4px] bg-blue-50 px-[7px] text-[10px] leading-[normal] font-semibold tracking-[1px] whitespace-nowrap text-primary uppercase">
        {children}
      </h4>
      <div aria-hidden className="h-px min-w-px flex-1 bg-grey-200" />
    </div>
  );
}

/** Numbered add-ons row (node 149:9035). */
export function AddOnList({ items }: { items: string[] }) {
  return (
    <ol className="flex flex-wrap gap-x-14 gap-y-3">
      {items.map((item, index) => (
        <li key={item} className="flex items-center gap-2">
          <span
            aria-hidden
            className="grid size-4 shrink-0 place-items-center rounded-full bg-grey-200 text-[10px] leading-none font-semibold text-ink tabular-nums"
          >
            {index + 1}
          </span>
          <span className="text-[13px] leading-4 font-medium tracking-[-0.5px] text-ink">
            {item}
          </span>
        </li>
      ))}
    </ol>
  );
}

/** Label above value, the pair every policy card is built from. */
export function FieldItem({
  field,
  gap = "tight",
}: {
  field: Field;
  /** 5px on application and detail cards, 8px inside active policy cards. */
  gap?: "tight" | "loose";
}) {
  return (
    <div className="min-w-0">
      <dt className="text-[12px] leading-4 text-ink-label">{field.label}</dt>
      <dd className={`${gap === "loose" ? "mt-2" : "mt-[5px]"} text-[14px] leading-4 font-medium tracking-[-0.5px] text-ink`}>
        {field.value}
      </dd>
    </div>
  );
}

/**
 * The rule with a shield between the two halves of a list (node 149:8876).
 * Drawn in CSS so the lines stretch while the shield keeps its shape.
 */
export function ShieldDivider() {
  return (
    <div aria-hidden className="flex h-5 items-center">
      <div className="h-px flex-1 bg-grey-300" />
      <div className="grid w-[50.4px] shrink-0 place-items-center">
        <Asset src="/dashboard/shield.svg" className="size-5" />
      </div>
      <div className="h-px flex-1 bg-grey-300" />
    </div>
  );
}

/** Section title, optionally with a count (nodes 149:9050, 149:10204). */
export function SectionTitle({
  children,
  count,
  id,
}: {
  children: ReactNode;
  count?: number;
  id?: string;
}) {
  return (
    <h2 id={id} className="flex items-center gap-2">
      <span className="ff-case text-[15px] leading-none font-medium tracking-[-0.0255px] text-ink">
        {children}
      </span>
      {count !== undefined ? <CountBadge count={count} tone="falcon" /> : null}
    </h2>
  );
}
