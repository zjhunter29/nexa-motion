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
  CalendarDays,
  Workflow,
} from "lucide-react";
import { useMemo, useState } from "react";
import Link from "next/link";
import { useNexaStore } from "@/lib/store";
import type { Workout, WorkoutType } from "@/lib/types";
import { cn, dateKey, parseDateKey } from "@/lib/utils";
import { useUnits } from "@/lib/use-units";
import { FlowView } from "./workout-flow/flow-view";
import { vibrate, HAPTIC } from "@/lib/haptics";

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
  const [view, setView] = useState<"calendar" | "flow">("calendar");

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
      <header className="flex items-center justify-between px-5 pb-3">
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

      {/* Calendar / Flow toggle */}
      <div className="px-5 pb-4">
        <div className="glass-pill rounded-full p-1 inline-flex items-center w-full">
          {([
            { id: "calendar", label: "Calendar", icon: CalendarDays },
            { id: "flow", label: "Flow", icon: Workflow },
          ] as const).map((opt) => {
            const active = view === opt.id;
            const Icon = opt.icon;
            return (
              <motion.button
                key={opt.id}
                whileTap={{ scale: 0.96 }}
                onClick={() => {
                  vibrate(HAPTIC.toggle);
                  setView(opt.id);
                }}
                className={cn(
                  "relative flex-1 py-2 rounded-full text-[12px] font-semibold inline-flex items-center justify-center gap-1.5 transition-colors",
                  active ? "text-white" : "text-text-secondary",
                )}
              >
                {active && (
                  <motion.span
                    layoutId="cal-flow-pill"
                    className="absolute inset-0 rounded-full bg-gradient-to-br from-accent-purple/40 to-accent-blue/30 border border-white/15 shadow-glow-purple"
                    transition={{ type: "spring", stiffness: 400, damping: 32 }}
                  />
                )}
                <Icon className="h-3.5 w-3.5 relative z-10" />
                <span className="relative z-10">{opt.label}</span>
              </motion.button>
            );
          })}
        </div>
      </div>

      {view === "flow" ? (
        <div className="px-5">
          <FlowView workouts={workouts} />
        </div>
      ) : (
        <CalendarBody
          cursor={cursor}
          setCursor={setCursor}
          selected={selected}
          setSelected={setSelected}
          workoutByDate={workoutByDate}
          selectedWorkout={selectedWorkout}
          days={days}
        />
      )}
    </div>
  );
}

function CalendarBody({
  cursor,
  setCursor,
  selected,
  setSelected,
  workoutByDate,
  selectedWorkout,
  days,
}: {
  cursor: Date;
  setCursor: React.Dispatch<React.SetStateAction<Date>>;
  selected: string;
  setSelected: React.Dispatch<React.SetStateAction<string>>;
  workoutByDate: Map<string, Workout>;
  selectedWorkout: Workout | undefined;
  days: { day: number; key: string; inMonth: boolean }[];
}) {
  const monthLabel = cursor.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  return (
    <>
      {/* (the existing month grid + day detail + legend follow) */}

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
    </>
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
  const { formatDistance, formatPace } = useUnits();
  const d = parseDateKey(workout.date);
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
        <Stat label="Status" value={workout.status} capitalizeValue />
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
          {workout.main.pace && ` @ ${formatPace(workout.main.pace)}`}
        </div>
      )}
    </div>
  );
}

function Stat({
  label,
  value,
  capitalizeValue,
}: {
  label: string;
  value: string;
  capitalizeValue?: boolean;
}) {
  return (
    <div className="stat-tile min-w-0 px-2 py-2.5 flex flex-col items-center justify-center text-center">
      <div className="w-full text-[9px] sm:text-[10px] uppercase tracking-wider text-text-muted font-medium truncate">
        {label}
      </div>
      <div
        className={cn(
          "mt-1 w-full font-semibold text-white tabular-nums leading-tight truncate",
          // Smaller, responsive font so long values fit at every viewport width.
          "text-[12px] sm:text-[13px]",
          capitalizeValue && "capitalize",
        )}
        title={value}
      >
        {value}
      </div>
    </div>
  );
}

function EmptyDay({ dateString }: { dateString: string }) {
  const d = parseDateKey(dateString);
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
