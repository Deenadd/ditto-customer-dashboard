import Link from "next/link";
import { Fragment, type ComponentProps } from "react";
import { IconChevronRight } from "@/components/ui/icons";

/**
 * Where you are, as a trail of links back up: Active policies › Care health
 * › Claims. Shaped like shadcn's Breadcrumb (nav › ol › li, the current page
 * a non-link marked aria-current) and kept in the label greys rather than the
 * accent, so it reads as wayfinding, not as an action.
 */
export type Crumb = { label: string; href?: string };

export function Breadcrumbs({ items, className = "" }: { items: Crumb[]; className?: string }) {
  /* On phones the trail stays on one line: the crumbs between the first and
     the parent fold into a … link (to the nearest of them), as shadcn's
     BreadcrumbEllipsis does. Wrapped, two lines of 44px tap areas overlap. */
  const folded = items.length >= 4 ? items.slice(1, -2) : [];
  const via = folded.at(-1);
  return (
    <Breadcrumb className={className}>
      <BreadcrumbList>
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          const isFolded = folded.includes(item);
          return (
            <Fragment key={`${index}-${item.label}`}>
              {via && isFolded && item === folded[0] ? (
                <BreadcrumbItem className="sm:hidden">
                  <BreadcrumbLink href={via.href ?? "#"} aria-label={via.label}>
                    …
                  </BreadcrumbLink>
                  <BreadcrumbSeparator />
                </BreadcrumbItem>
              ) : null}
              {/* Only the current page gives way when the line is short;
                  the links above it keep their width and their chevrons. */}
              <BreadcrumbItem className={`${isFolded ? "max-sm:hidden" : ""} ${isLast ? "min-w-0" : "shrink-0"}`}>
                {isLast || !item.href ? (
                  <BreadcrumbPage>{item.label}</BreadcrumbPage>
                ) : (
                  <>
                    <BreadcrumbLink href={item.href}>{item.label}</BreadcrumbLink>
                    <BreadcrumbSeparator />
                  </>
                )}
              </BreadcrumbItem>
            </Fragment>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}

export function Breadcrumb(props: ComponentProps<"nav">) {
  return <nav aria-label="Breadcrumb" {...props} />;
}

export function BreadcrumbList({ className = "", ...props }: ComponentProps<"ol">) {
  return (
    <ol
      className={`flex items-center gap-x-1.5 gap-y-1 text-[14px] leading-5 break-words text-label-secondary sm:flex-wrap ${className}`}
      {...props}
    />
  );
}

export function BreadcrumbItem({ className = "", ...props }: ComponentProps<"li">) {
  return <li className={`inline-flex items-center gap-1.5 ${className}`} {...props} />;
}

/* The text truncates on an inner span: clipping the link itself would also
   clip touch-hit's larger tap area, which is drawn as the link's ::after. */
export function BreadcrumbLink({ className = "", children, ...props }: ComponentProps<typeof Link>) {
  return (
    <Link
      className={`touch-hit inline-flex rounded-[4px] transition-colors duration-150 ease-out [@media(hover:hover)]:hover:text-label ${className}`}
      {...props}
    >
      <span className="max-w-[16ch] truncate sm:max-w-none">{children}</span>
    </Link>
  );
}

/** The page you're on: not a link, and announced as the current page. */
export function BreadcrumbPage({ className = "", ...props }: ComponentProps<"span">) {
  return <span aria-current="page" className={`truncate text-label ${className}`} {...props} />;
}

/** Inside the item it follows, so the chevron wraps with its link. */
export function BreadcrumbSeparator() {
  return <IconChevronRight size={14} className="shrink-0 text-label-tertiary" />;
}
