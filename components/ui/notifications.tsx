"use client";

import Link from "next/link";
import { useId, useRef, useState } from "react";
import { InsurerLogo } from "@/components/ui/insurer-logo";
import { popoverPanelClass, useDismiss } from "@/components/ui/popover";
import type { Insurer } from "@/lib/dashboard-data";

export type Update = {
  id: string;
  insurer: Insurer;
  title: string;
  body: string;
  when: string;
  unread?: boolean;
};

/**
 * The bell opens the latest application updates, the same ones the timeline
 * shows. Opening the panel marks them read. With nothing to show, the panel
 * says so and what will appear there, rather than the bell disappearing.
 */
export function Notifications({ updates, href }: { updates: Update[]; href: string }) {
  const [open, setOpen] = useState(false);
  const [seen, setSeen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const panelId = useId();
  const unread = seen ? 0 : updates.filter((update) => update.unread).length;

  useDismiss({ open, onClose: () => setOpen(false), panelRef, triggerRef });

  return (
    <div className="relative">
      <button
        ref={triggerRef}
        type="button"
        aria-label={unread ? `Notifications, ${unread} unread` : "Notifications"}
        aria-expanded={open}
        aria-controls={open ? panelId : undefined}
        onClick={() => {
          setOpen((value) => !value);
          setSeen(true);
        }}
        className="relative grid size-10 place-items-center rounded-full text-label transition-[background-color,transform] duration-150 ease-out active:scale-[0.92] [@media(hover:hover)]:hover:bg-black/[0.04]"
      >
        <BellGlyph size={22} />
        {unread ? (
          <span
            aria-hidden
            className="absolute top-2 right-2 size-2.5 rounded-full bg-[#ff3b30] ring-2 ring-white"
          />
        ) : null}
      </button>

      {open ? (
        <div
          ref={panelRef}
          id={panelId}
          role="dialog"
          aria-label="Notifications"
          className={`${popoverPanelClass} w-[360px] p-2`}
        >
          {updates.length ? (
            <>
              <p className="px-3 pt-2 pb-1 text-[13px] leading-[18px] font-semibold text-label-secondary">
                Latest updates
              </p>
              <ul>
                {updates.map((update) => (
                  <li key={update.id}>
                    <Link
                      href={href}
                      onClick={() => setOpen(false)}
                      className="flex gap-3 rounded-[12px] p-3 transition-colors duration-150 active:bg-black/[0.05] [@media(hover:hover)]:hover:bg-black/[0.035]"
                    >
                      <InsurerLogo insurer={update.insurer} size={40} />
                      <span className="min-w-0 flex-1">
                        <span className="flex items-baseline justify-between gap-2">
                          <span className="truncate text-[14px] leading-5 font-semibold text-label">
                            {update.title}
                          </span>
                          <span className="shrink-0 text-[12px] leading-4 text-label-secondary">
                            {update.when}
                          </span>
                        </span>
                        <span className="mt-0.5 block text-[13px] leading-[18px] text-label-secondary">
                          {update.body}
                        </span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <div className="flex flex-col items-center px-6 pt-6 pb-5 text-center">
              <span aria-hidden className="grid size-11 place-items-center rounded-[12px] bg-fill text-label-secondary">
                <BellGlyph size={20} />
              </span>
              <p className="mt-3 text-[15px] leading-5 font-semibold text-label">No updates yet</p>
              <p className="mt-1 max-w-[240px] text-[13px] leading-[18px] text-pretty text-label-secondary">
                When an application moves forward or the insurer needs something, it shows up here.
              </p>
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}

function BellGlyph({ size }: { size: number }) {
  return (
    <svg aria-hidden width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path
        d="M18.5 14V9.5a6.5 6.5 0 1 0-13 0V14c0 1.1-.6 2.4-1.5 3.3-.3.3-.1.7.3.7h15.4c.4 0 .6-.4.3-.7-.9-.9-1.5-2.2-1.5-3.3Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path d="M10 20.5h4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}
