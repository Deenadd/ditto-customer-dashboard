"use client";

import { useEffect, useRef } from "react";

/**
 * Edge progressive blur, fixed to the viewport, as on Deena's portfolio
 * (deena-portfolio, ProgressiveBlurTool). Content scrolling past either edge
 * softens into the page instead of being cut by the window or the header.
 *
 * Technique adapted from Skiper UI — Skiper 41 "ProgressiveBlur" by
 * @gurvinder-singh02 (https://gxuri.me), inspired by devouringdetails.com;
 * free for personal and commercial use with attribution to Skiper UI.
 * One layer per edge: a gradient into the page colour, blurred through
 * backdrop-filter, masked so the blur holds for the outer half and
 * dissolves inward. Same values as the portfolio: top 150px, bottom 80px,
 * 4px blur, full-strength fade.
 *
 * The top edge sits behind the header and fades in over the first 80px of
 * scroll, so at rest the header floats on the plain page and nothing is
 * smeared; once content scrolls under it, the blur takes over from a hard
 * divider.
 */
export function ProgressiveBlur() {
  const topRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const top = topRef.current;
      if (top) top.style.opacity = String(Math.min(Math.max(window.scrollY / 80, 0), 1));
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return (
    <>
      <div
        ref={topRef}
        aria-hidden
        style={{ opacity: 0 }}
        className="progressive-blur-top pointer-events-none fixed inset-x-0 top-0 z-[25] h-[120px] select-none sm:h-[150px]"
      />
      <div
        aria-hidden
        className="progressive-blur-bottom pointer-events-none fixed inset-x-0 bottom-0 z-20 h-20 select-none"
      />
    </>
  );
}
