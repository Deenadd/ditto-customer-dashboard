"use client";

import Link from "next/link";
import { useState, type ReactNode } from "react";
import { useReducedMotion } from "motion/react";
import { useCardConfig } from "@/components/dashboard/card-config";
import { CardFoil } from "@/components/dashboard/card-foil";
import { Topography } from "@/components/dashboard/topography";
import { Asset, Glow } from "@/components/ui/asset";
import { cardClass } from "@/components/ui/card-bits";
import { GlareFace, GlareGroup } from "@/components/ui/glare";
import { IconCheck } from "@/components/ui/icons";
import { InsurerLogo } from "@/components/ui/insurer-logo";
import { TiltCard } from "@/components/ui/tilt-card";
import { downloadPolicyCard } from "@/lib/download-card";
import type { ActivePolicy, Member } from "@/lib/dashboard-data";

export type CardTone = "blue" | "green";

const art = (name: string) => `/dashboard/health-card/${name}`;

/* A white card face, as in the Figma active-policies screen: the contour
   lines and a soft blue glow sit behind the content. */
const face = `relative isolate flex h-full flex-col overflow-hidden ${cardClass} transition-shadow duration-200 ease-out [@media(hover:hover)]:group-has-[a:hover]:shadow-raised`;

/* The outlined white panel inside each face. */
const panel =
  "rounded-[14px] border border-black/[0.06] bg-surface shadow-[0_1px_2px_rgb(0_0_0_/_0.04),0_6px_16px_-8px_rgb(0_0_0_/_0.08)]";

const captions: Record<CardTone, string> = {
  blue: "Your health card, for your reference.",
  green: "Your policy card, for your reference.",
};

/**
 * A policy as a pair of cards, after the Figma active-policies screen: the
 * policy on the front, its people on the back, both white with the blue
 * contour lines and an outlined panel. Each face responds to the pointer
 * (see CardFace), and the pair opens the policy when it has a page.
 */
export function PolicyCardPair({
  policy,
  href,
  tone,
  stacked = false,
  download = false,
}: {
  policy: ActivePolicy;
  href?: string;
  tone: CardTone;
  /** Front above back, for narrow places like a side sheet. */
  stacked?: boolean;
  /** Show the Download card pill on the front. */
  download?: boolean;
}) {
  const config = useCardConfig();

  return (
    <GlareGroup settings={config} className={`group relative grid gap-4 [&>*]:min-w-0 ${stacked ? "" : "sm:grid-cols-2"}`}>
      <CardFace>
        <PolicyCardFront policy={policy} download={download} />
        {href ? <FaceLink href={href} label={`${policy.name}, view policy details`} /> : null}
      </CardFace>

      <CardFace>
        <article aria-label={`People on ${policy.name}`} className={face}>
          <div aria-hidden className="absolute inset-0 -z-10">
            <Topography variant="members" />
          </div>
          <div className={`${panel} m-2 mb-0 flex flex-1 flex-col gap-5 px-5 pt-5 pb-5`}>
            {policy.people.layout === "members" ? (
              <PeopleGroup label="Member details" members={policy.people.members} />
            ) : (
              <>
                <PeopleGroup label="Life assured" members={[policy.people.member]} />
                <PeopleGroup label="Nominee" members={[policy.people.nominee]} />
              </>
            )}
          </div>
          <p className="px-5 py-3 text-[12px] leading-4 text-label-secondary">{captions[tone]}</p>
          <CardFoil />
        </article>
        {/* The same link again, so this face hears the pointer; the front's
            copy is the one keyboards and screen readers meet. */}
        {href ? <FaceLink href={href} hidden /> : null}
      </CardFace>
    </GlareGroup>
  );
}

/**
 * One face of a card, with the hover effect the card panel has chosen:
 * Press (Bencho's tilt card, which sinks under the pointer) or Glare (it
 * turns toward the pointer and catches a glare). Each face listens for the
 * pointer itself, so anything that covers it, like its link, must be inside.
 */
export function CardFace({ children }: { children: ReactNode }) {
  const config = useCardConfig();
  /* Reduced motion: no turn and no retreat; the dent's light still follows. */
  const reduced = !!useReducedMotion();
  if (config.effect === "glare") {
    return (
      <GlareFace radius={22}>
        <div className="relative h-full">{children}</div>
      </GlareFace>
    );
  }
  return (
    <TiltCard
      className="h-full"
      corner={22}
      tilt={reduced ? 0 : config.pressTilt}
      shade={config.shade}
      tune={config.spring}
      depth={config.depth}
      sink={reduced ? 0 : config.sink}
    >
      <div className="relative h-full">{children}</div>
    </TiltCard>
  );
}

/** A face-covering link to the policy. `hidden` is the duplicate on the
    second face: out of the tab order and the accessibility tree. */
function FaceLink({ href, label, hidden = false }: { href: string; label?: string; hidden?: boolean }) {
  return (
    <Link
      href={href}
      aria-label={hidden ? undefined : label}
      aria-hidden={hidden || undefined}
      tabIndex={hidden ? -1 : undefined}
      className="absolute inset-0 z-10 rounded-[22px] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
    />
  );
}

