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
        primary: {
          DEFAULT: "#4F46E5",
          hover: "#4338CA",
          light: "#EEF2FF",
        },
        secondary: {
          DEFAULT: "#0EA5E9",
          hover: "#0284C7",
          light: "#F0F9FF",
        },
        "accent-ai": {
          DEFAULT: "#8B5CF6",
          hover: "#7C3AED",
          light: "#F5F3FF",
        },
        "work-parttime": {
          DEFAULT: "#10B981",
          light: "#ECFDF5",
        },
        "work-fulltime": {
          DEFAULT: "#3B82F6",
          light: "#EFF6FF",
        },
        "work-gig": {
          DEFAULT: "#F59E0B",
          light: "#FFFBEB",
        },
        surface: {
          bg: "#F8FAFC",
          card: "#FFFFFF",
          border: "#E2E8F0",
        },
        content: {
          primary: "#0F172A",
          secondary: "#475569",
          muted: "#94A3B8",
        },
      },
      maxWidth: {
        mobile: "480px",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "sans-serif"],
      },
      boxShadow: {
        card: "0 2px 8px -1px rgba(0, 0, 0, 0.06), 0 1px 3px -1px rgba(0, 0, 0, 0.04)",
        floating: "0 10px 25px -5px rgba(79, 70, 229, 0.2), 0 8px 10px -6px rgba(79, 70, 229, 0.1)",
      },
    },
  },
  plugins: [],
};
export default config;
