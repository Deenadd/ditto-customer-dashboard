"use client";

import Image from "next/image";
import type { CSSProperties, ReactNode } from "react";
import { motion, useReducedMotion, type Transition } from "motion/react";
import { buttonClass } from "@/components/ui/buttons";
import { whatsappLink } from "@/lib/whatsapp";

const tileShadow =
  "0 49.423px 14.121px 0 rgb(134 137 141 / 0), 0 32.478px 12.709px 0 rgb(134 137 141 / 0.01), 0 18.357px 11.297px 0 rgb(134 137 141 / 0.05), 0 8.473px 8.473px 0 rgb(134 137 141 / 0.09), 0 1.412px 4.236px 0 rgb(134 137 141 / 0.1)";

/*
 * The entrance, played each time the empty state appears (opening the
 * Pending tab with nothing in it, a rare sight): the three tiles are dealt
 * one at a time, left to right, each sliding in from the left and settling
 * into its angle on a spring with a little give, like cards laid on a table.
 * Then the heading, the line and the button come into focus in turn, a short
 * blur clearing as they rise. Transforms only, so it runs on the compositor;
 * nothing waits on it, and the button works from the first frame.
 * Reduced motion: the same order as plain fades, no movement.
 */
const DEAL_GAP = 0.16;
const dealSpring = { type: "spring", duration: 0.8, bounce: 0.22 } as const;
const textEase = [0.23, 1, 0.32, 1] as const;
const TEXT_START = 0.15 + DEAL_GAP * 3 + 0.12;

function useEntrance() {
  /* The same start and end either way, since the server can't know the
     setting; reduced motion only makes the moves instant. */
  const reduced = !!useReducedMotion();
  const fade = (delay: number) => ({ duration: 0.25, ease: "easeOut", delay }) as const;
  const tile = (index: number) => {
    const delay = reduced ? index * 0.06 : 0.15 + index * DEAL_GAP;
    return {
      initial: { opacity: 0, transform: "translateX(-32px) translateY(12px) rotate(-9deg) scale(0.9)" },
      animate: { opacity: 1, transform: "translateX(0px) translateY(0px) rotate(0deg) scale(1)" },
      transition: {
        transform: reduced ? { duration: 0 } : { ...dealSpring, delay },
        opacity: reduced ? fade(delay) : { duration: 0.2, ease: "easeOut", delay },
      } as Transition,
    };
  };
  const text = (index: number) => {
    const delay = reduced ? 0.2 + index * 0.06 : TEXT_START + index * 0.1;
    return {
      initial: { opacity: 0, transform: "translateY(10px)", filter: "blur(6px)" },
      animate: { opacity: 1, transform: "translateY(0px)", filter: "blur(0px)" },
      transition: reduced
        ? ({ transform: { duration: 0 }, filter: { duration: 0 }, opacity: fade(delay) } as Transition)
        : { duration: 0.6, ease: textEase, delay },
    };
  };
  return { tile, text };
}

/**
 * Nothing pending: three insurer tiles fanned out, what this space is for,
 * and one way forward: a Ditto advisor, on WhatsApp. It sits on the page
 * itself, without a card around it.
 */
export function EmptyApplications() {
  const { tile, text } = useEntrance();
  return (
    <div className="flex flex-col items-center px-6 pt-10 pb-12 text-center sm:pt-14">
      <InsurerFan tile={tile} />
      <motion.h2
        {...text(0)}
        className="mt-8 text-[22px] leading-7 font-semibold tracking-[-0.02em] text-balance text-label"
      >
        No pending applications
      </motion.h2>
      <motion.p {...text(1)} className="mt-2 max-w-[360px] text-[15px] leading-[22px] text-balance text-label-secondary">
        When you apply for a policy, you can follow it here. Looking for new
        cover? Our team can help you choose.
      </motion.p>
      <motion.div {...text(2)} className="mt-7 flex flex-col items-center">
        <a
          href={whatsappLink("Hi Ditto, I'm looking for a new policy and would like some help choosing.")}
          target="_blank"
          rel="noopener noreferrer"
          className={buttonClass("filled", "large")}
        >
          Talk to our team
        </a>
        <p className="mt-2.5 text-[12px] leading-4 text-label-secondary">Opens WhatsApp in a new tab.</p>
      </motion.div>
    </div>
  );
}

