import type { Achievement, WeatherSnapshot } from "./types";

// Achievement catalogue. None are pre-unlocked — every user starts with a
// clean slate and earns these through real activity. `unlockedAt` is only
// populated by the store when the user actually hits the milestone.
export const ACHIEVEMENT_CATALOGUE: Achievement[] = [
  {
    id: "first-run",
    title: "First Stride",
    description: "Complete your first run",
    icon: "Footprints",
    target: 1,
  },
  {
    id: "streak-3",
    title: "Habit Forming",
    description: "3-day training streak",
    icon: "Flame",
    target: 3,
  },
  {
    id: "streak-7",
    title: "Week Warrior",
    description: "7-day training streak",
    icon: "Flame",
    target: 7,
  },
  {
    id: "streak-30",
    title: "Month Master",
    description: "30-day training streak",
    icon: "Crown",
    target: 30,
  },
  {
    id: "miles-10",
    title: "Double-Digit Club",
    description: "Log 10 total miles",
    icon: "Mountain",
    target: 10,
  },
  {
    id: "miles-50",
    title: "Half Century",
    description: "Log 50 total miles",
    icon: "Mountain",
    target: 50,
  },
  {
    id: "miles-100",
    title: "Century Club",
    description: "Log 100 total miles",
    icon: "Trophy",
    target: 100,
  },
  {
    id: "sub-7-tempo",
    title: "Tempo Killer",
    description: "Hold sub-7 pace on a tempo run",
    icon: "Zap",
  },
  {
    id: "long-15",
    title: "Distance Hunter",
    description: "Run 15 miles in one workout",
    icon: "Mountain",
    target: 15,
  },
];

// Static weather placeholder for the home pill (would be replaced by a real
// weather API call in production).
export const sampleWeather: WeatherSnapshot = {
  tempF: 58,
  condition: "clear",
  feelsLikeF: 55,
  humidity: 62,
  windMph: 6,
};
