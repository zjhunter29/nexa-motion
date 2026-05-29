"use client";

import { motion, AnimatePresence, Reorder } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import {
  X,
  Check,
  Sparkles,
  Save,
  Trash2,
  FileText,
  Timer,
  Mountain,
  Heart,
  Zap,
  Target,
  Trophy,
} from "lucide-react";
import { useNexaStore } from "@/lib/store";
import { vibrate, HAPTIC } from "@/lib/haptics";
import { cn } from "@/lib/utils";
import type { BuilderDraft, BuilderSegment, SavedTemplate } from "./types";
import type { WorkoutType, RunningGoal } from "@/lib/types";
import {
  emptyDraft,
  newRunSegment,
  newIntervalSegment,
  newRestSegment,
  newNoteSegment,
  estimateMinutes,
  totalDistanceMiles,
  totalWorkingSets,
  draftToWorkout,
  loadDraft,
  saveDraft,
  clearDraft,
  loadTemplates,
  saveTemplate as persistTemplate,
  deleteTemplate as removeTemplate,
  draftFromTemplate,
} from "./helpers";
import { SegmentCard } from "./segment-card";

interface WorkoutBuilderProps {
  /** Optional initial seed (e.g. from the old text-based modal). */
  initialDraft?: BuilderDraft;
  onClose: () => void;
  /** Called once the workout is scheduled. */
  onScheduled?: (date: string) => void;
}

const WORKOUT_TYPE_OPTIONS: { v: WorkoutType; label: string; icon: typeof Heart }[] = [
  { v: "easy", label: "Easy", icon: Heart },
  { v: "long", label: "Long", icon: Mountain },
  { v: "tempo", label: "Tempo", icon: Zap },
  { v: "threshold", label: "Threshold", icon: Zap },
  { v: "interval", label: "Intervals", icon: Target },
  { v: "recovery", label: "Recovery", icon: Heart },
  { v: "race", label: "Race", icon: Trophy },
];

const GOAL_OPTIONS: { v: RunningGoal; label: string }[] = [
  { v: "5k", label: "5K" },
  { v: "10k", label: "10K" },
  { v: "half", label: "Half" },
  { v: "full", label: "Marathon" },
  { v: "ultra", label: "Ultra" },
  { v: "general", label: "General" },
];

