"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Chevron, Monogram } from "@/components/dashboard/policy-pair";
import { Button } from "@/components/ui/buttons";
import { SheetItem, SheetReveal, useSheetReveal } from "@/components/ui/frosted-side-sheet/frosted-side-sheet";
import { defaultSideSheetConfig } from "@/components/ui/frosted-side-sheet/config";
import { IconBack, IconCheck, IconPhone, IconRestart } from "@/components/ui/icons";
import { InsurerLogo } from "@/components/ui/insurer-logo";
import { ChatWidget } from "@/components/claims/chat-widgets";
import { closingChoices, routeQuestion, steps, type Choice, type Outcome, type WidgetId } from "@/lib/claims-flow";

/* The conversation only grows, or is cut back by Back, so an entry's
   position is its key. */
type Entry =
  | { kind: "ditto"; text: string; first: boolean }
  | { kind: "you"; text: string }
  | { kind: "outcome"; outcome: Outcome }
  | { kind: "widget"; widget: WidgetId };

/** Stagger timing in seconds, from the sheet's tuned config. */
const INITIAL = defaultSideSheetConfig.staggerInitial / 1000;
const STEP = defaultSideSheetConfig.staggerStep / 1000;

/** How long Ditto "types" before answering: long enough to read as a
    reply, short enough not to feel like waiting. */
const TYPING_MS = 550;

/**
 * One claims conversation. Ditto asks, you pick an answer, Ditto types for a
 * moment, and the next question or an outcome reveals below with the sheet's
 * stagger. Back undoes your last answer; Start over asks the first question
 * again. Items there when the sheet opened join its opening stagger; later
 * ones reveal on their own clock.
 */
