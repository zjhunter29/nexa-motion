"use client";

import { motion } from "framer-motion";
import { useMemo, useState } from "react";
import {
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Check,
  AlertTriangle,
  Info,
  Flame,
  Snowflake,
  Target,
  Mountain,
  Heart,
  Zap,
  Trophy,
  Moon,
} from "lucide-react";
import type { Workout, WorkoutType } from "@/lib/types";
import {
  assessRecovery,
  distributionFor,
  FAMILY_META,
  familyOf,
  generateInsights,
  getWeekPadded,
  isHard,
  type RecoveryStatus,
  type WorkoutFamily,
  type Insight,
} from "@/lib/training-analysis";
import { cn, parseDateKey } from "@/lib/utils";
import { useUnits } from "@/lib/use-units";

const TYPE_ICON: Record<WorkoutType, typeof Heart> = {
  easy: Heart,
  long: Mountain,
  tempo: Zap,
  threshold: Zap,
  interval: Target,
  recovery: Snowflake,
  race: Trophy,
  rest: Moon,
};

const TYPE_LABEL: Record<WorkoutType, string> = {
  easy: "Easy",
  long: "Long",
  tempo: "Tempo",
  threshold: "Threshold",
  interval: "Intervals",
  recovery: "Recovery",
  race: "Race",
  rest: "Rest",
};

const RECOVERY_META: Record<
  RecoveryStatus,
  { color: string; label: string; icon: typeof Check }
> = {
  great: { color: "#10B981", label: "Great", icon: Check },
  good: { color: "#60A5FA", label: "Good", icon: Check },
  tight: { color: "#F59E0B", label: "Tight", icon: AlertTriangle },
  conflict: { color: "#EF4444", label: "Conflict", icon: AlertTriangle },
};

const TONE_META = {
  positive: { color: "#10B981", icon: Check },
  neutral: { color: "#60A5FA", icon: Info },
  warning: { color: "#F59E0B", icon: AlertTriangle },
} as const;

interface FlowViewProps {
  workouts: Workout[];
  /** Highlight the workout currently in focus (e.g. when triggered from another page) */
  focusedWorkoutId?: string;
}

const fadeUp = {
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.55, ease: [0.16, 1, 0.3, 1] as const },
};

