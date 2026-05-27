"use client";

import { motion, type HTMLMotionProps } from "framer-motion";
import { forwardRef } from "react";
import { cn } from "@/lib/utils";

type Variant = "default" | "strong" | "subtle" | "glow";

interface GlassCardProps extends HTMLMotionProps<"div"> {
  variant?: Variant;
  glow?: boolean;
  shine?: boolean;
}

export const GlassCard = forwardRef<HTMLDivElement, GlassCardProps>(
  function GlassCard(
    { className, variant = "default", glow, shine, children, ...rest },
    ref,
  ) {
    return (
      <motion.div
        ref={ref}
        className={cn(
          "relative rounded-3xl overflow-hidden",
          variant === "default" && "glass-panel",
          variant === "strong" && "glass-panel-strong",
          variant === "subtle" &&
            "bg-white/[0.02] border border-white/5 backdrop-blur-xl",
          variant === "glow" && "glass-panel glow-border",
          glow && "shadow-glow-purple",
          shine && "shine-overlay",
          className,
        )}
        {...rest}
      >
        {children}
      </motion.div>
    );
  },
);
