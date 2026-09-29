/**
 * Bottom-edge progressive blur, fixed to the viewport, as on Deena's
 * portfolio (deena-portfolio, ProgressiveBlurTool). Content scrolling off
 * the bottom softens into the page instead of being cut by the window edge.
 *
 * Technique adapted from Skiper UI — Skiper 41 "ProgressiveBlur" by
 * @gurvinder-singh02 (https://gxuri.me), inspired by devouringdetails.com;
 * free for personal and commercial use with attribution to Skiper UI.
 * One layer: a gradient into the page colour, blurred through
 * backdrop-filter, masked so the blur holds for the outer half and
 * dissolves inward. Same values as the portfolio: 80px tall, 4px blur.
 */
export function ProgressiveBlur() {
  return (
    <div
      aria-hidden
      className="progressive-blur-bottom pointer-events-none fixed inset-x-0 bottom-0 z-20 h-20 select-none"
    />
  );
}
