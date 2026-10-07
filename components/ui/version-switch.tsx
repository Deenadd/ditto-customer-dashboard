"use client";

import { useId } from "react";

/**
 * A small labelled switch between two or more versions of a screen, for
 * comparing them: toggle buttons in a segmented track, centred under the
 * content. The caller remembers the choice.
 */
export function VersionSwitch<T extends string>({
  label,
  value,
  options,
  onChange,
  className = "mt-14",
}: {
  label: string;
  value: T;
  options: { value: T; label: string }[];
  onChange: (value: T) => void;
  className?: string;
}) {
  const id = useId();
  return (
    <div className={`flex flex-col items-center gap-2 text-center ${className}`}>
      <p id={id} className="text-[12px] leading-4 font-medium text-label-secondary">
        {label}
      </p>
      <div role="group" aria-labelledby={id} className="inline-flex h-9 rounded-control bg-fill-strong p-[3px]">
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            aria-pressed={value === option.value}
            onClick={() => onChange(option.value)}
            className={`touch-hit flex items-center rounded-control-inner px-3.5 text-[13px] font-medium whitespace-nowrap transition-[color,background-color,box-shadow] duration-150 ease-out ${
              value === option.value ? "bg-surface text-label shadow-thumb" : "text-label-secondary [@media(hover:hover)]:hover:text-label"
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}
