import { Monogram } from "@/components/dashboard/policy-pair";
import { Asset } from "@/components/ui/asset";
import { Button } from "@/components/ui/buttons";
import { AddOnChips, FieldItem, StatusPill, cardClass } from "@/components/ui/card-bits";
import { InsurerLogo } from "@/components/ui/insurer-logo";
import type { CoverIcon, CoverItem, Exclusion } from "@/lib/policy-detail";
import { policyDetail } from "@/lib/policy-detail";

const cardTitle = "text-[17px] leading-[22px] font-semibold tracking-[-0.022em] text-label";

/** Large-title header for the policy page: icon, name, status, download. */
export function PolicyHeader({ policy }: { policy: typeof policyDetail }) {
  return (
    <header className="flex flex-wrap items-center gap-x-4 gap-y-4">
      <InsurerLogo insurer={policy.insurer} size={56} />
      <div className="min-w-0 flex-[1_1_240px]">
        <h1 className="text-[28px] leading-[34px] font-bold tracking-[-0.025em] text-balance text-label">
          {policy.name}
        </h1>
        <div className="mt-1.5 flex flex-wrap items-center gap-2">
          <StatusPill status="active" />
          <span className="text-[13px] leading-[18px] text-label-secondary">{policy.kind}</span>
        </div>
      </div>
      <Button variant="tinted" size="medium" className="max-sm:ml-[72px]">
        <svg aria-hidden width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path
            d="M8 2v8.5m0 0L4.75 7.25M8 10.5l3.25-3.25M2.75 13.25h10.5"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        Download policy
      </Button>
    </header>
  );
}

/** The policy's facts, the family on it, and add-ons. */
export function PolicySummaryCard({ policy }: { policy: typeof policyDetail }) {
  return (
    <section aria-labelledby="summary-title" className={`@container ${cardClass} p-5`}>
      <h2 id="summary-title" className={cardTitle}>
        Summary
      </h2>
      <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-4 rounded-[14px] bg-fill px-4 py-4 @min-[600px]:grid-cols-4">
        {policy.fields.map((field) => (
          <FieldItem key={field.label} field={field} />
        ))}
      </dl>

      <h3 className="mt-6 text-[12px] leading-4 font-semibold text-label-secondary">Covered people</h3>
      <ul className="mt-2.5 grid grid-cols-1 gap-3 min-[420px]:grid-cols-2 @min-[600px]:grid-cols-4">
        {policy.family.map((person) => (
          <li key={person.name} className="flex items-center gap-3">
            <Monogram name={person.name} primary={person.relation === "You"} />
            <div className="min-w-0">
              <p className="truncate text-[15px] leading-5 font-medium text-label">{person.name}</p>
              <p className="text-[12px] leading-4 text-label-secondary tabular-nums">
                {person.relation}
                <span aria-hidden> · </span>
                <span className="sr-only">, born </span>
                {person.dob}
              </p>
            </div>
          </li>
        ))}
      </ul>

      <div className="mt-6">
        <AddOnChips items={policy.addOns} />
      </div>
    </section>
  );
}

/** A Figma icon frame: the group sits at an inset and its SVG bleeds out. */
export function CoverGlyph({ icon, size }: { icon: CoverIcon; size: number }) {
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

/** What's covered: two columns of benefits, each on its own icon tile. */
export function CoveredCard({ items }: { items: CoverItem[] }) {
  return (
    <section aria-labelledby="covered-title" className={`${cardClass} p-5`}>
      <h2 id="covered-title" className={cardTitle}>
        What&rsquo;s covered
      </h2>
      <ul className="mt-4 grid gap-x-6 gap-y-5 sm:grid-cols-2">
        {items.map((item) => (
          <li key={item.title} className="flex items-start gap-3.5">
            <span className="grid size-11 shrink-0 place-items-center rounded-[11px] bg-accent-tint">
              <CoverGlyph icon={item.icon} size={24} />
            </span>
            <div className="min-w-0 pt-0.5">
              <h3 className="text-[15px] leading-5 font-semibold text-label">{item.title}</h3>
              <p className="mt-0.5 text-[13px] leading-[18px] text-pretty text-label-secondary">
                {item.description}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

/** What's not covered. */
export function NotCoveredCard({ items }: { items: Exclusion[] }) {
  return (
    <section aria-labelledby="not-covered-title" className={`${cardClass} p-5`}>
      <h2 id="not-covered-title" className={cardTitle}>
        What&rsquo;s not covered
      </h2>
      <ul className="mt-3 overflow-hidden rounded-[14px] bg-fill">
        {items.map((item, index) => (
          <li key={item.label} className="relative flex items-center gap-3 px-4 py-3">
            {index > 0 ? (
              <span aria-hidden className="absolute top-0 right-0 left-12 h-px bg-separator" />
            ) : null}
            <CoverGlyph icon={item.icon} size={20} />
            <span className="text-[14px] leading-5 text-label">{item.label}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
