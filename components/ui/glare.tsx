"use client";

import { useRef, useSyncExternalStore, type CSSProperties, type PointerEvent, type ReactNode } from "react";
import { useReducedMotion } from "motion/react";

export type GlareSettings = {
  tilt: number;
  perspective: number;
  lift: number;
  glare: number;
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
 * it: the face tilts toward the pointer and a white glare follows it. It
 * eases in, then tracks the pointer closely, and settles back when the
 * pointer leaves. The light is also handed to any foil on the face, through
 * --foil-x, --foil-y and --foil-lit (see card-foil.tsx).
 *
 * The pointer is read on the group, not each face, because a link may lie
 * over the faces. Touch screens get none of it (there's no hover), and
 * reduced motion keeps the glare but drops the tilt and lift.
 */
export function GlareGroup({
  settings,
  className,
  children,
}: {
  settings: GlareSettings;
  className?: string;
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
    for (const [name, value] of [["--r-x", "0deg"], ["--r-y", "0deg"], ["--s", "1"], ["--g-op", "0"], ["--foil-lit", "0"]])
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
    face.style.setProperty("--foil-x", `${px}%`);
    face.style.setProperty("--foil-y", `${py}%`);
    face.style.setProperty("--foil-lit", "1");
  }

  return (
    <div
      className={className}
      style={{ "--g-persp": `${settings.perspective}px` } as CSSProperties}
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
      </div>
    </div>
  );
}