type Entrance = ReturnType<typeof useEntrance>["tile"];

/** Node 149:10624, rebuilt from its layers so it stays sharp at any density. */
function InsurerFan({ tile }: { tile: Entrance }) {
  return (
    <div aria-hidden className="relative h-[108.78px] w-[243.14px] shrink-0">
      <Tile box={97.749} left={0} top={9.99} rotate={-14.77} background="#e31e27" entrance={tile(0)}>
        <div
          className="absolute flex items-center justify-center"
          style={{ inset: "15.55% 5.87% 23.33% 13.23%", containerType: "size" }}
        >
          <div
            className="relative flex-none overflow-hidden rounded-[6px]"
            style={{
              width: "hypot(99.0529cqw, 1.67146cqh)",
              height: "hypot(-0.947124cqw, 98.3285cqh)",
              transform: "rotate(0.73deg)",
            }}
          >
            <Image
              src="/dashboard/insurer-hdfc.png"
              alt=""
              width={1200}
              height={1200}
              sizes="80px"
              className="absolute top-0 left-0 h-[147.22%] w-[110.42%] max-w-none"
            />
          </div>
        </div>
      </Tile>

      <Tile box={80.239} left={78} top={0} rotate={-0.17} background="#fce0c8" entrance={tile(1)}>
        <div
          className="absolute overflow-hidden rounded-[5.648px] bg-[#fbdf00]"
          style={{ inset: "2.5% 0 -2.5% 0" }}
        >
          <Image
            src="/dashboard/insurer-care.png"
            alt=""
            width={245}
            height={245}
            sizes="80px"
            className="size-full object-cover"
          />
        </div>
      </Tile>

      <Tile box={101.756} left={141.38} top={7.03} rotate={19.08} background="#dcebfa" entrance={tile(2)}>
        <div
          className="absolute flex items-center justify-center"
          style={{ inset: "13.71% 17.74% 16.29% 23.88%", containerType: "size" }}
        >
          <div
            className="relative flex-none overflow-hidden"
            style={{
              width: "hypot(97.5912cqw, 1.66239cqh)",
              height: "hypot(-2.40878cqw, 98.3376cqh)",
              transform: "rotate(1.17deg)",
            }}
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
        </div>
        {/* Hides the neighbouring logo on the Max Life sprite. */}
        <div
          className="absolute flex items-center justify-center"
          style={{ inset: "9.52% 4.88% 51.32% 69.09%", containerType: "size" }}
        >
          <div
            className="flex-none bg-[#dcebfa]"
            style={{
              width: "hypot(54.4695cqw, -12.5205cqh)",
              height: "hypot(45.5305cqw, 87.4795cqh)",
              transform: "rotate(-19.08deg)",
            }}
          />
        </div>
      </Tile>
    </div>
  );
}

/** An 80px logo tile, rotated inside the box Figma measures around it. */
function Tile({
  box,
  left,
  top,
  rotate,
  background,
  entrance,
  children,
}: {
  box: number;
  left: number;
  top: number;
  rotate: number;
  background: string;
  entrance: ReturnType<Entrance>;
  children: ReactNode;
}) {
  const style: CSSProperties = { width: box, height: box, left, top };
  return (
    <motion.div {...entrance} className="absolute flex items-center justify-center" style={style}>
      <div
        className="relative size-20 flex-none overflow-hidden rounded-[13px] border-[4.236px] border-white bg-logo-tile"
        style={{ transform: `rotate(${rotate}deg)`, boxShadow: tileShadow }}
      >
        <div
          className="absolute -inset-[2.12px] overflow-hidden rounded-[3.972px] shadow-[0_5.648px_5.648px_0_rgb(0_0_0_/_0.25)]"
          style={{ background }}
        >
          {children}
        </div>
      </div>
    </motion.div>
  );
}