/** The card's front: the insurer and policy, its facts in the outlined panel. */
export function PolicyCardFront({ policy, download = false }: { policy: ActivePolicy; download?: boolean }) {
  const fields = [
    { label: "Policy number", value: policy.policyNumber },
    { label: "Sum insured", value: policy.sumInsured },
    { label: "Coverage type", value: policy.coverageType },
    policy.term,
  ];
  return (
    <article aria-label={policy.name} className={`${face} min-h-[237px]`}>
      <div aria-hidden className="absolute inset-0 -z-10">
        <Topography variant="policy" />
        <Glow src="/dashboard/glow-card.svg" style={{ left: "86%", top: -107 }} />
      </div>
      {/* The Figma's blue dot: this card is current. */}
      {download ? null : <span aria-hidden className="absolute top-5 right-5 size-2 rounded-full bg-accent" />}

      <div className={`flex items-center gap-3.5 px-4 pt-4 ${download ? "pr-14" : "pr-10"}`}>
        <InsurerLogo insurer={policy.insurer} size={44} />
        <div className="min-w-0">
          <h3 className="truncate text-[17px] leading-[22px] font-semibold tracking-[-0.022em] text-label">
            {policy.name}
          </h3>
          <p className="mt-0.5 text-[13px] leading-[18px] text-label">{policy.kind}</p>
        </div>
      </div>

      <dl className={`${panel} mx-2 mt-3.5 mb-2 grid flex-1 grid-cols-2 content-center gap-x-4 gap-y-6 px-5 py-5`}>
        {fields.map((field) => (
          <div key={field.label} className="min-w-0">
            <dt className="text-[13px] leading-[18px] text-label-secondary">{field.label}</dt>
            <dd className="mt-1.5 text-[15px] leading-5 font-medium text-label tabular-nums">{field.value}</dd>
          </div>
        ))}
      </dl>
      <CardFoil />
      {download ? <DownloadPill policy={policy} /> : null}
    </article>
  );
}

/** Saves the card as a PNG: a small icon button in the card's top-right
    corner, inside the card so it tilts with it. It shows a tick for a moment
    afterwards. */
function DownloadPill({ policy }: { policy: ActivePolicy }) {
  const [saved, setSaved] = useState(false);
  return (
    <button
      type="button"
      aria-label={saved ? "Card saved" : "Download card"}
      title="Download card"
      onClick={async (event) => {
        event.stopPropagation();
        await downloadPolicyCard(policy);
        setSaved(true);
        window.setTimeout(() => setSaved(false), 1600);
      }}
      className="absolute top-3 right-3 z-20 grid size-9 place-items-center rounded-full text-label-secondary transition-[background-color,color,transform] duration-150 ease-out hover:bg-black/[0.05] hover:text-label active:scale-[0.92]"
    >
      {saved ? (
        <IconCheck size={16} className="text-green-text" />
      ) : (
        <svg aria-hidden width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M8 2v8.5m0 0L4.75 7.25M8 10.5l3.25-3.25M2.75 13.25h10.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
    </button>
  );
}

/** The card in miniature: white, with its panel and blue dot, for showing
    which policy something is on. */
export function MiniPolicyCard() {
  return (
    <span
      aria-hidden
      className="relative block h-[30px] w-[46px] shrink-0 overflow-hidden rounded-[7px] bg-surface shadow-[0_0_0_0.5px_rgb(0_0_0_/_0.1),0_1px_3px_rgb(0_0_0_/_0.1)]"
    >
      <span className="absolute -top-2 -right-2 size-6 rounded-full bg-accent-tint" />
      <span className="absolute top-[4px] right-[4px] size-[4px] rounded-full bg-accent" />
      <span className="absolute inset-x-[3px] top-[12px] bottom-[3px] rounded-[3px] border border-black/[0.08]" />
    </span>
  );
}

function PeopleGroup({ label, members }: { label: string; members: Member[] }) {
  return (
    <div>
      <h4 className="text-[13px] leading-[18px] text-label-secondary">{label}</h4>
      <ul className="mt-3 flex flex-col gap-[15px]">
        {members.map((member) => (
          <MemberRow key={member.name} member={member} />
        ))}
      </ul>
    </div>
  );
}

function MemberRow({ member }: { member: Member }) {
  return (
    <li className="flex min-h-5 items-center justify-between gap-3">
      <span className="flex min-w-0 items-center gap-2">
        <Asset src={art(member.primary ? "member-primary.svg" : "member.svg")} className="size-[18px] shrink-0" />
        <span className="truncate text-[15px] leading-5 font-medium text-label">{member.name}</span>
      </span>
      <span className="flex h-6 shrink-0 items-center gap-1.5 rounded-full bg-fill px-2.5">
        <Asset src={art("calendar.svg")} className="size-2.5" />
        <span className="text-[11px] leading-none font-medium tracking-[0.04em] text-grey-text uppercase tabular-nums">
          <span className="sr-only">Born </span>
          {member.dob}
        </span>
      </span>
    </li>
  );
}
