import Image from "next/image";
import type { ReactNode } from "react";
import { Asset, Glow, Sparkles, type Sparkle } from "@/components/ui/asset";
import { PrimaryButton } from "@/components/ui/buttons";

const star = (name: string) => `/dashboard/${name}.svg`;

/** The star scatter on the welcome card (node 149:8897), as placed in Figma. */
export const welcomeStars: Sparkle[] = [
  { src: star("star-1"), left: 187, top: 13, width: 6 },
  { src: star("star-5"), left: 234, top: 19, width: 9 },
  { src: star("star-5"), left: 311, top: 52, width: 9 },
  { src: star("star-5"), left: 143, top: -4, width: 9 },
  { src: star("star-6"), left: 246, top: 40, width: 13 },
  { src: star("star-6"), left: 294, top: 22, width: 13 },
  { src: star("star-3"), left: 209, top: 5, width: 9 },
  { src: star("star-4"), left: 163, top: 5, width: 11 },
  { src: star("star-15"), left: 211, top: -1, width: 11 },
  { src: star("star-9"), left: 285, top: 5, width: 5 },
  { src: star("star-10"), left: 279, top: 41, width: 9 },
  { src: star("star-2"), left: 205, top: 25, width: 13 },
  { src: star("star-13"), left: 312, top: 9, width: 9 },
  { src: star("star-2"), left: 246, top: 1, width: 13 },
  { src: star("star-10"), left: 269, top: 18, width: 9 },
];

/**
 * White card with the two soft glows in its top corners, shared by the
 * welcome card and the policy page's quick-links card.
 */
export function SidebarCard({
  sparkles,
  children,
  labelledBy,
}: {
  sparkles: Sparkle[];
  children: ReactNode;
  labelledBy: string;
}) {
  return (
    <section
      aria-labelledby={labelledBy}
      className="relative isolate overflow-hidden rounded-2xl border border-grey-200 bg-white shadow-card"
    >
      <div aria-hidden className="absolute inset-0 -z-10">
        <Glow src="/dashboard/glow-1449.svg" style={{ left: 190, top: -100 }} />
        <Glow src="/dashboard/glow-1450.svg" style={{ left: -55, top: -127 }} />
        <Sparkles items={sparkles} />
      </div>
      {children}
    </section>
  );
}

/** 26px two-line greeting at the top of a sidebar card. */
export function SidebarTitle({ id, children }: { id: string; children: ReactNode }) {
  return (
    <h2
      id={id}
      className="text-[26px] leading-[1.2] font-semibold tracking-[-1px] text-ink"
    >
      {children}
    </h2>
  );
}

export function SidebarIntro() {
  return (
    <p className="mt-[10px] max-w-[277px] text-[14px] leading-5 text-ink-secondary">
      Hope you&rsquo;re staying safe and healthy. Let&rsquo;s jump into where you
      left off.
    </p>
  );
}

/**
 * The foot of a sidebar card: a prompt, the Chat now button and a mascot
 * peeking in from the bottom-right corner.
 */
export function HelpBlock({
  title,
  body,
  mascot,
  roomy = false,
}: {
  title: string;
  body: string;
  mascot: "hotline" | "laptop";
  /** The policy page's card sits the prompt further below the rule. */
  roomy?: boolean;
}) {
  return (
    <div
      className={`relative isolate border-t border-grey-100 px-[19px] ${
        mascot === "laptop" ? "pt-[23px] pb-[30px]" : roomy ? "pt-[25px] pb-6" : "pt-[19px] pb-6"
      }`}
    >
      {mascot === "hotline" ? (
        <>
          <Glow src="/dashboard/glow-1450.svg" style={{ left: 182, bottom: -70, zIndex: -1 }} />
          <div
            aria-hidden
            className="absolute right-[-6px] bottom-[-59px] -z-10 h-[185px] w-[125px] overflow-hidden"
          >
            <Image
              src="/dashboard/mascot-hotline.png"
              alt=""
              width={1920}
              height={1248}
              sizes="330px"
              className="absolute top-[-15.77%] left-[-93.98%] h-[115.77%] w-[262.65%] max-w-none"
            />
          </div>
        </>
      ) : (
        <>
          <Glow src="/dashboard/glow-1450.svg" style={{ left: 182, bottom: -94, zIndex: -1 }} />
          <Image
            src="/dashboard/mascot-laptop.png"
            alt=""
            width={799}
            height={786}
            sizes="148px"
            className="absolute right-[7px] bottom-[-33px] -z-10 h-[145px] w-[148px] object-cover"
          />
        </>
      )}

      <h3 className="text-[18px] leading-[normal] font-semibold text-ink">{title}</h3>
      <p
        className={`mt-2 text-[14px] leading-5 text-ink-secondary ${
          mascot === "laptop" ? "max-w-[195px]" : "max-w-[225px]"
        }`}
      >
        {body}
      </p>
      <PrimaryButton size="small" className={mascot === "laptop" ? "mt-5" : "mt-[14px]"}>
        Chat now
      </PrimaryButton>
    </div>
  );
}

/**
 * Welcome card (node 149:8897). A customer with nothing pending sees the
 * version from node 149:10519: no requirement count, and an invitation to
 * talk about a new policy in place of the help prompt.
 */
export function WelcomeCard({
  name,
  memberSince,
  activePolicies,
  requirementRequests,
}: {
  name: string;
  memberSince: string;
  activePolicies: number;
  /** Omitted when there is nothing pending. */
  requirementRequests?: number;
}) {
  const hasPending = requirementRequests !== undefined;

  return (
    <SidebarCard sparkles={welcomeStars} labelledBy="welcome-title">
      <div className="px-[19px] pt-[30px] pb-[19px]">
        <SidebarTitle id="welcome-title">
          Welcome,
          <br />
          {name} <span aria-hidden>👋</span>
        </SidebarTitle>
        <SidebarIntro />

        <p className="mt-5 flex items-center gap-2 text-[13px] leading-none text-ink-label">
          <Asset src="/dashboard/calendar.svg" className="size-3.5" />
          Member Since {memberSince}
        </p>

        <dl className="mt-5 border-t border-grey-100 pt-5">
          <CountRow icon="/dashboard/file-heart.svg" label="Active Policies" value={activePolicies} />
          {hasPending ? (
            <CountRow
              icon="/dashboard/file-question.svg"
              label="Requirement Request"
              value={requirementRequests}
              className="mt-[15px]"
            />
          ) : null}
        </dl>
      </div>

      {hasPending ? (
        <HelpBlock title="Need help?" body="Talk to us for instant response" mascot="hotline" />
      ) : (
        <HelpBlock
          title="Need New Policy?"
          body="We have no current requests. Contact our team for an insurance policy."
          mascot="laptop"
        />
      )}
    </SidebarCard>
  );
}

function CountRow({
  icon,
  label,
  value,
  className = "",
}: {
  icon: string;
  label: string;
  value: number;
  className?: string;
}) {
  return (
    <div className={`flex h-5 items-center gap-2 ${className}`}>
      <Asset src={icon} className="ml-px size-4 shrink-0" />
      <dt className="flex-1 text-[15px] leading-[normal] tracking-[-0.25px] text-ink">{label}</dt>
      <dd className="text-[16px] leading-[normal] font-semibold tracking-[-0.25px] text-ink tabular-nums">
        {value}
      </dd>
    </div>
  );
}
