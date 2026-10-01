"use client";

import Link from "next/link";
import type { CSSProperties } from "react";
import { useCardConfig, type CardPalette, type CardTone } from "@/components/dashboard/card-config";
import { Asset } from "@/components/ui/asset";
import { GlareFace, GlareGroup } from "@/components/ui/glare";
import { InsurerLogo } from "@/components/ui/insurer-logo";
import type { ActivePolicy, Member } from "@/lib/dashboard-data";
import { meshLayers } from "@/lib/mesh";

const svgColor = (hex: string) => hex.replace("#", "%23");

/**
 * The frame: Figma's radial gradient (node 152:12882) with the palette's
 * colours, centre and reach, and any mesh points laid over it.
 */
export function frameBackground(palette: CardPalette): CSSProperties {
  const k = palette.spread;
  const cx = (palette.focusX / 100) * 365;
  const cy = (palette.focusY / 100) * 237;
  const radial = `url("data:image/svg+xml;utf8,<svg viewBox='0 0 365 237' xmlns='http://www.w3.org/2000/svg' preserveAspectRatio='none'><rect width='100%' height='100%' fill='url(%23g)'/><defs><radialGradient id='g' gradientUnits='userSpaceOnUse' cx='0' cy='0' r='10' gradientTransform='matrix(${18.7 * k} ${-8.3 * k} ${12.783 * k} ${28.8 * k} ${cx} ${cy})'><stop stop-color='${svgColor(palette.center)}' offset='0'/><stop stop-color='${svgColor(palette.mid)}' offset='${palette.midAt / 100}'/><stop stop-color='${svgColor(palette.edge)}' offset='1'/></radialGradient></defs></svg>")`;
  return {
    backgroundImage: [...meshLayers(palette.mesh), radial].join(", "),
    backgroundSize: "100% 100%",
  };
}

const face =
  "relative isolate flex h-full flex-col overflow-hidden rounded-[16px] shadow-card transition-shadow duration-200 ease-out [@media(hover:hover)]:group-has-[a:hover]:shadow-raised";

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

const art = (name: string) => `/dashboard/health-card/${name}`;

/** Paints `color` through an artwork's shape, so one drawing serves every tone. */
function tinted(src: string, color: string): CSSProperties {
  const mask = `url(${src})`;
  return { backgroundColor: color, maskImage: mask, WebkitMaskImage: mask, maskSize: "100% 100%", WebkitMaskSize: "100% 100%" };
}

/**
 * One wave line from the Figma frame. Figma rotates and skews each line
 * inside a sized box; container units keep its proportions, so the waves
 * scale with the card.
 */
function Wave({ box, src, color, opacity, bleed }: { box: string; src: string; color: string; opacity?: string; bleed?: string }) {
  return (
    <div className={`absolute flex items-center justify-center ${box}`} style={{ containerType: "size" }}>
      <div className="h-[hypot(-76.75cqw,24.69cqh)] w-[hypot(23.25cqw,75.31cqh)] flex-none rotate-[74.22deg] skew-x-[3.58deg]">
        <div className={`relative size-full ${opacity ?? ""}`}>
          <div className="absolute" style={{ inset: bleed ?? 0, ...tinted(src, color) }} />
        </div>
      </div>
    </div>
  );
}

const captions: Record<CardTone, string> = {
  blue: "Your health card, for your reference.",
  green: "Your policy card, for your reference.",
};

/**
 * A policy as a card, after node 152:12881: the policy on the front, its
 * people on the back, each a white card set in a gradient frame (blue for
 * health, green for term). Each face tilts and catches a glare on hover, and
 * the whole pair opens the policy when it has a page.
 */
export function PolicyCardPair({ policy, href, tone }: { policy: ActivePolicy; href?: string; tone: CardTone }) {
  const config = useCardConfig();
  const palette = config[tone];
  const frame = frameBackground(palette);
  const fields = [
    { label: "Policy number", value: policy.policyNumber },
    { label: "Sum insured", value: policy.sumInsured },
    { label: "Coverage type", value: policy.coverageType },
    policy.term,
  ];

  return (
    <GlareGroup settings={config} className="group relative grid gap-4 sm:grid-cols-2">
      <GlareFace>
        <article aria-label={policy.name} className={`${face} min-h-[237px]`} style={frame}>
          <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
            <Wave box="inset-[-99.16%_-48.22%_29.98%_47.67%]" src={art("front-shade-a.png")} color={palette.shade} opacity="opacity-15" />
            <Wave box="inset-[-99.16%_-48.22%_29.98%_47.67%]" src={art("front-shade-b.png")} color={palette.shade} opacity="opacity-15" />
            <Wave box="inset-[-61.86%_-23.7%_69.9%_69.06%]" src={art("front-wave-1.svg")} color={palette.wave} bleed="-36.99% -35.18%" />
            <Wave box="inset-[-79.39%_-36.59%_49.57%_59.39%]" src={art("front-wave-2.svg")} color={palette.wave} />
            <Wave box="inset-[-61.86%_-23.7%_69.9%_69.06%]" src={art("front-wave-3.svg")} color={palette.wave} />
            <div className="absolute top-[-106px] left-[86%] size-[156px]">
              <div className="absolute inset-[-64.1%]" style={tinted(art("corner-glow.svg"), palette.glow)} />
            </div>
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
      </GlareFace>

      <GlareFace>
        <article aria-label={`People on ${policy.name}`} className={face} style={frame}>
          <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
            <Wave box="inset-[29.11%_-48.22%_-98.29%_47.67%]" src={art("back-shade.png")} color={palette.shade} opacity="opacity-20" />
            <Wave box="inset-[48.88%_-36.59%_-78.7%_59.39%]" src={art("back-wave-1.svg")} color={palette.wave} />
            <Wave box="inset-[83.36%_-13.63%_-41.42%_79.13%]" src={art("back-wave-2.svg")} color={palette.wave} />
            <Wave box="inset-[66.41%_-23.7%_-58.37%_69.06%]" src={art("back-wave-3.svg")} color={palette.wave} />
          </div>

          <div className={`${inset} m-2 mb-0 flex flex-1 flex-col gap-5 px-5 pt-5 pb-5`}>
            {policy.people.layout === "members" ? (
              <PeopleGroup label="Member details" members={policy.people.members} />
            ) : (
              <>
                <PeopleGroup label="Life assured" members={[policy.people.member]} />
                <PeopleGroup label="Nominee" members={[policy.people.nominee]} />
              </>
            )}
          </div>
          <p className="px-4 py-2.5 text-center text-[12px] leading-4 font-medium text-white">{captions[tone]}</p>
          <Bevel />
        </article>
      </GlareFace>

      {href ? (
        <Link
          href={href}
          aria-label={`${policy.name}, view policy details`}
          className="absolute inset-0 z-10 rounded-[16px] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
        />
      ) : null}
    </GlareGroup>
  );
}

function PeopleGroup({ label, members }: { label: string; members: Member[] }) {
  return (
    <div>
      <h4 className="text-[12px] leading-4 text-label-secondary">{label}</h4>
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
