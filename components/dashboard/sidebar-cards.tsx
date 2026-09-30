import Image from "next/image";
import { CalendarDays } from "lucide-react";
import { Button } from "@/registry/components/button/button";
import { cardClass } from "@/components/ui/card-bits";

/**
 * Welcome card: a greeting, two numbers that matter, and a way to reach a
 * person. A customer with nothing pending is offered help choosing a policy
 * instead of general help.
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
    <section aria-labelledby="welcome-title" className={`relative overflow-hidden ${cardClass}`}>
      <div className="px-6 pt-6 pb-5">
        <h2 id="welcome-title" className="text-2xl font-medium text-label">
          Hi, {firstName}
        </h2>
        <p className="mt-1.5 text-sm text-label-secondary">Hope you&rsquo;re staying safe and healthy.</p>
        <p className="mt-3 flex items-center gap-1.5 text-xs text-label-secondary">
          <CalendarDays size={16} strokeWidth={1.75} aria-hidden />
          Member since {memberSince}
        </p>

        <dl className="mt-5 grid grid-cols-2 divide-x divide-separator-subtle border-t border-separator-subtle pt-4">
          <Stat label="Active policies" value={activePolicies} />
          <Stat label="Open requests" value={requirementRequests} className="pl-4" />
        </dl>
      </div>

      <div className="relative border-t border-separator-subtle px-6 pt-5 pb-6">
        {hasPending ? (
          <div
            aria-hidden
            className="pointer-events-none absolute right-[-6px] bottom-[-59px] h-[185px] w-[125px] overflow-hidden"
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
        ) : (
          <Image
            src="/dashboard/mascot-laptop.png"
            alt=""
            width={799}
            height={786}
            sizes="148px"
            className="pointer-events-none absolute right-[-4px] bottom-[-33px] h-[145px] w-[148px] object-cover"
          />
        )}
        <h3 className="text-base font-medium text-label">
          {hasPending ? "Need help?" : "Need a new policy?"}
        </h3>
        <p className="mt-1 max-w-[190px] text-sm text-balance text-label-secondary">
          {hasPending
            ? "Talk to us for an instant response."
            : "Our team can help you find the right cover."}
        </p>
        <Button variant="secondary" size="sm" className="relative mt-4">
          Chat with us
        </Button>
      </div>
    </section>
  );
}

function Stat({ label, value, className = "" }: { label: string; value: number; className?: string }) {
  return (
    <div className={`flex flex-col-reverse ${className}`}>
      <dt className="text-sm text-label-secondary">{label}</dt>
      <dd className="text-2xl font-medium text-label tabular-nums">{value}</dd>
    </div>
  );
}
