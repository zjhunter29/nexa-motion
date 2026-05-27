"use client";

import { motion } from "framer-motion";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Activity,
  Heart,
  Footprints,
  TrendingDown,
  Mountain,
  BarChart3,
} from "lucide-react";
import Link from "next/link";
import { useNexaStore } from "@/lib/store";
import { AnimatedCounter } from "./animated-counter";
import { useMemo } from "react";

const fadeUp = {
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.55, ease: [0.16, 1, 0.3, 1] as const },
};

export function AnalyticsView() {
  const completedRuns = useNexaStore((s) => s.completedRuns);
  const hasGeneratedPlan = useNexaStore((s) => s.profile.hasGeneratedPlan);

  // Derive real values from completed runs.
  const totals = useMemo(() => {
    const totalDistance = completedRuns.reduce((a, r) => a + r.distance, 0);
    const totalSeconds = completedRuns.reduce((a, r) => a + r.durationSec, 0);
    const totalElevation = completedRuns.reduce(
      (a, r) => a + r.elevationGain,
      0,
    );
    const avgHr =
      completedRuns.length > 0
        ? Math.round(
            completedRuns.reduce((a, r) => a + r.avgHeartRate, 0) /
              completedRuns.length,
          )
        : 0;
    const avgCadence =
      completedRuns.length > 0
        ? Math.round(
            completedRuns.reduce((a, r) => a + r.cadence, 0) /
              completedRuns.length,
          )
        : 0;
    return {
      totalDistance,
      totalSeconds,
      totalElevation,
      avgHr,
      avgCadence,
    };
  }, [completedRuns]);

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
        body="Your charts will populate the moment you mark an activity complete. Pace, distance, heart-rate zones, cadence — all driven by your real data."
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

      <motion.div
        {...fadeUp}
        transition={{ ...fadeUp.transition, delay: 0.05 }}
        className="grid grid-cols-2 gap-3"
      >
        <KpiCard
          icon={Activity}
          label="Total miles"
          value={totals.totalDistance}
          decimals={1}
          suffix=" mi"
          accent="#C084FC"
        />
        <KpiCard
          icon={Heart}
          label="Avg HR"
          value={totals.avgHr}
          suffix=" bpm"
          accent="#EC4899"
        />
        <KpiCard
          icon={Footprints}
          label="Avg cadence"
          value={totals.avgCadence}
          suffix=" spm"
          accent="#60A5FA"
        />
        <KpiCard
          icon={Mountain}
          label="Elevation"
          value={Math.round(totals.totalElevation)}
          suffix=" ft"
          accent="#10B981"
        />
      </motion.div>

      <PaceTrend runs={completedRuns} />
      <MileageBars runs={completedRuns} />
      <HRZones runs={completedRuns} />
      <Cadence runs={completedRuns} />
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

      <div className="mt-4 grid grid-cols-2 gap-3">
        <SkeletonStat label="Total miles" />
        <SkeletonStat label="Avg pace" />
        <SkeletonStat label="Avg HR" />
        <SkeletonStat label="Cadence" />
      </div>
    </div>
  );
}

function SkeletonStat({ label }: { label: string }) {
  return (
    <div className="stat-tile p-4">
      <div className="text-[11px] uppercase tracking-wider text-text-muted font-medium mb-2">
        {label}
      </div>
      <div className="h-6 w-16 rounded bg-white/[0.05]" />
      <div className="mt-2 h-1 w-full rounded-full bg-white/[0.04]" />
    </div>
  );
}

