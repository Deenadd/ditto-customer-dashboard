import { ApplicationCard } from "@/components/dashboard/application-card";
import type { Application } from "@/lib/dashboard-data";

/**
 * Timeline view: each update date gets a dot in the gutter, today's in the
 * accent; a hairline rail runs down to the next date and the last one fades.
 */
export function ApplicationTimeline({
  groups,
}: {
  groups: { date: string; current?: boolean; items: Application[] }[];
}) {
  return (
    <ol className="flex flex-col gap-10">
      {groups.map((group, index) => {
        const last = index === groups.length - 1;
        return (
          <li key={group.date} className="relative pl-7">
            <span
              aria-hidden
              className={`absolute top-[5px] left-[3px] size-2.5 rounded-full ${
                group.current ? "bg-accent ring-4 ring-accent-tint" : "bg-label-tertiary"
              }`}
            />
            <span
              aria-hidden
              className={`absolute top-6 left-[7px] w-px ${
                last ? "-bottom-10 bg-linear-to-b from-separator to-transparent" : "-bottom-8 bg-separator"
              }`}
            />
            <h3 className="text-sm font-medium text-label-secondary">
              {group.current ? "Today" : group.date}
            </h3>
            <ul className="mt-3 flex flex-col gap-4">
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
