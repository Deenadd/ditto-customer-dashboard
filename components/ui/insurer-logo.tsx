import Image from "next/image";
import type { Insurer } from "@/lib/dashboard-data";

export const insurerNames: Record<Insurer, string> = {
  maxlife: "Max Life",
  care: "Care Health",
};

/**
 * The insurer's mark as an app-icon tile: squircle-ish corners at a quarter
 * of the size, and a hairline ring instead of a white border. Max Life ships
 * as a sprite, so only its flame shows, cropped the way Figma crops it.
 * `muted` is the greyed Care mark for lapsed and rejected cover.
 */
export function InsurerLogo({
  insurer,
  size = 44,
  muted = false,
}: {
  insurer: Insurer;
  size?: 40 | 44 | 56;
  muted?: boolean;
}) {
  const radius = size === 56 ? "rounded-[14px]" : size === 44 ? "rounded-[11px]" : "rounded-[10px]";

  return (
    <div
      role="img"
      aria-label={insurerNames[insurer]}
      className={`relative shrink-0 overflow-hidden shadow-logo after:pointer-events-none after:absolute after:inset-0 after:rounded-[inherit] after:ring-1 after:ring-black/[0.06] after:ring-inset ${radius} ${
        insurer === "maxlife" ? "bg-[#fce0c8]" : muted ? "bg-grey-tint" : "bg-[#fbdf00]"
      }`}
      style={{ width: size, height: size }}
    >
      {insurer === "maxlife" ? (
        <>
          <div
            className="absolute top-1/2 left-1/2 -translate-1/2 overflow-hidden"
            style={{ width: size * 0.6, height: size * 0.725 }}
          >
            <Image
              src="/dashboard/insurer-maxlife.png"
              alt=""
              width={735}
              height={392}
              sizes="160px"
              className="absolute top-0 left-0 h-[113.62%] w-[266.3%] max-w-none"
            />
          </div>
          {/* Covers the edge of the next logo on the sprite. */}
          <div
            className="absolute bg-[#fce0c8]"
            style={{ top: size * 0.125, left: size * 0.725, width: size * 0.1, height: size * 0.4 }}
          />
        </>
      ) : (
        <Image
          src={muted ? "/dashboard/insurer-care-muted.png" : "/dashboard/insurer-care.png"}
          alt=""
          width={245}
          height={245}
          sizes="112px"
          className="size-full object-cover"
        />
      )}
    </div>
  );
}
