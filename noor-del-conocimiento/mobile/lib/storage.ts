// Abstracción sobre AsyncStorage y SQLite
// AsyncStorage: datos simples (idioma, stats, prefs, streak, daily challenge)
// SQLite: datos estructurados (preguntas jugadas, falladas, SR cards)
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { Language, StoredStats, GameOutcome, AppPrefs, CategoryStats, SRCard } from "./types";
import { getTodayDateString } from "./dailyChallenge";
import { logError } from "./logger";
import {
  getPlayedQuestions as dbGetPlayedQuestions,
  addPlayedQuestions as dbAddPlayedQuestions,
  getMissedQuestions as dbGetMissedQuestions,
  addMissedQuestion as dbAddMissedQuestion,
  removeMissedQuestion as dbRemoveMissedQuestion,
  getSRCards as dbGetSRCards,
  saveSRCard as dbSaveSRCard,
  getDueCards as dbGetDueCards,
} from "./database";

// Simple mutex to serialize read-modify-write operations and prevent race conditions
let storageQueue: Promise<void> = Promise.resolve();

function withLock<T>(fn: () => Promise<T>): Promise<T> {
  const next = storageQueue.then(fn);
  storageQueue = next.then(() => {}).catch((e) => { logError("storage.mutex", e); });
  return next;
}

const KEYS = {
  language: "@noor:language",
  playedQuestions: "@noor:played_questions",
  missedQuestions: "@noor:missed_questions",
  stats: "@noor:stats",
  streak: "@noor:daily_streak",
  categoryStats: "@noor:category_stats",
  prefs: "@noor:prefs",
  onboarded: "@noor:onboarded",
  srCards: "@noor:sr_cards",
  dailyChallenge: "@noor:daily_challenge",
} as const;

const ALLOWED_LANGUAGES: Language[] = ["es", "en", "ar"];

// ── Idioma ─────────────────────────────────────────────────────────────────

export const getStoredLanguage = async (): Promise<Language | null> => {
  try {
    const val = await AsyncStorage.getItem(KEYS.language);
    if (!val) return null;
    // Migrate legacy "ma" (Moroccan Darija) to "ar" (Modern Standard Arabic)
    const migrated = val === "ma" ? "ar" : val;
    if ((ALLOWED_LANGUAGES as string[]).includes(migrated)) {
      if (migrated !== val) await AsyncStorage.setItem(KEYS.language, migrated);
      return migrated as Language;
    }
    return null;
  } catch (e) {
    logError("storage.getStoredLanguage", e);
    return null;
  }
};

export const setStoredLanguage = async (lang: Language): Promise<void> => {
  try {
    await AsyncStorage.setItem(KEYS.language, lang);
  } catch (e) {
    logError("storage.setStoredLanguage", e);
  }
};

// ── Historial de preguntas jugadas (anti-repetición) ───────────────────────
// Migrado a SQLite para mejor rendimiento y queries indexadas

export const getPlayedQuestions = async (): Promise<number[]> => {
  return dbGetPlayedQuestions();
};

export const addPlayedQuestions = async (ids: number[]): Promise<void> => {
  return dbAddPlayedQuestions(ids);
};

// ── Preguntas falladas (repaso inteligente) ────────────────────────────────
// Spaced-repetition lite: las preguntas falladas se priorizan en el modo
// Aprender hasta que el jugador las acierte allí.
// Migrado a SQLite para mejor rendimiento

export const getMissedQuestions = async (): Promise<number[]> => {
  return dbGetMissedQuestions();
};

export const addMissedQuestion = async (id: number): Promise<void> => {
  return dbAddMissedQuestion(id);
};

export const removeMissedQuestion = async (id: number): Promise<void> => {
  return dbRemoveMissedQuestion(id);
};

// ── Estadísticas del jugador ───────────────────────────────────────────────

