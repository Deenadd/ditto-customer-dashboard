import Link from "next/link";
import { Glow } from "@/components/ui/asset";
import { FieldItem, StatusPill, cardClass } from "@/components/ui/card-bits";
import { InsurerLogo } from "@/components/ui/insurer-logo";
import { Topography } from "@/components/dashboard/topography";
import { PolicyCardPair } from "@/components/dashboard/health-card";
import { toneOf } from "@/lib/card-fields";
import type { ActivePolicy, Member } from "@/lib/dashboard-data";

/**
 * One policy as two cards: the policy on the left, who it covers on the
 * right. `muted` is the lapsed version: grey mark, grey contour lines.
 */
export function PolicyPair({
  policy,
  href,
  muted = false,
}: {
  policy: ActivePolicy;
  href?: string;
  muted?: boolean;
}) {
  /* An active policy is drawn as its card: blue for health, green for term. */
  if (!muted) return <PolicyCardPair policy={policy} href={href} tone={toneOf(policy)} />;
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <PolicyCard policy={policy} href={href} muted={muted} />
      <PeopleCard policy={policy} />
    </div>
  );
}

function PolicyCard({
  policy,
  href,
  muted,
}: {
  policy: ActivePolicy;
  href?: string;
  muted: boolean;
}) {
  return (
    <article
      className={`group relative isolate flex flex-col overflow-hidden ${cardClass} p-5 transition-[box-shadow,transform] duration-200 ease-out ${
        href
          ? "has-[a:focus-visible]:outline-2 has-[a:focus-visible]:outline-offset-2 has-[a:focus-visible]:outline-accent has-[a:active]:scale-[0.99] [@media(hover:hover)]:has-[a:hover]:shadow-raised"
          : ""
      }`}
    >
      <div aria-hidden className="absolute inset-0 -z-10">
        <Topography variant="policy" muted={muted} />
        <Glow
          src={muted ? "/dashboard/glow-card-inactive.svg" : "/dashboard/glow-card.svg"}
          style={{ left: 313, top: -107 }}
        />
      </div>

      <div className="flex items-start gap-3.5">
        <InsurerLogo insurer={policy.insurer} muted={muted} />
        <div className="min-w-0 flex-1">
          <h3 className="text-[17px] leading-[22px] font-semibold tracking-[-0.022em] text-label">
            {href ? (
              <Link
                href={href}
                className="after:absolute after:inset-0 after:rounded-[22px] focus-visible:outline-none"
              >
                {policy.name}
              </Link>
            ) : (
              policy.name
            )}
          </h3>
          <p className="mt-0.5 text-[13px] leading-[18px] text-label-secondary">{policy.kind}</p>
        </div>
        <StatusPill status={muted ? "expired" : "active"} />
      </div>

      <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-4 rounded-[14px] bg-fill-soft px-4 py-3.5 shadow-[inset_0_0_0_1px_rgb(0_0_0_/_0.04)]">
        <FieldItem field={{ label: "Policy number", value: policy.policyNumber }} />
        <FieldItem field={{ label: "Sum insured", value: policy.sumInsured }} />
        <FieldItem field={{ label: "Coverage type", value: policy.coverageType }} />
        <FieldItem field={policy.term} />
      </dl>

      {href ? (
        <p
          aria-hidden
          className="mt-auto flex items-center gap-1.5 pt-4 text-[14px] leading-5 font-medium text-accent-text"
        >
          View policy
          <Chevron />
        </p>
      ) : null}
    </article>
  );
}

function PeopleCard({ policy }: { policy: ActivePolicy }) {
  const people = policy.people;

  return (
    <article aria-label={`People on ${policy.name}`} className={`${cardClass} p-5`}>
      {people.layout === "members" ? (
        <PeopleGroup label="Members" members={people.members} />
      ) : (
        <div className="flex flex-col gap-5">
          <PeopleGroup label="Life assured" members={[people.member]} />
          <PeopleGroup label="Nominee" members={[people.nominee]} />
        </div>
      )}
    </article>
  );
}

function PeopleGroup({ label, members }: { label: string; members: Member[] }) {
  return (
    <div>
      <h4 className="text-[12px] leading-4 font-semibold text-label-secondary">{label}</h4>
      <ul className="mt-3 flex flex-col gap-3">
        {members.map((member) => (
          <li key={member.name} className="flex items-center gap-3">
            <Monogram name={member.name} primary={member.primary} />
            <div className="min-w-0">
              <p className="truncate text-[15px] leading-5 font-medium text-label">{member.name}</p>
              <p className="text-[12px] leading-4 text-label-secondary tabular-nums">
                Born {member.dob}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Contacts-style initials; the policyholder gets the accent tint. */
export function Monogram({ name, primary }: { name: string; primary?: boolean }) {
  const initials = name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("");
  return (
    <span
      aria-hidden
      className={`grid size-9 shrink-0 place-items-center rounded-full text-[13px] font-semibold tracking-[0.02em] ${
        primary ? "bg-accent-tint text-accent-text" : "bg-fill-strong text-grey-text"
      }`}
    >
      {initials}
    </span>
  );
}

/** SF-style chevron, nudged forward on hover of its group. */
export function Chevron({ className = "" }: { className?: string }) {
  return (
    <svg
      aria-hidden
      width="7"
      height="12"
      viewBox="0 0 7 12"
      fill="none"
      className={`shrink-0 transition-transform duration-200 ease-out [@media(hover:hover)]:group-hover:translate-x-0.5 ${className}`}
    >
      <path
        d="M1.25 1.25 5.75 6l-4.5 4.75"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
