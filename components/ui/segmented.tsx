"use client";

import { useRouter } from "next/navigation";
import { useState, type ReactNode } from "react";
import SegmentedControl from "@/registry/components/segmented-control/segmented-control";

export type RouteSegment = {
  value: string;
  label: string;
  href: string;
  accessory?: ReactNode;
};

/**
 * Arc's segmented control, wrapped so each view keeps its own URL. The
 * highlight moves the moment you choose, before the next page arrives, and
 * then the URL takes over again.
 */
export function RouteSegmentedControl({
  label,
  value,
  segments,
}: {
  label: string;
  value: string;
  segments: RouteSegment[];
}) {
  const router = useRouter();
  const [chosen, setChosen] = useState<string | null>(null);
  const [lastValue, setLastValue] = useState(value);
  if (value !== lastValue) {
    setLastValue(value);
    setChosen(null);
  }

  return (
    <SegmentedControl
      label={label}
      value={chosen ?? value}
      options={segments.map(({ value, label, accessory }) => ({ value, label, accessory }))}
      onOptionIntent={(next) => {
        const href = segments.find((segment) => segment.value === next)?.href;
        if (href) router.prefetch(href);
      }}
      onValueChange={(next) => {
        const href = segments.find((segment) => segment.value === next)?.href;
        if (!href || next === (chosen ?? value)) return;
        setChosen(next);
        router.push(href, { scroll: false });
      }}
    />
  );
}
