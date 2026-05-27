"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  Bell,
  Ruler,
  Target as TargetIcon,
  RefreshCw,
  Info,
  ChevronRight,
  Sparkles,
  HeartPulse,
  Calendar as CalendarIcon,
  LogOut,
  Activity,
  Scale,
  Cake,
  Mountain,
  X,
  Check,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import { useNexaStore } from "@/lib/store";
import { generatePlan } from "@/lib/plan-generator";
import { cn } from "@/lib/utils";
import type {
  ActivityLevel,
  Experience,
  FitnessLevel,
  RunningGoal,
  UserProfile,
} from "@/lib/types";

interface Row {
  icon: typeof User;
  label: string;
  value?: string;
  toggle?: { on: boolean; onChange: (v: boolean) => void };
  onClick?: () => void;
  destructive?: boolean;
  accent?: string;
}

interface Group {
  title: string;
  rows: Row[];
}

const fadeUp = {
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.55, ease: [0.16, 1, 0.3, 1] as const },
};

export function SettingsView() {
  const profile = useNexaStore((s) => s.profile);
  const updateProfile = useNexaStore((s) => s.updateProfile);
  const setPlan = useNexaStore((s) => s.setPlan);
  const clearPlan = useNexaStore((s) => s.clearPlan);

  const [notifs, setNotifs] = useState(true);
  const [reminders, setReminders] = useState(true);
  const [hapticEnabled, setHapticEnabled] = useState(true);

  const [editor, setEditor] = useState<EditorField | null>(null);

  function regenerate() {
    if (!profile.hasGeneratedPlan) {
      const plan = generatePlan(profile);
      setPlan(plan);
      return;
    }
    if (
      window.confirm(
        "Regenerate your plan? This will replace your current 2-week schedule with a fresh one calibrated to your current profile. Completed activities are preserved.",
      )
    ) {
      const plan = generatePlan(profile);
      setPlan(plan);
    }
  }

  const heightDisplay =
    profile.heightIn != null
      ? `${Math.floor(profile.heightIn / 12)}'${profile.heightIn % 12}"`
      : "—";

  const groups: Group[] = [
    {
      title: "Personal Information",
      rows: [
        {
          icon: User,
          label: "Name",
          value: profile.name || "—",
          accent: "#C084FC",
          onClick: () => setEditor({ kind: "name" }),
        },
        {
          icon: Cake,
          label: "Age",
          value: profile.age ? `${profile.age} yrs` : "—",
          accent: "#F59E0B",
          onClick: () => setEditor({ kind: "age" }),
        },
        {
          icon: Mountain,
          label: "Height",
          value: heightDisplay,
          accent: "#60A5FA",
          onClick: () => setEditor({ kind: "height" }),
        },
        {
          icon: Scale,
          label: "Weight",
          value: profile.weightLb ? `${profile.weightLb} lb` : "—",
          accent: "#10B981",
          onClick: () => setEditor({ kind: "weight" }),
        },
      ],
    },
    {
      title: "Training Profile",
      rows: [
        {
          icon: HeartPulse,
          label: "Fitness level",
          value: profile.fitnessLevel,
          accent: "#EC4899",
          onClick: () => setEditor({ kind: "fitnessLevel" }),
        },
        {
          icon: Activity,
          label: "Experience",
          value: `${profile.experience} yrs`,
          accent: "#A855F7",
          onClick: () => setEditor({ kind: "experience" }),
        },
        {
          icon: TargetIcon,
          label: "Goal",
          value: profile.goal.toUpperCase(),
          accent: "#60A5FA",
          onClick: () => setEditor({ kind: "goal" }),
        },
        {
          icon: Activity,
          label: "Activity level",
          value: profile.activityLevel.replace("_", " "),
          accent: "#06B6D4",
          onClick: () => setEditor({ kind: "activityLevel" }),
        },
        {
          icon: CalendarIcon,
          label: "Training days",
          value: `${profile.trainingDays.length} per week`,
          accent: "#F59E0B",
          onClick: () => setEditor({ kind: "trainingDays" }),
        },
        {
          icon: HeartPulse,
          label: "Injury history",
          value:
            profile.injuryHistory.length > 0
              ? `${profile.injuryHistory.length} flagged`
              : "None",
          accent: "#EF4444",
          onClick: () => setEditor({ kind: "injuries" }),
        },
      ],
    },
    {
      title: "Training Plan",
      rows: [
        {
          icon: Sparkles,
          label: profile.hasGeneratedPlan ? "Regenerate plan" : "Generate plan",
          accent: "#C084FC",
          onClick: regenerate,
        },
        ...(profile.hasGeneratedPlan
          ? [
              {
                icon: Trash2,
                label: "Clear current plan",
                accent: "#A8A8B3",
                onClick: () => {
                  if (
                    window.confirm(
                      "Clear your current plan and completed-run history? This returns you to a clean slate.",
                    )
                  ) {
                    clearPlan();
                  }
                },
              },
            ]
          : []),
      ],
    },
    {
      title: "Preferences",
      rows: [
        {
          icon: Ruler,
          label: "Units",
          value:
            profile.preferredUnits === "imperial"
              ? "Imperial (mi)"
              : "Metric (km)",
          accent: "#10B981",
          onClick: () =>
            updateProfile({
              preferredUnits:
                profile.preferredUnits === "imperial" ? "metric" : "imperial",
            }),
        },
      ],
    },
    {
      title: "Notifications",
      rows: [
        {
          icon: Bell,
          label: "Push notifications",
          toggle: { on: notifs, onChange: setNotifs },
          accent: "#C084FC",
        },
        {
          icon: Sparkles,
          label: "Daily AI reminder",
          toggle: { on: reminders, onChange: setReminders },
          accent: "#60A5FA",
        },
        {
          icon: HeartPulse,
          label: "Haptic feedback",
          toggle: { on: hapticEnabled, onChange: setHapticEnabled },
          accent: "#EC4899",
        },
      ],
    },
    {
      title: "App",
      rows: [
        {
          icon: RefreshCw,
          label: "Restart onboarding",
          accent: "#A8A8B3",
          onClick: () => {
            if (
              window.confirm(
                "Restart onboarding? You'll keep your profile data but go through the welcome flow again.",
              )
            ) {
              updateProfile({ onboarded: false });
            }
          },
        },
        {
          icon: Info,
          label: "About Nexa Motion",
          value: "v1.0.0",
          accent: "#A8A8B3",
        },
        {
          icon: LogOut,
          label: "Reset all data",
          destructive: true,
          onClick: () => {
            if (
              window.confirm(
                "This will erase your profile, plan, history and chat. Continue?",
              )
            ) {
              localStorage.removeItem("nexa-motion-state");
              window.location.href = "/onboarding";
            }
          },
        },
      ],
    },
  ];

  return (
    <>
      <div className="safe-top safe-bottom px-5 space-y-5">
        <motion.header {...fadeUp} className="pb-2">
          <p className="text-[11px] uppercase tracking-[0.22em] text-text-muted font-medium">
            Make it yours
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-white">
            Settings
          </h1>
        </motion.header>

        {groups.map((g, gi) => (
          <motion.section
            key={g.title}
            {...fadeUp}
            transition={{ ...fadeUp.transition, delay: 0.04 + gi * 0.04 }}
          >
            <h2 className="text-[11px] uppercase tracking-[0.18em] text-text-muted font-semibold mb-2 px-1">
              {g.title}
            </h2>
            <div className="glass-panel rounded-3xl overflow-hidden">
              {g.rows.map((r, i) => {
                const Icon = r.icon;
                const interactive = !!r.onClick;
                return (
                  <div key={r.label}>
                    <div
                      role={interactive ? "button" : undefined}
                      tabIndex={interactive ? 0 : undefined}
                      onClick={r.onClick}
                      onKeyDown={
                        interactive
                          ? (e) => {
                              if (e.key === "Enter" || e.key === " ") {
                                e.preventDefault();
                                r.onClick?.();
                              }
                            }
                          : undefined
                      }
                      className={cn(
                        "w-full px-4 py-3.5 flex items-center gap-3 text-left select-none",
                        interactive &&
                          "cursor-pointer active:bg-white/[0.04] hover:bg-white/[0.02]",
                      )}
                    >
                      <span
                        className="inline-flex items-center justify-center h-9 w-9 rounded-2xl border"
                        style={{
                          background: `linear-gradient(135deg, ${r.accent}22, ${r.accent}05)`,
                          borderColor: `${r.accent}33`,
                        }}
                      >
                        <Icon
                          className="h-4 w-4"
                          style={{ color: r.destructive ? "#EF4444" : r.accent }}
                        />
                      </span>
                      <span
                        className={cn(
                          "flex-1 text-[14px] font-medium capitalize",
                          r.destructive ? "text-accent-red" : "text-white",
                        )}
                      >
                        {r.label}
                      </span>
                      {r.value && (
                        <span className="text-[13px] text-text-secondary capitalize tabular-nums">
                          {r.value}
                        </span>
                      )}
                      {r.toggle && (
                        <Toggle
                          on={r.toggle.on}
                          onChange={r.toggle.onChange}
                        />
                      )}
                      {interactive && !r.toggle && (
                        <ChevronRight className="h-4 w-4 text-text-muted" />
                      )}
                    </div>
                    {i < g.rows.length - 1 && (
                      <div className="hairline mx-4" />
                    )}
                  </div>
                );
              })}
            </div>
          </motion.section>
        ))}

        <motion.p
          {...fadeUp}
          transition={{ ...fadeUp.transition, delay: 0.35 }}
          className="text-center text-[11px] text-text-muted pt-4"
        >
          Made with care · Nexa Motion © 2026
        </motion.p>
      </div>

      <AnimatePresence>
        {editor && (
          <EditorSheet
            field={editor}
            profile={profile}
            onSave={(patch) => {
              updateProfile(patch);
              setEditor(null);
            }}
            onClose={() => setEditor(null)}
          />
        )}
      </AnimatePresence>
    </>
  );
}

