import type { ReactNode } from "react";

/** A grey placeholder in the shape of what's loading. It pulses gently;
    under Reduce motion it holds still. */
export function Bone({ className = "" }: { className?: string }) {
  return <span aria-hidden className={`block animate-pulse rounded-[8px] bg-fill-strong/70 ${className}`} />;
}

/** Wraps placeholders so assistive tech hears what's coming, once. */
export function Loading({ label, className = "", children }: { label: string; className?: string; children: ReactNode }) {
  return (
    <div aria-busy="true" className={className}>
      <span className="sr-only">{label}</span>
      {children}
    </div>
  );
}
