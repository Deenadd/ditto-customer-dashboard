import type { ReactNode } from "react";
import type { ApplicationStatus, Field } from "@/lib/dashboard-data";

/** White card on the grey page: the one surface everything sits on. */
export const cardClass = "rounded-[22px] bg-surface shadow-card";

/** A card's title, 17/22 semibold. */
export const cardTitleClass = "text-[17px] leading-[22px] font-semibold tracking-[-0.022em] text-label";

export type Status = ApplicationStatus | "rejected" | "active" | "expired" | "received";

const statusStyles: Record<Status, { label: string; tone: string; dot: string }> = {
  "pending-uploads": {
    label: "Pending uploads",
    tone: "bg-orange-tint text-orange-text",
    dot: "bg-orange-dot",
  },
  "missing-details": {
    label: "Missing details",
    tone: "bg-orange-tint text-orange-text",
    dot: "bg-orange-dot",
  },
  verification: {
    label: "With the insurer",
    tone: "bg-teal-tint text-teal-text",
    dot: "bg-teal-dot",
  },
  issued: { label: "Policy issued", tone: "bg-green-tint text-green-text", dot: "bg-green-dot" },
  active: { label: "Active", tone: "bg-green-tint text-green-text", dot: "bg-green-dot" },
  expired: { label: "Expired", tone: "bg-grey-tint text-grey-text", dot: "bg-grey-dot" },
  rejected: { label: "Rejected", tone: "bg-grey-tint text-grey-text", dot: "bg-grey-dot" },
  received: { label: "Request received", tone: "bg-teal-tint text-teal-text", dot: "bg-teal-dot" },
};

/**
 * Status capsule: tinted fill, dark text, a vivid dot. The text carries the
 * meaning, so it reads without colour.
 */
export function StatusPill({ status }: { status: Status }) {
  const style = statusStyles[status];
  return (
    <span
      className={`inline-flex h-6 shrink-0 items-center gap-1.5 rounded-full pr-2.5 pl-2 text-[12px] leading-none font-semibold whitespace-nowrap ${style.tone}`}
    >
      <span aria-hidden className={`size-1.5 rounded-full ${style.dot}`} />
      {style.label}
    </span>
  );
}

/** Count after a segment or section title: quiet, tabular. */
export function Count({ value }: { value: number }) {
  return (
    <span className="text-label-secondary tabular-nums">
      <span className="sr-only">, </span>
      {value}
    </span>
  );
}

/** Label above value. */
export function FieldItem({ field }: { field: Field }) {
  return (
    <div className="min-w-0">
      <dt className="text-[12px] leading-4 text-label-secondary">{field.label}</dt>
      <dd className="mt-1 text-[15px] leading-5 font-medium tracking-[-0.01em] text-label tabular-nums">
        {field.value}
      </dd>
    </div>
  );
}

/** Add-ons as capsules. */
export function AddOnChips({ items, label = "Add-ons" }: { items: string[]; label?: string }) {
  return (
    <div>
      <h4 className="text-[12px] leading-4 font-semibold text-label-secondary">{label}</h4>
      <ul className="mt-2 flex flex-wrap gap-1.5">
        {items.map((item) => (
          <li
            key={item}
            className="flex h-7 items-center rounded-full bg-fill px-3 text-[13px] leading-none text-label"
          >
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Section heading on the grey page, with an optional count. */
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
    <h2
      id={id}
      className="flex items-baseline gap-2 text-[17px] leading-[22px] font-semibold tracking-[-0.022em] text-label"
    >
      {children}
      {count !== undefined ? <Count value={count} /> : null}
    </h2>
  );
}

/** Kind and application number, as one quiet line. */
export function MetaLine({ parts }: { parts: string[] }) {
  return (
    <p className="mt-0.5 text-[13px] leading-[18px] text-label-secondary">
      {parts.map((part, index) => (
        <span key={part}>
          {index > 0 ? (
            <>
              <span aria-hidden className="mx-1.5">
                ·
              </span>
              <span className="sr-only">, </span>
            </>
          ) : null}
          {part}
        </span>
      ))}
    </p>
  );
}