function Toggle({
  on,
  onChange,
}: {
  on: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onChange(!on);
      }}
      className={cn(
        "relative h-7 w-12 rounded-full transition-colors",
        on
          ? "bg-gradient-to-r from-accent-purple to-accent-blue"
          : "bg-white/10",
      )}
      aria-pressed={on}
    >
      <motion.span
        layout
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
        className={cn(
          "absolute top-1 h-5 w-5 rounded-full bg-white shadow-md",
          on ? "right-1" : "left-1",
        )}
      />
    </button>
  );
}

// ─── editor sheet ─────────────────────────────────────────────────────────

type EditorField =
  | { kind: "name" }
  | { kind: "age" }
  | { kind: "height" }
  | { kind: "weight" }
  | { kind: "fitnessLevel" }
  | { kind: "experience" }
  | { kind: "goal" }
  | { kind: "activityLevel" }
  | { kind: "trainingDays" }
  | { kind: "injuries" };

function EditorSheet({
  field,
  profile,
  onSave,
  onClose,
}: {
  field: EditorField;
  profile: UserProfile;
  onSave: (patch: Partial<UserProfile>) => void;
  onClose: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-end sm:items-center justify-center p-4"
    >
      <motion.div
        initial={{ y: 60, opacity: 0, scale: 0.96 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: 60, opacity: 0, scale: 0.96 }}
        transition={{ type: "spring", stiffness: 320, damping: 32 }}
        onClick={(e) => e.stopPropagation()}
        className="glass-panel-strong rounded-3xl p-6 w-full max-w-[440px] shadow-glass-lg max-h-[80vh] overflow-y-auto no-scrollbar"
      >
        <div className="flex items-start justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">
            {fieldLabel(field.kind)}
          </h3>
          <button
            onClick={onClose}
            className="glass-pill h-9 w-9 rounded-full inline-flex items-center justify-center text-text-secondary hover:text-white"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <EditorBody field={field} profile={profile} onSave={onSave} />
      </motion.div>
    </motion.div>
  );
}

