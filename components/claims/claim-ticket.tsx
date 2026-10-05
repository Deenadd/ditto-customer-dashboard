"use client";

import { useEffect, useRef, useState } from "react";
import { animate, useReducedMotion } from "motion/react";
import { Button } from "@/components/ui/buttons";
import { categoryLabel, formatDate, type Claim } from "@/lib/claims";

/*
 * The claim ticket, printed once a claim is sent, after a receipt-print
 * animation (msbr_dev on X). A printer slot sits on top; the ticket feeds
 * down out of it in a few quick pulls, as a thermal printer does, so its
 * foot shows first; then a "Request received" stamp lands on it.
 *
 * It runs once per claim and on Print again, a rare moment, so it can take
 * its time (about 2.6s) and carry a little bounce on the stamp. Reduced
 * motion shows the finished ticket with a short fade. The paper moves by
 * transform only; the slot clips it, so it never covers the page.
 */

/* Feed in pulls with short pauses, by share of the ticket's height hidden. */
const FEED = {
  transform: ["translateY(-100%)", "translateY(-74%)", "translateY(-72%)", "translateY(-44%)", "translateY(-42%)", "translateY(-14%)", "translateY(-12%)", "translateY(0%)"],
};
const FEED_TIMES = [0, 0.22, 0.3, 0.52, 0.6, 0.82, 0.9, 1];
const FEED_MS = 2100;

/** Bars from the reference, so every ticket's barcode is its own and stable. */
function bars(seed: string) {
  let h = 2166136261;
  for (const c of seed) h = Math.imul(h ^ c.charCodeAt(0), 16777619);
  const out: number[] = [];
  for (let i = 0; i < 46; i++) {
    h = Math.imul(h ^ (h >>> 13), 1274126177);
    out.push(1 + ((h >>> 0) % 3));
  }
  return out;
}

function Barcode({ value }: { value: string }) {
  const widths = bars(value);
  /* Each bar starts where the ones before it end. */
  const starts = widths.map((_, i) => widths.slice(0, i).reduce((sum, w) => sum + w, 0));
  const total = starts[starts.length - 1] + widths[widths.length - 1];
  return (
    <svg aria-hidden viewBox={`0 0 ${total} 36`} preserveAspectRatio="none" className="h-9 w-full fill-label">
      {widths.map((w, i) => (i % 2 === 0 ? <rect key={i} x={starts[i]} y={0} width={w} height={36} /> : null))}
    </svg>
  );
}

