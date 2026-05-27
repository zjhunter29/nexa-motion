"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import {
  ThermometerSun,
  Briefcase,
  Stethoscope,
  CloudRain,
  HelpCircle,
  X,
} from "lucide-react";
import { useNexaStore } from "@/lib/store";
import type { CancelReason } from "@/lib/types";

interface CancelMenuProps {
  workoutId: string;
  onClose: () => void;
  onCancelled?: () => void;
}

const REASONS: {
  value: CancelReason;
  label: string;
  icon: typeof ThermometerSun;
  accent: string;
}[] = [
  { value: "sick", label: "Feeling sick", icon: ThermometerSun, accent: "#EF4444" },
  { value: "busy", label: "Too busy", icon: Briefcase, accent: "#F59E0B" },
  { value: "injured", label: "Injured", icon: Stethoscope, accent: "#EC4899" },
  { value: "weather", label: "Bad weather", icon: CloudRain, accent: "#60A5FA" },
  { value: "other", label: "Other", icon: HelpCircle, accent: "#A8A8B3" },
];

export function CancelMenu({ workoutId, onClose, onCancelled }: CancelMenuProps) {
  const cancelWorkout = useNexaStore((s) => s.cancelWorkout);
  const [selected, setSelected] = useState<CancelReason | null>(null);

  function submit() {
    if (!selected) return;
    cancelWorkout(workoutId, selected);
    onCancelled?.();
  }

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
        className="glass-panel-strong rounded-3xl p-6 w-full max-w-[420px] shadow-glass-lg"
      >
        <div className="flex items-start justify-between mb-1">
          <div>
            <h3 className="text-lg font-semibold text-white">
              Cancel today's run?
            </h3>
            <p className="text-sm text-text-secondary mt-1">
              Choose a reason so Nexa can adapt your plan.
            </p>
          </div>
          <button
            onClick={onClose}
            className="glass-pill h-9 w-9 rounded-full inline-flex items-center justify-center text-text-secondary hover:text-white"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-2">
          {REASONS.map((r) => {
            const Icon = r.icon;
            const active = selected === r.value;
            return (
              <motion.button
                key={r.value}
                whileTap={{ scale: 0.97 }}
                onClick={() => setSelected(r.value)}
                className="relative rounded-2xl p-4 text-left transition-all border"
                style={{
                  background: active
                    ? `linear-gradient(135deg, ${r.accent}22, ${r.accent}0A)`
                    : "rgba(255,255,255,0.03)",
                  borderColor: active
                    ? `${r.accent}66`
                    : "rgba(255,255,255,0.08)",
                }}
              >
                <Icon
                  className="h-5 w-5 mb-2"
                  style={{ color: active ? r.accent : "#A8A8B3" }}
                />
                <span className="text-[13px] font-medium text-white">
                  {r.label}
                </span>
              </motion.button>
            );
          })}
        </div>

        <motion.button
          whileTap={{ scale: 0.97 }}
          disabled={!selected}
          onClick={submit}
          className="btn-primary w-full mt-5 py-3.5 font-semibold text-[14px] disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Confirm cancellation
        </motion.button>
      </motion.div>
    </motion.div>
  );
}
