export type Language = 'es' | 'en' | 'ar' | 'ma';
export const SUPPORTED_LANGUAGES: readonly Language[] = ['es', 'en', 'ar', 'ma'] as const;
/** Languages whose translations are mandatory for a question to be servable. */
export const REQUIRED_QUESTION_LANGUAGES: readonly Language[] = ['es', 'en', 'ar'] as const;
export const RTL_LANGUAGES: readonly Language[] = ['ar', 'ma'] as const;

export type Category = 'quran_general' | 'prophets' | 'seerah';
export type Difficulty = 'easy' | 'medium' | 'hard';
export type Sensitivity = 'none' | 'scholarly_difference';

export type LocalizedText = Partial<Record<Language, string>> & { es: string; en: string; ar: string };
export type LocalizedOptions = Partial<Record<Language, string[]>> & {
  es: string[];
  en: string[];
  ar: string[];
};

export interface QuestionSource {
  /** Primary reference, e.g. "Corán 96:1-5" or "Sahih al-Bukhari 3". */
  primary: string;
  secondary?: string;
  reference_url?: string;
  /** "pending_scholar_review" questions are never served in production. */
  verified_by: string;
  verified_date: string | null;
}

export interface Question {
  id: string;
  category: Category;
  difficulty: Difficulty;
  question: LocalizedText;
  options: LocalizedOptions;
  correctIndex: number;
  explanation: LocalizedText;
  source: QuestionSource;
  sensitivity: Sensitivity;
}

export type GameMode = 'solo' | 'majlis' | 'learn';
export type LifelineKind = 'fiftyFifty' | 'extraTime' | 'skip';

export interface GameSettings {
  mode: GameMode;
  category: Category | 'all';
  difficulty: Difficulty;
  questionCount: number;
}

export interface LifelineState {
  fiftyFifty: number;
  extraTime: number;
  skip: number;
}

export interface GameState {
  questions: Question[];
  currentIndex: number;
  score: number;
  lives: number;
  streak: number;
  correctCount: number;
  lifelines: LifelineState;
  eliminatedOptions: number[];
  finished: boolean;
}

export interface MajlisPlayer {
  name: string;
  score: number;
  correctCount: number;
}

export interface PersonalBest {
  score: number;
  accuracy: number;
  date: string;
}

export type ThemeHeaderStyle = 'cuaderno' | 'minimo';

export interface ThemePrefs {
  paper: 'linen' | 'pergamino' | 'antiguo';
  voice: 'editorial' | 'amable' | 'clasica';
  header: ThemeHeaderStyle;
}

export interface AppSettings {
  theme: ThemePrefs;
  soundEnabled: boolean;
  hapticsEnabled: boolean;
}
