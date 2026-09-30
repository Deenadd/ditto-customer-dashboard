"use client";

import { useRef, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { Activity, ChevronRight, FilePlus2, Files, ShieldCheck, type LucideIcon } from "lucide-react";
import { ClaimsConversation } from "@/components/claims/claims-conversation";
import { FrostedSideSheet } from "@/components/ui/frosted-side-sheet/frosted-side-sheet";
import { topics, type TopicId } from "@/lib/claims-flow";

const icons: Record<TopicId, LucideIcon> = {
  "make-claim": FilePlus2,
  documents: Files,
  covered: ShieldCheck,
  track: Activity,
};

/**
 * Claims support: four common questions. Choosing one opens the frosted side
 * sheet with that conversation; while it's open, the other rows dim to 40%
 * so the one you chose stays clear.
 */
export function ClaimsSupport() {
  const [openTopic, setOpenTopic] = useState<TopicId | null>(null);
  /* A new session remounts the conversation, even for the same topic. */
  const [session, setSession] = useState(0);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  /* The last topic stays rendered while the sheet slides out. */
  const [shownTopic, setShownTopic] = useState<TopicId | null>(null);
  const reduced = useReducedMotion();
  const topic = topics.find((item) => item.id === shownTopic);

  return (
    <section aria-labelledby="claims-title" className="rounded-surface border border-separator bg-surface p-2">
      <div className="px-3 pt-3 pb-2">
        <h2 id="claims-title" className="text-lg font-medium text-label">
          Claims support
        </h2>
        <p className="mt-0.5 text-sm text-pretty text-label-secondary">Answers to common questions, one step at a time.</p>
      </div>

      <ul className="flex flex-col">
        {topics.map((item) => {
          const Icon = icons[item.id];
          const dimmed = openTopic !== null && openTopic !== item.id;
          return (
            <motion.li
              key={item.id}
              initial={false}
              animate={{ opacity: dimmed ? 0.4 : 1 }}
              transition={reduced ? { duration: 0 } : { duration: 0.32, ease: [0.32, 0.72, 0, 1] }}
            >
              <button
                type="button"
                data-sheet-trigger
                aria-haspopup="dialog"
                aria-expanded={openTopic === item.id}
                onClick={(event) => {
                  triggerRef.current = event.currentTarget;
                  setOpenTopic(item.id);
                  setShownTopic(item.id);
                  setSession((value) => value + 1);
                }}
                className="group flex min-h-14 w-full items-center gap-3 rounded-panel px-3 py-2.5 text-left transition-colors duration-150 ease-[var(--ease-standard)] hover:bg-fill active:bg-fill aria-expanded:bg-fill"
              >
                <Icon size={20} strokeWidth={1.75} aria-hidden className="shrink-0 text-label-secondary" />
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-medium text-label">{item.label}</span>
                  <span className="block text-xs text-label-secondary">{item.hint}</span>
                </span>
                <ChevronRight
                  size={16}
                  strokeWidth={1.75}
                  aria-hidden
                  className="shrink-0 text-label-tertiary transition-transform duration-200 ease-[var(--ease-standard)] [@media(hover:hover)]:group-hover:translate-x-0.5"
                />
              </button>
            </motion.li>
          );
        })}
      </ul>

      <FrostedSideSheet
        open={openTopic !== null}
        onClose={() => setOpenTopic(null)}
        title={topic?.label ?? "Claims support"}
        returnFocusRef={triggerRef}
      >
        {topic ? <ClaimsConversation key={`${topic.id}-${session}`} start={topic.start} /> : null}
      </FrostedSideSheet>
    </section>
  );
}
