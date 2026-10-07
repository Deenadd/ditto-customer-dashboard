/**
 * Haptic feedback for touch screens, kept to moments that earn it (Apple's
 * rule: causality, harmony, utility): a tab changing, a card turning over,
 * the printer's pulls and the stamp landing, a code right or wrong.
 *
 * Android Chrome has the Vibration API. iOS Safari has none, but since iOS 18
 * toggling a `<input type="checkbox" switch>` gives the system's light tap,
 * so on iOS a hidden switch is toggled instead; a pattern is a few of those
 * in a row. Anywhere else, and on a mouse, it does nothing.
 */
export type Haptic = "selection" | "light" | "medium" | "success" | "error";

const vibration: Record<Haptic, number | number[]> = {
  selection: 6,
  light: 10,
  medium: 18,
  success: [12, 60, 18],
  error: [18, 50, 18, 50, 18],
};

/* How many system taps, and how far apart (ms), stand in for each on iOS. */
const taps: Record<Haptic, number[]> = {
  selection: [0],
  light: [0],
  medium: [0, 40],
  success: [0, 90],
  error: [0, 70, 140],
};

let toggle: HTMLLabelElement | null = null;

function iosSwitch() {
  if (toggle) return toggle;
  const label = document.createElement("label");
  label.setAttribute("aria-hidden", "true");
  label.style.cssText = "position:fixed;width:1px;height:1px;overflow:hidden;opacity:0;pointer-events:none;left:-9999px";
  const input = document.createElement("input");
  input.type = "checkbox";
  input.setAttribute("switch", "");
  input.tabIndex = -1;
  label.appendChild(input);
  document.body.appendChild(label);
  toggle = label;
  return label;
}

export function haptic(kind: Haptic = "light") {
  if (typeof window === "undefined") return;
  if (!window.matchMedia("(pointer: coarse)").matches) return;
  if (typeof navigator.vibrate === "function") {
    navigator.vibrate(vibration[kind]);
    return;
  }
  const label = iosSwitch();
  for (const at of taps[kind]) window.setTimeout(() => label.click(), at);
}
