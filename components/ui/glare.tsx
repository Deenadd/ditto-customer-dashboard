"use client";

import { useRef, useSyncExternalStore, type CSSProperties, type PointerEvent, type ReactNode } from "react";
import { useReducedMotion } from "motion/react";

export type GlareSettings = {
  tilt: number;
  perspective: number;
  lift: number;
  glare: number;
  foil: number;
  settle: number;
};

const finePointer = "(hover: hover) and (pointer: fine)";
const subscribe = (listener: () => void) => {
  const query = window.matchMedia(finePointer);
  query.addEventListener("change", listener);
  return () => query.removeEventListener("change", listener);
};

/**
 * Glare and tilt on hover, after Aceternity's glare card (as on Linear's
 * site). The group watches the pointer and drives whichever face is under
 * it: the face tilts toward the pointer, a white glare follows it, and a
 * faint rainbow foil shifts with it. It eases in, then tracks the pointer
 * closely, and settles back when the pointer leaves.
 *
 * The pointer is read on the group, not each face, because a link may lie
 * over the faces. Touch screens get none of it (there's no hover), and
 * reduced motion keeps the glare but drops the tilt and lift.
 */
export function GlareGroup({
  settings,
  className,
  style,
  children,
}: {
  settings: GlareSettings;
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
}) {
  const reduced = !!useReducedMotion();
  const fine = useSyncExternalStore(subscribe, () => window.matchMedia(finePointer).matches, () => false);
  const timers = useRef(new Map<HTMLElement, number>());

  const faces = (root: HTMLElement) => Array.from(root.querySelectorAll<HTMLElement>("[data-glare-face]"));

  function rest(face: HTMLElement) {
    if (!face.dataset.active) return;
    delete face.dataset.active;
    window.clearTimeout(timers.current.get(face));
    face.style.setProperty("--g-dur", `${settings.settle}ms`);
    for (const [name, value] of [["--r-x", "0deg"], ["--r-y", "0deg"], ["--s", "1"], ["--g-op", "0"], ["--f-op", "0"]])
      face.style.setProperty(name, value);
  }

  function track(face: HTMLElement, event: PointerEvent) {
    const box = face.getBoundingClientRect();
    const px = ((event.clientX - box.left) / box.width) * 100;
    const py = ((event.clientY - box.top) / box.height) * 100;
    if (!face.dataset.active) {
      face.dataset.active = "1";
      /* Ease in, then follow the pointer closely. */
      face.style.setProperty("--g-dur", `${settings.settle}ms`);
      timers.current.set(
        face,
        window.setTimeout(() => face.dataset.active && face.style.setProperty("--g-dur", "120ms"), settings.settle),
      );
    }
    const tilt = reduced ? 0 : settings.tilt;
    face.style.setProperty("--r-x", `${(-(px - 50) / 3.5) * tilt}deg`);
    face.style.setProperty("--r-y", `${((py - 50) / 2) * tilt}deg`);
    face.style.setProperty("--s", `${reduced ? 1 : settings.lift}`);
    face.style.setProperty("--m-x", `${px}%`);
    face.style.setProperty("--m-y", `${py}%`);
    face.style.setProperty("--bg-x", `${50 + px / 4 - 12.5}%`);
    face.style.setProperty("--bg-y", `${50 + py / 3 - 16.67}%`);
    face.style.setProperty("--g-op", `${settings.glare}`);
    face.style.setProperty("--f-op", `${settings.foil}`);
  }

  return (
    <div
      className={className}
      style={{ ...style, "--g-persp": `${settings.perspective}px` } as CSSProperties}
      onPointerMove={(event) => {
        if (!fine) return;
        for (const face of faces(event.currentTarget)) {
          const box = face.getBoundingClientRect();
          const inside =
            event.clientX >= box.left && event.clientX <= box.right && event.clientY >= box.top && event.clientY <= box.bottom;
          if (inside) track(face, event);
          else rest(face);
        }
      }}
      onPointerLeave={(event) => faces(event.currentTarget).forEach(rest)}
    >
      {children}
    </div>
  );
}

/* The foil, from the reference: a rainbow and a diagonal sheen, blended by
   hue, over a shade that brightens toward the pointer. */
const foil: CSSProperties = {
  background: [
    "repeating-linear-gradient(0deg, rgb(255,119,115) 5%, rgba(255,237,95,1) 10%, rgba(168,255,95,1) 15%, rgba(131,255,247,1) 20%, rgba(120,148,255,1) 25%, rgb(216,117,255) 30%, rgb(255,119,115) 35%) 0% var(--bg-y, 50%)/200% 700% no-repeat",
    "repeating-linear-gradient(128deg, #0e152e 0%, hsl(180,10%,60%) 3.8%, hsl(180,10%,60%) 4.5%, hsl(180,10%,60%) 5.2%, #0e152e 10%, #0e152e 12%) var(--bg-x, 50%) var(--bg-y, 50%)/300% no-repeat",
    "radial-gradient(farthest-corner circle at var(--m-x, 50%) var(--m-y, 50%), rgba(255,255,255,0.1) 12%, rgba(255,255,255,0.15) 20%, rgba(255,255,255,0.25) 120%) var(--bg-x, 50%) var(--bg-y, 50%)/300% no-repeat",
  ].join(", "),
  backgroundBlendMode: "hue, hue, overlay",
};

/** One face that tilts and catches the glare. Its child should fill it. */
export function GlareFace({ children, className = "", radius = 16 }: { children: ReactNode; className?: string; radius?: number }) {
  const round = { borderRadius: radius } as CSSProperties;
  const fine = useSyncExternalStore(subscribe, () => window.matchMedia(finePointer).matches, () => false);
  /* Touch screens never hover, so they get the card alone: no 3D layer and
     no blend-mode overlays, which Safari composites at a cost. */
  if (!fine) return <div className={className}>{children}</div>;
  return (
    <div data-glare-face className={`[perspective:var(--g-persp,600px)] ${className}`}>
      <div className="relative h-full transition-transform duration-[var(--g-dur,300ms)] ease-out [transform:rotateY(var(--r-x,0deg))_rotateX(var(--r-y,0deg))_scale(var(--s,1))]">
        {children}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 z-[1] opacity-[var(--g-op,0)] mix-blend-soft-light transition-opacity duration-[var(--g-dur,300ms)] ease-out [background:radial-gradient(farthest-corner_circle_at_var(--m-x,50%)_var(--m-y,50%),rgba(255,255,255,0.8)_10%,rgba(255,255,255,0.65)_20%,rgba(255,255,255,0)_90%)]"
          style={round}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 z-[1] opacity-[var(--f-op,0)] mix-blend-color-dodge transition-opacity duration-[var(--g-dur,300ms)] ease-out"
          style={{ ...foil, ...round }}
        />
      </div>
    </div>
  );
}
