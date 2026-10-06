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

/** WhatsApp's mark, filled, in the current colour: dark in the header beside
    the bell, white on the green tile in the panel. */
function WhatsAppGlyph({ size = 22 }: { size?: number }) {
  return (
    <svg aria-hidden width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        fill="currentColor"
        d="M12.149 2C14.7047 2.01525 17.1562 3.0175 18.9908 4.79688C20.8253 6.57631 21.9014 8.99572 21.9947 11.5498C22.0432 12.8574 21.8327 14.1621 21.3746 15.3877C20.9165 16.6131 20.2199 17.7355 19.3258 18.6904C18.4314 19.6455 17.3566 20.4146 16.1637 20.9522C14.9707 21.4897 13.6826 21.7859 12.3746 21.8232H12.0914C10.6045 21.8236 9.13595 21.4892 7.7955 20.8457L2.608 22H2.59335C2.58249 21.9999 2.57099 21.9977 2.56112 21.9932C2.55136 21.9886 2.5428 21.9818 2.53573 21.9736C2.52863 21.9655 2.52322 21.9557 2.5201 21.9453C2.51704 21.935 2.51576 21.9237 2.51717 21.9131L3.39413 16.668C2.56877 15.1578 2.15081 13.459 2.18124 11.7383C2.21173 10.0174 2.68946 8.33361 3.56796 6.85352C4.44639 5.37355 5.6951 4.14789 7.191 3.29688C8.68704 2.44588 10.379 1.99876 12.1002 2H12.149ZM8.55428 7.13281C8.46338 7.1437 8.37456 7.16865 8.29061 7.20606C8.17873 7.25595 8.07735 7.32747 7.99374 7.41699C7.75751 7.65925 7.09741 8.24251 7.05917 9.4668C7.02099 10.6905 7.87539 11.9014 7.99569 12.0723C8.11532 12.2421 9.63151 14.8874 12.1285 15.96C13.5961 16.5922 14.2397 16.7002 14.6568 16.7002C14.8286 16.7002 14.9587 16.6829 15.0943 16.6748C15.5519 16.6464 16.5839 16.1177 16.8092 15.543C17.0344 14.968 17.0492 14.4648 16.9898 14.3643C16.9305 14.2637 16.7673 14.1912 16.5221 14.0625C16.2761 13.9334 15.0734 13.2906 14.8473 13.2002C14.7636 13.1613 14.6736 13.1377 14.5816 13.1309C14.5216 13.134 14.4624 13.1518 14.4107 13.1826C14.3592 13.2134 14.316 13.2564 14.2848 13.3076C14.0838 13.5579 13.6222 14.1019 13.4674 14.2588C13.4336 14.2977 13.3919 14.3287 13.3453 14.3506C13.2986 14.3724 13.2475 14.3848 13.1959 14.3857C13.1009 14.3815 13.0077 14.3566 12.9234 14.3125C12.1946 14.003 11.5302 13.5589 10.9644 13.0049C10.4359 12.4839 9.98706 11.8878 9.63339 11.2354C9.49672 10.982 9.63372 10.851 9.75839 10.7324C9.88294 10.6138 10.0166 10.4503 10.1451 10.3086C10.2507 10.1875 10.339 10.0519 10.4068 9.90625C10.4418 9.83876 10.4588 9.76351 10.4576 9.6875C10.4564 9.6113 10.4363 9.5362 10.399 9.46973C10.3392 9.34129 9.89702 8.09811 9.68905 7.59864C9.52025 7.17157 9.31904 7.15662 9.14315 7.14356C8.99846 7.13351 8.83241 7.12905 8.66659 7.12403H8.6451L8.55428 7.13281Z"
      />
    </svg>
  );
}

/** A headset: help, in the header beside the bell. Stroked in the current
    colour at the bell's weight. */
function SupportGlyph({ size = 22 }: { size?: number }) {
  return (
    <svg aria-hidden width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5.75 9.75H4.25C3.42157 9.75 2.75 10.4216 2.75 11.25V14.75C2.75 15.5784 3.42157 16.25 4.25 16.25H5.75V9.75Z" />
      <path d="M19.75 9.75H18.25V16.25H19.75C20.5784 16.25 21.25 15.5784 21.25 14.75V11.25C21.25 10.4216 20.5784 9.75 19.75 9.75Z" />
      <path d="M19.25 9.75V9.5C19.25 5.77208 16.0041 2.75 12 2.75C7.99594 2.75 4.75 5.77208 4.75 9.5V9.75" />
      <path d="M12 19.6429V20.25C12 20.8023 12.4477 21.25 13 21.25H15C17.4853 21.25 19.5 19.2353 19.5 16.75" />
    </svg>
  );
}

/**
 * Help on WhatsApp, in the header on every page: a headset button that opens a small
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
        <SupportGlyph />
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