export function FlowView({ workouts, focusedWorkoutId }: FlowViewProps) {
  const [weekAnchor, setWeekAnchor] = useState<Date>(() => new Date());
  const [selectedFamily, setSelectedFamily] = useState<WorkoutFamily | null>(
    null,
  );
  const [selectedWorkoutId, setSelectedWorkoutId] = useState<string | null>(
    focusedWorkoutId ?? null,
  );

  const week = useMemo(
    () => getWeekPadded(workouts, weekAnchor),
    [workouts, weekAnchor],
  );
  const weekWorkouts = useMemo(
    () => week.map((d) => d.workout).filter((w): w is Workout => !!w),
    [week],
  );
  const insights = useMemo(
    () => generateInsights(weekWorkouts),
    [weekWorkouts],
  );
  const distribution = useMemo(
    () => distributionFor(weekWorkouts),
    [weekWorkouts],
  );
  const maxCount = Math.max(1, ...distribution.map((d) => d.count));

  const monthLabel = parseDateKey(week[0].date).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
  });
  const monthLabelEnd = parseDateKey(week[6].date).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
  });

  return (
    <div className="space-y-4">
      {/* Week switcher */}
      <motion.div {...fadeUp} className="glass-panel rounded-3xl p-4">
        <div className="flex items-center justify-between">
          <motion.button
            whileTap={{ scale: 0.92 }}
            onClick={() => {
              const d = new Date(weekAnchor);
              d.setDate(d.getDate() - 7);
              setWeekAnchor(d);
            }}
            className="glass-pill h-9 w-9 rounded-full inline-flex items-center justify-center text-text-secondary hover:text-white"
            aria-label="Previous week"
          >
            <ChevronLeft className="h-4 w-4" />
          </motion.button>
          <div className="text-center min-w-0">
            <p className="text-[11px] uppercase tracking-[0.18em] text-text-muted font-semibold">
              Week of
            </p>
            <h2 className="mt-0.5 text-base font-semibold text-white truncate">
              {monthLabel} — {monthLabelEnd}
            </h2>
          </div>
          <motion.button
            whileTap={{ scale: 0.92 }}
            onClick={() => {
              const d = new Date(weekAnchor);
              d.setDate(d.getDate() + 7);
              setWeekAnchor(d);
            }}
            className="glass-pill h-9 w-9 rounded-full inline-flex items-center justify-center text-text-secondary hover:text-white"
            aria-label="Next week"
          >
            <ChevronRight className="h-4 w-4" />
          </motion.button>
        </div>
      </motion.div>

      {/* Vertical workout flow with connecting lines + recovery badges */}
      <motion.div
        {...fadeUp}
        transition={{ ...fadeUp.transition, delay: 0.05 }}
        className="glass-panel rounded-3xl p-5"
      >
        <p className="text-[11px] uppercase tracking-[0.18em] text-text-muted font-semibold mb-3">
          Weekly flow
        </p>
        <div className="space-y-0">
          {week.map((slot, i) => {
            const prev = i > 0 ? week[i - 1].workout : undefined;
            const recovery = slot.workout
              ? assessRecovery(prev, slot.workout)
              : null;
            const isSelected =
              !!slot.workout && selectedWorkoutId === slot.workout.id;
            const dimByFamily =
              selectedFamily &&
              (!slot.workout || familyOf(slot.workout) !== selectedFamily);
            return (
              <div key={slot.date}>
                {/* Recovery badge between cards */}
                {i > 0 && recovery && (
                  <RecoveryBadge recovery={recovery} />
                )}
                {/* The day card */}
                <WorkoutFlowCard
                  slot={slot}
                  index={i}
                  selected={isSelected}
                  dim={!!dimByFamily}
                  onClick={() => {
                    if (!slot.workout) return;
                    setSelectedWorkoutId((id) =>
                      id === slot.workout!.id ? null : slot.workout!.id,
                    );
                  }}
                />
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* System distribution */}
      <motion.div
        {...fadeUp}
        transition={{ ...fadeUp.transition, delay: 0.1 }}
        className="glass-panel rounded-3xl p-5"
      >
        <div className="flex items-start justify-between mb-2">
          <div>
            <p className="text-[11px] uppercase tracking-[0.18em] text-text-muted font-semibold">
              System distribution
            </p>
            <h3 className="mt-1 text-lg font-semibold text-white">
              Where the work goes
            </h3>
          </div>
          {selectedFamily && (
            <motion.button
              whileTap={{ scale: 0.94 }}
              onClick={() => setSelectedFamily(null)}
              className="text-[11px] font-semibold text-text-secondary hover:text-white"
            >
              Clear filter
            </motion.button>
          )}
        </div>

        <p className="text-[12px] text-text-secondary leading-relaxed mb-4">
          Tap a system to highlight every session targeting it.
        </p>

        <div className="grid grid-cols-2 gap-2.5">
          {distribution
            .filter((d) => d.family !== "rest" || d.count > 0)
            .map((d) => {
              const meta = FAMILY_META[d.family];
              const pct = (d.count / maxCount) * 100;
              const active = selectedFamily === d.family;
              return (
                <motion.button
                  key={d.family}
                  whileTap={{ scale: 0.97 }}
                  whileHover={{ y: -2 }}
                  onClick={() =>
                    setSelectedFamily((cur) =>
                      cur === d.family ? null : d.family,
                    )
                  }
                  className={cn(
                    "rounded-2xl p-3 border text-left transition-all",
                    active
                      ? "bg-white/8"
                      : "bg-white/[0.03] hover:bg-white/[0.05]",
                  )}
                  style={{
                    borderColor: active ? meta.color : "rgba(255,255,255,0.08)",
                    boxShadow: active
                      ? `0 0 30px ${meta.color}33`
                      : undefined,
                  }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className="text-[13px] font-semibold text-white"
                    >
                      {meta.label}
                    </span>
                    <span className="text-[11px] font-semibold tabular-nums" style={{ color: meta.color }}>
                      {d.count}
                    </span>
                  </div>
                  <div className="h-1.5 rounded-full bg-white/[0.05] overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{
                        duration: 0.9,
                        delay: 0.2,
                        ease: [0.16, 1, 0.3, 1],
                      }}
                      className="h-full rounded-full"
                      style={{ background: meta.color }}
                    />
                  </div>
                </motion.button>
              );
            })}
        </div>
      </motion.div>

      {/* Insights */}
      {insights.length > 0 && (
        <motion.div
          {...fadeUp}
          transition={{ ...fadeUp.transition, delay: 0.15 }}
          className="space-y-2.5"
        >
          <div className="flex items-center gap-1.5 px-1">
            <Sparkles className="h-3.5 w-3.5 text-accent-purple-bright" />
            <p className="text-[11px] uppercase tracking-[0.18em] text-text-muted font-semibold">
              Training balance insights
            </p>
          </div>
          {insights.map((ins, i) => (
            <InsightCard key={ins.id} insight={ins} delay={0.2 + i * 0.04} />
          ))}
        </motion.div>
      )}
    </div>
  );
}

// ─── pieces ─────────────────────────────────────────────────────────────

function WorkoutFlowCard({
  slot,
  index,
  selected,
  dim,
  onClick,
}: {
  slot: { date: string; workout?: Workout };
  index: number;
  selected: boolean;
  dim: boolean;
  onClick: () => void;
}) {
  const { formatDistance } = useUnits();
  const date = parseDateKey(slot.date);
  const dayName = date.toLocaleDateString("en-US", { weekday: "long" });
  const dayShort = date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });

  const w = slot.workout;
  const fam = w ? familyOf(w) : "rest";
  const meta = FAMILY_META[fam];
  const Icon = w ? TYPE_ICON[w.type] : Moon;
  const isHardOne = w ? isHard(w) : false;

  return (
    <motion.button
      layout
      whileTap={{ scale: 0.99 }}
      onClick={onClick}
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: dim ? 0.35 : 1, x: 0 }}
      transition={{
        duration: 0.45,
        delay: index * 0.04,
        ease: [0.16, 1, 0.3, 1] as const,
      }}
      className={cn(
        "w-full text-left rounded-2xl p-3.5 border transition-all flex items-center gap-3",
        selected
          ? "bg-white/8 shadow-glow-purple"
          : "bg-white/[0.03] hover:bg-white/[0.05]",
      )}
      style={{
        borderColor: selected ? meta.color : "rgba(255,255,255,0.06)",
      }}
    >
      {/* Day badge */}
      <div className="flex flex-col items-center justify-center shrink-0 w-12">
        <span className="text-[10px] uppercase tracking-wider text-text-muted font-semibold">
          {dayName.slice(0, 3)}
        </span>
        <span className="text-base font-semibold text-white leading-tight">
          {date.getDate()}
        </span>
      </div>

      {/* Type icon */}
      <span
        className="inline-flex items-center justify-center h-10 w-10 rounded-2xl border shrink-0 relative"
        style={{
          background: `linear-gradient(135deg, ${meta.color}33, ${meta.color}11)`,
          borderColor: `${meta.color}55`,
        }}
      >
        <Icon className="h-4 w-4" style={{ color: meta.color }} />
        {isHardOne && (
          <span
            className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full ring-2 ring-background"
            style={{ background: "#EF4444" }}
            title="Hard session"
          />
        )}
      </span>

      {/* Title + meta */}
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline justify-between gap-2">
          <h4 className="text-[14px] font-semibold text-white truncate">
            {w ? w.title : "Open day"}
          </h4>
          <span
            className="text-[10px] font-semibold uppercase tracking-wider shrink-0"
            style={{ color: meta.color }}
          >
            {w ? TYPE_LABEL[w.type] : "Open"}
          </span>
        </div>
        <p className="text-[11px] text-text-secondary truncate mt-0.5">
          {w?.totalDistance != null
            ? `${formatDistance(w.totalDistance)} • ${dayShort}`
            : dayShort}
        </p>
      </div>
    </motion.button>
  );
}

