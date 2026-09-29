import { Asset, type Sparkle } from "@/components/ui/asset";
import {
  HelpBlock,
  SidebarCard,
  SidebarIntro,
  SidebarTitle,
} from "@/components/dashboard/sidebar-cards";

const shield = (name: string) => `/dashboard/links/${name}.svg`;

/** The shield scatter on node 149:9201, where the welcome card has stars. */
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

/**
 * "Check your, Quick Support links" (node 149:9201). The highlighted
 * "Guide to Reimbursement" row in the design is the hover state: blue
 * semibold text, the arrow on a raised white disc.
 */
export function QuickLinksCard({ links }: { links: string[] }) {
  return (
    <SidebarCard sparkles={shields} labelledBy="links-title">
      <div className="px-[19px] pt-[30px] pb-[22px]">
        <SidebarTitle id="links-title">
          Check your,
          <br />
          Quick Support links
        </SidebarTitle>
        <SidebarIntro />

        <ul className="mt-[25px] flex flex-col gap-5">
          {links.map((link, index) => (
            <li key={index}>
              <button
                type="button"
                className="group -my-1 flex items-center gap-3 rounded-md py-1 pr-2 text-left"
              >
                <span aria-hidden className="relative ml-px size-5 shrink-0">
                  <Asset src="/dashboard/links/link-circle.svg" className="absolute inset-0 size-full" />
                  <span className="absolute inset-[-12.5%_-15%_-17.5%_-15%] opacity-0 transition-opacity duration-150 ease-out group-hover:opacity-100 group-focus-visible:opacity-100">
                    <Asset src="/dashboard/links/link-circle-hover.svg" className="size-full" />
                  </span>
                  <span className="absolute top-[3px] left-[3px] size-3.5 -rotate-45">
                    <span className="absolute inset-[27.8%_22.76%_27.75%_23.34%]">
                      <span className="absolute inset-[-12.05%_-9.94%]">
                        <Asset
                          src="/dashboard/links/link-arrow.svg"
                          className="absolute inset-0 size-full transition-opacity duration-150 ease-out group-hover:opacity-0 group-focus-visible:opacity-0"
                        />
                        <Asset
                          src="/dashboard/links/link-arrow-hover.svg"
                          className="absolute inset-0 size-full opacity-0 transition-opacity duration-150 ease-out group-hover:opacity-100 group-focus-visible:opacity-100"
                        />
                      </span>
                    </span>
                  </span>
                </span>
                <span className="text-[14px] leading-5 text-ink-secondary transition-colors duration-150 ease-out group-hover:font-semibold group-hover:text-primary group-focus-visible:font-semibold group-focus-visible:text-primary">
                  {link}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </div>

      <HelpBlock title="Need help?" body="Talk to us for instant response" mascot="hotline" roomy />
    </SidebarCard>
  );
}
