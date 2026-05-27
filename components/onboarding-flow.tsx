"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  ArrowRight,
  Check,
  Sparkles,
  Target as TargetIcon,
  Calendar as CalendarIcon,
  HeartPulse,
  Mountain,
  Trophy,
  Zap,
  Footprints,
  X,
} from "lucide-react";
import { AppLogo } from "./app-logo";
import { useNexaStore } from "@/lib/store";
import type {
  ActivityLevel,
  Experience,
  FitnessLevel,
  RunningGoal,
  UserProfile,
} from "@/lib/types";
import { cn } from "@/lib/utils";

interface DraftProfile {
  name: string;
  age: number | null;
  heightFt: number | null;
  heightIn: number | null;
  weightLb: number | null;
  fitnessLevel: FitnessLevel;
  experience: Experience;
  goal: RunningGoal;
  activityLevel: ActivityLevel;
  trainingDays: number[];
  injuryHistory: string[];
}

const TOTAL_STEPS = 9;

export function OnboardingFlow() {
  const router = useRouter();
  const completeOnboarding = useNexaStore((s) => s.completeOnboarding);
  const [step, setStep] = useState(0);
  const [draft, setDraft] = useState<DraftProfile>({
    name: "",
    age: null,
    heightFt: null,
    heightIn: null,
    weightLb: null,
    fitnessLevel: "beginner",
    experience: "0-1",
    goal: "general",
    activityLevel: "moderate",
    trainingDays: [1, 3, 5],
    injuryHistory: [],
  });

  function next() {
    if (step === TOTAL_STEPS - 1) {
      const profilePatch: Partial<UserProfile> = {
        name: draft.name.trim() || "Runner",
        age: draft.age ?? undefined,
        weightLb: draft.weightLb ?? undefined,
        heightIn:
          draft.heightFt != null && draft.heightIn != null
            ? draft.heightFt * 12 + draft.heightIn
            : draft.heightIn ?? undefined,
        fitnessLevel: draft.fitnessLevel,
        experience: draft.experience,
        goal: draft.goal,
        activityLevel: draft.activityLevel,
        trainingDays: draft.trainingDays,
        injuryHistory: draft.injuryHistory,
      };
      completeOnboarding(profilePatch);
      router.push("/");
    } else {
      setStep((s) => s + 1);
    }
  }

  function back() {
    setStep((s) => Math.max(0, s - 1));
  }

  const canAdvance = (() => {
    switch (step) {
      case 1:
        return draft.name.trim().length > 0;
      case 2:
        return (
          draft.age !== null &&
          draft.age >= 13 &&
          draft.age <= 100 &&
          draft.heightFt !== null &&
          draft.heightFt >= 3 &&
          draft.heightFt <= 8 &&
          draft.heightIn !== null &&
          draft.heightIn >= 0 &&
          draft.heightIn <= 11 &&
          draft.weightLb !== null &&
          draft.weightLb >= 60 &&
          draft.weightLb <= 500
        );
      case 8:
        return draft.trainingDays.length > 0;
      default:
        return true;
    }
  })();

  return (
    <div className="min-h-screen flex flex-col safe-top px-6 pb-8">
      <div className="flex items-center gap-1.5 mb-8">
        {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
          <div
            key={i}
            className={cn(
              "h-1 flex-1 rounded-full transition-all duration-500",
              i <= step
                ? "bg-gradient-to-r from-accent-purple to-accent-blue"
                : "bg-white/10",
            )}
          />
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="flex-1 flex flex-col"
        >
          {step === 0 && <WelcomeStep />}
          {step === 1 && (
            <NameStep
              value={draft.name}
              onChange={(name) => setDraft({ ...draft, name })}
            />
          )}
          {step === 2 && (
            <BodyStep
              draft={draft}
              onChange={(patch) => setDraft({ ...draft, ...patch })}
            />
          )}
          {step === 3 && (
            <ActivityLevelStep
              value={draft.activityLevel}
              onChange={(activityLevel) =>
                setDraft({ ...draft, activityLevel })
              }
            />
          )}
          {step === 4 && (
            <FitnessStep
              value={draft.fitnessLevel}
              onChange={(fitnessLevel) =>
                setDraft({ ...draft, fitnessLevel })
              }
            />
          )}
          {step === 5 && (
            <ExperienceStep
              value={draft.experience}
              onChange={(experience) => setDraft({ ...draft, experience })}
            />
          )}
          {step === 6 && (
            <GoalStep
              value={draft.goal}
              onChange={(goal) => setDraft({ ...draft, goal })}
            />
          )}
          {step === 7 && (
            <InjuriesStep
              value={draft.injuryHistory}
              onChange={(injuryHistory) =>
                setDraft({ ...draft, injuryHistory })
              }
            />
          )}
          {step === 8 && (
            <DaysStep
              value={draft.trainingDays}
              onChange={(trainingDays) =>
                setDraft({ ...draft, trainingDays })
              }
            />
          )}
        </motion.div>
      </AnimatePresence>

      <div className="flex items-center gap-3 pt-6">
        {step > 0 && (
          <button
            onClick={back}
            className="btn-ghost px-5 py-3 text-[14px] font-semibold"
          >
            Back
          </button>
        )}
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={next}
          disabled={!canAdvance}
          className="btn-primary flex-1 py-3.5 inline-flex items-center justify-center gap-2 font-semibold text-[14px] disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {step === TOTAL_STEPS - 1 ? "Enter Nexa Motion" : "Continue"}
          <ArrowRight className="h-4 w-4" />
        </motion.button>
      </div>
    </div>
  );
}

/* === Steps === */

function WelcomeStep() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center text-center">
      <motion.div
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="mb-8"
      >
        <AppLogo size={112} />
      </motion.div>
      <motion.h1
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="text-4xl font-semibold tracking-tight gradient-text text-balance"
      >
        Welcome to Nexa Motion
      </motion.h1>
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
        className="mt-4 text-[15px] text-text-secondary text-balance max-w-[320px] leading-relaxed"
      >
        Your personal AI running coach. We'll learn about you, then build a
        plan that adapts as you grow.
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mt-10 flex items-center gap-2 text-[12px] text-text-muted"
      >
        <Sparkles className="h-3.5 w-3.5 text-accent-purple" />
        Takes about 60 seconds
      </motion.div>
    </div>
  );
}

