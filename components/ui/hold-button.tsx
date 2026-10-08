"use client";

import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { haptic } from "@/lib/haptics";

/* How long to hold. The fill is progress, so it runs linear over exactly
   this; letting go snaps it back fast. */
const HOLD_MS = 2000;
const RELEASE = "clip-path 200ms cubic-bezier(0.23, 1, 0.32, 1)";

/**
 * A destructive confirm you press and hold, so it can't fire by accident: a
 * solid red fill sweeps across the tinted button, left to right, wiping the
 * label from red to white as it goes (a second copy of the label, clipped,
 * so the colours change exactly at the edge). Let go early and it snaps
 * back, and the line under it says to keep holding. Mouse, touch, and the
 * keyboard (hold Space or Enter) all work; moving off it or scrolling
 * cancels. A light tap when the hold starts, a firmer one when it lands.
 */
export function HoldButton({
  label,
  icon,
  onConfirm,
}: {
  label: string;
  icon?: ReactNode;
  onConfirm: () => void;
}) {
  const [holding, setHolding] = useState(false);
  const [early, setEarly] = useState(false);
  const timer = useRef<number | undefined>(undefined);
  const startedAt = useRef(0);
  const done = useRef(false);
  const hintId = useId();

  useEffect(() => () => window.clearTimeout(timer.current), []);

  function start() {
    if (done.current || timer.current !== undefined) return;
    setEarly(false);
    setHolding(true);
    startedAt.current = performance.now();
    haptic("light");
    timer.current = window.setTimeout(() => {
      done.current = true;
      haptic("success");
      onConfirm();
    }, HOLD_MS);
  }

  function stop() {
    if (timer.current === undefined || done.current) return;
    window.clearTimeout(timer.current);
    timer.current = undefined;
    setHolding(false);
    setEarly(performance.now() - startedAt.current < HOLD_MS);
  }

  const face = (
    <>
      {icon}
      {label}
    </>
  );

  return (
    <div className="flex w-full flex-col items-center">
      <button
        type="button"
        aria-describedby={hintId}
        onPointerDown={(event) => {
          if (event.button === 0) start();
        }}
        onPointerUp={stop}
        onPointerLeave={stop}
        onPointerCancel={stop}
        onKeyDown={(event) => {
          if ((event.key === " " || event.key === "Enter") && !event.repeat) {
            event.preventDefault();
            start();
          }
        }}
        onKeyUp={(event) => {
          if (event.key === " " || event.key === "Enter") stop();
        }}
        onBlur={stop}
        onContextMenu={(event) => event.preventDefault()}
        className={`relative isolate h-12 w-full overflow-hidden rounded-control bg-red-tint text-[17px] font-medium tracking-[-0.01em] text-red-text select-none [-webkit-touch-callout:none] [touch-action:manipulation] transition-transform duration-150 ease-out focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-text ${
          holding ? "scale-[0.97]" : ""
        }`}
      >
        <span className="flex h-full items-center justify-center gap-2">{face}</span>
        <span
          aria-hidden
          className="absolute inset-0 flex items-center justify-center gap-2 bg-red-text text-white"
          style={{
            clipPath: holding ? "inset(0 0 0 0)" : "inset(0 100% 0 0)",
            transition: holding ? `clip-path ${HOLD_MS}ms linear` : RELEASE,
          }}
        >
          {face}
        </span>
      </button>
      <p id={hintId} role="status" className="mt-2 text-[12px] leading-4 text-label-secondary">
        {early ? "Keep holding until it fills." : "Press and hold to delete."}
      </p>
    </div>
  );
}
