import type { ReactNode } from "react";
import { Badge, type BadgeTone } from "@/registry/components/badge/badge";
import type { ApplicationStatus, Field } from "@/lib/dashboard-data";

/** Arc card: rests on a 1px border, no shadow, 34px corners. */
export const cardClass = "rounded-surface border border-separator bg-surface";

export type Status = ApplicationStatus | "rejected" | "active" | "expired";

/* Status colours mean status: warning when something needs you, info while
   it's with the insurer, success for cover in force, danger for a refusal. */
const statusBadges: Record<Status, { label: string; tone: BadgeTone }> = {
  "pending-uploads": { label: "Pending uploads", tone: "warning" },
  "missing-details": { label: "Missing details", tone: "warning" },
  verification: { label: "With the insurer", tone: "info" },
  active: { label: "Active", tone: "success" },
  expired: { label: "Expired", tone: "neutral" },
  rejected: { label: "Rejected", tone: "danger" },
};

export function StatusBadge({ status }: { status: Status }) {
  const badge = statusBadges[status];
  return (
    <Badge tone={badge.tone} size="sm" className="shrink-0">
      {badge.label}
    </Badge>
  );
}

/** Count after a segment or section title: quiet, tabular. */
export function Count({ value }: { value: number }) {
  return (
    <span className="font-normal text-label-tertiary tabular-nums">
      <span className="sr-only">, </span>
      {value}
    </span>
  );
}

/** Label above value. */
export function FieldItem({ field }: { field: Field }) {
  return (
    <div className="min-w-0">
      <dt className="text-xs text-label-secondary">{field.label}</dt>
      <dd className="mt-1 text-sm font-medium text-label tabular-nums">{field.value}</dd>
    </div>
  );
}

/** Add-ons as one quiet line: a list, not a row of pills. */
export function AddOnList({ items, label = "Add-ons" }: { items: string[]; label?: string }) {
  return (
    <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1 text-sm">
      <h4 className="text-xs text-label-secondary">{label}</h4>
      <ul className="flex flex-wrap gap-x-2 gap-y-1 text-label">
        {items.map((item, index) => (
          <li key={item} className="flex items-baseline gap-2">
            {index > 0 ? (
              <span aria-hidden className="text-label-tertiary">
                ·
              </span>
            ) : null}
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Section heading on the page, with an optional count. */
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
    <h2 id={id} className="flex items-baseline gap-2 text-lg font-medium text-label">
      {children}
      {count !== undefined ? <Count value={count} /> : null}
    </h2>
  );
}

/** Kind and application number, as one quiet line. */
export function MetaLine({ parts }: { parts: string[] }) {
  return (
    <p className="mt-0.5 text-sm text-label-secondary">
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
