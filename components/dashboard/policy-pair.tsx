import Link from "next/link";
import { Asset, Glow } from "@/components/ui/asset";
import { FieldItem } from "@/components/ui/card-bits";
import { InsurerLogo } from "@/components/ui/insurer-logo";
import { Topography } from "@/components/dashboard/topography";
import type { ActivePolicy, Member } from "@/lib/dashboard-data";

/**
 * One policy as the pair of cards in node 149:9845: the policy on the left,
 * who it covers on the right. `muted` is the lapsed version from the inactive
 * tab (node 149:10420): grey mark, grey contours, grey dot, no shadow.
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
  return (
    <div className="grid gap-5 sm:grid-cols-2">
      <PolicyCard policy={policy} href={href} muted={muted} />
      <MembersCard policy={policy} muted={muted} />
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
      className={`relative isolate overflow-hidden rounded-2xl border border-card-border bg-white p-[6px] pb-2 transition-[border-color,box-shadow] duration-150 ease-out ${
        muted ? "" : "shadow-policy"
      } ${
        href
          ? "has-[a:focus-visible]:outline-2 has-[a:focus-visible]:outline-offset-2 has-[a:focus-visible]:outline-primary-strong [@media(hover:hover)]:has-[a:hover]:border-grey-300 [@media(hover:hover)]:has-[a:hover]:shadow-card"
          : ""
      }`}
    >
      <div className="absolute inset-0 -z-10">
        <Topography variant="policy" muted={muted} />
        <Glow
          src={muted ? "/dashboard/glow-card-inactive.svg" : "/dashboard/glow-card.svg"}
          style={{ left: 313, top: -107 }}
        />
        <Asset
          src={muted ? "/dashboard/dot-inactive.svg" : "/dashboard/dot-active.svg"}
          className="absolute top-[11px] right-[11px] size-2"
        />
      </div>

      <div className="flex items-center gap-3 px-2 pt-2">
        <InsurerLogo insurer={policy.insurer} muted={muted} />
        <div className="min-w-0">
          <h3 className="text-[16px] leading-[normal] font-semibold text-ink-title">
            {href ? (
              <Link
                href={href}
                className="after:absolute after:inset-0 after:rounded-2xl focus-visible:outline-none"
              >
                {policy.name}
              </Link>
            ) : (
              policy.name
            )}
          </h3>
          <p className="mt-1 text-[12px] leading-[normal] text-ink">{policy.kind}</p>
        </div>
      </div>

      <dl className="mt-3 grid grid-cols-[179px_1fr] gap-y-[29px] rounded-xl border border-grey-200 bg-white px-[19px] pt-[23px] pb-[27px] shadow-panel max-[389px]:grid-cols-2">
        <FieldItem gap="loose" field={{ label: "Policy number", value: policy.policyNumber }} />
        <FieldItem gap="loose" field={{ label: "Sum Insured", value: policy.sumInsured }} />
        <FieldItem gap="loose" field={{ label: "Coverage Type", value: policy.coverageType }} />
        <FieldItem gap="loose" field={policy.term} />
      </dl>
    </article>
  );
}

function MembersCard({ policy, muted }: { policy: ActivePolicy; muted: boolean }) {
  const people = policy.people;

  return (
    <article
      aria-label={`People on ${policy.name}`}
      className={`relative overflow-hidden rounded-2xl border border-card-border bg-white p-[6px] pb-0 ${
        muted ? "" : "shadow-policy"
      }`}
    >
      <Topography variant="members" muted={muted} />

      <div className="relative min-h-[193px] rounded-xl border border-grey-200 bg-white px-[18px] pt-5 pb-[18px] shadow-panel">
        {people.layout === "members" ? (
          <PeopleGroup label="Member Details" members={people.members} />
        ) : (
          <div className="flex flex-col gap-6">
            <PeopleGroup label="Member Detail" members={[people.member]} />
            <PeopleGroup label="Nominee Detail" members={[people.nominee]} />
          </div>
        )}
      </div>

      <p className="relative px-5 pt-2 pb-3 text-[10px] leading-4 text-ink-label">
        Your health card, download for your reference.
      </p>
    </article>
  );
}

function PeopleGroup({ label, members }: { label: string; members: Member[] }) {
  return (
    <div>
      <h4 className="text-[12px] leading-4 text-ink-label">{label}</h4>
      <ul className="mt-3 flex flex-col gap-[15px]">
        {members.map((member) => (
          <li key={member.name} className="flex items-center justify-between gap-3">
            <span className="flex min-w-0 items-center gap-2">
              <Asset
                src={member.primary ? "/dashboard/member-primary.svg" : "/dashboard/member.svg"}
                className="size-[18px] shrink-0"
              />
              <span className="truncate text-[14px] leading-4 font-medium tracking-[-0.5px] text-ink">
                {member.name}
              </span>
            </span>
            <span className="flex h-5 min-w-[104px] shrink-0 items-center justify-center gap-1.5 rounded-full bg-grey-100 px-2">
              <Asset src="/dashboard/calendar-sm.svg" className="size-2.5" />
              <span className="sr-only">Born </span>
              <span className="text-[10px] leading-[normal] font-medium tracking-[0.5px] text-grey-700 uppercase tabular-nums">
                {member.dob}
              </span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
