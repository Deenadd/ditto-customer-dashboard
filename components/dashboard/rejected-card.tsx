import { MetaLine, StatusPill, cardClass } from "@/components/ui/card-bits";
import { InsurerLogo } from "@/components/ui/insurer-logo";
import type { RejectedApplication } from "@/lib/dashboard-data";

/** A rejected application and the insurer's reason. */
export function RejectedCard({ application }: { application: RejectedApplication }) {
  return (
    <article className={`@container ${cardClass} p-5`}>
      <header className="flex flex-wrap items-start gap-x-3.5 gap-y-2">
        <InsurerLogo insurer={application.insurer} muted />
        <div className="min-w-0 flex-[1_1_220px]">
          <h3 className="text-[17px] leading-[22px] font-semibold tracking-[-0.022em] text-pretty text-label">
            {application.name}
          </h3>
          <MetaLine parts={[application.kind, `Application ${application.applicationNo}`]} />
        </div>
        <div className="@max-[479px]:ml-[58px]">
          <StatusPill status="rejected" />
        </div>
      </header>

      <div className="mt-4 flex gap-3 rounded-[14px] bg-red-tint px-4 py-3.5">
        <svg aria-hidden width="18" height="18" viewBox="0 0 18 18" className="mt-px shrink-0 text-red-text">
          <circle cx="9" cy="9" r="8" fill="none" stroke="currentColor" strokeWidth="1.5" />
          <path d="M9 5v4.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          <circle cx="9" cy="12.5" r="1" fill="currentColor" />
        </svg>
        <dl>
          <dt className="text-[13px] leading-[18px] font-semibold text-red-text">Why it was rejected</dt>
          <dd className="mt-0.5 text-[14px] leading-5 text-pretty text-label">{application.reason}</dd>
        </dl>
      </div>
    </article>
  );
}
