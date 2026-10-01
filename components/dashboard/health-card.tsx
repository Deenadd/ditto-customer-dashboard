import Link from "next/link";
import type { CSSProperties } from "react";
import { Asset, Glow } from "@/components/ui/asset";
import { InsurerLogo } from "@/components/ui/insurer-logo";
import type { ActivePolicy, Member } from "@/lib/dashboard-data";

/* The frame's radial gradient, as Figma draws it (node 152:12882):
   #069BFE at the heart, #17CCF9 at 68%, #1FA0F7 at the rim. */
const frame: CSSProperties = {
  backgroundImage:
    "url(\"data:image/svg+xml;utf8,<svg viewBox='0 0 365 237' xmlns='http://www.w3.org/2000/svg' preserveAspectRatio='none'><rect x='0' y='0' height='100%' width='100%' fill='url(%23grad)'/><defs><radialGradient id='grad' gradientUnits='userSpaceOnUse' cx='0' cy='0' r='10' gradientTransform='matrix(18.7 -8.3 12.783 28.8 187 83)'><stop stop-color='rgba(6,155,254,1)' offset='0'/><stop stop-color='rgba(23,204,249,1)' offset='0.68277'/><stop stop-color='rgba(31,160,247,1)' offset='1'/></radialGradient></defs></svg>\")",
  backgroundSize: "100% 100%",
};

const face =
  "relative isolate flex flex-col overflow-hidden rounded-[16px] shadow-card transition-[transform,box-shadow] duration-200 ease-out group-has-[a:active]:scale-[0.99] [@media(hover:hover)]:group-has-[a:hover]:shadow-raised";

/* White inset card: 12px corners inside the 16px frame and its 8px margin. */
const inset =
  "rounded-[12px] bg-surface drop-shadow-[0px_58px_11.5px_rgba(0,0,0,0.01)] drop-shadow-[0px_33px_10px_rgba(0,0,0,0.05)] drop-shadow-[0px_15px_7.5px_rgba(0,0,0,0.09)] drop-shadow-[0px_4px_4px_rgba(0,0,0,0.1)]";

/** Light catching the frame's top edge, and its shade along the bottom. */
function Bevel() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 rounded-[inherit] shadow-[inset_0px_1px_4px_0px_rgba(255,255,255,0.49),inset_0px_-1px_4px_0px_rgba(0,0,0,0.25)]"
    />
  );
}

/**
 * One wave line from the Figma frame. Figma rotates and skews each line
 * inside a sized box; the box and the line keep its proportions with
 * container units, so the waves scale with the card.
 */
function Wave({ box, src, opacity, bleed }: { box: string; src: string; opacity?: string; bleed?: string }) {
  return (
    <div className={`absolute flex items-center justify-center ${box}`} style={{ containerType: "size" }}>
      <div className="h-[hypot(-76.75cqw,24.69cqh)] w-[hypot(23.25cqw,75.31cqh)] flex-none rotate-[74.22deg] skew-x-[3.58deg]">
        <div className={`relative size-full ${opacity ?? ""}`}>
          {bleed ? (
            <div className="absolute" style={{ inset: bleed }}>
              <Asset src={src} className="size-full" />
            </div>
          ) : (
            <Asset src={src} className="absolute inset-0 size-full" />
          )}
        </div>
      </div>
    </div>
  );
}

const art = (name: string) => `/dashboard/health-card/${name}`;

/**
 * The health policy as a health card, after node 152:12881: the policy on the
 * front, its members on the back, each a white card set in the blue frame.
 * The whole pair opens the policy.
 */
