"use client";

import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  CalendarDays,
  MessageCircle,
  Settings as SettingsIcon,
  BarChart3,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useNexaStore } from "@/lib/store";

const NAV_ITEMS = [
  { href: "/calendar", label: "Calendar", icon: CalendarDays },
  { href: "/", label: "Activity", icon: Activity },
  { href: "/analytics", label: "Stats", icon: BarChart3 },
  { href: "/coach", label: "Coach", icon: MessageCircle },
  { href: "/settings", label: "Settings", icon: SettingsIcon },
];

export function BottomNav() {
  const pathname = usePathname();
  const onboarded = useNexaStore((s) => s.profile.onboarded);
  const hydrated = useNexaStore((s) => s.hydrated);
  const shareModalOpen = useNexaStore((s) => s.shareModalOpen);

  if (!hydrated || !onboarded) return null;
  if (pathname?.startsWith("/onboarding")) return null;
  // Hide when the share modal is open so the user can see the full preview
  // and footer actions without the floating nav covering them.
  if (shareModalOpen) return null;

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 pointer-events-none"
      style={{ paddingBottom: "max(1rem, env(safe-area-inset-bottom))" }}
    >
      <div className="mx-auto max-w-[480px] px-4 pointer-events-none">
        <motion.div
          initial={{ y: 60, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{
            type: "spring",
            stiffness: 280,
            damping: 30,
            delay: 0.2,
          }}
          className="glass-panel-strong rounded-full px-2 py-2 pointer-events-auto shadow-glass-lg"
        >
          <ul className="flex items-center justify-between gap-1">
            {NAV_ITEMS.map((item) => {
              const active =
                item.href === "/"
                  ? pathname === "/"
                  : pathname?.startsWith(item.href);
              const Icon = item.icon;
              return (
                <li key={item.href} className="flex-1">
                  <Link
                    href={item.href}
                    className={cn(
                      "relative flex flex-col items-center justify-center py-2.5 rounded-full transition-colors",
                      "text-text-muted hover:text-text-primary",
                      active && "text-white",
                    )}
                  >
                    <AnimatePresence>
                      {active && (
                        <motion.span
                          layoutId="nav-pill"
                          className="absolute inset-0 rounded-full bg-gradient-to-br from-accent-purple/30 to-accent-blue/20 border border-white/15 shadow-glow-purple"
                          transition={{
                            type: "spring",
                            stiffness: 400,
                            damping: 32,
                          }}
                        />
                      )}
                    </AnimatePresence>
                    <span className="relative z-10 flex items-center justify-center">
                      <Icon
                        className={cn(
                          "h-5 w-5 transition-transform",
                          active && "drop-shadow-[0_0_12px_rgba(168,85,247,0.6)]",
                        )}
                        strokeWidth={active ? 2.4 : 2}
                      />
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </motion.div>
      </div>
    </nav>
  );
}
