"use client";

import { useEffect, useState } from "react";
import { defaultCardConfig, setCardConfig, useCardConfig } from "@/components/dashboard/card-config";
import { Choice, Section, Slider, TuningPanel } from "@/components/ui/tuning-panel";

/**
 * Tuning panel for the dashboard's policy cards' hover: Press (Bencho's
 * tilt card, sinking under the pointer) or Glare, each with its controls.
 * Shift+Option+C opens and closes it. Changes apply live and are
 * remembered in this browser; Copy config gives the JSON for card-config.ts.
 */
export function CardControls() {
  const config = useCardConfig();
  const [open, setOpen] = useState(false);
  const set = (patch: Partial<typeof config>) => setCardConfig({ ...config, ...patch });

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
      <Section label="Effect">
        <Choice
          label="On hover"
          value={config.effect}
          options={[
            ["press", "Press"],
            ["glare", "Glare"],
          ]}
          onChange={(effect) => set({ effect })}
        />
      </Section>

      {config.effect === "press" ? (
        <Section label="Press">
          <Slider label="Tilt" unit="°" min={0} max={20} step={0.5} value={config.pressTilt} onChange={(pressTilt) => set({ pressTilt })} />
          <Slider label="Dent shade" min={0} max={100} step={1} value={config.shade} onChange={(shade) => set({ shade })} />
          <Slider label="Spring" min={0} max={100} step={1} value={config.spring} onChange={(spring) => set({ spring })} />
          <Slider label="Depth" unit="px" min={200} max={2000} step={50} value={config.depth} onChange={(depth) => set({ depth })} />
          <Slider label="Sink" unit="px" min={0} max={30} step={1} value={config.sink} onChange={(sink) => set({ sink })} />
        </Section>
      ) : (
        <>
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
        </>
      )}
    </TuningPanel>
  );
}
