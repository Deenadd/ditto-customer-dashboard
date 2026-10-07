"use client";

import { useEffect, useRef, useState } from "react";
import { animate, useReducedMotion } from "motion/react";
import { TicketControls } from "@/components/claims/ticket-controls";
import { useTicketConfig } from "@/components/claims/ticket-config";
import { Asset } from "@/components/ui/asset";
import { Button } from "@/components/ui/buttons";
import { haptic } from "@/lib/haptics";
import { categoryLabel, formatDate, rupees, type Claim } from "@/lib/claims";

/*
 * The claim ticket, printed once a claim is sent, after a receipt-print
 * animation (msbr_dev on X). A printer slot sits on top; the ticket feeds
 * down out of it in a few quick pulls, as a thermal printer does, so its
 * foot shows first; then the round "Request received" stamp
 * (public/claims/stamp-received.svg) lands on it.
 *
 * It runs once per claim and on Print again, a rare moment, so it can take
 * its time (about 2.6s) and carry a little bounce on the stamp. Every value
 * comes from TicketConfig, tuned in the print panel (Shift+Option+C). Reduced
 * motion shows the finished ticket with a short fade. The paper moves by
 * transform only; the slot clips it, so it never covers the page.
 */

/* Pulls mode: the paper moves for part of each pull and rests for the rest,
   from fully hidden (-100%) to out (0%). */
function pullKeyframes(pulls: number, pause: number) {
  const values = ["translateY(-100%)"];
  const times = [0];
  for (let k = 1; k <= pulls; k++) {
    const start = (k - 1) / pulls;
    const at = `translateY(${-100 + (100 * k) / pulls}%)`;
    values.push(at);
    times.push(start + (1 - pause) / pulls);
    if (k < pulls) {
      values.push(at);
      times.push(k / pulls);
    }
  }
  times[times.length - 1] = 1;
  return { values, times };
}

/* A spring that runs at `speed` (0.25 is four times slower): time scales by
   1/speed when stiffness scales by speed² and damping by speed. */
