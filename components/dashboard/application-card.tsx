import { AddOnList, FieldItem, MetaLine, StatusBadge, cardClass } from "@/components/ui/card-bits";
import { InsurerLogo } from "@/components/ui/insurer-logo";
import type { Application } from "@/lib/dashboard-data";

/**
 * A pending application: insurer, name and status on top, the four facts
 * under a hairline, then the add-ons.
 */
export function ApplicationCard({ application }: { application: Application }) {
  return (
    <article className={`@container ${cardClass} p-5`}>
      <header className="flex flex-wrap items-start gap-x-3.5 gap-y-2">
        <InsurerLogo insurer={application.insurer} />
        <div className="min-w-0 flex-[1_1_220px]">
          <h3 className="text-base font-medium text-pretty text-label">{application.name}</h3>
          <MetaLine parts={[application.kind, `Application ${application.applicationNo}`]} />
        </div>
        <div className="@max-[479px]:ml-[58px]">
          <StatusBadge status={application.status} />
        </div>
      </header>

      <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-4 border-t border-separator-subtle pt-4 @min-[600px]:grid-cols-4">
        {application.fields.map((field) => (
          <FieldItem key={field.label} field={field} />
        ))}
      </dl>

      <div className="mt-4 border-t border-separator-subtle pt-4">
        <AddOnList items={application.addOns} />
      </div>
    </article>
  );
}
