// Amiri: classical Arabic typeface — authentic, elegant, highly legible
// Latin: system font — clean, never Inter (banned by high-end skill)

export const Fonts = {
  arabic: "Amiri_400Regular",
  arabicBold: "Amiri_700Bold",
  arabicItalic: "Amiri_400Italic",
  arabicBoldItalic: "Amiri_700BoldItalic",
} as const;

export const FontSizes = {
  // Arabic verse display — large, commanding
  arabicVerse: 28,
  arabicLarge: 24,
  arabicBody: 20,

  // UI text
  display: 32,
  headline: 24,
  title: 20,
  body: 16,
  caption: 13,
  micro: 11,
} as const;

export const LineHeights = {
  arabic: 1.8,   // Arabic text needs more leading
  latin: 1.4,
  tight: 1.2,
} as const;
