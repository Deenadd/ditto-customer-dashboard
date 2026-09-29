import { StatusLabel } from "@/components/ui/card-bits";
import { InsurerLogo } from "@/components/ui/insurer-logo";
import type { RejectedApplication } from "@/lib/dashboard-data";

/** A rejected application and the insurer's reason (node 149:10457). */
export function RejectedCard({ application }: { application: RejectedApplication }) {
  return (
    <article className="@container rounded-2xl border border-card-border bg-white p-[6px] pb-[15px] shadow-card">
      <header className="flex flex-wrap items-start gap-x-3 gap-y-2 rounded-[10px] bg-grey-50 p-2">
        <InsurerLogo insurer={application.insurer} muted />
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
          <StatusLabel status="rejected" />
        </div>
      </header>

      <dl className="px-[8px] pt-4">
        <dt className="text-[12px] leading-4 text-ink-label">Rejection Reason</dt>
        <dd className="mt-2 text-[14px] leading-4 font-medium tracking-[-0.5px] text-pretty text-danger-text">
          {application.reason}
        </dd>
      </dl>
    </article>
  );
}
