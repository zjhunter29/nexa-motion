"use client";

import { motion, type Reorder } from "framer-motion";
import {
  ChevronDown,
  ChevronUp,
  Trash2,
  GripVertical,
  Flame,
  Snowflake,
  Target,
  Repeat,
  StickyNote,
  Timer,
} from "lucide-react";
import { useState } from "react";
import type { BuilderSegment } from "./types";
import { estimateSegmentMinutes } from "./helpers";
import { cn } from "@/lib/utils";

interface SegmentCardProps {
  segment: BuilderSegment;
  controls: Parameters<typeof Reorder.Item>[0]["dragControls"] extends infer C
    ? C
    : never;
  onChange: (next: BuilderSegment) => void;
  onDelete: () => void;
  onToggleCollapse: () => void;
}

function pickCategoryIcon(category: string) {
  const c = category.toLowerCase();
  if (c.includes("warm")) return Flame;
  if (c.includes("cool")) return Snowflake;
  if (c.includes("interval")) return Repeat;
  if (c.includes("tempo") || c.includes("threshold")) return Target;
  if (c.includes("recovery") || c.includes("rest")) return Timer;
  return Target;
}

export function SegmentCard({
  segment,
  onChange,
  onDelete,
  onToggleCollapse,
}: SegmentCardProps) {
  const Icon =
    segment.kind === "note"
      ? StickyNote
      : segment.kind === "rest"
        ? Timer
        : pickCategoryIcon(segment.category);
  const accent =
    segment.kind === "rest"
      ? "#71717A"
      : segment.kind === "note"
        ? "#A8A8B3"
        : segment.category.toLowerCase().includes("warm")
          ? "#FB923C"
          : segment.category.toLowerCase().includes("cool")
            ? "#60A5FA"
            : segment.category.toLowerCase().includes("interval")
              ? "#EF4444"
              : segment.category.toLowerCase().includes("tempo")
                ? "#F59E0B"
                : "#C084FC";
  const collapsed = segment.collapsed;
  const estimate = estimateSegmentMinutes(segment);

  return (
    <div
      className="glass-panel rounded-2xl overflow-hidden"
      style={{ borderColor: `${accent}33` }}
    >
      <div className="flex items-center gap-2 px-3 py-2.5">
        <button
          onPointerDown={(e) => {
            // The Reorder.Item provides drag via its own pointer handling on the wrapper;
            // this grip just signals affordance — actual drag is on the whole row.
            e.preventDefault();
          }}
          className="touch-none cursor-grab active:cursor-grabbing text-text-muted hover:text-white shrink-0"
          aria-label="Drag to reorder"
        >
          <GripVertical className="h-4 w-4" />
        </button>
        <span
          className="inline-flex items-center justify-center h-8 w-8 rounded-xl border shrink-0"
          style={{
            background: `linear-gradient(135deg, ${accent}33, ${accent}11)`,
            borderColor: `${accent}55`,
          }}
        >
          <Icon className="h-3.5 w-3.5" style={{ color: accent }} />
        </span>
        <input
          type="text"
          value={segment.label}
          onChange={(e) => onChange({ ...segment, label: e.target.value })}
          className="flex-1 min-w-0 bg-transparent outline-none text-[14px] font-semibold text-white placeholder-text-muted"
          placeholder="Segment name"
        />
        {estimate > 0 && (
          <span className="text-[10px] uppercase tracking-wider text-text-muted font-semibold tabular-nums whitespace-nowrap">
            ~{Math.round(estimate)}m
          </span>
        )}
        <button
          onClick={onToggleCollapse}
          className="glass-pill h-7 w-7 rounded-full inline-flex items-center justify-center text-text-secondary"
          aria-label={collapsed ? "Expand" : "Collapse"}
        >
          {collapsed ? (
            <ChevronDown className="h-3.5 w-3.5" />
          ) : (
            <ChevronUp className="h-3.5 w-3.5" />
          )}
        </button>
        <button
          onClick={onDelete}
          className="glass-pill h-7 w-7 rounded-full inline-flex items-center justify-center text-text-secondary hover:text-accent-red"
          aria-label="Delete segment"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>

      {!collapsed && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.2 }}
          className="border-t border-white/8 px-3 py-3 space-y-2.5"
        >
          {/* Category selector */}
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase tracking-wider text-text-muted font-semibold w-16 shrink-0">
              Section
            </span>
            <select
              value={segment.category}
              onChange={(e) =>
                onChange({ ...segment, category: e.target.value })
              }
              className="flex-1 bg-white/[0.04] border border-white/8 rounded-lg px-2.5 py-1.5 text-[12px] text-white outline-none"
            >
              {[
                "Warmup",
                "Main",
                "Tempo",
                "Intervals",
                "Recovery",
                "Cooldown",
                "Custom",
              ].map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Kind-specific fields */}
          {segment.kind === "run" && (
            <div className="grid grid-cols-2 gap-2">
              <Field label="Distance (mi)">
                <NumberInput
                  value={segment.distanceMiles ?? null}
                  step={0.1}
                  onChange={(v) =>
                    onChange({ ...segment, distanceMiles: v ?? undefined })
                  }
                  placeholder="3.0"
                />
              </Field>
              <Field label="Pace (/mi)">
                <input
                  type="text"
                  value={segment.pace ?? ""}
                  onChange={(e) =>
                    onChange({ ...segment, pace: e.target.value || undefined })
                  }
                  placeholder="8'30"
                  className="w-full bg-white/[0.04] border border-white/8 rounded-lg px-2.5 py-1.5 text-[12px] text-white outline-none"
                />
              </Field>
              <Field label="HR low">
                <NumberInput
                  value={segment.targetHrLow ?? null}
                  onChange={(v) =>
                    onChange({ ...segment, targetHrLow: v ?? undefined })
                  }
                  placeholder="140"
                />
              </Field>
              <Field label="HR high">
                <NumberInput
                  value={segment.targetHrHigh ?? null}
                  onChange={(v) =>
                    onChange({ ...segment, targetHrHigh: v ?? undefined })
                  }
                  placeholder="160"
                />
              </Field>
            </div>
          )}

          {segment.kind === "interval" && (
            <div className="grid grid-cols-2 gap-2">
              <Field label="Reps">
                <NumberInput
                  value={segment.reps}
                  onChange={(v) =>
                    onChange({ ...segment, reps: v ?? 1 })
                  }
                />
              </Field>
              <Field label="Distance (m)">
                <NumberInput
                  value={segment.repDistanceMeters}
                  step={50}
                  onChange={(v) =>
                    onChange({ ...segment, repDistanceMeters: v ?? 400 })
                  }
                />
              </Field>
              <Field label="Pace (/mi)">
                <input
                  type="text"
                  value={segment.pace ?? ""}
                  onChange={(e) =>
                    onChange({ ...segment, pace: e.target.value || undefined })
                  }
                  placeholder="5'30"
                  className="w-full bg-white/[0.04] border border-white/8 rounded-lg px-2.5 py-1.5 text-[12px] text-white outline-none"
                />
              </Field>
              <Field label="Rest (sec)">
                <NumberInput
                  value={segment.restSec}
                  onChange={(v) =>
                    onChange({ ...segment, restSec: v ?? 60 })
                  }
                />
              </Field>
            </div>
          )}

          {segment.kind === "rest" && (
            <Field label="Duration (min)">
              <NumberInput
                value={segment.durationMinutes}
                onChange={(v) =>
                  onChange({ ...segment, durationMinutes: v ?? 1 })
                }
              />
            </Field>
          )}

          {segment.kind === "note" && (
            <textarea
              value={segment.text}
              onChange={(e) => onChange({ ...segment, text: e.target.value })}
              rows={2}
              placeholder="Notes…"
              className="w-full bg-white/[0.04] border border-white/8 rounded-lg px-2.5 py-1.5 text-[12px] text-white outline-none resize-none"
            />
          )}
        </motion.div>
      )}
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wider text-text-muted font-semibold mb-1">
        {label}
      </div>
      {children}
    </div>
  );
}

function NumberInput({
  value,
  step = 1,
  onChange,
  placeholder,
}: {
  value: number | null;
  step?: number;
  onChange: (v: number | null) => void;
  placeholder?: string;
}) {
  return (
    <input
      type="number"
      inputMode="decimal"
      step={step}
      value={value ?? ""}
      placeholder={placeholder}
      onChange={(e) => {
        const raw = e.target.value;
        if (raw === "") return onChange(null);
        const n = Number(raw);
        if (Number.isFinite(n)) onChange(n);
      }}
      className={cn(
        "w-full bg-white/[0.04] border border-white/8 rounded-lg px-2.5 py-1.5",
        "text-[12px] text-white outline-none tabular-nums",
      )}
    />
  );
}
