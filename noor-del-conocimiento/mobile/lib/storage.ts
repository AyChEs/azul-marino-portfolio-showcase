// Abstracción sobre AsyncStorage — reemplaza localStorage del web
// Nunca accede a localStorage (no existe en React Native)
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { Language, StoredStats } from "./types";

const KEYS = {
  language: "@noor:language",
  playedQuestions: "@noor:played_questions",
  stats: "@noor:stats",
  streak: "@noor:daily_streak",
} as const;

const MAX_MEMORY_SIZE = 150;

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
  } catch {
    return null;
  }
};

export const setStoredLanguage = async (lang: Language): Promise<void> => {
  try {
    await AsyncStorage.setItem(KEYS.language, lang);
  } catch {}
};

// ── Historial de preguntas jugadas (anti-repetición) ───────────────────────

function isNumberArray(val: unknown): val is number[] {
  return (
    Array.isArray(val) &&
    val.every((x) => typeof x === "number" && Number.isFinite(x))
  );
}

export const getPlayedQuestions = async (): Promise<number[]> => {
  try {
    const data = await AsyncStorage.getItem(KEYS.playedQuestions);
    if (!data) return [];
    const parsed: unknown = JSON.parse(data);
    return isNumberArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

export const addPlayedQuestions = async (ids: number[]): Promise<void> => {
  try {
    const existing = await getPlayedQuestions();
    const merged = Array.from(new Set([...existing, ...ids]));
    const trimmed =
      merged.length > MAX_MEMORY_SIZE
        ? merged.slice(merged.length - MAX_MEMORY_SIZE)
        : merged;
    await AsyncStorage.setItem(KEYS.playedQuestions, JSON.stringify(trimmed));
  } catch {}
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
  } catch {
    return defaultStats();
  }
};

export const updateStats = async (
  score: number,
  correct: number
): Promise<void> => {
  try {
    const current = await getStats();
    const updated: StoredStats = {
      bestScore: Math.max(current.bestScore, score),
      gamesPlayed: current.gamesPlayed + 1,
      totalCorrect: current.totalCorrect + correct,
      lastPlayedAt: Date.now(),
    };
    await AsyncStorage.setItem(KEYS.stats, JSON.stringify(updated));
  } catch {}
};

const defaultStats = (): StoredStats => ({
  bestScore: 0,
  gamesPlayed: 0,
  totalCorrect: 0,
  lastPlayedAt: 0,
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
  } catch {
    return 0;
  }
};

/** Call once per finished game. Returns the updated streak. */
export const bumpDailyStreak = async (): Promise<number> => {
  try {
    const data = await AsyncStorage.getItem(KEYS.streak);
    const parsed: DailyStreak | null = data ? (JSON.parse(data) as DailyStreak) : null;
    const today = localDateString(new Date());
    const yesterday = localDateString(new Date(Date.now() - 86_400_000));
    if (parsed?.lastPlayed === today) return parsed.streak;
    const streak = parsed?.lastPlayed === yesterday ? parsed.streak + 1 : 1;
    await AsyncStorage.setItem(KEYS.streak, JSON.stringify({ lastPlayed: today, streak }));
    return streak;
  } catch {
    return 0;
  }
};