export function ClaimsConversation({ start, composer = false }: { start: string; composer?: boolean }) {
  const [question, setQuestion] = useState("");
  const { reduced } = useSheetReveal();
  const [entries, setEntries] = useState<Entry[]>(() => stepEntries(start));
  const [current, setCurrent] = useState(start);
  const [openingCount] = useState(entries.length);
  /* Where the conversation stood before each answer, for Back. */
  const [history, setHistory] = useState<{ length: number; step: string }[]>([]);
  /* Index of your latest answer. Everything after it reveals from there. */
  const [batchFrom, setBatchFrom] = useState<number | null>(null);
  const [typing, setTyping] = useState(false);
  const viewport = useRef<HTMLDivElement>(null);
  const footerRef = useRef<HTMLDivElement>(null);
  const timer = useRef<number | undefined>(undefined);

  const answered = history.length > 0;
  /* Widgets after your latest answer are live; earlier ones are a record. */
  const lastAnswer = entries.findLastIndex((entry) => entry.kind === "you");
  const choices: Choice[] = steps[current]?.choices ?? closingChoices;
  const asRows = choices.some((choice) => choice.hint);
  const choicesDelay =
    batchFrom === null
      ? INITIAL + openingCount * STEP
      : Math.max(0, entries.length - batchFrom - 1) * STEP + STEP;

  /* Your answer shows at once; Ditto's reply follows the typing dots. */
  const delayFor = (index: number) => {
    if (index < openingCount || batchFrom === null) return undefined;
    if (index <= batchFrom) return 0;
    return (index - batchFrom - 1) * STEP;
  };

  function reply(label: string, next: string) {
    window.clearTimeout(timer.current);
    setHistory((list) => [...list, { length: entries.length, step: current }]);
    setBatchFrom(entries.length);
    setEntries((list) => [...list, { kind: "you", text: label }]);
    setCurrent(next);
    setTyping(true);
    /* The pressed answer is gone; hold focus in the footer meanwhile. */
    footerRef.current?.focus({ preventScroll: true });
    timer.current = window.setTimeout(() => {
      setEntries((list) => [...list, ...stepEntries(next)]);
      setTyping(false);
    }, TYPING_MS);
  }

  function back() {
    const last = history.at(-1);
    if (!last) return;
    window.clearTimeout(timer.current);
    setHistory((list) => list.slice(0, -1));
    setEntries((list) => list.slice(0, last.length));
    setBatchFrom(last.length);
    setCurrent(last.step);
    setTyping(false);
  }

  useEffect(() => () => window.clearTimeout(timer.current), []);

  /* Keep the newest message in view. */
  useEffect(() => {
    const node = viewport.current;
    if (!node || batchFrom === null) return;
    node.scrollTo({ top: node.scrollHeight, behavior: reduced ? "auto" : "smooth" });
  }, [entries.length, typing, batchFrom, reduced]);

  /* When the next answers arrive, focus moves to the first of them, or
     into a widget if the reply brought one. */
  useEffect(() => {
    if (batchFrom === null || typing) return;
    const frame = requestAnimationFrame(() => {
      const widget = viewport.current?.querySelector<HTMLElement>("section:not([inert]) [data-widget-focus]");
      (widget ?? footerRef.current?.querySelector<HTMLButtonElement>("button"))?.focus({ preventScroll: true });
    });
    return () => cancelAnimationFrame(frame);
  }, [entries.length, batchFrom, typing]);

  return (
    <>
      <div
        ref={viewport}
        tabIndex={0}
        role="region"
        aria-label="Conversation"
        data-scroll-lock-scrollable
        className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 pt-4 pb-6 [mask-image:linear-gradient(to_bottom,black_calc(100%-24px),transparent)] focus-visible:outline-offset-[-2px]"
      >
        <SheetReveal className="flex flex-col gap-5">
          <div role="log" aria-live="polite" aria-label="Claims conversation" className="flex flex-col gap-5">
            {entries.map((entry, index) => (
              <SheetItem
                key={index}
                delay={delayFor(index)}
                /* Lines in one turn sit closer than one turn to the next. */
                className={entry.kind === "ditto" && !entry.first ? "-mt-3" : undefined}
              >
                <EntryView entry={entry} active={!typing && index > lastAnswer} onAnswer={reply} />
              </SheetItem>
            ))}
          </div>
          {typing ? (
            <SheetItem delay={0}>
              <Typing />
            </SheetItem>
          ) : null}
        </SheetReveal>
      </div>

      <div
        ref={footerRef}
        tabIndex={-1}
        aria-busy={typing}
        className="px-5 pt-3 pb-[calc(20px+env(safe-area-inset-bottom))] focus:outline-none"
      >
        {typing ? (
          <p className="flex h-8 items-center text-[13px] leading-[18px] text-label-tertiary">Ditto is replying…</p>
        ) : (
          <SheetItem key={`${current}-${entries.length}`} delay={choicesDelay}>
            {choices.length ? (
              <div
                role="group"
                aria-label="Your answer"
                className={asRows ? "flex flex-col gap-2" : "flex flex-wrap gap-2"}
              >
                {choices.map((choice) =>
                  asRows ? (
                    <ChoiceRow key={choice.label} choice={choice} onChoose={() => reply(choice.label, choice.next)} />
                  ) : (
                    <Button
                      key={choice.label}
                      variant="tinted"
                      size="small"
                      onClick={() => reply(choice.label, choice.next)}
                    >
                      {choice.next === "expert" ? <IconPhone size={16} /> : null}
                      {choice.label}
                    </Button>
                  ),
                )}
              </div>
            ) : null}
            {composer ? (
              <form
                className="relative mt-3"
                onSubmit={(event) => {
                  event.preventDefault();
                  const text = question.trim();
                  if (!text) return;
                  setQuestion("");
                  reply(text, routeQuestion(text));
                }}
              >
                <label htmlFor="buddy-question" className="sr-only">
                  Ask Ditto Buddy
                </label>
                <input
                  id="buddy-question"
                  value={question}
                  onChange={(event) => setQuestion(event.target.value)}
                  placeholder="Ask about claims, cover or hospitals"
                  autoComplete="off"
                  enterKeyHint="send"
                  className="h-12 w-full rounded-full bg-surface pr-14 pl-4 text-[16px] leading-6 text-label shadow-field placeholder:text-label-tertiary focus:shadow-[0_0_0_2px_var(--color-accent)] focus:outline-none"
                />
                <button
                  type="submit"
                  aria-label="Send"
                  disabled={!question.trim()}
                  className="absolute top-1.5 right-1.5 grid size-9 place-items-center rounded-full bg-accent text-white transition-[opacity,transform] duration-150 active:scale-[0.92] disabled:opacity-30"
                >
                  <svg aria-hidden width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M8 13V3m0 0L3.5 7.5M8 3l4.5 4.5" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              </form>
            ) : null}
            {answered ? (
              <div className={`flex items-center justify-between ${choices.length || composer ? "mt-3 -mx-2" : "-mx-2"}`}>
                <Button variant="plain" size="small" onClick={back}>
                  <IconBack size={16} />
                  Back
                </Button>
                <Button variant="plain" size="small" onClick={() => reply("Start over", start)}>
                  <IconRestart size={16} />
                  Start over
                </Button>
              </div>
            ) : null}
          </SheetItem>
        )}
      </div>
    </>
  );
}

