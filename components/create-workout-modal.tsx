"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  Check,
  X,
  CalendarPlus,
  Sparkles,
  ArrowLeft,
  PenLine,
  MessageCircle,
} from "lucide-react";
import { useNexaStore } from "@/lib/store";
import { vibrate, HAPTIC } from "@/lib/haptics";
import { cn, parseDateKey } from "@/lib/utils";

interface CreateWorkoutModalProps {
  onClose: () => void;
}

type Stage = "input" | "choice" | "scheduled";

export function CreateWorkoutModal({ onClose }: CreateWorkoutModalProps) {
  const router = useRouter();
  const addCustomWorkout = useNexaStore((s) => s.addCustomWorkout);
  const setPendingReview = useNexaStore((s) => s.setPendingReview);

  const [stage, setStage] = useState<Stage>("input");
  const [text, setText] = useState("");
  const [scheduledDate, setScheduledDate] = useState<string | null>(null);

  function submit() {
    if (text.trim().length === 0) return;
    vibrate(HAPTIC.select);
    setStage("choice");
  }

  function addDirectly() {
    vibrate(HAPTIC.success);
    const date = addCustomWorkout(text);
    setScheduledDate(date);
    setStage("scheduled");
  }

  function reviewWithAI() {
    vibrate(HAPTIC.tap);
    setPendingReview({ original: text.trim() });
    onClose();
    router.push("/coach");
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 z-[55] bg-black/60 backdrop-blur-md flex items-end sm:items-center justify-center p-4"
    >
      <motion.div
        initial={{ y: 60, opacity: 0, scale: 0.96 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: 60, opacity: 0, scale: 0.96 }}
        transition={{ type: "spring", stiffness: 320, damping: 32 }}
        onClick={(e) => e.stopPropagation()}
        className="glass-panel-strong rounded-3xl p-6 w-full max-w-[460px] shadow-glass-lg max-h-[85vh] overflow-y-auto no-scrollbar"
      >
        <AnimatePresence mode="wait">
          {stage === "input" && (
            <InputStage
              key="input"
              text={text}
              onChange={setText}
              onSubmit={submit}
              onClose={onClose}
            />
          )}
          {stage === "choice" && (
            <ChoiceStage
              key="choice"
              text={text}
              onAddDirectly={addDirectly}
              onReviewAI={reviewWithAI}
              onBack={() => setStage("input")}
              onClose={onClose}
            />
          )}
          {stage === "scheduled" && (
            <ScheduledStage
              key="scheduled"
              date={scheduledDate}
              onClose={onClose}
            />
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}

// ─── stages ──────────────────────────────────────────────────────────────

function InputStage({
  text,
  onChange,
  onSubmit,
  onClose,
}: {
  text: string;
  onChange: (v: string) => void;
  onSubmit: () => void;
  onClose: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.25 }}
    >
      <div className="flex items-start justify-between mb-2">
        <div>
          <p className="text-[11px] uppercase tracking-[0.18em] text-text-muted font-semibold">
            Build your own
          </p>
          <h3 className="mt-1 text-lg font-semibold text-white">
            Create Custom Workout
          </h3>
        </div>
        <button
          onClick={onClose}
          className="glass-pill h-9 w-9 rounded-full inline-flex items-center justify-center text-text-secondary hover:text-white shrink-0"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <p className="text-[13px] text-text-secondary mt-1 leading-relaxed">
        Type or paste your workout plan. You can structure it any way that
        makes sense — segments, intervals, prose. Markdown is fine.
      </p>

      <div className="mt-4 relative">
        <textarea
          autoFocus
          value={text}
          onChange={(e) => onChange(e.target.value)}
          rows={8}
          placeholder={`e.g. Threshold Repeats

Warmup: 1 mile easy
Main: 5 x 1k at threshold pace (4'00/km), 90s rest
Cooldown: 1 mile easy + 5 min stretch`}
          className="w-full min-h-[180px] max-h-[40vh] bg-white/[0.04] border border-white/10 rounded-2xl px-4 py-3 text-[14px] text-white placeholder-text-muted outline-none focus:border-accent-purple/60 transition-colors resize-none leading-relaxed"
        />
        <PenLine className="absolute right-3 top-3 h-4 w-4 text-text-muted pointer-events-none" />
      </div>

      <motion.button
        whileTap={{ scale: 0.97 }}
        disabled={text.trim().length === 0}
        onClick={onSubmit}
        className="btn-primary w-full mt-5 py-3.5 inline-flex items-center justify-center gap-2 font-semibold text-[14px] disabled:opacity-40 disabled:cursor-not-allowed"
      >
        <Check className="h-4 w-4" strokeWidth={3} />
        Submit Workout
      </motion.button>
    </motion.div>
  );
}

function ChoiceStage({
  text,
  onAddDirectly,
  onReviewAI,
  onBack,
  onClose,
}: {
  text: string;
  onAddDirectly: () => void;
  onReviewAI: () => void;
  onBack: () => void;
  onClose: () => void;
}) {
  const lines = text.trim().split(/\r?\n/).length;
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.25 }}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <button
            onClick={onBack}
            className="glass-pill h-8 w-8 rounded-full inline-flex items-center justify-center text-text-secondary hover:text-white"
            aria-label="Back"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
          </button>
          <div>
            <p className="text-[11px] uppercase tracking-[0.18em] text-text-muted font-semibold">
              Workout submitted
            </p>
            <h3 className="mt-0.5 text-lg font-semibold text-white">
              What's next?
            </h3>
          </div>
        </div>
        <button
          onClick={onClose}
          className="glass-pill h-9 w-9 rounded-full inline-flex items-center justify-center text-text-secondary hover:text-white shrink-0"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <p className="text-[12px] text-text-muted mt-2">
        {lines} line{lines === 1 ? "" : "s"} · ready to schedule
      </p>

      <div className="mt-4 space-y-2.5">
        <ChoiceCard
          icon={CalendarPlus}
          accent="#60A5FA"
          title="Add Directly to Calendar"
          description="Schedule this workout on your next available training day."
          onClick={onAddDirectly}
        />
        <ChoiceCard
          icon={Sparkles}
          accent="#C084FC"
          title="Review with AI Assistant"
          description="Send to Nexa Coach for analysis and improvements before scheduling."
          onClick={onReviewAI}
        />
      </div>
    </motion.div>
  );
}

