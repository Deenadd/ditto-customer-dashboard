import Image from "next/image";
import { ContactLinks } from "@/components/applications/contact-links";
import { Glow } from "@/components/ui/asset";
import { buttonClass } from "@/components/ui/buttons";
import { MetaLine, StatusPill, cardClass, cardTitleClass } from "@/components/ui/card-bits";
import { IconMail, IconPhone } from "@/components/ui/icons";
import { InsurerLogo, insurerNames } from "@/components/ui/insurer-logo";
import { applicationFaqs, applicationHeadline } from "@/lib/application-detail";
import { dittoPhone } from "@/lib/contact";
import type { Application } from "@/lib/dashboard-data";
import { whatsappLink } from "@/lib/whatsapp";

/*
 * A submitted application's page, after the Figma screen (node 210:7580):
 * the heading, which application this is, what's next, your advisor, and
 * the questions people ask while they wait. Next steps for you (the rail)
 * is in next-steps.tsx and sits beside these.
 */

/** Large title, the line under it, then the application it's about. */
export function ApplicationHeader({ application }: { application: Application }) {
  const { title, body } = applicationHeadline(application);
  return (
    <header>
      <h1 className="text-[28px] leading-[34px] font-bold tracking-[-0.025em] text-balance text-label">{title}</h1>
      <p className="mt-2 max-w-[56ch] text-[15px] leading-5 text-pretty text-label-secondary">{body}</p>
      <div className="mt-5 flex flex-wrap items-center gap-x-3.5 gap-y-2 rounded-[18px] bg-fill-soft p-3.5 shadow-[inset_0_0_0_1px_rgb(0_0_0_/_0.04)]">
        <InsurerLogo insurer={application.insurer} size={40} />
        <div className="min-w-0 flex-[1_1_200px]">
          <p className="text-[15px] leading-5 font-semibold text-pretty text-label">{application.name}</p>
          <MetaLine parts={[application.kind, `Application ${application.applicationNo}`]} />
        </div>
        <StatusPill status={application.status} />
      </div>
    </header>
  );
}

/** What’s next: the two emails on their way. */
export function WhatsNextCard({ application }: { application: Application }) {
  const insurer = insurerNames[application.insurer];
  const mails = [
    { title: `A confirmation from ${insurer}`, body: "To your registered email, with your application number." },
    { title: "A note from Ditto", body: "What happens at each step from here, and who to call." },
  ];
  return (
    <section aria-labelledby="next-title" className={`relative isolate overflow-hidden ${cardClass} p-5`}>
      <div aria-hidden className="absolute inset-0 -z-10">
        <Glow src="/dashboard/glow-1450.svg" style={{ right: -50, top: -100 }} />
      </div>
      <h2 id="next-title" className={cardTitleClass}>
        What’s next
      </h2>
      <p className="mt-1.5 max-w-[52ch] text-[14px] leading-5 text-pretty text-label-secondary">
        Two emails are on their way. Nothing to do until then.
      </p>
      <ul className="mt-4 flex flex-col gap-3 sm:flex-row sm:gap-6">
        {mails.map((mail) => (
          <li key={mail.title} className="flex flex-1 items-start gap-3">
            <span className="grid size-9 shrink-0 place-items-center rounded-[10px] bg-surface text-accent shadow-tile">
              <IconMail size={18} />
            </span>
            <div className="min-w-0 pt-0.5">
              <h3 className="text-[15px] leading-5 font-semibold text-pretty text-label">{mail.title}</h3>
              <p className="mt-0.5 text-[13px] leading-[18px] text-pretty text-label-secondary">{mail.body}</p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

/**
 * Your advisor: the point of contact for this application, on WhatsApp or
 * the phone, and underneath, where a complaint goes. The mascot peeks in
 * from the right on wider cards, as on the home page's helper.
 */
export function AdvisorCard({ application }: { application: Application }) {
  const message = `Hi Ditto, I have a question about my ${application.name} application (${application.applicationNo}).`;
  return (
    <section aria-labelledby="advisor-title" className={`relative isolate overflow-hidden ${cardClass} p-5`}>
      <div aria-hidden className="absolute inset-0 -z-10 max-sm:hidden">
        <Image
          src="/dashboard/mascot-laptop.png"
          alt=""
          width={799}
          height={786}
          sizes="148px"
          className="absolute top-[14px] right-[-16px] h-[145px] w-[148px] object-cover"
        />
      </div>
      <div className="sm:pr-36">
        <h2 id="advisor-title" className={cardTitleClass}>
          Your advisor keeps you posted
        </h2>
        <p className="mt-1.5 max-w-[46ch] text-[14px] leading-5 text-pretty text-label-secondary">
          Your Ditto advisor is your point of contact for this application: updates, and anything you want to ask.
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-x-2 gap-y-2">
          <a href={whatsappLink(message)} target="_blank" rel="noopener noreferrer" className={buttonClass("tinted", "medium")}>
            Message on WhatsApp
            <span className="sr-only"> (opens WhatsApp in a new tab)</span>
          </a>
          <a href={dittoPhone.href} className={buttonClass("plain", "medium")}>
            <IconPhone size={16} />
            Call <span className="tabular-nums">{dittoPhone.label}</span>
          </a>
        </div>
      </div>
      <div className="mt-5 border-t border-separator pt-4">
        <h3 className="text-[15px] leading-5 font-semibold text-label">Something not right?</h3>
        <p className="mt-0.5 text-[14px] leading-5 text-pretty text-label-secondary">
          Tell us, and we’ll get back to you within a day.
        </p>
        <div className="mt-3">
          <ContactLinks />
        </div>
      </div>
    </section>
  );
}

/** Questions about your application, each folded until it's opened. */
export function ApplicationFaqs() {
  return (
    <section aria-labelledby="faq-title" className={`${cardClass} p-5`}>
      <h2 id="faq-title" className={cardTitleClass}>
        Questions about your application
      </h2>
      <div className="mt-3 flex flex-col gap-2">
        {applicationFaqs.map((item) => (
          <details
            key={item.q}
            className="group rounded-[14px] bg-fill-soft shadow-[inset_0_0_0_1px_rgb(0_0_0_/_0.04)] transition-colors duration-150 ease-out open:bg-fill"
          >
            <summary className="flex min-h-12 cursor-pointer list-none items-center gap-3 rounded-[14px] px-4 py-3 text-[15px] leading-5 font-medium text-label [&::-webkit-details-marker]:hidden">
              <span className="flex-1 text-pretty">{item.q}</span>
              <svg
                aria-hidden
                width="12"
                height="8"
                viewBox="0 0 12 8"
                fill="none"
                className="shrink-0 text-label-tertiary transition-transform duration-200 ease-out group-open:rotate-180"
              >
                <path d="M1.25 1.5 6 6.25l4.75-4.75" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </summary>
            <p className="px-4 pb-4 text-[14px] leading-5 text-pretty text-label-secondary">{item.a}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
