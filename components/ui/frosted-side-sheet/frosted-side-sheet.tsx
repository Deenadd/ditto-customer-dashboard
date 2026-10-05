"use client";

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useSyncExternalStore,
  type CSSProperties,
  type ReactNode,
  type RefObject,
} from "react";
import { createPortal } from "react-dom";
import {
  AnimatePresence,
  motion,
  useDragControls,
  useReducedMotion,
  type TargetAndTransition,
  type Transition,
  type Variants,
} from "motion/react";
import {
  buildItemTransition,
  buildSheetTransition,
  hexToRgb,
  resolveSideSheetConfig,
  type SideSheetConfig,
} from "./config";
import { useScrollLock } from "@/lib/use-scroll-lock";
import { IconClose } from "@/components/ui/icons";

const noSubscribe = () => () => {};

/* Phones get a bottom sheet; the side sheet needs room beside the page. */
const PHONE = "(max-width: 719px)";
const subscribePhone = (listener: () => void) => {
  const query = window.matchMedia(PHONE);
  query.addEventListener("change", listener);
  return () => query.removeEventListener("change", listener);
};

/** A pull this far (px), or a flick this fast (px/s), dismisses the bottom sheet. */
const DISMISS_DISTANCE = 120;
const DISMISS_VELOCITY = 500;

/** Width of the readable column. The feathered blur extends to its left. */
const SHEET_WIDTH = 460;

type Reveal = {
  container: Variants;
  item: Variants;
  hidden: TargetAndTransition;
  shown: TargetAndTransition;
  itemTransition: Transition;
  reduced: boolean;
};

const RevealContext = createContext<Reveal | null>(null);

function buildReveal(config: SideSheetConfig, reduced: boolean): Reveal {
  const itemTransition: Transition = reduced ? { duration: 0.16 } : buildItemTransition(config);
  const hidden: TargetAndTransition = reduced ? { opacity: 0 } : { opacity: 0, y: 10, filter: "blur(6px)" };
  const shown: TargetAndTransition = reduced ? { opacity: 1 } : { opacity: 1, y: 0, filter: "blur(0px)" };
  return {
    reduced,
    itemTransition,
    hidden,
    shown,
    container: {
      hidden: { opacity: 0 },
      visible: {
        opacity: 1,
        transition: {
          staggerChildren: config.staggerStep / 1000,
          delayChildren: config.staggerInitial / 1000,
        },
      },
    },
    item: { hidden, visible: { ...shown, transition: itemTransition } },
  };
}

/**
 * A frosted sheet that glides in from the right over the page, with a
 * feathered backdrop blur along its leading edge (a mask, so the blur fades
 * off instead of ending in a hard line). Content reveals with a stagger, and
 * closing reverses the motion. Three interchangeable transition modes come
 * from `config.transitionType`.
 *
 * On phones (under 720px) it is a bottom sheet instead; see below.
 *
 * It behaves as a dialog: focus moves in on open and stays inside, Escape or
 * a click outside closes it, and focus returns to `returnFocusRef`. Clicks on
 * elements marked `data-sheet-trigger` don't close it, so another trigger can
 * switch what the sheet shows.
 */
