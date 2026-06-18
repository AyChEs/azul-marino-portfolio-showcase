// Typography roles — Direction "D · El Messiri" (warm · friendly · family-first)
// EL MESSIRI (Arabic display) · DM SERIF DISPLAY (editorial italic titles)
// INTER (UI body) · AMIRI (Quranic verses only)

export const Fonts = {
  // Arabic display — wordmark نور, lifeline names, Arabic UI accents
  arabic: "ElMessiri_600SemiBold",
  arabicBold: "ElMessiri_700Bold",
  // Legacy aliases (kept so existing styles keep compiling)
  arabicItalic: "Amiri_400Regular_Italic",
  arabicBoldItalic: "Amiri_700Bold_Italic",
  // Quranic verses keep Amiri (mushaf feel)
  verse: "Amiri_400Regular",
  verseBold: "Amiri_700Bold",
  // Editorial titles — serif italic ("Fin del viaje", "Musafir", CTA labels)
  serif: "DMSerifDisplay_400Regular",
  serifItalic: "DMSerifDisplay_400Regular_Italic",
  // UI body / labels
  body: "Inter_400Regular",
  bodyMedium: "Inter_500Medium",
  bodySemiBold: "Inter_600SemiBold",
  bodyBold: "Inter_700Bold",
} as const;

export const FontSizes = {
  arabicVerse: 28,
  arabicLarge: 24,
  arabicBody: 20,
  display: 32,
  headline: 24,
  title: 20,
  body: 16,
  caption: 13,
  micro: 11,
} as const;

// Micro section labels ("MODO DE JUEGO", "COMODINES", "RANK · 1/4")
export const MicroLabel = {
  fontFamily: Fonts.bodySemiBold,
  fontSize: 11,
  letterSpacing: 1.8,
  textTransform: "uppercase" as const,
} as const;
