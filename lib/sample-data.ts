import type {
  Achievement,
  CompletedRunStats,
  WeatherSnapshot,
  Workout,
} from "./types";

const TODAY = new Date();

function offsetDate(days: number): string {
  const d = new Date(TODAY);
  d.setDate(d.getDate() + days);
  const y = d.getFullYear();
  const m = (d.getMonth() + 1).toString().padStart(2, "0");
  const day = d.getDate().toString().padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export const sampleWorkouts: Workout[] = [
  {
    id: "w-today",
    date: offsetDate(0),
    title: "Threshold Intervals",
    type: "threshold",
    status: "scheduled",
    motivation:
      "Today sharpens your lactate threshold. Stay smooth on the first reps — your future self will thank you.",
    warmup: {
      label: "Warmup",
      distanceMiles: 0.5,
      targetHr: 160,
      pace: "8'00",
    },
    main: {
      label: "Main Workout",
      reps: 12,
      repDistanceMeters: 400,
      restSec: 90,
      targetHr: [180, 190],
      pace: "5'00",
      trainingFocus: "Threshold",
      location: "Track",
    },
    cooldown: {
      label: "Cooldown & Recovery",
      distanceMiles: 0.75,
      notes: "Active recovery + 15 min leg drain + 10 min ice bucket",
    },
    totalDistance: 4.25,
    totalDuration: 48 * 60,
  },
  {
    id: "w-yesterday",
    date: offsetDate(-1),
    title: "Easy Base Run",
    type: "easy",
    status: "completed",
    motivation: "Easy days build the engine. Conversational pace only.",
    warmup: {
      label: "Warmup",
      distanceMiles: 1,
      targetHr: 150,
      pace: "8'30",
    },
    main: {
      label: "Base Run",
      distanceMiles: 5,
      targetHr: [145, 160],
      pace: "8'15",
      location: "Riverside loop",
    },
    cooldown: {
      label: "Cooldown",
      distanceMiles: 0.5,
      notes: "Walk + stretch",
    },
    totalDistance: 6.5,
    totalDuration: 54 * 60,
  },
  {
    id: "w-2dago",
    date: offsetDate(-2),
    title: "Recovery Shake-out",
    type: "recovery",
    status: "completed",
    motivation: "Loosen the legs. No watch peeking.",
    main: {
      label: "Shake-out",
      distanceMiles: 3,
      targetHr: [130, 145],
      pace: "9'00",
    },
    totalDistance: 3,
    totalDuration: 27 * 60,
  },
  {
    id: "w-3dago",
    date: offsetDate(-3),
    title: "Rest",
    type: "rest",
    status: "completed",
    main: { label: "Rest Day", notes: "Full recovery." },
  },
  {
    id: "w-4dago",
    date: offsetDate(-4),
    title: "Long Run",
    type: "long",
    status: "completed",
    motivation: "The long run is where the magic happens.",
    warmup: { label: "Warmup", distanceMiles: 1, pace: "9'00" },
    main: {
      label: "Long Run",
      distanceMiles: 11,
      targetHr: [150, 165],
      pace: "8'20",
    },
    cooldown: { label: "Cooldown", distanceMiles: 0.5 },
    totalDistance: 12.5,
    totalDuration: 102 * 60,
  },
  {
    id: "w-5dago",
    date: offsetDate(-5),
    title: "Tempo Push",
    type: "tempo",
    status: "completed",
    main: {
      label: "Tempo",
      distanceMiles: 4,
      targetHr: [170, 178],
      pace: "6'30",
      trainingFocus: "Tempo",
    },
    totalDistance: 5.5,
    totalDuration: 36 * 60,
  },
  {
    id: "w-6dago",
    date: offsetDate(-6),
    title: "Rest",
    type: "rest",
    status: "completed",
    main: { label: "Rest Day" },
  },
  {
    id: "w-tomorrow",
    date: offsetDate(1),
    title: "Easy Recovery",
    type: "recovery",
    status: "scheduled",
    main: {
      label: "Recovery Run",
      distanceMiles: 4,
      targetHr: [140, 150],
      pace: "8'45",
    },
  },
  {
    id: "w-plus2",
    date: offsetDate(2),
    title: "Long Run",
    type: "long",
    status: "scheduled",
    motivation: "12 miles steady — fuel well, dress smart.",
    main: {
      label: "Long Run",
      distanceMiles: 12,
      pace: "8'15",
      targetHr: [150, 165],
    },
  },
  {
    id: "w-plus3",
    date: offsetDate(3),
    title: "Rest",
    type: "rest",
    status: "scheduled",
    main: { label: "Rest Day" },
  },
  {
    id: "w-plus4",
    date: offsetDate(4),
    title: "Hill Repeats",
    type: "interval",
    status: "scheduled",
    main: {
      label: "Hill Reps",
      reps: 8,
      repDistanceMeters: 200,
      restSec: 120,
      pace: "5'30",
      trainingFocus: "Power",
      location: "Hillside loop",
    },
  },
];

export const sampleCompletedRuns: CompletedRunStats[] = [
  {
    workoutId: "w-yesterday",
    date: offsetDate(-1),
    distance: 6.5,
    durationSec: 54 * 60,
    avgPaceMinMile: 8.31,
    avgHeartRate: 152,
    maxHeartRate: 168,
    cadence: 178,
    calories: 612,
    elevationGain: 142,
  },
  {
    workoutId: "w-2dago",
    date: offsetDate(-2),
    distance: 3.0,
    durationSec: 27 * 60,
    avgPaceMinMile: 9.0,
    avgHeartRate: 138,
    maxHeartRate: 148,
    cadence: 172,
    calories: 282,
    elevationGain: 48,
  },
  {
    workoutId: "w-4dago",
    date: offsetDate(-4),
    distance: 12.5,
    durationSec: 102 * 60,
    avgPaceMinMile: 8.17,
    avgHeartRate: 158,
    maxHeartRate: 175,
    cadence: 180,
    calories: 1180,
    elevationGain: 412,
  },
  {
    workoutId: "w-5dago",
    date: offsetDate(-5),
    distance: 5.5,
    durationSec: 36 * 60,
    avgPaceMinMile: 6.55,
    avgHeartRate: 172,
    maxHeartRate: 184,
    cadence: 184,
    calories: 580,
    elevationGain: 88,
  },
];

export const weeklyPaceTrend = [
  { week: "5w ago", pace: 8.9 },
  { week: "4w ago", pace: 8.7 },
  { week: "3w ago", pace: 8.5 },
  { week: "2w ago", pace: 8.35 },
  { week: "Last", pace: 8.2 },
  { week: "This", pace: 8.05 },
];

export const weeklyMileage = [
  { week: "5w ago", miles: 22 },
  { week: "4w ago", miles: 26 },
  { week: "3w ago", miles: 24 },
  { week: "2w ago", miles: 30 },
  { week: "Last", miles: 32 },
  { week: "This", miles: 28 },
];

export const heartRateZones = [
  { zone: "Z1", minutes: 42, color: "#10B981" },
  { zone: "Z2", minutes: 88, color: "#3B82F6" },
  { zone: "Z3", minutes: 56, color: "#A855F7" },
  { zone: "Z4", minutes: 28, color: "#EC4899" },
  { zone: "Z5", minutes: 10, color: "#EF4444" },
];

export const cadenceTrend = [
  { day: "Mon", cadence: 174 },
  { day: "Tue", cadence: 178 },
  { day: "Wed", cadence: 0 },
  { day: "Thu", cadence: 182 },
  { day: "Fri", cadence: 180 },
  { day: "Sat", cadence: 184 },
  { day: "Sun", cadence: 176 },
];

export const sampleAchievements: Achievement[] = [
  {
    id: "first-run",
    title: "First Stride",
    description: "Logged your first run",
    icon: "Footprints",
    unlockedAt: offsetDate(-30),
  },
  {
    id: "streak-7",
    title: "Week Warrior",
    description: "7-day training streak",
    icon: "Flame",
    unlockedAt: offsetDate(-3),
  },
  {
    id: "century",
    title: "Century Club",
    description: "100 miles logged",
    icon: "Trophy",
    unlockedAt: offsetDate(-10),
  },
  {
    id: "sub-7-tempo",
    title: "Tempo Killer",
    description: "Sub-7 tempo run",
    icon: "Zap",
    unlockedAt: offsetDate(-5),
  },
  {
    id: "long-15",
    title: "Distance Hunter",
    description: "Run 15 miles in one workout",
    icon: "Mountain",
    progress: 12.5,
    target: 15,
  },
  {
    id: "streak-30",
    title: "Month Master",
    description: "30-day training streak",
    icon: "Crown",
    progress: 18,
    target: 30,
  },
];

export const sampleWeather: WeatherSnapshot = {
  tempF: 58,
  condition: "clear",
  feelsLikeF: 55,
  humidity: 62,
  windMph: 6,
};

export const personalRecords = [
  { label: "1 Mile", value: "5:42", date: offsetDate(-22) },
  { label: "5K", value: "19:48", date: offsetDate(-45) },
  { label: "10K", value: "42:15", date: offsetDate(-67) },
  { label: "Half", value: "1:34:20", date: offsetDate(-120) },
];
