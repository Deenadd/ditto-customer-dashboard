import { SiteHeader } from "@/components/site-header";

export default function Home() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-[1112px] px-6 py-12 xl:px-0">
        <h1 className="text-2xl font-semibold tracking-[-0.4px] text-balance">
          Your dashboard
        </h1>
        <p className="mt-2 max-w-prose text-[15px] text-pretty text-ink-secondary">
          Your policies, renewals and claims will appear here.
        </p>
      </main>
    </>
  );
}
