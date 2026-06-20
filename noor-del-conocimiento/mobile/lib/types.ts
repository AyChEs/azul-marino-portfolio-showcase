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
  // Extended metrics (optional for backward-compat with v1 saves; default 0).
  perfectGames?: number;       // musafir games answered with zero mistakes
  hardWins?: number;           // hard-difficulty games finished with score >= 60
  majlisGames?: number;        // completed Majlis matches
  bestCorrectStreak?: number;  // longest run of consecutive correct answers
  learnReviewed?: number;      // flashcards reviewed in Learn mode (lifetime)
  longestStreak?: number;      // best daily streak ever reached
}

export interface GameOutcome {
  score: number;
  correct: number;
  total: number;
  difficulty: Difficulty;
  maxCorrectStreak: number;
  // Per-category tally for this game: category → { correct, total }.
  perCategory?: Record<string, { correct: number; total: number }>;
}

export interface AppPrefs {
  sound: boolean;
  haptics: boolean;
  reducedMotion: boolean;
}

export type CategoryStats = Record<string, { correct: number; total: number }>;

// Spaced Repetition (SM-2) card for a single question.
export interface SRCard {
  questionId: number;
  easeFactor: number;       // 2.5 initial, min 1.3
  interval: number;         // days until next review
  repetitions: number;      // consecutive correct answers
  nextReviewAt: number;     // epoch ms of next due date
}

// Quality rating after answering (0=worst, 5=best).
export type SRQuality = 0 | 1 | 2 | 3 | 4 | 5;
