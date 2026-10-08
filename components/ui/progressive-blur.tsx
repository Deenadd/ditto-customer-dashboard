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
 * Both edges are a pure progressive blur (below): the top a 20px band under
 * the header, the bottom 72px. The bottom stays shorter than the pages' 80px
 * of bottom padding, so at the end of a page the last row sits clear of it
 * instead of staying soft, as if the page wouldn't scroll any further.
 *
 * The top edge sits behind the header and fades in over the first 80px of
 * scroll, so at rest the header floats on the plain page and nothing is
 * smeared; once content scrolls under it, the blur takes over from a hard
 * divider.
 */
/*
 * Both edges are a true progressive blur, with no colour wash: seven stacked
 * layers, each blurring twice as much as the last (0.5px to 32px), each
 * masked to its own band so the blur steps up smoothly toward the edge.
 * Neighbouring bands overlap, so there are no visible steps between them.
 */
const BLURS = [0.5, 1, 2, 4, 8, 16, 32];
const band = 100 / (BLURS.length + 1);

function layers(toward: "top" | "bottom") {
  /* Masks run away from the edge, so the strongest band touches it. */
  const direction = toward === "bottom" ? "to bottom" : "to top";
  return BLURS.map((blur, i) => {
    const image =
      i === BLURS.length - 1
        ? `linear-gradient(${direction}, transparent ${i * band}%, #000 ${(i + 1) * band}%)`
        : `linear-gradient(${direction}, transparent ${i * band}%, #000 ${(i + 1) * band}%, #000 ${(i + 2) * band}%, transparent ${Math.min(100, (i + 3) * band)}%)`;
    return {
      blur,
      style: {
        backdropFilter: `blur(${blur}px)`,
        WebkitBackdropFilter: `blur(${blur}px)`,
        maskImage: image,
        WebkitMaskImage: image,
      },
    };
  });
}

const topLayers = layers("top");
const bottomLayers = layers("bottom");

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
      {/* A short band right under the header, which is solid page colour:
          iOS 26 Safari tints the status bar from an opaque bar at the top,
          and content softens as it slides under it. */}
      <div
        ref={topRef}
        aria-hidden
        style={{ opacity: 0 }}
        className="pointer-events-none fixed inset-x-0 top-[calc(56px+env(safe-area-inset-top))] z-[25] h-5 select-none sm:top-[calc(64px+env(safe-area-inset-top))]"
      >
        {topLayers.map((layer) => (
          <div key={layer.blur} className="progressive-blur-layer absolute inset-0" style={layer.style} />
        ))}
      </div>
      {/* Not on touch screens: phone browsers blur content behind their own
          toolbar, and iOS Safari stops the page short of its floating toolbar
          (filling the gap with white) when anything fixed touches the bottom. */}
      <div aria-hidden className="pointer-events-none fixed inset-x-0 bottom-0 z-20 h-[calc(72px+env(safe-area-inset-bottom))] select-none [@media(pointer:coarse)]:hidden">
        {bottomLayers.map((layer) => (
          <div key={layer.blur} className="progressive-blur-layer absolute inset-0" style={layer.style} />
        ))}
      </div>
    </>
  );
}
