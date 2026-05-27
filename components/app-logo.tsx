"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface AppLogoProps {
  className?: string;
  size?: number;
  showRing?: boolean;
}

export function AppLogo({ className, size = 44, showRing = true }: AppLogoProps) {
  return (
    <motion.div
      whileTap={{ scale: 0.92 }}
      whileHover={{ scale: 1.04 }}
      className={cn(
        "relative inline-flex items-center justify-center rounded-full",
        "bg-gradient-to-br from-white/10 to-white/[0.02]",
        "border border-white/12 backdrop-blur-xl",
        "shadow-glass",
        className,
      )}
      style={{ width: size, height: size }}
    >
      {/* Animated inner pulse */}
      {showRing && (
        <motion.div
          aria-hidden
          className="absolute inset-1.5 rounded-full bg-gradient-to-br from-accent-purple/40 to-accent-blue/30 blur-sm"
          animate={{ opacity: [0.4, 0.7, 0.4], scale: [0.9, 1.05, 0.9] }}
          transition={{ duration: 3.6, repeat: Infinity, ease: "easeInOut" }}
        />
      )}
      <svg
        viewBox="0 0 24 24"
        width={size * 0.5}
        height={size * 0.5}
        className="relative z-10"
        fill="none"
      >
        <defs>
          <linearGradient id="logoGrad" x1="0" y1="0" x2="24" y2="24">
            <stop offset="0" stopColor="#C084FC" />
            <stop offset="1" stopColor="#60A5FA" />
          </linearGradient>
        </defs>
        <path
          d="M4 18 L9 6 L13 14 L15.5 10 L20 18"
          stroke="url(#logoGrad)"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </motion.div>
  );
}
