"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type {
  Achievement,
  CancelReason,
  ChatMessage,
  CompletedRunStats,
  FeelingRating,
  UserProfile,
  Workout,
} from "./types";
import { ACHIEVEMENT_CATALOGUE } from "./sample-data";
import { buildCustomWorkout, findNextAvailableDate } from "./custom-workout";

export interface PendingReview {
  /** What the user originally typed in the modal. */
  original: string;
  /** Latest AI revision, captured once the assistant responds. */
  revised?: string;
}

interface NexaState {
  profile: UserProfile;
  workouts: Workout[];
  completedRuns: CompletedRunStats[];
  achievements: Achievement[];
  chatMessages: ChatMessage[];
  hydrated: boolean;

  setHydrated: (v: boolean) => void;
  updateProfile: (p: Partial<UserProfile>) => void;
  completeOnboarding: (p: Partial<UserProfile>) => void;

  setPlan: (workouts: Workout[]) => void;
  clearPlan: () => void;

  cancelWorkout: (workoutId: string, reason: CancelReason) => void;
  uncancelWorkout: (workoutId: string) => void;
  completeWorkout: (
    workoutId: string,
    options?: { feelingRating?: FeelingRating; stats?: Partial<CompletedRunStats> },
  ) => void;
  updateWorkout: (workoutId: string, patch: Partial<Workout>) => void;

  pushMessage: (m: ChatMessage) => void;
  resetChat: () => void;

  // Custom workouts
  pendingReview: PendingReview | null;
  setPendingReview: (r: PendingReview | null) => void;
  setPendingReviewRevised: (revised: string) => void;
  /** Schedules a custom workout on the next available date. Returns the date. */
  addCustomWorkout: (text: string) => string;

  // Transient UI flags (not persisted)
  /** When true, the floating bottom nav hides so the share preview is unobstructed. */
  shareModalOpen: boolean;
  setShareModalOpen: (v: boolean) => void;
}

const defaultProfile: UserProfile = {
  name: "",
  avatarColor: "#A855F7",
  age: undefined,
  weightLb: undefined,
  heightIn: undefined,
  fitnessLevel: "beginner",
  experience: "0-1",
  goal: "general",
  activityLevel: "moderate",
  trainingDays: [1, 3, 5],
  targetDistanceMiles: undefined,
  injuryHistory: [],
  preferredUnits: "imperial",
  onboarded: false,
  hasGeneratedPlan: false,
  planGeneratedAt: undefined,
  knownPaces: {},
};

const PERSIST_VERSION = 2;

export const useNexaStore = create<NexaState>()(
  persist(
    (set, get) => ({
      profile: defaultProfile,
      // First-time users start completely empty — no fake demo content.
      workouts: [],
      completedRuns: [],
      achievements: ACHIEVEMENT_CATALOGUE.map((a) => ({ ...a, progress: 0 })),
      chatMessages: [],
      hydrated: false,

      setHydrated: (v) => set({ hydrated: v }),

      updateProfile: (p) =>
        set((s) => ({ profile: { ...s.profile, ...p } })),

      completeOnboarding: (p) =>
        set((s) => ({
          profile: { ...s.profile, ...p, onboarded: true },
        })),

      setPlan: (workouts) =>
        set((s) => ({
          workouts,
          profile: {
            ...s.profile,
            hasGeneratedPlan: true,
            planGeneratedAt: Date.now(),
          },
        })),

      clearPlan: () =>
        set((s) => ({
          workouts: [],
          completedRuns: [],
          profile: {
            ...s.profile,
            hasGeneratedPlan: false,
            planGeneratedAt: undefined,
          },
        })),

      cancelWorkout: (workoutId, reason) =>
        set((s) => ({
          workouts: s.workouts.map((w) =>
            w.id === workoutId
              ? { ...w, status: "cancelled" as const, cancelReason: reason }
              : w,
          ),
        })),

      uncancelWorkout: (workoutId) =>
        set((s) => ({
          workouts: s.workouts.map((w) =>
            w.id === workoutId
              ? {
                  ...w,
                  status: "scheduled" as const,
                  cancelReason: undefined,
                }
              : w,
          ),
        })),

      completeWorkout: (workoutId, options) => {
        const w = get().workouts.find((x) => x.id === workoutId);
        if (!w) return;
        const feelingRating = options?.feelingRating;
        const stats = options?.stats;
        set((s) => ({
          workouts: s.workouts.map((x) =>
            x.id === workoutId
              ? {
                  ...x,
                  status: "completed" as const,
                  completedAt: Date.now(),
                  feelingRating,
                }
              : x,
          ),
          completedRuns:
            w.type === "rest"
              ? s.completedRuns
              : [
                  ...s.completedRuns,
                  buildRunStats(w, stats),
                ],
          achievements: progressAchievements(s.achievements, s.workouts, w),
        }));
      },

      updateWorkout: (workoutId, patch) =>
        set((s) => ({
          workouts: s.workouts.map((w) =>
            w.id === workoutId ? { ...w, ...patch } : w,
          ),
        })),

      pushMessage: (m) =>
        set((s) => ({ chatMessages: [...s.chatMessages, m] })),

      resetChat: () => set({ chatMessages: [] }),

      pendingReview: null,
      setPendingReview: (r) => set({ pendingReview: r }),
      setPendingReviewRevised: (revised) =>
        set((s) =>
          s.pendingReview
            ? { pendingReview: { ...s.pendingReview, revised } }
            : {},
        ),

      addCustomWorkout: (text) => {
        const { workouts } = get();
        const slot = findNextAvailableDate(workouts);
        const workout = buildCustomWorkout(text, slot.date);
        set((s) => ({
          workouts: slot.replacesId
            ? s.workouts.map((w) =>
                w.id === slot.replacesId ? workout : w,
              )
            : [...s.workouts, workout].sort((a, b) =>
                a.date.localeCompare(b.date),
              ),
        }));
        return slot.date;
      },

      // Transient — not persisted via partialize, so it resets per session.
      shareModalOpen: false,
      setShareModalOpen: (v) => set({ shareModalOpen: v }),
    }),
    {
      name: "nexa-motion-state",
      version: PERSIST_VERSION,
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({
        profile: s.profile,
        workouts: s.workouts,
        completedRuns: s.completedRuns,
        achievements: s.achievements,
        chatMessages: s.chatMessages,
      }),
      migrate: (persisted: unknown, fromVersion: number) => {
        // Old (v1 or unversioned) stores carry sample workouts that we no longer
        // want — drop them so the user lands on a true clean slate.
        if (!persisted || typeof persisted !== "object")
          return persisted as never;
        if (fromVersion < PERSIST_VERSION) {
          const obj = persisted as Record<string, unknown>;
          obj.workouts = [];
          obj.completedRuns = [];
          obj.achievements = ACHIEVEMENT_CATALOGUE.map((a) => ({
            ...a,
            progress: 0,
          }));
          obj.chatMessages = obj.chatMessages ?? [];
          const profile = (obj.profile ?? {}) as Record<string, unknown>;
          if (typeof profile === "object") {
            // Backfill new required fields on existing profiles.
            profile.hasGeneratedPlan = false;
            profile.planGeneratedAt = undefined;
            profile.activityLevel = profile.activityLevel ?? "moderate";
            if (!("injuryHistory" in profile)) profile.injuryHistory = [];
            if (!("knownPaces" in profile)) profile.knownPaces = {};
            obj.profile = profile;
          }
          return obj as never;
        }
        return persisted as never;
      },
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true);
      },
    },
  ),
);

