"use client";

import { useId, useRef, useState } from "react";
import { buttonClass } from "@/components/ui/buttons";
import { popoverPanelClass, useDismiss } from "@/components/ui/popover";

/* Ditto's WhatsApp line, as joinditto.in links it (its site config's
   whatsappNumber). wa.me opens the app on a phone and WhatsApp Web on a
   computer, with the first message filled in. */
const NUMBER = "918867919680";
const MESSAGE = "Hi Ditto, I need help with my policy.";
export const whatsappHref = `https://wa.me/${NUMBER}?text=${encodeURIComponent(MESSAGE)}`;

/** WhatsApp's speech bubble with the handset, drawn to sit with the bell. */
function WhatsAppGlyph({ size = 22 }: { size?: number }) {
  return (
    <svg aria-hidden width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path
        d="M12 3.5a8.5 8.5 0 0 0-7.33 12.8L3.5 20.5l4.32-1.13A8.5 8.5 0 1 0 12 3.5Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path
        d="M9.05 8.1c.2-.4.48-.42.7-.42h.48c.18 0 .4.06.52.36l.68 1.62c.1.24.04.46-.1.62l-.5.58c-.12.14-.14.32-.04.5.5.9 1.3 1.68 2.2 2.2.18.1.36.08.5-.04l.58-.5c.16-.14.4-.2.62-.1l1.62.68c.3.12.36.34.36.52v.48c0 .22-.02.5-.42.7-.5.28-1.28.48-2.02.3-1.6-.4-3.58-2.38-3.98-3.98-.18-.74.02-1.52.3-2.02Z"
        fill="currentColor"
      />
    </svg>
  );
}

/**
 * Help on WhatsApp, in the header on every page. The button opens a small
 * panel that says where you're going before you leave the site, then
 * Open WhatsApp hands over in a new tab with a first message ready.
 */
export function WhatsAppHelp() {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const panelId = useId();

  useDismiss({ open, onClose: () => setOpen(false), panelRef, triggerRef });

  return (
    <div className="relative">
      <button
        ref={triggerRef}
        type="button"
        aria-label="Help on WhatsApp"
        aria-expanded={open}
        aria-controls={open ? panelId : undefined}
        onClick={() => setOpen((value) => !value)}
        className="grid size-10 place-items-center rounded-full text-label transition-[background-color,transform] duration-150 ease-out active:scale-[0.92] [@media(hover:hover)]:hover:bg-black/[0.04]"
      >
        <WhatsAppGlyph />
      </button>

      {open ? (
        <div
          ref={panelRef}
          id={panelId}
          role="dialog"
          aria-labelledby={`${panelId}-title`}
          className={`${popoverPanelClass} w-[320px] p-4`}
        >
          <div className="flex items-start gap-3">
            {/* WhatsApp's own green, so the destination is recognisable. */}
            <span className="grid size-11 shrink-0 place-items-center rounded-[12px] bg-[#25d366] text-white">
              <WhatsAppGlyph size={24} />
            </span>
            <div className="min-w-0">
              <h2 id={`${panelId}-title`} className="text-[15px] leading-5 font-semibold text-label">
                Help on WhatsApp
              </h2>
              <p className="mt-0.5 text-[13px] leading-[18px] text-pretty text-label-secondary">
                Talk to a Ditto advisor about your policies, a claim or a hospital stay.
              </p>
            </div>
          </div>
          <a
            href={whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setOpen(false)}
            className={`${buttonClass("filled", "large")} mt-4 w-full`}
          >
            Open WhatsApp
          </a>
          <p className="mt-2 text-center text-[12px] leading-4 text-label-secondary">Opens WhatsApp in a new tab.</p>
        </div>
      ) : null}
    </div>
  );
}
