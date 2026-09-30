import { Download } from "lucide-react";
import { Avatar } from "@/registry/components/avatar/avatar";
import { Button } from "@/registry/components/button/button";
import { Asset } from "@/components/ui/asset";
import { AddOnList, FieldItem, StatusBadge, cardClass } from "@/components/ui/card-bits";
import { InsurerLogo } from "@/components/ui/insurer-logo";
import type { CoverIcon, CoverItem, Exclusion } from "@/lib/policy-detail";
import { policyDetail } from "@/lib/policy-detail";

const cardTitle = "text-lg font-medium text-label";

/** Page heading for the policy: insurer, name, status and the download. */
export function PolicyHeader({ policy }: { policy: typeof policyDetail }) {
  return (
    <header className="flex flex-wrap items-center gap-x-4 gap-y-4">
      <InsurerLogo insurer={policy.insurer} size={56} />
      <div className="min-w-0 flex-[1_1_240px]">
        <h1 className="font-display text-3xl font-medium tracking-[-0.03em] text-balance text-label">
          {policy.name}
        </h1>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <StatusBadge status="active" />
          <span className="text-sm text-label-secondary">{policy.kind}</span>
        </div>
      </div>
      <Button variant="secondary" className="max-sm:ml-[72px]">
        <Download size={16} strokeWidth={1.75} aria-hidden />
        Download policy
      </Button>
    </header>
  );
}

/** The policy's facts, the people it covers, and add-ons. */
export function PolicySummaryCard({ policy }: { policy: typeof policyDetail }) {
  return (
    <section aria-labelledby="summary-title" className={`@container ${cardClass} p-6`}>
      <h2 id="summary-title" className={cardTitle}>
        Summary
      </h2>
      <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-5 @min-[600px]:grid-cols-4">
        {policy.fields.map((field) => (
          <FieldItem key={field.label} field={field} />
        ))}
      </dl>

      <div className="mt-6 border-t border-separator-subtle pt-5">
        <h3 className="text-xs text-label-secondary">Covered people</h3>
        <ul className="mt-3 grid grid-cols-1 gap-3 min-[420px]:grid-cols-2 @min-[600px]:grid-cols-4">
          {policy.family.map((person) => (
            <li key={person.name} className="flex items-center gap-3">
              <Avatar name={person.name} size="md" />
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-label">{person.name}</p>
                <p className="text-xs text-label-secondary tabular-nums">
                  {person.relation}
                  <span aria-hidden> · </span>
                  <span className="sr-only">, born </span>
                  {person.dob}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-5 border-t border-separator-subtle pt-5">
        <AddOnList items={policy.addOns} />
      </div>
    </section>
  );
}

/** A Figma icon frame: the group sits at an inset and its SVG bleeds out. */
function CoverGlyph({ icon, size }: { icon: CoverIcon; size: number }) {
  return (
    <span aria-hidden className="relative block shrink-0" style={{ width: size, height: size }}>
      <span className="absolute" style={{ inset: icon.group }}>
        <span className="absolute" style={{ inset: icon.bleed }}>
          <Asset src={icon.src} className="size-full" />
        </span>
      </span>
    </span>
  );
}

/** What's covered: two columns, each benefit with its icon beside it. */
export function CoveredCard({ items }: { items: CoverItem[] }) {
  return (
    <section aria-labelledby="covered-title" className={`${cardClass} p-6`}>
      <h2 id="covered-title" className={cardTitle}>
        What&rsquo;s covered
      </h2>
      <ul className="mt-5 grid gap-x-8 gap-y-5 sm:grid-cols-2">
        {items.map((item) => (
          <li key={item.title} className="flex items-start gap-3">
            <CoverGlyph icon={item.icon} size={24} />
            <div className="min-w-0">
              <h3 className="text-sm font-medium text-label">{item.title}</h3>
              <p className="mt-0.5 text-sm text-pretty text-label-secondary">{item.description}</p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

/** What's not covered, as a list with hairline dividers. */
export function NotCoveredCard({ items }: { items: Exclusion[] }) {
  return (
    <section aria-labelledby="not-covered-title" className={`${cardClass} p-6`}>
      <h2 id="not-covered-title" className={cardTitle}>
        What&rsquo;s not covered
      </h2>
      <ul className="mt-3 divide-y divide-separator-subtle">
        {items.map((item) => (
          <li key={item.label} className="flex items-center gap-3 py-3">
            <CoverGlyph icon={item.icon} size={20} />
            <span className="text-sm text-label">{item.label}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
