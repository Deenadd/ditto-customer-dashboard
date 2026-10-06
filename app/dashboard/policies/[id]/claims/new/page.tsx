import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ClaimFlow } from "@/components/claims/claim-flow";
import { SiteHeader } from "@/components/site-header";
import { policyDetail } from "@/lib/policy-detail";
import { readDashboardState } from "@/lib/routes";

export const metadata: Metadata = { title: "Make a claim — Ditto" };

/** Making a claim, on its own page so nothing competes with it. */
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
        <ClaimFlow customer={customer} />
      </main>
    </>
  );
}
