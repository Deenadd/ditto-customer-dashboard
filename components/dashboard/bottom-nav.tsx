"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { BadgeCheck, CircleMinus, Clock, Search, type LucideIcon } from "lucide-react";
import { FrostedSideSheet } from "@/components/ui/frosted-side-sheet/frosted-side-sheet";
import { InsurerLogo } from "@/components/ui/insurer-logo";
import {
  activePolicyGroups,
  applicationGroups,
  expiredPolicies,
  rejectedApplications,
  type Insurer,
} from "@/lib/dashboard-data";
import { dashboardHref, policyHref, type Customer, type Tab } from "@/lib/routes";

const tabs: { tab: Tab; label: string; icon: LucideIcon }[] = [
  { tab: "pending", label: "Pending", icon: Clock },
  { tab: "active", label: "Active", icon: BadgeCheck },
  { tab: "inactive", label: "Inactive", icon: CircleMinus },
];

/* An item in the nav: a 22px icon over a 12px label, a 44px-tall target.
   The current tab is blue and its icon filled, its inner strokes knocked out
   white, as iOS fills the selected tab's symbol. */
const item =
  "flex h-[52px] flex-1 flex-col items-center justify-center gap-1 text-[12px] leading-[14px] font-medium transition-[color,transform] duration-150 ease-out active:scale-[0.94]";

/**
 * The dashboard's tab bar on a phone (Figma, iPhone 13 mini 84): Pending,
 * Active and Inactive switch the policy tabs, and Search opens a sheet
 * that finds a policy or application by name or number. Tapping the tab
 * you're on scrolls back to the top, as on iOS. It floats on the frosted
 * bar material with a hairline above, padded clear of the home indicator.
 *
 * Phones only; from 640px the segmented control above the list does this.
 */