// ─── helpers ──────────────────────────────────────────────────────────────

function buildRunStats(
  w: Workout,
  override?: Partial<CompletedRunStats>,
): CompletedRunStats {
  const distance =
    w.totalDistance ??
    w.main.distanceMiles ??
    (w.main.reps && w.main.repDistanceMeters
      ? (w.main.reps * w.main.repDistanceMeters) / 1609
      : 0);

  const durationSec =
    w.totalDuration ??
    Math.round(distance * 9 * 60); // ~9 min/mi placeholder

  return {
    workoutId: w.id,
    date: w.date,
    distance,
    durationSec,
    avgPaceMinMile: distance > 0 ? durationSec / 60 / distance : 0,
    avgHeartRate: 150,
    maxHeartRate: 170,
    cadence: 178,
    calories: Math.round(distance * 95),
    elevationGain: 0,
    ...override,
  };
}

function progressAchievements(
  current: Achievement[],
  allWorkouts: Workout[],
  justCompleted: Workout,
): Achievement[] {
  const now = new Date().toISOString();
  const allCompleted = allWorkouts
    .filter((w) => w.id === justCompleted.id || w.status === "completed")
    .map((w) =>
      w.id === justCompleted.id
        ? { ...w, status: "completed" as const }
        : w,
    );
  const totalMiles = allCompleted.reduce(
    (acc, w) => acc + (w.totalDistance ?? w.main.distanceMiles ?? 0),
    0,
  );
  const totalRuns = allCompleted.filter((w) => w.type !== "rest").length;
  const streak = computeStreakFromList(allCompleted);

  return current.map((a) => {
    if (a.unlockedAt) return a;
    let progress = a.progress ?? 0;
    let unlocked = false;

    switch (a.id) {
      case "first-run":
        progress = Math.min(1, totalRuns);
        unlocked = totalRuns >= 1;
        break;
      case "streak-3":
        progress = Math.min(3, streak);
        unlocked = streak >= 3;
        break;
      case "streak-7":
        progress = Math.min(7, streak);
        unlocked = streak >= 7;
        break;
      case "streak-30":
        progress = Math.min(30, streak);
        unlocked = streak >= 30;
        break;
      case "miles-10":
        progress = Math.min(10, totalMiles);
        unlocked = totalMiles >= 10;
        break;
      case "miles-50":
        progress = Math.min(50, totalMiles);
        unlocked = totalMiles >= 50;
        break;
      case "miles-100":
        progress = Math.min(100, totalMiles);
        unlocked = totalMiles >= 100;
        break;
      case "long-15":
        progress = Math.min(
          15,
          Math.max(
            ...allCompleted.map(
              (w) => w.totalDistance ?? w.main.distanceMiles ?? 0,
            ),
            0,
          ),
        );
        unlocked = progress >= 15;
        break;
      default:
        break;
    }

    return unlocked ? { ...a, progress, unlockedAt: now } : { ...a, progress };
  });
}

function computeStreakFromList(workouts: Workout[]): number {
  const map = new Map<string, Workout>();
  for (const w of workouts) map.set(w.date, w);
  let streak = 0;
  const cursor = new Date();
  for (let i = 0; i < 60; i++) {
    const k = dateKeyOf(cursor);
    const w = map.get(k);
    if (w) {
      if (w.status === "completed" || w.type === "rest") streak++;
      else if (w.status === "scheduled" && i === 0) {
        // today still pending — neutral
      } else break;
    } else if (i === 0) {
      // today missing — neutral
    } else break;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

function dateKeyOf(d: Date): string {
  return `${d.getFullYear()}-${(d.getMonth() + 1)
    .toString()
    .padStart(2, "0")}-${d.getDate().toString().padStart(2, "0")}`;
}
