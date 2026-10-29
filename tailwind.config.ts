import type { Config } from "tailwindcss";

/** Cores semânticas: os valores vivem em `app/globals.css` como canais RGB. */
function token(name: string) {
  return `rgb(var(--color-${name}) / <alpha-value>)`;
}

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ["var(--font-display)", "sans-serif"],
        sans: ["var(--font-sans)", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      colors: {
        bg: token("bg"),
        surface: token("surface"),
        elevated: token("elevated"),
        fg: token("fg"),
        muted: token("muted"),
        subtle: token("subtle"),
        line: {
          DEFAULT: token("line"),
          strong: token("line-strong"),
        },
        accent: {
          DEFAULT: token("accent"),
          hover: token("accent-hover"),
          ink: token("accent-ink"),
        },
        copper: token("copper"),
      },
      fontSize: {
        "display-1": ["clamp(3.25rem, 9.5vw, 8.25rem)", { lineHeight: "0.88", letterSpacing: "-0.035em" }],
        "display-2": ["clamp(2.25rem, 5.2vw, 4.25rem)", { lineHeight: "0.98", letterSpacing: "-0.03em" }],
        "display-3": ["clamp(1.625rem, 3vw, 2.25rem)", { lineHeight: "1.1", letterSpacing: "-0.02em" }],
        eyebrow: ["0.6875rem", { lineHeight: "1rem", letterSpacing: "0.16em" }],
      },
      maxWidth: {
        prose: "68ch",
        page: "84rem",
      },
      borderRadius: {
        card: "4px",
      },
      transitionTimingFunction: {
        "out-expo": "cubic-bezier(0.16, 1, 0.3, 1)",
      },
    },
  },
  plugins: [],
};

export default config;
