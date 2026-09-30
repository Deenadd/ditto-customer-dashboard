"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import { popoverPanelClass } from "@/components/ui/popover";

export type AccountOption = {
  value: string;
  label: string;
  hint: string;
  href: string;
};

/**
 * The avatar opens this menu. The prototype has one customer in two states:
 * with pending applications, and with none (the empty-state screen). The
 * menu switches between them, then offers Log out.
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
  const [open, setOpen] = useState(false);
  const count = options.length + 1; // the scenarios, then Log out
  const selected = Math.max(
    0,
    options.findIndex((option) => option.value === value),
  );
  const [active, setActive] = useState(selected);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLElement | null)[]>([]);
  const menuId = useId();

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

  function close({ refocus }: { refocus: boolean }) {
    setOpen(false);
    if (refocus) triggerRef.current?.focus();
  }

  function go(href: string) {
    close({ refocus: true });
    router.push(href);
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
    "flex w-full items-start gap-2.5 rounded-control py-2.5 pr-3 pl-2.5 text-left transition-colors duration-150 ease-[var(--ease-standard)] hover:bg-fill focus-visible:bg-fill active:bg-fill";

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
          className={`${popoverPanelClass} w-[280px] p-2`}
        >
          <p className="px-2.5 pt-2 pb-1.5 text-xs font-medium text-label-secondary">
            Signed in as {name}
          </p>
          <div role="group" aria-label="Show the dashboard">
            {options.map((option, index) => {
              const isSelected = index === selected;
              return (
                <button
                  key={option.value}
                  ref={(node) => {
                    itemRefs.current[index] = node;
                  }}
                  type="button"
                  role="menuitemradio"
                  aria-checked={isSelected}
                  tabIndex={index === active ? 0 : -1}
                  onClick={() => go(option.href)}
                  onPointerEnter={() => setActive(index)}
                  className={itemClass}
                >
                  <span className="mt-[3px] grid size-3.5 shrink-0 place-items-center text-accent">
                    {isSelected ? <CheckIcon /> : null}
                  </span>
                  <span className="min-w-0">
                    <span className="block text-sm font-medium text-label">
                      {option.label}
                    </span>
                    <span className="mt-0.5 block text-xs text-label-secondary">
                      {option.hint}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
          <div role="separator" className="mx-2.5 my-1 h-px bg-black/[0.08]" />
          <button
            ref={(node) => {
              itemRefs.current[options.length] = node;
            }}
            type="button"
            role="menuitem"
            tabIndex={active === options.length ? 0 : -1}
            onClick={() => go("/")}
            onPointerEnter={() => setActive(options.length)}
            className={itemClass}
          >
            <span className="size-3.5 shrink-0" />
            <span className="text-sm font-medium text-danger">Log out</span>
          </button>
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
