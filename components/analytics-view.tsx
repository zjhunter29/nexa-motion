"use client";

import { motion } from "framer-motion";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  PolarAngleAxis,
  RadialBar,
  RadialBarChart,
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
  Zap,
} from "lucide-react";
import {
  cadenceTrend,
  heartRateZones,
  weeklyMileage,
  weeklyPaceTrend,
} from "@/lib/sample-data";
import { AnimatedCounter } from "./animated-counter";

const fadeUp = {
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.55, ease: [0.16, 1, 0.3, 1] as const },
};

export function AnalyticsView() {
  const consistency = 86;
  const recovery = 78;

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

      {/* Top KPI cards */}
      <motion.div
        {...fadeUp}
        transition={{ ...fadeUp.transition, delay: 0.05 }}
        className="grid grid-cols-2 gap-3"
      >
        <KpiCard
          icon={Activity}
          label="Weekly miles"
          value={28}
          decimals={1}
          suffix=" mi"
          delta="+12%"
          accent="#C084FC"
        />
        <KpiCard
          icon={Heart}
          label="Avg HR"
          value={152}
          suffix=" bpm"
          delta="-3%"
          accent="#EC4899"
        />
        <KpiCard
          icon={Footprints}
          label="Cadence"
          value={179}
          suffix=" spm"
          delta="+2%"
          accent="#60A5FA"
        />
        <KpiCard
          icon={Mountain}
          label="Elevation"
          value={2840}
          suffix=" ft"
          delta="+18%"
          accent="#10B981"
        />
      </motion.div>

      {/* Pace trend */}
      <motion.div
        {...fadeUp}
        transition={{ ...fadeUp.transition, delay: 0.1 }}
        className="glass-panel rounded-3xl p-5"
      >
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-[11px] uppercase tracking-[0.18em] text-text-muted font-semibold">
              Pace trend
            </p>
            <h3 className="mt-1 text-lg font-semibold text-white">
              You're getting faster
            </h3>
          </div>
          <span className="inline-flex items-center gap-1 text-[12px] font-semibold text-accent-green">
            <TrendingDown className="h-3.5 w-3.5" />
            -10%
          </span>
        </div>
        <div className="h-44">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={weeklyPaceTrend}>
              <defs>
                <linearGradient id="paceFill" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="#C084FC" stopOpacity={0.5} />
                  <stop offset="100%" stopColor="#C084FC" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis
                dataKey="week"
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

      {/* Mileage bars */}
      <motion.div
        {...fadeUp}
        transition={{ ...fadeUp.transition, delay: 0.15 }}
        className="glass-panel rounded-3xl p-5"
      >
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-[11px] uppercase tracking-[0.18em] text-text-muted font-semibold">
              Weekly mileage
            </p>
            <h3 className="mt-1 text-lg font-semibold text-white">
              28 miles this week
            </h3>
          </div>
        </div>
        <div className="h-40">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={weeklyMileage}>
              <defs>
                <linearGradient id="milesFill" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="#60A5FA" />
                  <stop offset="100%" stopColor="#3B82F6" />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis
                dataKey="week"
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
              <Bar
                dataKey="miles"
                fill="url(#milesFill)"
                radius={[8, 8, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* HR zones */}
      <motion.div
        {...fadeUp}
        transition={{ ...fadeUp.transition, delay: 0.2 }}
        className="glass-panel rounded-3xl p-5"
      >
        <p className="text-[11px] uppercase tracking-[0.18em] text-text-muted font-semibold mb-1">
          Heart-rate zones
        </p>
        <h3 className="text-lg font-semibold text-white mb-4">
          Time in zone this week
        </h3>
        <div className="space-y-2.5">
          {heartRateZones.map((z) => {
            const total = heartRateZones.reduce((a, b) => a + b.minutes, 0);
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

      {/* Recovery + Consistency rings */}
      <motion.div
        {...fadeUp}
        transition={{ ...fadeUp.transition, delay: 0.25 }}
        className="grid grid-cols-2 gap-3"
      >
        <RingCard label="Recovery" value={recovery} color="#10B981" />
        <RingCard label="Consistency" value={consistency} color="#C084FC" />
      </motion.div>

      {/* Cadence */}
      <motion.div
        {...fadeUp}
        transition={{ ...fadeUp.transition, delay: 0.3 }}
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
            <LineChart data={cadenceTrend}>
              <CartesianGrid stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis
                dataKey="day"
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
    </div>
  );
}

interface KpiProps {
  icon: typeof Activity;
  label: string;
  value: number;
  decimals?: number;
  suffix?: string;
  delta?: string;
  accent: string;
}

function KpiCard({ icon: Icon, label, value, decimals, suffix, delta, accent }: KpiProps) {
  return (
    <div className="stat-tile p-4">
      <div className="flex items-center justify-between mb-2">
        <Icon className="h-4 w-4" style={{ color: accent }} />
        {delta && (
          <span className="text-[11px] font-semibold text-accent-green">
            {delta}
          </span>
        )}
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

function RingCard({ label, value, color }: { label: string; value: number; color: string }) {
  const data = [{ name: label, value, fill: color }];
  return (
    <div className="glass-panel rounded-3xl p-4">
      <p className="text-[11px] uppercase tracking-[0.18em] text-text-muted font-semibold">
        {label}
      </p>
      <div className="relative h-32 mt-1">
        <ResponsiveContainer width="100%" height="100%">
          <RadialBarChart
            innerRadius="70%"
            outerRadius="100%"
            data={data}
            startAngle={90}
            endAngle={-270}
          >
            <PolarAngleAxis
              type="number"
              domain={[0, 100]}
              tick={false}
            />
            <RadialBar
              background={{ fill: "rgba(255,255,255,0.05)" } as object}
              dataKey="value"
              cornerRadius={20}
            >
              <Cell fill={color} />
            </RadialBar>
          </RadialBarChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-semibold text-white tabular-nums">
            <AnimatedCounter value={value} suffix="%" />
          </span>
        </div>
      </div>
    </div>
  );
}
