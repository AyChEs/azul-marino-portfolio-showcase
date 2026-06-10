/**
 * Madrasa / Cuaderno de Estudio design tokens (Dirección E).
 * Paper is the dominant surface; emerald is reserved for the notebook
 * "spine" header, primary buttons and selection accents.
 */

export type PaperVariant = 'linen' | 'pergamino' | 'antiguo';

export interface PaperTokens {
  paper: string;
  paperHi: string;
  paperDeep: string;
  paperSoft: string;
}

export const PaperVariants: Record<PaperVariant, PaperTokens> = {
  linen: { paper: '#ebe6d8', paperHi: '#f3eee0', paperDeep: '#cdc4a8', paperSoft: '#dcd5c0' },
  pergamino: { paper: '#f3ead4', paperHi: '#f9f1de', paperDeep: '#dfd1a4', paperSoft: '#ebe0c0' },
  antiguo: { paper: '#e8d8b0', paperHi: '#f0e2c0', paperDeep: '#c8af7a', paperSoft: '#d9c498' },
} as const;

export const Colors = {
  // Paper — dominant background ("pergamino" defaults; runtime variant via ThemeContext)
  paper: '#f3ead4',
  paperSoft: '#ebe0c0',
  paperDeep: '#dfd1a4',
  paperHi: '#f9f1de',

  // Brand cover (splash / logo presentation)
  coverTeal: '#0d2922',
  cream: '#f3ead4',

  // Ink — green-tinted text, never pure black
  ink: '#1f2e26',
  inkSoft: '#3d4f47',
  inkMuted: 'rgba(31,46,38,0.55)',
  inkDim: 'rgba(31,46,38,0.32)',

  // Emerald — ACCENT, not background
  emerald: '#176c4d',
  emeraldDeep: '#0d4a36',
  emeraldHi: '#28956b',
  emeraldGlow: 'rgba(23,108,77,0.10)',

  // Dusty gold — numerals, small accents, lifelines
  gold: '#b88a3f',
  goldHi: '#d4a85a',

  // Terracotta — non-success states
  terracotta: '#b85a3d',

  // Hairlines
  hairline: 'rgba(31,46,38,0.10)',
  hairlineStrong: 'rgba(31,46,38,0.22)',

  // Game states
  correctBg: 'rgba(23,108,77,0.10)',
  incorrectBg: 'rgba(184,90,61,0.10)',

  // Flashcard surface
  flashcard: '#fffaf0',
  white: '#ffffff',
} as const;
