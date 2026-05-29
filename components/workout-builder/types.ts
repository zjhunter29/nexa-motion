import type { WorkoutType } from "@/lib/types";

/** What the builder is producing. */
export interface BuilderDraft {
  name: string;
  goal: string;
  type: WorkoutType;
  /** Ordered segments — drag to reorder. */
  segments: BuilderSegment[];
}

export type BuilderSegment =
  | RunSegment
  | IntervalSegment
  | RestSegment
  | NoteSegment;

interface BaseSegment {
  id: string;
  /** "Warmup" | "Cooldown" | "Main" | "Recovery" | "Tempo" | custom. */
  category: string;
  collapsed?: boolean;
}

/** Continuous run — distance OR duration + target pace/HR. */
export interface RunSegment extends BaseSegment {
  kind: "run";
  label: string;
  distanceMiles?: number;
  durationMinutes?: number;
  pace?: string;
  targetHrLow?: number;
  targetHrHigh?: number;
  notes?: string;
}

/** Intervals — reps × distance with rest. */
export interface IntervalSegment extends BaseSegment {
  kind: "interval";
  label: string;
  reps: number;
  repDistanceMeters: number;
  pace?: string;
  restSec: number;
  notes?: string;
}

/** Rest between segments. */
export interface RestSegment extends BaseSegment {
  kind: "rest";
  label: string;
  durationMinutes: number;
}

/** Free-text annotation (warmup drills, mobility, etc.). */
export interface NoteSegment extends BaseSegment {
  kind: "note";
  label: string;
  text: string;
}

export const SEGMENT_CATEGORIES = [
  "Warmup",
  "Main",
  "Tempo",
  "Intervals",
  "Recovery",
  "Cooldown",
  "Custom",
] as const;
export type SegmentCategory = (typeof SEGMENT_CATEGORIES)[number];

export interface SavedTemplate {
  id: string;
  name: string;
  goal: string;
  type: WorkoutType;
  segments: BuilderSegment[];
  savedAt: number;
}
