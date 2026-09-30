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

/** Arc floating layer shared by the header menus; grows from the top-right. */
export const popoverPanelClass =
  "absolute top-[calc(100%+8px)] right-0 z-40 max-w-[calc(100vw-32px)] origin-top-right rounded-panel border border-separator bg-surface shadow-floating motion-safe:animate-pop";
