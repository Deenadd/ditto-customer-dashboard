"use client";

import { useRef, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { ClaimsConversation } from "@/components/claims/claims-conversation";
import { Chevron } from "@/components/dashboard/policy-pair";
import { cardClass } from "@/components/ui/card-bits";
import { FrostedSideSheet } from "@/components/ui/frosted-side-sheet/frosted-side-sheet";
import { IconClaim, IconCovered, IconDocuments, IconTrack, type Icon } from "@/components/ui/icons";
import { topics, type TopicId } from "@/lib/claims-flow";

const icons: Record<TopicId, Icon> = {
  "make-claim": IconClaim,
  documents: IconDocuments,
  covered: IconCovered,
  track: IconTrack,
};

/**
 * Claims support: four common questions in a card. Choosing one opens the
 * frosted sheet with that conversation (see ClaimsTopics).
 */
export function ClaimsSupport() {
  return (
    <section aria-labelledby="claims-title" className={`${cardClass} pb-2`}>
      <div className="px-5 pt-5">
        <h2
          id="claims-title"
          className="text-[17px] leading-[22px] font-semibold tracking-[-0.022em] text-label"
        >
          Claims support
        </h2>
        <p className="mt-0.5 text-[13px] leading-[18px] text-pretty text-label-secondary">
          Answers to common questions, one step at a time.
        </p>
      </div>
      <ClaimsTopics className="mt-3 px-2" />
    </section>
  );
}

/**
 * The claims questions as rows, each opening the frosted sheet with its
 * conversation; while it's open, the other rows dim to 40% so the one you
 * chose stays clear. `only` picks which topics show.
 */
export function ClaimsTopics({
  only,
  rename,
  className = "",
}: {
  only?: TopicId[];
  /** Different wording for a topic where its usual label would clash. */
  rename?: Partial<Record<TopicId, { label: string; hint: string }>>;
  className?: string;
}) {
  const [openTopic, setOpenTopic] = useState<TopicId | null>(null);
  /* The last topic stays rendered while the sheet slides out. */
  const [shownTopic, setShownTopic] = useState<TopicId | null>(null);
  /* A new session remounts the conversation, even for the same topic. */
  const [session, setSession] = useState(0);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const reduced = useReducedMotion();
  const named = topics.map((item) => ({ ...item, ...rename?.[item.id] }));
  const topic = named.find((item) => item.id === shownTopic);
  const shown = only ? named.filter((item) => only.includes(item.id)) : named;

  return (
    <>
      <ul className={`flex flex-col gap-0.5 ${className}`}>
        {shown.map((item) => {          const Icon = icons[item.id];
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
                className="group flex h-16 w-full items-center gap-3 rounded-[14px] px-3 text-left transition-colors duration-150 ease-out hover:bg-fill active:bg-fill aria-expanded:bg-fill"
              >
                <span className="grid size-11 shrink-0 place-items-center rounded-[11px] bg-surface text-accent shadow-tile">
                  <Icon />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[15px] leading-5 font-medium text-label">{item.label}</span>
                  <span className="block truncate text-[13px] leading-[18px] text-label-secondary">{item.hint}</span>
                </span>
                <Chevron className="text-label-tertiary" />
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
        {/* Every claims topic lives inside the health policy, so its
            conversation never asks which policy. */}
        {topic ? <ClaimsConversation key={`${topic.id}-${session}`} start={topic.start} policyKnown /> : null}
      </FrostedSideSheet>
    </>
  );
}