export function FrostedSideSheet({
  open,
  onClose,
  title,
  headerAccessory,
  footer,
  children,
  config: overrides,
  returnFocusRef,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  headerAccessory?: ReactNode;
  footer?: ReactNode;
  children: ReactNode;
  config?: Partial<SideSheetConfig>;
  returnFocusRef?: RefObject<HTMLElement | null>;
}) {
  const config = resolveSideSheetConfig(overrides);
  const reduced = !!useReducedMotion();
  const reveal = buildReveal(config, reduced);
  /* The portal needs document.body, which only exists on the client. */
  const mounted = useSyncExternalStore(noSubscribe, () => true, () => false);
  const panelRef = useRef<HTMLDivElement>(null);
  const titleId = "frosted-sheet-title";
  const phone = useSyncExternalStore(subscribePhone, () => window.matchMedia(PHONE).matches, () => false);
  const drag = useDragControls();
  useScrollLock(open);

  /* Move focus in on open; hand it back to the trigger on close. */
  useEffect(() => {
    if (!open) return;
    const returnTo = returnFocusRef?.current;
    const frame = requestAnimationFrame(() => panelRef.current?.focus());
    return () => {
      cancelAnimationFrame(frame);
      returnTo?.focus();
    };
  }, [open, returnFocusRef]);

  /* Escape, outside click, and a focus trap while open. */
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key !== "Tab" || !panelRef.current) return;
      const focusable = panelRef.current.querySelectorAll<HTMLElement>(
        'button:not([disabled]), [href], input:not([disabled]), [tabindex]:not([tabindex="-1"])',
      );
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement;
      if (event.shiftKey && (active === first || active === panelRef.current)) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    };
    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Element;
      if (panelRef.current?.contains(target)) return;
      if (target.closest("[data-sheet-trigger]")) return;
      onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("pointerdown", onPointerDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("pointerdown", onPointerDown);
    };
  }, [open, onClose]);

  if (!mounted) return null;

  const { r, g, b } = hexToRgb(config.sheetColor);
  const featherMask = "linear-gradient(to right, transparent 0px, black var(--sheet-feather))";
  const blur = `blur(${config.blurStrength}px) saturate(180%)`;

  const header = (
    <header
      className={`flex items-center justify-between gap-3 pr-3 pb-3 pl-5 ${
        phone ? "relative cursor-grab touch-none pt-5 active:cursor-grabbing" : "pt-[calc(12px+env(safe-area-inset-top))]"
      }`}
      onPointerDown={
        phone
          ? (event) => {
              if ((event.target as Element).closest("button")) return;
              drag.start(event);
            }
          : undefined
      }
    >
      {phone ? <span aria-hidden className="absolute top-2 left-1/2 h-[5px] w-9 -translate-x-1/2 rounded-full bg-black/15" /> : null}
      <div className="flex min-w-0 items-center gap-2">
        <h2 id={titleId} className="truncate text-[17px] leading-[22px] font-semibold tracking-[-0.022em] text-label">
          {title}
        </h2>
        {headerAccessory}
      </div>
      <button
        type="button"
        onClick={onClose}
        aria-label={`Close ${title.toLowerCase()}`}
        className="grid size-11 shrink-0 place-items-center rounded-full text-label-secondary transition-[background-color,transform] duration-150 ease-out hover:bg-black/[0.05] hover:text-label active:scale-[0.92]"
      >
        <IconClose />
      </button>
    </header>
  );

  const body = (
    <RevealContext.Provider value={reveal}>
      <div className="flex min-h-0 flex-1 flex-col">{children}</div>
      {footer}
    </RevealContext.Provider>
  );

  /*
   * Phone: a bottom sheet over a dimmed page. It rises on the sheet's spring
   * and leaves the way it came. The header (with its grabber) drags it: it
   * follows the finger down, resists going up, and a long pull or a quick
   * flick dismisses it; otherwise it springs back. The content scrolls on
   * its own, so dragging is only from the header.
   */
  if (phone) {
    const tint = `rgba(${r},${g},${b},${Math.max(config.sheetTint, 0.86)})`;
    return createPortal(
      <AnimatePresence initial={false}>
        {open ? (
          <motion.div
            key="sheet-scrim"
            aria-hidden
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { duration: 0.25 } }}
            exit={{ opacity: 0, transition: { duration: 0.2 } }}
            className="fixed inset-0 z-50 bg-black/30"
          />
        ) : null}
        {open ? (
          <motion.div
            key="bottom-sheet"
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            tabIndex={-1}
            initial={reduced ? { opacity: 0 } : { y: "100%" }}
            animate={reduced ? { opacity: 1, transition: { duration: 0.2 } } : { y: 0, transition: buildSheetTransition(config, "in") }}
            exit={reduced ? { opacity: 0, transition: { duration: 0.16 } } : { y: "100%", transition: buildSheetTransition(config, "out") }}
            drag={reduced ? false : "y"}
            dragControls={drag}
            dragListener={false}
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0.04, bottom: 1 }}
            onDragEnd={(_, info) => {
              if (info.offset.y > DISMISS_DISTANCE || info.velocity.y > DISMISS_VELOCITY) onClose();
            }}
            className="fixed inset-x-0 bottom-0 z-50 flex h-[88dvh] flex-col overflow-hidden rounded-t-[28px] shadow-[0_-1px_0_rgb(255_255_255_/_0.6)_inset,0_-8px_32px_rgb(0_0_0_/_0.12)] focus-visible:outline-none"
            style={{ background: tint, backdropFilter: blur, WebkitBackdropFilter: blur }}
          >
            {header}
            {body}
          </motion.div>
        ) : null}
      </AnimatePresence>,
      document.body,
    );
  }

  return createPortal(
    <AnimatePresence initial={false}>
      {open ? (
        <motion.aside
          key="frosted-side-sheet"
          initial={reduced ? { opacity: 0 } : { x: "100%" }}
          animate={
            reduced
              ? { opacity: 1, transition: { duration: 0.2 } }
              : { x: 0, transition: buildSheetTransition(config, "in") }
          }
          exit={
            reduced
              ? { opacity: 0, transition: { duration: 0.16 } }
              : { x: "100%", transition: buildSheetTransition(config, "out") }
          }
          className="pointer-events-none fixed inset-y-0 right-0 z-50 w-[calc(min(460px,100vw)+var(--sheet-feather))] [--sheet-feather:0px] min-[720px]:[--sheet-feather:var(--sheet-feather-wide)]"
          style={{ "--sheet-feather-wide": `${config.blurFeather}px` } as CSSProperties}
        >
          {/* Feathered backdrop blur, extending left of the content. */}
          <div
            className="pointer-events-auto absolute inset-0"
            style={{
              backdropFilter: blur,
              WebkitBackdropFilter: blur,
              maskImage: featherMask,
              WebkitMaskImage: featherMask,
            }}
          />
          {/* Feathered tint, same mask, so there's no hard leading edge. */}
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background: `rgba(${r},${g},${b},${config.sheetTint})`,
              maskImage: featherMask,
              WebkitMaskImage: featherMask,
            }}
          />

          <div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            tabIndex={-1}
            className="pointer-events-auto absolute inset-y-0 right-0 flex flex-col focus-visible:outline-none"
            style={{ width: `min(${SHEET_WIDTH}px, 100vw)` }}
          >
            {header}
            {body}
          </div>
        </motion.aside>
      ) : null}
    </AnimatePresence>,
    document.body,
  );
}

/** Staggers its SheetItem children in when the sheet opens. */
export function SheetReveal({ children, className }: { children: ReactNode; className?: string }) {
  const reveal = useSheetReveal();
  return (
    <motion.div variants={reveal.container} initial="hidden" animate="visible" className={className}>
      {children}
    </motion.div>
  );
}

/**
 * One revealed item. Inside SheetReveal it joins the opening stagger. With
 * `delay` (seconds) it reveals on its own clock instead, for items added
 * after the sheet opened.
 */
export function SheetItem({
  children,
  className,
  delay,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  const reveal = useSheetReveal();
  if (delay === undefined) {
    return (
      <motion.div variants={reveal.item} className={className}>
        {children}
      </motion.div>
    );
  }
  return (
    <motion.div
      initial={reveal.hidden}
      animate={reveal.shown}
      transition={{ ...reveal.itemTransition, delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function useSheetReveal() {
  const reveal = useContext(RevealContext);
  if (!reveal) throw new Error("SheetReveal and SheetItem must be inside a FrostedSideSheet.");
  return reveal;
}
