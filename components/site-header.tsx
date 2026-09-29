import Image from "next/image";

/**
 * Nav bar, as in the renewal flow (node 63:2307): 64px tall, hairline bottom
 * rule in Slate/Light/4, brand mark aligned to the page content gutter.
 */
export function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 h-16 border-b border-slate-4 bg-white">
      <div className="mx-auto flex h-full max-w-[1112px] items-center px-6 xl:px-0">
        <Image
          src="/brand/ditto-logo.png"
          alt="Ditto"
          width={663}
          height={307}
          priority
          className="h-9 w-[77.4px] object-contain"
        />
      </div>
    </header>
  );
}
