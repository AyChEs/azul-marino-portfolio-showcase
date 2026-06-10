import type { Language } from "./types";

// RTL languages in this app
const RTL_LANGUAGES: Language[] = ["ar"];

export const isRTL = (lang: Language): boolean => RTL_LANGUAGES.includes(lang);

export const getTextAlign = (lang: Language): "left" | "right" =>
  isRTL(lang) ? "right" : "left";

export const getFlexDirection = (
  lang: Language
): "row" | "row-reverse" =>
  isRTL(lang) ? "row-reverse" : "row";

export const formatScore = (score: number): string =>
  `${Math.round(score)}`;

export const formatTime = (seconds: number): string => {
  if (seconds < 0) return "0";
  return `${Math.round(seconds)}`;
};

// Consistent color based on timer percentage (green → amber → red)
export const timerColor = (fraction: number): string => {
  if (fraction > 0.5) return "#10b981";  // emerald
  if (fraction > 0.25) return "#f59e0b"; // amber
  return "#dc2626";                       // red
};

export const clamp = (val: number, min: number, max: number): number =>
  Math.max(min, Math.min(max, val));
