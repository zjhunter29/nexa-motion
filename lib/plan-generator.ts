import type {
  ActivityLevel,
  Experience,
  FitnessLevel,
  RunningGoal,
  UserProfile,
  Workout,
  WorkoutSegment,
  WorkoutType,
} from "./types";
import { dateKey } from "./utils";

/**
 * Generate the next two weeks of personalized workouts based on the user's
 * profile. The plan is deliberately conservative for beginners and ramps
 * with experience. It is not yet adaptive to *completed* workouts — that
 * is a future enhancement.
 */
export function generatePlan(profile: UserProfile): Workout[] {
  const weeks = 2;
  const workouts: Workout[] = [];

  const trainingDays = profile.trainingDays.length
    ? profile.trainingDays
    : [1, 3, 5];

  const baseMiles = startingLongRunMiles(profile);
  const easyMiles = startingEasyMiles(profile);
  const easyPace = paceForLevel(profile.fitnessLevel, "easy");
  const longPace = paceForLevel(profile.fitnessLevel, "long");
  const tempoPace = paceForLevel(profile.fitnessLevel, "tempo");
  const intervalPace = paceForLevel(profile.fitnessLevel, "interval");

  const cap = avoidInjuryCap(profile);

  for (let w = 0; w < weeks; w++) {
    // Distribute workout types across the week.
    const weekly = composeWeek({
      goal: profile.goal,
      experience: profile.experience,
      fitnessLevel: profile.fitnessLevel,
      trainingDays,
      weekIndex: w,
    });

    let dayIndex = 0;
    for (let d = 0; d < 7; d++) {
      const date = new Date();
      date.setDate(date.getDate() + w * 7 + d);
      const dow = date.getDay();
      const id = `gen-${date.getTime()}-${Math.random().toString(36).slice(2, 6)}`;
      const dateStr = dateKey(date);

      const isTrainingDay = trainingDays.includes(dow);
      if (!isTrainingDay) {
        workouts.push(restWorkout(id, dateStr));
        continue;
      }

      const slot = weekly[dayIndex % weekly.length];
      dayIndex++;

      switch (slot) {
        case "easy": {
          const miles = limit(progress(easyMiles, w, 0.05), cap.easy);
          workouts.push({
            id,
            date: dateStr,
            title: "Easy Run",
            type: "easy",
            status: "scheduled",
            motivation: easyMotivation(),
            warmup: warmup(0.25, easyPace),
            main: {
              label: "Base Run",
              distanceMiles: miles,
              pace: easyPace,
              targetHr: [140, 160],
              trainingFocus: "Aerobic base",
            },
            cooldown: cooldown(),
            totalDistance: miles + 0.5,
            totalDuration: Math.round((miles + 0.5) * estimateMinPerMile(easyPace) * 60),
          });
          break;
        }
        case "long": {
          const miles = limit(progress(baseMiles, w, 0.1), cap.long);
          workouts.push({
            id,
            date: dateStr,
            title: "Long Run",
            type: "long",
            status: "scheduled",
            motivation: longMotivation(),
            warmup: warmup(0.5, longPace),
            main: {
              label: "Long Run",
              distanceMiles: miles,
              pace: longPace,
              targetHr: [148, 165],
              trainingFocus: "Endurance",
            },
            cooldown: cooldown(),
            totalDistance: miles + 0.5,
            totalDuration: Math.round((miles + 0.5) * estimateMinPerMile(longPace) * 60),
          });
          break;
        }
        case "tempo": {
          const miles = limit(progress(2, w, 0.15), cap.tempo);
          workouts.push({
            id,
            date: dateStr,
            title: "Tempo Run",
            type: "tempo",
            status: "scheduled",
            motivation: tempoMotivation(),
            warmup: warmup(1, easyPace),
            main: {
              label: "Tempo",
              distanceMiles: miles,
              pace: tempoPace,
              targetHr: [168, 178],
              trainingFocus: "Tempo",
            },
            cooldown: cooldown(),
            totalDistance: miles + 1.5,
            totalDuration: Math.round((miles + 1.5) * estimateMinPerMile(tempoPace) * 60),
          });
          break;
        }
        case "interval": {
          const reps = limit(progress(6, w, 0.2), cap.intervalReps);
          workouts.push({
            id,
            date: dateStr,
            title: "Threshold Intervals",
            type: "threshold",
            status: "scheduled",
            motivation: intervalMotivation(),
            warmup: warmup(1, easyPace),
            main: {
              label: "Main Workout",
              reps,
              repDistanceMeters: 400,
              restSec: 90,
              pace: intervalPace,
              targetHr: [180, 190],
              trainingFocus: "Threshold",
              location: "Track or flat path",
            },
            cooldown: cooldown(),
            totalDistance: 1 + (reps * 400) / 1609 + 0.5,
            totalDuration: 45 * 60,
          });
          break;
        }
        case "recovery": {
          workouts.push({
            id,
            date: dateStr,
            title: "Recovery Run",
            type: "recovery",
            status: "scheduled",
            motivation: recoveryMotivation(),
            main: {
              label: "Recovery",
              distanceMiles: limit(1.5, cap.easy),
              pace: recoveryPace(profile.fitnessLevel),
              targetHr: [130, 145],
              trainingFocus: "Active recovery",
            },
            totalDistance: 1.5,
            totalDuration: 18 * 60,
          });
          break;
        }
        case "rest":
        default:
          workouts.push(restWorkout(id, dateStr));
      }
    }
  }

  return workouts;
}

