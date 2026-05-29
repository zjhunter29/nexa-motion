export type ShareTheme = "minimal" | "dark" | "signature";

export interface ThemeMeta {
  id: ShareTheme;
  label: string;
  description: string;
  preview: {
    background: string;
    text: string;
    accent: string;
  };
}

export const THEMES: ThemeMeta[] = [
  {
    id: "signature",
    label: "Nexa Signature",
    description: "Official branded — gradients + glow",
    preview: {
      background: "linear-gradient(135deg, #0A0A14 0%, #1a0a2e 50%, #050507 100%)",
      text: "#FFFFFF",
      accent: "#C084FC",
    },
  },
  {
    id: "dark",
    label: "Dark Glass",
    description: "Frosted glass on black",
    preview: {
      background: "linear-gradient(135deg, #0F0F18 0%, #060608 100%)",
      text: "#F5F5F7",
      accent: "#60A5FA",
    },
  },
  {
    id: "minimal",
    label: "Minimal",
    description: "Clean white — high-contrast",
    preview: {
      background: "#FAFAFA",
      text: "#0A0A0A",
      accent: "#7C3AED",
    },
  },
];

export type ShareAspect = "square" | "portrait" | "story" | "landscape";

export interface AspectMeta {
  id: ShareAspect;
  label: string;
  hint: string;
  width: number;
  height: number;
}

export const ASPECTS: AspectMeta[] = [
  { id: "square", label: "Square", hint: "Instagram feed", width: 1080, height: 1080 },
  {
    id: "portrait",
    label: "Portrait",
    hint: "Instagram / TikTok",
    width: 1080,
    height: 1350,
  },
  { id: "story", label: "Story", hint: "IG / TT stories", width: 1080, height: 1920 },
  {
    id: "landscape",
    label: "Landscape",
    hint: "X / Discord",
    width: 1920,
    height: 1080,
  },
];

export interface ShareContentToggles {
  showExercises: boolean;
  showSets: boolean;
  showDuration: boolean;
  showDifficulty: boolean;
  showGoal: boolean;
  showBranding: boolean;
}

export const DEFAULT_TOGGLES: ShareContentToggles = {
  showExercises: true,
  showSets: true,
  showDuration: true,
  showDifficulty: true,
  showGoal: true,
  showBranding: true,
};
