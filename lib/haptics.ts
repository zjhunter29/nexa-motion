/**
 * Tiny haptic helper around navigator.vibrate.
 *
 * Honors the `haptics-enabled` localStorage flag set by Settings. Defaults
 * to ON. Silently no-ops on devices that don't support vibration
 * (most notably iOS Safari — Apple does not expose vibrate to the web).
 */

const STORAGE_KEY = "nexa-motion-haptics-enabled";

export function isHapticsEnabled(): boolean {
  if (typeof window === "undefined") return false;
  const raw = localStorage.getItem(STORAGE_KEY);
  if (raw == null) return true; // default on
  return raw === "true";
}

export function setHapticsEnabled(enabled: boolean) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, String(enabled));
}

export function vibrate(pattern: number | readonly number[]) {
  if (typeof window === "undefined") return;
  if (!isHapticsEnabled()) return;
  if (typeof navigator?.vibrate !== "function") return;
  try {
    // navigator.vibrate's TS sig requires a mutable array; spread to satisfy.
    navigator.vibrate(typeof pattern === "number" ? pattern : [...pattern]);
  } catch {
    // ignore — some browsers throw if called from a non-user-gesture context
  }
}

/** Common patterns */
export const HAPTIC = {
  tap: 10,
  select: 15,
  success: [20, 30, 20],
  error: [40, 30, 40, 30, 40],
  toggle: 12,
} as const;