// ─── composition logic ────────────────────────────────────────────────────

type Slot = "easy" | "long" | "tempo" | "interval" | "recovery" | "rest";

function composeWeek(args: {
  goal: RunningGoal;
  experience: Experience;
  fitnessLevel: FitnessLevel;
  trainingDays: number[];
  weekIndex: number;
}): Slot[] {
  const { goal, experience, fitnessLevel, trainingDays } = args;
  const count = trainingDays.length;

  // Beginners: mostly easy + one long, no intervals.
  if (fitnessLevel === "beginner" || experience === "0-1") {
    if (count <= 3) return ["easy", "easy", "long"].slice(0, count) as Slot[];
    if (count === 4) return ["easy", "easy", "easy", "long"];
    return ["easy", "easy", "recovery", "easy", "long"].slice(0, count) as Slot[];
  }

  // Intermediate: introduce tempo.
  if (fitnessLevel === "intermediate") {
    if (count <= 3) return ["easy", "tempo", "long"].slice(0, count) as Slot[];
    if (count === 4) return ["easy", "tempo", "easy", "long"];
    return ["easy", "tempo", "easy", "recovery", "long"].slice(0, count) as Slot[];
  }

  // Advanced / elite: full quality structure.
  const longFirst: Slot[] =
    goal === "5k" || goal === "10k"
      ? ["interval", "easy", "tempo", "easy", "long", "recovery"]
      : ["easy", "interval", "easy", "tempo", "recovery", "long"];
  return longFirst.slice(0, count) as Slot[];
}

// ─── volume baselines ─────────────────────────────────────────────────────

function startingEasyMiles(p: UserProfile): number {
  const base = {
    beginner: 1.5,
    intermediate: 3,
    advanced: 4.5,
    elite: 5.5,
  }[p.fitnessLevel];
  return adjustForActivity(base, p.activityLevel);
}

function startingLongRunMiles(p: UserProfile): number {
  const byGoal: Record<RunningGoal, number> = {
    "5k": 3,
    "10k": 4,
    half: 5,
    full: 6,
    ultra: 7,
    general: 3,
  };
  const goalBase = byGoal[p.goal];
  const levelMod =
    { beginner: 0.7, intermediate: 1, advanced: 1.3, elite: 1.5 }[p.fitnessLevel];
  return adjustForActivity(goalBase * levelMod, p.activityLevel);
}

function adjustForActivity(base: number, level: ActivityLevel): number {
  const mod = {
    sedentary: 0.7,
    light: 0.85,
    moderate: 1,
    active: 1.1,
    very_active: 1.2,
  }[level];
  return Math.round(base * mod * 10) / 10;
}

// ─── pace tables ──────────────────────────────────────────────────────────

