"use client";

import { useEffect, useState } from "react";
import { defaultCardConfig, setCardConfig, useCardConfig, type CardPalette, type CardTone } from "@/components/dashboard/card-config";
import { frameBackground } from "@/components/dashboard/health-card";
import { Choice, ColorField, MeshPad, Section, Slider, TuningPanel } from "@/components/ui/tuning-panel";

/**
 * Tuning panel for the dashboard's policy cards. Shift+Option+C opens and
 * closes it. Pick the health (blue) or term (green) card to edit its
 * gradient; glare and tilt apply to every card. Changes apply live and are
 * remembered in this browser; Copy config gives the JSON for card-config.ts.
 */
export function CardControls() {
  const config = useCardConfig();
  const [open, setOpen] = useState(false);
  const [tone, setTone] = useState<CardTone>("blue");
  const palette = config[tone];
  const set = (patch: Partial<typeof config>) => setCardConfig({ ...config, ...patch });
  const paint = (patch: Partial<CardPalette>) => set({ [tone]: { ...palette, ...patch } });

  /* Shift+Option+C (Shift+Alt+C); the key code, since Option changes the
     typed character on a Mac. */
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (!(event.altKey && event.shiftKey && event.code === "KeyC")) return;
      event.preventDefault();
      setOpen((value) => !value);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <TuningPanel
      title="Card controls"
      open={open}
      onClose={() => setOpen(false)}
      onReset={() => setCardConfig(defaultCardConfig)}
      copyValue={config}
    >
      <Section label="Card">
        <Choice
          label="Editing"
          value={tone}
          options={[
            ["blue", "Health"],
            ["green", "Term"],
          ]}
          onChange={setTone}
        />
      </Section>

      <Section label="Gradient">
        <MeshPad
          key={tone}
          points={palette.mesh}
          onChange={(mesh) => paint({ mesh })}
          preview={String(frameBackground(palette).backgroundImage)}
          aspect="aspect-[365/237]"
          anchor={{
            label: "Gradient centre",
            x: palette.focusX,
            y: palette.focusY,
            onMove: (focusX, focusY) => paint({ focusX, focusY }),
          }}
        />
        <ColorField label="Centre" value={palette.center} onChange={(center) => paint({ center })} />
        <ColorField label="Ring" value={palette.mid} onChange={(mid) => paint({ mid })} />
        <ColorField label="Edge" value={palette.edge} onChange={(edge) => paint({ edge })} />
        <Slider label="Ring at" unit="%" min={5} max={95} step={1} value={palette.midAt} onChange={(midAt) => paint({ midAt })} />
        <Slider label="Reach" unit="×" min={0.3} max={3} step={0.05} value={palette.spread} onChange={(spread) => paint({ spread })} />
      </Section>

      <Section label="Details">
        <ColorField label="Wave lines" value={palette.wave} onChange={(wave) => paint({ wave })} />
        <ColorField label="Wave shade" value={palette.shade} onChange={(shade) => paint({ shade })} />
        <ColorField label="Corner glow" value={palette.glow} onChange={(glow) => paint({ glow })} />
      </Section>

      <Section label="Glare">
        <Slider label="Glare" min={0} max={1} step={0.05} value={config.glare} onChange={(glare) => set({ glare })} />
        <Slider label="Foil" min={0} max={1} step={0.05} value={config.foil} onChange={(foil) => set({ foil })} />
      </Section>

      <Section label="Tilt">
        <Slider label="Tilt" min={0} max={1.5} step={0.05} value={config.tilt} onChange={(tilt) => set({ tilt })} />
        <Slider label="Perspective" unit="px" min={200} max={2000} step={50} value={config.perspective} onChange={(perspective) => set({ perspective })} />
        <Slider label="Lift" unit="×" min={1} max={1.08} step={0.005} value={config.lift} onChange={(lift) => set({ lift })} />
        <Slider label="Settle" unit="ms" min={0} max={1200} step={25} value={config.settle} onChange={(settle) => set({ settle })} />
      </Section>
    </TuningPanel>
  );
}