function isValidStats(val: unknown): val is StoredStats {
  if (typeof val !== "object" || val === null) return false;
  const s = val as Record<string, unknown>;
  return (
    typeof s.bestScore === "number" &&
    typeof s.gamesPlayed === "number" &&
    typeof s.totalCorrect === "number" &&
    typeof s.lastPlayedAt === "number" &&
    Number.isFinite(s.bestScore) &&
    Number.isFinite(s.gamesPlayed) &&
    Number.isFinite(s.totalCorrect) &&
    Number.isFinite(s.lastPlayedAt)
  );
}

export const getStats = async (): Promise<StoredStats> => {
  try {
    const data = await AsyncStorage.getItem(KEYS.stats);
    if (!data) return defaultStats();
    const parsed: unknown = JSON.parse(data);
    return isValidStats(parsed) ? parsed : defaultStats();
  } catch (e) {
    logError("storage.getStats", e);
    return defaultStats();
  }
};

// Records a finished musafir game, folding in the extended achievement metrics.
export const updateStats = async (outcome: GameOutcome): Promise<void> => {
  return withLock(async () => {
    try {
      const c = await getStats();
      const isPerfect = outcome.correct >= outcome.total && outcome.total > 0;
      const isHardWin = outcome.difficulty === "hard" && outcome.score >= 60;
      const updated: StoredStats = {
        bestScore: Math.max(c.bestScore, outcome.score),
        gamesPlayed: c.gamesPlayed + 1,
        totalCorrect: c.totalCorrect + outcome.correct,
        lastPlayedAt: Date.now(),
        perfectGames: (c.perfectGames ?? 0) + (isPerfect ? 1 : 0),
        hardWins: (c.hardWins ?? 0) + (isHardWin ? 1 : 0),
        majlisGames: c.majlisGames ?? 0,
        bestCorrectStreak: Math.max(c.bestCorrectStreak ?? 0, outcome.maxCorrectStreak),
        learnReviewed: c.learnReviewed ?? 0,
        longestStreak: c.longestStreak ?? 0,
      };
      await AsyncStorage.setItem(KEYS.stats, JSON.stringify(updated));
    } catch (e) {
      logError("storage.updateStats", e);
    }
  });
};

// Lightweight counters updated outside the musafir flow.
export const incrementMajlisGames = async (): Promise<void> => {
  return withLock(async () => {
    try {
      const c = await getStats();
      await AsyncStorage.setItem(
        KEYS.stats,
        JSON.stringify({ ...c, majlisGames: (c.majlisGames ?? 0) + 1, lastPlayedAt: Date.now() })
      );
    } catch (e) {
      logError("storage.incrementMajlisGames", e);
    }
  });
};

export const incrementLearnReviewed = async (n = 1): Promise<void> => {
  return withLock(async () => {
    try {
      const c = await getStats();
      await AsyncStorage.setItem(
        KEYS.stats,
        JSON.stringify({ ...c, learnReviewed: (c.learnReviewed ?? 0) + n })
      );
    } catch (e) {
      logError("storage.incrementLearnReviewed", e);
    }
  });
};

const defaultStats = (): StoredStats => ({
  bestScore: 0,
  gamesPlayed: 0,
  totalCorrect: 0,
  lastPlayedAt: 0,
  perfectGames: 0,
  hardWins: 0,
  majlisGames: 0,
  bestCorrectStreak: 0,
  learnReviewed: 0,
  longestStreak: 0,
});

// ── Racha diaria ───────────────────────────────────────────────────────────

interface DailyStreak {
  lastPlayed: string; // YYYY-MM-DD (local device date)
  streak: number;
}

function localDateString(d: Date): string {
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
}

export const getDailyStreak = async (): Promise<number> => {
  try {
    const data = await AsyncStorage.getItem(KEYS.streak);
    if (!data) return 0;
    const parsed = JSON.parse(data) as DailyStreak;
    if (typeof parsed?.streak !== "number" || typeof parsed?.lastPlayed !== "string") return 0;
    const today = localDateString(new Date());
    const yesterday = localDateString(new Date(Date.now() - 86_400_000));
    // A streak is only alive if the user played today or yesterday.
    return parsed.lastPlayed === today || parsed.lastPlayed === yesterday ? parsed.streak : 0;
  } catch (e) {
    logError("storage.getDailyStreak", e);
    return 0;
  }
};

