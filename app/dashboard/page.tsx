import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { ClaimsSupport } from "@/components/claims/claims-support";
import { ApplicationCard } from "@/components/dashboard/application-card";
import { ApplicationTimeline } from "@/components/dashboard/application-timeline";
import { EmptyApplications } from "@/components/dashboard/empty-applications";
import { PolicyPair } from "@/components/dashboard/policy-pair";
import { RejectedCard } from "@/components/dashboard/rejected-card";
import { WelcomeCard } from "@/components/dashboard/sidebar-cards";
import { Count, SectionTitle } from "@/components/ui/card-bits";
import { RouteSegmentedControl } from "@/components/ui/segmented";
import {
  activePolicyCount,
  activePolicyGroups,
  applicationCount,
  applicationGroups,
  applicationTimeline,
  customer,
  expiredPolicies,
  inactiveCount,
  rejectedApplications,
  requirementRequests,
} from "@/lib/dashboard-data";
import {
  dashboardHref,
  policyHref,
  readDashboardState,
  type DashboardState,
} from "@/lib/routes";

export const metadata: Metadata = {
  title: "Your policies: Ditto",
};

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const state = readDashboardState(await searchParams);
  const hasPending = state.customer === "default";
  const counts = {
    pending: hasPending ? applicationCount : 0,
    active: activePolicyCount,
    inactive: inactiveCount,
  };

  return (
    <>
      <SiteHeader customerState={state.customer} />
      <main
        id="main"
        className="mx-auto grid max-w-[1112px] grid-cols-1 gap-x-8 gap-y-6 px-4 pt-6 pb-20 [grid-template-areas:'welcome'_'main'_'claims'] sm:px-6 sm:pt-10 lg:grid-cols-[minmax(0,750px)_330px] lg:grid-rows-[auto_1fr] lg:justify-between lg:[grid-template-areas:'main_welcome'_'main_claims'] xl:px-0"
      >
        <div className="min-w-0 [grid-area:main] max-lg:mt-4">
          <h1 className="font-display text-3xl font-medium tracking-[-0.03em] text-label">
            Your policies
          </h1>

          <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
            <RouteSegmentedControl
              label="Policies"
              value={state.tab}
              segments={[
                {
                  value: "pending",
                  label: "Pending",
                  accessory: <Count value={counts.pending} />,
                  href: dashboardHref({ tab: "pending", timeline: state.timeline, customer: state.customer }),
                },
                {
                  value: "active",
                  label: "Active",
                  accessory: <Count value={counts.active} />,
                  href: dashboardHref({ tab: "active", customer: state.customer }),
                },
                {
                  value: "inactive",
                  label: "Inactive",
                  accessory: <Count value={counts.inactive} />,
                  href: dashboardHref({ tab: "inactive", customer: state.customer }),
                },
              ]}
            />
            {state.tab === "pending" && hasPending ? (
              <RouteSegmentedControl
                label="Show applications as"
                value={state.timeline ? "timeline" : "grouped"}
                segments={[
                  { value: "grouped", label: "By status", href: dashboardHref({ customer: state.customer }) },
                  {
                    value: "timeline",
                    label: "Timeline",
                    href: dashboardHref({ timeline: true, customer: state.customer }),
                  },
                ]}
              />
            ) : null}
          </div>

          <div className="mt-8">
            <TabPanel state={state} hasPending={hasPending} />
          </div>
        </div>

        <div className="[grid-area:welcome]">
          <WelcomeCard
            firstName={customer.firstName}
            memberSince={customer.memberSince}
            activePolicies={activePolicyCount}
            requirementRequests={hasPending ? requirementRequests : 0}
          />
        </div>

        <div className="self-start [grid-area:claims]">
          <ClaimsSupport />
        </div>
      </main>
    </>
  );
}

function TabPanel({ state, hasPending }: { state: DashboardState; hasPending: boolean }) {
  if (state.tab === "active") {
    return (
      <div className="flex flex-col gap-10">
        {activePolicyGroups.map((group, index) => (
          <section key={group.title} aria-labelledby={`active-${index}`}>
            <SectionTitle id={`active-${index}`} count={group.items.length}>
              {group.title}
            </SectionTitle>
            <ul className="mt-4 flex flex-col gap-6">
              {group.items.map((policy) => (
                <li key={policy.id}>
                  <PolicyPair
                    policy={policy}
                    href={policy.hasDetail ? policyHref(policy.id, state.customer) : undefined}
                  />
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    );
  }

  if (state.tab === "inactive") {
    return (
      <div className="flex flex-col gap-10">
        <section aria-labelledby="expired-title">
          <SectionTitle id="expired-title" count={expiredPolicies.length}>
            Expired policies
          </SectionTitle>
          <ul className="mt-4 flex flex-col gap-6">
            {expiredPolicies.map((policy) => (
              <li key={policy.id}>
                <PolicyPair policy={policy} muted />
              </li>
            ))}
          </ul>
        </section>
        <section aria-labelledby="rejected-title">
          <SectionTitle id="rejected-title" count={rejectedApplications.length}>
            Rejected applications
          </SectionTitle>
          <ul className="mt-4 flex flex-col gap-4">
            {rejectedApplications.map((application) => (
              <li key={application.id}>
                <RejectedCard application={application} />
              </li>
            ))}
          </ul>
        </section>
      </div>
    );
  }

  if (!hasPending) return <EmptyApplications />;

  if (state.timeline) {
    return (
      <section aria-label="Applications by latest update">
        <ApplicationTimeline groups={applicationTimeline} />
      </section>
    );
  }

  return (
    <div className="flex flex-col gap-10">
      {applicationGroups.map((group, index) => (
        <section key={group.title} aria-labelledby={`pending-${index}`}>
          <SectionTitle id={`pending-${index}`} count={group.items.length}>
            {group.title}
          </SectionTitle>
          <ul className="mt-4 flex flex-col gap-4">
            {group.items.map((application) => (
              <li key={application.id}>
                <ApplicationCard application={application} />
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
