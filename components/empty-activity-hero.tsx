"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { Sparkles, Footprints, MessageCircle } from "lucide-react";
import { AppLogo } from "./app-logo";
import { GlassCard } from "./glass-card";
import { useNexaStore } from "@/lib/store";
import { generatePlan } from "@/lib/plan-generator";

export function EmptyActivityHero() {
  const router = useRouter();
  const profile = useNexaStore((s) => s.profile);
  const setPlan = useNexaStore((s) => s.setPlan);

  function generate() {
    const plan = generatePlan(profile);
    setPlan(plan);
  }

  const greeting = greetingForName(profile.name);

  return (
    <div className="px-5 pb-6">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="flex flex-col items-center text-center pt-4"
      >
        <motion.div
          initial={{ scale: 0.7, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="mb-5"
        >
          <AppLogo size={88} />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="text-[28px] font-semibold tracking-tight gradient-text leading-tight"
        >
          {greeting}
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="mt-2 text-[14px] text-text-secondary text-balance max-w-[300px] leading-relaxed"
        >
          Your journey starts the moment you decide it does. Generate your
          first plan — we'll calibrate it to who you are today.
        </motion.p>
      </motion.div>

      <GlassCard
        variant="glow"
        shine
        className="mt-7 mx-0 p-6"
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="flex items-start gap-3 mb-4">
          <span className="inline-flex items-center justify-center h-10 w-10 rounded-2xl bg-gradient-to-br from-accent-purple/30 to-accent-blue/20 border border-white/10 shrink-0">
            <Sparkles className="h-4 w-4 text-accent-purple-bright" />
          </span>
          <div>
            <p className="text-[11px] uppercase tracking-[0.18em] text-text-muted font-semibold">
              AI-personalized
            </p>
            <h3 className="text-[20px] font-semibold text-white mt-0.5 leading-tight">
              Create your first plan
            </h3>
            <p className="text-[13px] text-text-secondary mt-1 leading-relaxed">
              Built from your profile — fitness level, training days, goals,
              and any injury history. Adapts as you progress.
            </p>
          </div>
        </div>

        <motion.button
          whileTap={{ scale: 0.97 }}
          whileHover={{ y: -1 }}
          onClick={generate}
          className="btn-primary w-full py-3.5 inline-flex items-center justify-center gap-2 font-semibold text-[14px]"
        >
          <Sparkles className="h-4 w-4" />
          Generate First Plan
        </motion.button>

        <p className="mt-3 text-center text-[11px] text-text-muted">
          Two weeks scheduled. You can regenerate anytime from Settings.
        </p>
      </GlassCard>

      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="mt-4 grid grid-cols-2 gap-3"
      >
        <button
          onClick={() => router.push("/coach")}
          className="stat-tile p-4 text-left active:scale-[0.98] transition-transform"
        >
          <MessageCircle className="h-4 w-4 mb-2 text-accent-blue-bright" />
          <div className="text-[13px] font-semibold text-white">
            Ask the coach
          </div>
          <div className="text-[11px] text-text-secondary mt-0.5">
            Get a quick answer before you start
          </div>
        </button>
        <button
          onClick={() => router.push("/settings")}
          className="stat-tile p-4 text-left active:scale-[0.98] transition-transform"
        >
          <Footprints className="h-4 w-4 mb-2 text-accent-purple-bright" />
          <div className="text-[13px] font-semibold text-white">
            Adjust your profile
          </div>
          <div className="text-[11px] text-text-secondary mt-0.5">
            Tweak goals or training days first
          </div>
        </button>
      </motion.div>
    </div>
  );
}

function greetingForName(name: string): string {
  const h = new Date().getHours();
  const tod =
    h < 5
      ? "Late night"
      : h < 12
        ? "Good morning"
        : h < 17
          ? "Good afternoon"
          : h < 21
            ? "Good evening"
            : "Tonight";
  if (!name) return `${tod}.`;
  return `${tod}, ${name}.`;
}
