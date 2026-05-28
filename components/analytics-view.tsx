"use client";

import { motion } from "framer-motion";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Activity,
  TrendingDown,
  BarChart3,
  Sparkles,
  Heart,
} from "lucide-react";
import Link from "next/link";
import { useNexaStore } from "@/lib/store";
import { AnimatedCounter } from "./animated-counter";
import { useMemo } from "react";
import { FEELING_SCALE, faceForAverage, faceForRating } from "@/lib/feelings";
import { useUnits } from "@/lib/use-units";
import type { Workout } from "@/lib/types";

const fadeUp = {
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.55, ease: [0.16, 1, 0.3, 1] as const },
};

export function AnalyticsView() {
  const completedRuns = useNexaStore((s) => s.completedRuns);
  const workouts = useNexaStore((s) => s.workouts);
  const hasGeneratedPlan = useNexaStore((s) => s.profile.hasGeneratedPlan);
  const { distanceValue, distanceUnit } = useUnits();

  const totalDistanceDisplay = useMemo(
    () => distanceValue(completedRuns.reduce((a, r) => a + r.distance, 0)),
    [completedRuns, distanceValue],
  );

  const hasData = completedRuns.length > 0;

  if (!hasGeneratedPlan && completedRuns.length === 0) {
    return (
      <AnalyticsEmptyState
        title="No data yet"
        body="Generate your first plan and complete a workout — analytics will start populating from your real activity."
        ctaLabel="Create my first plan"
      />
    );
  }

  if (!hasData) {
    return (
      <AnalyticsEmptyState
        title="Complete your first workout"
        body="Your charts will populate the moment you mark an activity complete. Pace, distance, and how you felt — all driven by your real data."
        ctaLabel="View today's workout"
      />
    );
  }

  return (
    <div className="safe-top safe-bottom px-5 space-y-4">
      <motion.header {...fadeUp} className="pb-2">
        <p className="text-[11px] uppercase tracking-[0.22em] text-text-muted font-medium">
          The numbers
        </p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-white">
          Analytics
        </h1>
      </motion.header>

      {/* Single hero KPI — total distance only */}
      <motion.div
        {...fadeUp}
        transition={{ ...fadeUp.transition, delay: 0.05 }}
        className="glass-panel rounded-3xl p-5"
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-[0.18em] text-text-muted font-semibold">
              Total distance
            </p>
            <div className="mt-1 text-3xl font-semibold text-white tabular-nums">
              <AnimatedCounter value={totalDistanceDisplay} decimals={1} />
              <span className="text-base font-medium text-text-secondary ml-2">
                {distanceUnit}
              </span>
            </div>
          </div>
          <span className="inline-flex items-center justify-center h-12 w-12 rounded-2xl bg-gradient-to-br from-accent-purple/30 to-accent-blue/15 border border-white/10">
            <Activity className="h-5 w-5 text-accent-purple-bright" />
          </span>
        </div>
      </motion.div>

      <PaceTrend runs={completedRuns} />
      <MileageBars runs={completedRuns} />
      <FeelingSummary workouts={workouts} />
      <FeelingTrend workouts={workouts} />
    </div>
  );
}

function AnalyticsEmptyState({
  title,
  body,
  ctaLabel,
}: {
  title: string;
  body: string;
  ctaLabel: string;
}) {
  return (
    <div className="safe-top safe-bottom px-5">
      <header className="pb-4">
        <p className="text-[11px] uppercase tracking-[0.22em] text-text-muted font-medium">
          The numbers
        </p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-white">
          Analytics
        </h1>
      </header>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="glass-panel rounded-3xl p-7 text-center"
      >
        <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-gradient-to-br from-accent-purple/25 to-accent-blue/15 border border-white/10 mb-4 mx-auto">
          <BarChart3 className="h-6 w-6 text-accent-purple-bright" />
        </div>
        <h2 className="text-xl font-semibold text-white">{title}</h2>
        <p className="mt-1.5 text-[13px] text-text-secondary leading-relaxed max-w-[300px] mx-auto">
          {body}
        </p>
        <Link
          href="/"
          className="btn-primary mt-5 px-5 py-3 inline-flex items-center justify-center gap-2 font-semibold text-[14px]"
        >
          {ctaLabel}
        </Link>
      </motion.div>
    </div>
  );
}

