import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/site-header";
import {
  CoveredCard,
  NotCoveredCard,
  PolicySummaryCard,
} from "@/components/policy/policy-detail-cards";
import { QuickLinksCard } from "@/components/policy/quick-links-card";
import { Asset } from "@/components/ui/asset";
import { covered, notCovered, policyDetail, quickLinks } from "@/lib/policy-detail";
import { dashboardHref, readDashboardState } from "@/lib/routes";

export const metadata: Metadata = {
  title: `${policyDetail.name} — Ditto`,
};

/** Policy view, node 149:9188. Only the health policy is drawn. */
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
      <main id="main" className="mx-auto max-w-[1112px] px-6 pt-10 pb-16 xl:px-0">
        <nav aria-label="Breadcrumb">
          <ol className="flex flex-wrap items-center gap-2 text-[14px] leading-4 font-medium">
            <li className="flex items-center gap-2">
              <Link
                href={dashboardHref({ customer })}
                className="ff-case flex items-center gap-2 tracking-[-0.0238px] text-ink-tertiary transition-colors duration-150 [@media(hover:hover)]:hover:text-ink"
              >
                <Asset src="/dashboard/home.svg" className="size-3.5" />
                Home
              </Link>
              <Chevron />
            </li>
            <li className="flex items-center gap-2">
              <Link
                href={dashboardHref({ tab: "active", customer })}
                className="ff-case tracking-[-0.0238px] text-ink-tertiary transition-colors duration-150 [@media(hover:hover)]:hover:text-ink"
              >
                Active Policies
              </Link>
              <Chevron />
            </li>
            <li>
              <span aria-current="page" className="tracking-[-0.5px] text-ink">
                {policyDetail.id}
              </span>
            </li>
          </ol>
        </nav>

        <div className="mt-[21px] grid gap-x-8 gap-y-5 lg:grid-cols-[minmax(0,750px)_330px] lg:justify-between">
          <div className="flex min-w-0 flex-col gap-5">
            <PolicySummaryCard policy={policyDetail} />
            <CoveredCard items={covered} />
            <NotCoveredCard items={notCovered} />
          </div>
          <aside aria-label="Support" className="self-start">
            <QuickLinksCard links={quickLinks} />
          </aside>
        </div>
      </main>
    </>
  );
}

function Chevron() {
  return (
    <span aria-hidden className="grid size-3 place-items-center">
      <Asset src="/dashboard/chevron.svg" className="size-3 -rotate-90" />
    </span>
  );
}
