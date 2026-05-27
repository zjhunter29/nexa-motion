"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  Flame,
  Snowflake,
  Target,
  Zap,
  Mountain,
  Heart,
  Trophy,
  Moon,
  CalendarPlus,
} from "lucide-react";
import { useMemo, useState } from "react";
import Link from "next/link";
import { useNexaStore } from "@/lib/store";
import type { Workout, WorkoutType } from "@/lib/types";
import { cn, dateKey, formatDistance } from "@/lib/utils";

const TYPE_META: Record<
  WorkoutType,
  { color: string; icon: typeof Flame; label: string }
> = {
  easy: { color: "#60A5FA", icon: Heart, label: "Easy" },
  long: { color: "#A855F7", icon: Mountain, label: "Long" },
  tempo: { color: "#F59E0B", icon: Zap, label: "Tempo" },
  interval: { color: "#EF4444", icon: Target, label: "Interval" },
  threshold: { color: "#EC4899", icon: Zap, label: "Threshold" },
  recovery: { color: "#10B981", icon: Snowflake, label: "Recovery" },
  race: { color: "#FBBF24", icon: Trophy, label: "Race" },
  rest: { color: "#71717A", icon: Moon, label: "Rest" },
};

export function CalendarView() {
  const workouts = useNexaStore((s) => s.workouts);
  const hasGeneratedPlan = useNexaStore((s) => s.profile.hasGeneratedPlan);

  const [cursor, setCursor] = useState(() => {
    const d = new Date();
    d.setDate(1);
    return d;
  });
  const [selected, setSelected] = useState<string>(() => dateKey(new Date()));

  const monthLabel = cursor.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  const days = useMemo(() => buildMonthGrid(cursor), [cursor]);

  const workoutByDate = useMemo(() => {
    const m = new Map<string, Workout>();
    for (const w of workouts) m.set(w.date, w);
    return m;
  }, [workouts]);

  const selectedWorkout = workoutByDate.get(selected);

  const completedThisMonth = days.filter(
    (d) =>
      d.inMonth && workoutByDate.get(d.key)?.status === "completed",
  ).length;

  if (!hasGeneratedPlan || workouts.length === 0) {
    return <CalendarEmptyState />;
  }

  return (
    <div className="safe-top safe-bottom">
      <header className="flex items-center justify-between px-5 pb-4">
        <div>
          <p className="text-[11px] uppercase tracking-[0.22em] text-text-muted font-medium">
            History &amp; schedule
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-white">
            Calendar
          </h1>
        </div>
        <div className="glass-pill rounded-full px-3 py-1.5 inline-flex items-center gap-1.5">
          <Flame className="h-3.5 w-3.5 text-accent-amber" />
          <span className="text-xs font-medium text-text-secondary">
            {completedThisMonth} runs
          </span>
        </div>
      </header>

      <div className="mx-5 mb-4 glass-panel rounded-3xl p-4">
        <div className="flex items-center justify-between mb-3">
          <motion.button
            whileTap={{ scale: 0.92 }}
            onClick={() =>
              setCursor((c) => {
                const d = new Date(c);
                d.setMonth(d.getMonth() - 1);
                return d;
              })
            }
            className="glass-pill h-9 w-9 rounded-full inline-flex items-center justify-center text-text-secondary hover:text-white"
          >
            <ChevronLeft className="h-4 w-4" />
          </motion.button>
          <h2 className="text-lg font-semibold text-white">{monthLabel}</h2>
          <motion.button
            whileTap={{ scale: 0.92 }}
            onClick={() =>
              setCursor((c) => {
                const d = new Date(c);
                d.setMonth(d.getMonth() + 1);
                return d;
              })
            }
            className="glass-pill h-9 w-9 rounded-full inline-flex items-center justify-center text-text-secondary hover:text-white"
          >
            <ChevronRight className="h-4 w-4" />
          </motion.button>
        </div>

        <div className="grid grid-cols-7 gap-1 mb-2">
          {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
            <div
              key={i}
              className="text-center text-[10px] uppercase tracking-wider text-text-muted font-medium"
            >
              {d}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1.5">
          {days.map((d) => {
            const w = workoutByDate.get(d.key);
            const meta = w ? TYPE_META[w.type] : null;
            const isSelected = selected === d.key;
            const isToday = d.key === dateKey(new Date());
            const cancelled = w?.status === "cancelled";
            const completed = w?.status === "completed";

            return (
              <motion.button
                key={d.key}
                whileTap={{ scale: 0.92 }}
                onClick={() => setSelected(d.key)}
                className={cn(
                  "relative aspect-square rounded-2xl flex items-center justify-center text-sm font-medium transition-all",
                  !d.inMonth && "opacity-30",
                  isSelected
                    ? "bg-gradient-to-br from-accent-purple/40 to-accent-blue/30 border border-white/20 shadow-glow-purple"
                    : "border border-transparent hover:bg-white/[0.04]",
                  isToday && !isSelected && "border-white/15",
                )}
              >
                <span
                  className={cn(
                    "relative z-10",
                    cancelled && "line-through text-text-muted",
                    isSelected ? "text-white" : "text-text-primary",
                  )}
                >
                  {d.day}
                </span>
                {meta && !isSelected && (
                  <span
                    className="absolute bottom-1.5 h-1 w-1 rounded-full"
                    style={{
                      background: meta.color,
                      opacity: completed ? 1 : 0.4,
                    }}
                  />
                )}
                {meta && isSelected && (
                  <span
                    className="absolute bottom-1.5 h-1 w-4 rounded-full"
                    style={{ background: meta.color }}
                  />
                )}
              </motion.button>
            );
          })}
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={selected}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.3 }}
          className="mx-5"
        >
          {selectedWorkout ? (
            <DayDetail workout={selectedWorkout} />
          ) : (
            <EmptyDay dateString={selected} />
          )}
        </motion.div>
      </AnimatePresence>

      <div className="mx-5 mt-5 glass-panel rounded-3xl p-4">
        <p className="text-[11px] uppercase tracking-[0.18em] text-text-muted font-semibold mb-3">
          Activity types
        </p>
        <div className="grid grid-cols-2 gap-2">
          {Object.entries(TYPE_META).map(([type, meta]) => (
            <div key={type} className="flex items-center gap-2">
              <span
                className="h-2 w-2 rounded-full"
                style={{ background: meta.color }}
              />
              <span className="text-[13px] text-text-secondary">
                {meta.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function CalendarEmptyState() {
  return (
    <div className="safe-top safe-bottom px-5">
      <header className="pb-4">
        <p className="text-[11px] uppercase tracking-[0.22em] text-text-muted font-medium">
          History &amp; schedule
        </p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-white">
          Calendar
        </h1>
      </header>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="glass-panel rounded-3xl p-7 text-center"
      >
        <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-gradient-to-br from-accent-purple/25 to-accent-blue/15 border border-white/10 mb-4 mx-auto">
          <CalendarPlus className="h-6 w-6 text-accent-purple-bright" />
        </div>
        <h2 className="text-xl font-semibold text-white">
          Your calendar is waiting
        </h2>
        <p className="mt-1.5 text-[13px] text-text-secondary leading-relaxed max-w-[280px] mx-auto">
          Once you generate your first plan, scheduled and completed runs will
          appear here color-coded by type.
        </p>
        <Link
          href="/"
          className="btn-primary mt-5 px-5 py-3 inline-flex items-center justify-center gap-2 font-semibold text-[14px]"
        >
          Create my first plan
        </Link>
      </motion.div>

      <div className="mt-5 glass-panel rounded-3xl p-4">
        <p className="text-[11px] uppercase tracking-[0.18em] text-text-muted font-semibold mb-3">
          What you'll see here
        </p>
        <div className="grid grid-cols-2 gap-2">
          {Object.entries(TYPE_META).map(([type, meta]) => (
            <div key={type} className="flex items-center gap-2">
              <span
                className="h-2 w-2 rounded-full"
                style={{ background: meta.color }}
              />
              <span className="text-[13px] text-text-secondary">
                {meta.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function DayDetail({ workout }: { workout: Workout }) {
  const meta = TYPE_META[workout.type];
  const Icon = meta.icon;
  const d = new Date(workout.date);
  const dateLabel = d.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="glass-panel rounded-3xl p-5">
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="text-[11px] uppercase tracking-[0.18em] text-text-muted font-semibold">
            {dateLabel}
          </p>
          <h3 className="mt-1 text-xl font-semibold text-white">
            {workout.title}
          </h3>
        </div>
        <span
          className="inline-flex items-center justify-center h-10 w-10 rounded-2xl border"
          style={{
            background: `linear-gradient(135deg, ${meta.color}33, ${meta.color}11)`,
            borderColor: `${meta.color}55`,
          }}
        >
          <Icon className="h-5 w-5" style={{ color: meta.color }} />
        </span>
      </div>

      <div className="grid grid-cols-3 gap-2 mb-3">
        <Stat label="Status" value={workout.status} />
        <Stat
          label="Distance"
          value={
            workout.totalDistance != null
              ? formatDistance(workout.totalDistance)
              : "—"
          }
        />
        <Stat
          label="Duration"
          value={
            workout.totalDuration != null
              ? `${Math.round(workout.totalDuration / 60)}m`
              : "—"
          }
        />
      </div>

      {workout.main && (
        <div className="text-[13px] text-text-secondary leading-relaxed">
          <span className="font-semibold text-white">Main: </span>
          {workout.main.label}
          {workout.main.distanceMiles &&
            ` · ${formatDistance(workout.main.distanceMiles)}`}
          {workout.main.reps &&
            ` · ${workout.main.reps}×${workout.main.repDistanceMeters}m`}
          {workout.main.pace && ` @ ${workout.main.pace}/mi`}
        </div>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="stat-tile p-2.5">
      <div className="text-[10px] uppercase tracking-wider text-text-muted font-medium">
        {label}
      </div>
      <div className="mt-0.5 text-sm font-semibold text-white capitalize">
        {value}
      </div>
    </div>
  );
}

function EmptyDay({ dateString }: { dateString: string }) {
  const d = new Date(dateString);
  const dateLabel = d.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="glass-panel rounded-3xl p-6 text-center">
      <Moon className="h-6 w-6 text-text-muted mx-auto mb-2" />
      <p className="text-sm font-medium text-white">{dateLabel}</p>
      <p className="text-[13px] text-text-muted mt-1">No workout scheduled.</p>
    </div>
  );
}

function buildMonthGrid(cursor: Date) {
  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const first = new Date(year, month, 1);
  const last = new Date(year, month + 1, 0);
  const startWeekday = first.getDay();
  const daysInMonth = last.getDate();

  const days: { day: number; key: string; inMonth: boolean }[] = [];

  for (let i = startWeekday - 1; i >= 0; i--) {
    const d = new Date(year, month, -i);
    days.push({ day: d.getDate(), key: dateKey(d), inMonth: false });
  }
  for (let i = 1; i <= daysInMonth; i++) {
    const d = new Date(year, month, i);
    days.push({ day: i, key: dateKey(d), inMonth: true });
  }
  let trailingIndex = 1;
  while (days.length % 7 !== 0) {
    const d = new Date(year, month + 1, trailingIndex);
    days.push({ day: d.getDate(), key: dateKey(d), inMonth: false });
    trailingIndex++;
  }

  return days;
}
