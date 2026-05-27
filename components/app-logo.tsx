"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface AppLogoProps {
  className?: string;
  size?: number;
  showRing?: boolean;
  /** Skip ambient halo + tap/hover animation for static contexts. */
  static?: boolean;
}

export function AppLogo({
  className,
  size = 44,
  showRing = true,
  static: isStatic = false,
}: AppLogoProps) {
  const inner = (
    <svg
      viewBox="0 0 1024 1024"
      width="100%"
      height="100%"
      className="relative z-10"
      preserveAspectRatio="xMidYMid meet"
      aria-label="Nexa Motion logo"
    >
      <defs>
        <linearGradient id="nm-ring" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#C084FC" />
          <stop offset="0.5" stopColor="#7C3AED" />
          <stop offset="1" stopColor="#9333EA" />
        </linearGradient>
      </defs>

      {/* Orbital ring — back half */}
      <g transform="translate(512 512) rotate(-22)">
        <path
          d="M -420,0 A 420,140 0 0,1 420,0"
          fill="none"
          stroke="url(#nm-ring)"
          strokeWidth="48"
          strokeLinecap="round"
          opacity="0.95"
        />
      </g>

      {/* Italicized N: right leg + diagonal + left leg */}
      <g fill="#FFFFFF">
        <path d="M 760,80 L 850,180 L 720,740 L 590,740 L 700,180 Z" />
        <path d="M 330,340 L 460,340 L 720,740 L 590,740 Z" />
        <path d="M 300,1000 L 370,900 L 460,340 L 330,340 L 200,900 Z" />
      </g>

      {/* Orbital ring — front half */}
      <g transform="translate(512 512) rotate(-22)">
        <path
          d="M 420,0 A 420,140 0 0,1 -420,0"
          fill="none"
          stroke="url(#nm-ring)"
          strokeWidth="48"
          strokeLinecap="round"
          opacity="0.95"
        />
      </g>
    </svg>
  );

  if (isStatic) {
    return (
      <div
        className={cn(
          "relative inline-flex items-center justify-center rounded-2xl overflow-hidden",
          "bg-black",
          "border border-white/10",
          className,
        )}
        style={{ width: size, height: size }}
      >
        {inner}
      </div>
    );
  }

  return (
    <motion.div
      whileTap={{ scale: 0.92 }}
      whileHover={{ scale: 1.04 }}
      className={cn(
        "relative inline-flex items-center justify-center rounded-2xl overflow-hidden",
        "bg-black",
        "border border-white/10 backdrop-blur-xl",
        "shadow-glass",
        className,
      )}
      style={{ width: size, height: size }}
    >
      {showRing && (
        <motion.div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-br from-accent-purple/15 to-accent-blue/5 blur-md"
          animate={{ opacity: [0.4, 0.7, 0.4] }}
          transition={{ duration: 4.2, repeat: Infinity, ease: "easeInOut" }}
        />
      )}
      {inner}
    </motion.div>
  );
}
