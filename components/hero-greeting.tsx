"use client";

import { motion } from "framer-motion";
import { Sparkles, Cloud, Sun, CloudRain, Wind } from "lucide-react";
import { useNexaStore } from "@/lib/store";
import { sampleWeather } from "@/lib/sample-data";
import { getGreeting } from "@/lib/utils";

const WEATHER_ICONS = {
  clear: Sun,
  cloudy: Cloud,
  rain: CloudRain,
  snow: Cloud,
  wind: Wind,
  fog: Cloud,
} as const;

export function HeroGreeting() {
  const name = useNexaStore((s) => s.profile.name);
  const greeting = getGreeting();
  const WeatherIcon = WEATHER_ICONS[sampleWeather.condition];

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

      <div className="mt-3 flex items-center gap-2 flex-wrap">
        <motion.div
          whileTap={{ scale: 0.97 }}
          className="glass-pill rounded-full px-3 py-1.5 inline-flex items-center gap-1.5"
        >
          <WeatherIcon className="h-3.5 w-3.5 text-accent-blue-bright" />
          <span className="text-xs font-medium text-text-secondary">
            {sampleWeather.tempF}°F · feels {sampleWeather.feelsLikeF}°
          </span>
        </motion.div>
        <motion.div
          whileTap={{ scale: 0.97 }}
          className="glass-pill rounded-full px-3 py-1.5 inline-flex items-center gap-1.5"
        >
          <Sparkles className="h-3.5 w-3.5 text-accent-purple-bright" />
          <span className="text-xs font-medium text-text-secondary">
            AI plan ready
          </span>
        </motion.div>
      </div>
    </motion.section>
  );
}
