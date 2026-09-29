import Image from "next/image";
import Link from "next/link";
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
 * Frosted navigation bar: content scrolls underneath it. The Ditto mark
 * leads home; notifications and the account menu sit on the right.
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
    <header className="material-bar sticky top-0 z-30 border-b border-black/[0.06]">
      <div className="mx-auto flex h-14 max-w-[1112px] items-center justify-between px-5 sm:h-16 xl:px-0">
        <Link
          href={dashboardHref({ customer: customerState })}
          className="flex shrink-0 items-center rounded-lg"
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

        <div className="flex items-center gap-3">
          {updates.length ? (
            <Notifications
              updates={updates}
              href={dashboardHref({ timeline: true, customer: customerState })}
            />
          ) : null}
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
