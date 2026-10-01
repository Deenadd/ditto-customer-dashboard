"use client";

import { useEffect, useId, useRef, useState, type PointerEvent, type ReactNode } from "react";
import { defaultGlowConfig, setGlowConfig, type GlowConfig } from "./glow-config";
import type { GlowStop, GlowTone } from "./glow-ramps";

export type GlowPreview = { tone: GlowTone | "auto" };

/**
 * Tuning panel for the sign-in wash, styled after the DD-Kitchen side sheet
 * controls. Shift+Option+C opens and closes it; Escape closes it. Changes
 * apply live and are remembered in this browser. Copy config puts the JSON on
 * the clipboard, ready to become the defaults in glow-config.ts.
 */
export function GlowControls({
  open,
  onClose,
  config,
  preview,
  onPreviewChange,
}: {
  open: boolean;
  onClose: () => void;
  config: GlowConfig;
  preview: GlowPreview;
  onPreviewChange: (preview: GlowPreview) => void;
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);
  const set = (patch: Partial<GlowConfig>) => setGlowConfig({ ...config, ...patch });

  /* Latest close handler, so the effects below run only when the panel opens
     or closes, not on every change (which would pull focus off a slider). */
  const closeRef = useRef(onClose);
  useEffect(() => {
    closeRef.current = onClose;
  });

  useEffect(() => {
    if (!open) return;
    const frame = requestAnimationFrame(() => panelRef.current?.focus());
    const onKey = (event: KeyboardEvent) => {
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
    const text = JSON.stringify(config, null, 2);
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
      aria-label="Glow controls"
      tabIndex={-1}
      className="fixed bottom-5 left-5 z-50 flex max-h-[calc(100dvh-40px)] w-[320px] max-w-[calc(100vw-40px)] origin-bottom-left flex-col overflow-hidden rounded-[20px] bg-[#0e0e0f] text-white shadow-[0_24px_48px_-12px_rgb(0_0_0_/_0.32),0_0_0_1px_rgb(255_255_255_/_0.04)] motion-safe:animate-pop focus-visible:outline-none"
    >
      <header className="flex items-center justify-between px-4 pt-3.5 pb-2">
        <div>
          <p className="text-[13px] font-medium">Glow controls</p>
          <p className="text-[11px] text-zinc-400">Shift+Option+C to hide</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close glow controls"
          className="grid size-7 place-items-center rounded-full text-zinc-400 transition-colors hover:bg-white/5 hover:text-white"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden>
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>
      </header>

      <div className="flex flex-col gap-4 overflow-y-auto overscroll-contain px-3 pb-3">
        <Section label="Preview">
          <Choice
            label="Colour"
            value={preview.tone}
            options={[
              ["auto", "Flow"],
              ["blue", "Blue"],
              ["red", "Red"],
              ["green", "Green"],
            ]}
            onChange={(tone) => onPreviewChange({ tone })}
          />
        </Section>

        <Section label="Shape">
          <Slider label="Height" unit="dvh" min={15} max={100} step={1} value={config.heightVh} onChange={(heightVh) => set({ heightVh })} />
          <Slider label="Edge curve" min={0} max={1} step={0.01} value={config.curve} onChange={(curve) => set({ curve })} />
          <Slider label="Soft edge" unit="%" min={5} max={90} step={1} value={config.softness} onChange={(softness) => set({ softness })} />
          <Slider label="Intensity" min={0} max={1} step={0.05} value={config.intensity} onChange={(intensity) => set({ intensity })} />
        </Section>

        <Section label="Blue dome">
          <PositionPad x={config.domeX} y={config.domeY} onChange={(domeX, domeY) => set({ domeX, domeY })} />
          <Slider label="Across" unit="%" min={0} max={100} step={1} value={config.domeX} onChange={(domeX) => set({ domeX })} />
          <Slider label="Down" unit="%" min={0} max={100} step={1} value={config.domeY} onChange={(domeY) => set({ domeY })} />
          <Slider label="Width" unit="%" min={10} max={150} step={1} value={config.coreWidth} onChange={(coreWidth) => set({ coreWidth })} />
          <Slider label="Depth" unit="%" min={5} max={100} step={1} value={config.coreDepth} onChange={(coreDepth) => set({ coreDepth })} />
        </Section>

        <Section label="Dome colours">
          <StopEditor name="Dome" direction="to right" stops={config.core} onChange={(core) => set({ core })} />
        </Section>

        <Section label="Band colours">
          <StopEditor name="Band" direction="to right" stops={config.base} onChange={(base) => set({ base })} />
        </Section>

        <Section label="Animation">
          <Slider label="Colour change" unit="ms" min={0} max={2000} step={50} value={config.toneDuration} onChange={(toneDuration) => set({ toneDuration })} />
        </Section>
      </div>

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
          onClick={() => setGlowConfig(defaultGlowConfig)}
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

function Section({ label, children }: { label: string; children: ReactNode }) {
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
function Slider({
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

function Choice<T extends string>({
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

/**
 * Drag the dot to move the dome. The pad is the wash in miniature: across is
 * the screen's width, down is the wash's height. The Across and Down sliders
 * beside it do the same from the keyboard.
 */
function PositionPad({ x, y, onChange }: { x: number; y: number; onChange: (x: number, y: number) => void }) {
  const moveTo = (event: PointerEvent<HTMLDivElement>) => {
    const box = event.currentTarget.getBoundingClientRect();
    const clamp = (v: number) => Math.round(Math.min(100, Math.max(0, v)));
    onChange(clamp(((event.clientX - box.left) / box.width) * 100), clamp(((event.clientY - box.top) / box.height) * 100));
  };
  return (
    <div
      aria-hidden
      onPointerDown={(event) => {
        event.currentTarget.setPointerCapture(event.pointerId);
        moveTo(event);
      }}
      onPointerMove={(event) => {
        if (event.currentTarget.hasPointerCapture(event.pointerId)) moveTo(event);
      }}
      className="relative h-24 cursor-crosshair touch-none overflow-hidden rounded-[10px] bg-[#1a1a1c] bg-[linear-gradient(#2d2d33_1px,transparent_1px),linear-gradient(90deg,#2d2d33_1px,transparent_1px)] bg-[size:25%_25%] bg-center"
    >
      <span
        className="pointer-events-none absolute size-3.5 -translate-1/2 rounded-full bg-white shadow-[0_0_0_3px_rgb(255_255_255_/_0.2)]"
        style={{ left: `${x}%`, top: `${y}%` }}
      />
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
function StopEditor({
  name,
  direction,
  stops,
  onChange,
}: {
  name: string;
  direction: string;
  stops: GlowStop[];
  onChange: (stops: GlowStop[]) => void;
}) {
  const ordered = [...stops].sort((a, b) => a.at - b.at);
  const update = (index: number, patch: Partial<GlowStop>) =>
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
