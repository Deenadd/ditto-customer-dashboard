"use client";

import { useEffect } from "react";

/*
 * Holds the page still behind a sheet or dialog. Locks are counted, so two
 * overlays can lock and unlock in any order.
 *
 * - overflow: hidden on <html> stops wheel, keyboard and (iOS 16+) touch
 *   scrolling, with the scrollbar's width put back as padding so nothing
 *   shifts sideways.
 * - A touchmove guard covers older iOS, which scrolls the page through
 *   overflow: hidden. Touches inside an element marked
 *   [data-scroll-lock-scrollable] still scroll it, unless it is already at
 *   the end in that direction, which would chain to the page.
 */
let locks = 0;
let saved: { overflow: string; paddingRight: string } | null = null;
let startY = 0;

function onTouchStart(event: TouchEvent) {
  startY = event.touches[0]?.clientY ?? 0;
}

function onTouchMove(event: TouchEvent) {
  const target = event.target as Element | null;
  const scroller = target?.closest<HTMLElement>("[data-scroll-lock-scrollable]");
  if (scroller) {
    const dy = (event.touches[0]?.clientY ?? 0) - startY;
    const atTop = scroller.scrollTop <= 0 && dy > 0;
    const atBottom = scroller.scrollTop + scroller.clientHeight >= scroller.scrollHeight - 1 && dy < 0;
    if (!atTop && !atBottom) return;
  }
  if (event.cancelable) event.preventDefault();
}

function lock() {
  if (locks++ > 0) return;
  const root = document.documentElement;
  const gap = window.innerWidth - root.clientWidth;
  saved = { overflow: root.style.overflow, paddingRight: document.body.style.paddingRight };
  root.style.overflow = "hidden";
  if (gap > 0) document.body.style.paddingRight = `${gap}px`;
  document.addEventListener("touchstart", onTouchStart, { passive: true });
  document.addEventListener("touchmove", onTouchMove, { passive: false });
}

function unlock() {
  if (--locks > 0 || !saved) return;
  document.documentElement.style.overflow = saved.overflow;
  document.body.style.paddingRight = saved.paddingRight;
  saved = null;
  document.removeEventListener("touchstart", onTouchStart);
  document.removeEventListener("touchmove", onTouchMove);
}

export function useScrollLock(active: boolean) {
  useEffect(() => {
    if (!active) return;
    lock();
    return unlock;
  }, [active]);
}

/** For a native <dialog>: lock while it's open. Call with its open state. */
export { lock as lockScroll, unlock as unlockScroll };
