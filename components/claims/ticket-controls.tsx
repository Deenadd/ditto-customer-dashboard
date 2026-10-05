"use client";

import { defaultTicketConfig, setTicketConfig, useTicketConfig, type TicketConfig } from "@/components/claims/ticket-config";
import { Choice, Section, Slider, TuningPanel } from "@/components/ui/tuning-panel";

/**
 * Tuning panel for the claim ticket's print. Shift+Option+C on the ticket
 * opens it. Changes are saved as you drag; Print again plays them. Copy
 * config gives the JSON for ticket-config.ts.
 */
export function TicketControls({ open, onClose, onReplay }: { open: boolean; onClose: () => void; onReplay: () => void }) {
  const config = useTicketConfig();
  const set = (patch: Partial<TicketConfig>) => setTicketConfig({ ...config, ...patch });

  return (
    <TuningPanel title="Print controls" open={open} onClose={onClose} onReset={() => setTicketConfig(defaultTicketConfig)} copyValue={config}>
      <Section label="Preview">
        <button
          type="button"
          onClick={onReplay}
          className="h-[34px] rounded-[10px] bg-white text-[12px] font-medium text-black transition-transform active:scale-[0.97]"
        >
          Print again
        </button>
        <Choice
          label="Speed"
          value={String(config.speed)}
          options={[
            ["1", "1×"],
            ["0.5", "½×"],
            ["0.25", "¼×"],
            ["0.1", "⅒×"],
          ]}
          onChange={(speed) => set({ speed: Number(speed) })}
        />
      </Section>

      <Section label="Feed">
        <Choice
          label="Motion"
          value={config.feedMode}
          options={[
            ["pulls", "Pulls"],
            ["spring", "Spring"],
          ]}
          onChange={(feedMode) => set({ feedMode })}
        />
        {config.feedMode === "pulls" ? (
          <>
            <Slider label="Duration" unit="ms" min={300} max={5000} step={50} value={config.feedDuration} onChange={(feedDuration) => set({ feedDuration })} />
            <Slider label="Pulls" min={1} max={10} step={1} value={config.pulls} onChange={(pulls) => set({ pulls })} />
            <Slider label="Pause" min={0} max={0.8} step={0.01} value={config.pause} onChange={(pause) => set({ pause })} />
          </>
        ) : (
          <>
            <Slider label="Stiffness" min={10} max={600} step={5} value={config.feedStiffness} onChange={(feedStiffness) => set({ feedStiffness })} />
            <Slider label="Damping" min={1} max={80} step={0.5} value={config.feedDamping} onChange={(feedDamping) => set({ feedDamping })} />
            <Slider label="Mass" min={0.1} max={5} step={0.1} value={config.feedMass} onChange={(feedMass) => set({ feedMass })} />
          </>
        )}
      </Section>

      <Section label="Printer">
        <Slider label="Hum" unit="px" min={0} max={3} step={0.1} value={config.hum} onChange={(hum) => set({ hum })} />
        <Slider label="Hum cycle" unit="ms" min={40} max={400} step={10} value={config.humSpeed} onChange={(humSpeed) => set({ humSpeed })} />
      </Section>

      <Section label="Stamp">
        <Slider label="Delay" unit="ms" min={0} max={1500} step={25} value={config.stampDelay} onChange={(stampDelay) => set({ stampDelay })} />
        <Slider label="Start size" unit="×" min={1} max={4} step={0.05} value={config.stampFrom} onChange={(stampFrom) => set({ stampFrom })} />
        <Slider label="Start tilt" unit="°" min={-60} max={60} step={1} value={config.stampTiltFrom} onChange={(stampTiltFrom) => set({ stampTiltFrom })} />
        <Slider label="Tilt" unit="°" min={-30} max={30} step={1} value={config.stampTilt} onChange={(stampTilt) => set({ stampTilt })} />
        <Slider label="Stiffness" min={50} max={1500} step={10} value={config.stampStiffness} onChange={(stampStiffness) => set({ stampStiffness })} />
        <Slider label="Damping" min={1} max={80} step={0.5} value={config.stampDamping} onChange={(stampDamping) => set({ stampDamping })} />
        <Slider label="Mass" min={0.1} max={5} step={0.1} value={config.stampMass} onChange={(stampMass) => set({ stampMass })} />
        <Slider label="Knock" unit="px" min={0} max={12} step={0.5} value={config.knock} onChange={(knock) => set({ knock })} />
      </Section>
    </TuningPanel>
  );
}
