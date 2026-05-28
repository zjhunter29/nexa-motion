"use client";

import { motion } from "framer-motion";
import { useNexaStore } from "@/lib/store";
import { getGreeting } from "@/lib/utils";

export function HeroGreeting() {
  const name = useNexaStore((s) => s.profile.name);
  const greeting = getGreeting();

  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, delay: 0.05, ease: [0.16, 1, 0.3, 1] }}
      className="px-5 pb-3"
    >
      <h2 className="text-[15px] text-text-secondary font-medium">
        {greeting},
      </h2>
      <h3 className="mt-0.5 text-[28px] font-semibold tracking-tight text-white">
        {name || "Runner"}
      </h3>
    </motion.section>
  );
}
