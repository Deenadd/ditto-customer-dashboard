import { AddOnList, ChipRule, FieldItem, StatusLabel } from "@/components/ui/card-bits";
import { InsurerLogo } from "@/components/ui/insurer-logo";
import type { Application } from "@/lib/dashboard-data";

/**
 * A pending application (Policy-card, node 149:9007): header strip with the
 * insurer and status, four facts, then the add-ons.
 *
 * The four columns keep Figma's uneven widths once the card is wide enough to
 * hold them, and fall back to two columns below that.
 */
export function ApplicationCard({ application }: { application: Application }) {
  const health = application.kind === "Health Insurance";

  return (
    <article className="@container rounded-2xl border border-card-border bg-white p-[6px] pb-[19px] shadow-card">
      <header className="flex flex-wrap items-start gap-x-3 gap-y-2 rounded-[10px] bg-grey-50 p-2">
        <InsurerLogo insurer={application.insurer} />
        <div className="min-w-0 flex-[1_1_200px] self-center">
          <h3 className="text-[16px] leading-[normal] font-semibold text-pretty text-ink">
            {application.name}
          </h3>
          <p className="mt-1 text-[12px] leading-[normal] text-ink-tertiary">
            {application.kind}
            <span aria-hidden className="mx-2">
              •
            </span>
            <span className="sr-only">, </span>
            App.no: {application.applicationNo}
          </p>
        </div>
        <div className="mt-[2px] mr-[2px] @max-[479px]:mt-0 @max-[479px]:ml-[52px]">
          <StatusLabel status={application.status} />
        </div>
      </header>

      <div className="px-[9px] pt-4">
        <dl
          className={`grid grid-cols-2 gap-x-4 gap-y-4 ${
            health
              ? "@min-[700px]:grid-cols-[195px_184px_191px_1fr]"
              : "@min-[700px]:grid-cols-[195px_208px_167px_1fr]"
          } @min-[700px]:gap-x-0`}
        >
          {application.fields.map((field) => (
            <FieldItem key={field.label} field={field} />
          ))}
        </dl>

        <section className="mt-[15px]">
          <ChipRule>Add ons</ChipRule>
          <div className="mt-4">
            <AddOnList items={application.addOns} />
          </div>
        </section>
      </div>
    </article>
  );
}
