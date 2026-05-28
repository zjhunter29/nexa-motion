import { Annoyed, Frown, Laugh, Meh, Smile } from "lucide-react";
import type { FeelingRating } from "./types";

export interface FeelingFace {
  rating: FeelingRating;
  label: string;
  icon: typeof Smile;
  color: string;
  /** Tooltip / longer description shown under the face when picked. */
  description: string;
}

export const FEELING_SCALE: FeelingFace[] = [
  {
    rating: 1,
    label: "Rough",
    icon: Frown,
    color: "#EF4444",
    description: "It was a grind.",
  },
  {
    rating: 2,
    label: "Tough",
    icon: Annoyed,
    color: "#F59E0B",
    description: "Harder than I'd like.",
  },
  {
    rating: 3,
    label: "Okay",
    icon: Meh,
    color: "#A8A8B3",
    description: "About what I expected.",
  },
  {
    rating: 4,
    label: "Good",
    icon: Smile,
    color: "#10B981",
    description: "Felt strong out there.",
  },
  {
    rating: 5,
    label: "Energized",
    icon: Laugh,
    color: "#C084FC",
    description: "I could've kept going.",
  },
];

/** Map a numeric average (1–5, possibly fractional) to the closest face. */
export function faceForAverage(avg: number | null): FeelingFace | null {
  if (avg == null || !Number.isFinite(avg) || avg <= 0) return null;
  const rounded = Math.max(1, Math.min(5, Math.round(avg))) as FeelingRating;
  return FEELING_SCALE.find((f) => f.rating === rounded) ?? null;
}

/** Convenience: get the face for an exact rating. */
export function faceForRating(rating: FeelingRating): FeelingFace {
  return FEELING_SCALE.find((f) => f.rating === rating)!;
}
