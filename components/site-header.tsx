import Image from "next/image";
import Link from "next/link";
import { WhatsAppHelp } from "@/components/ui/whatsapp-help";
import { AccountMenu } from "@/components/ui/account-menu";
import { Notifications, type Update } from "@/components/ui/notifications";
import { applicationCount, applicationTimeline, customer } from "@/lib/dashboard-data";
import { dashboardHref, type Customer } from "@/lib/routes";

const statusCopy = {
  "pending-uploads": "Upload the documents the insurer asked for.",
  "missing-details": "A few details are missing from your proposal.",
  verification: "Your application is with the insurer for review.",
} as const;

/**
 * Navigation bar with no fill of its own: it floats over the page's top
 * progressive blur, which fades in once content scrolls beneath it. The
 * Ditto mark leads home; notifications and the account menu sit right.
 */
export function SiteHeader({ customerState = "default" }: { customerState?: Customer }) {
  const updates: Update[] =
    customerState === "new"
      ? []
      : applicationTimeline.flatMap((group) =>
          group.items.map((application) => ({
            id: `${group.date}-${application.id}`,
            insurer: application.insurer,
            title: application.name,
            body: statusCopy[application.status],
            when: group.date,
            unread: group.current,
          })),
        );

  return (
    <header className="sticky top-0 z-30 bg-page pt-[env(safe-area-inset-top)]">
      <div className="mx-auto flex h-14 max-w-[1112px] items-center justify-between px-3.5 sm:h-16 sm:px-5 xl:px-0">
        <Link
          href={dashboardHref({ customer: customerState })}
          className="touch-hit flex shrink-0 items-center rounded-lg"
        >
          <Image
            src="/brand/ditto-logo.png"
            alt="Ditto, your policies"
            width={663}
            height={307}
            priority
            className="h-8 w-[69px] object-contain sm:h-9 sm:w-[77.4px]"
          />
        </Link>

        <div className="flex items-center gap-1.5 sm:gap-3">
          <WhatsAppHelp />
          <Notifications updates={updates} href={dashboardHref({ tab: "pending", customer: customerState })} />
          <AccountMenu
            name={customer.name}
            value={customerState}
            options={[
              {
                value: "default",
                label: "With pending applications",
                hint: `${applicationCount} applications in progress.`,
                href: dashboardHref(),
              },
              {
                value: "new",
                label: "No pending applications",
                hint: "The empty state, for a customer with nothing open.",
                href: dashboardHref({ customer: "new" }),
              },
            ]}
          />
        </div>
      </div>
    </header>
  );
}
