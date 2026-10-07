"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import { popoverPanelClass } from "@/components/ui/popover";
import { markSignedOut } from "@/lib/session";
import { setHomeCard, useHomeCard } from "@/lib/home-card-version";
import { defaultRenewalDays, renewalPreview } from "@/lib/renewal";

export type AccountOption = {
  value: string;
  label: string;
  hint: string;
  href: string;
};

/* What choosing a row does. */
type Action =
  | { kind: "go"; href: string }
  | { kind: "log-out" }
  | { kind: "home"; patch: Parameters<typeof setHomeCard>[0] };

/* One row of the menu, as plain data. Rows in a group are radios; Log out
   stands alone. `at` is its place in the whole menu, for arrow keys. */
type Item = {
  key: string;
  label: string;
  hint?: string;
  checked?: boolean;
  danger?: boolean;
  action: Action;
  at: number;
};

type Group<T> = { label: string; heading?: string; items: T[] };

/**
 * The avatar opens this menu, which also holds the prototype's switches:
 * the customer in two states (with pending applications and with none), the
 * home card's version (v1 as it is, v2 with its renewal due) and, with v2,
 * how far off the family card's renewal is. Then Log out.
 *
 * Built on the renewal flow's version menu: ARIA menu pattern, commits on
 * click or Enter, returns focus to the trigger.
 */
