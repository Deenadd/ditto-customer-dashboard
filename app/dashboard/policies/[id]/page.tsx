import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/site-header";
import { Breadcrumbs } from "@/components/ui/breadcrumb";
import { PolicyClaimsCard } from "@/components/claims/policy-claims-card";
import { QuickActions } from "@/components/policy/quick-actions";
import {
  CoveredCard,
  NotCoveredCard,
  PolicyHeader,
} from "@/components/policy/policy-detail-cards";
import { covered, notCovered, policyDetail } from "@/lib/policy-detail";
import { activePolicyGroups } from "@/lib/dashboard-data";
import { PolicyCardPair } from "@/components/dashboard/health-card";

/* The policy as the dashboard draws it, for the card. */
const healthCard = activePolicyGroups.flatMap((group) => group.items).find((item) => item.id === policyDetail.id)!;
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
      <main id="main" className="mx-auto max-w-[1112px] px-3.5 pt-5 pb-20 sm:px-6 sm:pt-8 xl:px-0">
        <Breadcrumbs items={[{ label: "Active policies", href: dashboardHref({ tab: "active", customer }) }, { label: policyDetail.name }]} />

        {/* Two columns on a wide screen. In one column (below 1024px) both
            columns dissolve into the grid and the order puts Claims straight
            after the card: name, card, claims, cover, quick actions. */}
        <div className="mt-4 grid gap-x-8 gap-y-6 lg:grid-cols-[minmax(0,750px)_330px] lg:justify-between">
          <div className="flex min-w-0 flex-col gap-6 max-lg:contents">
            <div className="max-lg:order-1">
              <PolicyHeader policy={policyDetail} />
            </div>
            <div className="min-w-0 max-lg:order-2">
              <PolicyCardPair policy={healthCard} tone="blue" download flip />
            </div>
            <div className="max-lg:order-4">
              <CoveredCard items={covered} />
            </div>
            <div className="max-lg:order-5">
              <NotCoveredCard items={notCovered} />
            </div>
          </div>
          {/* Two tall cards: the column only sticks when there's room for both. */}
          <aside
            aria-label="Claims and support"
            className="flex flex-col gap-6 self-start max-lg:contents lg:top-24 lg:[@media(min-height:1080px)]:sticky"
          >
            <div className="max-lg:order-3">
              <PolicyClaimsCard policyId={policyDetail.id} customer={customer} />
            </div>
            <div className="max-lg:order-6">
              <QuickActions />
            </div>
          </aside>
        </div>
      </main>
    </>
  );
}
