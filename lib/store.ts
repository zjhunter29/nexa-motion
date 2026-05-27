"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type {
  CancelReason,
  ChatMessage,
  CompletedRunStats,
  UserProfile,
  Workout,
} from "./types";
import {
  sampleAchievements,
  sampleCompletedRuns,
  sampleWorkouts,
} from "./sample-data";

interface NexaState {
  profile: UserProfile;
  workouts: Workout[];
  completedRuns: CompletedRunStats[];
  achievements: typeof sampleAchievements;
  chatMessages: ChatMessage[];
  hydrated: boolean;

  setHydrated: (v: boolean) => void;
  updateProfile: (p: Partial<UserProfile>) => void;
  completeOnboarding: (p: Partial<UserProfile>) => void;

  cancelWorkout: (workoutId: string, reason: CancelReason) => void;
  uncancelWorkout: (workoutId: string) => void;
  completeWorkout: (workoutId: string) => void;
  updateWorkout: (workoutId: string, patch: Partial<Workout>) => void;

  pushMessage: (m: ChatMessage) => void;
  resetChat: () => void;
}

const defaultProfile: UserProfile = {
  name: "Zach",
  avatarColor: "#A855F7",
  age: undefined,
  weightLb: undefined,
  heightIn: undefined,
  fitnessLevel: "intermediate",
  experience: "3-5",
  goal: "half",
  trainingDays: [1, 2, 3, 4, 6],
  injuryHistory: [],
  preferredUnits: "imperial",
  onboarded: false,
};

export const useNexaStore = create<NexaState>()(
  persist(
    (set, get) => ({
      profile: defaultProfile,
      workouts: sampleWorkouts,
      completedRuns: sampleCompletedRuns,
      achievements: sampleAchievements,
      chatMessages: [],
      hydrated: false,

      setHydrated: (v) => set({ hydrated: v }),

      updateProfile: (p) =>
        set((s) => ({ profile: { ...s.profile, ...p } })),

      completeOnboarding: (p) =>
        set((s) => ({
          profile: { ...s.profile, ...p, onboarded: true },
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
              ? { ...w, status: "scheduled" as const, cancelReason: undefined }
              : w,
          ),
        })),

      completeWorkout: (workoutId) =>
        set((s) => ({
          workouts: s.workouts.map((w) =>
            w.id === workoutId ? { ...w, status: "completed" as const } : w,
          ),
        })),

      updateWorkout: (workoutId, patch) =>
        set((s) => ({
          workouts: s.workouts.map((w) =>
            w.id === workoutId ? { ...w, ...patch } : w,
          ),
        })),

      pushMessage: (m) =>
        set((s) => ({ chatMessages: [...s.chatMessages, m] })),

      resetChat: () => set({ chatMessages: [] }),
    }),
    {
      name: "nexa-motion-state",
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({
        profile: s.profile,
        workouts: s.workouts,
        chatMessages: s.chatMessages,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true);
      },
    },
  ),
);
