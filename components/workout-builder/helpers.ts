import type {
  BuilderDraft,
  BuilderSegment,
  RunSegment,
  IntervalSegment,
  RestSegment,
  NoteSegment,
  SavedTemplate,
} from "./types";
import type { Workout, WorkoutSegment } from "@/lib/types";
import { makeId } from "@/lib/utils";

const DRAFT_KEY = "nexa-builder-draft";
const TEMPLATES_KEY = "nexa-builder-templates";

// ─── Defaults ──────────────────────────────────────────────────────────

export function emptyDraft(): BuilderDraft {
  return {
    name: "",
    goal: "general",
    type: "easy",
    segments: [
      {
        id: makeId("seg"),
        kind: "run",
        category: "Warmup",
        label: "Easy warmup",
        distanceMiles: 0.5,
        pace: "9'00",
      } as RunSegment,
    ],
  };
}

export function newRunSegment(category = "Main"): RunSegment {
  return {
    id: makeId("seg"),
    kind: "run",
    category,
    label: category === "Cooldown" ? "Easy cooldown" : "Steady run",
    distanceMiles: 1,
    pace: "8'30",
  };
}

export function newIntervalSegment(): IntervalSegment {
  return {
    id: makeId("seg"),
    kind: "interval",
    category: "Intervals",
    label: "Intervals",
    reps: 4,
    repDistanceMeters: 400,
    restSec: 90,
    pace: "5'30",
  };
}

export function newRestSegment(): RestSegment {
  return {
    id: makeId("seg"),
    kind: "rest",
    category: "Custom",
    label: "Rest",
    durationMinutes: 2,
  };
}

export function newNoteSegment(): NoteSegment {
  return {
    id: makeId("seg"),
    kind: "note",
    category: "Custom",
    label: "Note",
    text: "",
  };
}

// ─── Duration estimate ─────────────────────────────────────────────────

/** Parse pace string "M'SS" into decimal min/mile (or min/segment unit). */
function parsePaceMinutes(pace?: string): number {
  if (!pace) return 9; // default easy pace if unspecified
  const m = pace.match(/^(\d+)['′:](\d{1,2})/);
  if (!m) return 9;
  return parseInt(m[1], 10) + parseInt(m[2], 10) / 60;
}

export function estimateMinutes(segments: BuilderSegment[]): number {
  let total = 0;
  for (const s of segments) {
    total += estimateSegmentMinutes(s);
  }
  return total;
}

export function estimateSegmentMinutes(s: BuilderSegment): number {
  switch (s.kind) {
    case "run": {
      if (s.durationMinutes) return s.durationMinutes;
      if (s.distanceMiles) {
        return s.distanceMiles * parsePaceMinutes(s.pace);
      }
      return 0;
    }
    case "interval": {
      const repDistanceMi = s.repDistanceMeters / 1609.344;
      const minutesPerRep = repDistanceMi * parsePaceMinutes(s.pace);
      const restMinutes = s.restSec / 60;
      return s.reps * (minutesPerRep + restMinutes);
    }
    case "rest":
      return s.durationMinutes;
    case "note":
      return 0;
  }
}

export function totalDistanceMiles(segments: BuilderSegment[]): number {
  let miles = 0;
  for (const s of segments) {
    if (s.kind === "run" && s.distanceMiles) miles += s.distanceMiles;
    if (s.kind === "interval") {
      miles += (s.reps * s.repDistanceMeters) / 1609.344;
    }
  }
  return Math.round(miles * 100) / 100;
}

export function totalWorkingSets(segments: BuilderSegment[]): number {
  return segments.reduce(
    (acc, s) => acc + (s.kind === "interval" ? s.reps : 0),
    0,
  );
}

// ─── Convert draft → Workout (the shape the rest of the app understands) ─

export function draftToWorkout(draft: BuilderDraft, date: string): Workout {
  const main =
    draft.segments.find(
      (s) =>
        s.category !== "Warmup" &&
        s.category !== "Cooldown" &&
        s.kind !== "rest" &&
        s.kind !== "note",
    ) ?? draft.segments.find((s) => s.kind !== "rest" && s.kind !== "note");

  const warmup = draft.segments.find((s) => s.category === "Warmup");
  const cooldown = draft.segments.find((s) => s.category === "Cooldown");

  return {
    id: makeId("custom"),
    date,
    title: draft.name.trim() || "Custom Workout",
    type: draft.type,
    status: "scheduled",
    customWorkout: true,
    warmup: warmup ? toWorkoutSegment(warmup) : undefined,
    main: main ? toWorkoutSegment(main) : { label: "Custom" },
    cooldown: cooldown ? toWorkoutSegment(cooldown) : undefined,
    totalDistance: totalDistanceMiles(draft.segments),
    totalDuration: Math.round(estimateMinutes(draft.segments) * 60),
    motivation: draft.goal !== "general" ? `Goal: ${draft.goal}` : undefined,
  };
}

function toWorkoutSegment(s: BuilderSegment): WorkoutSegment {
  switch (s.kind) {
    case "run":
      return {
        label: s.label,
        distanceMiles: s.distanceMiles,
        durationMinutes: s.durationMinutes,
        pace: s.pace,
        targetHr:
          s.targetHrLow != null && s.targetHrHigh != null
            ? [s.targetHrLow, s.targetHrHigh]
            : undefined,
        notes: s.notes,
      };
    case "interval":
      return {
        label: s.label,
        reps: s.reps,
        repDistanceMeters: s.repDistanceMeters,
        restSec: s.restSec,
        pace: s.pace,
        notes: s.notes,
      };
    case "rest":
      return { label: s.label, durationMinutes: s.durationMinutes };
    case "note":
      return { label: s.label, notes: s.text };
  }
}

// ─── Persistence (autosave + templates) ────────────────────────────────

export function loadDraft(): BuilderDraft | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as BuilderDraft;
  } catch {
    return null;
  }
}

export function saveDraft(draft: BuilderDraft) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
  } catch {
    // quota exceeded or private mode — drop silently
  }
}

export function clearDraft() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(DRAFT_KEY);
}

export function loadTemplates(): SavedTemplate[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(TEMPLATES_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as SavedTemplate[];
  } catch {
    return [];
  }
}

export function saveTemplate(draft: BuilderDraft): SavedTemplate {
  const existing = loadTemplates();
  const t: SavedTemplate = {
    id: makeId("tpl"),
    name: draft.name.trim() || "Untitled workout",
    goal: draft.goal,
    type: draft.type,
    segments: draft.segments,
    savedAt: Date.now(),
  };
  const next = [t, ...existing].slice(0, 20);
  localStorage.setItem(TEMPLATES_KEY, JSON.stringify(next));
  return t;
}

export function deleteTemplate(id: string): SavedTemplate[] {
  const remaining = loadTemplates().filter((t) => t.id !== id);
  localStorage.setItem(TEMPLATES_KEY, JSON.stringify(remaining));
  return remaining;
}

export function draftFromTemplate(t: SavedTemplate): BuilderDraft {
  // Clone so editing the new draft doesn't mutate the template.
  return {
    name: t.name,
    goal: t.goal,
    type: t.type,
    segments: t.segments.map((s) => ({ ...s, id: makeId("seg") })),
  };
}

// ─── Reorder helper ────────────────────────────────────────────────────

export function moveSegment<T>(arr: T[], from: number, to: number): T[] {
  const next = arr.slice();
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
}
