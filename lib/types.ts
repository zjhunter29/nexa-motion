export type WorkoutType =
  | "easy"
  | "long"
  | "tempo"
  | "interval"
  | "threshold"
  | "recovery"
  | "race"
  | "rest";

export interface WorkoutSegment {
  label: string;
  distanceMiles?: number;
  reps?: number;
  repDistanceMeters?: number;
  durationMinutes?: number;
  targetHr?: [number, number] | number;
  pace?: string;
  restSec?: number;
  location?: string;
  trainingFocus?: string;
  notes?: string;
}

export type FeelingRating = 1 | 2 | 3 | 4 | 5;

export interface Workout {
  id: string;
  date: string; // YYYY-MM-DD
  title: string;
  type: WorkoutType;
  status: "scheduled" | "completed" | "cancelled" | "missed";
  warmup?: WorkoutSegment;
  main: WorkoutSegment;
  cooldown?: WorkoutSegment;
  totalDistance?: number;
  totalDuration?: number;
  motivation?: string;
  cancelReason?: CancelReason;
  completedAt?: number; // unix ms — when "Complete Activity" was tapped
  /** 1 (rough) → 5 (energized). Captured by the post-workout feeling modal. */
  feelingRating?: FeelingRating;
  /** True for workouts the user created via the "Create Custom Workout" flow. */
  customWorkout?: boolean;
}

export type CancelReason = "sick" | "busy" | "injured" | "weather" | "other";

export interface CompletedRunStats {
  workoutId: string;
  date: string;
  distance: number;
  durationSec: number;
  avgPaceMinMile: number;
  avgHeartRate: number;
  maxHeartRate: number;
  cadence: number;
  calories: number;
  elevationGain: number;
}

export type FitnessLevel = "beginner" | "intermediate" | "advanced" | "elite";
export type Experience = "0-1" | "1-3" | "3-5" | "5+";
export type RunningGoal = "5k" | "10k" | "half" | "full" | "ultra" | "general";
export type ActivityLevel = "sedentary" | "light" | "moderate" | "active" | "very_active";
export type Units = "imperial" | "metric";

/**
 * Pace strings the user has dialed in for themselves, in M'SS per mile
 * (e.g. "7'45"). All fields optional — most people don't know theirs and
 * leave them blank, in which case the plan generator falls back to
 * level + physiology defaults.
 */
export interface KnownPaces {
  easy?: string;
  long?: string;
  tempo?: string;
  threshold?: string;
  interval?: string;
}

export interface UserProfile {
  name: string;
  avatarColor: string;

  // Required after onboarding
  age?: number; // years
  weightLb?: number;
  heightIn?: number;

  fitnessLevel: FitnessLevel;
  experience: Experience;
  goal: RunningGoal;
  activityLevel: ActivityLevel;
  trainingDays: number[]; // 0=Sun..6=Sat
  targetDistanceMiles?: number; // optional explicit weekly target
  injuryHistory: string[];

  preferredUnits: Units;
  onboarded: boolean;
  /** True once the user has explicitly generated their first plan. */
  hasGeneratedPlan: boolean;
  /** Unix ms — when the most-recent plan was generated. */
  planGeneratedAt?: number;
  /** Optional user-supplied paces. Override the auto-computed defaults. */
  knownPaces?: KnownPaces;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt?: string;
  progress?: number;
  target?: number;
}

export interface WeatherSnapshot {
  tempF: number;
  condition: "clear" | "cloudy" | "rain" | "snow" | "wind" | "fog";
  feelsLikeF: number;
  humidity: number;
  windMph: number;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: number;
}