function NameStep({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex-1 flex flex-col justify-center">
      <StepHeader
        eyebrow="The basics"
        title="What should we call you?"
        sub="Used to personalize your coach and plans."
      />
      <input
        type="text"
        autoFocus
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Your name"
        className="mt-8 w-full bg-transparent text-3xl font-semibold text-white placeholder-text-muted border-b-2 border-white/15 focus:border-accent-purple outline-none pb-3 transition-colors"
      />
    </div>
  );
}

function BodyStep({
  draft,
  onChange,
}: {
  draft: DraftProfile;
  onChange: (p: Partial<DraftProfile>) => void;
}) {
  return (
    <div className="flex-1 flex flex-col justify-center">
      <StepHeader
        eyebrow="Body basics"
        title="Tell us about you"
        sub="We use these to calibrate workouts and recovery. Required to generate your plan."
      />

      <div className="mt-8 space-y-5">
        <FieldRow label="Age" hint="years">
          <NumberInput
            value={draft.age}
            min={13}
            max={100}
            placeholder="e.g. 28"
            onChange={(age) => onChange({ age })}
          />
        </FieldRow>

        <FieldRow label="Height" hint="ft / in">
          <div className="flex gap-2">
            <NumberInput
              value={draft.heightFt}
              min={3}
              max={8}
              placeholder="5"
              onChange={(heightFt) => onChange({ heightFt })}
              suffix="ft"
            />
            <NumberInput
              value={draft.heightIn}
              min={0}
              max={11}
              placeholder="10"
              onChange={(heightIn) => onChange({ heightIn })}
              suffix="in"
            />
          </div>
        </FieldRow>

        <FieldRow label="Weight" hint="lb">
          <NumberInput
            value={draft.weightLb}
            min={60}
            max={500}
            placeholder="e.g. 160"
            onChange={(weightLb) => onChange({ weightLb })}
            suffix="lb"
          />
        </FieldRow>
      </div>
    </div>
  );
}

