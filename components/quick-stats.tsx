"use client";

import { motion } from "framer-motion";
import { TrendingUp, Flame, Footprints } from "lucide-react";
import { AnimatedCounter } from "./animated-counter";
import { useNexaStore } from "@/lib/store";

export function QuickStats() {
  const workouts = useNexaStore((s) => s.workouts);

  const completed = workouts.filter((w) => w.status === "completed");
  const weekMiles = completed.reduce(
    (acc, w) => acc + (w.totalDistance ?? 0),
    0,
  );
  const streak = computeStreak(workouts);
  const totalRuns = completed.filter((w) => w.type !== "rest").length;

  const stats = [
    {
      label: "Streak",
      value: streak,
      suffix: " days",
      icon: Flame,
      color: "#F59E0B",
    },
    {
      label: "This week",
      value: weekMiles,
      decimals: 1,
      suffix: " mi",
      icon: TrendingUp,
      color: "#C084FC",
    },
    {
      label: "Total runs",
      value: totalRuns,
      icon: Footprints,
      color: "#60A5FA",
    },
  ];

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
      className="grid grid-cols-3 gap-2.5 px-5 pb-4"
    >
      {stats.map((s) => {
        const Icon = s.icon;
        return (
          <div key={s.label} className="stat-tile p-3.5">
            <Icon className="h-4 w-4 mb-2" style={{ color: s.color }} />
            <div className="text-[11px] uppercase tracking-wider text-text-muted font-medium">
              {s.label}
            </div>
            <div className="mt-0.5 text-lg font-semibold text-white tabular-nums">
              <AnimatedCounter
                value={s.value}
                decimals={s.decimals ?? 0}
                suffix={s.suffix ?? ""}
              />
            </div>
          </div>
        );
      })}
    </motion.section>
  );
}

function computeStreak(
  workouts: ReturnType<typeof useNexaStore.getState>["workouts"],
): number {
  if (workouts.length === 0) return 0;
  const map = new Map<string, (typeof workouts)[number]>();
  for (const w of workouts) map.set(w.date, w);

  let streak = 0;
  const cursor = new Date();
  for (let i = 0; i < 60; i++) {
    const k = formatKey(cursor);
    const w = map.get(k);
    if (w) {
      if (w.status === "completed" || w.type === "rest") {
        streak++;
      } else if (w.status === "scheduled" && i === 0) {
        // today scheduled but not done — neutral
      } else {
        break;
      }
    } else if (i === 0) {
      // today missing — neutral
    } else {
      break;
    }
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

function formatKey(d: Date): string {
  return `${d.getFullYear()}-${(d.getMonth() + 1)
    .toString()
    .padStart(2, "0")}-${d.getDate().toString().padStart(2, "0")}`;
}
