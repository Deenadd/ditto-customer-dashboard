/**
 * Haptic feedback for touch screens.
 *
 * Android Chrome has the Vibration API. iOS Safari has none, but since iOS 18
 * toggling an `<input type="checkbox" switch>` plays the system's light tap,
 * so on iOS a hidden switch is toggled instead (the approach of the
 * ios-haptics package). Safari only plays it while it's handling your tap,
 * so the first tap must happen synchronously, inside the event handler: a
 * timer, or the end of an awaited promise, is too late and stays silent.
 * A pattern's later taps follow on short timers, best effort.
 *
 * On a mouse, or anywhere without either route, it does nothing.
 */
export type Haptic = "selection" | "light" | "medium" | "success" | "error";

const vibration: Record<Haptic, number | number[]> = {
  selection: 8,
  light: 12,
  medium: 20,
  success: [14, 60, 20],
  error: [20, 50, 20, 50, 20],
};

/* Gaps (ms) after the first tap, for the iOS stand-in of each pattern. */
const followUps: Record<Haptic, number[]> = {
  selection: [],
  light: [],
  medium: [],
  success: [110],
  error: [90, 180],
};

/* When a haptic last played, so the site-wide tap tick (TapHaptics) can
   stand back when a control has just played its own. */
export let lastHapticAt = 0;

function iosTap() {
  const label = document.createElement("label");
  label.ariaHidden = "true";
  label.style.display = "none";
  const input = document.createElement("input");
  input.type = "checkbox";
  input.setAttribute("switch", "");
  label.appendChild(input);
  document.head.appendChild(label);
  label.click();
  label.remove();
}

const touch = () => typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches;

export function haptic(kind: Haptic = "light") {
  if (!touch()) return;
  lastHapticAt = performance.now();
  if (typeof navigator.vibrate === "function") {
    navigator.vibrate(vibration[kind]);
    return;
  }
  iosTap();
  for (const gap of followUps[kind]) window.setTimeout(iosTap, gap);
}