export function WorkoutBuilder({
  initialDraft,
  onClose,
  onScheduled,
}: WorkoutBuilderProps) {
  const addCustomWorkout = useNexaStore((s) => s.addCustomWorkout);
  const setPendingReview = useNexaStore((s) => s.setPendingReview);
  const [draft, setDraft] = useState<BuilderDraft>(
    () => initialDraft ?? loadDraft() ?? emptyDraft(),
  );
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved">(
    "idle",
  );
  const [templatesOpen, setTemplatesOpen] = useState(false);
  const [templates, setTemplates] = useState<SavedTemplate[]>(() =>
    loadTemplates(),
  );

  // Autosave with debounce
  useEffect(() => {
    setSaveState("saving");
    const t = setTimeout(() => {
      saveDraft(draft);
      setSaveState("saved");
    }, 400);
    return () => clearTimeout(t);
  }, [draft]);

  const duration = useMemo(
    () => estimateMinutes(draft.segments),
    [draft.segments],
  );
  const distance = useMemo(
    () => totalDistanceMiles(draft.segments),
    [draft.segments],
  );
  const setsCount = useMemo(
    () => totalWorkingSets(draft.segments),
    [draft.segments],
  );

  function patchDraft(patch: Partial<BuilderDraft>) {
    setDraft((d) => ({ ...d, ...patch }));
  }

  function updateSegment(id: string, next: BuilderSegment) {
    setDraft((d) => ({
      ...d,
      segments: d.segments.map((s) => (s.id === id ? next : s)),
    }));
  }

  function deleteSegment(id: string) {
    vibrate(HAPTIC.tap);
    setDraft((d) => ({
      ...d,
      segments: d.segments.filter((s) => s.id !== id),
    }));
  }

  function toggleCollapse(id: string) {
    setDraft((d) => ({
      ...d,
      segments: d.segments.map((s) =>
        s.id === id ? { ...s, collapsed: !s.collapsed } : s,
      ),
    }));
  }

  function addSegment(kind: BuilderSegment["kind"]) {
    vibrate(HAPTIC.select);
    const newSeg =
      kind === "run"
        ? newRunSegment(
            draft.segments.some((s) => s.category === "Warmup")
              ? "Main"
              : "Warmup",
          )
        : kind === "interval"
          ? newIntervalSegment()
          : kind === "rest"
            ? newRestSegment()
            : newNoteSegment();
    setDraft((d) => ({ ...d, segments: [...d.segments, newSeg] }));
  }

  function schedule() {
    vibrate(HAPTIC.success);
    // The store handles "find next available date" internally — we feed it
    // a marker so it converts. Use the helper directly for cleanliness.
    const workout = draftToWorkout(draft, "");
    // Cheat: re-use addCustomWorkout by passing a serialized form? Easier
    // to push directly via store's underlying API. addCustomWorkout takes
    // text and rebuilds, but we already have a structured workout.
    // Simplest: stash workout in the store via setPendingReview pattern.
    // Cleaner: just call addCustomWorkout with the rendered text fallback,
    // OR expose a new store action. For now we'll use addCustomWorkout
    // with a serialized representation so the existing slot logic runs.
    const rendered = renderDraftText(draft);
    const date = addCustomWorkout(rendered);
    clearDraft();
    onScheduled?.(date);
    void workout; // structured form retained for future direct-store path
  }

  function sendToCoach() {
    vibrate(HAPTIC.tap);
    const rendered = renderDraftText(draft);
    setPendingReview({ original: rendered });
    clearDraft();
    onClose();
    if (typeof window !== "undefined") window.location.href = "/coach";
  }

  function saveAsTemplate() {
    vibrate(HAPTIC.select);
    const t = persistTemplate(draft);
    setTemplates([t, ...templates]);
  }

  function applyTemplate(t: SavedTemplate) {
    vibrate(HAPTIC.tap);
    setDraft(draftFromTemplate(t));
    setTemplatesOpen(false);
  }

  function deleteTemplate(id: string) {
    vibrate(HAPTIC.tap);
    setTemplates(removeTemplate(id));
  }

  function bulkSetRest(restSec: number) {
    setDraft((d) => ({
      ...d,
      segments: d.segments.map((s) =>
        s.kind === "interval" ? { ...s, restSec } : s,
      ),
    }));
  }

  function duplicateSegment(id: string) {
    setDraft((d) => {
      const idx = d.segments.findIndex((s) => s.id === id);
      if (idx === -1) return d;
      const copy = { ...d.segments[idx], id: `${d.segments[idx].id}-copy` };
      const next = d.segments.slice();
      next.splice(idx + 1, 0, copy);
      return { ...d, segments: next };
    });
  }
  void duplicateSegment; // exposed for future inline action; not yet UI-wired

  const canSchedule = draft.segments.length > 0 && draft.name.trim().length > 0;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 z-[55] bg-black/60 backdrop-blur-md flex items-end sm:items-center justify-center p-3 sm:p-4"
    >
      <motion.div
        initial={{ y: 60, opacity: 0, scale: 0.96 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: 60, opacity: 0, scale: 0.96 }}
        transition={{ type: "spring", stiffness: 320, damping: 32 }}
        onClick={(e) => e.stopPropagation()}
        className="glass-panel-strong rounded-3xl w-full max-w-[520px] shadow-glass-lg max-h-[92dvh] flex flex-col overflow-hidden"
      >
        {/* Header */}
        <div className="px-5 pt-5 pb-3 flex items-start justify-between border-b border-white/8">
          <div className="min-w-0">
            <p className="text-[11px] uppercase tracking-[0.18em] text-text-muted font-semibold">
              Workout Builder
            </p>
            <input
              type="text"
              value={draft.name}
              onChange={(e) => patchDraft({ name: e.target.value })}
              placeholder="Workout name"
              className="mt-0.5 w-full bg-transparent outline-none text-xl font-semibold tracking-tight text-white placeholder-text-muted"
            />
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <SaveBadge state={saveState} />
            <button
              onClick={onClose}
              className="glass-pill h-9 w-9 rounded-full inline-flex items-center justify-center text-text-secondary hover:text-white"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Stats bar */}
        <div className="px-5 py-3 flex items-center gap-2.5 text-[11px] text-text-secondary border-b border-white/8">
          <Stat label="Duration" value={`${Math.round(duration)} min`} />
          <Stat label="Distance" value={`${distance.toFixed(1)} mi`} />
          <Stat label="Sets" value={`${setsCount}`} />
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto no-scrollbar px-5 py-4 space-y-4">
          {/* Type + goal selector */}
          <div className="grid grid-cols-2 gap-3">
            <Field label="Type">
              <select
                value={draft.type}
                onChange={(e) =>
                  patchDraft({ type: e.target.value as WorkoutType })
                }
                className="w-full bg-white/[0.04] border border-white/8 rounded-lg px-2.5 py-2 text-[12px] text-white outline-none"
              >
                {WORKOUT_TYPE_OPTIONS.map((o) => (
                  <option key={o.v} value={o.v}>
                    {o.label}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Goal">
              <select
                value={draft.goal}
                onChange={(e) => patchDraft({ goal: e.target.value })}
                className="w-full bg-white/[0.04] border border-white/8 rounded-lg px-2.5 py-2 text-[12px] text-white outline-none"
              >
                {GOAL_OPTIONS.map((o) => (
                  <option key={o.v} value={o.v}>
                    {o.label}
                  </option>
                ))}
              </select>
            </Field>
          </div>

          {/* Segments — drag to reorder */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-[11px] uppercase tracking-[0.18em] text-text-muted font-semibold">
                Segments
              </p>
              {setsCount > 0 && (
                <button
                  onClick={() => bulkSetRest(60)}
                  className="text-[10px] uppercase tracking-wider text-text-muted hover:text-white font-semibold"
                >
                  Bulk rest = 60s
                </button>
              )}
            </div>
            <Reorder.Group
              axis="y"
              values={draft.segments}
              onReorder={(segments) => patchDraft({ segments })}
              className="space-y-2"
            >
              {draft.segments.map((seg) => (
                <Reorder.Item
                  key={seg.id}
                  value={seg}
                  className="cursor-grab active:cursor-grabbing"
                >
                  <SegmentCard
                    segment={seg}
                    controls={undefined as never}
                    onChange={(next) => updateSegment(seg.id, next)}
                    onDelete={() => deleteSegment(seg.id)}
                    onToggleCollapse={() => toggleCollapse(seg.id)}
                  />
                </Reorder.Item>
              ))}
            </Reorder.Group>

            {/* Quick-add bar */}
            <div className="mt-3 grid grid-cols-4 gap-2">
              <QuickAdd
                label="Run"
                icon={Mountain}
                onClick={() => addSegment("run")}
              />
              <QuickAdd
                label="Intervals"
                icon={Target}
                onClick={() => addSegment("interval")}
              />
              <QuickAdd
                label="Rest"
                icon={Timer}
                onClick={() => addSegment("rest")}
              />
              <QuickAdd
                label="Note"
                icon={FileText}
                onClick={() => addSegment("note")}
              />
            </div>
          </div>

          {/* Templates */}
          {templates.length > 0 && (
            <div>
              <button
                onClick={() => setTemplatesOpen((v) => !v)}
                className="w-full glass-pill rounded-2xl px-3 py-2.5 text-[12px] font-semibold text-text-secondary inline-flex items-center justify-between"
              >
                <span>Templates ({templates.length})</span>
                <span className="text-text-muted">
                  {templatesOpen ? "Hide" : "Show"}
                </span>
              </button>
              <AnimatePresence>
                {templatesOpen && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="mt-2 space-y-2"
                  >
                    {templates.map((t) => (
                      <div
                        key={t.id}
                        className="flex items-center gap-2 glass-panel rounded-2xl px-3 py-2"
                      >
                        <button
                          onClick={() => applyTemplate(t)}
                          className="flex-1 text-left min-w-0"
                        >
                          <p className="text-[13px] font-semibold text-white truncate">
                            {t.name}
                          </p>
                          <p className="text-[10px] text-text-muted truncate">
                            {t.segments.length} segments
                          </p>
                        </button>
                        <button
                          onClick={() => deleteTemplate(t.id)}
                          className="glass-pill h-7 w-7 rounded-full inline-flex items-center justify-center text-text-muted hover:text-accent-red"
                          aria-label="Delete template"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="px-5 py-3 border-t border-white/8 space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={saveAsTemplate}
              disabled={draft.segments.length === 0}
              className="btn-ghost px-3 py-2.5 inline-flex items-center justify-center gap-1.5 text-[12px] font-semibold disabled:opacity-40"
            >
              <Save className="h-3.5 w-3.5" />
              Save template
            </button>
            <button
              onClick={sendToCoach}
              disabled={draft.segments.length === 0}
              className="btn-ghost px-3 py-2.5 inline-flex items-center justify-center gap-1.5 text-[12px] font-semibold disabled:opacity-40"
            >
              <Sparkles className="h-3.5 w-3.5" />
              Review with AI
            </button>
          </div>
          <motion.button
            whileTap={{ scale: 0.97 }}
            disabled={!canSchedule}
            onClick={schedule}
            className="btn-primary w-full py-3 inline-flex items-center justify-center gap-2 font-semibold text-[14px] disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Check className="h-4 w-4" strokeWidth={3} />
            Add to Calendar
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── sub-pieces ────────────────────────────────────────────────────────

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

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div
      className="flex-1 stat-tile px-2.5 py-1.5 flex items-baseline justify-between gap-2"
      style={{ minWidth: 0 }}
    >
      <span className="text-[9px] uppercase tracking-wider text-text-muted font-semibold truncate">
        {label}
      </span>
      <span className="text-[12px] font-semibold text-white tabular-nums truncate">
        {value}
      </span>
    </div>
  );
}

function QuickAdd({
  label,
  icon: Icon,
  onClick,
}: {
  label: string;
  icon: typeof Mountain;
  onClick: () => void;
}) {
  return (
    <motion.button
      whileTap={{ scale: 0.95 }}
      whileHover={{ y: -1 }}
      onClick={onClick}
      className="rounded-2xl border border-white/8 bg-white/[0.03] hover:bg-white/[0.06] px-2 py-2.5 inline-flex flex-col items-center gap-1"
    >
      <span className="inline-flex items-center justify-center h-7 w-7 rounded-xl bg-gradient-to-br from-accent-purple/30 to-accent-blue/20 border border-white/10">
        <Icon className="h-3.5 w-3.5 text-accent-purple-bright" />
      </span>
      <span className="text-[10px] font-semibold text-text-secondary uppercase tracking-wider">
        {label}
      </span>
    </motion.button>
  );
}

function SaveBadge({ state }: { state: "idle" | "saving" | "saved" }) {
  if (state === "idle") return null;
  return (
    <span
      className={cn(
        "glass-pill rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider",
        state === "saving" ? "text-text-muted" : "text-accent-green",
      )}
    >
      {state === "saving" ? "Saving…" : "Saved"}
    </span>
  );
}

// ─── helpers ───────────────────────────────────────────────────────────

/**
 * Render a draft to plain text so it can flow through addCustomWorkout +
 * AI review without needing parallel code paths.
 */
function renderDraftText(d: BuilderDraft): string {
  const out: string[] = [];
  out.push(d.name || "Custom Workout");
  if (d.goal !== "general") out.push(`Goal: ${d.goal.toUpperCase()}`);
  out.push("");
  for (const s of d.segments) {
    if (s.kind === "run") {
      const parts = [];
      if (s.distanceMiles != null) parts.push(`${s.distanceMiles} mi`);
      if (s.durationMinutes != null) parts.push(`${s.durationMinutes} min`);
      if (s.pace) parts.push(`@ ${s.pace}/mi`);
      out.push(`${s.category} — ${s.label}: ${parts.join(" ")}`.trim());
    } else if (s.kind === "interval") {
      out.push(
        `${s.category} — ${s.label}: ${s.reps} × ${s.repDistanceMeters}m${s.pace ? ` @ ${s.pace}/mi` : ""}, rest ${s.restSec}s`,
      );
    } else if (s.kind === "rest") {
      out.push(`${s.label}: ${s.durationMinutes} min`);
    } else {
      if (s.text) out.push(`${s.label}: ${s.text}`);
    }
  }
  return out.join("\n");
}