export function AccountMenu({
  name,
  value,
  options,
}: {
  name: string;
  value: string;
  options: AccountOption[];
}) {
  const router = useRouter();
  const home = useHomeCard();
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLElement | null)[]>([]);
  const menuId = useId();

  function close({ refocus }: { refocus: boolean }) {
    setOpen(false);
    if (refocus) triggerRef.current?.focus();
  }

  function choose(action: Action) {
    close({ refocus: true });
    if (action.kind === "go") router.push(action.href);
    else if (action.kind === "log-out") {
      markSignedOut();
      router.push("/");
    } else setHomeCard(action.patch);
  }

  const familyDays = home.days[renewalPreview.policyId] ?? defaultRenewalDays[renewalPreview.policyId];
  const groups: Group<Omit<Item, "at">>[] = [
    {
      label: "Show the dashboard",
      items: options.map((option) => ({
        key: option.value,
        label: option.label,
        hint: option.hint,
        checked: option.value === value,
        action: { kind: "go", href: option.href },
      })),
    },
    {
      label: "Home card",
      heading: "Home card",
      items: [
        { key: "v1", label: "v1 · Standard", hint: "The cards as they are." },
        { key: "v2", label: "v2 · Renewal due", hint: "Each health card shows its renewal." },
      ].map((item) => ({
        ...item,
        checked: home.version === item.key,
        action: { kind: "home" as const, patch: { version: item.key as "v1" | "v2" } },
      })),
    },
    ...(home.version === "v2"
      ? [
          {
            label: `${renewalPreview.name} renews`,
            heading: `${renewalPreview.name} renews`,
            items: renewalPreview.stops.map((stop) => ({
              key: `stop-${stop.days}`,
              label: stop.label,
              checked: familyDays === stop.days,
              action: { kind: "home" as const, patch: { days: { ...home.days, [renewalPreview.policyId]: stop.days } } },
            })),
          },
        ]
      : []),
    {
      label: "Account",
      items: [{ key: "log-out", label: "Log out", danger: true, action: { kind: "log-out" } }],
    },
  ];
  /* Number the rows across the groups, in order. */
  let next = 0;
  const numbered: Group<Item>[] = groups.map((group) => ({
    ...group,
    items: group.items.map((item) => ({ ...item, at: next++ })),
  }));
  const items = numbered.flatMap((group) => group.items);
  const count = items.length;
  const selected = Math.max(0, items.findIndex((item) => item.checked));
  const [active, setActive] = useState(selected);

  useEffect(() => {
    if (open) itemRefs.current[active]?.focus();
  }, [open, active]);

  useEffect(() => {
    if (!open) return;
    function onPointerDown(event: PointerEvent) {
      const target = event.target as Node;
      if (menuRef.current?.contains(target)) return;
      if (triggerRef.current?.contains(target)) return;
      setOpen(false);
    }
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open]);

  function openAt(index: number) {
    setActive(index);
    setOpen(true);
  }

  function onTriggerKeyDown(event: React.KeyboardEvent) {
    if (event.key === "ArrowDown" || event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      openAt(selected);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      openAt(count - 1);
    }
  }

  function onMenuKeyDown(event: React.KeyboardEvent) {
    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        setActive((index) => (index + 1) % count);
        break;
      case "ArrowUp":
        event.preventDefault();
        setActive((index) => (index - 1 + count) % count);
        break;
      case "Home":
        event.preventDefault();
        setActive(0);
        break;
      case "End":
        event.preventDefault();
        setActive(count - 1);
        break;
      case "Escape":
        event.preventDefault();
        close({ refocus: true });
        break;
      case "Tab":
        close({ refocus: false });
        break;
    }
  }

  const itemClass =
    "flex w-full items-start gap-2.5 rounded-[12px] py-2.5 pr-3 pl-2.5 text-left transition-colors duration-150 hover:bg-black/[0.04] focus-visible:bg-black/[0.05] focus-visible:outline-none active:bg-black/[0.06]";

  return (
    <div className="relative">
      <button
        ref={triggerRef}
        type="button"
        aria-label={`Account, ${name}`}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        onClick={() => (open ? close({ refocus: false }) : openAt(selected))}
        onKeyDown={onTriggerKeyDown}
        className="relative block size-8 overflow-hidden rounded-full bg-avatar ring-1 ring-black/[0.06] transition-transform duration-150 ease-out before:absolute before:-inset-1 active:scale-[0.92]"
      >
        <Image
          src="/dashboard/avatar.png"
          alt=""
          width={512}
          height={512}
          sizes="34px"
          priority
          className="absolute top-[1.04%] left-[-5.78%] size-[106.25%] max-w-none"
        />
      </button>

      {open ? (
        <div
          ref={menuRef}
          id={menuId}
          role="menu"
          aria-label="Account"
          onKeyDown={onMenuKeyDown}
          className={`${popoverPanelClass} max-h-[calc(100dvh-env(safe-area-inset-top)-80px)] w-[280px] overflow-y-auto overscroll-contain p-1.5`}
        >
          <p className="px-2.5 pt-2 pb-1.5 text-[13px] leading-[18px] font-semibold text-label-secondary">
            Signed in as {name}
          </p>
          {numbered.map((group, groupIndex) => (
            <div key={group.label}>
              {groupIndex > 0 ? <div role="separator" className="mx-2.5 my-1 h-px bg-black/[0.08]" /> : null}
              <div role="group" aria-label={group.label}>
                {group.heading ? (
                  <p aria-hidden className="px-2.5 pt-2 pb-0.5 text-[12px] leading-4 font-medium text-label-secondary">
                    {group.heading}
                  </p>
                ) : null}
                {group.items.map(({ at, ...item }) => {
                  const radio = item.checked !== undefined;
                  return (
                    <button
                      key={item.key}
                      ref={(node) => {
                        itemRefs.current[at] = node;
                      }}
                      type="button"
                      role={radio ? "menuitemradio" : "menuitem"}
                      aria-checked={radio ? item.checked : undefined}
                      tabIndex={at === active ? 0 : -1}
                      onClick={() => choose(item.action)}
                      onPointerEnter={() => setActive(at)}
                      className={`${itemClass} ${item.hint ? "" : "py-2"}`}
                    >
                      <span className={`grid size-3.5 shrink-0 place-items-center text-accent ${item.hint ? "mt-[3px]" : "mt-0.5"}`}>
                        {item.checked ? <CheckIcon /> : null}
                      </span>
                      <span className="min-w-0">
                        <span
                          className={`block text-[14px] leading-[18px] font-medium ${item.danger ? "text-red-text" : "text-label"}`}
                        >
                          {item.label}
                        </span>
                        {item.hint ? (
                          <span className="mt-0.5 block text-[12px] leading-4 text-label-secondary">{item.hint}</span>
                        ) : null}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function CheckIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
      <path
        d="M2.5 6.2 4.9 8.5 9.5 3.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
