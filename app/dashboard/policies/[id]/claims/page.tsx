import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ClaimsList } from "@/components/claims/claims-list";
import { ClaimsSupport } from "@/components/claims/claims-support";
import { SiteHeader } from "@/components/site-header";
import { policyDetail } from "@/lib/policy-detail";
import { readDashboardState } from "@/lib/routes";

export const metadata: Metadata = { title: "Claims — Ditto" };

/** Every claim on the health policy, with Start a claim. */
export default async function ClaimsPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { id } = await params;
  if (decodeURIComponent(id) !== policyDetail.id) notFound();
  const query = await searchParams;
  const { customer } = readDashboardState(query);
  const deleted = typeof query.deleted === "string" ? query.deleted : undefined;

  return (
    <>
      <SiteHeader customerState={customer} />
      <main id="main" className="mx-auto max-w-[1112px] px-3.5 pt-5 pb-20 sm:px-6 sm:pt-8 xl:px-0">
        <div className="grid gap-x-8 gap-y-6 lg:grid-cols-[minmax(0,750px)_330px] lg:justify-between">
          <div className="min-w-0">
            <ClaimsList customer={customer} view={query.view === "past" ? "past" : "active"} deleted={deleted} />
          </div>
          <aside aria-label="Support" className="self-start lg:sticky lg:top-24 lg:mt-[52px]">
            <ClaimsSupport />
          </aside>
        </div>
      </main>
    </>
  );
}
