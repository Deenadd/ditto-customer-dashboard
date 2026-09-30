import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/site-header";
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
  title: `${policyDetail.name}: Ditto`,
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
        <Link
          href={dashboardHref({ tab: "active", customer })}
          className="group -ml-2 inline-flex min-h-11 items-center gap-1 rounded-control pr-3 pl-2 text-sm font-medium text-accent transition-colors duration-150 ease-[var(--ease-standard)] hover:bg-fill active:bg-fill"
        >
          <svg
            aria-hidden
            width="9"
            height="15"
            viewBox="0 0 9 15"
            fill="none"
            className="transition-transform duration-200 ease-out [@media(hover:hover)]:group-hover:-translate-x-0.5"
          >
            <path
              d="M7.5 1.5 1.75 7.5l5.75 6"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Active policies
        </Link>

        <div className="mt-4 grid gap-x-8 gap-y-6 lg:grid-cols-[minmax(0,750px)_330px] lg:justify-between">
          <div className="flex min-w-0 flex-col gap-6">
            <PolicyHeader policy={policyDetail} />
            <PolicySummaryCard policy={policyDetail} />
            <CoveredCard items={covered} />
            <NotCoveredCard items={notCovered} />
          </div>
          <aside aria-label="Claims support" className="self-start lg:sticky lg:top-24">
            <ClaimsSupport />
          </aside>
        </div>
      </main>
    </>
  );
}
