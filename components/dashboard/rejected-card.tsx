import { CircleAlert } from "lucide-react";
import { MetaLine, StatusBadge, cardClass } from "@/components/ui/card-bits";
import { InsurerLogo } from "@/components/ui/insurer-logo";
import type { RejectedApplication } from "@/lib/dashboard-data";

/** A rejected application and the insurer's reason. */
export function RejectedCard({ application }: { application: RejectedApplication }) {
  return (
    <article className={`@container ${cardClass} p-5`}>
      <header className="flex flex-wrap items-start gap-x-3.5 gap-y-2">
        <InsurerLogo insurer={application.insurer} muted />
        <div className="min-w-0 flex-[1_1_220px]">
          <h3 className="text-base font-medium text-pretty text-label">{application.name}</h3>
          <MetaLine parts={[application.kind, `Application ${application.applicationNo}`]} />
        </div>
        <div className="@max-[479px]:ml-[58px]">
          <StatusBadge status="rejected" />
        </div>
      </header>

      {/* Colour on the icon, a faint tint behind, and a label: never colour alone. */}
      <div className="mt-4 flex gap-3 rounded-[calc(var(--radius-surface)-20px)] bg-[color-mix(in_oklch,var(--danger)_7%,transparent)] px-4 py-3.5">
        <CircleAlert size={16} strokeWidth={1.75} aria-hidden className="mt-0.5 shrink-0 text-danger" />
        <dl>
          <dt className="text-sm font-medium text-label">Why it was rejected</dt>
          <dd className="mt-0.5 text-sm text-pretty text-label-secondary">{application.reason}</dd>
        </dl>
      </div>
    </article>
  );
}
