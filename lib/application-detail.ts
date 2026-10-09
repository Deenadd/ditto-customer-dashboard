/**
 * What an application's page says, by where the application stands. The
 * two Figma screens behind it: "application submitted" (node 210:7580) for
 * the pending statuses, and "policy is active" (node 210:7358) once issued.
 */

import type { Application, ApplicationStatus } from "@/lib/dashboard-data";
import { insurerNames } from "@/components/ui/insurer-logo";

export type StepState = "done" | "current" | "upcoming";

export type Step = {
  title: string;
  /** Under the title: how long it takes, or that it's done. */
  meta: string;
  state: StepState;
  /** The tile under the step: what may happen, or what's needed. */
  tile: {
    title: string;
    /** Numbered when there are several. */
    items?: string[];
    body?: string;
    /** The insurer is waiting on you: the tile is orange and offers WhatsApp. */
    needsYou?: { action: string; message: string };
  };
};

/** The page's heading and the line under it. */
export function applicationHeadline(application: Application): { title: string; body: string } {
  const insurer = insurerNames[application.insurer];
  switch (application.status) {
    case "pending-uploads":
      return {
        title: "Your application is submitted",
        body: `${insurer} needs a few more documents before it can carry on. Send them to your advisor on WhatsApp.`,
      };
    case "missing-details":
      return {
        title: "Your application is submitted",
        body: "A few details are missing from your proposal. Your advisor can fill them in with you on WhatsApp.",
      };
    case "verification":
      return {
        title: "Your application is submitted",
        body: `${insurer} is reviewing it now. If they need anything more, we’ll tell you within 3 days.`,
      };
    case "issued":
      return {
        title: "Your policy is active",
        body: `${insurer} accepted your application. Your cover has started, and the policy is on your Active tab.`,
      };
  }
}

/** The three stages, as far as this application has got. */
export function applicationSteps(application: Application): Step[] {
  const insurer = insurerNames[application.insurer];
  const status: ApplicationStatus = application.status;
  const waiting = status === "pending-uploads" || status === "missing-details";

  const needsYou =
    status === "pending-uploads"
      ? {
          title: `${insurer} has asked for more documents`,
          body: "A Ditto advisor can take them on WhatsApp and send them on.",
          action: "Send on WhatsApp",
          message: `Hi Ditto, I'd like to send the documents for my ${application.name} application (${application.applicationNo}).`,
        }
      : {
          title: "A few details are missing",
          body: "Your advisor can fill them in with you on WhatsApp.",
          action: "Finish on WhatsApp",
          message: `Hi Ditto, I'd like to add the missing details to my ${application.name} application (${application.applicationNo}).`,
        };

  return [
    {
      title: "Application submitted",
      meta: "Done",
      state: "done",
      tile: waiting
        ? { title: needsYou.title, body: needsYou.body, needsYou: { action: needsYou.action, message: needsYou.message } }
        : {
            title: `${insurer} may still ask for`,
            items: ["More documents", "A medical test", "Earlier medical reports", "A clarification on something you sent"],
          },
    },
    {
      title: "Insurer underwriting",
      meta: waiting ? "Starts once they have what they need" : status === "verification" ? "2–3 days" : "Done",
      state: status === "verification" ? "current" : waiting ? "upcoming" : "done",
      tile: {
        title: `${insurer} will share its decision`,
        items: ["Issue your policy", "Offer cover on different terms", "Decline the application"],
      },
    },
    {
      title: "Policy issued",
      meta: status === "issued" ? "Done" : "Then you’re covered",
      state: status === "issued" ? "done" : "upcoming",
      tile: {
        title: "A 30-day free look",
        body: "Once the policy is issued, you can cancel within 30 days for a refund, minus the cost of any medical tests.",
      },
    },
  ];
}

/** Questions people ask while they wait. */
export const applicationFaqs = [
  {
    q: "How long does issuance take?",
    a: "Usually 12–15 days from submission. It’s quicker when the insurer gets what it asks for straight away.",
  },
  {
    q: "Until when can I cancel?",
    a: "Within 30 days of the policy being issued, the free-look period. You get the premium back, minus the cost of any medical tests.",
  },
  {
    q: "What if the insurer offers different terms?",
    a: "It may offer cover with a higher premium or an exclusion. Your advisor will walk you through it before you decide anything.",
  },
];

/** Waiting periods and exclusions, in brief, for a policy that has just
    been issued (node 210:7358, "Other things to note"). */
export const thingsToNote = [
  { title: "30-day waiting period", body: "Nothing is covered in the first 30 days, unless it’s an accident." },
  { title: "Pre-existing conditions", body: "Illnesses you already have are covered after 3–4 years." },
  { title: "Specified illnesses", body: "Some conditions have a 2-year waiting period." },
  {
    title: "Permanent exclusions",
    body: "Treatment for substance or alcohol abuse, and cosmetic procedures, are never covered.",
  },
  {
    title: "The full terms",
    body: "The policy wording lists every illness, exclusion and waiting period. Ask us if anything’s unclear.",
  },
];
