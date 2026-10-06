import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ClaimView } from "@/components/claims/claim-view";
import { ClaimsSupport } from "@/components/claims/claims-support";
import { SiteHeader } from "@/components/site-header";
import { policyDetail } from "@/lib/policy-detail";
import { readDashboardState } from "@/lib/routes";

export const metadata: Metadata = { title: "Your claim — Ditto" };

/** One claim. Claims live in the browser, so the page reads it on the client. */
export default async function ClaimPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string; claimId: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { id, claimId } = await params;
  if (decodeURIComponent(id) !== policyDetail.id) notFound();
  const query = await searchParams;
  const { customer } = readDashboardState(query);

  return (
    <>
      <SiteHeader customerState={customer} />
      <main id="main" className="mx-auto max-w-[1112px] px-3.5 pt-5 pb-20 sm:px-6 sm:pt-8 xl:px-0">
        <div className="grid gap-x-8 gap-y-6 lg:grid-cols-[minmax(0,750px)_330px] lg:justify-between">
          <div className="min-w-0">
            <ClaimView claimId={decodeURIComponent(claimId)} customer={customer} created={query.created === "1"} />
          </div>
          <aside aria-label="Help with this claim" className="self-start lg:sticky lg:top-24 lg:mt-[52px]">
            <ClaimsSupport />
          </aside>
        </div>
      </main>
    </>
  );
}
