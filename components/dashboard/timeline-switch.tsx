"use client";

import { useRouter } from "next/navigation";
import { Asset } from "@/components/ui/asset";
import { dashboardHref, type Customer } from "@/lib/routes";

/**
 * "Switch timeline view" (node 149:9142): a real checkbox drawn with the
 * Figma box, which swaps the pending list between grouped cards and a
 * timeline by updating the URL.
 */
export function TimelineSwitch({
  checked,
  customer,
}: {
  checked: boolean;
  customer: Customer;
}) {
  const router = useRouter();

  return (
    <label className="relative flex cursor-pointer items-center gap-2 py-1 has-[:focus-visible]:rounded-[4px] has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-primary-strong">
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) =>
          router.replace(
            dashboardHref({ tab: "pending", timeline: event.target.checked, customer }),
            { scroll: false },
          )
        }
        className="peer absolute size-px opacity-0"
      />
      <Asset
        src={checked ? "/dashboard/switch-view-checked.svg" : "/dashboard/switch-view.svg"}
        className="size-3.5"
      />
      <span className="ff-case text-[13px] leading-none font-medium tracking-[-0.0221px] whitespace-nowrap text-ink">
        Switch timeline view
      </span>
    </label>
  );
}