function PaceTrend({
  runs,
}: {
  runs: ReturnType<typeof useNexaStore.getState>["completedRuns"];
}) {
  const { paceUnit } = useUnits();
  const isMetric = paceUnit === "/km";
  const data = runs.slice(-8).map((r, i) => ({
    label: `R${i + 1}`,
    pace: Number(
      (isMetric ? r.avgPaceMinMile / 1.609344 : r.avgPaceMinMile).toFixed(2),
    ),
  }));

  return (
    <motion.div {...fadeUp} className="glass-panel rounded-3xl p-5">
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-[11px] uppercase tracking-[0.18em] text-text-muted font-semibold">
            Pace trend
          </p>
          <h3 className="mt-1 text-lg font-semibold text-white">
            Your last {data.length} runs
          </h3>
        </div>
        {data.length >= 2 && data[data.length - 1].pace < data[0].pace && (
          <span className="inline-flex items-center gap-1 text-[12px] font-semibold text-accent-green">
            <TrendingDown className="h-3.5 w-3.5" />
            Faster
          </span>
        )}
      </div>
      <div className="h-44">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="paceFill" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="#C084FC" stopOpacity={0.5} />
                <stop offset="100%" stopColor="#C084FC" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="rgba(255,255,255,0.05)" vertical={false} />
            <XAxis
              dataKey="label"
              tick={{ fill: "#71717A", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis hide domain={["dataMin - 0.2", "dataMax + 0.2"]} />
            <Tooltip
              cursor={{ stroke: "rgba(255,255,255,0.1)" }}
              contentStyle={{
                background: "rgba(17,17,28,0.95)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: 12,
                color: "#fff",
                fontSize: 12,
              }}
              formatter={(v) => [`${v} min${paceUnit}`, "Pace"]}
            />
            <Area
              type="monotone"
              dataKey="pace"
              stroke="#C084FC"
              strokeWidth={2.5}
              fill="url(#paceFill)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}

function MileageBars({
  runs,
}: {
  runs: ReturnType<typeof useNexaStore.getState>["completedRuns"];
}) {
  const { distanceValue, distanceUnit } = useUnits();
  const data = runs.slice(-8).map((r, i) => ({
    label: `R${i + 1}`,
    distance: Number(distanceValue(r.distance).toFixed(2)),
  }));

  return (
    <motion.div
      {...fadeUp}
      transition={{ ...fadeUp.transition, delay: 0.1 }}
      className="glass-panel rounded-3xl p-5"
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-[11px] uppercase tracking-[0.18em] text-text-muted font-semibold">
            Distance per run
          </p>
          <h3 className="mt-1 text-lg font-semibold text-white">
            Recent volume
          </h3>
        </div>
      </div>
      <div className="h-40">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <defs>
              <linearGradient id="milesFill" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="#60A5FA" />
                <stop offset="100%" stopColor="#3B82F6" />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="rgba(255,255,255,0.05)" vertical={false} />
            <XAxis
              dataKey="label"
              tick={{ fill: "#71717A", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis hide />
            <Tooltip
              cursor={{ fill: "rgba(255,255,255,0.04)" }}
              contentStyle={{
                background: "rgba(17,17,28,0.95)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: 12,
                color: "#fff",
                fontSize: 12,
              }}
              formatter={(v) => [`${v} ${distanceUnit}`, "Distance"]}
            />
            <Bar dataKey="distance" fill="url(#milesFill)" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}

// ─── Feeling components ──────────────────────────────────────────────────

function FeelingSummary({ workouts }: { workouts: Workout[] }) {
  const ratings = workouts
    .filter((w) => w.status === "completed" && w.feelingRating != null)
    .map((w) => w.feelingRating as number);

  const avg = ratings.length
    ? ratings.reduce((a, b) => a + b, 0) / ratings.length
    : null;
  const face = faceForAverage(avg);
  const Icon = face?.icon ?? Heart;
  const color = face?.color ?? "#A8A8B3";

  // Distribution counts (1-5)
  const dist = [1, 2, 3, 4, 5].map(
    (r) => ratings.filter((x) => x === r).length,
  );
  const max = Math.max(1, ...dist);

  return (
    <motion.div
      {...fadeUp}
      transition={{ ...fadeUp.transition, delay: 0.15 }}
      className="glass-panel rounded-3xl p-5"
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-[11px] uppercase tracking-[0.18em] text-text-muted font-semibold">
            How you feel
          </p>
          <h3 className="mt-1 text-lg font-semibold text-white">
            {ratings.length === 0
              ? "Rate your first activity"
              : `Across ${ratings.length} workout${ratings.length === 1 ? "" : "s"}`}
          </h3>
        </div>
      </div>

      {ratings.length === 0 ? (
        <p className="text-[13px] text-text-secondary leading-relaxed">
          Tap a face when you complete an activity — your average shows up
          here as a visual snapshot of how training has felt overall.
        </p>
      ) : (
        <div className="flex items-center gap-4 min-w-0">
          {/* Big face */}
          <div
            className="relative h-20 w-20 shrink-0 rounded-3xl border flex items-center justify-center"
            style={{
              background: `radial-gradient(circle at 30% 30%, ${color}33, ${color}11)`,
              borderColor: `${color}55`,
              boxShadow: `0 0 40px ${color}33`,
            }}
          >
            <Icon className="h-10 w-10" style={{ color }} strokeWidth={2.2} />
          </div>

          {/* Distribution */}
          <div className="flex-1 min-w-0">
            <div className="flex items-baseline gap-1.5 mb-1 flex-wrap">
              <span
                className="text-2xl font-semibold tabular-nums leading-none"
                style={{ color }}
              >
                {avg!.toFixed(1)}
              </span>
              <span className="text-[11px] text-text-muted">/ 5 avg</span>
            </div>
            <p className="text-[11px] text-text-secondary mb-2 truncate">
              {face?.label}
            </p>
            <div className="space-y-1">
              {FEELING_SCALE.map((f, i) => {
                const count = dist[i];
                const pct = (count / max) * 100;
                const FaceIcon = f.icon;
                return (
                  <div
                    key={f.rating}
                    className="flex items-center gap-2 min-w-0"
                  >
                    <FaceIcon
                      className="h-3 w-3 shrink-0"
                      style={{ color: f.color }}
                    />
                    <div className="flex-1 min-w-0 h-1.5 bg-white/[0.05] rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{
                          duration: 0.9,
                          delay: 0.2 + i * 0.05,
                          ease: [0.16, 1, 0.3, 1],
                        }}
                        className="h-full rounded-full"
                        style={{ background: f.color }}
                      />
                    </div>
                    <span className="text-[10px] text-text-muted tabular-nums w-4 text-right shrink-0">
                      {count}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}

function FeelingTrend({ workouts }: { workouts: Workout[] }) {
  const rated = workouts
    .filter((w) => w.status === "completed" && w.feelingRating != null)
    .slice(-10);

  return (
    <motion.div
      {...fadeUp}
      transition={{ ...fadeUp.transition, delay: 0.2 }}
      className="glass-panel rounded-3xl p-5"
    >
      <div className="flex items-start justify-between mb-1">
        <div>
          <p className="text-[11px] uppercase tracking-[0.18em] text-text-muted font-semibold">
            Recent feelings
          </p>
          <h3 className="mt-1 text-lg font-semibold text-white">
            How each workout felt
          </h3>
        </div>
        <Sparkles className="h-4 w-4 text-accent-purple-bright" />
      </div>

      {rated.length === 0 ? (
        <p className="mt-3 text-[13px] text-text-secondary leading-relaxed">
          Your last 10 rated activities will appear here as a row of faces —
          spot patterns in your training and recovery at a glance.
        </p>
      ) : (
        <div className="mt-4 -mx-1 px-1 overflow-x-auto no-scrollbar">
          <div className="flex items-end gap-3 min-w-min">
            {rated.map((w) => {
              const face = faceForRating(w.feelingRating!);
              const Icon = face.icon;
              const d = new Date(w.date);
              const dayLabel = d.toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              });
              return (
                <div
                  key={w.id}
                  className="flex flex-col items-center gap-1 shrink-0"
                >
                  <div
                    className="h-10 w-10 rounded-2xl border flex items-center justify-center"
                    style={{
                      background: `linear-gradient(135deg, ${face.color}22, ${face.color}08)`,
                      borderColor: `${face.color}55`,
                    }}
                    title={`${face.label} — ${w.title}`}
                  >
                    <Icon
                      className="h-5 w-5"
                      style={{ color: face.color }}
                      strokeWidth={2.2}
                    />
                  </div>
                  <span className="text-[9px] text-text-muted whitespace-nowrap">
                    {dayLabel}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </motion.div>
  );
}
