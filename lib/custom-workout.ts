import type { Workout } from "./types";
import { dateKey, makeId } from "./utils";

/**
 * Build a Workout object from free-form custom text.
 *
 * The first non-empty line becomes the title (≤ 60 chars). The full text is
 * stored on the segment's `notes` field so the user can read their plan in
 * the day-detail view.
 */
export function buildCustomWorkout(text: string, date: string): Workout {
  const trimmed = text.trim();
  const firstLine = trimmed.split(/\r?\n/).find((l) => l.trim().length > 0);
  const title = firstLine
    ? firstLine.replace(/^[#\-*\s]+/, "").slice(0, 60).trim() || "Custom Workout"
    : "Custom Workout";

  return {
    id: makeId("custom"),
    date,
    title,
    type: "easy",
    status: "scheduled",
    customWorkout: true,
    main: {
      label: "Custom Workout",
      notes: trimmed,
    },
  };
}

/**
 * Find the next date that's safe to schedule a custom workout on.
 *
 * Strategy:
 * 1. Walk forward day-by-day starting tomorrow.
 * 2. If the day has no workout scheduled, use it.
 * 3. If the day has a rest workout, replace it.
 * 4. If we hit 30 days without finding an opening, append at end+1.
 */
export function findNextAvailableDate(
  workouts: Workout[],
  startFrom: Date = new Date(),
): { date: string; replacesId?: string } {
  const byDate = new Map<string, Workout>();
  for (const w of workouts) byDate.set(w.date, w);

  const cursor = new Date(startFrom);
  cursor.setHours(0, 0, 0, 0);
  cursor.setDate(cursor.getDate() + 1); // start tomorrow

  for (let i = 0; i < 30; i++) {
    const key = dateKey(cursor);
    const existing = byDate.get(key);
    if (!existing) {
      return { date: key };
    }
    if (existing.type === "rest" && existing.status !== "completed") {
      return { date: key, replacesId: existing.id };
    }
    cursor.setDate(cursor.getDate() + 1);
  }

  // Fallback — push out beyond the last scheduled date.
  cursor.setTime(startFrom.getTime());
  cursor.setDate(cursor.getDate() + 30);
  return { date: dateKey(cursor) };
}
