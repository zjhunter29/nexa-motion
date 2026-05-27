"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  Play,
  Flame,
  Snowflake,
  Target,
  MapPin,
  Timer,
  Repeat,
  Activity as ActivityIcon,
  CheckCircle2,
  CalendarX,
  ChevronRight,
} from "lucide-react";
import { useMemo, useState } from "react";
import { GlassCard } from "./glass-card";
import { CancelMenu } from "./cancel-modal";
import { useNexaStore } from "@/lib/store";
import { cn, formatDistance } from "@/lib/utils";
import type { Workout, WorkoutSegment } from "@/lib/types";

interface WorkoutCardProps {
  workout: Workout;
  variant?: "primary" | "secondary";
}

const SEGMENT_ICONS = {
  Warmup: Flame,
  "Main Workout": Target,
  Cooldown: Snowflake,
  "Cooldown & Recovery": Snowflake,
} as const;

function pickIcon(label: string) {
  if (label.toLowerCase().includes("warm")) return Flame;
  if (label.toLowerCase().includes("cool") || label.toLowerCase().includes("recovery"))
    return Snowflake;
  return Target;
}

function SegmentRow({
  segment,
  accent,
}: {
  segment: WorkoutSegment;
  accent: string;
}) {
  const Icon = pickIcon(segment.label);

  const lines = useMemo(() => {
    const out: { icon: typeof Icon; text: string }[] = [];
    if (segment.distanceMiles != null) {
      out.push({
        icon: ActivityIcon,
        text: `Distance: ${formatDistance(segment.distanceMiles)}`,
      });
    }
    if (segment.reps != null && segment.repDistanceMeters != null) {
      out.push({
        icon: Repeat,
        text: `${segment.reps} reps × ${segment.repDistanceMeters}m`,
      });
    }
    if (segment.location) {
      out.push({ icon: MapPin, text: `Location: ${segment.location}` });
    }
    if (segment.trainingFocus) {
      out.push({ icon: Target, text: `Focus: ${segment.trainingFocus}` });
    }
    if (segment.restSec != null) {
      out.push({ icon: Timer, text: `Rest: ${segment.restSec}s / rep` });
    }
    if (segment.targetHr != null) {
      const hr = Array.isArray(segment.targetHr)
        ? `${segment.targetHr[0]}–${segment.targetHr[1]}`
        : `${segment.targetHr}`;
      out.push({ icon: ActivityIcon, text: `Target HR: ${hr} bpm` });
    }
    if (segment.pace) {
      out.push({ icon: Timer, text: `Pace: ${segment.pace}/mi` });
    }
    if (segment.notes) {
      out.push({ icon: Snowflake, text: segment.notes });
    }
    return out;
  }, [segment]);

  return (
    <div className="relative">
      <div className="flex items-center gap-2.5 mb-2">
        <span
          className="inline-flex items-center justify-center h-7 w-7 rounded-xl border"
          style={{
            background: `linear-gradient(135deg, ${accent}26, ${accent}0D)`,
            borderColor: `${accent}40`,
          }}
        >
          <Icon className="h-3.5 w-3.5" style={{ color: accent }} />
        </span>
        <h4 className="text-[13px] font-semibold tracking-wide text-white">
          {segment.label}
        </h4>
      </div>
      <ul className="space-y-1.5 pl-9">
        {lines.map((line, i) => (
          <li
            key={i}
            className="text-[13px] text-text-secondary leading-snug flex items-baseline gap-2"
          >
            <span className="inline-block h-1 w-1 rounded-full bg-text-muted mt-2 shrink-0" />
            <span>{line.text}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function WorkoutCard({ workout, variant = "primary" }: WorkoutCardProps) {
  const [cancelOpen, setCancelOpen] = useState(false);
  const [showCancelToast, setShowCancelToast] = useState(false);
  const cancelWorkout = useNexaStore((s) => s.cancelWorkout);
  const uncancelWorkout = useNexaStore((s) => s.uncancelWorkout);
  const completeWorkout = useNexaStore((s) => s.completeWorkout);

  const isCancelled = workout.status === "cancelled";
  const isCompleted = workout.status === "completed";
  const isRestDay = workout.type === "rest";

  const accent =
    variant === "primary" ? "#C084FC" : "rgba(255, 255, 255, 0.55)";

  const titleLabel =
    variant === "primary"
      ? "Today's Workout"
      : isCompleted
        ? "Yesterday's Run"
        : "Upcoming";

  if (isRestDay) {
    return (
      <GlassCard
        variant={variant === "primary" ? "glow" : "default"}
        className="mx-5 mb-4 p-6"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="flex items-center justify-between">
          <span className="text-[11px] uppercase tracking-[0.18em] text-text-muted font-semibold">
            {titleLabel}
          </span>
        </div>
        <div className="mt-5 flex flex-col items-center text-center py-6">
          <div className="h-14 w-14 rounded-2xl glass-pill flex items-center justify-center mb-3">
            <Snowflake className="h-6 w-6 text-accent-blue-bright" />
          </div>
          <h3 className="text-xl font-semibold text-white">
            Nothing planned for today
          </h3>
          <p className="mt-1.5 text-sm text-text-secondary text-balance max-w-[260px]">
            Today is a planned rest day. Recovery is part of the work.
          </p>
        </div>
      </GlassCard>
    );
  }

  return (
    <>
      <GlassCard
        variant={variant === "primary" ? "glow" : "default"}
        shine={variant === "primary" && !isCancelled}
        className={cn(
          "mx-5 mb-4 p-6",
          isCancelled && "opacity-60",
          variant === "secondary" && "opacity-80",
        )}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <span className="text-[11px] uppercase tracking-[0.18em] text-text-muted font-semibold">
              {titleLabel}
            </span>
            <h3 className="mt-1.5 text-[22px] font-semibold tracking-tight text-white">
              {workout.title}
            </h3>
          </div>
          <div className="flex items-center gap-1.5">
            {isCancelled ? (
              <motion.button
                whileTap={{ scale: 0.92 }}
                onClick={() => uncancelWorkout(workout.id)}
                className="glass-pill h-9 w-9 rounded-full inline-flex items-center justify-center text-text-secondary hover:text-white"
                aria-label="Reschedule workout"
              >
                <CalendarX className="h-4 w-4" />
              </motion.button>
            ) : !isCompleted && variant === "primary" ? (
              <motion.button
                whileTap={{ scale: 0.92 }}
                whileHover={{ scale: 1.04 }}
                onClick={() => setCancelOpen((v) => !v)}
                className="glass-pill h-9 w-9 rounded-full inline-flex items-center justify-center text-text-secondary hover:text-white"
                aria-label="Cancel workout"
              >
                <CalendarX className="h-4 w-4" />
              </motion.button>
            ) : isCompleted ? (
              <span className="glass-pill h-9 px-3 rounded-full inline-flex items-center gap-1.5 text-[11px] text-accent-green font-semibold">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Done
              </span>
            ) : null}
          </div>
        </div>

        {/* Motivation */}
        {workout.motivation && variant === "primary" && !isCancelled && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mb-4 p-3 rounded-2xl bg-gradient-to-br from-accent-purple/10 to-accent-blue/5 border border-white/5"
          >
            <p className="text-[13px] text-text-secondary leading-relaxed text-balance italic">
              "{workout.motivation}"
            </p>
          </motion.div>
        )}

        {/* Segments */}
        {!isCancelled && (
          <div className="space-y-5">
            {workout.warmup && (
              <SegmentRow segment={workout.warmup} accent="#FB923C" />
            )}
            {workout.warmup && <div className="hairline" />}
            <SegmentRow segment={workout.main} accent={accent} />
            {workout.cooldown && <div className="hairline" />}
            {workout.cooldown && (
              <SegmentRow segment={workout.cooldown} accent="#60A5FA" />
            )}
          </div>
        )}

        {isCancelled && (
          <div className="text-center py-4">
            <p className="text-sm text-text-secondary mb-1">
              Run cancelled — life happens.
            </p>
            <p className="text-xs text-text-muted">
              Tap the icon above to reinstate.
            </p>
          </div>
        )}

        {/* Action button */}
        {variant === "primary" && !isCancelled && !isCompleted && (
          <motion.button
            whileTap={{ scale: 0.97 }}
            whileHover={{ y: -1 }}
            onClick={() => {
              completeWorkout(workout.id);
            }}
            className="btn-primary w-full mt-6 py-3.5 inline-flex items-center justify-center gap-2 font-semibold text-[14px]"
          >
            <Play className="h-4 w-4 fill-current" />
            Start Run
            <ChevronRight className="h-4 w-4 opacity-70" />
          </motion.button>
        )}
      </GlassCard>

      <AnimatePresence>
        {cancelOpen && (
          <CancelMenu
            workoutId={workout.id}
            onClose={() => setCancelOpen(false)}
            onCancelled={() => {
              setCancelOpen(false);
              setShowCancelToast(true);
              setTimeout(() => setShowCancelToast(false), 2800);
              cancelWorkout; // referenced
            }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showCancelToast && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.96 }}
            transition={{ type: "spring", stiffness: 260, damping: 22 }}
            className="fixed left-1/2 -translate-x-1/2 bottom-28 z-50 glass-panel-strong rounded-2xl px-5 py-3 max-w-[320px] text-center shadow-glass-lg"
          >
            <p className="text-sm font-medium text-white">Life happens!</p>
            <p className="text-xs text-text-secondary mt-0.5">
              Hope to see you tomorrow.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
