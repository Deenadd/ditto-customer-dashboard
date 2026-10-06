import { AddOnChips, FieldItem, MetaLine, StatusPill, cardClass } from "@/components/ui/card-bits";
import { InsurerLogo } from "@/components/ui/insurer-logo";
import type { Application } from "@/lib/dashboard-data";

/**
 * A pending application: insurer, name and status on top, the four facts in
 * an inset tile, then the add-ons as capsules.
 */
export function ApplicationCard({ application }: { application: Application }) {
  return (
    <article className={`@container ${cardClass} p-5`}>
      <header className="flex flex-wrap items-start gap-x-3.5 gap-y-2">
        <InsurerLogo insurer={application.insurer} />
        <div className="min-w-0 flex-[1_1_220px]">
          <h3 className="text-[17px] leading-[22px] font-semibold tracking-[-0.022em] text-pretty text-label">
            {application.name}
          </h3>
          <MetaLine parts={[application.kind, `Application ${application.applicationNo}`]} />
        </div>
        <div className="@max-[479px]:ml-[58px]">
          <StatusPill status={application.status} />
        </div>
      </header>

      <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-4 rounded-[14px] bg-fill-soft px-4 py-3.5 shadow-[inset_0_0_0_1px_rgb(0_0_0_/_0.04)] @min-[600px]:grid-cols-4">
        {application.fields.map((field) => (
          <FieldItem key={field.label} field={field} />
        ))}
      </dl>

      <div className="mt-4">
        <AddOnChips items={application.addOns} />
      </div>
    </article>
  );
}
