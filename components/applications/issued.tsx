import Link from "next/link";
import { ContactLinks } from "@/components/applications/contact-links";
import { ShareButton } from "@/components/applications/share-button";
import { Glow } from "@/components/ui/asset";
import { buttonClass } from "@/components/ui/buttons";
import { StatusPill, cardClass, cardTitleClass } from "@/components/ui/card-bits";
import { IconCheck, IconClaim, IconHelp, IconRenew, type Icon } from "@/components/ui/icons";
import { applicationHeadline, thingsToNote } from "@/lib/application-detail";
import type { ActivePolicy, Application } from "@/lib/dashboard-data";
import { policyHref, type Customer } from "@/lib/routes";

/* The new-claim page, spelt as lib/claims' newClaimHref spells it; that
   module is client-only (it keeps the claims), so a server page can't call it. */
const newClaimHref = (policyId: string, customer: Customer) =>
  `/dashboard/policies/${encodeURIComponent(policyId)}/claims/new${customer === "new" ? "?customer=new" : ""}`;

/*
 * An issued application's page, after the Figma screen (node 210:7358):
 * the good news, the policy card (from health-card.tsx), where to go next,
 * what's good to know, and the cover (the policy page's own cards) with
 * the waiting periods.
 */

/** The good news, on a card with the term card's green glow. */
export function IssuedHero({ application }: { application: Application }) {
  const { title, body } = applicationHeadline(application);
  return (
    <section aria-labelledby="issued-title" className={`relative isolate overflow-hidden ${cardClass} p-5 sm:p-6`}>
      <div aria-hidden className="absolute inset-0 -z-10">
        <Glow src="/dashboard/glow-card-green.svg" size={249} style={{ right: -70, top: -130 }} />
        <Glow src="/dashboard/glow-card-green.svg" size={189} style={{ left: -80, bottom: -120 }} />
      </div>
      {/* The tick pops in once, the only motion on the page: this is seen once. */}
      <span aria-hidden className="grid size-11 animate-pop place-items-center rounded-[12px] bg-green-tint text-green-text">
        <IconCheck size={22} />
      </span>
      <h1 id="issued-title" className="mt-4 text-[28px] leading-[34px] font-bold tracking-[-0.025em] text-balance text-label">
        {title}
      </h1>
      <p className="mt-2 max-w-[52ch] text-[15px] leading-5 text-pretty text-label-secondary">{body}</p>
      <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-2">
        <StatusPill status="issued" />
        <p className="text-[13px] leading-[18px] text-label-secondary">
          Application <span className="tabular-nums">{application.applicationNo}</span>
        </p>
      </div>
    </section>
  );
}

/** Two ways on: the policy page, and sharing it with the family. */
export function IssuedActions({ application, policy, customer }: { application: Application; policy: ActivePolicy; customer: Customer }) {
  const href = policyHref(policy.id, customer);
  return (
    <div className="grid gap-6 sm:grid-cols-2">
      <section aria-labelledby="open-title" className={`flex flex-col ${cardClass} p-5`}>
        <h2 id="open-title" className={cardTitleClass}>
          Benefits, claims and hospitals
        </h2>
        <p className="mt-1.5 text-[14px] leading-5 text-pretty text-label-secondary">
          The policy page has what’s covered, your claims and the network hospitals. You can download the policy card there too.
        </p>
        <div className="mt-auto pt-4">
          <Link href={href} className={buttonClass("filled", "medium")}>
            Open policy
          </Link>
        </div>
      </section>
      <section aria-labelledby="share-title" className={`flex flex-col ${cardClass} p-5`}>
        <h2 id="share-title" className={cardTitleClass}>
          Share it with your family
        </h2>
        <p className="mt-1.5 text-[14px] leading-5 text-pretty text-label-secondary">
          A summary of the cover and the network hospitals, for everyone on the policy.
        </p>
        <div className="mt-auto pt-4">
          <ShareButton
            title={`${application.name} on Ditto`}
            text={`${application.name}: what’s covered, and the network hospitals.`}
            path={href}
          />
        </div>
      </section>
    </div>
  );
}

/** Good to know: renewals, claims, and who to ask. Laid out for the 330px column. */
export function GoodToKnow({ policy, customer }: { policy: ActivePolicy; customer: Customer }) {
  const items: { icon: Icon; title: string; body: string; link?: { label: string; href: string }; contacts?: boolean }[] = [
    {
      icon: IconRenew,
      title: "Renewals",
      body: `We’ll reach out well before your policy ends in ${policy.term.value}, so your cover never lapses.`,
    },
    {
      icon: IconClaim,
      title: "Claims",
      body: "Our claims team deals with the hospital, so you don’t have to.",
      link: { label: "Start a claim", href: newClaimHref(policy.id, customer) },
    },
    {
      icon: IconHelp,
      title: "Questions?",
      body: "Talk to us for an answer right away.",
      contacts: true,
    },
  ];
  return (
    <section aria-labelledby="know-title" className={`${cardClass} p-5`}>
      <h2 id="know-title" className={cardTitleClass}>
        Good to know
      </h2>
      <ul className="mt-1 flex flex-col">
        {items.map((item) => {
          const Glyph = item.icon;
          return (
            <li key={item.title} className="flex gap-3 border-t border-separator py-4 first:border-t-0 last:pb-0">
              <span className="grid size-9 shrink-0 place-items-center rounded-[10px] bg-surface text-accent shadow-tile">
                <Glyph size={18} />
              </span>
              <div className="min-w-0 pt-0.5">
                <h3 className="text-[15px] leading-5 font-semibold text-label">{item.title}</h3>
                <p className="mt-0.5 text-[13px] leading-[18px] text-pretty text-label-secondary">{item.body}</p>
                {item.link ? (
                  <Link href={item.link.href} className={`${buttonClass("plain", "small")} -ml-3.5 mt-1`}>
                    {item.link.label}
                  </Link>
                ) : null}
                {item.contacts ? (
                  <div className="mt-2">
                    <ContactLinks />
                  </div>
                ) : null}
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

/** Waiting periods and what's never covered, in brief. */
export function ThingsToNote() {
  return (
    <section aria-labelledby="note-title" className={`${cardClass} p-5`}>
      <h2 id="note-title" className={cardTitleClass}>
        Things to note
      </h2>
      <p className="mt-0.5 text-[13px] leading-[18px] text-label-secondary">Waiting periods, and what’s never covered.</p>
      <dl className="mt-4 grid gap-x-6 gap-y-4 sm:grid-cols-2 lg:grid-cols-3">
        {thingsToNote.map((item) => (
          <div key={item.title} className="min-w-0">
            <dt className="text-[14px] leading-5 font-semibold text-label">{item.title}</dt>
            <dd className="mt-0.5 text-[13px] leading-[18px] text-pretty text-label-secondary">{item.body}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