function fieldLabel(kind: EditorField["kind"]): string {
  return {
    name: "Edit your name",
    age: "Your age",
    height: "Your height",
    weight: "Your weight",
    fitnessLevel: "Fitness level",
    experience: "Running experience",
    goal: "Training goal",
    activityLevel: "Daily activity level",
    trainingDays: "Training days",
    injuries: "Injury history",
  }[kind];
}

function EditorBody({
  field,
  profile,
  onSave,
}: {
  field: EditorField;
  profile: UserProfile;
  onSave: (patch: Partial<UserProfile>) => void;
}) {
  const [draft, setDraft] = useState<Record<string, unknown>>(() =>
    initialDraft(field, profile),
  );

  function save() {
    const patch = buildPatch(field, draft);
    if (patch) onSave(patch);
  }

  return (
    <>
      {field.kind === "name" && (
        <input
          autoFocus
          type="text"
          value={(draft.name as string) ?? ""}
          onChange={(e) => setDraft({ name: e.target.value })}
          className="w-full bg-white/[0.04] border border-white/10 rounded-2xl px-4 py-3 text-[16px] font-semibold text-white outline-none focus:border-accent-purple/60"
        />
      )}

      {field.kind === "age" && (
        <NumInput
          value={draft.age as number | null}
          min={13}
          max={100}
          suffix="years"
          onChange={(age) => setDraft({ age })}
        />
      )}

      {field.kind === "weight" && (
        <NumInput
          value={draft.weightLb as number | null}
          min={60}
          max={500}
          suffix="lb"
          onChange={(weightLb) => setDraft({ weightLb })}
        />
      )}

      {field.kind === "height" && (
        <div className="flex gap-2">
          <NumInput
            value={draft.heightFt as number | null}
            min={3}
            max={8}
            suffix="ft"
            onChange={(heightFt) =>
              setDraft({ ...draft, heightFt })
            }
          />
          <NumInput
            value={draft.heightIn as number | null}
            min={0}
            max={11}
            suffix="in"
            onChange={(heightIn) =>
              setDraft({ ...draft, heightIn })
            }
          />
        </div>
      )}

      {field.kind === "fitnessLevel" && (
        <OptionList
          options={[
            { v: "beginner", label: "Beginner" },
            { v: "intermediate", label: "Intermediate" },
            { v: "advanced", label: "Advanced" },
            { v: "elite", label: "Elite" },
          ]}
          value={draft.fitnessLevel as FitnessLevel}
          onChange={(fitnessLevel) => setDraft({ fitnessLevel })}
        />
      )}

      {field.kind === "experience" && (
        <OptionList
          options={[
            { v: "0-1", label: "< 1 year" },
            { v: "1-3", label: "1–3 years" },
            { v: "3-5", label: "3–5 years" },
            { v: "5+", label: "5+ years" },
          ]}
          value={draft.experience as Experience}
          onChange={(experience) => setDraft({ experience })}
        />
      )}

      {field.kind === "goal" && (
        <OptionList
          options={[
            { v: "5k", label: "5K" },
            { v: "10k", label: "10K" },
            { v: "half", label: "Half marathon" },
            { v: "full", label: "Marathon" },
            { v: "ultra", label: "Ultra" },
            { v: "general", label: "Stay fit" },
          ]}
          value={draft.goal as RunningGoal}
          onChange={(goal) => setDraft({ goal })}
        />
      )}

      {field.kind === "activityLevel" && (
        <OptionList
          options={[
            { v: "sedentary", label: "Sedentary" },
            { v: "light", label: "Light" },
            { v: "moderate", label: "Moderate" },
            { v: "active", label: "Active" },
            { v: "very_active", label: "Very active" },
          ]}
          value={draft.activityLevel as ActivityLevel}
          onChange={(activityLevel) => setDraft({ activityLevel })}
        />
      )}

      {field.kind === "trainingDays" && (
        <TrainingDaysPicker
          value={draft.trainingDays as number[]}
          onChange={(trainingDays) => setDraft({ trainingDays })}
        />
      )}

      {field.kind === "injuries" && (
        <InjuriesPicker
          value={draft.injuryHistory as string[]}
          onChange={(injuryHistory) => setDraft({ injuryHistory })}
        />
      )}

      <motion.button
        whileTap={{ scale: 0.97 }}
        onClick={save}
        className="btn-primary w-full mt-5 py-3.5 inline-flex items-center justify-center gap-2 font-semibold text-[14px]"
      >
        <Check className="h-4 w-4" strokeWidth={3} />
        Save
      </motion.button>

      <p className="mt-3 text-center text-[11px] text-text-muted">
        Changes apply to your next generated plan.
      </p>
    </>
  );
}

