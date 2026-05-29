import type { Workout, WorkoutType } from "./types";

/**
 * Training analysis helpers. Pure functions — no React, no I/O — that the
 * Flow View, recovery badges, and insight cards all share.
 */

// ─── Intensity model ────────────────────────────────────────────────────

/**
 * Intensity score on a 0–7 scale. Drives the recovery + balance heuristics
 * below. Tuned against standard running-coach guidance (80/20 rule, hard/
 * easy alternation).
 */
const INTENSITY: Record<WorkoutType, number> = {
  rest: 0,
  recovery: 1,
  easy: 2,
  long: 4,
  tempo: 5,
  threshold: 6,
  interval: 6,
  race: 7,
};

export function intensityOf(w: Workout): number {
  return INTENSITY[w.type] ?? 0;
}

/** "Hard" = anything threshold or above. */
export function isHard(w: Workout): boolean {
  return intensityOf(w) >= 5;
}

/** Family — grouping for the muscle/system-distribution chart. */
export type WorkoutFamily =
  | "aerobic"
  | "threshold"
  | "speed"
  | "long"
  | "recovery"
  | "rest";

export function familyOf(w: Workout): WorkoutFamily {
  switch (w.type) {
    case "easy":
      return "aerobic";
    case "long":
      return "long";
    case "tempo":
    case "threshold":
      return "threshold";
    case "interval":
    case "race":
      return "speed";
    case "recovery":
      return "recovery";
    case "rest":
      return "rest";
  }
}

export const FAMILY_META: Record<
  WorkoutFamily,
  { label: string; color: string; description: string }
> = {
  aerobic: {
    label: "Aerobic",
    color: "#60A5FA",
    description: "Easy base runs — builds the engine",
  },
  long: {
    label: "Long",
    color: "#A855F7",
    description: "Sustained distance — endurance and durability",
  },
  threshold: {
    label: "Threshold",
    color: "#EC4899",
    description: "Tempo work — lifts your sustainable ceiling",
  },
  speed: {
    label: "Speed",
    color: "#F59E0B",
    description: "Intervals and races — neuromuscular sharpness",
  },
  recovery: {
    label: "Recovery",
    color: "#10B981",
    description: "Active flush — keeps blood moving",
  },
  rest: {
    label: "Rest",
    color: "#71717A",
    description: "Full off — the adaptation actually happens here",
  },
};

// ─── Recovery between adjacent workouts ─────────────────────────────────

export type RecoveryStatus = "great" | "good" | "tight" | "conflict";

export interface RecoveryAssessment {
  status: RecoveryStatus;
  note: string;
}

/** How well does going from `prev` straight into `next` work? */
export function assessRecovery(
  prev: Workout | undefined,
  next: Workout,
): RecoveryAssessment | null {
  if (!prev) return null;
  if (next.type === "rest") {
    return { status: "great", note: "Full recovery scheduled" };
  }
  if (prev.type === "rest" || prev.type === "recovery") {
    return {
      status: "great",
      note: "Fresh legs after rest — go hit it",
    };
  }
  const a = intensityOf(prev);
  const b = intensityOf(next);

  // Hard → hard without a buffer day is the classic mistake.
  if (a >= 5 && b >= 5) {
    return {
      status: "conflict",
      note: "Back-to-back hard sessions — high injury risk",
    };
  }
  // Long run followed by another quality day is also tight.
  if (prev.type === "long" && b >= 5) {
    return {
      status: "tight",
      note: "Long run yesterday — keep this one controlled",
    };
  }
  if (a >= 5 && b <= 2) {
    return {
      status: "great",
      note: "Easy day after a hard session — textbook recovery",
    };
  }
  if (a <= 2 && b <= 2) {
    return { status: "good", note: "Two aerobic days stacked" };
  }
  return { status: "good", note: "Balanced spacing" };
}

// ─── Weekly distribution ────────────────────────────────────────────────

export interface FamilyDistribution {
  family: WorkoutFamily;
  count: number;
  miles: number;
}

export function distributionFor(workouts: Workout[]): FamilyDistribution[] {
  const map = new Map<WorkoutFamily, FamilyDistribution>();
  for (const f of [
    "aerobic",
    "long",
    "threshold",
    "speed",
    "recovery",
    "rest",
  ] as WorkoutFamily[]) {
    map.set(f, { family: f, count: 0, miles: 0 });
  }
  for (const w of workouts) {
    const fam = familyOf(w);
    const entry = map.get(fam)!;
    entry.count += 1;
    entry.miles += w.totalDistance ?? 0;
  }
  return Array.from(map.values());
}

// ─── Insights ───────────────────────────────────────────────────────────

export type InsightTone = "positive" | "neutral" | "warning";

export interface Insight {
  id: string;
  tone: InsightTone;
  title: string;
  detail: string;
}