export function BottomNav({ tab, customer }: { tab: Tab; customer: Customer }) {
  const [searching, setSearching] = useState(false);
  const searchRef = useRef<HTMLButtonElement>(null);

  return (
    <>
      <nav
        aria-label="Policies"
        className="material-bar fixed inset-x-0 bottom-0 z-[15] pb-[env(safe-area-inset-bottom)] shadow-[0_-0.5px_0_rgb(0_0_0_/_0.12)] sm:hidden"
      >
        <ul className="flex px-2 pt-1.5 pb-1">
          {tabs.map(({ tab: value, label, icon: Icon }) => {
            const current = value === tab;
            return (
              <li key={value} className="flex flex-1">
                <Link
                  href={dashboardHref({ tab: value, customer })}
                  aria-current={current ? "page" : undefined}
                  scroll={!current}
                  onClick={(event) => {
                    if (!current) return;
                    event.preventDefault();
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  className={`${item} ${current ? "text-accent" : "text-label-secondary"}`}
                >
                  <Icon
                    aria-hidden
                    size={22}
                    strokeWidth={1.75}
                    fill={current ? "currentColor" : "none"}
                    className={current ? "[&>*:not(:first-child)]:stroke-white" : ""}
                  />
                  {label}
                </Link>
              </li>
            );
          })}
          <li className="flex flex-1">
            <button
              ref={searchRef}
              type="button"
              aria-haspopup="dialog"
              aria-expanded={searching}
              onClick={() => setSearching(true)}
              className={`${item} text-label-secondary`}
            >
              <Search aria-hidden size={22} strokeWidth={1.75} />
              Search
            </button>
          </li>
        </ul>
      </nav>

      <FrostedSideSheet open={searching} onClose={() => setSearching(false)} title="Search" returnFocusRef={searchRef}>
        <SearchPanel customer={customer} onPick={() => setSearching(false)} />
      </FrostedSideSheet>
    </>
  );
}

type Result = { id: string; insurer: Insurer; title: string; detail: string; href: string; keys: string };

/* Everything the dashboard lists, flattened into one searchable list. A
   result opens its policy page when it has one, or the tab it's on. */
function results(customer: Customer): Result[] {
  const active = activePolicyGroups.flatMap((group) =>
    group.items.map((p) => ({
      id: p.id,
      insurer: p.insurer,
      title: p.name,
      detail: `${p.kind} · Active · ${p.policyNumber}`,
      href: p.hasDetail ? policyHref(p.id, customer) : dashboardHref({ tab: "active", customer }),
      keys: `${p.name} ${p.kind} ${p.policyNumber} ${p.coverageType} active`,
    })),
  );
  const pending =
    customer === "default"
      ? applicationGroups.flatMap((group) =>
          group.items.map((a) => ({
            id: a.id,
            insurer: a.insurer,
            title: a.name,
            detail: `${a.kind} · Pending · Application ${a.applicationNo}`,
            href: dashboardHref({ tab: "pending", customer }),
            keys: `${a.name} ${a.kind} ${a.applicationNo} pending application`,
          })),
        )
      : [];
  const inactive = [
    ...expiredPolicies.map((p) => ({
      id: p.id,
      insurer: p.insurer,
      title: p.name,
      detail: `${p.kind} · Expired · ${p.policyNumber}`,
      href: dashboardHref({ tab: "inactive", customer }),
      keys: `${p.name} ${p.kind} ${p.policyNumber} expired inactive`,
    })),
    ...rejectedApplications.map((a) => ({
      id: a.id,
      insurer: a.insurer,
      title: a.name,
      detail: `${a.kind} · Rejected · Application ${a.applicationNo}`,
      href: dashboardHref({ tab: "inactive", customer }),
      keys: `${a.name} ${a.kind} ${a.applicationNo} rejected inactive`,
    })),
  ];
  return [...active, ...pending, ...inactive];
}

function SearchPanel({ customer, onPick }: { customer: Customer; onPick: () => void }) {
  const [query, setQuery] = useState("");
  const q = query.trim().toLowerCase();
  const all = results(customer);
  const found = q ? all.filter((r) => r.keys.toLowerCase().includes(q)) : all;

  return (
    <div data-scroll-lock-scrollable className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 pt-2 pb-[calc(24px+env(safe-area-inset-bottom))]">
      <label htmlFor="policy-search" className="sr-only">
        Search policies and applications
      </label>
      <div className="relative">
        <Search aria-hidden size={18} strokeWidth={1.75} className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-label-tertiary" />
        <input
          id="policy-search"
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Policy, application or number"
          autoComplete="off"
          enterKeyHint="search"
          className="h-11 w-full rounded-[12px] bg-surface pr-3.5 pl-10 text-[16px] leading-6 text-label shadow-field placeholder:text-label-tertiary focus:shadow-[0_0_0_2px_var(--color-accent)] focus:outline-none"
        />
      </div>
      <p role="status" className="mt-2.5 text-[12px] leading-4 text-label-secondary tabular-nums">
        {q ? `${found.length} ${found.length === 1 ? "result" : "results"} for “${query.trim()}”` : `${all.length} policies and applications`}
      </p>
      {found.length ? (
        <ul className="mt-3 overflow-hidden rounded-[16px] bg-surface shadow-soft">
          {found.map((r) => (
            <li
              key={r.id}
              className="relative [&+&]:before:absolute [&+&]:before:top-0 [&+&]:before:right-0 [&+&]:before:left-[72px] [&+&]:before:h-px [&+&]:before:bg-separator"
            >
              <Link
                href={r.href}
                onClick={onPick}
                className="flex items-center gap-3 px-4 py-3 transition-colors duration-150 ease-out active:bg-fill"
              >
                <InsurerLogo insurer={r.insurer} size={40} />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[15px] leading-5 font-medium text-label">{r.title}</span>
                  <span className="block truncate text-[12px] leading-4 text-label-secondary tabular-nums">{r.detail}</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-6 text-center text-[15px] leading-5 text-pretty text-label-secondary">
          Nothing matches “{query.trim()}”. Try a policy name or number.
        </p>
      )}
    </div>
  );
}