export function HealthCardPair({ policy, href }: { policy: ActivePolicy; href?: string }) {
  const members = policy.people.layout === "members" ? policy.people.members : [policy.people.member, policy.people.nominee];
  const fields = [
    { label: "Policy number", value: policy.policyNumber },
    { label: "Sum insured", value: policy.sumInsured },
    { label: "Coverage type", value: policy.coverageType },
    policy.term,
  ];

  return (
    <div className="group relative grid gap-4 sm:grid-cols-2">
      <article aria-label={policy.name} className={`${face} min-h-[237px]`} style={frame}>
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
          <Wave box="inset-[-99.16%_-48.22%_29.98%_47.67%]" src={art("front-shade-a.png")} opacity="opacity-15" />
          <Wave box="inset-[-99.16%_-48.22%_29.98%_47.67%]" src={art("front-shade-b.png")} opacity="opacity-15" />
          <Wave box="inset-[-61.86%_-23.7%_69.9%_69.06%]" src={art("front-wave-1.svg")} bleed="-36.99% -35.18%" />
          <Wave box="inset-[-79.39%_-36.59%_49.57%_59.39%]" src={art("front-wave-2.svg")} />
          <Wave box="inset-[-61.86%_-23.7%_69.9%_69.06%]" src={art("front-wave-3.svg")} />
          <Glow src={art("corner-glow.svg")} style={{ left: "86%", top: -106 }} />
        </div>

        <div className="flex items-center gap-3 px-4 pt-4">
          <span className="shrink-0 rounded-[12px] border-2 border-white shadow-[0px_6px_24px_0px_rgba(0,0,0,0.07)]">
            <InsurerLogo insurer={policy.insurer} size={40} />
          </span>
          <div className="min-w-0 text-white">
            <h3 className="truncate text-[16px] leading-5 font-semibold tracking-[-0.01em]">{policy.name}</h3>
            <p className="mt-0.5 text-[12px] leading-4 font-medium">{policy.kind}</p>
          </div>
        </div>

        <dl className={`${inset} mx-2 mt-3 mb-2 grid flex-1 grid-cols-2 content-center gap-x-4 gap-y-7 px-5 py-6`}>
          {fields.map((field) => (
            <div key={field.label} className="min-w-0">
              <dt className="text-[12px] leading-4 text-label-secondary">{field.label}</dt>
              <dd className="mt-2 text-[14px] leading-4 font-semibold text-label tabular-nums">{field.value}</dd>
            </div>
          ))}
        </dl>
        <Bevel />
      </article>

      <article aria-label={`Members on ${policy.name}`} className={face} style={frame}>
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
          <Wave box="inset-[29.11%_-48.22%_-98.29%_47.67%]" src={art("back-shade.png")} opacity="opacity-20" />
          <Wave box="inset-[48.88%_-36.59%_-78.7%_59.39%]" src={art("back-wave-1.svg")} />
          <Wave box="inset-[83.36%_-13.63%_-41.42%_79.13%]" src={art("back-wave-2.svg")} />
          <Wave box="inset-[66.41%_-23.7%_-58.37%_69.06%]" src={art("back-wave-3.svg")} />
        </div>

        <div className={`${inset} m-2 mb-0 flex-1 px-5 pt-5 pb-5`}>
          <h4 className="text-[12px] leading-4 text-label-secondary">
            {policy.people.layout === "members" ? "Member details" : "Life assured and nominee"}
          </h4>
          <ul className="mt-3 flex flex-col gap-[15px]">
            {members.map((member) => (
              <MemberRow key={member.name} member={member} />
            ))}
          </ul>
        </div>
        <p className="px-4 py-2.5 text-center text-[12px] leading-4 font-medium text-white">
          Your health card, for your reference.
        </p>
        <Bevel />
      </article>

      {href ? (
        <Link
          href={href}
          aria-label={`${policy.name}, view policy details`}
          className="absolute inset-0 z-10 rounded-[16px] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
        />
      ) : null}
    </div>
  );
}

function MemberRow({ member }: { member: Member }) {
  return (
    <li className="flex min-h-5 items-center justify-between gap-3">
      <span className="flex min-w-0 items-center gap-2">
        <Asset src={art(member.primary ? "member-primary.svg" : "member.svg")} className="size-[18px] shrink-0" />
        <span className="truncate text-[14px] leading-4 font-medium text-label">{member.name}</span>
      </span>
      <span className="flex h-5 shrink-0 items-center gap-1.5 rounded-full bg-fill px-2">
        <Asset src={art("calendar.svg")} className="size-2.5" />
        <span className="text-[11px] leading-none font-medium tracking-[0.04em] text-grey-text uppercase tabular-nums">
          <span className="sr-only">Born </span>
          {member.dob}
        </span>
      </span>
    </li>
  );
}
