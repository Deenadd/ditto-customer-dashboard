import { Chevron } from "@/components/dashboard/policy-pair";
import { HelpBlock, SidebarCard } from "@/components/dashboard/sidebar-cards";
import type { Sparkle } from "@/components/ui/asset";

const shield = (name: string) => `/dashboard/links/${name}.svg`;

/** The shield scatter from node 149:9201, where the welcome card has stars. */
const shields: Sparkle[] = [
  { src: shield("shield-3"), left: 187, top: 13, width: 6 },
  { src: shield("shield-vector"), left: 235, top: 19, width: 6.75, height: 8.173 },
  { src: shield("shield-vector"), left: 311.13, top: 52.4, width: 6.75, height: 8.173 },
  { src: shield("shield-4"), left: 143, top: -4, width: 9 },
  { src: shield("shield-1"), left: 246, top: 40, width: 13 },
  { src: shield("shield-1"), left: 294, top: 22, width: 13 },
  { src: "/dashboard/star-3.svg", left: 209, top: 5, width: 9 },
  { src: shield("shield-11"), left: 163, top: 5, width: 9 },
  { src: shield("shield-5"), left: 211, top: -1, width: 11 },
  { src: shield("shield-9"), left: 285, top: 5, width: 7 },
  { src: shield("shield-6"), left: 205, top: 25, width: 13 },
  { src: shield("shield-11"), left: 312, top: 9, width: 9 },
  { src: shield("shield-6"), left: 246, top: 1, width: 13 },
  { src: shield("shield-8"), left: 269, top: 18, width: 9 },
  { src: shield("shield-8"), left: 280, top: 39, width: 9 },
];

/** Support for this policy, as an inset list with disclosure chevrons. */
export function QuickLinksCard({ links }: { links: string[] }) {
  return (
    <SidebarCard sparkles={shields} labelledBy="links-title">
      <div className="px-5 pt-6 pb-4">
        <h2
          id="links-title"
          className="text-[22px] leading-7 font-bold tracking-[-0.02em] text-label"
        >
          Help with this policy
        </h2>
        <p className="mt-1.5 max-w-[240px] text-[15px] leading-[22px] text-label-secondary">
          Guides for claims and the hospitals you can use.
        </p>

        <ul className="mt-4 -mx-2 overflow-hidden rounded-[14px] bg-fill/85 backdrop-blur-sm">
          {links.map((link, index) => (
            <li key={link} className="relative">
              {index > 0 ? (
                <span aria-hidden className="absolute top-0 right-0 left-3.5 h-px bg-separator" />
              ) : null}
              <button
                type="button"
                className="group flex h-11 w-full items-center justify-between gap-3 px-3.5 text-left text-[15px] leading-5 text-label transition-colors duration-150 active:bg-black/[0.04] [@media(hover:hover)]:hover:bg-black/[0.03]"
              >
                {link}
                <Chevron className="text-label-tertiary" />
              </button>
            </li>
          ))}
        </ul>
      </div>

      <HelpBlock title="Need help?" body="Talk to us for an instant response." mascot="hotline" />
    </SidebarCard>
  );
}
