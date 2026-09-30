"use client";

import { useEffect, useRef, useState } from "react";
import { Check } from "lucide-react";
import { Avatar } from "@/registry/components/avatar/avatar";
import { Button } from "@/registry/components/button/button";
import { ScrollArea } from "@/registry/components/scroll-area/scroll-area";
import { SheetItem, SheetReveal, useSheetReveal } from "@/components/ui/frosted-side-sheet/frosted-side-sheet";
import { defaultSideSheetConfig } from "@/components/ui/frosted-side-sheet/config";
import {
  closingChoices,
  expertReply,
  steps,
  type Choice,
  type Outcome,
} from "@/lib/claims-flow";

/* The conversation only ever grows, so an entry's position is its key. */
type Entry =
  | { kind: "ditto"; text: string; first: boolean }
  | { kind: "you"; text: string }
  | { kind: "outcome"; outcome: Outcome };

const EXPERT = "__expert";

/** Stagger timing in seconds, from the sheet's tuned config. */
const INITIAL = defaultSideSheetConfig.staggerInitial / 1000;
const STEP = defaultSideSheetConfig.staggerStep / 1000;

/**
 * One claims conversation. Ditto asks, you pick an answer, and the next
 * question or the outcome reveals below with the sheet's stagger. Items that
 * were there when the sheet opened join the opening stagger; later ones
 * reveal on their own clock.
 */
export function ClaimsConversation({ start }: { start: string }) {
  const { reduced } = useSheetReveal();
  const [entries, setEntries] = useState<Entry[]>(() => stepEntries(start));
  const [current, setCurrent] = useState(start);
  const [openingCount] = useState(entries.length);
  /* Index of the first entry in the latest batch. Opening entries join the
     sheet's stagger; each later batch reveals on its own clock from here. */
  const [batchFrom, setBatchFrom] = useState<number | null>(null);
  const viewport = useRef<HTMLDivElement>(null);
  const choicesRef = useRef<HTMLDivElement>(null);

  const answered = batchFrom !== null;
  const choices: Choice[] = current === EXPERT ? [] : (steps[current]?.choices ?? closingChoices);
  const choicesDelay = INITIAL + (answered ? entries.length - batchFrom : openingCount) * STEP;

  /* Your reply shows at once; Ditto's answer follows with the stagger. */
  const delayFor = (index: number) => {
    if (index < openingCount || batchFrom === null) return undefined;
    if (index < batchFrom) return 0;
    const offset = index - batchFrom;
    return offset === 0 ? 0 : INITIAL + (offset - 1) * STEP;
  };

  function reply(label: string, next: Entry[], nextStep: string) {
    setBatchFrom(entries.length);
    setEntries((list) => [...list, { kind: "you", text: label }, ...next]);
    setCurrent(nextStep);
  }

  function choose(choice: Choice) {
    if ("action" in choice) {
      reply(
        choice.label,
        expertReply.map((text, index) => ({ kind: "ditto" as const, text, first: index === 0 })),
        EXPERT,
      );
    } else {
      reply(choice.label, stepEntries(choice.next), choice.next);
    }
  }

  /* Keep the newest message in view. */
  useEffect(() => {
    const node = viewport.current;
    if (!node || batchFrom === null) return;
    node.scrollTo({ top: node.scrollHeight, behavior: reduced ? "auto" : "smooth" });
  }, [entries.length, batchFrom, reduced]);

  /* The answer you pressed is gone, so focus moves to the next set. */
  useEffect(() => {
    if (batchFrom === null) return;
    const frame = requestAnimationFrame(() => {
      choicesRef.current?.querySelector<HTMLButtonElement>("button")?.focus({ preventScroll: true });
    });
    return () => cancelAnimationFrame(frame);
  }, [entries.length, batchFrom]);

  return (
    <>
      <ScrollArea
        label="Conversation"
        className="min-h-0 flex-1"
        viewportRef={viewport}
        viewportClassName="px-5 pt-4 pb-6"
      >
        <SheetReveal className="flex flex-col gap-5">
          <div role="log" aria-live="polite" aria-label="Claims conversation" className="flex flex-col gap-5">
            {entries.map((entry, index) => (
              <SheetItem key={index} delay={delayFor(index)}>
                <EntryView entry={entry} />
              </SheetItem>
            ))}
          </div>
        </SheetReveal>
      </ScrollArea>

      <div className="border-t border-black/[0.06] px-5 pt-4 pb-5">
        <SheetItem key={`choices-${current}-${entries.length}`} delay={choicesDelay}>
          <div ref={choicesRef} role="group" aria-label="Your answer" className="flex flex-wrap gap-2">
            {choices.map((choice) => (
              <Button key={choice.label} variant="secondary" size="sm" onClick={() => choose(choice)}>
                {choice.label}
              </Button>
            ))}
            {answered ? (
              <Button variant="ghost" size="sm" onClick={() => reply("Start over", stepEntries(start), start)}>
                Start over
              </Button>
            ) : null}
          </div>
        </SheetItem>
      </div>
    </>
  );
}

function stepEntries(stepId: string): Entry[] {
  const step = steps[stepId];
  const said: Entry[] = step.say.map((text, index) => ({
    kind: "ditto",
    text,
    first: index === 0,
  }));
  return step.outcome ? [...said, { kind: "outcome", outcome: step.outcome }] : said;
}

function EntryView({ entry }: { entry: Entry }) {
  if (entry.kind === "you") {
    return (
      <div className="flex justify-end">
        <p className="max-w-[85%] rounded-control bg-accent-tint px-3.5 py-2 text-sm text-accent-strong">
          <span className="sr-only">You: </span>
          {entry.text}
        </p>
      </div>
    );
  }

  if (entry.kind === "outcome") {
    const { outcome } = entry;
    return (
      <section
        aria-label={outcome.title}
        className="ml-9 rounded-panel border border-separator bg-surface px-4 py-4"
      >
        <h3 className="text-sm font-medium text-label">{outcome.title}</h3>
        {outcome.steps ? (
          <ol className="mt-3 flex flex-col gap-2.5">
            {outcome.steps.map((text, index) => (
              <li key={text} className="flex gap-2.5 text-sm text-label">
                <span className="w-4 shrink-0 text-label-secondary tabular-nums">{index + 1}.</span>
                <span className="text-pretty">{text}</span>
              </li>
            ))}
          </ol>
        ) : null}
        {outcome.documents ? (
          <ul className="mt-3 flex flex-col gap-2">
            {outcome.documents.map((text) => (
              <li key={text} className="flex items-start gap-2.5 text-sm text-label">
                <Check size={16} strokeWidth={1.75} aria-hidden className="mt-0.5 shrink-0 text-label-secondary" />
                {text}
              </li>
            ))}
          </ul>
        ) : null}
        {outcome.note ? (
          <p className="mt-3 text-xs text-label-secondary">{outcome.note}</p>
        ) : null}
      </section>
    );
  }

  return (
    <div className="flex items-start gap-3">
      {entry.first ? (
        <Avatar name="Ditto" size="sm" />
      ) : (
        <span aria-hidden className="w-7 shrink-0" />
      )}
      <div className="min-w-0 flex-1">
        {entry.first ? (
          <p className="mb-1 text-xs font-medium text-label-secondary">Ditto</p>
        ) : null}
        <p className="text-sm text-pretty text-label">{entry.text}</p>
      </div>
    </div>
  );
}
