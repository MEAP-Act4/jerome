import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        green: {
          950: "#143D30",
          900: "#1E6047",
          800: "#2A7A5A",
          700: "#3A9470",
          600: "#4DAE88",
          500: "#66C7A0",
          400: "#85D6B5",
          300: "#A8E4CA",
          200: "#C9F0DE",
          100: "#E6F8F0",
          50: "#F2FBF7",
        },
        lime: {
          400: "#CFEB89",
          300: "#DFF2A8",
          200: "#EEF8C7",
          100: "#F7FCE3",
        },
        cream: {
          50: "rgb(var(--cream-50) / <alpha-value>)",
          100: "rgb(var(--cream-100) / <alpha-value>)",
          200: "rgb(var(--cream-200) / <alpha-value>)",
        },
        surface: {
          DEFAULT: "rgb(var(--surface) / <alpha-value>)",
          white: "rgb(var(--surface-white) / <alpha-value>)",
          border: "rgb(var(--surface-border) / <alpha-value>)",
        },
        text: {
          primary: "rgb(var(--text-primary) / <alpha-value>)",
          muted: "rgb(var(--text-muted) / <alpha-value>)",
        },
        accent: {
          DEFAULT: "rgb(var(--accent) / <alpha-value>)",
          strong: "rgb(var(--accent-strong) / <alpha-value>)",
        },
        violet: {
          100: "#E8E4F0",
          500: "#7C6BAE",
        },
        orange: {
          100: "#FDF0E4",
          500: "#D4884A",
        },
        blue: {
          100: "#E4EDF5",
          500: "#4A7FA5",
        },
        red: {
          100: "#F5E4E4",
          500: "#C05050",
        },
      },
      fontFamily: {
        serif: ["Newsreader", "Georgia", "serif"],
        sans: ["Manrope", "system-ui", "sans-serif"],
        mono: ["DM Mono", "monospace"],
      },
      borderRadius: {
        card: "14px",
      },
      boxShadow: {
        card: "0 1px 3px rgba(20, 61, 48, 0.06), 0 1px 2px rgba(20, 61, 48, 0.04)",
        "card-hover": "0 4px 12px rgba(20, 61, 48, 0.10), 0 2px 4px rgba(20, 61, 48, 0.06)",
      },
    },
  },
  plugins: [],
};
export default config;