export function ClaimTicket({
  claim,
  policyName,
  onView,
}: {
  claim: Claim;
  policyName: string;
  onView: () => void;
}) {
  const reduced = !!useReducedMotion();
  const paperRef = useRef<HTMLDivElement>(null);
  const stampRef = useRef<HTMLDivElement>(null);
  const printerRef = useRef<HTMLDivElement>(null);
  const [run, setRun] = useState(0);
  const [done, setDone] = useState(false);
  const viewRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const paper = paperRef.current;
    const stamp = stampRef.current;
    const printer = printerRef.current;
    if (!paper || !stamp || !printer) return;
    let cancelled = false;
    const controls: { stop: () => void }[] = [];

    if (reduced) {
      paper.style.transform = "none";
      stamp.style.opacity = "1";
      stamp.style.transform = "rotate(-10deg)";
      controls.push(animate(paper, { opacity: [0, 1] }, { duration: 0.25 }));
      const t = window.setTimeout(() => setDone(true), 250);
      return () => window.clearTimeout(t);
    }

    paper.style.opacity = "1";
    stamp.style.opacity = "0";
    controls.push(animate(paper, FEED, { duration: FEED_MS / 1000, times: FEED_TIMES, ease: "easeOut" }));
    /* The printer hums while it feeds. */
    controls.push(
      animate(printer, { transform: ["translateY(0px)", "translateY(0.6px)", "translateY(0px)"] }, { duration: 0.12, repeat: 16, ease: "linear" }),
    );
    const stampAt = window.setTimeout(() => {
      if (cancelled) return;
      controls.push(
        animate(
          stamp,
          { opacity: [0, 1], transform: ["scale(1.9) rotate(-22deg)", "scale(1) rotate(-10deg)"] },
          { type: "spring", duration: 0.45, bounce: 0.35 },
        ),
      );
      /* The paper takes the knock. */
      controls.push(
        animate(paper, { transform: ["translateY(0px)", "translateY(3px)", "translateY(0px)"] }, { duration: 0.22, delay: 0.12, ease: "easeOut" }),
      );
      window.setTimeout(() => !cancelled && setDone(true), 420);
    }, FEED_MS + 150);

    return () => {
      cancelled = true;
      window.clearTimeout(stampAt);
      controls.forEach((c) => c.stop());
    };
  }, [run, reduced]);

  /* Once printed, the main action takes focus. */
  useEffect(() => {
    if (done) viewRef.current?.focus({ preventScroll: true });
  }, [done]);

  const rows = [
    { label: "Patient", value: `${claim.patient.name} (${claim.patient.relation})` },
    { label: "Treatment", value: claim.treatment },
    { label: "Type", value: `Cashless · ${categoryLabel(claim.category)}` },
    { label: "Hospital", value: claim.hospital?.name ?? "Not chosen yet" },
    { label: "Admission", value: claim.admission ? formatDate(claim.admission) : "Not decided yet" },
  ];

  return (
    <div className="flex flex-col items-center pt-2 pb-[calc(128px+env(safe-area-inset-bottom))]">
      <p role="status" className="sr-only">
        {done ? `Claim request sent. Your reference is ${claim.id}.` : "Printing your claim ticket."}
      </p>
      <h1 aria-hidden={!done} className="text-center text-[28px] leading-[34px] font-bold tracking-[-0.025em] text-label">
        {done ? "Claim request sent" : "Printing your ticket…"}
      </h1>
      <p className="mt-1.5 min-h-10 max-w-[340px] text-center text-[15px] leading-5 text-pretty text-label-secondary">
        {done ? "Show this ticket at the hospital's insurance desk. We'll keep you posted on every step." : " "}
      </p>

      {/* The printer: a dark slot the ticket feeds out of. */}
      <div className="relative mt-7 w-full max-w-[340px]">
        <div
          ref={printerRef}
          aria-hidden
          className="relative z-10 h-[26px] rounded-[13px] bg-[linear-gradient(180deg,#3a3a3c,#1d1d1f_60%,#111113)] shadow-[0_1px_0_rgb(255_255_255_/_0.12)_inset,0_8px_18px_-6px_rgb(0_0_0_/_0.45),0_2px_4px_rgb(0_0_0_/_0.2)]"
        >
          <span className="absolute inset-x-5 top-[15px] h-[3px] rounded-full bg-black shadow-[0_1px_0_rgb(255_255_255_/_0.08)]" />
          <span
            className={`absolute top-[9px] right-4 size-1.5 rounded-full transition-colors duration-300 ${done ? "bg-[#34c759]" : "animate-pulse bg-[#ff9f0a]"}`}
          />
        </div>

        {/* The slot clips the ticket, so it appears to come out of it. */}
        <div className="relative -mt-[9px] overflow-hidden px-5 pb-6">
          <div ref={paperRef} className="[filter:drop-shadow(0_1px_1px_rgb(0_0_0_/_0.06))_drop-shadow(0_8px_16px_rgb(0_0_0_/_0.08))]" style={{ transform: "translateY(-100%)" }}>
            <div className="ticket-paper relative bg-white px-5 pt-6 pb-8 font-mono text-[12px] leading-[18px] text-label">
              <div className="flex items-center justify-between">
                <span className="font-sans text-[17px] font-bold tracking-[-0.02em]">ditto</span>
                <span className="text-[11px] tracking-[0.08em] text-label-secondary uppercase">Claim ticket</span>
              </div>
              <div className="mt-4 border-t border-dashed border-black/20" />
              <p className="mt-4 text-[11px] tracking-[0.08em] text-label-secondary uppercase">Reference</p>
              <p className="text-[26px] leading-8 font-semibold tracking-[0.04em] tabular-nums">{claim.id}</p>
              <p className="mt-1 text-[11px] leading-4 text-label-secondary">{policyName}</p>
              <div className="mt-4 border-t border-dashed border-black/20" />
              <dl className="mt-3 flex flex-col gap-1.5">
                {rows.map((row) => (
                  <div key={row.label} className="flex justify-between gap-4">
                    <dt className="shrink-0 text-label-secondary">{row.label}</dt>
                    <dd className="min-w-0 text-right break-words">{row.value}</dd>
                  </div>
                ))}
              </dl>
              <div className="mt-4 border-t border-dashed border-black/20" />
              <div className="mt-4">
                <Barcode value={claim.id} />
                <p className="mt-1.5 text-center text-[11px] tracking-[0.3em] tabular-nums">{claim.id}</p>
              </div>
              <p className="mt-3 text-center text-[11px] leading-4 text-label-secondary">
                Requested {formatDate(claim.createdAt)} · Show at the insurance desk
              </p>

              <div
                ref={stampRef}
                aria-hidden
                className="pointer-events-none absolute top-[84px] right-4 rounded-[8px] border-[2.5px] border-[#1d7a3a] px-2.5 py-1 text-center font-sans text-[12px] leading-4 font-bold tracking-[0.1em] text-[#1d7a3a] uppercase opacity-0 mix-blend-multiply"
                style={{ transform: "rotate(-10deg)" }}
              >
                Request
                <br />
                received
              </div>
            </div>
          </div>
        </div>
      </div>

      <div
        className={`mt-1 flex w-full max-w-[340px] flex-col gap-2 transition-[opacity,transform] duration-300 ease-out ${
          done ? "opacity-100" : "pointer-events-none translate-y-1 opacity-0"
        }`}
        inert={!done}
      >
        <Button ref={viewRef} size="large" className="w-full" onClick={onView}>
          View claim
        </Button>
        <Button
          variant="plain"
          size="large"
          className="w-full"
          onClick={() => {
            setDone(false);
            setRun((n) => n + 1);
          }}
        >
          Print again
        </Button>
      </div>
    </div>
  );
}
