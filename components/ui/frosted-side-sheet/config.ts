import type { Transition } from "motion/react";

/**
 * Tuning for the frosted side sheet (Recollect-style), ported from
 * DD-Kitchen's side sheet (ryoiki-tenkai.vercel.app/projects/side-sheet).
 * Every field maps 1:1 onto the playground's controls. Durations are ms
 * unless noted; `blurStrength` and `blurFeather` are px.
 */
export type SheetTransitionType = "easing" | "time" | "physics";

export type EaseKey =
  | "easeOut"
  | "easeInOut"
  | "easeIn"
  | "linear"
  | "circOut"
  | "backOut"
  | "anticipate";

export type SideSheetConfig = {
  transitionType: SheetTransitionType;

  inDuration: number;
  outDuration: number;
  easing: EaseKey;

  /** "easing" mode: cubic-bezier control points. */
  cubic: [number, number, number, number];

  /** "time" mode: spring by bounce and duration (seconds). */
  bounce: number;
  timeDuration: number;

  /** "physics" mode: classic spring. */
  stiffness: number;
  damping: number;
  mass: number;

  /** Content reveal: first item waits staggerInitial, then staggerStep apart. */
  staggerInitial: number;
  staggerStep: number;
  itemDuration: number;

  blurStrength: number;
  blurFeather: number;
  sheetTint: number;
  sheetColor: string;
};

/** The tuned values, verbatim. */
export const defaultSideSheetConfig: SideSheetConfig = {
  transitionType: "physics",
  inDuration: 520,
  outDuration: 340,
  easing: "easeOut",
  cubic: [0.32, 0.72, 0, 1],
  bounce: 0.25,
  timeDuration: 0.5,
  stiffness: 274,
  damping: 51,
  mass: 3.1,
  staggerInitial: 160,
  staggerStep: 70,
  itemDuration: 420,
  blurStrength: 28,
  blurFeather: 160,
  sheetTint: 0.72,
  sheetColor: "#F7F7F7",
};

export function resolveSideSheetConfig(overrides?: Partial<SideSheetConfig>): SideSheetConfig {
  return { ...defaultSideSheetConfig, ...overrides };
}

/** The sheet's own glide. Closing is faster in "easing" mode (outDuration). */
export function buildSheetTransition(config: SideSheetConfig, phase: "in" | "out"): Transition {
  switch (config.transitionType) {
    case "easing":
      return {
        duration: (phase === "in" ? config.inDuration : config.outDuration) / 1000,
        ease: config.cubic,
      };
    case "time":
      return { type: "spring", bounce: config.bounce, duration: config.timeDuration };
    case "physics":
      return {
        type: "spring",
        stiffness: config.stiffness,
        damping: config.damping,
        mass: config.mass,
      };
  }
}

/** Each revealed item: fade, small rise, blur to sharp. */
export function buildItemTransition(config: SideSheetConfig): Transition {
  switch (config.transitionType) {
    case "easing":
      return { duration: config.itemDuration / 1000, ease: config.cubic };
    case "time":
      return { type: "spring", bounce: config.bounce, duration: config.timeDuration };
    case "physics":
      return {
        type: "spring",
        stiffness: config.stiffness,
        damping: config.damping,
        mass: config.mass,
      };
  }
}

export function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const m = hex.replace("#", "").trim();
  const v =
    m.length === 3
      ? m
          .split("")
          .map((c) => c + c)
          .join("")
      : m.padEnd(6, "0").slice(0, 6);
  const r = parseInt(v.slice(0, 2), 16);
  const g = parseInt(v.slice(2, 4), 16);
  const b = parseInt(v.slice(4, 6), 16);
  return {
    r: Number.isNaN(r) ? 255 : r,
    g: Number.isNaN(g) ? 255 : g,
    b: Number.isNaN(b) ? 255 : b,
  };
}