function PaceTrend({
  runs,
}: {
  runs: ReturnType<typeof useNexaStore.getState>["completedRuns"];
}) {
  const data = runs
    .slice(-8)
    .map((r, i) => ({ label: `R${i + 1}`, pace: Number(r.avgPaceMinMile.toFixed(2)) }));

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
              formatter={(v) => [`${v} min/mi`, "Pace"]}
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
  const data = runs.slice(-8).map((r, i) => ({
    label: `R${i + 1}`,
    miles: Number(r.distance.toFixed(1)),
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
              formatter={(v) => [`${v} mi`, "Miles"]}
            />
            <Bar dataKey="miles" fill="url(#milesFill)" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}

function HRZones({
  runs,
}: {
  runs: ReturnType<typeof useNexaStore.getState>["completedRuns"];
}) {
  // Approximate zone time from avg HR + duration per run.
  const zones = [
    { zone: "Z1", color: "#10B981", minutes: 0 },
    { zone: "Z2", color: "#3B82F6", minutes: 0 },
    { zone: "Z3", color: "#A855F7", minutes: 0 },
    { zone: "Z4", color: "#EC4899", minutes: 0 },
    { zone: "Z5", color: "#EF4444", minutes: 0 },
  ];
  for (const r of runs) {
    const m = Math.round(r.durationSec / 60);
    const hr = r.avgHeartRate;
    const idx =
      hr < 130 ? 0 : hr < 150 ? 1 : hr < 165 ? 2 : hr < 180 ? 3 : 4;
    zones[idx].minutes += m;
  }
  const total = zones.reduce((a, z) => a + z.minutes, 0) || 1;

  return (
    <motion.div
      {...fadeUp}
      transition={{ ...fadeUp.transition, delay: 0.15 }}
      className="glass-panel rounded-3xl p-5"
    >
      <p className="text-[11px] uppercase tracking-[0.18em] text-text-muted font-semibold mb-1">
        Heart-rate zones
      </p>
      <h3 className="text-lg font-semibold text-white mb-4">Time in zone</h3>
      <div className="space-y-2.5">
        {zones.map((z) => {
          const pct = (z.minutes / total) * 100;
          return (
            <div key={z.zone}>
              <div className="flex items-center justify-between text-[12px] mb-1.5">
                <span className="font-semibold text-white">{z.zone}</span>
                <span className="text-text-secondary tabular-nums">
                  {z.minutes}m
                </span>
              </div>
              <div className="h-2 rounded-full bg-white/[0.04] overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{
                    duration: 1.2,
                    delay: 0.2,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                  className="h-full rounded-full"
                  style={{ background: z.color }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}

function Cadence({
  runs,
}: {
  runs: ReturnType<typeof useNexaStore.getState>["completedRuns"];
}) {
  const data = runs.slice(-7).map((r, i) => ({
    label: `R${i + 1}`,
    cadence: r.cadence,
  }));

  return (
    <motion.div
      {...fadeUp}
      transition={{ ...fadeUp.transition, delay: 0.2 }}
      className="glass-panel rounded-3xl p-5"
    >
      <p className="text-[11px] uppercase tracking-[0.18em] text-text-muted font-semibold mb-1">
        Cadence
      </p>
      <h3 className="text-lg font-semibold text-white mb-4">
        Steps per minute
      </h3>
      <div className="h-36">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid stroke="rgba(255,255,255,0.05)" vertical={false} />
            <XAxis
              dataKey="label"
              tick={{ fill: "#71717A", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis hide domain={[150, 200]} />
            <Tooltip
              contentStyle={{
                background: "rgba(17,17,28,0.95)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: 12,
                color: "#fff",
                fontSize: 12,
              }}
              formatter={(v) => [`${v} spm`, "Cadence"]}
            />
            <Line
              type="monotone"
              dataKey="cadence"
              stroke="#06B6D4"
              strokeWidth={2.5}
              dot={{ fill: "#06B6D4", r: 4, strokeWidth: 0 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}

interface KpiProps {
  icon: typeof Activity;
  label: string;
  value: number;
  decimals?: number;
  suffix?: string;
  accent: string;
}

function KpiCard({
  icon: Icon,
  label,
  value,
  decimals,
  suffix,
  accent,
}: KpiProps) {
  return (
    <div className="stat-tile p-4">
      <div className="flex items-center justify-between mb-2">
        <Icon className="h-4 w-4" style={{ color: accent }} />
      </div>
      <div className="text-[11px] uppercase tracking-wider text-text-muted font-medium">
        {label}
      </div>
      <div className="mt-0.5 text-xl font-semibold text-white tabular-nums">
        <AnimatedCounter
          value={value}
          decimals={decimals ?? 0}
          suffix={suffix ?? ""}
        />
      </div>
    </div>
  );
}
