"use client";

import { useMemo } from "react";
import { useNexaStore } from "./store";
import type { Units } from "./types";

export interface UnitFormatters {
  units: Units;
  distanceUnit: "mi" | "km";
  paceUnit: "/mi" | "/km";
  /** Format miles → "1.25 mi" or "2.01 km" depending on preference. */
  formatDistance: (miles: number) => string;
  /** Pace stored as min/mile; convert to /km if user prefers metric. */
  formatPace: (paceStr: string) => string;
  /** Convert miles → display number (for charts). */
  distanceValue: (miles: number) => number;
}

export function useUnits(): UnitFormatters {
  const units = useNexaStore((s) => s.profile.preferredUnits);
  return useMemo(() => buildFormatters(units), [units]);
}

/** Same formatters without the React subscription, for one-off use. */
export function unitsFormattersFor(units: Units): UnitFormatters {
  return buildFormatters(units);
}

function buildFormatters(units: Units): UnitFormatters {
  const isMetric = units === "metric";
  const distanceUnit = isMetric ? "km" : "mi";
  const paceUnit = isMetric ? "/km" : "/mi";

  function formatDistance(miles: number) {
    if (isMetric) {
      const km = miles * 1.609344;
      if (km < 0.1) return `${Math.round(km * 1000)} m`;
      return `${km.toFixed(2)} km`;
    }
    if (miles < 0.1) return `${Math.round(miles * 5280)} ft`;
    return `${miles.toFixed(2)} mi`;
  }

  function formatPace(paceStr: string) {
    if (!isMetric) return `${paceStr}${paceUnit}`;
    // Pace strings are stored as M'SS per mile. Convert to per-km.
    // km pace = mi pace * (1 / 1.609344)
    const m = paceStr.match(/^(\d+)['′:](\d{1,2})/);
    if (!m) return `${paceStr}${paceUnit}`;
    const minPerMile = parseInt(m[1], 10) + parseInt(m[2], 10) / 60;
    const minPerKm = minPerMile / 1.609344;
    const min = Math.floor(minPerKm);
    const sec = Math.round((minPerKm - min) * 60);
    return `${min}'${sec.toString().padStart(2, "0")}${paceUnit}`;
  }

  function distanceValue(miles: number) {
    return isMetric ? miles * 1.609344 : miles;
  }

  return {
    units,
    distanceUnit,
    paceUnit,
    formatDistance,
    formatPace,
    distanceValue,
  };
}
