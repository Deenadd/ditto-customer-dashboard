import Image from "next/image";
import Link from "next/link";
import { Asset } from "@/components/ui/asset";
import { AccountMenu } from "@/components/ui/account-menu";
import { customer, applicationCount } from "@/lib/dashboard-data";
import { dashboardHref, type Customer } from "@/lib/routes";

/**
 * Nav-Bar (node 149:8863): 64px, a soft shadow in place of a rule, the Ditto
 * mark on the content gutter, notifications and the avatar on the right.
 */
export function SiteHeader({ customerState = "default" }: { customerState?: Customer }) {
  return (
    <header className="sticky top-0 z-30 h-16 bg-white shadow-[0_1px_0.5px_rgb(0_0_0_/_0.07)]">
      <div className="mx-auto flex h-full max-w-[1112px] items-center justify-between px-6 xl:px-0">
        <Link
          href={dashboardHref({ customer: customerState })}
          className="flex shrink-0 items-center rounded"
        >
          <Image
            src="/brand/ditto-logo.png"
            alt="Ditto, your dashboard"
            width={663}
            height={307}
            priority
            className="h-9 w-[77.4px] object-contain"
          />
        </Link>

        <div className="flex items-center gap-6">
          <button
            type="button"
            aria-label="Notifications, you have unread updates"
            className="grid size-10 place-items-center rounded-full transition-[background-color,transform] duration-150 ease-out active:scale-[0.96] [@media(hover:hover)]:hover:bg-grey-50"
          >
            <Asset src="/dashboard/bell.svg" className="size-6" />
          </button>
          <AccountMenu
            name={customer.name}
            value={customerState}
            options={[
              {
                value: "default",
                label: "With pending applications",
                hint: `${applicationCount} applications waiting on uploads or the insurer.`,
                href: dashboardHref(),
              },
              {
                value: "new",
                label: "No pending applications",
                hint: "The empty state, and the sidebar that goes with it.",
                href: dashboardHref({ customer: "new" }),
              },
            ]}
          />
        </div>
      </div>
    </header>
  );
}