/** Call once per finished game. Returns the updated streak. */
export const bumpDailyStreak = async (): Promise<number> => {
  return withLock(async () => {
    try {
      const data = await AsyncStorage.getItem(KEYS.streak);
      const parsed: DailyStreak | null = data ? (JSON.parse(data) as DailyStreak) : null;
      const today = localDateString(new Date());
      const yesterday = localDateString(new Date(Date.now() - 86_400_000));
      if (parsed?.lastPlayed === today) return parsed.streak;
      const streak = parsed?.lastPlayed === yesterday ? parsed.streak + 1 : 1;
      await AsyncStorage.setItem(KEYS.streak, JSON.stringify({ lastPlayed: today, streak }));
      // Mirror the all-time best into stats so achievements can read it even
      // after a streak resets.
      try {
        const c = await getStats();
        if (streak > (c.longestStreak ?? 0)) {
          await AsyncStorage.setItem(
            KEYS.stats,
            JSON.stringify({ ...c, longestStreak: streak })
          );
        }
      } catch (e) {
        logError("storage.bumpDailyStreak", e);
      }
      return streak;
    } catch (e) {
      logError("storage.bumpDailyStreak", e);
      return 0;
    }
  });
};

// ── Preferencias de la app (sonido, háptica, movimiento) ────────────────────

export const DEFAULT_PREFS: AppPrefs = {
  sound: true,
  haptics: true,
  reducedMotion: false,
};

export const getPrefs = async (): Promise<AppPrefs> => {
  try {
    const data = await AsyncStorage.getItem(KEYS.prefs);
    if (!data) return { ...DEFAULT_PREFS };
    const parsed = JSON.parse(data) as Partial<AppPrefs>;
    return {
      sound: typeof parsed.sound === "boolean" ? parsed.sound : DEFAULT_PREFS.sound,
      haptics: typeof parsed.haptics === "boolean" ? parsed.haptics : DEFAULT_PREFS.haptics,
      reducedMotion:
        typeof parsed.reducedMotion === "boolean"
          ? parsed.reducedMotion
          : DEFAULT_PREFS.reducedMotion,
    };
  } catch (e) {
    logError("storage.getPrefs", e);
    return { ...DEFAULT_PREFS };
  }
};

export const setPrefs = async (prefs: AppPrefs): Promise<void> => {
  try {
    await AsyncStorage.setItem(KEYS.prefs, JSON.stringify(prefs));
  } catch (e) {
    logError("storage.setPrefs", e);
  }
};

// ── Onboarding (primer arranque) ────────────────────────────────────────────

export const hasOnboarded = async (): Promise<boolean> => {
  try {
    return (await AsyncStorage.getItem(KEYS.onboarded)) === "1";
  } catch (e) {
    logError("storage.hasOnboarded", e);
    return false;
  }
};

export const setOnboarded = async (): Promise<void> => {
  try {
    await AsyncStorage.setItem(KEYS.onboarded, "1");
  } catch (e) {
    logError("storage.setOnboarded", e);
  }
};

// ── Precisión por categoría ─────────────────────────────────────────────────