function initialDraft(
  field: EditorField,
  p: UserProfile,
): Record<string, unknown> {
  switch (field.kind) {
    case "name":
      return { name: p.name };
    case "age":
      return { age: p.age ?? null };
    case "height":
      return {
        heightFt: p.heightIn != null ? Math.floor(p.heightIn / 12) : null,
        heightIn: p.heightIn != null ? p.heightIn % 12 : null,
      };
    case "weight":
      return { weightLb: p.weightLb ?? null };
    case "fitnessLevel":
      return { fitnessLevel: p.fitnessLevel };
    case "experience":
      return { experience: p.experience };
    case "goal":
      return { goal: p.goal };
    case "activityLevel":
      return { activityLevel: p.activityLevel };
    case "trainingDays":
      return { trainingDays: [...p.trainingDays] };
    case "injuries":
      return { injuryHistory: [...p.injuryHistory] };
  }
}

function buildPatch(
  field: EditorField,
  draft: Record<string, unknown>,
): Partial<UserProfile> | null {
  switch (field.kind) {
    case "name": {
      const name = ((draft.name as string) ?? "").trim();
      if (!name) return null;
      return { name };
    }
    case "age":
      return { age: (draft.age as number) ?? undefined };
    case "weight":
      return { weightLb: (draft.weightLb as number) ?? undefined };
    case "height": {
      const ft = draft.heightFt as number | null;
      const inches = draft.heightIn as number | null;
      if (ft == null || inches == null) return null;
      return { heightIn: ft * 12 + inches };
    }
    case "fitnessLevel":
      return { fitnessLevel: draft.fitnessLevel as FitnessLevel };
    case "experience":
      return { experience: draft.experience as Experience };
    case "goal":
      return { goal: draft.goal as RunningGoal };
    case "activityLevel":
      return { activityLevel: draft.activityLevel as ActivityLevel };
    case "trainingDays":
      return { trainingDays: draft.trainingDays as number[] };
    case "injuries":
      return { injuryHistory: draft.injuryHistory as string[] };
  }
}

