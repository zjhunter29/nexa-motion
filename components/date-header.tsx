"use client";

import { motion } from "framer-motion";
import { AppLogo } from "./app-logo";

export function DateHeader() {
  const today = new Date();
  const weekday = today.toLocaleDateString("en-US", { weekday: "long" });
  const monthDay = today.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
  });
  const short = `${today.getMonth() + 1}/${today.getDate()}/${today.getFullYear()}`;

  return (
    <motion.header
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="flex items-start justify-between safe-top px-5 pb-4"
    >
      <div>
        <p className="text-[11px] uppercase tracking-[0.22em] text-text-muted font-medium">
          {weekday}, {monthDay}
        </p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight text-white">
          {short}
        </h1>
      </div>
      <AppLogo size={44} />
    </motion.header>
  );
}
