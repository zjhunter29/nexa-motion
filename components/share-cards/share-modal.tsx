"use client";

import { motion } from "framer-motion";
import { useMemo, useRef, useState } from "react";
import {
  X,
  Download,
  Copy,
  Link as LinkIcon,
  Check,
  ImageIcon,
} from "lucide-react";
import { toPng } from "html-to-image";
import type { Workout } from "@/lib/types";
import { vibrate, HAPTIC } from "@/lib/haptics";
import { cn } from "@/lib/utils";
import {
  THEMES,
  ASPECTS,
  DEFAULT_TOGGLES,
  type ShareTheme,
  type ShareAspect,
  type ShareContentToggles,
} from "./themes";
import { WorkoutCardArt } from "./workout-card";

interface ShareModalProps {
  workout: Workout;
  onClose: () => void;
}

const TOGGLE_LABELS: {
  key: keyof ShareContentToggles;
  label: string;
}[] = [
  { key: "showDuration", label: "Duration & distance" },
  { key: "showExercises", label: "Segment list" },
  { key: "showSets", label: "Sets / reps" },
  { key: "showDifficulty", label: "Difficulty badge" },
  { key: "showGoal", label: "Focus" },
  { key: "showBranding", label: "Nexa branding" },
];

export function ShareModal({ workout, onClose }: ShareModalProps) {
  const [theme, setTheme] = useState<ShareTheme>("signature");
  const [aspect, setAspect] = useState<ShareAspect>("square");
  const [toggles, setToggles] = useState<ShareContentToggles>(DEFAULT_TOGGLES);
  const [copyState, setCopyState] = useState<"idle" | "done">("idle");
  const [linkState, setLinkState] = useState<"idle" | "done">("idle");
  const [busy, setBusy] = useState(false);
  const artRef = useRef<HTMLDivElement>(null);

  const previewScale = useMemo(() => {
    // Render at low scale into the preview pane; export at 1.0.
    const target = 280; // preview width in px
    const aspectMeta = ASPECTS.find((a) => a.id === aspect)!;
    return target / aspectMeta.width;
  }, [aspect]);

  function toggleKey(key: keyof ShareContentToggles) {
    setToggles((t) => ({ ...t, [key]: !t[key] }));
  }

  async function exportPng() {
    if (!artRef.current || busy) return;
    setBusy(true);
    vibrate(HAPTIC.select);
    try {
      const aspectMeta = ASPECTS.find((a) => a.id === aspect)!;
      const dataUrl = await toPng(artRef.current, {
        cacheBust: true,
        pixelRatio: 1,
        width: aspectMeta.width,
        height: aspectMeta.height,
        style: {
          // Override the preview-only scale transform on export.
          transform: "scale(1)",
          transformOrigin: "top left",
        },
      });
      const link = document.createElement("a");
      link.href = dataUrl;
      link.download = `nexa-motion-${slugify(workout.title)}-${aspect}.png`;
      link.click();
      vibrate(HAPTIC.success);
    } catch (err) {
      console.error("[share] export failed", err);
    } finally {
      setBusy(false);
    }
  }

  async function copyImage() {
    if (!artRef.current || busy) return;
    setBusy(true);
    vibrate(HAPTIC.tap);
    try {
      const aspectMeta = ASPECTS.find((a) => a.id === aspect)!;
      const dataUrl = await toPng(artRef.current, {
        cacheBust: true,
        pixelRatio: 1,
        width: aspectMeta.width,
        height: aspectMeta.height,
        style: { transform: "scale(1)", transformOrigin: "top left" },
      });
      const blob = await (await fetch(dataUrl)).blob();
      if (
        typeof navigator !== "undefined" &&
        "clipboard" in navigator &&
        "write" in navigator.clipboard
      ) {
        // ClipboardItem is gated on PNG MIME — modern browsers only
        const item = new ClipboardItem({ "image/png": blob });
        await navigator.clipboard.write([item]);
        setCopyState("done");
        vibrate(HAPTIC.success);
        setTimeout(() => setCopyState("idle"), 1800);
      } else {
        // Fallback: trigger download
        await exportPng();
      }
    } catch (err) {
      console.error("[share] copy failed", err);
    } finally {
      setBusy(false);
    }
  }

  function copyLink() {
    const url =
      typeof window !== "undefined"
        ? `${window.location.origin}/share/${workout.id}`
        : `/share/${workout.id}`;
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(url).then(() => {
        vibrate(HAPTIC.success);
        setLinkState("done");
        setTimeout(() => setLinkState("idle"), 1800);
      });
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 z-[55] bg-black/60 backdrop-blur-md flex items-end sm:items-center justify-center p-3 sm:p-4"
    >
      <motion.div
        initial={{ y: 60, opacity: 0, scale: 0.96 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: 60, opacity: 0, scale: 0.96 }}
        transition={{ type: "spring", stiffness: 320, damping: 32 }}
        onClick={(e) => e.stopPropagation()}
        className="glass-panel-strong rounded-3xl w-full max-w-[560px] shadow-glass-lg max-h-[92dvh] flex flex-col overflow-hidden"
      >
        {/* Header */}
        <div className="px-5 pt-5 pb-3 flex items-start justify-between border-b border-white/8">
          <div>
            <p className="text-[11px] uppercase tracking-[0.18em] text-text-muted font-semibold">
              Share workout
            </p>
            <h3 className="mt-0.5 text-lg font-semibold text-white">
              {workout.title}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="glass-pill h-9 w-9 rounded-full inline-flex items-center justify-center text-text-secondary hover:text-white"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto no-scrollbar px-5 py-4 space-y-4">
          {/* Preview */}
          <div className="flex justify-center">
            <div
              className="rounded-2xl overflow-hidden shadow-glass-lg"
              style={{
                width: 280,
                height: heightForPreview(aspect),
                position: "relative",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  overflow: "hidden",
                }}
              >
                <WorkoutCardArt
                  ref={artRef}
                  workout={workout}
                  theme={theme}
                  aspect={aspect}
                  toggles={toggles}
                  scale={previewScale}
                />
              </div>
            </div>
          </div>

          {/* Theme picker */}
          <Section title="Theme">
            <div className="grid grid-cols-3 gap-2">
              {THEMES.map((t) => {
                const active = theme === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => {
                      vibrate(HAPTIC.toggle);
                      setTheme(t.id);
                    }}
                    className={cn(
                      "rounded-2xl p-2 border text-left transition-all",
                      active
                        ? "border-accent-purple/60 bg-white/5"
                        : "border-white/8 bg-white/[0.02]",
                    )}
                  >
                    <div
                      className="w-full h-16 rounded-xl mb-2"
                      style={{ background: t.preview.background }}
                    />
                    <div className="text-[11px] font-semibold text-white truncate">
                      {t.label}
                    </div>
                    <div className="text-[9px] text-text-muted truncate">
                      {t.description}
                    </div>
                  </button>
                );
              })}
            </div>
          </Section>

          {/* Aspect picker */}
          <Section title="Format">
            <div className="grid grid-cols-4 gap-2">
              {ASPECTS.map((a) => {
                const active = aspect === a.id;
                return (
                  <button
                    key={a.id}
                    onClick={() => {
                      vibrate(HAPTIC.toggle);
                      setAspect(a.id);
                    }}
                    className={cn(
                      "rounded-2xl p-2.5 border text-center transition-all",
                      active
                        ? "border-accent-purple/60 bg-white/5"
                        : "border-white/8 bg-white/[0.02]",
                    )}
                  >
                    <div
                      className="mx-auto rounded-md bg-white/10 mb-1.5"
                      style={previewBoxStyle(a.id)}
                    />
                    <div className="text-[11px] font-semibold text-white">
                      {a.label}
                    </div>
                    <div className="text-[9px] text-text-muted truncate">
                      {a.hint}
                    </div>
                  </button>
                );
              })}
            </div>
          </Section>

          {/* Toggles */}
          <Section title="Include">
            <div className="grid grid-cols-2 gap-2">
              {TOGGLE_LABELS.map((t) => {
                const active = toggles[t.key];
                return (
                  <button
                    key={t.key}
                    onClick={() => {
                      vibrate(HAPTIC.toggle);
                      toggleKey(t.key);
                    }}
                    className={cn(
                      "flex items-center justify-between gap-2 rounded-2xl px-3 py-2 border text-left transition-all",
                      active
                        ? "border-accent-purple/40 bg-white/5"
                        : "border-white/8 bg-white/[0.02]",
                    )}
                  >
                    <span className="text-[12px] font-medium text-white truncate">
                      {t.label}
                    </span>
                    <span
                      className={cn(
                        "shrink-0 h-5 w-5 rounded-full inline-flex items-center justify-center",
                        active
                          ? "bg-accent-purple text-white"
                          : "border border-white/15",
                      )}
                    >
                      {active && <Check className="h-3 w-3" strokeWidth={3} />}
                    </span>
                  </button>
                );
              })}
            </div>
          </Section>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-white/8 space-y-2">
          <div className="grid grid-cols-3 gap-2">
            <FooterButton
              icon={Copy}
              label={copyState === "done" ? "Copied" : "Copy image"}
              done={copyState === "done"}
              onClick={copyImage}
              disabled={busy}
            />
            <FooterButton
              icon={LinkIcon}
              label={linkState === "done" ? "Copied" : "Copy link"}
              done={linkState === "done"}
              onClick={copyLink}
            />
            <FooterButton
              icon={ImageIcon}
              label="Preview"
              onClick={() => {
                window.open(`/share/${workout.id}`, "_blank");
              }}
            />
          </div>
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={exportPng}
            disabled={busy}
            className="btn-primary w-full py-3 inline-flex items-center justify-center gap-2 font-semibold text-[14px] disabled:opacity-50"
          >
            <Download className="h-4 w-4" />
            {busy ? "Rendering…" : "Download PNG"}
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <p className="text-[11px] uppercase tracking-[0.18em] text-text-muted font-semibold mb-2">
        {title}
      </p>
      {children}
    </div>
  );
}

function FooterButton({
  icon: Icon,
  label,
  onClick,
  disabled,
  done,
}: {
  icon: typeof Copy;
  label: string;
  onClick: () => void;
  disabled?: boolean;
  done?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "btn-ghost px-2 py-2.5 inline-flex items-center justify-center gap-1.5 text-[12px] font-semibold disabled:opacity-50",
        done && "text-accent-green",
      )}
    >
      <Icon className="h-3.5 w-3.5" />
      {label}
    </button>
  );
}

// ─── helpers ──────────────────────────────────────────────────────────

function heightForPreview(aspect: ShareAspect): number {
  switch (aspect) {
    case "square":
      return 280;
    case "portrait":
      return 350;
    case "story":
      return 498;
    case "landscape":
      return 158;
  }
}

function previewBoxStyle(aspect: ShareAspect): React.CSSProperties {
  switch (aspect) {
    case "square":
      return { width: 22, height: 22 };
    case "portrait":
      return { width: 18, height: 22 };
    case "story":
      return { width: 14, height: 24 };
    case "landscape":
      return { width: 28, height: 16 };
  }
}

function slugify(s: string) {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}