function NumInput({
  value,
  min,
  max,
  suffix,
  onChange,
}: {
  value: number | null;
  min: number;
  max: number;
  suffix?: string;
  onChange: (v: number | null) => void;
}) {
  return (
    <div className="flex-1 relative">
      <input
        type="number"
        inputMode="numeric"
        value={value ?? ""}
        min={min}
        max={max}
        onChange={(e) => {
          const raw = e.target.value;
          if (raw === "") return onChange(null);
          const n = Number(raw);
          if (Number.isFinite(n)) onChange(n);
        }}
        className="w-full bg-white/[0.04] border border-white/10 rounded-2xl px-4 py-3 text-[16px] font-semibold text-white outline-none focus:border-accent-purple/60 pr-12"
      />
      {suffix && (
        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[11px] uppercase tracking-wider text-text-muted">
          {suffix}
        </span>
      )}
    </div>
  );
}

function OptionList<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { v: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div className="space-y-2">
      {options.map((o) => {
        const active = value === o.v;
        return (
          <button
            key={o.v}
            onClick={() => onChange(o.v)}
            className={cn(
              "w-full text-left rounded-2xl p-3.5 border transition-all flex items-center justify-between",
              active
                ? "border-accent-purple/60 bg-gradient-to-br from-accent-purple/15 to-accent-blue/10"
                : "border-white/8 bg-white/[0.03]",
            )}
          >
            <span className="text-[14px] font-semibold text-white">
              {o.label}
            </span>
            {active && (
              <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-accent-purple text-white">
                <Check className="h-3.5 w-3.5" />
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

function TrainingDaysPicker({
  value,
  onChange,
}: {
  value: number[];
  onChange: (v: number[]) => void;
}) {
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  return (
    <div className="grid grid-cols-7 gap-1.5">
      {days.map((d, i) => {
        const active = value.includes(i);
        return (
          <button
            key={d}
            onClick={() =>
              active
                ? onChange(value.filter((v) => v !== i))
                : onChange([...value, i].sort())
            }
            className={cn(
              "aspect-square rounded-2xl border flex items-center justify-center text-[11px] font-semibold transition-all",
              active
                ? "border-accent-purple/60 bg-gradient-to-br from-accent-purple/30 to-accent-blue/20 text-white shadow-glow-purple"
                : "border-white/8 bg-white/[0.03] text-text-secondary",
            )}
          >
            {d}
          </button>
        );
      })}
    </div>
  );
}

const INJURY_OPTIONS = [
  "Knee",
  "IT band",
  "Achilles",
  "Calf",
  "Hamstring",
  "Plantar fasciitis",
  "Hip",
  "Lower back",
  "Shin splints",
];

function InjuriesPicker({
  value,
  onChange,
}: {
  value: string[];
  onChange: (v: string[]) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {INJURY_OPTIONS.map((injury) => {
        const active = value.includes(injury);
        return (
          <button
            key={injury}
            onClick={() =>
              active
                ? onChange(value.filter((i) => i !== injury))
                : onChange([...value, injury])
            }
            className={cn(
              "rounded-full px-4 py-2 border text-[13px] font-medium transition-all inline-flex items-center gap-1.5",
              active
                ? "border-accent-pink/60 bg-accent-pink/15 text-white"
                : "border-white/10 bg-white/[0.03] text-text-secondary",
            )}
          >
            {injury}
            {active && <X className="h-3 w-3" />}
          </button>
        );
      })}
    </div>
  );
}
