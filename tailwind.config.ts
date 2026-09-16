import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "#8B5CF6", // Refined Purple Brand Accent
          hover: "#7C3AED",
          subtle: "rgba(139, 92, 246, 0.12)",
          border: "rgba(139, 92, 246, 0.25)",
        },
        surface: {
          base: "#090D16", // Deep Dark Page Background
          card: "#111726", // Card / Panel Surface
          subtle: "#161F33", // Elevated / Input Surface
          hover: "#1C263D", // Hover State
          border: "#1F2A3F", // Crisp Border
          "border-subtle": "#162032",
        },
        text: {
          primary: "#F8FAFC",
          secondary: "#CBD5E1",
          muted: "#64748B",
          dim: "#475569",
        },
        wage: {
          DEFAULT: "#10B981", // Crisp Emerald Wage
          hover: "#059669",
          subtle: "rgba(16, 185, 129, 0.12)",
        },
        sos: {
          DEFAULT: "#F43F5E", // Urgent Red
          subtle: "rgba(244, 63, 94, 0.12)",
        },
      },
      borderRadius: {
        xs: "4px",
        sm: "6px",
        md: "6px", // Standard component radius: 6px
        lg: "8px", // Sub-panel radius: 8px
        xl: "12px", // Main card / modal radius: 12px
      },
      maxWidth: {
        mobile: "480px",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "sans-serif"],
        mono: ["ui-monospace", "SFMono-Regular", "Menlo", "Monaco", "Consolas", "monospace"],
      },
      boxShadow: {
        flat: "0 1px 2px 0 rgba(0, 0, 0, 0.25)",
        card: "0 2px 8px -1px rgba(0, 0, 0, 0.35)",
        modal: "0 20px 40px -10px rgba(0, 0, 0, 0.6)",
      },
    },
  },
  plugins: [],
};
export default config;
