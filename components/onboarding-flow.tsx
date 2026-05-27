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
} from "lucide-react";
import { AppLogo } from "./app-logo";
import { useNexaStore } from "@/lib/store";
import type { UserProfile } from "@/lib/types";
import { cn } from "@/lib/utils";

interface DraftProfile {
  name: string;
  fitnessLevel: UserProfile["fitnessLevel"];
  experience: UserProfile["experience"];
  goal: UserProfile["goal"];
  trainingDays: number[];
}

const TOTAL_STEPS = 6;

export function OnboardingFlow() {
  const router = useRouter();
  const completeOnboarding = useNexaStore((s) => s.completeOnboarding);
  const [step, setStep] = useState(0);
  const [draft, setDraft] = useState<DraftProfile>({
    name: "",
    fitnessLevel: "intermediate",
    experience: "1-3",
    goal: "5k",
    trainingDays: [1, 3, 5],
  });

  function next() {
    if (step === TOTAL_STEPS - 1) {
      completeOnboarding({
        name: draft.name || "Runner",
        fitnessLevel: draft.fitnessLevel,
        experience: draft.experience,
        goal: draft.goal,
        trainingDays: draft.trainingDays,
      });
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
      case 5:
        return draft.trainingDays.length > 0;
      default:
        return true;
    }
  })();

  return (
    <div className="min-h-screen flex flex-col safe-top px-6 pb-8">
      {/* Progress bar */}
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
            <FitnessStep
              value={draft.fitnessLevel}
              onChange={(fitnessLevel) =>
                setDraft({ ...draft, fitnessLevel })
              }
            />
          )}
          {step === 3 && (
            <ExperienceStep
              value={draft.experience}
              onChange={(experience) => setDraft({ ...draft, experience })}
            />
          )}
          {step === 4 && (
            <GoalStep
              value={draft.goal}
              onChange={(goal) => setDraft({ ...draft, goal })}
            />
          )}
          {step === 5 && (
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
        <AppLogo size={88} />
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
        className="mt-4 text-[15px] text-text-secondary text-balance max-w-[300px] leading-relaxed"
      >
        Your personal AI running coach. Smarter training, beautiful insights,
        every mile.
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mt-10 flex items-center gap-2 text-[12px] text-text-muted"
      >
        <Sparkles className="h-3.5 w-3.5 text-accent-purple" />
        Takes less than 60 seconds
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

function FitnessStep({
  value,
  onChange,
}: {
  value: UserProfile["fitnessLevel"];
  onChange: (v: UserProfile["fitnessLevel"]) => void;
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
  value: UserProfile["experience"];
  onChange: (v: UserProfile["experience"]) => void;
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
  value: UserProfile["goal"];
  onChange: (v: UserProfile["goal"]) => void;
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