function RecoveryBadge({ recovery }: { recovery: ReturnType<typeof assessRecovery> }) {
  if (!recovery) return null;
  const meta = RECOVERY_META[recovery.status];
  const Icon = meta.icon;
  return (
    <div className="flex items-center justify-center py-2 relative">
      {/* Connecting line */}
      <div
        aria-hidden
        className="absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-px"
        style={{
          background: `linear-gradient(180deg, transparent, ${meta.color}66 30%, ${meta.color}66 70%, transparent)`,
        }}
      />
      {/* Badge */}
      <motion.div
        initial={{ scale: 0.7, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 glass-panel rounded-full pl-1.5 pr-2.5 py-1 inline-flex items-center gap-1.5 text-[10px] font-semibold"
        style={{
          borderColor: `${meta.color}55`,
          boxShadow: `0 0 16px ${meta.color}22`,
        }}
        title={recovery.note}
      >
        <span
          className="inline-flex h-3.5 w-3.5 rounded-full items-center justify-center"
          style={{ background: meta.color }}
        >
          <Icon className="h-2.5 w-2.5 text-white" strokeWidth={3} />
        </span>
        <span className="text-text-secondary uppercase tracking-wider whitespace-nowrap">
          {meta.label}
        </span>
      </motion.div>
    </div>
  );
}

function InsightCard({ insight, delay }: { insight: Insight; delay: number }) {
  const meta = TONE_META[insight.tone];
  const Icon = meta.icon;
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay, ease: [0.16, 1, 0.3, 1] }}
      className="glass-panel rounded-2xl p-4 flex items-start gap-3"
      style={{
        borderColor: `${meta.color}33`,
      }}
    >
      <span
        className="inline-flex items-center justify-center h-9 w-9 rounded-2xl border shrink-0"
        style={{
          background: `linear-gradient(135deg, ${meta.color}33, ${meta.color}11)`,
          borderColor: `${meta.color}55`,
        }}
      >
        <Icon className="h-4 w-4" style={{ color: meta.color }} />
      </span>
      <div className="min-w-0">
        <h4 className="text-[13px] font-semibold text-white">{insight.title}</h4>
        <p className="mt-0.5 text-[12px] text-text-secondary leading-relaxed">
          {insight.detail}
        </p>
      </div>
    </motion.div>
  );
}

// Silence unused-import warning on Flame (kept for future workout types)
void Flame;
