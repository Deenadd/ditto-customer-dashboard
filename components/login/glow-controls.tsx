"use client";

import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import {
  defaultGlowConfig,
  easingPresets,
  setGlowConfig,
  type GlowConfig,
} from "./glow-config";
import type { GlowPosition, GlowTone } from "./sign-in-gradient";

export type GlowPreview = { position: GlowPosition | "auto"; tone: GlowTone | "auto" };

/**
 * Tuning panel for the sign-in glow, styled after the DD-Kitchen side sheet
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
            label="Position"
            value={preview.position}
            options={[
              ["auto", "Flow"],
              ["bottom", "Bottom"],
              ["top", "Top"],
            ]}
            onChange={(position) => onPreviewChange({ ...preview, position })}
          />
          <Choice
            label="Colour"
            value={preview.tone}
            options={[
              ["auto", "Flow"],
              ["blue", "Blue"],
              ["red", "Red"],
              ["green", "Green"],
            ]}
            onChange={(tone) => onPreviewChange({ ...preview, tone })}
          />
        </Section>

        <Section label="Size">
          <Slider label="Radius" unit="dvh" min={20} max={120} step={1} value={config.radiusVh} onChange={(radiusVh) => set({ radiusVh })} />
          <Slider label="Max radius" unit="vw" min={20} max={160} step={1} value={config.maxRadiusVw} onChange={(maxRadiusVw) => set({ maxRadiusVw })} />
          <Slider label="Soft edge from" unit="%" min={30} max={95} step={0.5} value={config.featherStart} onChange={(featherStart) => set({ featherStart })} />
          <Slider label="Intensity" min={0} max={1} step={0.05} value={config.intensity} onChange={(intensity) => set({ intensity })} />
        </Section>

        <Section label="Bottom position">
          <Slider label="Below edge" unit="× r" min={-0.6} max={0.9} step={0.01} value={config.bottomOffset} onChange={(bottomOffset) => set({ bottomOffset })} />
          <Slider label="Across" unit="%" min={0} max={100} step={1} value={config.bottomX} onChange={(bottomX) => set({ bottomX })} />
          <Slider label="Scale" unit="×" min={0.2} max={2} step={0.01} value={config.bottomScale} onChange={(bottomScale) => set({ bottomScale })} />
        </Section>

        <Section label="Top position">
          <Slider label="Above edge" unit="× r" min={-0.6} max={0.9} step={0.01} value={config.topOffset} onChange={(topOffset) => set({ topOffset })} />
          <Slider label="Across" unit="%" min={0} max={100} step={1} value={config.topX} onChange={(topX) => set({ topX })} />
          <Slider label="Scale" unit="×" min={0.2} max={2} step={0.01} value={config.topScale} onChange={(topScale) => set({ topScale })} />
        </Section>

        <Section label="Animation">
          <Slider label="Move duration" unit="ms" min={0} max={3000} step={50} value={config.moveDuration} onChange={(moveDuration) => set({ moveDuration })} />
          <div className="flex flex-wrap gap-1.5 px-0.5">
            {easingPresets.map((preset) => {
              const active = preset.cubic.every((v, i) => v === config.cubic[i]);
              return (
                <button
                  key={preset.label}
                  type="button"
                  aria-pressed={active}
                  onClick={() => set({ cubic: preset.cubic })}
                  className={`h-7 rounded-full px-3 text-[12px] transition-colors ${
                    active ? "bg-white text-black" : "bg-[#1a1a1c] text-zinc-300 hover:bg-[#232326] hover:text-white"
                  }`}
                >
                  {preset.label}
                </button>
              );
            })}
          </div>
          <CurvePreview cubic={config.cubic} />
          {(["x1", "y1", "x2", "y2"] as const).map((name, index) => (
            <Slider
              key={name}
              label={`Curve ${name}`}
              min={index % 2 === 0 ? 0 : -1}
              max={index % 2 === 0 ? 1 : 2}
              step={0.01}
              value={config.cubic[index]}
              onChange={(value) => {
                const cubic = [...config.cubic] as GlowConfig["cubic"];
                cubic[index] = value;
                set({ cubic });
              }}
            />
          ))}
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

/** The easing curve, drawn so you can see its shape as you tune it. */
function CurvePreview({ cubic }: { cubic: GlowConfig["cubic"] }) {
  const [x1, y1, x2, y2] = cubic;
  const map = (x: number, y: number) => `${6 + x * 88} ${64 - y * 58}`;
  return (
    <div className="rounded-[10px] bg-[#1a1a1c] p-2.5">
      <svg viewBox="0 0 100 70" className="h-20 w-full" aria-label={`Easing curve ${cubic.join(", ")}`} role="img">
        <line x1="6" y1="64" x2="94" y2="64" stroke="#2d2d33" strokeWidth="0.5" />
        <line x1="6" y1="6" x2="94" y2="6" stroke="#2d2d33" strokeWidth="0.5" strokeDasharray="2 3" />
        <line x1="6" y1="64" x2={6 + x1 * 88} y2={64 - y1 * 58} stroke="#52525b" strokeWidth="0.6" />
        <line x1="94" y1="6" x2={6 + x2 * 88} y2={64 - y2 * 58} stroke="#52525b" strokeWidth="0.6" />
        <path d={`M ${map(0, 0)} C ${map(x1, y1)}, ${map(x2, y2)}, ${map(1, 1)}`} fill="none" stroke="white" strokeWidth="1.4" strokeLinecap="round" />
      </svg>
    </div>
  );
}
