"use client";

import { motion } from "framer-motion";
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
} from "lucide-react";
import { useState } from "react";
import { useNexaStore } from "@/lib/store";
import { cn } from "@/lib/utils";

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

  const [notifs, setNotifs] = useState(true);
  const [reminders, setReminders] = useState(true);
  const [hapticEnabled, setHapticEnabled] = useState(true);

  const groups: Group[] = [
    {
      title: "Profile",
      rows: [
        {
          icon: User,
          label: "Name",
          value: profile.name,
          accent: "#C084FC",
          onClick: () => {
            const next = window.prompt("Your name", profile.name);
            if (next) updateProfile({ name: next });
          },
        },
        {
          icon: HeartPulse,
          label: "Fitness level",
          value: profile.fitnessLevel,
          accent: "#EC4899",
        },
        {
          icon: TargetIcon,
          label: "Goal",
          value: profile.goal.toUpperCase(),
          accent: "#60A5FA",
        },
      ],
    },
    {
      title: "Preferences",
      rows: [
        {
          icon: Ruler,
          label: "Units",
          value: profile.preferredUnits === "imperial" ? "Imperial (mi)" : "Metric (km)",
          accent: "#10B981",
          onClick: () =>
            updateProfile({
              preferredUnits:
                profile.preferredUnits === "imperial" ? "metric" : "imperial",
            }),
        },
        {
          icon: CalendarIcon,
          label: "Training days",
          value: `${profile.trainingDays.length} per week`,
          accent: "#F59E0B",
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
          onClick: () => updateProfile({ onboarded: false }),
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
                "This will erase your profile, history and chat. Continue?",
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
          transition={{ ...fadeUp.transition, delay: 0.05 + gi * 0.05 }}
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
                        "flex-1 text-[14px] font-medium",
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
  );
}

function Toggle({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
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