function ActivityLevelStep({
  value,
  onChange,
}: {
  value: ActivityLevel;
  onChange: (v: ActivityLevel) => void;
}) {
  const options: {
    v: ActivityLevel;
    label: string;
    sub: string;
  }[] = [
    { v: "sedentary", label: "Sedentary", sub: "Mostly seated, minimal exercise" },
    { v: "light", label: "Light", sub: "Light activity 1–2 days/week" },
    { v: "moderate", label: "Moderate", sub: "Regular activity 3–4 days/week" },
    { v: "active", label: "Active", sub: "Hard activity 5+ days/week" },
    { v: "very_active", label: "Very active", sub: "Athlete / physical job" },
  ];

  return (
    <div className="flex-1 flex flex-col justify-center">
      <StepHeader
        eyebrow="Daily activity"
        title="How active are you right now?"
        sub="This calibrates how aggressively your starting volume ramps."
      />
      <div className="mt-6 space-y-2">
        {options.map((o) => {
          const active = value === o.v;
          return (
            <motion.button
              key={o.v}
              whileTap={{ scale: 0.98 }}
              onClick={() => onChange(o.v)}
              className={cn(
                "w-full text-left rounded-2xl p-4 border transition-all",
                active
                  ? "border-accent-purple/60 bg-gradient-to-br from-accent-purple/15 to-accent-blue/10"
                  : "border-white/8 bg-white/[0.03]",
              )}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-[15px] font-semibold text-white">
                    {o.label}
                  </div>
                  <div className="text-[13px] text-text-secondary mt-0.5">
                    {o.sub}
                  </div>
                </div>
                {active && (
                  <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-accent-purple text-white">
                    <Check className="h-3.5 w-3.5" />
                  </span>
                )}
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

function FitnessStep({
  value,
  onChange,
}: {
  value: FitnessLevel;
  onChange: (v: FitnessLevel) => void;
}) {
  const options = [
    { v: "beginner", label: "Beginner", sub: "Just getting started" },
    { v: "intermediate", label: "Intermediate", sub: "Run regularly" },
    { v: "advanced", label: "Advanced", sub: "Train with structure" },
    { v: "elite", label: "Elite", sub: "Race-focused" },
  ] as const;

  return (
    <div className="flex-1 flex flex-col justify-center">
      <StepHeader
        eyebrow="Your level"
        title="How would you describe yourself?"
        sub="No pressure — you can change this anytime."
      />
      <div className="mt-8 space-y-2.5">
        {options.map((o) => {
          const active = value === o.v;
          return (
            <motion.button
              key={o.v}
              whileTap={{ scale: 0.98 }}
              onClick={() => onChange(o.v)}
              className={cn(
                "w-full text-left rounded-2xl p-4 border transition-all",
                active
                  ? "border-accent-purple/60 bg-gradient-to-br from-accent-purple/15 to-accent-blue/10"
                  : "border-white/8 bg-white/[0.03]",
              )}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-[15px] font-semibold text-white">
                    {o.label}
                  </div>
                  <div className="text-[13px] text-text-secondary mt-0.5">
                    {o.sub}
                  </div>
                </div>
                {active && (
                  <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-accent-purple text-white">
                    <Check className="h-3.5 w-3.5" />
                  </span>
                )}
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

function ExperienceStep({
  value,
  onChange,
}: {
  value: Experience;
  onChange: (v: Experience) => void;
}) {
  const opts = [
    { v: "0-1", label: "< 1 year" },
    { v: "1-3", label: "1–3 years" },
    { v: "3-5", label: "3–5 years" },
    { v: "5+", label: "5+ years" },
  ] as const;
  return (
    <div className="flex-1 flex flex-col justify-center">
      <StepHeader
        eyebrow="Experience"
        title="How long have you been running?"
        sub="This shapes how aggressively your plan progresses."
      />
      <div className="mt-8 grid grid-cols-2 gap-2.5">
        {opts.map((o) => {
          const active = value === o.v;
          return (
            <motion.button
              key={o.v}
              whileTap={{ scale: 0.96 }}
              onClick={() => onChange(o.v)}
              className={cn(
                "rounded-2xl p-5 border text-center transition-all",
                active
                  ? "border-accent-purple/60 bg-gradient-to-br from-accent-purple/15 to-accent-blue/10"
                  : "border-white/8 bg-white/[0.03]",
              )}
            >
              <div className="text-xl font-semibold text-white">{o.label}</div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

function GoalStep({
  value,
  onChange,
}: {
  value: RunningGoal;
  onChange: (v: RunningGoal) => void;
}) {
  const opts = [
    { v: "5k", label: "5K", icon: Zap, sub: "Speed & fitness" },
    { v: "10k", label: "10K", icon: TargetIcon, sub: "Endurance build" },
    { v: "half", label: "Half", icon: Mountain, sub: "13.1 miles" },
    { v: "full", label: "Marathon", icon: Trophy, sub: "26.2 miles" },
    { v: "ultra", label: "Ultra", icon: Mountain, sub: "50K+" },
    { v: "general", label: "Stay fit", icon: HeartPulse, sub: "No race goal" },
  ] as const;
  return (
    <div className="flex-1 flex flex-col justify-center">
      <StepHeader
        eyebrow="Your goal"
        title="What are you training for?"
        sub="Your AI coach will tailor every workout to this."
      />
      <div className="mt-6 grid grid-cols-2 gap-2.5">
        {opts.map((o) => {
          const active = value === o.v;
          const Icon = o.icon;
          return (
            <motion.button
              key={o.v}
              whileTap={{ scale: 0.96 }}
              onClick={() => onChange(o.v)}
              className={cn(
                "rounded-2xl p-4 border text-left transition-all",
                active
                  ? "border-accent-purple/60 bg-gradient-to-br from-accent-purple/15 to-accent-blue/10"
                  : "border-white/8 bg-white/[0.03]",
              )}
            >
              <Icon
                className={cn(
                  "h-5 w-5 mb-2",
                  active ? "text-accent-purple-bright" : "text-text-secondary",
                )}
              />
              <div className="text-[15px] font-semibold text-white">
                {o.label}
              </div>
              <div className="text-[12px] text-text-secondary mt-0.5">
                {o.sub}
              </div>
            </motion.button>
          );
        })}
      </div>
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

function InjuriesStep({
  value,
  onChange,
}: {
  value: string[];
  onChange: (v: string[]) => void;
}) {
  function toggle(injury: string) {
    if (value.includes(injury)) onChange(value.filter((i) => i !== injury));
    else onChange([...value, injury]);
  }

  return (
    <div className="flex-1 flex flex-col justify-center">
      <StepHeader
        eyebrow="Injury history"
        title="Anything we should know?"
        sub="Optional. We'll ease back volume when something's flagged — you can edit this anytime."
      />
      <div className="mt-8 flex flex-wrap gap-2">
        {INJURY_OPTIONS.map((injury) => {
          const active = value.includes(injury);
          return (
            <motion.button
              key={injury}
              whileTap={{ scale: 0.95 }}
              onClick={() => toggle(injury)}
              className={cn(
                "rounded-full px-4 py-2 border text-[13px] font-medium transition-all inline-flex items-center gap-1.5",
                active
                  ? "border-accent-pink/60 bg-accent-pink/15 text-white"
                  : "border-white/10 bg-white/[0.03] text-text-secondary",
              )}
            >
              {injury}
              {active && <X className="h-3 w-3" />}
            </motion.button>
          );
        })}
      </div>
      {value.length === 0 && (
        <p className="mt-6 text-[12px] text-text-muted">
          No history — great. Skip ahead.
        </p>
      )}
    </div>
  );
}

function DaysStep({
  value,
  onChange,
}: {
  value: number[];
  onChange: (v: number[]) => void;
}) {
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  function toggle(i: number) {
    if (value.includes(i)) onChange(value.filter((d) => d !== i));
    else onChange([...value, i].sort());
  }
  return (
    <div className="flex-1 flex flex-col justify-center">
      <StepHeader
        eyebrow="Training schedule"
        title="Which days can you train?"
        sub="Pick the days that fit your life. We'll plan rest days for you."
      />
      <div className="mt-8 grid grid-cols-7 gap-1.5">
        {days.map((d, i) => {
          const active = value.includes(i);
          return (
            <motion.button
              key={d}
              whileTap={{ scale: 0.94 }}
              onClick={() => toggle(i)}
              className={cn(
                "aspect-square rounded-2xl border flex flex-col items-center justify-center transition-all text-[11px] font-semibold",
                active
                  ? "border-accent-purple/60 bg-gradient-to-br from-accent-purple/30 to-accent-blue/20 text-white shadow-glow-purple"
                  : "border-white/8 bg-white/[0.03] text-text-secondary",
              )}
            >
              {d}
            </motion.button>
          );
        })}
      </div>

      <div className="mt-6 glass-panel rounded-2xl p-4 flex items-start gap-3">
        <div className="inline-flex items-center justify-center h-9 w-9 rounded-2xl bg-gradient-to-br from-accent-purple/30 to-accent-blue/20 border border-white/10 shrink-0">
          <Footprints className="h-4 w-4 text-accent-purple-bright" />
        </div>
        <div>
          <p className="text-[13px] font-semibold text-white">
            {value.length} training days · {7 - value.length} rest
          </p>
          <p className="text-[12px] text-text-secondary mt-0.5">
            Most distance runners benefit from 3–5 days per week.
          </p>
        </div>
      </div>
    </div>
  );
}

function StepHeader({
  eyebrow,
  title,
  sub,
}: {
  eyebrow: string;
  title: string;
  sub: string;
}) {
  return (
    <div>
      <p className="text-[11px] uppercase tracking-[0.22em] text-accent-purple-bright font-semibold">
        {eyebrow}
      </p>
      <h1 className="mt-2 text-[28px] font-semibold tracking-tight text-white text-balance leading-tight">
        {title}
      </h1>
      <p className="mt-2 text-[14px] text-text-secondary text-balance leading-relaxed">
        {sub}
      </p>
    </div>
  );
}

// ─── small inputs ─────────────────────────────────────────────────────────

function FieldRow({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="flex items-baseline justify-between mb-1.5">
        <span className="text-[13px] font-semibold text-white">{label}</span>
        {hint && (
          <span className="text-[11px] uppercase tracking-wider text-text-muted">
            {hint}
          </span>
        )}
      </div>
      {children}
    </div>
  );
}

function NumberInput({
  value,
  min,
  max,
  placeholder,
  onChange,
  suffix,
}: {
  value: number | null;
  min: number;
  max: number;
  placeholder: string;
  onChange: (v: number | null) => void;
  suffix?: string;
}) {
  return (
    <div className="flex-1 relative">
      <input
        type="number"
        inputMode="numeric"
        value={value ?? ""}
        min={min}
        max={max}
        placeholder={placeholder}
        onChange={(e) => {
          const raw = e.target.value;
          if (raw === "") return onChange(null);
          const n = Number(raw);
          if (Number.isFinite(n)) onChange(n);
        }}
        className="w-full bg-white/[0.04] border border-white/10 rounded-2xl px-4 py-3 text-[16px] font-semibold text-white placeholder-text-muted outline-none focus:border-accent-purple/60 transition-colors pr-12"
      />
      {suffix && (
        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[12px] uppercase tracking-wider text-text-muted">
          {suffix}
        </span>
      )}
    </div>
  );
}
