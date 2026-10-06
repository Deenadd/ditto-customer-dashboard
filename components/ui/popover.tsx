"use client";

import { useEffect, useRef, type RefObject } from "react";

/**
 * Close a popover on Escape or a click outside it, and hand focus back to the
 * trigger when Escape closes it.
 */
export function useDismiss({
  open,
  onClose,
  panelRef,
  triggerRef,
}: {
  open: boolean;
  onClose: () => void;
  panelRef: RefObject<HTMLElement | null>;
  triggerRef: RefObject<HTMLElement | null>;
}) {
  const close = useRef(onClose);
  useEffect(() => {
    close.current = onClose;
  });

  useEffect(() => {
    if (!open) return;
    function onPointerDown(event: PointerEvent) {
      const target = event.target as Node;
      if (panelRef.current?.contains(target) || triggerRef.current?.contains(target)) return;
      close.current();
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key !== "Escape") return;
      close.current();
      triggerRef.current?.focus();
    }
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open, panelRef, triggerRef]);
}

/** Frosted panel shared by the header popovers; grows from the top-right.
    On phones it spans the screen 16px in from each edge, just under the
    header, since a panel hung from an icon that isn't the last one would
    run off the left side. */
export const popoverPanelClass =
  "material-bar absolute top-[calc(100%+10px)] right-0 z-40 max-w-[calc(100vw-32px)] origin-top-right rounded-[18px] shadow-raised motion-safe:animate-pop max-sm:fixed max-sm:inset-x-4 max-sm:top-[calc(env(safe-area-inset-top)+60px)] max-sm:w-auto max-sm:max-w-none";
