import type { Config } from "tailwindcss";
import typography from "@tailwindcss/typography";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        // Waynautic Design System §3.1
        sans:    ["IBM Plex Sans",  "var(--font-body)",    "system-ui", "sans-serif"],
        display: ["Space Grotesk", "var(--font-heading)", "system-ui", "sans-serif"],
        mono:    ["IBM Plex Mono",  "var(--font-mono)",   "ui-monospace", "monospace"],
        // legacy aliases kept for compatibility with existing components
        heading: ["Space Grotesk", "var(--font-heading)", "system-ui", "sans-serif"],
        body:    ["IBM Plex Sans",  "var(--font-body)",    "system-ui", "sans-serif"],
      },
      colors: {
        // Waynautic Design System §2.1 – Core palette
        navy: {
          950: "#0a1330",
          900: "#0a1128",
          800: "#0f1a3d",
          700: "#152452",
        },
        paper:    "#f4f6f8",
        "paper-2": "#eceff2",
        ink:      "#14181f",
        "ink-soft": "#4a5364",
        line:     "#d8dee4",
        brand: {
          blue:    "#1a3fb0",
          cyan:    "#29abe2",
          violet:  "#7c3aed",
          magenta: "#d946a8",
        },
      },
      backgroundImage: {
        // Waynautic Design System §2.2 – Gradients
        "brand-gradient":
          "linear-gradient(115deg, #1a3fb0 0%, #29abe2 32%, #7c3aed 68%, #d946a8 100%)",
        "button-gradient":
          "linear-gradient(100deg, #1a3fb0, #29abe2)",
        "mesh-light":
          "radial-gradient(ellipse 80% 60% at 20% 0%, rgba(41,171,226,0.14), transparent 60%), " +
          "radial-gradient(ellipse 60% 50% at 100% 10%, rgba(124,58,237,0.12), transparent 60%), " +
          "radial-gradient(ellipse 60% 50% at 50% 100%, rgba(217,70,168,0.08), transparent 60%)",
      },
      boxShadow: {
        // Waynautic Design System §5 – Shadows
        soft: "0 1px 2px rgba(10,17,40,0.04), 0 8px 24px -8px rgba(10,17,40,0.08)",
        card: "0 2px 8px rgba(10,17,40,0.04), 0 16px 40px -12px rgba(10,17,40,0.12)",
        glow: "0 0 0 1px rgba(41,171,226,0.15), 0 8px 32px -8px rgba(124,58,237,0.25)",
      },
      borderRadius: {
        // §5 – Corners
        DEFAULT: "8px",
      },
      maxWidth: {
        "8xl": "88rem",
      },
    },
  },
  plugins: [typography],
};

export default config;
