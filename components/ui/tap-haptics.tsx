"use client";

import { useEffect } from "react";
import { haptic, lastHapticAt } from "@/lib/haptics";

const tappable = 'button, a[href], label, summary, [role="button"], [role="tab"], input[type="checkbox"], input[type="radio"]';

/**
 * A light tick on every tap of a control on a touch screen: buttons, links,
 * choices and tabs, as native controls tick. It listens once, on the
 * document, and plays inside the tap so iOS Safari allows it. A control that
 * has just played its own haptic (a code right or wrong, a copy) is left to
 * it, and so is a label's echo click on its input.
 */
export function TapHaptics() {
  useEffect(() => {
    if (!window.matchMedia("(pointer: coarse)").matches) return;
    const onClick = (event: MouseEvent) => {
      const target = event.target as Element | null;
      if (!target || target.closest("head")) return;
      const control = target.closest(tappable);
      if (!control || control.matches(":disabled, [aria-disabled='true']")) return;
      if (performance.now() - lastHapticAt < 80) return;
      haptic("selection");
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);
  return null;
}
