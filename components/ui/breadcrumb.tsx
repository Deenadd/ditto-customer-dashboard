import Link from "next/link";
import { Fragment, type ComponentProps } from "react";
import { IconChevronRight, IconMore } from "@/components/ui/icons";

/**
 * Where you are, as a trail of links back up: Active policies › Care health
 * › Claims. Shaped like shadcn's Breadcrumb (nav › ol › li, the current page
 * a non-link marked aria-current) and kept in the label greys rather than the
 * accent, so it reads as wayfinding, not as an action.
 */
export type Crumb = { label: string; href?: string };

export function Breadcrumbs({ items, className = "" }: { items: Crumb[]; className?: string }) {
  /* A long trail keeps its first crumb, the parent and the current page,
     and folds the ones between into ••• (shadcn's BreadcrumbEllipsis):
     Active policies › ••• › Claims › New claim. It stays on one line on a
     phone, where two wrapped lines of 44px tap areas would overlap. The •••
     goes to the nearest folded page and is named for it. */
  const folded = items.length >= 4 ? items.slice(1, -2) : [];
  const via = folded.at(-1);
  const shown = items.filter((item) => !folded.includes(item));
  return (
    <Breadcrumb className={className}>
      <BreadcrumbList>
        {shown.map((item, index) => {
          const isLast = index === shown.length - 1;
          return (
            <Fragment key={`${index}-${item.label}`}>
              {/* Only the current page gives way when the line is short;
                  the links above it keep their width and their chevrons. */}
              <BreadcrumbItem className={isLast ? "min-w-0" : "shrink-0"}>
                {isLast || !item.href ? (
                  <BreadcrumbPage>{item.label}</BreadcrumbPage>
                ) : (
                  <>
                    <BreadcrumbLink href={item.href}>{item.label}</BreadcrumbLink>
                    <BreadcrumbSeparator />
                  </>
                )}
              </BreadcrumbItem>
              {via && index === 0 ? (
                <BreadcrumbItem className="shrink-0">
                  <BreadcrumbEllipsis href={via.href ?? "#"} label={via.label} />
                  <BreadcrumbSeparator />
                </BreadcrumbItem>
              ) : null}
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

/** The folded crumbs: three dots in a small square, a link to the nearest
    of them, with its name for screen readers and as a tooltip. */
export function BreadcrumbEllipsis({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      aria-label={label}
      title={label}
      className="touch-hit grid h-5 w-6 place-items-center rounded-[6px] transition-colors duration-150 ease-out [@media(hover:hover)]:hover:bg-black/[0.04] [@media(hover:hover)]:hover:text-label"
    >
      <IconMore size={16} />
    </Link>
  );
}

/** Inside the item it follows, so the chevron wraps with its link. */
export function BreadcrumbSeparator() {
  return <IconChevronRight size={14} className="shrink-0 text-label-tertiary" />;
}
