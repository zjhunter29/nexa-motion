"use client";

import { motion } from "framer-motion";
import { DateHeader } from "@/components/date-header";
import { HeroGreeting } from "@/components/hero-greeting";
import { WorkoutCard } from "@/components/workout-card";
import { QuickStats } from "@/components/quick-stats";
import { useNexaStore } from "@/lib/store";
import { dateKey } from "@/lib/utils";

export default function ActivityPage() {
  const workouts = useNexaStore((s) => s.workouts);

  const today = dateKey(new Date());
  const yesterday = dateKey(new Date(Date.now() - 86400000));

  const todayWorkout = workouts.find((w) => w.date === today);
  const yesterdayWorkout = workouts.find((w) => w.date === yesterday);

  return (
    <div className="safe-bottom">
      <DateHeader />
      <HeroGreeting />
      <QuickStats />

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        {todayWorkout && <WorkoutCard workout={todayWorkout} variant="primary" />}
        {yesterdayWorkout && (
          <WorkoutCard workout={yesterdayWorkout} variant="secondary" />
        )}
      </motion.div>
    </div>
  );
}
