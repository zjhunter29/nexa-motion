"use client";

import { forwardRef } from "react";
import type { Workout } from "@/lib/types";
import type { ShareAspect, ShareContentToggles, ShareTheme } from "./themes";

interface WorkoutCardArtProps {
  workout: Workout;
  theme: ShareTheme;
  aspect: ShareAspect;
  toggles: ShareContentToggles;
  /** Scale factor for on-screen preview vs export. */
  scale?: number;
}

/**
 * The actual artwork rendered for the share card. Sized to the export
 * dimensions and scaled down for preview. html-to-image rasterizes this
 * DOM node into a PNG.
 */
export const WorkoutCardArt = forwardRef<HTMLDivElement, WorkoutCardArtProps>(
  function WorkoutCardArt({ workout, theme, aspect, toggles, scale = 1 }, ref) {
    const dim = dimensionsFor(aspect);
    const palette = paletteFor(theme);
    const isLight = theme === "minimal";

    const dist = workout.totalDistance ? `${workout.totalDistance.toFixed(1)} mi` : null;
    const dur = workout.totalDuration
      ? `${Math.round(workout.totalDuration / 60)} min`
      : null;
    const difficulty = difficultyLabel(workout);

    const segments = [
      workout.warmup,
      workout.main,
      workout.cooldown,
    ].filter((s): s is NonNullable<typeof s> => !!s);

    return (
      <div
        ref={ref}
        style={{
          width: dim.width * scale,
          height: dim.height * scale,
          transform: `scale(${scale})`,
          transformOrigin: "top left",
        }}
      >
        <div
          style={{
            width: dim.width,
            height: dim.height,
            background: palette.background,
            color: palette.text,
            fontFamily:
              "Inter, ui-sans-serif, system-ui, -apple-system, Segoe UI, sans-serif",
            padding: `${dim.width * 0.06}px`,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            position: "relative",
          }}
        >
          {/* Signature theme accent glow */}
          {theme === "signature" && (
            <>
              <div
                aria-hidden
                style={{
                  position: "absolute",
                  top: -dim.width * 0.2,
                  left: -dim.width * 0.2,
                  width: dim.width * 0.7,
                  height: dim.width * 0.7,
                  background:
                    "radial-gradient(circle, rgba(168,85,247,0.35), transparent 60%)",
                  filter: "blur(40px)",
                  pointerEvents: "none",
                }}
              />
              <div
                aria-hidden
                style={{
                  position: "absolute",
                  bottom: -dim.width * 0.2,
                  right: -dim.width * 0.2,
                  width: dim.width * 0.65,
                  height: dim.width * 0.65,
                  background:
                    "radial-gradient(circle, rgba(59,130,246,0.25), transparent 60%)",
                  filter: "blur(40px)",
                  pointerEvents: "none",
                }}
              />
            </>
          )}

          {/* Header row — branding is mandatory */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: dim.width * 0.04,
              position: "relative",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: dim.width * 0.02 }}>
              <div
                style={{
                  width: dim.width * 0.08,
                  height: dim.width * 0.08,
                  borderRadius: dim.width * 0.018,
                  overflow: "hidden",
                  background: "#000",
                  border: `1px solid ${palette.divider}`,
                }}
              >
                {/* Real Nexa Motion logo */}
                <img
                  src="/nexa-logo.png"
                  alt=""
                  crossOrigin="anonymous"
                  style={{
                    width: "100%",
                    height: "100%",
                    display: "block",
                    objectFit: "cover",
                  }}
                />
              </div>
              <span
                style={{
                  fontSize: dim.width * 0.022,
                  fontWeight: 600,
                  letterSpacing: "0.18em",
                  textTransform: "uppercase",
                  opacity: 0.7,
                }}
              >
                Nexa Motion
              </span>
            </div>

            {toggles.showDifficulty && (
              <DifficultyBadge label={difficulty} palette={palette} dim={dim.width} />
            )}
          </div>

          {/* Title */}
          <div style={{ position: "relative" }}>
            <p
              style={{
                fontSize: dim.width * 0.022,
                fontWeight: 600,
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                opacity: 0.55,
                margin: 0,
              }}
            >
              {typeLabel(workout)}
            </p>
            <h1
              style={{
                fontSize: dim.width * 0.075,
                fontWeight: 700,
                lineHeight: 1.05,
                letterSpacing: "-0.02em",
                margin: `${dim.width * 0.012}px 0 0 0`,
                background:
                  theme === "signature"
                    ? "linear-gradient(120deg, #FFFFFF 0%, #E9D5FF 50%, #93C5FD 100%)"
                    : undefined,
                WebkitBackgroundClip: theme === "signature" ? "text" : undefined,
                WebkitTextFillColor:
                  theme === "signature" ? "transparent" : undefined,
              }}
            >
              {workout.title}
            </h1>
          </div>

          {/* Stat row */}
          {(dist || dur || toggles.showGoal) && (
            <div
              style={{
                display: "flex",
                gap: dim.width * 0.025,
                marginTop: dim.width * 0.05,
                position: "relative",
              }}
            >
              {dist && toggles.showDuration && (
                <StatPill label="Distance" value={dist} palette={palette} dim={dim.width} />
              )}
              {dur && toggles.showDuration && (
                <StatPill label="Duration" value={dur} palette={palette} dim={dim.width} />
              )}
              {toggles.showGoal && workout.main.trainingFocus && (
                <StatPill
                  label="Focus"
                  value={workout.main.trainingFocus}
                  palette={palette}
                  dim={dim.width}
                />
              )}
            </div>
          )}

          {/* Segments list */}
          {toggles.showExercises && segments.length > 0 && (
            <div
              style={{
                marginTop: dim.width * 0.06,
                flex: 1,
                display: "flex",
                flexDirection: "column",
                gap: dim.width * 0.022,
                position: "relative",
                overflow: "hidden",
              }}
            >
              {segments.slice(0, maxSegmentsFor(aspect)).map((seg, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: dim.width * 0.025,
                    paddingTop: dim.width * 0.02,
                    paddingBottom: dim.width * 0.02,
                    borderTop:
                      i === 0
                        ? `1px solid ${palette.divider}`
                        : "none",
                    borderBottom: `1px solid ${palette.divider}`,
                  }}
                >
                  <span
                    style={{
                      width: dim.width * 0.05,
                      fontSize: dim.width * 0.022,
                      opacity: 0.5,
                      letterSpacing: "0.18em",
                      textTransform: "uppercase",
                      fontWeight: 600,
                      paddingTop: dim.width * 0.005,
                    }}
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p
                      style={{
                        fontSize: dim.width * 0.028,
                        fontWeight: 700,
                        margin: 0,
                        letterSpacing: "-0.01em",
                      }}
                    >
                      {seg.label}
                    </p>
                    <p
                      style={{
                        fontSize: dim.width * 0.02,
                        opacity: 0.7,
                        margin: `${dim.width * 0.006}px 0 0 0`,
                        lineHeight: 1.4,
                      }}
                    >
                      {segmentSummary(seg, toggles)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Footer — branding is mandatory */}
          <div
            style={{
              marginTop: "auto",
              paddingTop: dim.width * 0.04,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              position: "relative",
            }}
          >
            <span
              style={{
                fontSize: dim.width * 0.018,
                opacity: 0.55,
                letterSpacing: "0.16em",
                textTransform: "uppercase",
                fontWeight: 600,
              }}
            >
              nexa-motion.vercel.app
            </span>
            <span
              style={{
                fontSize: dim.width * 0.018,
                opacity: 0.55,
                letterSpacing: "0.16em",
                textTransform: "uppercase",
                fontWeight: 600,
                color: palette.accent,
              }}
            >
              Built with Nexa Coach
            </span>
          </div>
        </div>

        {/* Fix outer scale wrap so outline matches scaled height */}
        <style>{`
          /* Reserve actual on-screen footprint matching the scaled size. */
        `}</style>
      </div>
    );
  },
);

// ─── pieces ────────────────────────────────────────────────────────────

function StatPill({
  label,
  value,
  palette,
  dim,
}: {
  label: string;
  value: string;
  palette: Palette;
  dim: number;
}) {
  return (
    <div
      style={{
        flex: 1,
        padding: `${dim * 0.025}px ${dim * 0.03}px`,
        borderRadius: dim * 0.025,
        background: palette.pill,
        border: `1px solid ${palette.divider}`,
        minWidth: 0,
      }}
    >
      <p
        style={{
          fontSize: dim * 0.018,
          opacity: 0.55,
          letterSpacing: "0.18em",
          textTransform: "uppercase",
          fontWeight: 600,
          margin: 0,
          whiteSpace: "nowrap",
        }}
      >
        {label}
      </p>
      <p
        style={{
          fontSize: dim * 0.038,
          fontWeight: 700,
          margin: `${dim * 0.004}px 0 0 0`,
          letterSpacing: "-0.01em",
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}
      >
        {value}
      </p>
    </div>
  );
}

function DifficultyBadge({
  label,
  palette,
  dim,
}: {
  label: string;
  palette: Palette;
  dim: number;
}) {
  return (
    <div
      style={{
        padding: `${dim * 0.012}px ${dim * 0.024}px`,
        borderRadius: 9999,
        background: `${palette.accent}22`,
        border: `1px solid ${palette.accent}55`,
        color: palette.accent,
        fontSize: dim * 0.018,
        letterSpacing: "0.16em",
        textTransform: "uppercase",
        fontWeight: 700,
      }}
    >
      {label}
    </div>
  );
}

// ─── data helpers ──────────────────────────────────────────────────────

function dimensionsFor(aspect: ShareAspect) {
  switch (aspect) {
    case "square":
      return { width: 1080, height: 1080 };
    case "portrait":
      return { width: 1080, height: 1350 };
    case "story":
      return { width: 1080, height: 1920 };
    case "landscape":
      return { width: 1920, height: 1080 };
  }
}

interface Palette {
  background: string;
  text: string;
  accent: string;
  pill: string;
  divider: string;
}

function paletteFor(theme: ShareTheme): Palette {
  switch (theme) {
    case "signature":
      return {
        background:
          "linear-gradient(135deg, #0A0A14 0%, #1a0a2e 50%, #050507 100%)",
        text: "#FFFFFF",
        accent: "#C084FC",
        pill: "rgba(255,255,255,0.05)",
        divider: "rgba(255,255,255,0.10)",
      };
    case "dark":
      return {
        background: "linear-gradient(135deg, #0F0F18 0%, #060608 100%)",
        text: "#F5F5F7",
        accent: "#60A5FA",
        pill: "rgba(255,255,255,0.04)",
        divider: "rgba(255,255,255,0.08)",
      };
    case "minimal":
      return {
        background: "#FAFAFA",
        text: "#0A0A0A",
        accent: "#7C3AED",
        pill: "rgba(0,0,0,0.04)",
        divider: "rgba(0,0,0,0.08)",
      };
  }
}

function typeLabel(w: Workout): string {
  return w.type.charAt(0).toUpperCase() + w.type.slice(1) + " session";
}

function difficultyLabel(w: Workout): string {
  switch (w.type) {
    case "recovery":
    case "easy":
      return "Easy";
    case "long":
      return "Endurance";
    case "tempo":
      return "Tempo";
    case "threshold":
      return "Threshold";
    case "interval":
      return "Intervals";
    case "race":
      return "Race";
    case "rest":
      return "Rest";
  }
}

function maxSegmentsFor(aspect: ShareAspect): number {
  switch (aspect) {
    case "square":
      return 3;
    case "portrait":
      return 4;
    case "story":
      return 6;
    case "landscape":
      return 3;
  }
}

function segmentSummary(
  s: NonNullable<Workout["warmup"]>,
  _t: ShareContentToggles,
): string {
  const parts: string[] = [];
  if (s.distanceMiles != null) parts.push(`${s.distanceMiles.toFixed(2)} mi`);
  if (s.reps != null && s.repDistanceMeters != null)
    parts.push(`${s.reps} × ${s.repDistanceMeters}m`);
  if (s.pace) parts.push(`@ ${s.pace}/mi`);
  if (s.restSec != null) parts.push(`rest ${s.restSec}s`);
  if (s.durationMinutes != null && parts.length === 0)
    parts.push(`${s.durationMinutes} min`);
  if (parts.length === 0 && s.notes) return s.notes;
  return parts.join(" · ");
}
