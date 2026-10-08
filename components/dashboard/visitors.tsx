"use client";

import { useCallback, useEffect, useState } from "react";
import type { Visit } from "@/lib/visits";

type State =
  | { kind: "loading" }
  | { kind: "off" }
  | { kind: "error" }
  | { kind: "ready"; visits: Visit[]; people: number; total: number };

const devices: Record<Visit["device"], string> = { phone: "Phone", tablet: "Tablet", desktop: "Desktop" };

/* "Today, 4:12 pm" or "8 Oct, 4:12 pm", in the viewer's own time. */
function when(at: number) {
  const date = new Date(at);
  const time = new Intl.DateTimeFormat("en-IN", { hour: "numeric", minute: "2-digit" }).format(date);
  const today = new Date().toDateString() === date.toDateString();
  return `${today ? "Today" : new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short" }).format(date)}, ${time}`;
}

/**
 * Who has viewed the prototype, in the controls panel (Shift+Option+C on the
 * home page): each visit as User N, the device, the first page and when,
 * newest first. Loads when the panel opens; Refresh asks again.
 */
export function Visitors() {
  const [state, setState] = useState<State>({ kind: "loading" });

  const load = useCallback(async () => {
    setState({ kind: "loading" });
    try {
      const response = await fetch("/api/visits", { cache: "no-store" });
      const data = await response.json();
      if (data.connected === false) setState({ kind: "off" });
      else if (!response.ok || data.error) setState({ kind: "error" });
      else setState({ kind: "ready", visits: data.visits, people: data.people, total: data.total });
    } catch {
      setState({ kind: "error" });
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- loading when the panel opens is the point
    void load();
  }, [load]);

  return (
    <section aria-labelledby="visitors-title" className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between px-1">
        <h3 id="visitors-title" className="text-[12px] font-medium text-zinc-200">
          Visitors
        </h3>
        <button
          type="button"
          onClick={load}
          disabled={state.kind === "loading"}
          className="rounded-[8px] px-2 py-1 text-[11px] font-medium text-zinc-300 transition-colors hover:bg-white/5 hover:text-white disabled:opacity-50"
        >
          Refresh
        </button>
      </div>

      <div aria-live="polite" className="rounded-[12px] bg-[#1a1a1c] p-1.5">
        {state.kind === "loading" ? (
          <p className="px-2 py-2.5 text-[12px] text-zinc-400">Loading visits…</p>
        ) : state.kind === "off" ? (
          <p className="px-2 py-2.5 text-[12px] leading-[17px] text-zinc-400">
            Not connected yet. Add Upstash for Redis to the Vercel project, then redeploy, and visits start counting.
          </p>
        ) : state.kind === "error" ? (
          <p className="px-2 py-2.5 text-[12px] leading-[17px] text-zinc-400">
            Couldn&rsquo;t load the visits. Refresh to try again.
          </p>
        ) : state.visits.length === 0 ? (
          <p className="px-2 py-2.5 text-[12px] leading-[17px] text-zinc-400">
            No visits yet. Each new browser that opens the prototype shows up here.
          </p>
        ) : (
          <>
            <p className="px-2 pt-1.5 pb-2 text-[11px] text-zinc-400 tabular-nums">
              {state.people} {state.people === 1 ? "person" : "people"} · {state.total} {state.total === 1 ? "visit" : "visits"}
              {state.total > state.visits.length ? ` · latest ${state.visits.length}` : ""}
            </p>
            <ol className="flex max-h-[280px] flex-col overflow-y-auto overscroll-contain">
              {state.visits.map((visit) => (
                <li key={`${visit.user}-${visit.at}`} className="flex items-center gap-2.5 rounded-[8px] px-2 py-1.5">
                  <span className="grid size-7 shrink-0 place-items-center rounded-full bg-white/10 text-[11px] font-semibold tabular-nums">
                    {visit.user}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[12px] leading-4 text-white">User {visit.user}</span>
                    <span className="block truncate text-[11px] leading-4 text-zinc-400">
                      {devices[visit.device] ?? visit.device} · {visit.page}
                    </span>
                  </span>
                  <time dateTime={new Date(visit.at).toISOString()} className="shrink-0 text-[11px] text-zinc-400 tabular-nums">
                    {when(visit.at)}
                  </time>
                </li>
              ))}
            </ol>
          </>
        )}
      </div>
    </section>
  );
}
