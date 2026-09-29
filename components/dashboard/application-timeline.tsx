import { Asset } from "@/components/ui/asset";
import { ApplicationCard } from "@/components/dashboard/application-card";
import type { Application } from "@/lib/dashboard-data";

/**
 * Timeline view (node 149:9509). Each update date gets a dot in the gutter
 * left of the cards, blue for today; a rail runs from each dot down to the
 * next, and the last one fades out.
 */
export function ApplicationTimeline({
  groups,
}: {
  groups: { date: string; current?: boolean; items: Application[] }[];
}) {
  return (
    <ol className="flex flex-col gap-11">
      {groups.map((group, index) => {
        const last = index === groups.length - 1;
        return (
          <li key={group.date} className="relative">
            <h3 className="relative flex items-center gap-3 sm:-ml-6">
              <Asset
                src={group.current ? "/dashboard/timeline-dot-current.svg" : "/dashboard/timeline-dot.svg"}
                className="size-3.5 shrink-0"
              />
              <span className="ff-case text-[14px] leading-none font-medium tracking-[-0.0238px] text-ink">
                {group.date}
              </span>
            </h3>
            <span
              aria-hidden
              className={`absolute top-[26px] left-[6px] w-0.5 rounded-full sm:left-[-18px] ${
                last
                  ? "-bottom-11 bg-linear-to-b from-grey-300 to-transparent"
                  : "-bottom-8 bg-grey-300"
              }`}
            />
            <ul className="mt-4 flex flex-col gap-5 max-sm:pl-6">
              {group.items.map((application) => (
                <li key={application.id}>
                  <ApplicationCard application={application} />
                </li>
              ))}
            </ul>
          </li>
        );
      })}
    </ol>
  );
}
