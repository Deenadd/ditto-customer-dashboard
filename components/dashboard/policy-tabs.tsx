import Link from "next/link";
import type { ReactNode } from "react";
import { Asset } from "@/components/ui/asset";
import { CountBadge } from "@/components/ui/card-bits";
import { dashboardHref, type DashboardState, type Tab } from "@/lib/routes";

const tabs: {
  value: Tab;
  label: string;
  icon: { on: string; off: string };
}[] = [
  {
    value: "pending",
    label: "Pending Applications",
    icon: { on: "/dashboard/tab-pending.svg", off: "/dashboard/tab-pending-outline.svg" },
  },
  {
    value: "active",
    label: "Active Policies",
    icon: { on: "/dashboard/tab-active-filled.svg", off: "/dashboard/tab-active.svg" },
  },
  {
    value: "inactive",
    label: "Inactive Policies",
    icon: { on: "/dashboard/tab-inactive-filled.svg", off: "/dashboard/tab-inactive.svg" },
  },
];

/**
 * The three policy lists (node 149:8878). Each is a link, so every list has
 * its own URL; the current one is blue with a filled icon and carries
 * aria-current. The row's trailing slot holds the timeline switch.
 */
export function PolicyTabs({
  state,
  counts,
  trailing,
}: {
  state: DashboardState;
  counts: Record<Tab, number>;
  trailing?: ReactNode;
}) {
  return (
    <div className="@container">
    <div className="relative flex flex-wrap items-end justify-between gap-x-8 gap-y-3 after:absolute after:inset-x-0 after:bottom-0 after:h-px after:bg-grey-300">
      <nav aria-label="Policies" className="max-w-full min-w-0 overflow-x-auto">
        <ul className="flex gap-8">
          {tabs.map((tab) => {
            const current = tab.value === state.tab;
            return (
              <li key={tab.value} className="shrink-0">
                <Link
                  href={dashboardHref({ tab: tab.value, customer: state.customer })}
                  aria-current={current ? "page" : undefined}
                  scroll={false}
                  className={`relative z-10 flex items-center gap-1.5 pt-1.5 pb-1.5 after:absolute after:inset-x-0 after:bottom-0 after:h-px ${
                    current ? "after:bg-primary" : "after:bg-transparent"
                  }`}
                >
                  <Asset src={current ? tab.icon.on : tab.icon.off} className="size-3.5" />
                  <span
                    className={`ff-case text-[14px] leading-none font-medium tracking-[-0.0238px] whitespace-nowrap transition-colors duration-150 ${
                      current ? "text-primary-strong" : "text-ink [@media(hover:hover)]:hover:text-primary-strong"
                    }`}
                  >
                    {tab.label}
                  </span>
                  <CountBadge count={counts[tab.value]} tone={current ? "active" : "ink"} />
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      {trailing ? (
        /* Once the row is too narrow for both, the switch moves above the
           tabs so the rule stays under the tabs. */
        <div className="flex @max-[720px]:order-first @max-[720px]:w-full @max-[720px]:justify-end @min-[720px]:pb-1">
          {trailing}
        </div>
      ) : null}
    </div>
    </div>
  );
}
