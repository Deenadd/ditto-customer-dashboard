import { Asset } from "@/components/ui/asset";
import { AddOnList, ChipRule, FieldItem } from "@/components/ui/card-bits";
import { InsurerLogo } from "@/components/ui/insurer-logo";
import type { CoverIcon, CoverItem, Exclusion } from "@/lib/policy-detail";
import { policyDetail } from "@/lib/policy-detail";

const card = "rounded-2xl border border-card-border bg-white shadow-card";

/** The policy, its family and add-ons (node 149:9307). */
export function PolicySummaryCard({ policy }: { policy: typeof policyDetail }) {
  return (
    <article aria-labelledby="policy-title" className={`${card} p-[6px] pb-6`}>
      <header className="flex min-h-[81px] flex-wrap items-center gap-x-3 gap-y-3 rounded-[10px] bg-grey-50 py-3 pr-3 pl-3">
        <InsurerLogo insurer={policy.insurer} size={56} />
        <div className="min-w-0 flex-[1_1_200px]">
          <h1
            id="policy-title"
            className="text-[16px] leading-[normal] font-semibold text-pretty text-ink"
          >
            {policy.name}
          </h1>
          <p className="mt-2 text-[12px] leading-[normal] text-ink-tertiary">{policy.kind}</p>
        </div>
        <button
          type="button"
          className="inline-flex h-8 shrink-0 items-center gap-1.5 self-start rounded-lg bg-white px-4 text-[14px] leading-5 font-medium text-primary transition-[transform,background-color] duration-150 ease-out active:scale-[0.96] max-sm:ml-[68px] sm:mt-1 [@media(hover:hover)]:hover:bg-blue-100"
        >
          <Asset src="/dashboard/download.svg" className="size-[18px]" />
          Download
          <span className="sr-only"> policy document</span>
        </button>
      </header>

      <div className="@container px-[17px]">
        <dl className="mt-6 grid grid-cols-2 gap-x-4 gap-y-8 @min-[700px]:grid-cols-[203px_192px_185px_1fr] @min-[700px]:gap-x-0">
          {policy.fields.map((field) => (
            <FieldItem key={field.label} field={field} />
          ))}
        </dl>

        <section className="mt-[31px]">
          <div className="-ml-[9px]">
            <ChipRule>Family details</ChipRule>
          </div>
          <ul className="mt-6 grid grid-cols-2 gap-x-4 gap-y-5 @min-[700px]:grid-cols-[203px_192px_185px_1fr] @min-[700px]:gap-x-0">
            {policy.family.map((person) => (
              <li key={person.name}>
                <p className="text-[14px] leading-4 font-medium tracking-[-0.5px] text-ink">
                  {person.name}
                </p>
                <p className="mt-[9px] text-[12px] leading-[normal] text-ink-tertiary">
                  <span className="font-semibold text-primary">{person.relation}</span>
                  <span aria-hidden> · </span>
                  <span className="sr-only">, born </span>
                  {person.dob}
                </p>
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-[31px]">
          <div className="-ml-[9px]">
            <ChipRule>Add ons</ChipRule>
          </div>
          <div className="mt-6">
            <AddOnList items={policy.addOns} />
          </div>
        </section>
      </div>
    </article>
  );
}

/** A Figma icon frame: the group sits at an inset and its SVG bleeds out. */
function CoverGlyph({ icon, size }: { icon: CoverIcon; size: 28 | 20 }) {
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

/** "What's Covered" (node 149:9378): two columns of benefits. */
export function CoveredCard({ items }: { items: CoverItem[] }) {
  return (
    <section aria-labelledby="covered-title" className={`${card} px-[19px] pt-[18px] pb-7`}>
      <h2 id="covered-title" className="text-[16px] leading-[normal] font-semibold text-ink">
        What&rsquo;s Covered
      </h2>
      <ul className="mt-[33px] grid gap-x-4 gap-y-10 px-2 sm:grid-cols-[381px_1fr] sm:gap-x-0">
        {items.map((item) => (
          <li key={item.title} className="flex items-start gap-4">
            <CoverGlyph icon={item.icon} size={28} />
            <div className="min-w-0 max-w-[232px]">
              <h3 className="text-[14px] leading-5 font-semibold text-ink">{item.title}</h3>
              <p className="ff-case mt-[9px] text-[13px] leading-[18px] text-ink-secondary">
                {item.description}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

/** "What's Not Covered" (node 149:9470). */
export function NotCoveredCard({ items }: { items: Exclusion[] }) {
  return (
    <section aria-labelledby="not-covered-title" className={`${card} px-[19px] pt-[18px] pb-6`}>
      <h2 id="not-covered-title" className="text-[16px] leading-[normal] font-semibold text-ink">
        What&rsquo;s Not Covered
      </h2>
      <ul className="mt-[25px] flex flex-col gap-6">
        {items.map((item) => (
          <li key={item.label} className="flex items-start gap-2.5">
            <CoverGlyph icon={item.icon} size={20} />
            <span className="ff-case mt-px text-[13px] leading-[18px] text-ink-secondary">
              {item.label}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
