// Islamic palette — informs all design decisions
// Follows design-taste principles: max 1 accent, no pure black, no purple AI gradient

export const Colors = {
  // Background hierarchy (dark mode — mosque-garden greens)
  bg: {
    primary: "#0a2a1a",    // deepest background — like a mosque garden at night
    secondary: "#0f3d2e",  // card surfaces
    tertiary: "#155e40",   // elevated elements
    overlay: "rgba(10, 42, 26, 0.95)",
  },

  // Single emerald accent — all primary CTAs
  accent: {
    emerald: "#10b981",
    emeraldLight: "#34d399",
    emeraldDark: "#059669",
  },

  // Gold — secondary accent (correct answers, stars, Islamic ornament)
  gold: {
    primary: "#d4af37",
    light: "#e8c96b",
    muted: "#c8a84b",
  },

  // Parchment — text on dark backgrounds, light surface elements
  parchment: {
    primary: "#fdf6e3",   // main light text / light screen background
    secondary: "#f5edce",
    muted: "#e8d9a0",
  },

  // Semantic game states
  correct: "#16a34a",
  incorrect: "#dc2626",
  timer: {
    full: "#10b981",
    medium: "#f59e0b",
    low: "#dc2626",
  },

  // Text
  text: {
    primary: "#fdf6e3",   // on dark bg
    secondary: "rgba(253, 246, 227, 0.7)",
    muted: "rgba(253, 246, 227, 0.4)",
    onLight: "#0a2a1a",   // on parchment bg
  },

  // Borders — hairline, never harsh (design-taste: no generic 1px solid gray)
  border: {
    subtle: "rgba(253, 246, 227, 0.1)",
    medium: "rgba(253, 246, 227, 0.2)",
    gold: "rgba(212, 175, 55, 0.3)",
    emerald: "rgba(16, 185, 129, 0.3)",
  },
} as const;
