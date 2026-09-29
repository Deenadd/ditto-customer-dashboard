import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { ApplicationCard } from "@/components/dashboard/application-card";
import { ApplicationTimeline } from "@/components/dashboard/application-timeline";
import { DocumentStack } from "@/components/dashboard/document-stack";
import { EmptyApplications } from "@/components/dashboard/empty-applications";
import { PolicyPair } from "@/components/dashboard/policy-pair";
import { PolicyTabs } from "@/components/dashboard/policy-tabs";
import { RejectedCard } from "@/components/dashboard/rejected-card";
import { WelcomeCard } from "@/components/dashboard/sidebar-cards";
import { TimelineSwitch } from "@/components/dashboard/timeline-switch";
import { SectionTitle, ShieldDivider } from "@/components/ui/card-bits";
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
  savedDocuments,
} from "@/lib/dashboard-data";
import { policyHref, readDashboardState, type DashboardState } from "@/lib/routes";

export const metadata: Metadata = {
  title: "Your policies — Ditto",
};

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const state = readDashboardState(await searchParams);
  const hasPending = state.customer === "default";

  return (
    <>
      <SiteHeader customerState={state.customer} />
      <main
        id="main"
        className="mx-auto grid max-w-[1112px] grid-cols-1 gap-x-8 gap-y-6 px-6 pt-10 pb-16 [grid-template-areas:'welcome'_'main'_'docs'] lg:grid-cols-[minmax(0,750px)_330px] lg:grid-rows-[auto_1fr] lg:justify-between lg:[grid-template-areas:'main_welcome'_'main_docs'] xl:px-0"
      >
        <h1 className="sr-only">Your policies</h1>

        <div className="min-w-0 [grid-area:main] max-lg:mt-2">
          <div className="lg:mt-[3px]">
            <PolicyTabs
              state={state}
              counts={{
                pending: hasPending ? applicationCount : 0,
                active: activePolicyCount,
                inactive: inactiveCount,
              }}
              trailing={
                state.tab === "pending" && hasPending ? (
                  <TimelineSwitch checked={state.timeline} customer={state.customer} />
                ) : undefined
              }
            />
          </div>
          <TabPanel state={state} hasPending={hasPending} />
        </div>

        <div className="[grid-area:welcome]">
          <WelcomeCard
            name={customer.name}
            memberSince={customer.memberSince}
            activePolicies={activePolicyCount}
            requirementRequests={hasPending ? requirementRequests : undefined}
          />
        </div>

        <div className="self-start [grid-area:docs]">
          <DocumentStack initial={savedDocuments} />
        </div>
      </main>
    </>
  );
}

function TabPanel({ state, hasPending }: { state: DashboardState; hasPending: boolean }) {
  if (state.tab === "active") {
    return (
      <div className="mt-8">
        {activePolicyGroups.map((group, index) => (
          <section key={group.title} aria-labelledby={`active-${index}`}>
            {index > 0 ? (
              <div className="my-8">
                <ShieldDivider />
              </div>
            ) : null}
            <SectionTitle id={`active-${index}`} count={group.items.length}>
              {group.title}
            </SectionTitle>
            <ul className="mt-6 flex flex-col gap-8">
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
      <div className="mt-8">
        <section aria-labelledby="expired-title">
          <SectionTitle id="expired-title" count={expiredPolicies.length}>
            Expired Policies
          </SectionTitle>
          <ul className="mt-6 flex flex-col gap-8">
            {expiredPolicies.map((policy) => (
              <li key={policy.id}>
                <PolicyPair policy={policy} muted />
              </li>
            ))}
          </ul>
        </section>
        <div className="my-8">
          <ShieldDivider />
        </div>
        <section aria-labelledby="rejected-title">
          <SectionTitle id="rejected-title" count={rejectedApplications.length}>
            Rejected Applications
          </SectionTitle>
          <ul className="mt-5 flex flex-col gap-5">
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
      <section aria-labelledby="timeline-title" className="mt-8">
        <SectionTitle id="timeline-title">Timeline of your latest updates</SectionTitle>
        <div className="mt-[35px]">
          <ApplicationTimeline groups={applicationTimeline} />
        </div>
      </section>
    );
  }

  return (
    <div className="mt-8">
      {applicationGroups.map((group, index) => (
        <section key={group.title} aria-labelledby={`pending-${index}`}>
          {index > 0 ? (
            <div className="my-8">
              <ShieldDivider />
            </div>
          ) : null}
          <SectionTitle id={`pending-${index}`}>{group.title}</SectionTitle>
          <ul className={`${index > 0 ? "mt-5" : "mt-6"} flex flex-col gap-4`}>
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
