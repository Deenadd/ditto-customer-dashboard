"use client";

import { Choice, MeshPad, Section, Slider, StopEditor, TuningPanel } from "@/components/ui/tuning-panel";
import { defaultGlowConfig, setGlowConfig, type GlowConfig } from "./glow-config";
import type { GlowTone } from "./glow-ramps";
import { SignInGradientPreview } from "./sign-in-gradient";

export type GlowPreview = { tone: GlowTone | "auto" };

/**
 * Tuning panel for the sign-in wash. Shift+Option+C opens and closes it.
 * Changes apply live and are remembered in this browser; Copy config puts the
 * JSON on the clipboard, ready to become the defaults in glow-config.ts.
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
  const set = (patch: Partial<GlowConfig>) => setGlowConfig({ ...config, ...patch });

  return (
    <TuningPanel
      title="Glow controls"
      open={open}
      onClose={onClose}
      onReset={() => setGlowConfig(defaultGlowConfig)}
      copyValue={config}
    >
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

      <Section label="Mesh">
        <MeshPad
          points={config.mesh}
          onChange={(mesh) => set({ mesh })}
          preview={SignInGradientPreview(config)}
          anchor={{
            label: "Blue dome",
            x: config.domeX,
            y: config.domeY,
            onMove: (domeX, domeY) => set({ domeX, domeY }),
          }}
        />
      </Section>

      <Section label="Blue dome">
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
    </TuningPanel>
  );
}