function paceForLevel(
  level: FitnessLevel,
  kind: "easy" | "long" | "tempo" | "interval",
): string {
  const table: Record<FitnessLevel, Record<typeof kind, string>> = {
    beginner: { easy: "11'00", long: "11'30", tempo: "9'30", interval: "8'30" },
    intermediate: { easy: "9'00", long: "9'30", tempo: "7'45", interval: "6'45" },
    advanced: { easy: "8'00", long: "8'20", tempo: "6'45", interval: "5'45" },
    elite: { easy: "7'00", long: "7'15", tempo: "5'45", interval: "4'50" },
  };
  return table[level][kind];
}

function recoveryPace(level: FitnessLevel): string {
  return paceForLevel(level, "easy").replace(/'(\d{2})/, (_m, s) => {
    const next = Math.min(59, parseInt(s, 10) + 30);
    return `'${next.toString().padStart(2, "0")}`;
  });
}

function estimateMinPerMile(pace: string): number {
  // pace is "M'SS" — 8'30 means 8:30 per mile
  const [m, s] = pace.split("'");
  return parseInt(m, 10) + parseInt(s, 10) / 60;
}

// ─── progression ──────────────────────────────────────────────────────────

function progress(base: number, weekIndex: number, weeklyGrowth: number): number {
  // Compound growth so volume rises gently each week.
  const grown = base * Math.pow(1 + weeklyGrowth, weekIndex);
  return Math.round(grown * 10) / 10;
}

function avoidInjuryCap(p: UserProfile) {
  // If user logged any injuries, hold volume back ~15% across the board.
  const injured = p.injuryHistory.length > 0;
  const factor = injured ? 0.85 : 1;
  return {
    easy: 8 * factor,
    long: 16 * factor,
    tempo: 5 * factor,
    intervalReps: Math.floor(10 * factor),
  };
}

function limit(value: number, max: number): number {
  return Math.min(Math.round(value * 10) / 10, Math.round(max * 10) / 10);
}

// ─── segment builders ─────────────────────────────────────────────────────

function warmup(distanceMiles: number, pace: string): WorkoutSegment {
  return {
    label: "Warmup",
    distanceMiles,
    pace,
    targetHr: 150,
  };
}

function cooldown(): WorkoutSegment {
  return {
    label: "Cooldown & Recovery",
    distanceMiles: 0.5,
    notes: "Light jog or walk + 5 min stretch",
  };
}

function restWorkout(id: string, dateStr: string): Workout {
  return {
    id,
    date: dateStr,
    title: "Rest",
    type: "rest" as WorkoutType,
    status: "scheduled",
    main: { label: "Rest Day", notes: "Recovery is part of the work." },
  };
}

// ─── motivation copy ──────────────────────────────────────────────────────

const easyLines = [
  "Easy days build the engine. Keep it conversational.",
  "You should be able to hold a sentence the whole way.",
  "Resist the urge to push — slow today, strong tomorrow.",
];
const longLines = [
  "The long run is where the magic happens. Fuel well.",
  "Stay smooth in the first third. The work is in the last mile.",
  "Patience now becomes power on race day.",
];
const tempoLines = [
  "Comfortably hard — that's the dial.",
  "If you can talk easily, you're under pace. If you can't talk at all, ease back.",
  "Tempo is the single highest-ROI session for distance runners.",
];
const intervalLines = [
  "Threshold reps sharpen the engine.",
  "Stay smooth on the first reps — your future self will thank you.",
  "Rest is part of the work. Hold the pace, not your breath.",
];
const recoveryLines = [
  "Loosen the legs. No watch peeking.",
  "Easy spin to flush the system.",
  "The goal: feel better at mile two than mile one.",
];

const easyMotivation = () => easyLines[Math.floor(Math.random() * easyLines.length)];
const longMotivation = () => longLines[Math.floor(Math.random() * longLines.length)];
const tempoMotivation = () => tempoLines[Math.floor(Math.random() * tempoLines.length)];
const intervalMotivation = () =>
  intervalLines[Math.floor(Math.random() * intervalLines.length)];
const recoveryMotivation = () =>
  recoveryLines[Math.floor(Math.random() * recoveryLines.length)];
