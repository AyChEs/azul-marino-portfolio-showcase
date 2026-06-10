export type Difficulty = "easy" | "medium" | "hard";
export type Category = "Profetas" | "Seerah" | "Corán y General";
export type GameMode = Category | "mix";
export type Language = "es" | "en" | "ar";

export interface MultilingualText {
  es: string;
  en: string;
  ar: string;
}

export interface MultilingualOptions {
  es: string[];
  en: string[];
  ar: string[];
}

export interface Question {
  id: number;
  question: MultilingualText;
  options: MultilingualOptions;
  correctAnswer: MultilingualText;
  category: Category;
  difficulty: Difficulty;
  arabicVerse?: string;
  explanation: MultilingualText;
  // Auditoría (FASE 0)
  source?: string;
  verified?: boolean;
  flag?: boolean;
  correction_note?: string;
}

export interface Player {
  id: string;
  name: string;
  score: number;
  lives: number;
  lifelines: {
    fiftyFifty: number;
    extraTime: number;
    skip: number;
  };
  isEliminated: boolean;
}

export interface GameSession {
  mode: "musafir" | "majlis";
  category: GameMode;
  difficulty: Difficulty;
  language: Language;
  players: Player[];
  currentPlayerIndex: number;
  round: number;
  totalRounds: number;
  startedAt: number;
}

export interface GameResult {
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  rank: RankInfo;
  timeMs: number;
  language: Language;
}

export interface RankInfo {
  titleKey: string;
  descriptionKey: string;
  minScore: number;
}

export interface StoredStats {
  bestScore: number;
  gamesPlayed: number;
  totalCorrect: number;
  lastPlayedAt: number;
}
