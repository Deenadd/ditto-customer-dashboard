import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Avatar } from "@/registry/components/avatar/avatar";
import { FieldItem, StatusBadge, cardClass } from "@/components/ui/card-bits";
import { InsurerLogo } from "@/components/ui/insurer-logo";
import type { ActivePolicy, Member } from "@/lib/dashboard-data";

/**
 * One policy as two cards side by side: the policy, and who it covers.
 * Siblings share a top and a height, with a real gap between them.
 * `muted` is the lapsed version on the inactive tab.
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
    <div className="grid items-stretch gap-4 sm:grid-cols-2">
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
      className={`group relative flex flex-col ${cardClass} p-5 transition-[background-color,border-color] duration-150 ease-[var(--ease-standard)] ${
        href
          ? "has-[a:focus-visible]:outline-2 has-[a:focus-visible]:outline-offset-2 has-[a:focus-visible]:outline-[var(--focus-ring)] [@media(hover:hover)]:has-[a:hover]:border-[var(--border-strong)]"
          : ""
      }`}
    >
      <div className="flex items-start gap-3.5">
        <InsurerLogo insurer={policy.insurer} muted={muted} />
        <div className="min-w-0 flex-1">
          <h3 className="text-base font-medium text-label">
            {href ? (
              <Link
                href={href}
                className="after:absolute after:inset-0 after:rounded-surface focus-visible:outline-none"
              >
                {policy.name}
              </Link>
            ) : (
              policy.name
            )}
          </h3>
          <p className="mt-0.5 text-sm text-label-secondary">{policy.kind}</p>
        </div>
        <StatusBadge status={muted ? "expired" : "active"} />
      </div>

      <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-4 border-t border-separator-subtle pt-4">
        <FieldItem field={{ label: "Policy number", value: policy.policyNumber }} />
        <FieldItem field={{ label: "Sum insured", value: policy.sumInsured }} />
        <FieldItem field={{ label: "Coverage type", value: policy.coverageType }} />
        <FieldItem field={policy.term} />
      </dl>

      {href ? (
        <p
          aria-hidden
          className="mt-auto flex items-center gap-1 pt-4 text-sm font-medium text-accent"
        >
          View policy
          <ChevronRight
            size={16}
            strokeWidth={1.75}
            className="transition-transform duration-200 ease-[var(--ease-standard)] [@media(hover:hover)]:group-hover:translate-x-0.5"
          />
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
      <h4 className="text-xs text-label-secondary">{label}</h4>
      <ul className="mt-3 flex flex-col gap-3">
        {members.map((member) => (
          <li key={member.name} className="flex items-center gap-3">
            <Avatar name={member.name} size="md" />
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-label">{member.name}</p>
              <p className="text-xs text-label-secondary tabular-nums">Born {member.dob}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
