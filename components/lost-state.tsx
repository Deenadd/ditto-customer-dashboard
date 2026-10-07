import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { cardClass } from "@/components/ui/card-bits";
import type { Icon } from "@/components/ui/icons";

/**
 * Somewhere you didn't mean to be: a link that's gone, or a page that broke.
 * A bar with the Ditto mark (home), then one card that says what happened
 * and the way back. The header is deliberately bare, with no menus that
 * could fail again, so it holds up under the error boundary too.
 */
export function LostState({
  icon: Glyph,
  tone = "accent",
  title,
  children,
  actions,
}: {
  icon: Icon;
  tone?: "accent" | "red";
  title: string;
  children: ReactNode;
  actions: ReactNode;
}) {
  return (
    <>
      <header className="sticky top-0 z-30 bg-page pt-[env(safe-area-inset-top)]">
        <div className="mx-auto flex h-14 max-w-[1112px] items-center px-3.5 sm:h-16 sm:px-5 xl:px-0">
          <Link href="/dashboard" className="touch-hit flex shrink-0 items-center rounded-lg">
            <Image
              src="/brand/ditto-logo.png"
              alt="Ditto, your policies"
              width={663}
              height={307}
              priority
              className="h-8 w-[69px] object-contain sm:h-9 sm:w-[77.4px]"
            />
          </Link>
        </div>
      </header>
      <main
        id="main"
        className="mx-auto flex min-h-[calc(100svh-120px)] w-full max-w-[1112px] items-center justify-center px-3.5 pt-6 pb-20 sm:px-6"
      >
        <div className={`${cardClass} flex w-full max-w-[440px] flex-col items-center px-6 pt-10 pb-8 text-center`}>
          <span
            className={`grid size-14 place-items-center rounded-[16px] ${
              tone === "red" ? "bg-red-tint text-red-text" : "bg-accent-tint text-accent"
            }`}
          >
            <Glyph size={26} />
          </span>
          <h1 className="mt-5 text-[24px] leading-[30px] font-bold tracking-[-0.025em] text-balance text-label">{title}</h1>
          <div className="mt-2 max-w-[340px] text-[15px] leading-[22px] text-pretty text-label-secondary">{children}</div>
          <div className="mt-7 flex w-full flex-col gap-2">{actions}</div>
        </div>
      </main>
    </>
  );
}
