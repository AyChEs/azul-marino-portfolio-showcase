/** Typeface roles for the Madrasa design system. */
export type TypographicVoice = 'editorial' | 'amable' | 'clasica';

export const Fonts = {
  // Arabic display + UI
  arabic: 'ElMessiri_600SemiBold',
  arabicBold: 'ElMessiri_700Bold',
  // Latin display
  display: 'DMSerifDisplay_400Regular',
  displayItalic: 'DMSerifDisplay_400Regular_Italic',
  // Body / UI
  body: 'Inter_400Regular',
  bodyMedium: 'Inter_500Medium',
  bodySemiBold: 'Inter_600SemiBold',
  bodyBold: 'Inter_700Bold',
  // Numerals / mono labels
  mono: 'JetBrainsMono_400Regular',
  monoMedium: 'JetBrainsMono_500Medium',
  monoBold: 'JetBrainsMono_700Bold',
} as const;

/** Title font for the chosen typographic voice (section 4.5 tweak #2). */
export function titleFontFor(voice: TypographicVoice): {
  fontFamily: string;
  fontStyle?: 'italic' | 'normal';
} {
  switch (voice) {
    case 'amable':
      return { fontFamily: Fonts.arabic, fontStyle: 'normal' };
    case 'clasica':
      // Fraunces is the spec'd fallback; DM Serif upright stands in until it ships.
      return { fontFamily: Fonts.display, fontStyle: 'normal' };
    case 'editorial':
    default:
      return { fontFamily: Fonts.displayItalic, fontStyle: 'italic' };
  }
}