export const getCategoryStats = async (): Promise<CategoryStats> => {
  try {
    const data = await AsyncStorage.getItem(KEYS.categoryStats);
    if (!data) return {};
    const parsed = JSON.parse(data) as CategoryStats;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch (e) {
    logError("storage.getCategoryStats", e);
    return {};
  }
};

export const addCategoryStats = async (
  perCategory: Record<string, { correct: number; total: number }>
): Promise<void> => {
  return withLock(async () => {
    try {
      const current = await getCategoryStats();
      for (const [cat, { correct, total }] of Object.entries(perCategory)) {
        const prev = current[cat] ?? { correct: 0, total: 0 };
        current[cat] = { correct: prev.correct + correct, total: prev.total + total };
      }
      await AsyncStorage.setItem(KEYS.categoryStats, JSON.stringify(current));
    } catch (e) {
      logError("storage.addCategoryStats", e);
    }
  });
};

// ── Spaced Repetition (SM-2) ────────────────────────────────────────────────
// Migrado a SQLite para mejor rendimiento y queries indexadas

export const getSRCards = async (): Promise<SRCard[]> => {
  return dbGetSRCards();
};

export const saveSRCard = async (card: SRCard): Promise<void> => {
  return dbSaveSRCard(card);
};

/** Get cards that are due for review now, in priority order. */
export const getDueCards = async (now: number = Date.now()): Promise<SRCard[]> => {
  return dbGetDueCards(now);
};

// ── Daily Challenge ─────────────────────────────────────────────────────────

export interface DailyChallengeData {
  lastDate: string;      // YYYY-MM-DD of last challenge
  completed: boolean;    // completed today?
  streak: number;        // consecutive daily completions
  lastCorrect: boolean;  // whether last answer was correct
  lastQuestionId: number | null;
}

const DEFAULT_DAILY: DailyChallengeData = {
  lastDate: "",
  completed: false,
  streak: 0,
  lastCorrect: false,
  lastQuestionId: null,
};

export const getDailyChallenge = async (): Promise<DailyChallengeData> => {
  try {
    const data = await AsyncStorage.getItem(KEYS.dailyChallenge);
    if (!data) return { ...DEFAULT_DAILY };
    return JSON.parse(data) as DailyChallengeData;
  } catch (e) {
    logError("storage.getDailyChallenge", e);
    return { ...DEFAULT_DAILY };
  }
};

export const completeDailyChallenge = async (
  correct: boolean,
  questionId: number,
  dateStr: string,
): Promise<void> => {
  return withLock(async () => {
    try {
      const prev = await getDailyChallenge();
      // Idempotent: never double-count the same day.
      if (prev.lastDate === dateStr && prev.completed) return;

      // The challenge streak counts *consecutive days completed*. It grows only
      // when the previous completion was literally yesterday; any gap resets it
      // to 1. This mirrors bumpDailyStreak's calendar-day semantics rather than
      // the previous "any different date counts" logic, which was wrong.
      const yesterday = localDateString(new Date(new Date(dateStr).getTime() - 86_400_000));
      const continuedStreak = prev.completed && prev.lastDate === yesterday;
      const streak = continuedStreak ? prev.streak + 1 : 1;

      const updated: DailyChallengeData = {
        lastDate: dateStr,
        completed: true,
        streak,
        lastCorrect: correct,
        lastQuestionId: questionId,
      };
      await AsyncStorage.setItem(KEYS.dailyChallenge, JSON.stringify(updated));
    } catch (e) {
      logError("storage.completeDailyChallenge", e);
    }
  });
};

/** Check if today's challenge was already completed. */
export const isDailyDone = async (now: number = Date.now()): Promise<boolean> => {
  try {
    const data = await getDailyChallenge();
    const today = getTodayDateString(now);
    return data.lastDate === today && data.completed;
  } catch (e) {
    logError("storage.isDailyDone", e);
    return false;
  }
};

// ── Reset total del progreso (desde Ajustes) ────────────────────────────────

export const resetAllProgress = async (): Promise<void> => {
  try {
    // Limpiar AsyncStorage
    await AsyncStorage.multiRemove([
      KEYS.stats,
      KEYS.streak,
      KEYS.categoryStats,
      KEYS.dailyChallenge,
    ]);
    
    // Limpiar tablas SQLite
    const { getDatabase } = await import('./database');
    const db = getDatabase();
    db.runSync('DELETE FROM played_questions');
    db.runSync('DELETE FROM missed_questions');
    db.runSync('DELETE FROM sr_cards');
  } catch (e) {
    logError("storage.resetAllProgress", e);
  }
};
