"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface AppLogoProps {
  className?: string;
  size?: number;
  /** Skip the tap/hover micro-animation for static contexts (loaders, splash). */
  static?: boolean;
  /** Strip the rounded chrome and just render the logo art (useful for plain placements). */
  bare?: boolean;
}

/**
 * The official Nexa Motion logo. Renders the PNG asset at /public/nexa-logo.png
 * directly via next/image so it stays pixel-perfect at every render size.
 */
export function AppLogo({
  className,
  size = 44,
  static: isStatic = false,
  bare = false,
}: AppLogoProps) {
  // Asset includes the black background + orbital ring, so we only need a thin
  // border ring at most for inline placements. When `bare` is true we strip
  // even that.
  const wrapperClasses = bare
    ? "relative inline-block"
    : "relative inline-flex items-center justify-center rounded-2xl overflow-hidden border border-white/8 shadow-glass";

  const inner = (
    <Image
      src="/nexa-logo.png"
      alt="Nexa Motion"
      width={size * 2}
      height={size * 2}
      priority
      sizes={`${size}px`}
      className="select-none pointer-events-none"
      style={{ width: size, height: size, display: "block" }}
    />
  );

  if (isStatic) {
    return (
      <div
        className={cn(wrapperClasses, className)}
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
      className={cn(wrapperClasses, className)}
      style={{ width: size, height: size }}
    >
      {inner}
    </motion.div>
  );
}