function ChoiceCard({
  icon: Icon,
  accent,
  title,
  description,
  onClick,
}: {
  icon: typeof CalendarPlus;
  accent: string;
  title: string;
  description: string;
  onClick: () => void;
}) {
  return (
    <motion.button
      whileTap={{ scale: 0.98 }}
      whileHover={{ y: -2 }}
      onClick={onClick}
      className={cn(
        "w-full text-left rounded-2xl p-4 border transition-all",
        "border-white/8 bg-white/[0.03] hover:bg-white/[0.06]",
      )}
    >
      <div className="flex items-start gap-3">
        <span
          className="inline-flex items-center justify-center h-10 w-10 rounded-2xl border shrink-0"
          style={{
            background: `linear-gradient(135deg, ${accent}33, ${accent}11)`,
            borderColor: `${accent}55`,
          }}
        >
          <Icon className="h-5 w-5" style={{ color: accent }} />
        </span>
        <div className="min-w-0">
          <h4 className="text-[14px] font-semibold text-white">{title}</h4>
          <p className="mt-0.5 text-[12px] text-text-secondary leading-relaxed">
            {description}
          </p>
        </div>
      </div>
    </motion.button>
  );
}

function ScheduledStage({
  date,
  onClose,
}: {
  date: string | null;
  onClose: () => void;
}) {
  const niceDate = date
    ? parseDateKey(date).toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
      })
    : null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      className="text-center py-2"
    >
      <motion.div
        initial={{ scale: 0.4, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{
          type: "spring",
          stiffness: 280,
          damping: 18,
          delay: 0.1,
        }}
        className="inline-flex items-center justify-center h-16 w-16 rounded-3xl bg-gradient-to-br from-accent-green/30 to-accent-blue/15 border border-accent-green/40 mb-3"
      >
        <Check
          className="h-8 w-8 text-accent-green"
          strokeWidth={3}
        />
      </motion.div>
      <h3 className="text-xl font-semibold text-white">Scheduled</h3>
      {niceDate && (
        <p className="mt-1 text-[14px] text-text-secondary">{niceDate}</p>
      )}
      <p className="mt-3 text-[12px] text-text-muted max-w-[300px] mx-auto leading-relaxed">
        You'll find it on the calendar and on the Activity page when its
        day arrives.
      </p>
      <motion.button
        whileTap={{ scale: 0.97 }}
        onClick={onClose}
        className="btn-primary w-full mt-5 py-3.5 inline-flex items-center justify-center gap-2 font-semibold text-[14px]"
      >
        <MessageCircle className="h-4 w-4" />
        Done
      </motion.button>
    </motion.div>
  );
}
