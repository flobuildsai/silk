import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ["var(--font-display)", "ui-serif", "Georgia", "serif"],
        sans: ["var(--font-sans)", "ui-sans-serif", "system-ui"],
      },
      colors: {
        ink: {
          50: "#F7F7F5",
          100: "#EDECE7",
          200: "#D8D6CD",
          600: "#3A3A36",
          900: "#17171A",
        },
        silk: {
          accent: "#E94F37",
          accent2: "#6C63FF",
        },
      },
      boxShadow: {
        soft: "0 1px 2px rgba(23,23,26,0.04), 0 8px 24px rgba(23,23,26,0.06)",
      },
    },
  },
  plugins: [],
};

export default config;
