import Link from "next/link";
import { buttonClass } from "@/components/ui/buttons";
import { AddOnChips, FieldItem, MetaLine, StatusPill, cardClass } from "@/components/ui/card-bits";
import { InsurerLogo, insurerNames } from "@/components/ui/insurer-logo";
import { Chevron } from "@/components/dashboard/policy-pair";
import type { Application } from "@/lib/dashboard-data";
import { whatsappLink } from "@/lib/whatsapp";

/* What an application waiting on you needs, and the way to do it: a Ditto
   advisor takes it on WhatsApp, with the application named in the message. */
const nextSteps: Partial<Record<Application["status"], (a: Application) => { text: string; action: string; message: string }>> = {
  "pending-uploads": (a) => ({
    text: `${insurerNames[a.insurer]} needs a few more documents to carry on. A Ditto advisor can take them on WhatsApp.`,
    action: "Send on WhatsApp",
    message: `Hi Ditto, I'd like to send the documents for my ${a.name} application (${a.applicationNo}).`,
  }),
  "missing-details": (a) => ({
    text: "A few details are missing from your proposal. A Ditto advisor can fill them in with you on WhatsApp.",
    action: "Finish on WhatsApp",
    message: `Hi Ditto, I'd like to add the missing details to my ${a.name} application (${a.applicationNo}).`,
  }),
};

/**
 * A pending application: insurer, name and status on top, the four facts in
 * an inset tile, then the add-ons as capsules. One that's waiting on you
 * ends with what's needed and the way to do it. With `href`, the whole
 * card opens the application's page (the name is the link, stretched over
 * the card; WhatsApp stays its own link above it), and a chevron in the
 * corner says so.
 */
export function ApplicationCard({ application, href }: { application: Application; href?: string }) {
  const next = nextSteps[application.status]?.(application);
  return (
    <article
      className={`group @container relative isolate ${cardClass} p-5 ${
        href
          ? "transition-[box-shadow,transform] duration-200 ease-out has-[[data-card-link]:focus-visible]:outline-2 has-[[data-card-link]:focus-visible]:outline-offset-2 has-[[data-card-link]:focus-visible]:outline-accent has-[[data-card-link]:active]:scale-[0.99] [@media(hover:hover)]:has-[[data-card-link]:hover]:shadow-raised"
          : ""
      }`}
    >
      <header className={`flex flex-wrap items-start gap-x-3.5 gap-y-2 ${href ? "pr-9" : ""}`}>
        <InsurerLogo insurer={application.insurer} />
        <div className="min-w-0 flex-[1_1_220px]">
          <h3 className="text-[17px] leading-[22px] font-semibold tracking-[-0.022em] text-pretty text-label">
            {href ? (
              <Link href={href} data-card-link className="after:absolute after:inset-0 after:rounded-[22px] focus-visible:outline-none">
                {application.name}
                <span className="sr-only">, application {application.applicationNo}</span>
              </Link>
            ) : (
              application.name
            )}
          </h3>
          <MetaLine parts={[application.kind, `Application ${application.applicationNo}`]} />
        </div>
        <div className="@max-[479px]:ml-[58px]">
          <StatusPill status={application.status} />
        </div>
        {href ? (
          <span
            aria-hidden
            className="absolute top-5 right-5 grid size-7 place-items-center rounded-full bg-fill text-label-secondary transition-colors duration-150 ease-out [@media(hover:hover)]:group-hover:bg-fill-strong"
          >
            <Chevron />
          </span>
        ) : null}
      </header>

      <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-4 rounded-[14px] bg-fill-soft px-4 py-3.5 shadow-[inset_0_0_0_1px_rgb(0_0_0_/_0.04)] @min-[600px]:grid-cols-4">
        {application.fields.map((field) => (
          <FieldItem key={field.label} field={field} />
        ))}
      </dl>

      <div className="mt-4">
        <AddOnChips items={application.addOns} />
      </div>

      {next ? (
        <div className="mt-5 flex flex-col gap-3 border-t border-separator pt-4 @min-[480px]:flex-row @min-[480px]:items-center @min-[480px]:justify-between @min-[480px]:gap-5">
          <p className="max-w-[46ch] text-[14px] leading-5 text-pretty text-label">{next.text}</p>
          <a
            href={whatsappLink(next.message)}
            target="_blank"
            rel="noopener noreferrer"
            className={`${buttonClass("tinted", "medium")} relative z-10 self-start @min-[480px]:self-center`}
          >
            {next.action}
            <span className="sr-only"> (opens WhatsApp in a new tab)</span>
          </a>
        </div>
      ) : null}
    </article>
  );
}