function stepEntries(stepId: string): Entry[] {
  const step = steps[stepId];
  const said: Entry[] = step.say.map((text, index) => ({ kind: "ditto", text, first: index === 0 }));
  const widget: Entry[] = step.widget ? [{ kind: "widget", widget: step.widget }] : [];
  const outcome: Entry[] = step.outcome ? [{ kind: "outcome", outcome: step.outcome }] : [];
  return [...said, ...widget, ...outcome];
}

/** A policy or other answer that needs a second line: a list row. */
function ChoiceRow({ choice, onChoose }: { choice: Choice; onChoose: () => void }) {
  return (
    <button
      type="button"
      onClick={onChoose}
      className="group flex min-h-16 w-full items-center gap-3 rounded-[14px] bg-surface py-2.5 pr-4 pl-3 text-left shadow-tile transition-colors duration-150 ease-out active:bg-fill [@media(hover:hover)]:hover:bg-fill"
    >
      {choice.insurer ? <InsurerLogo insurer={choice.insurer} size={40} /> : null}
      <span className="min-w-0 flex-1">
        <span className="block text-[15px] leading-5 font-medium text-pretty text-label">{choice.label}</span>
        {choice.hint ? (
          <span className="block text-[13px] leading-[18px] text-label-secondary tabular-nums">{choice.hint}</span>
        ) : null}
      </span>
      <Chevron className="text-label-tertiary" />
    </button>
  );
}

/** Three dots in Ditto's bubble, while the reply is on its way. */
function Typing() {
  return (
    <div aria-hidden className="flex items-center gap-3">
      <Monogram name="Ditto" primary />
      <span className="flex h-9 items-center gap-1 rounded-[18px] bg-fill-strong px-3.5">
        {[0, 1, 2].map((dot) => (
          <span
            key={dot}
            className="size-1.5 rounded-full bg-label-secondary [animation:typing-dot_1s_ease-in-out_infinite]"
            style={{ animationDelay: `${dot * 150}ms` }}
          />
        ))}
      </span>
    </div>
  );
}

function EntryView({
  entry,
  active,
  onAnswer,
}: {
  entry: Entry;
  active: boolean;
  onAnswer: (label: string, next: string) => void;
}) {
  if (entry.kind === "widget") return <ChatWidget widget={entry.widget} active={active} onAnswer={onAnswer} />;
  if (entry.kind === "you") {
    return (
      <div className="flex justify-end">
        <p className="max-w-[85%] rounded-[18px] bg-accent px-3.5 py-2 text-[15px] leading-5 text-pretty text-white">
          <span className="sr-only">You: </span>
          {entry.text}
        </p>
      </div>
    );
  }

  if (entry.kind === "outcome") return <OutcomeCard outcome={entry.outcome} />;

  return (
    <div className="flex items-start gap-3">
      {entry.first ? <Monogram name="Ditto" primary /> : <span aria-hidden className="w-9 shrink-0" />}
      <div className="min-w-0 flex-1">
        {entry.first ? (
          <p className="mb-0.5 text-[12px] leading-4 font-semibold text-label-secondary">Ditto</p>
        ) : null}
        <p className="text-[15px] leading-[22px] text-pretty text-label">{entry.text}</p>
      </div>
    </div>
  );
}

const outcomeCard =
  "ml-12 rounded-[14px] bg-surface px-4 py-4 shadow-tile";