const slowed = (stiffness: number, damping: number, mass: number, speed: number) => ({
  type: "spring" as const,
  stiffness: stiffness * speed * speed,
  damping: damping * speed,
  mass,
});

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
  const [copied, setCopied] = useState(false);

  async function copyReference() {
    /* The tap plays first, inside the click: after the await it's too late. */
    haptic("success");
    try {
      await navigator.clipboard.writeText(claim.id);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      /* Clipboard blocked; the reference is on screen to read. */
    }
  }

  /* Tap the stamp once the ticket is out and it stamps again, with the
     same knock and tap. */
  function restamp() {
    const stamp = stampRef.current;
    const paper = paperRef.current;
    if (!stamp || !paper || reduced) return;
    const c = configRef.current;
    haptic("medium");
    animate(stamp, { transform: [`scale(1.12) rotate(${c.stampTilt - 3}deg)`, `scale(1) rotate(${c.stampTilt}deg)`] }, { type: "spring", duration: 0.35, bounce: 0.3 });
    if (c.knock > 0) animate(paper, { transform: ["translateY(0px)", `translateY(${c.knock}px)`, "translateY(0px)"] }, { duration: 0.22, ease: "easeOut" });
  }

  /* The latest tuning, read when a print starts, so dragging a slider
     doesn't restart the print; Print again plays the new values. */
  const config = useTicketConfig();
  const configRef = useRef(config);
  useEffect(() => {
    configRef.current = config;
  });

  useEffect(() => {
    const paper = paperRef.current;
    const stamp = stampRef.current;
    const printer = printerRef.current;
    if (!paper || !stamp || !printer) return;
    const c = configRef.current;
    let cancelled = false;
    const controls: { stop: () => void }[] = [];
    const timers: number[] = [];
    const later = (ms: number, fn: () => void) => timers.push(window.setTimeout(() => !cancelled && fn(), ms));

    if (reduced) {
      paper.style.transform = "none";
      stamp.style.opacity = "1";
      stamp.style.transform = `rotate(${c.stampTilt}deg)`;
      controls.push(animate(paper, { opacity: [0, 1] }, { duration: 0.25 }));
      later(250, () => setDone(true));
      return () => {
        cancelled = true;
        timers.forEach(window.clearTimeout);
      };
    }

    const speed = c.speed;
    const setFeed = (share: number) => (paper.style.transform = `translateY(${(share - 1) * 100}%)`);
    const setStamp = (v: number) => {
      const scale = c.stampFrom + (1 - c.stampFrom) * v;
      const tilt = c.stampTiltFrom + (c.stampTilt - c.stampTiltFrom) * v;
      stamp.style.transform = `scale(${scale}) rotate(${tilt}deg)`;
      stamp.style.opacity = String(Math.min(1, Math.max(0, v * 4)));
    };
    paper.style.opacity = "1";
    setFeed(0);
    setStamp(0);

    /* The printer hums while it feeds. */
    const hum =
      c.hum > 0
        ? animate(
            printer,
            { transform: ["translateY(0px)", `translateY(${c.hum}px)`, "translateY(0px)"] },
            { duration: c.humSpeed / 1000 / speed, repeat: Infinity, ease: "linear" },
          )
        : null;
    if (hum) controls.push(hum);

    function stampIt() {
      later(c.stampDelay / speed, () => {
        controls.push(
          animate(0, 1, {
            ...slowed(c.stampStiffness, c.stampDamping, c.stampMass, speed),
            onUpdate: setStamp,
          }),
        );
        /* The stamp lands with a firm tap you can feel. */
        later(90 / speed, () => haptic("medium"));
        /* The paper takes the knock as the stamp lands. */
        if (c.knock > 0)
          later(90 / speed, () =>
            controls.push(
              animate(paper, { transform: ["translateY(0px)", `translateY(${c.knock}px)`, "translateY(0px)"] }, { duration: 0.22 / speed, ease: "easeOut" }),
            ),
          );
        later(420 / speed, () => setDone(true));
      });
    }

    function fed() {
      if (cancelled) return;
      hum?.stop();
      printer!.style.transform = "none";
      setFeed(1);
      stampIt();
    }

    if (c.feedMode === "spring") {
      haptic("selection");
      const feed = animate(0, 1, { ...slowed(c.feedStiffness, c.feedDamping, c.feedMass, speed), onUpdate: setFeed });
      controls.push(feed);
      feed.then(fed);
    } else {
      const pulls = Math.max(1, Math.round(c.pulls));
      const { values, times } = pullKeyframes(pulls, c.pause);
      /* A light tick as each pull starts, like the printer's motor. */
      for (let k = 0; k < pulls; k++) later(((k / pulls) * c.feedDuration) / speed, () => haptic("selection"));
      const feed = animate(paper, { transform: values }, { duration: c.feedDuration / 1000 / speed, times, ease: "easeOut" });
      controls.push(feed);
      feed.then(fed);
    }

    return () => {
      cancelled = true;
      timers.forEach(window.clearTimeout);
      controls.forEach((ctl) => ctl.stop());
    };
  }, [run, reduced]);

  /* Shift+Option+C toggles the print panel. */
  const [panel, setPanel] = useState(false);
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (!(event.altKey && event.shiftKey && event.code === "KeyC")) return;
      event.preventDefault();
      setPanel((open) => !open);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);
  const replay = () => {
    setDone(false);
    setRun((n) => n + 1);
  };

  /* Once printed, the main action takes focus. */
  useEffect(() => {
    if (done) viewRef.current?.focus({ preventScroll: true });
  }, [done]);

  const rows =
    claim.type === "reimbursement"
      ? [
          { label: "Patient", value: `${claim.patient.name} (${claim.patient.relation})` },
          { label: "Treatment", value: claim.treatment },
          { label: "Type", value: `Reimbursement · ${categoryLabel(claim.category)}` },
          { label: "Hospital", value: claim.hospital?.name ?? "" },
          {
            label: "Stay",
            value: claim.admission && claim.discharge ? `${formatDate(claim.admission)} – ${formatDate(claim.discharge)}` : "",
          },
          { label: "Amount", value: rupees(claim.amount ?? 0) },
          { label: "Documents", value: `${Object.values(claim.documents ?? {}).flat().length} files` },
        ]
      : [
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
        {done
          ? claim.type === "reimbursement"
            ? "We'll review your documents within two working days and keep you posted on every step."
            : "Show this ticket at the hospital's insurance desk. We'll keep you posted on every step."
          : " "}
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

        {/* The slot clips the ticket's top edge only, so it appears to come
            out of it and its shadows can still spread to the sides and below. */}
        <div className="relative -mt-[9px] px-5 pb-8 [clip-path:inset(0_-48px_-400px_-48px)]">
          <div ref={paperRef} className="relative isolate" style={{ transform: "translateY(-100%)" }}>
            {/* Curl: thermal paper lifts at its bottom corners, so the
                shadow runs longer and softer there than along the sides. */}
            <span
              aria-hidden
              className="pointer-events-none absolute inset-x-1 -bottom-2 -z-10 h-10 blur-[7px] [background:radial-gradient(45%_75%_at_6%_35%,rgb(0_0_0_/_0.28),transparent_70%),radial-gradient(45%_75%_at_94%_35%,rgb(0_0_0_/_0.28),transparent_70%)]"
            />
            {/* Held, the ticket lifts off the page a little, as paper does
                when you pick it up; let go and it settles. */}
            <div className="transition-[transform,filter] duration-200 ease-out [filter:drop-shadow(0_0.5px_0.5px_rgb(0_0_0_/_0.16))_drop-shadow(0_3px_5px_rgb(0_0_0_/_0.07))_drop-shadow(0_14px_22px_rgb(0_0_0_/_0.09))] [@media(pointer:coarse)]:active:-translate-y-0.5 [@media(pointer:coarse)]:active:scale-[1.012] [@media(pointer:coarse)]:active:[filter:drop-shadow(0_1px_1px_rgb(0_0_0_/_0.14))_drop-shadow(0_8px_12px_rgb(0_0_0_/_0.09))_drop-shadow(0_24px_34px_rgb(0_0_0_/_0.12))]">
            <div className="ticket-paper relative bg-white px-5 pt-6 pb-8 font-mono text-[12px] leading-[18px] text-label">
              <div className="flex items-center justify-between">
                <span className="font-sans text-[17px] font-bold tracking-[-0.02em]">ditto</span>
                <span className="text-[11px] tracking-[0.08em] text-label-secondary uppercase">Claim ticket</span>
              </div>
              <div className="mt-4 border-t border-dashed border-black/20" />
              <p className="mt-4 text-[11px] tracking-[0.08em] text-label-secondary uppercase" aria-live="polite">
                {copied ? "Copied" : "Reference"}
              </p>
              {/* Tap the reference to copy it, for the hospital desk or a call. */}
              <button
                type="button"
                onClick={copyReference}
                aria-label={`Copy reference ${claim.id}`}
                className="-mx-1 rounded-[6px] px-1 text-left text-[26px] leading-8 font-semibold tracking-[0.04em] tabular-nums transition-colors duration-150 active:bg-black/[0.06] [@media(hover:hover)]:hover:bg-black/[0.04]"
              >
                {claim.id}
              </button>
              <p className="mt-1 text-[11px] leading-4 text-label-secondary">{policyName}</p>
              <div className="mt-4 border-t border-dashed border-black/20" />
              <dl className="mt-3 flex flex-col gap-1.5">
                {rows.filter((row) => row.value).map((row) => (
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
                Requested {formatDate(claim.createdAt)}{claim.type === "reimbursement" ? " · Keep the originals" : " · Show at the insurance desk"}
              </p>

              {/* The round Request received stamp in deep ink green, inked: it multiplies
                  into the paper, so the print shows through where it's thin. */}
              <div
                ref={stampRef}
                aria-hidden
                onClick={done ? restamp : undefined}
                className={`absolute top-[52px] right-0 opacity-0 mix-blend-multiply ${done ? "cursor-pointer" : "pointer-events-none"}`}
                style={{ transform: "rotate(-10deg)" }}
              >
                <Asset src="/claims/stamp-received.svg" className="size-[140px]" />
              </div>

              {/* Fresh, clean paper: only the printer's lip shades its top
                  edge, where it comes out of the slot. */}
              <span
                aria-hidden
                className="pointer-events-none absolute inset-0 [background:linear-gradient(to_bottom,rgb(0_0_0_/_0.06),transparent_16px)]"
              />
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
          onClick={replay}
        >
          Print again
        </Button>
      </div>
      <TicketControls open={panel} onClose={() => setPanel(false)} onReplay={replay} />
    </div>
  );
}
