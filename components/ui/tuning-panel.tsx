"use client";

import { useEffect, useId, useRef, useState, type KeyboardEvent, type PointerEvent, type ReactNode } from "react";
import { newPointId, type MeshPoint } from "@/lib/mesh";

export type GradientStop = { color: string; at: number };

/**
 * The tuning panels' shared parts, styled after the DD-Kitchen side sheet
 * controls: a dark panel at the bottom left with sections of sliders,
 * choices, colours and pads, and Copy config and Reset at the foot.
 * Shift+Option+C toggles a page's panel; Escape closes it. Focus moves in
 * when it opens and stays on whatever control you're using.
 */
export function TuningPanel({
  title,
  open,
  onClose,
  onReset,
  copyValue,
  children,
}: {
  title: string;
  open: boolean;
  onClose: () => void;
  onReset: () => void;
  copyValue: unknown;
  children: ReactNode;
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);

  /* Latest close handler, so the effect below runs only when the panel opens
     or closes, not on every change (which would pull focus off a slider). */
  const closeRef = useRef(onClose);
  useEffect(() => {
    closeRef.current = onClose;
  });

  useEffect(() => {
    if (!open) return;
    const frame = requestAnimationFrame(() => panelRef.current?.focus());
    const onKey = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") closeRef.current();
    };
    document.addEventListener("keydown", onKey);
    return () => {
      cancelAnimationFrame(frame);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  if (!open) return null;

  async function copy() {
    const text = JSON.stringify(copyValue, null, 2);
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const area = document.createElement("textarea");
      area.value = text;
      document.body.appendChild(area);
      area.select();
      document.execCommand("copy");
      area.remove();
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1400);
  }

  return (
    <div
      ref={panelRef}
      role="dialog"
      aria-label={title}
      tabIndex={-1}
      className="fixed bottom-5 left-5 z-50 flex max-h-[calc(100dvh-40px)] w-[320px] max-w-[calc(100vw-40px)] origin-bottom-left flex-col overflow-hidden rounded-[20px] bg-[#0e0e0f] text-white shadow-[0_24px_48px_-12px_rgb(0_0_0_/_0.32),0_0_0_1px_rgb(255_255_255_/_0.04)] motion-safe:animate-pop focus-visible:outline-none"
    >
      <header className="flex items-center justify-between px-4 pt-3.5 pb-2">
        <div>
          <p className="text-[13px] font-medium">{title}</p>
          <p className="text-[11px] text-zinc-400">Shift+Option+C to hide</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label={`Close ${title.toLowerCase()}`}
          className="grid size-7 place-items-center rounded-full text-zinc-400 transition-colors hover:bg-white/5 hover:text-white"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden>
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>
      </header>

      <div className="flex flex-col gap-4 overflow-y-auto overscroll-contain px-3 pb-3">{children}</div>

      <footer className="flex gap-2 border-t border-white/5 p-3">
        <button
          type="button"
          onClick={copy}
          className="h-9 flex-1 rounded-[10px] bg-white text-[12px] font-medium text-black transition-transform active:scale-[0.97]"
        >
          {copied ? "Copied" : "Copy config"}
        </button>
        <button
          type="button"
          onClick={onReset}
          className="h-9 flex-1 rounded-[10px] bg-[#1a1a1c] text-[12px] font-medium text-zinc-200 transition-[transform,background-color] hover:bg-[#232326] active:scale-[0.97]"
        >
          Reset
        </button>
      </footer>
      <p role="status" className="sr-only">
        {copied ? "Config copied to the clipboard." : ""}
      </p>
    </div>
  );
}

/** A labelled colour: the swatch opens the system colour picker. */
export function ColorField({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="flex h-[34px] cursor-pointer items-center gap-2.5 rounded-[10px] bg-[#1a1a1c] pr-3 pl-1 transition-colors has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-1 has-[:focus-visible]:outline-white/70 hover:bg-[#1e1e21]">
      <span className="relative size-[26px] shrink-0 rounded-[7px] shadow-[inset_0_0_0_1px_rgb(255_255_255_/_0.12)]" style={{ background: value }}>
        <input
          type="color"
          aria-label={label}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="absolute inset-0 size-full cursor-pointer opacity-0"
        />
      </span>
      <span className="flex-1 text-[12px] text-zinc-300">{label}</span>
      <span className="text-[12px] text-white tabular-nums">{value.toUpperCase()}</span>
    </label>
  );
}

const MAX_POINTS = 8;

/**
 * A mesh gradient's colour points on a pad that previews the surface. Drag a
 * point to move it; select one to change its colour, size and strength or to
 * remove it; Add point puts a new one in the middle. Points are buttons, so
 * Tab reaches them and the arrow keys move them (Shift for 10%). An optional
 * `anchor` is a point owned by something else (the sign-in dome, a card's
 * gradient centre): it moves the same way but can't be recoloured or removed.
 */
export function MeshPad({
  points,
  onChange,
  preview,
  anchor,
  aspect = "aspect-[16/7]",
}: {
  points: MeshPoint[];
  onChange: (points: MeshPoint[]) => void;
  preview?: string;
  anchor?: { label: string; x: number; y: number; onMove: (x: number, y: number) => void };
  aspect?: string;
}) {
  const [selected, setSelected] = useState<string | null>(points[0]?.id ?? null);
  const point = points.find((item) => item.id === selected);
  const clamp = (v: number) => Math.round(Math.min(100, Math.max(0, v)));

  const update = (id: string, patch: Partial<MeshPoint>) =>
    onChange(points.map((item) => (item.id === id ? { ...item, ...patch } : item)));

  /* Points sit directly in the pad, so a point's parent is the pad. */
  function position(event: PointerEvent<HTMLButtonElement>) {
    const box = event.currentTarget.parentElement!.getBoundingClientRect();
    return { x: clamp(((event.clientX - box.left) / box.width) * 100), y: clamp(((event.clientY - box.top) / box.height) * 100) };
  }

  function dragProps(move: (x: number, y: number) => void, x: number, y: number) {
    return {
      onPointerDown: (event: PointerEvent<HTMLButtonElement>) => {
        event.currentTarget.setPointerCapture(event.pointerId);
      },
      onPointerMove: (event: PointerEvent<HTMLButtonElement>) => {
        if (!event.currentTarget.hasPointerCapture(event.pointerId)) return;
        const at = position(event);
        move(at.x, at.y);
      },
      onKeyDown: (event: KeyboardEvent<HTMLButtonElement>) => {
        const step = event.shiftKey ? 10 : 1;
        const delta: Record<string, [number, number]> = {
          ArrowLeft: [-step, 0],
          ArrowRight: [step, 0],
          ArrowUp: [0, -step],
          ArrowDown: [0, step],
        };
        const d = delta[event.key];
        if (!d) return;
        event.preventDefault();
        move(clamp(x + d[0]), clamp(y + d[1]));
      },
    };
  }

  function add() {
    const base = point ?? points[points.length - 1];
    const made: MeshPoint = {
      id: newPointId(),
      x: 50,
      y: 50,
      color: base?.color ?? "#62d6fa",
      size: base?.size ?? 45,
      strength: base?.strength ?? 0.8,
    };
    onChange([...points, made]);
    setSelected(made.id);
  }

  return (
    <div className="flex flex-col gap-1.5">
      <div
        className={`relative ${aspect} touch-none overflow-hidden rounded-[10px] bg-[#1a1a1c] bg-[linear-gradient(#2d2d33_1px,transparent_1px),linear-gradient(90deg,#2d2d33_1px,transparent_1px)] bg-[size:25%_25%] bg-center`}
      >
        {preview ? <div aria-hidden className="absolute inset-0 opacity-90" style={{ background: preview }} /> : null}
        {anchor ? (
          <button
            type="button"
            aria-label={`${anchor.label}, ${anchor.x}% across, ${anchor.y}% down. Arrow keys move it.`}
            {...dragProps(anchor.onMove, anchor.x, anchor.y)}
            className="absolute size-4 -translate-1/2 cursor-grab touch-none rounded-full border-2 border-white bg-transparent shadow-[0_0_0_1px_rgb(0_0_0_/_0.4)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white active:cursor-grabbing"
            style={{ left: `${anchor.x}%`, top: `${anchor.y}%` }}
          />
        ) : null}
        {points.map((item, index) => (
          <button
            key={item.id}
            type="button"
            aria-label={`Point ${index + 1}, ${item.x}% across, ${item.y}% down. Arrow keys move it.`}
            aria-pressed={item.id === selected}
            onFocus={() => setSelected(item.id)}
            {...dragProps((x, y) => update(item.id, { x, y }), item.x, item.y)}
            className={`absolute size-3.5 -translate-1/2 cursor-grab touch-none rounded-full border-2 transition-[box-shadow] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white active:cursor-grabbing ${
              item.id === selected ? "border-white shadow-[0_0_0_3px_rgb(255_255_255_/_0.35)]" : "border-white/70"
            }`}
            style={{ left: `${item.x}%`, top: `${item.y}%`, background: item.color }}
          />
        ))}
      </div>

      {point ? (
        <div className="flex flex-col gap-1.5 rounded-[12px] border border-white/5 p-1.5">
          <ColorField label={`Point ${points.indexOf(point) + 1} colour`} value={point.color} onChange={(color) => update(point.id, { color })} />
          <Slider label="Size" unit="%" min={5} max={150} step={1} value={point.size} onChange={(size) => update(point.id, { size })} />
          <Slider label="Strength" min={0} max={1} step={0.05} value={point.strength} onChange={(strength) => update(point.id, { strength })} />
          <button
            type="button"
            onClick={() => {
              const rest = points.filter((item) => item.id !== point.id);
              onChange(rest);
              setSelected(rest[rest.length - 1]?.id ?? null);
            }}
            className="h-[30px] rounded-[8px] text-[12px] text-zinc-400 transition-colors hover:bg-white/5 hover:text-white"
          >
            Remove point {points.indexOf(point) + 1}
          </button>
        </div>
      ) : null}

      <button
        type="button"
        onClick={add}
        disabled={points.length >= MAX_POINTS}
        className="flex h-[34px] items-center justify-center gap-1.5 rounded-[10px] border border-dashed border-white/15 text-[12px] text-zinc-300 transition-colors hover:border-white/30 hover:text-white disabled:opacity-30"
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden>
          <path d="M12 5v14M5 12h14" />
        </svg>
        Add point
      </button>
    </div>
  );
}

export function Section({ label, children }: { label: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-1.5">
      <h3 className="px-1 text-[12px] font-medium text-zinc-200">{label}</h3>
      {children}
    </section>
  );
}

/**
 * A slider row: a real range input over a filled track, so it works with a
 * pointer, arrow keys and touch alike.
 */
export function Slider({
  label,
  value,
  min,
  max,
  step,
  unit = "",
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit?: string;
  onChange: (value: number) => void;
}) {
  const id = useId();
  const share = Math.max(0, Math.min(1, (value - min) / (max - min)));
  const decimals = step < 0.1 ? 2 : step < 1 ? 1 : 0;
  return (
    <div className="relative h-[34px] overflow-hidden rounded-[10px] bg-[#1a1a1c] transition-colors has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-1 has-[:focus-visible]:outline-white/70 hover:bg-[#1e1e21]">
      <div aria-hidden className="pointer-events-none absolute inset-y-0 left-0 bg-[#2d2d33]" style={{ width: `${share * 100}%` }} />
      <div aria-hidden className="pointer-events-none relative flex h-full items-center justify-between px-3 text-[12px]">
        <span className="text-zinc-300">{label}</span>
        <span className="text-white tabular-nums">
          {value.toFixed(decimals)}
          {unit ? <span className="ml-0.5 text-zinc-400">{unit}</span> : null}
        </span>
      </div>
      <input
        id={id}
        type="range"
        aria-label={label}
        aria-valuetext={`${value.toFixed(decimals)}${unit ? ` ${unit}` : ""}`}
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="absolute inset-0 size-full cursor-ew-resize opacity-0"
      />
    </div>
  );
}

export function Choice<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: [T, string][];
  onChange: (value: T) => void;
}) {
  return (
    <div role="group" aria-label={label} className="flex items-center justify-between gap-2 rounded-[10px] bg-[#1a1a1c] py-1 pr-1 pl-3">
      <span className="text-[12px] text-zinc-300">{label}</span>
      <div className="flex gap-0.5">
        {options.map(([option, text]) => (
          <button
            key={option}
            type="button"
            aria-pressed={value === option}
            onClick={() => onChange(option)}
            className={`h-[26px] rounded-[7px] px-2.5 text-[12px] transition-colors ${
              value === option ? "bg-white text-black" : "text-zinc-300 hover:bg-white/5 hover:text-white"
            }`}
          >
            {text}
          </button>
        ))}
      </div>
    </div>
  );
}


