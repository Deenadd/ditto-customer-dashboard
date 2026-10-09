import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { GoodToKnow, IssuedActions, IssuedHero, ThingsToNote } from "@/components/applications/issued";
import { NextSteps } from "@/components/applications/next-steps";
import { AdvisorCard, ApplicationFaqs, ApplicationHeader, WhatsNextCard } from "@/components/applications/submitted";
import { PolicyCardPair } from "@/components/dashboard/health-card";
import { CoveredCard, NotCoveredCard } from "@/components/policy/policy-detail-cards";
import { SiteHeader } from "@/components/site-header";
import { Breadcrumbs } from "@/components/ui/breadcrumb";
import { applicationSteps } from "@/lib/application-detail";
import { toneOf } from "@/lib/card-fields";
import { activePolicyGroups, findApplication } from "@/lib/dashboard-data";
import { covered, notCovered } from "@/lib/policy-detail";
import { dashboardHref, readDashboardState, type Customer } from "@/lib/routes";

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const application = findApplication(decodeURIComponent(id));
  return { title: `${application?.name ?? "Application"} — Ditto` };
}

/**
 * An application's page: where it stands and what comes next. While it's
 * pending, the submitted screen; once the insurer has issued it, the
 * policy-is-active screen, which the bell's update opens.
 */
export default async function ApplicationPage({ params, searchParams }: Props) {
  const { id } = await params;
  const application = findApplication(decodeURIComponent(id));
  if (!application) notFound();
  const { customer } = readDashboardState(await searchParams);
  const policy = activePolicyGroups.flatMap((group) => group.items).find((item) => item.id === application.policyId);
  const issued = application.status === "issued" && policy;

  return (
    <>
      <SiteHeader customerState={customer} />
      <main id="main" className="mx-auto max-w-[1112px] px-3.5 pt-5 pb-20 sm:px-6 sm:pt-8 xl:px-0">
        <Breadcrumbs
          items={[
            issued
              ? { label: "Active policies", href: dashboardHref({ tab: "active", customer }) }
              : { label: "Pending applications", href: dashboardHref({ tab: "pending", customer }) },
            { label: application.name },
          ]}
        />
        {/* Two columns on a wide screen, as the policy page: in one column
            (below 1024px) both dissolve into the grid and the order puts the
            side card after the top of the page. */}
        <div className="mt-4 grid gap-x-8 gap-y-6 lg:grid-cols-[minmax(0,750px)_330px] lg:justify-between">
          {issued ? (
            <Issued application={application} policy={policy} customer={customer} />
          ) : (
            <Submitted application={application} />
          )}
        </div>
      </main>
    </>
  );
}

type Application = NonNullable<ReturnType<typeof findApplication>>;
type Policy = (typeof activePolicyGroups)[number]["items"][number];

function Submitted({ application }: { application: Application }) {
  return (
    <>
      <div className="flex min-w-0 flex-col gap-6 max-lg:contents">
        <div className="max-lg:order-1">
          <ApplicationHeader application={application} />
        </div>
        <div className="max-lg:order-2">
          <WhatsNextCard application={application} />
        </div>
        <div className="max-lg:order-4">
          <AdvisorCard application={application} />
        </div>
        <div className="max-lg:order-5">
          <ApplicationFaqs />
        </div>
      </div>
      <aside aria-label="Next steps" className="self-start max-lg:contents lg:sticky lg:top-24">
        <div className="max-lg:order-3">
          <NextSteps steps={applicationSteps(application)} />
        </div>
      </aside>
    </>
  );
}

function Issued({ application, policy, customer }: { application: Application; policy: Policy; customer: Customer }) {
  return (
    <>
      <div className="flex min-w-0 flex-col gap-6 max-lg:contents">
        <div className="max-lg:order-1">
          <IssuedHero application={application} />
        </div>
        <div className="min-w-0 max-lg:order-2">
          <PolicyCardPair policy={policy} tone={toneOf(policy)} download flip />
        </div>
        <div className="max-lg:order-3">
          <IssuedActions application={application} policy={policy} customer={customer} />
        </div>
        <div className="max-lg:order-5">
          <CoveredCard items={covered} />
        </div>
        <div className="max-lg:order-6">
          <NotCoveredCard items={notCovered} />
        </div>
        <div className="max-lg:order-7">
          <ThingsToNote />
        </div>
      </div>
      <aside aria-label="Good to know" className="self-start max-lg:contents lg:sticky lg:top-24">
        <div className="max-lg:order-4">
          <GoodToKnow policy={policy} customer={customer} />
        </div>
      </aside>
    </>
  );
}
