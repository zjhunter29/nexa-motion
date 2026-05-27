"use client";

import { motion } from "framer-motion";
import {
  Footprints,
  Flame,
  Trophy,
  Zap,
  Mountain,
  Crown,
  Award,
  Calendar,
} from "lucide-react";
import { useNexaStore } from "@/lib/store";
import {
  personalRecords,
  sampleAchievements,
} from "@/lib/sample-data";
import { AnimatedCounter } from "./animated-counter";

const ICON_MAP = {
  Footprints,
  Flame,
  Trophy,
  Zap,
  Mountain,
  Crown,
  Award,
} as const;

const fadeUp = {
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.55, ease: [0.16, 1, 0.3, 1] as const },
};

export function ProfileView() {
  const profile = useNexaStore((s) => s.profile);
  const workouts = useNexaStore((s) => s.workouts);
  const completed = workouts.filter((w) => w.status === "completed");

  const totalMiles = completed.reduce(
    (a, w) => a + (w.totalDistance ?? 0),
    0,
  );
  const totalSeconds = completed.reduce(
    (a, w) => a + (w.totalDuration ?? 0),
    0,
  );
  const totalHours = totalSeconds / 3600;

  const initials =
    profile.name
      .split(" ")
      .map((p) => p[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "N";

  return (
    <div className="safe-top safe-bottom px-5 space-y-4">
      <motion.header {...fadeUp} className="pb-2 flex items-start justify-between">
        <div>
          <p className="text-[11px] uppercase tracking-[0.22em] text-text-muted font-medium">
            You, in motion
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-white">
            Profile
          </h1>
        </div>
      </motion.header>

      {/* Avatar hero */}
      <motion.div
        {...fadeUp}
        transition={{ ...fadeUp.transition, delay: 0.05 }}
        className="glass-panel-strong glow-border rounded-3xl p-6 flex flex-col items-center text-center"
      >
        <motion.div
          whileHover={{ scale: 1.05 }}
          className="relative h-24 w-24 rounded-full flex items-center justify-center mb-4"
          style={{
            background: `linear-gradient(135deg, ${profile.avatarColor}, #3B82F6)`,
            boxShadow: `0 0 40px ${profile.avatarColor}66`,
          }}
        >
          <span className="text-3xl font-bold text-white">{initials}</span>
          <motion.div
            className="absolute inset-0 rounded-full border-2 border-white/20"
            animate={{ scale: [1, 1.08, 1], opacity: [0.6, 0.2, 0.6] }}
            transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
          />
        </motion.div>
        <h2 className="text-2xl font-semibold text-white">{profile.name}</h2>
        <div className="mt-1 flex items-center gap-2 flex-wrap justify-center">
          <span className="glass-pill rounded-full px-3 py-1 text-[11px] font-medium text-text-secondary capitalize">
            {profile.fitnessLevel}
          </span>
          <span className="glass-pill rounded-full px-3 py-1 text-[11px] font-medium text-text-secondary">
            {profile.experience} yrs
          </span>
          <span className="glass-pill rounded-full px-3 py-1 text-[11px] font-medium text-text-secondary uppercase">
            {profile.goal} goal
          </span>
        </div>
      </motion.div>

      {/* Lifetime stats */}
      <motion.div
        {...fadeUp}
        transition={{ ...fadeUp.transition, delay: 0.1 }}
        className="grid grid-cols-3 gap-2.5"
      >
        <BigStat
          icon={Footprints}
          label="Runs"
          value={completed.length}
          color="#60A5FA"
        />
        <BigStat
          icon={Mountain}
          label="Miles"
          value={totalMiles}
          decimals={1}
          color="#C084FC"
        />
        <BigStat
          icon={Calendar}
          label="Hours"
          value={totalHours}
          decimals={1}
          color="#10B981"
        />
      </motion.div>

      {/* Personal records */}
      <motion.div
        {...fadeUp}
        transition={{ ...fadeUp.transition, delay: 0.15 }}
        className="glass-panel rounded-3xl p-5"
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-[11px] uppercase tracking-[0.18em] text-text-muted font-semibold">
              Personal records
            </p>
            <h3 className="mt-1 text-lg font-semibold text-white">Your bests</h3>
          </div>
          <span className="inline-flex items-center justify-center h-9 w-9 rounded-2xl bg-gradient-to-br from-accent-amber/30 to-accent-amber/5 border border-accent-amber/30">
            <Trophy className="h-4 w-4 text-accent-amber" />
          </span>
        </div>
        <div className="grid grid-cols-2 gap-2.5">
          {personalRecords.map((pr) => (
            <div key={pr.label} className="stat-tile p-3.5">
              <div className="text-[10px] uppercase tracking-wider text-text-muted font-medium">
                {pr.label}
              </div>
              <div className="mt-0.5 text-xl font-semibold gradient-text-vibrant tabular-nums">
                {pr.value}
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Achievements */}
      <motion.div
        {...fadeUp}
        transition={{ ...fadeUp.transition, delay: 0.2 }}
        className="glass-panel rounded-3xl p-5"
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-[11px] uppercase tracking-[0.18em] text-text-muted font-semibold">
              Achievements
            </p>
            <h3 className="mt-1 text-lg font-semibold text-white">
              Badges earned
            </h3>
          </div>
          <span className="text-[11px] font-semibold text-text-secondary tabular-nums">
            {sampleAchievements.filter((a) => a.unlockedAt).length}/
            {sampleAchievements.length}
          </span>
        </div>
        <div className="grid grid-cols-3 gap-2.5">
          {sampleAchievements.map((a) => {
            const Icon =
              (ICON_MAP as Record<string, typeof Footprints>)[a.icon] ?? Award;
            const unlocked = !!a.unlockedAt;
            return (
              <motion.div
                key={a.id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.96 }}
                className={`stat-tile p-3 flex flex-col items-center text-center ${
                  unlocked ? "" : "opacity-50"
                }`}
              >
                <span
                  className="inline-flex items-center justify-center h-10 w-10 rounded-2xl mb-2"
                  style={{
                    background: unlocked
                      ? "linear-gradient(135deg, rgba(168,85,247,0.35), rgba(59,130,246,0.2))"
                      : "rgba(255,255,255,0.04)",
                    border: unlocked
                      ? "1px solid rgba(192,132,252,0.4)"
                      : "1px solid rgba(255,255,255,0.06)",
                  }}
                >
                  <Icon
                    className="h-4 w-4"
                    style={{ color: unlocked ? "#C084FC" : "#71717A" }}
                  />
                </span>
                <span className="text-[11px] font-semibold text-white leading-tight">
                  {a.title}
                </span>
                {a.progress != null && a.target != null && (
                  <div className="mt-2 w-full">
                    <div className="h-1 bg-white/[0.06] rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{
                          width: `${Math.min(100, (a.progress / a.target) * 100)}%`,
                        }}
                        transition={{ duration: 1, delay: 0.4 }}
                        className="h-full bg-gradient-to-r from-accent-purple to-accent-blue"
                      />
                    </div>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* Weekly summary */}
      <motion.div
        {...fadeUp}
        transition={{ ...fadeUp.transition, delay: 0.25 }}
        className="glass-panel rounded-3xl p-5"
      >
        <p className="text-[11px] uppercase tracking-[0.18em] text-text-muted font-semibold mb-1">
          This week
        </p>
        <h3 className="text-lg font-semibold text-white mb-4">Summary</h3>
        <div className="space-y-3">
          <SummaryRow label="Runs completed" value={`${completed.length}`} />
          <SummaryRow
            label="Total distance"
            value={`${totalMiles.toFixed(1)} mi`}
          />
          <SummaryRow
            label="Time spent"
            value={`${totalHours.toFixed(1)} hr`}
          />
          <SummaryRow label="Avg pace" value="8'05/mi" />
          <SummaryRow label="Avg heart rate" value="152 bpm" />
        </div>
      </motion.div>
    </div>
  );
}

function BigStat({
  icon: Icon,
  label,
  value,
  decimals,
  color,
}: {
  icon: typeof Footprints;
  label: string;
  value: number;
  decimals?: number;
  color: string;
}) {
  return (
    <div className="stat-tile p-3.5">
      <Icon className="h-4 w-4 mb-2" style={{ color }} />
      <div className="text-[10px] uppercase tracking-wider text-text-muted font-medium">
        {label}
      </div>
      <div className="mt-0.5 text-xl font-semibold text-white tabular-nums">
        <AnimatedCounter value={value} decimals={decimals ?? 0} />
      </div>
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-text-secondary">{label}</span>
      <span className="font-semibold text-white tabular-nums">{value}</span>
    </div>
  );
}