const MAX_STOPS = 10;

/** Mix two hex colours halfway, for a new stop between them. */
function mix(a: string, b: string) {
  const channel = (hex: string, i: number) => parseInt(hex.slice(i, i + 2), 16);
  return `#${[1, 3, 5].map((i) => Math.round((channel(a, i) + channel(b, i)) / 2).toString(16).padStart(2, "0")).join("")}`;
}

/**
 * A gradient's colours: change one with its swatch, move it with its slider,
 * remove it, or add one. A new colour goes into the widest gap, mixed from
 * its neighbours. Rows keep their order while you drag, so a row never jumps
 * out from under the pointer; the gradient itself always uses position order.
 */
export function StopEditor({
  name,
  direction,
  stops,
  onChange,
}: {
  name: string;
  direction: string;
  stops: GradientStop[];
  onChange: (stops: GradientStop[]) => void;
}) {
  const ordered = [...stops].sort((a, b) => a.at - b.at);
  const update = (index: number, patch: Partial<GradientStop>) =>
    onChange(stops.map((stop, i) => (i === index ? { ...stop, ...patch } : stop)));

  function add() {
    let gap = { from: ordered[0], to: ordered[0], size: -1 };
    for (let i = 0; i < ordered.length - 1; i++) {
      const size = ordered[i + 1].at - ordered[i].at;
      if (size > gap.size) gap = { from: ordered[i], to: ordered[i + 1], size };
    }
    const last = ordered[ordered.length - 1];
    /* Past the last stop is a gap too, as long as there's room. */
    if (100 - last.at > gap.size) gap = { from: last, to: { color: last.color, at: 100 }, size: 100 - last.at };
    onChange([...stops, { color: mix(gap.from.color, gap.to.color), at: Math.round((gap.from.at + gap.to.at) / 2) }]);
  }

  return (
    <div className="flex flex-col gap-1.5">
      <div
        aria-hidden
        className="h-5 rounded-[7px] shadow-[inset_0_0_0_1px_rgb(255_255_255_/_0.08)]"
        style={{ background: `linear-gradient(${direction}, ${ordered.map((s) => `${s.color} ${s.at}%`).join(", ")})` }}
      />
      {stops.map((stop, index) => (
        <div key={index} className="flex items-center gap-1.5">
          <label
            className="relative size-[34px] shrink-0 cursor-pointer rounded-[10px] shadow-[inset_0_0_0_1px_rgb(255_255_255_/_0.12)] has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-1 has-[:focus-visible]:outline-white/70"
            style={{ background: stop.color }}
          >
            <input
              type="color"
              aria-label={`${name} colour ${index + 1}`}
              value={stop.color}
              onChange={(event) => update(index, { color: event.target.value })}
              className="absolute inset-0 size-full cursor-pointer opacity-0"
            />
          </label>
          <div className="min-w-0 flex-1">
            <Slider
              label={stop.color.toUpperCase()}
              unit="%"
              min={0}
              max={100}
              step={1}
              value={stop.at}
              onChange={(at) => update(index, { at })}
            />
          </div>
          <button
            type="button"
            aria-label={`Remove ${name.toLowerCase()} colour ${index + 1}`}
            disabled={stops.length <= 2}
            onClick={() => onChange(stops.filter((_, i) => i !== index))}
            className="grid size-[34px] shrink-0 place-items-center rounded-[10px] bg-[#1a1a1c] text-zinc-400 transition-colors hover:bg-[#232326] hover:text-white disabled:opacity-30 disabled:hover:bg-[#1a1a1c] disabled:hover:text-zinc-400"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden>
              <path d="M5 12h14" />
            </svg>
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={add}
        disabled={stops.length >= MAX_STOPS}
        className="flex h-[34px] items-center justify-center gap-1.5 rounded-[10px] border border-dashed border-white/15 text-[12px] text-zinc-300 transition-colors hover:border-white/30 hover:text-white disabled:opacity-30"
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden>
          <path d="M12 5v14M5 12h14" />
        </svg>
        Add colour
      </button>
    </div>
  );
}