function OutcomeCard({ outcome }: { outcome: Outcome }) {
  if (outcome.kind === "documents") return <DocumentChecklist outcome={outcome} />;

  if (outcome.kind === "booked") {
    return (
      <section aria-label={outcome.title} className={outcomeCard}>
        <div className="flex items-center gap-2.5">
          <span aria-hidden className="grid size-7 place-items-center rounded-full bg-green-tint text-green-text">
            <IconCheck size={16} />
          </span>
          <h3 className="text-[15px] leading-5 font-semibold text-label">{outcome.title}</h3>
        </div>
        <dl className="mt-3 divide-y divide-separator">
          {outcome.rows.map((row) => (
            <div key={row.label} className="flex items-baseline justify-between gap-4 py-2.5 text-[14px] leading-5">
              <dt className="text-label-secondary">{row.label}</dt>
              <dd className="text-right font-medium text-label tabular-nums">{row.value}</dd>
            </div>
          ))}
        </dl>
        {outcome.note ? <p className="mt-1 text-[12px] leading-4 text-label-secondary">{outcome.note}</p> : null}
      </section>
    );
  }

  return (
    <section aria-label={outcome.title} className={outcomeCard}>
      <h3 className="text-[15px] leading-5 font-semibold text-label">{outcome.title}</h3>
      <ol className="mt-3 flex flex-col">
        {outcome.steps.map((text, index) => (
          <li key={text} className="relative flex gap-3 pb-3 last:pb-0">
            {/* The thread between one step and the next. */}
            {index < outcome.steps.length - 1 ? (
              <span aria-hidden className="absolute top-6 bottom-1 left-[10.5px] w-px bg-separator" />
            ) : null}
            <span
              aria-hidden
              className="grid size-[22px] shrink-0 place-items-center rounded-full bg-accent-tint text-[12px] font-semibold text-accent-text tabular-nums"
            >
              {index + 1}
            </span>
            <span className="pt-px text-[14px] leading-5 text-pretty text-label">{text}</span>
          </li>
        ))}
      </ol>
      {outcome.note ? <p className="mt-3 text-[12px] leading-4 text-label-secondary">{outcome.note}</p> : null}
    </section>
  );
}

/** The documents as a checklist you tick off, with a count of what's ready. */
function DocumentChecklist({ outcome }: { outcome: Extract<Outcome, { kind: "documents" }> }) {
  const [ready, setReady] = useState(
    () => new Set(outcome.documents.filter((doc) => doc.onFile).map((doc) => doc.label)),
  );
  const total = outcome.documents.length;
  const done = ready.size === total;
  const id = useId();

  function toggle(label: string) {
    setReady((set) => {
      const next = new Set(set);
      if (next.has(label)) next.delete(label);
      else next.add(label);
      return next;
    });
  }

  return (
    <section aria-labelledby={`${id}-title`} className={outcomeCard}>
      <div className="flex items-baseline justify-between gap-3">
        <h3 id={`${id}-title`} className="text-[15px] leading-5 font-semibold text-label">
          {outcome.title}
        </h3>
        <p className={`text-[13px] leading-[18px] tabular-nums ${done ? "font-medium text-green-text" : "text-label-secondary"}`}>
          {done ? "All ready" : `${ready.size} of ${total} ready`}
        </p>
      </div>
      <div aria-hidden className="mt-2.5 h-1 overflow-hidden rounded-full bg-fill-strong">
        <div
          className={`h-full origin-left rounded-full transition-[transform,background-color] duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] ${done ? "bg-green-dot" : "bg-accent"}`}
          style={{ transform: `scaleX(${ready.size / total})` }}
        />
      </div>
      <ul className="-mx-2 mt-2 flex flex-col">
        {outcome.documents.map((doc) => {
          const checked = ready.has(doc.label);
          return (
            <li key={doc.label}>
              <label className="flex min-h-11 cursor-pointer items-center gap-3 rounded-[10px] px-2 py-1.5 transition-colors duration-150 ease-out active:bg-fill [@media(hover:hover)]:hover:bg-fill">
                <span className="relative grid size-5 shrink-0 place-items-center">
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggle(doc.label)}
                    className="peer size-5 appearance-none rounded-[6px] border-[1.5px] border-label-tertiary/60 bg-surface transition-colors duration-150 ease-out checked:border-accent checked:bg-accent"
                  />
                  <IconCheck
                    size={14}
                    className="pointer-events-none absolute scale-50 text-white opacity-0 transition-[opacity,scale] duration-150 ease-out peer-checked:scale-100 peer-checked:opacity-100"
                  />
                </span>
                <span
                  className={`min-w-0 flex-1 text-[14px] leading-5 text-pretty transition-colors duration-150 ${checked ? "text-label-secondary" : "text-label"}`}
                >
                  {doc.label}
                </span>
                {doc.onFile ? (
                  <span className="shrink-0 rounded-full bg-green-tint px-2 py-0.5 text-[12px] leading-4 font-medium text-green-text">
                    On file
                  </span>
                ) : null}
              </label>
            </li>
          );
        })}
      </ul>
      {outcome.note ? <p className="mt-2 text-[12px] leading-4 text-label-secondary">{outcome.note}</p> : null}
    </section>
  );
}
