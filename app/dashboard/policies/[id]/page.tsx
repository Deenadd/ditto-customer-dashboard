import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/site-header";
import { BackLink } from "@/components/ui/back-link";
import { PolicyClaimsCard } from "@/components/claims/policy-claims-card";
import {
  CoveredCard,
  NotCoveredCard,
  PolicyHeader,
  PolicySummaryCard,
} from "@/components/policy/policy-detail-cards";
import { ClaimsSupport } from "@/components/claims/claims-support";
import { covered, notCovered, policyDetail } from "@/lib/policy-detail";
import { dashboardHref, readDashboardState } from "@/lib/routes";

export const metadata: Metadata = {
  title: `${policyDetail.name} — Ditto`,
};

/** Policy view. Only the health policy is drawn in the design. */
export default async function PolicyPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { id } = await params;
  if (decodeURIComponent(id) !== policyDetail.id) notFound();
  const { customer } = readDashboardState(await searchParams);

  return (
    <>
      <SiteHeader customerState={customer} />
      <main id="main" className="mx-auto max-w-[1112px] px-4 pt-5 pb-20 sm:px-6 sm:pt-8 xl:px-0">
        <BackLink href={dashboardHref({ tab: "active", customer })}>Active policies</BackLink>

        <div className="mt-4 grid gap-x-8 gap-y-6 lg:grid-cols-[minmax(0,750px)_330px] lg:justify-between">
          <div className="flex min-w-0 flex-col gap-6">
            <PolicyHeader policy={policyDetail} />
            <PolicySummaryCard policy={policyDetail} />
            <CoveredCard items={covered} />
            <NotCoveredCard items={notCovered} />
          </div>
          {/* Two cards are taller than a short window, so the column only
              sticks when there's room for all of it. */}
          <aside
            aria-label="Claims and support"
            className="flex flex-col gap-6 self-start lg:top-24 lg:[@media(min-height:820px)]:sticky"
          >
            <ClaimsSupport />
            <PolicyClaimsCard policyId={policyDetail.id} customer={customer} />
          </aside>
        </div>
      </main>
    </>
  );
}
