import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { NewClaimFlow } from "@/components/claims/new-claim-flow";
import { SiteHeader } from "@/components/site-header";
import { policyDetail } from "@/lib/policy-detail";
import { readDashboardState } from "@/lib/routes";

export const metadata: Metadata = { title: "Make a claim — Ditto" };

/** The cashless claim flow, on its own page so nothing competes with it. */
export default async function NewClaimPage({
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
      <main id="main">
        <NewClaimFlow customer={customer} />
      </main>
    </>
  );
}
