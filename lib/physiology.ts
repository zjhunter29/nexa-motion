import type { UserProfile, KnownPaces, FitnessLevel } from "./types";

/**
 * Physiology-aware pace + distance adjustments.
 *
 * The plan generator's level-based pace table assumes a "reference" 30-year-old
 * at a BMI of ~22. These helpers age- and BMI-correct that baseline so older
 * and/or heavier runners get realistic starting paces and weekly volume, and
 * lighter/younger runners get a faster baseline. User-supplied paces, when
 * present, override the computed value entirely.
 *
 * The science is approximate but reasonable: real coaches use similar rules
 * of thumb (Daniels' VDOT tables, McMillan calculator) — the point isn't
 * pinpoint accuracy, it's getting the *direction* right so a 60-year-old at
 * 220 lb isn't prescribed an 8'00 pace.
 */

type PaceKind = "easy" | "long" | "tempo" | "threshold" | "interval";

// ─── Base level table (the same one plan-generator was using) ─────────────

const BASE_PACES: Record<FitnessLevel, Record<PaceKind, string>> = {
  beginner: { easy: "11'00", long: "11'30", tempo: "9'30", threshold: "9'00", interval: "8'30" },
  intermediate: { easy: "9'00", long: "9'30", tempo: "7'45", threshold: "7'15", interval: "6'45" },
  advanced: { easy: "8'00", long: "8'20", tempo: "6'45", threshold: "6'15", interval: "5'45" },
  elite: { easy: "7'00", long: "7'15", tempo: "5'45", threshold: "5'15", interval: "4'50" },
};

// ─── Public API ──────────────────────────────────────────────────────────

/**
 * Resolve the actual pace for a given workout kind, taking into account
 * fitness level, age, BMI, and any user-provided override.
 *
 * Returns a string like "8'30" (min'sec per mile).
 */
export function resolvePace(profile: UserProfile, kind: PaceKind): string {
  // 1. User-supplied wins over everything.
  const known = profile.knownPaces?.[kind];
  if (known && isValidPaceString(known)) return normalize(known);

  // 2. Otherwise, start from the level table and apply physiology slowdown.
  const basePace = BASE_PACES[profile.fitnessLevel][kind];
  const seconds = paceStringToSeconds(basePace);
  const adjusted = seconds + paceAdjustmentSecondsPerMile(profile);
  return secondsToPaceString(adjusted);
}

/**
 * Returns a multiplier (e.g. 0.85) to apply to baseline distances. Older
 * and/or heavier athletes get less per session to keep injury risk in check.
 */
export function distanceMultiplier(profile: UserProfile): number {
  let m = 1;

  const age = profile.age ?? 30;
  if (age >= 65) m *= 0.65;
  else if (age >= 55) m *= 0.75;
  else if (age >= 45) m *= 0.88;
  else if (age >= 35) m *= 0.96;
  // under 35: no reduction

  const bmi = bmiOf(profile);
  if (bmi != null) {
    if (bmi >= 35) m *= 0.6;
    else if (bmi >= 30) m *= 0.75;
    else if (bmi >= 27) m *= 0.88;
    else if (bmi >= 25) m *= 0.95;
    // <25: no reduction
  }

  return Math.max(0.4, m);
}

/** Slowdown in seconds per mile applied to the base pace table. */
export function paceAdjustmentSecondsPerMile(profile: UserProfile): number {
  let extra = 0;

  // Age: ~3-5 s/mile per decade after 30, accelerating after 50.
  const age = profile.age ?? 30;
  if (age >= 70) extra += 50;
  else if (age >= 60) extra += 35;
  else if (age >= 50) extra += 22;
  else if (age >= 40) extra += 10;
  else if (age >= 30) extra += 3;

  // BMI: heavier athletes need slower paces to protect joints + cardio system.
  const bmi = bmiOf(profile);
  if (bmi != null) {
    if (bmi >= 35) extra += 60;
    else if (bmi >= 30) extra += 30 + (bmi - 30) * 6;
    else if (bmi >= 27) extra += 12 + (bmi - 27) * 6;
    else if (bmi >= 25) extra += (bmi - 25) * 6;
    // <25 ≈ healthy runner BMI; no penalty
  }

  return extra;
}

/** Convenience — returns the same recovery pace logic as before. */
export function recoveryPaceString(profile: UserProfile): string {
  const easy = resolvePace(profile, "easy");
  // Add 30 s for active recovery.
  const seconds = paceStringToSeconds(easy) + 30;
  return secondsToPaceString(seconds);
}

// ─── Validation + parsing helpers (exposed so the UI can reuse them) ─────

/** Accept "8'00", "8:00", "8'30\"", "8.5" (decimal min/mile). Returns null for garbage. */
export function parsePaceInput(raw: string): string | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;

  // M'SS, M:SS, M’SS
  const m = trimmed.match(/^(\d{1,2})\s*[':’′]\s*(\d{1,2})(?:\s*["”″])?$/);
  if (m) {
    const mm = parseInt(m[1], 10);
    const ss = parseInt(m[2], 10);
    if (mm > 0 && mm < 20 && ss >= 0 && ss < 60) {
      return `${mm}'${ss.toString().padStart(2, "0")}`;
    }
  }

  // Decimal min/mile e.g. "7.5"
  const dec = parseFloat(trimmed);
  if (Number.isFinite(dec) && dec > 2 && dec < 20) {
    const mm = Math.floor(dec);
    const ss = Math.round((dec - mm) * 60);
    return `${mm}'${ss.toString().padStart(2, "0")}`;
  }
  return null;
}

export function isValidPaceString(s: string): boolean {
  return parsePaceInput(s) !== null;
}

function normalize(s: string): string {
  return parsePaceInput(s) ?? s;
}

// ─── Internals ───────────────────────────────────────────────────────────

function bmiOf(p: UserProfile): number | null {
  if (!p.weightLb || !p.heightIn) return null;
  return (p.weightLb / (p.heightIn * p.heightIn)) * 703;
}

function paceStringToSeconds(pace: string): number {
  const m = pace.match(/^(\d+)['′:](\d{1,2})/);
  if (!m) return 0;
  return parseInt(m[1], 10) * 60 + parseInt(m[2], 10);
}

function secondsToPaceString(total: number): string {
  const clamped = Math.max(180, Math.min(1200, Math.round(total))); // 3'00 — 20'00
  const m = Math.floor(clamped / 60);
  const s = clamped % 60;
  return `${m}'${s.toString().padStart(2, "0")}`;
}

// ─── Pace categories for UI ──────────────────────────────────────────────

export interface PaceFieldMeta {
  key: keyof KnownPaces;
  label: string;
  description: string;
  placeholder: string;
}

export const PACE_FIELDS: PaceFieldMeta[] = [
  {
    key: "easy",
    label: "Easy / base pace",
    description: "Conversational — you can hold a sentence the whole way.",
    placeholder: "10'00",
  },
  {
    key: "long",
    label: "Long-run pace",
    description: "Slightly faster than easy. Sustained for 60+ minutes.",
    placeholder: "10'30",
  },
  {
    key: "tempo",
    label: "Tempo pace",
    description: "Comfortably hard — what you could hold for ~45 min.",
    placeholder: "8'15",
  },
  {
    key: "threshold",
    label: "Lactate threshold",
    description: "All-out for 60 minutes. Borderline between sustainable and not.",
    placeholder: "7'30",
  },
  {
    key: "interval",
    label: "Interval / VO₂ max",
    description: "5K race pace or just below. Hard, repeated efforts.",
    placeholder: "6'45",
  },
];