/**
 * Generate 0–4 short insights from a week of workouts. Designed to be
 * non-judgmental for empty/sparse data and informative for full plans.
 */
export function generateInsights(workouts: Workout[]): Insight[] {
  if (workouts.length === 0) return [];
  const insights: Insight[] = [];

  const dist = distributionFor(workouts);
  const total = workouts.length;
  const restCount = dist.find((d) => d.family === "rest")?.count ?? 0;
  const easyCount = dist.find((d) => d.family === "aerobic")?.count ?? 0;
  const hardCount =
    (dist.find((d) => d.family === "threshold")?.count ?? 0) +
    (dist.find((d) => d.family === "speed")?.count ?? 0);
  const longCount = dist.find((d) => d.family === "long")?.count ?? 0;

  const trainingDays = total - restCount;
  const totalMiles = dist.reduce((a, d) => a + d.miles, 0);

  // 80/20 ratio (easy:hard among training days)
  if (trainingDays >= 4 && hardCount > 0) {
    const easyish = easyCount + longCount + (dist.find((d) => d.family === "recovery")?.count ?? 0);
    const easyPct = (easyish / Math.max(1, trainingDays)) * 100;
    if (easyPct >= 75) {
      insights.push({
        id: "ratio-80-20",
        tone: "positive",
        title: "Balanced intensity mix",
        detail: `${Math.round(easyPct)}% of your sessions sit at aerobic or recovery intensity — right in the 80/20 sweet spot.`,
      });
    } else if (hardCount >= 3) {
      insights.push({
        id: "ratio-too-hard",
        tone: "warning",
        title: "Too much intensity",
        detail: `${hardCount} hard sessions this week. Two quality days plus easy/long is usually enough — consider swapping one for an aerobic run.`,
      });
    }
  }

  // Long run presence
  if (trainingDays >= 4 && longCount === 0) {
    insights.push({
      id: "no-long",
      tone: "warning",
      title: "No long run this week",
      detail:
        "A weekly long run is the single biggest driver of endurance. Aim for 20–30% of weekly volume in one session.",
    });
  } else if (longCount > 0 && totalMiles > 0) {
    const longMiles =
      workouts.find((w) => familyOf(w) === "long")?.totalDistance ?? 0;
    const pct = (longMiles / totalMiles) * 100;
    if (pct > 40) {
      insights.push({
        id: "long-too-big",
        tone: "warning",
        title: "Long run is dominating volume",
        detail: `Your long run is ${Math.round(pct)}% of weekly mileage. Above 35–40% raises injury risk — consider adding an easy day instead.`,
      });
    }
  }

  // Recovery spacing
  let conflicts = 0;
  for (let i = 1; i < workouts.length; i++) {
    const r = assessRecovery(workouts[i - 1], workouts[i]);
    if (r?.status === "conflict") conflicts++;
  }
  if (conflicts > 0) {
    insights.push({
      id: "recovery-conflict",
      tone: "warning",
      title: `${conflicts} recovery conflict${conflicts === 1 ? "" : "s"} detected`,
      detail:
        "Back-to-back hard sessions limit adaptation. Move an easy run between them or replace one with recovery.",
    });
  }

  // Rest cadence
  if (trainingDays >= 5 && restCount === 0) {
    insights.push({
      id: "no-rest",
      tone: "warning",
      title: "No rest day scheduled",
      detail: "At least one full rest day per week keeps adaptation moving and injuries away.",
    });
  } else if (restCount >= 1 && hardCount >= 1 && conflicts === 0 && trainingDays >= 4) {
    insights.push({
      id: "recovery-good",
      tone: "positive",
      title: "Recovery is well spaced",
      detail: "Hard days have easy or rest days around them. Your body has time to absorb the work.",
    });
  }

  return insights.slice(0, 4);
}

// ─── Week selection ─────────────────────────────────────────────────────

/** Returns the 7 days starting on the Sunday of the week that contains `from`. */
export function getWeek(workouts: Workout[], from: Date): Workout[] {
  const start = new Date(from);
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - start.getDay()); // back to Sunday
  const days: string[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(start);
    d.setDate(d.getDate() + i);
    days.push(
      `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, "0")}-${d.getDate().toString().padStart(2, "0")}`,
    );
  }
  return days
    .map((k) => workouts.find((w) => w.date === k))
    .filter((w): w is Workout => !!w);
}

/** A week, padded with placeholder rest entries on missing days. */
export function getWeekPadded(
  workouts: Workout[],
  from: Date,
): { date: string; workout?: Workout }[] {
  const start = new Date(from);
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - start.getDay());
  const out: { date: string; workout?: Workout }[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(start);
    d.setDate(d.getDate() + i);
    const k = `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, "0")}-${d.getDate().toString().padStart(2, "0")}`;
    out.push({ date: k, workout: workouts.find((w) => w.date === k) });
  }
  return out;
}
