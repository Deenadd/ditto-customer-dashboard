"use client";

import Link from "next/link";
import { useLayoutEffect, useRef, useState, type ReactNode } from "react";

export type Segment = {
  value: string;
  href: string;
  label: ReactNode;
};

const reduceMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/**
 * An iOS segmented control whose segments are links, so each view keeps its
 * own URL. The white thumb moves as soon as a segment is chosen — before the
 * next page arrives — and slides from wherever it is, so a quick second choice
 * redirects it mid-flight instead of waiting.
 */
export function SegmentedLinks({
  label,
  value,
  segments,
  size = "regular",
}: {
  label: string;
  value: string;
  segments: Segment[];
  size?: "regular" | "small";
}) {
  const [pressed, setPressed] = useState<string | null>(null);
  const [lastValue, setLastValue] = useState(value);
  /* When the page catches up, the URL becomes the source of truth again. */
  if (value !== lastValue) {
    setLastValue(value);
    setPressed(null);
  }
  const selected = pressed ?? value;

  const thumbRef = useRef<HTMLSpanElement>(null);
  const lastRect = useRef<DOMRect | null>(null);

  useLayoutEffect(() => {
    const thumb = thumbRef.current;
    if (!thumb) return;
    const next = thumb.getBoundingClientRect();
    const previous = lastRect.current;
    lastRect.current = next;
    if (!previous || previous.left === next.left || reduceMotion()) return;
    thumb.animate(
      [
        {
          transform: `translateX(${previous.left - next.left}px) scaleX(${previous.width / next.width})`,
        },
        { transform: "none" },
      ],
      { duration: 320, easing: "cubic-bezier(0.23, 1, 0.32, 1)" },
    );
  }, [selected]);

  const small = size === "small";

  return (
    /* The scroller clips on both axes, so it gets room for the thumb's shadow,
       taken back with a matching negative margin so the layout doesn't move. */
    <nav
      aria-label={label}
      className="-m-3 max-w-[calc(100%+24px)] overflow-x-auto overscroll-x-contain p-3"
    >
      <ul
        className={`inline-flex rounded-control bg-fill-strong p-[3px] ${small ? "h-8" : "h-9"}`}
      >
        {segments.map((segment) => {
          const current = segment.value === selected;
          return (
            <li key={segment.value} className="relative flex">
              {current ? (
                <span
                  ref={thumbRef}
                  aria-hidden
                  className="absolute inset-0 origin-left rounded-control-inner bg-surface shadow-thumb"
                />
              ) : null}
              <Link
                href={segment.href}
                scroll={false}
                aria-current={segment.value === value ? "page" : undefined}
                onClick={(event) => {
                  if (event.metaKey || event.ctrlKey || event.shiftKey) return;
                  /* Start from where the thumb is on screen, even mid-slide. */
                  if (thumbRef.current) {
                    lastRect.current = thumbRef.current.getBoundingClientRect();
                  }
                  setPressed(segment.value);
                }}
                className={`relative flex items-center gap-1.5 rounded-control-inner font-medium whitespace-nowrap transition-colors duration-150 ${
                  small ? "px-3 text-[13px]" : "px-4 text-[14px]"
                } ${
                  current
                    ? "text-label"
                    : "text-label-secondary active:bg-black/[0.05] [@media(hover:hover)]:hover:text-label"
                }`}
              >
                {segment.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
