"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { X, Check } from "lucide-react";
import { FEELING_SCALE } from "@/lib/feelings";
import type { FeelingRating } from "@/lib/types";
import { cn } from "@/lib/utils";
import { vibrate } from "@/lib/haptics";

interface FeelingRatingModalProps {
  workoutTitle: string;
  onSubmit: (rating: FeelingRating) => void;
  onSkip: () => void;
  onClose: () => void;
}

export function FeelingRatingModal({
  workoutTitle,
  onSubmit,
  onSkip,
  onClose,
}: FeelingRatingModalProps) {
  const [selected, setSelected] = useState<FeelingRating | null>(null);

  function submit() {
    if (selected == null) return;
    vibrate(15);
    onSubmit(selected);
  }

  const activeFace = selected
    ? FEELING_SCALE.find((f) => f.rating === selected)
    : null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-md flex items-end sm:items-center justify-center p-4"
    >
      <motion.div
        initial={{ y: 60, opacity: 0, scale: 0.96 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: 60, opacity: 0, scale: 0.96 }}
        transition={{ type: "spring", stiffness: 320, damping: 32 }}
        onClick={(e) => e.stopPropagation()}
        className="glass-panel-strong rounded-3xl p-6 w-full max-w-[440px] shadow-glass-lg"
      >
        <div className="flex items-start justify-between mb-2">
          <div>
            <p className="text-[11px] uppercase tracking-[0.18em] text-text-muted font-semibold">
              Activity complete
            </p>
            <h3 className="mt-1 text-lg font-semibold text-white text-balance">
              How did {workoutTitle.toLowerCase()} feel?
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
          Your rating shapes future recommendations and powers your wellbeing
          trend on Analytics.
        </p>

        <div className="mt-5 grid grid-cols-5 gap-2">
          {FEELING_SCALE.map((f) => {
            const Icon = f.icon;
            const active = selected === f.rating;
            return (
              <motion.button
                key={f.rating}
                whileTap={{ scale: 0.9 }}
                whileHover={{ y: -2 }}
                onClick={() => {
                  vibrate(10);
                  setSelected(f.rating);
                }}
                className={cn(
                  "rounded-2xl py-3 flex flex-col items-center justify-center gap-1 border transition-all",
                  active
                    ? "border-white/30 bg-white/10 shadow-glow-purple"
                    : "border-white/8 bg-white/[0.03]",
                )}
                style={{
                  boxShadow: active ? `0 0 30px ${f.color}55` : undefined,
                }}
              >
                <Icon
                  className="h-6 w-6"
                  style={{ color: active ? f.color : "#A8A8B3" }}
                  strokeWidth={2.2}
                />
                <span
                  className={cn(
                    "text-[10px] font-semibold tracking-wide",
                    active ? "text-white" : "text-text-muted",
                  )}
                >
                  {f.label}
                </span>
              </motion.button>
            );
          })}
        </div>

        {activeFace && (
          <motion.p
            key={activeFace.rating}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 text-center text-[13px] text-text-secondary italic"
          >
            "{activeFace.description}"
          </motion.p>
        )}

        <motion.button
          whileTap={{ scale: 0.97 }}
          disabled={selected == null}
          onClick={submit}
          className="btn-primary w-full mt-5 py-3.5 inline-flex items-center justify-center gap-2 font-semibold text-[14px] disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Check className="h-4 w-4" strokeWidth={3} />
          Save activity
        </motion.button>

        <button
          onClick={onSkip}
          className="block w-full mt-3 py-2 text-[12px] font-medium text-text-muted hover:text-text-secondary"
        >
          Skip — log without rating
        </button>
      </motion.div>
    </motion.div>
  );
}
