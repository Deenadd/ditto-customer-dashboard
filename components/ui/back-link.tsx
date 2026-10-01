import Link from "next/link";

/** The page's way back: a chevron and where it goes, at the leading edge. */
export function BackLink({ href, children }: { href: string; children: string }) {
  return (
    <Link
      href={href}
      className="group -ml-2 inline-flex h-9 items-center gap-1 rounded-control pr-3 pl-2 text-[15px] leading-5 font-medium text-accent-text transition-opacity duration-150 active:opacity-50 [@media(hover:hover)]:hover:opacity-70"
    >
      <svg
        aria-hidden
        width="9"
        height="15"
        viewBox="0 0 9 15"
        fill="none"
        className="transition-transform duration-200 ease-out [@media(hover:hover)]:group-hover:-translate-x-0.5"
      >
        <path d="M7.5 1.5 1.75 7.5l5.75 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      {children}
    </Link>
  );
}
