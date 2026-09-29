import Image from "next/image";
import type { Insurer } from "@/lib/dashboard-data";

const names: Record<Insurer, string> = {
  maxlife: "Max Life",
  care: "Care Health",
};

/**
 * The insurer's mark on a white-edged tile (nodes 149:9010, 149:10070,
 * 149:9309). Max Life ships as a sprite, so only its flame is shown, the way
 * Figma crops it; `muted` is the greyed Care mark used for lapsed and
 * rejected cover.
 */
export function InsurerLogo({
  insurer,
  size = 40,
  muted = false,
}: {
  insurer: Insurer;
  size?: 40 | 56;
  muted?: boolean;
}) {
  const large = size === 56;

  return (
    <div
      role="img"
      aria-label={names[insurer]}
      className={`relative shrink-0 overflow-hidden border-white bg-logo-tile shadow-logo ${
        large ? "size-14 rounded-[7px] border-[2.5px]" : "size-10 rounded-[7px] border-[1.5px]"
      }`}
    >
      {insurer === "maxlife" ? (
        <div className="absolute -inset-[1.5px] overflow-hidden rounded-[2.813px] bg-[#fce0c8]">
          <div className="absolute top-[calc(50%+0.5px)] left-1/2 h-[29px] w-6 -translate-1/2 overflow-hidden">
            <Image
              src="/dashboard/insurer-maxlife.png"
              alt=""
              width={735}
              height={392}
              className="absolute top-0 left-0 h-[113.62%] w-[266.3%] max-w-none"
            />
          </div>
          {/* Covers the edge of the next logo on the sprite. */}
          <div className="absolute top-[5px] left-[29px] h-4 w-1 bg-[#fce0c8]" />
        </div>
      ) : (
        <div
          className={`absolute overflow-hidden rounded-[4px] ${
            large ? "-inset-[2.5px]" : "-inset-[1.5px]"
          } ${muted ? "" : "bg-[#fbdf00]"}`}
        >
          <Image
            src={muted ? "/dashboard/insurer-care-muted.png" : "/dashboard/insurer-care.png"}
            alt=""
            width={245}
            height={245}
            className="size-full object-cover"
          />
        </div>
      )}
    </div>
  );
}
