import Image from "next/image";
import type { ReactNode } from "react";
import { Asset, Glow, Sparkles, type Sparkle } from "@/components/ui/asset";
import { cardClass } from "@/components/ui/card-bits";
import { BuddyButton } from "@/components/dashboard/ditto-buddy";

const star = (name: string) => `/dashboard/${name}.svg`;

/** The star scatter from the welcome card (node 149:8897), as placed in Figma. */
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

/** White card with two soft glows and a scatter of sparkles up top. */
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
      className={`relative isolate overflow-hidden ${cardClass}`}
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

/**
 * The foot of a sidebar card: a prompt, Chat now and a mascot peeking in
 * from the bottom-right corner. Chat now is tinted, not filled, so the main
 * column keeps the one filled action.
 */
export function HelpBlock({
  title,
  body,
  mascot,
}: {
  title: string;
  body: string;
  mascot: "hotline" | "laptop";
}) {
  return (
    <div className="relative isolate mx-5 border-t border-separator pt-5 pb-6">
      {mascot === "hotline" ? (
        <>
          <Glow src="/dashboard/glow-1450.svg" style={{ left: 162, bottom: -70, zIndex: -1 }} />
          <div
            aria-hidden
            className="absolute right-[-26px] bottom-[-59px] -z-10 h-[185px] w-[125px] overflow-hidden"
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
          <Glow src="/dashboard/glow-1450.svg" style={{ left: 162, bottom: -94, zIndex: -1 }} />
          <Image
            src="/dashboard/mascot-laptop.png"
            alt=""
            width={799}
            height={786}
            sizes="148px"
            className="absolute right-[-13px] bottom-[-33px] -z-10 h-[145px] w-[148px] object-cover"
          />
        </>
      )}

      <h3 className="text-[17px] leading-[22px] font-semibold tracking-[-0.022em] text-label">
        {title}
      </h3>
      <p className="mt-1 max-w-[200px] text-[14px] leading-5 text-balance text-label-secondary">{body}</p>
      <BuddyButton variant="tinted" className="mt-4">
        Chat now
      </BuddyButton>
    </div>
  );
}

/**
 * Welcome card. A customer with nothing pending sees zero requests and an
 * invitation to talk about a new policy instead of the help prompt.
 */
export function WelcomeCard({
  firstName,
  memberSince,
  activePolicies,
  requirementRequests,
}: {
  firstName: string;
  memberSince: string;
  activePolicies: number;
  requirementRequests: number;
}) {
  const hasPending = requirementRequests > 0;

  return (
    <SidebarCard sparkles={welcomeStars} labelledBy="welcome-title">
      <div className="px-5 pt-6 pb-5">
        <h2
          id="welcome-title"
          className="text-[28px] leading-[34px] font-bold tracking-[-0.025em] text-label"
        >
          Hi, {firstName} <span aria-hidden>👋</span>
        </h2>
        <p className="mt-1.5 max-w-[260px] text-[15px] leading-[22px] text-label-secondary">
          Hope you&rsquo;re staying safe and healthy. Here&rsquo;s where you left off.
        </p>
        <p className="mt-3 flex items-center gap-1.5 text-[13px] leading-[18px] text-label-secondary">
          <Asset src="/dashboard/calendar.svg" className="size-3.5" />
          Member since {memberSince}
        </p>

        <dl className="mt-5 grid grid-cols-2 gap-2">
          <Stat label="Active policies" value={activePolicies} />
          <Stat label="Open requests" value={requirementRequests} />
        </dl>
      </div>

      {hasPending ? (
        <HelpBlock title="Need help?" body="Talk to us for an instant response." mascot="hotline" />
      ) : (
        <HelpBlock
          title="Need a new policy?"
          body="Our team can help you find the right cover."
          mascot="laptop"
        />
      )}
    </SidebarCard>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex flex-col-reverse rounded-[14px] bg-fill/85 px-3.5 py-3 backdrop-blur-sm">
      <dt className="text-[13px] leading-[18px] text-label-secondary">{label}</dt>
      <dd className="text-[28px] leading-[34px] font-semibold tracking-[-0.02em] text-label tabular-nums">
        {value}
      </dd>
    </div>
  );
}
