import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#050507",
        surface: {
          DEFAULT: "#0A0A12",
          elevated: "#11111C",
          high: "#17172A",
        },
        text: {
          primary: "#F5F5F7",
          secondary: "#A8A8B3",
          muted: "#71717A",
          dim: "#4A4A55",
        },
        accent: {
          purple: "#A855F7",
          "purple-bright": "#C084FC",
          blue: "#3B82F6",
          "blue-bright": "#60A5FA",
          cyan: "#06B6D4",
          pink: "#EC4899",
          green: "#10B981",
          amber: "#F59E0B",
          red: "#EF4444",
        },
        glass: {
          DEFAULT: "rgba(255, 255, 255, 0.04)",
          strong: "rgba(255, 255, 255, 0.08)",
          subtle: "rgba(255, 255, 255, 0.02)",
          border: "rgba(255, 255, 255, 0.10)",
          "border-strong": "rgba(255, 255, 255, 0.16)",
        },
      },
      fontFamily: {
        sans: [
          "var(--font-inter)",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "sans-serif",
        ],
        display: [
          "var(--font-inter)",
          "ui-sans-serif",
          "system-ui",
          "sans-serif",
        ],
      },
      backgroundImage: {
        "radial-glow":
          "radial-gradient(ellipse at top, rgba(168, 85, 247, 0.15), transparent 60%)",
        "purple-fade":
          "linear-gradient(135deg, rgba(168, 85, 247, 0.20), rgba(59, 130, 246, 0.10))",
        "glass-shine":
          "linear-gradient(135deg, rgba(255,255,255,0.08), rgba(255,255,255,0.02))",
        "card-gradient":
          "linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0.01))",
      },
      boxShadow: {
        glass:
          "0 8px 32px 0 rgba(0, 0, 0, 0.5), inset 0 1px 0 0 rgba(255, 255, 255, 0.06)",
        "glass-lg":
          "0 16px 48px 0 rgba(0, 0, 0, 0.6), inset 0 1px 0 0 rgba(255, 255, 255, 0.08)",
        "glow-purple":
          "0 0 40px rgba(168, 85, 247, 0.25), 0 0 80px rgba(168, 85, 247, 0.10)",
        "glow-blue":
          "0 0 40px rgba(59, 130, 246, 0.25), 0 0 80px rgba(59, 130, 246, 0.10)",
        "inner-glow": "inset 0 1px 0 0 rgba(255, 255, 255, 0.1)",
      },
      animation: {
        "gradient-shift": "gradient-shift 16s ease infinite",
        "pulse-glow": "pulse-glow 3s ease-in-out infinite",
        "float-slow": "float-slow 8s ease-in-out infinite",
        "float-medium": "float-medium 6s ease-in-out infinite",
        shimmer: "shimmer 2.5s linear infinite",
        "fade-up": "fade-up 0.6s ease-out",
        "scale-in": "scale-in 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
      },
      keyframes: {
        "gradient-shift": {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
        },
        "pulse-glow": {
          "0%, 100%": { opacity: "0.4", transform: "scale(1)" },
          "50%": { opacity: "0.7", transform: "scale(1.05)" },
        },
        "float-slow": {
          "0%, 100%": { transform: "translate(0, 0)" },
          "50%": { transform: "translate(20px, -30px)" },
        },
        "float-medium": {
          "0%, 100%": { transform: "translate(0, 0)" },
          "50%": { transform: "translate(-20px, 20px)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "scale-in": {
          "0%": { opacity: "0", transform: "scale(0.96)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
      },
      backdropBlur: {
        xs: "2px",
        "3xl": "64px",
      },
      borderRadius: {
        "4xl": "2rem",
        "5xl": "2.5rem",
      },
    },
  },
  plugins: [],
};

export default config;
