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

export interface UserProfile {
  name: string;
  avatarColor: string;
  age?: number;
  weightLb?: number;
  heightIn?: number;
  fitnessLevel: "beginner" | "intermediate" | "advanced" | "elite";
  experience: "0-1" | "1-3" | "3-5" | "5+";
  goal: "5k" | "10k" | "half" | "full" | "ultra" | "general";
  trainingDays: number[]; // 0=Sun..6=Sat
  injuryHistory: string[];
  preferredUnits: "imperial" | "metric";
  onboarded: boolean;
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
