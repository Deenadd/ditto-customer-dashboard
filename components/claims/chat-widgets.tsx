"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Button } from "@/components/ui/buttons";
import { IconCheck } from "@/components/ui/icons";
import { hospitals, type Hospital } from "@/lib/claims";
import type { WidgetId } from "@/lib/claims-flow";

/**
 * Answers you can explore inside the claims chat, rather than read. Each
 * sits where an outcome card would and can move the conversation on through
 * `onAnswer`. Once the conversation has moved past it, `active` is false and
 * it stays as a record of what you chose, no longer interactive.
 */
export type WidgetProps = {
  active: boolean;
  onAnswer: (label: string, next: string) => void;
};

const card =
  "ml-10 rounded-[14px] bg-surface p-4 shadow-tile max-[380px]:ml-0";

export function ChatWidget({ widget, ...props }: WidgetProps & { widget: WidgetId }) {
  if (widget === "network-check") return <NetworkCheck {...props} />;
  return <StayWindow {...props} />;
}

/** Search the network; the pick says whether cashless works, then carries on. */
function NetworkCheck({ active, onAnswer }: WidgetProps) {
  const [query, setQuery] = useState("");
  const [picked, setPicked] = useState<Hospital | null>(null);
  const id = useId();
  const verdictRef = useRef<HTMLDivElement>(null);
  const nextRef = useRef<HTMLDivElement>(null);
  const q = query.trim().toLowerCase();

  /* The verdict and the way on land below the fold; bring them into view. */
  useEffect(() => {
    if (picked) (nextRef.current ?? verdictRef.current)?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [picked]);
  const results = q
    ? hospitals.filter((h) => [h.name, h.address, h.city, h.pin].some((f) => f.toLowerCase().includes(q))).slice(0, 4)
    : hospitals.slice(0, 4);

  return (
    <div className="flex flex-col gap-3" inert={!active}>
    <section aria-labelledby={`${id}-title`} className={card}>
      <h3 id={`${id}-title`} className="text-[15px] leading-5 font-semibold text-label">
        Check a hospital
      </h3>
      <label htmlFor={`${id}-q`} className="sr-only">
        Hospital, area or PIN
      </label>
      <input
        id={`${id}-q`}
        data-widget-focus
        type="search"
        value={query}
        onChange={(event) => {
          setQuery(event.target.value);
          setPicked(null);
        }}
        placeholder="Hospital, area or PIN"
        autoComplete="off"
        className="mt-3 h-11 w-full rounded-[12px] bg-fill px-3.5 text-[16px] leading-6 text-label placeholder:text-label-tertiary focus:bg-surface focus:shadow-[0_0_0_2px_var(--color-accent)] focus:outline-none"
      />
      <ul className="-mx-2 mt-2 flex flex-col" aria-label="Matching hospitals">
        {results.map((hospital) => {
          const chosen = picked?.id === hospital.id;
          return (
            <li key={hospital.id}>
              <button
                type="button"
                aria-pressed={chosen}
                onClick={() => setPicked(hospital)}
                className={`flex min-h-11 w-full items-center gap-3 rounded-[10px] px-2 py-2 text-left transition-colors duration-150 ${
                  chosen ? "bg-accent-tint/70" : "active:bg-fill [@media(hover:hover)]:hover:bg-fill"
                }`}
              >
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[14px] leading-5 font-medium text-label">{hospital.name}</span>
                  <span className="block truncate text-[12px] leading-4 text-label-secondary">
                    {hospital.city} {hospital.pin}
                  </span>
                </span>
                <span
                  className={`shrink-0 rounded-full px-2 py-0.5 text-[12px] leading-4 font-medium ${
                    hospital.network ? "bg-green-tint text-green-text" : "bg-grey-tint text-grey-text"
                  }`}
                >
                  {hospital.network ? "Cashless" : "Not in network"}
                </span>
              </button>
            </li>
          );
        })}
        {results.length === 0 ? (
          <li className="px-2 py-3 text-[13px] leading-[18px] text-label-secondary">
            No match in this sample list. The hospital&apos;s insurance desk can tell you, or ask a claims expert.
          </li>
        ) : null}
      </ul>

      <div ref={verdictRef} aria-live="polite" className="scroll-mb-6">
        {picked ? (
          <div className="mt-3 rounded-[12px] bg-fill p-3">
            <p className="flex items-start gap-2 text-[14px] leading-5 text-pretty text-label">
              {picked.network ? (
                <span aria-hidden className="mt-0.5 grid size-4 shrink-0 place-items-center rounded-full bg-green-text text-white">
                  <IconCheck size={11} />
                </span>
              ) : null}
              {picked.network
                ? `${picked.name} is in Care Health's network, so cashless works there.`
                : `${picked.name} isn't in Care Health's network. You'll pay first and claim the costs back.`}
            </p>
          </div>
        ) : null}
      </div>
      <p className="mt-3 text-[12px] leading-4 text-label-tertiary">A sample list for this prototype.</p>
    </section>

    {/* The way on sits under the card, lined up with its left edge, and
        names where the pick leads: cashless at a network hospital,
        reimbursement anywhere else. Only once a hospital is picked, and only
        while this is the conversation's current step. */}
    {picked && active ? (
      <div ref={nextRef} className="ml-10 scroll-mb-6 max-[380px]:ml-0">
        <Button
          key={picked.id}
          size="medium"
          className="motion-safe:animate-pop"
          onClick={() =>
            onAnswer(
              picked.network ? `${picked.name}, in the network` : `${picked.name}, not in the network`,
              picked.network ? "cashless" : "reimbursement",
            )
          }
        >
          {picked.network ? "Continue with cashless" : "Continue with reimbursement"}
        </Button>
      </div>
    ) : null}
    </div>
  );
}

const DAY = 86_400_000;
const iso = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
const fmt = (d: Date) => new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric" }).format(d);

/** Your admission date and stay, and the window of bills that count. */
function StayWindow({ active }: WidgetProps) {
  const id = useId();
  const [admission, setAdmission] = useState(() => iso(new Date(Date.now() + 7 * DAY)));
  const [nights, setNights] = useState(4);
  const admit = new Date(`${admission}T00:00:00`);
  const valid = !Number.isNaN(admit.getTime());
  const discharge = new Date(admit.getTime() + nights * DAY);
  const from = new Date(admit.getTime() - 60 * DAY);
  const until = new Date(discharge.getTime() + 90 * DAY);
  /* Segment widths in proportion to days, with a floor so a short stay
     stays visible. */
  const total = 60 + nights + 90;
  const stayShare = Math.max((nights / total) * 100, 6);
  const beforeShare = ((100 - stayShare) * 60) / 150;
  const afterShare = 100 - stayShare - beforeShare;

  return (
    <section aria-labelledby={`${id}-title`} className={card} inert={!active}>
      <h3 id={`${id}-title`} className="text-[15px] leading-5 font-semibold text-label">
        Your cover window
      </h3>

      <div className="mt-3 grid grid-cols-[1fr_auto] items-end gap-3">
        <label className="block min-w-0">
          <span className="block text-[12px] leading-4 text-label-secondary">Admission</span>
          <input
            data-widget-focus
            type="date"
            value={admission}
            onChange={(event) => setAdmission(event.target.value)}
            className="mt-1 h-11 w-full min-w-0 rounded-[12px] bg-fill px-3 text-[16px] leading-6 text-label tabular-nums focus:bg-surface focus:shadow-[0_0_0_2px_var(--color-accent)] focus:outline-none"
          />
        </label>
        <div>
          <span id={`${id}-nights`} className="block text-[12px] leading-4 text-label-secondary">
            Nights in hospital
          </span>
          <div className="mt-1 flex h-11 items-center gap-1 rounded-[12px] bg-fill px-1" role="group" aria-labelledby={`${id}-nights`}>
            <button
              type="button"
              aria-label="One night fewer"
              disabled={nights <= 1}
              onClick={() => setNights((n) => Math.max(1, n - 1))}
              className="grid size-9 place-items-center rounded-[9px] text-[18px] text-label transition-colors active:bg-surface disabled:text-label-tertiary [@media(hover:hover)]:hover:bg-surface"
            >
              −
            </button>
            <output aria-live="polite" className="w-7 text-center text-[16px] leading-6 font-semibold text-label tabular-nums">
              {nights}
            </output>
            <button
              type="button"
              aria-label="One night more"
              disabled={nights >= 30}
              onClick={() => setNights((n) => Math.min(30, n + 1))}
              className="grid size-9 place-items-center rounded-[9px] text-[18px] text-label transition-colors active:bg-surface disabled:text-label-tertiary [@media(hover:hover)]:hover:bg-surface"
            >
              +
            </button>
          </div>
        </div>
      </div>

      {valid ? (
        <>
          <div aria-hidden className="mt-4 flex h-3 overflow-hidden rounded-full">
            <span className="bg-accent/25 transition-[flex-basis] duration-300 ease-out" style={{ flexBasis: `${beforeShare}%` }} />
            <span className="mx-px bg-accent transition-[flex-basis] duration-300 ease-out" style={{ flexBasis: `${stayShare}%` }} />
            <span className="bg-accent/25 transition-[flex-basis] duration-300 ease-out" style={{ flexBasis: `${afterShare}%` }} />
          </div>
          <dl className="mt-2 grid grid-cols-3 gap-2 text-[12px] leading-4">
            <div>
              <dt className="text-label-secondary">60 days before</dt>
              <dd className="mt-0.5 font-medium text-label tabular-nums">from {fmt(from)}</dd>
            </div>
            <div className="text-center">
              <dt className="text-label-secondary">Your stay</dt>
              <dd className="mt-0.5 font-medium text-label tabular-nums">
                {nights} {nights === 1 ? "night" : "nights"}
              </dd>
            </div>
            <div className="text-right">
              <dt className="text-label-secondary">90 days after</dt>
              <dd className="mt-0.5 font-medium text-label tabular-nums">until {fmt(until)}</dd>
            </div>
          </dl>
          <p className="mt-3 rounded-[12px] bg-fill px-3 py-2.5 text-[13px] leading-[18px] text-pretty text-label" aria-live="polite">
            Bills dated <span className="font-semibold tabular-nums">{fmt(from)}</span> to{" "}
            <span className="font-semibold tabular-nums">{fmt(until)}</span> count towards this stay. Keep them with
            the claim.
          </p>
        </>
      ) : (
        <p className="mt-3 text-[13px] leading-[18px] text-label-secondary">Choose an admission date.</p>
      )}
    </section>
  );
}
