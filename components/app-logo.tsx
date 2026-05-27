"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface AppLogoProps {
  className?: string;
  size?: number;
  showRing?: boolean;
  /** When true, omit the ambient ring glow + interaction animation (use for static contexts). */
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
      viewBox="0 0 512 512"
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
      <g transform="translate(256 256) rotate(-22)">
        <path
          d="M -210,0 A 210,72 0 0,1 210,0"
          fill="none"
          stroke="url(#nm-ring)"
          strokeWidth="22"
          strokeLinecap="round"
          opacity="0.95"
        />
      </g>

      {/* Stylized N */}
      <g fill="#FFFFFF">
        <polygon points="118,72 218,170 218,420 168,464 168,156" />
        <polygon points="218,170 270,170 348,422 296,422" />
        <polygon points="294,92 344,92 344,360 414,460 294,420" />
      </g>

      {/* Orbital ring — front half */}
      <g transform="translate(256 256) rotate(-22)">
        <path
          d="M 210,0 A 210,72 0 0,1 -210,0"
          fill="none"
          stroke="url(#nm-ring)"
          strokeWidth="22"
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
          "bg-gradient-to-br from-[#0A0A14] to-black",
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
        "bg-gradient-to-br from-[#0A0A14] to-black",
        "border border-white/10 backdrop-blur-xl",
        "shadow-glass",
        className,
      )}
      style={{ width: size, height: size }}
    >
      {showRing && (
        <motion.div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-br from-accent-purple/20 to-accent-blue/10 blur-md"
          animate={{ opacity: [0.4, 0.7, 0.4] }}
          transition={{ duration: 4.2, repeat: Infinity, ease: "easeInOut" }}
        />
      )}
      {inner}
    </motion.div>
  );
}
