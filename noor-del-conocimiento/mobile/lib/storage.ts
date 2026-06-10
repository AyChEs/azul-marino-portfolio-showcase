import AsyncStorage from '@react-native-async-storage/async-storage';
import type { AppSettings, Language, PersonalBest } from './types';

const KEYS = {
  language: 'noor.language',
  settings: 'noor.settings',
  bests: 'noor.personalBests',
  streak: 'noor.dailyStreak',
} as const;

export const DEFAULT_SETTINGS: AppSettings = {
  theme: { paper: 'pergamino', voice: 'editorial', header: 'cuaderno' },
  soundEnabled: true,
  hapticsEnabled: true,
};

async function readJson<T>(key: string, fallback: T): Promise<T> {
  try {
    const raw = await AsyncStorage.getItem(key);
    if (raw == null) return fallback;
    return { ...fallback, ...(JSON.parse(raw) as T) };
  } catch {
    // Corrupt storage: fall back to defaults rather than crash.
    return fallback;
  }
}

async function writeJson(key: string, value: unknown): Promise<void> {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Persistence is best-effort; the app must keep working without it.
  }
}

export async function getStoredLanguage(): Promise<Language | null> {
  try {
    const raw = await AsyncStorage.getItem(KEYS.language);
    return raw === 'es' || raw === 'en' || raw === 'ar' || raw === 'ma' ? raw : null;
  } catch {
    return null;
  }
}

export async function setStoredLanguage(lang: Language): Promise<void> {
  try {
    await AsyncStorage.setItem(KEYS.language, lang);
  } catch {
    /* best-effort */
  }
}

export async function getSettings(): Promise<AppSettings> {
  return readJson(KEYS.settings, DEFAULT_SETTINGS);
}

export async function setSettings(settings: AppSettings): Promise<void> {
  await writeJson(KEYS.settings, settings);
}

export type PersonalBests = Record<string, PersonalBest>;

export function bestKey(category: string, difficulty: string): string {
  return `${category}:${difficulty}`;
}

export async function getPersonalBests(): Promise<PersonalBests> {
  return readJson<PersonalBests>(KEYS.bests, {});
}

export async function recordResult(
  category: string,
  difficulty: string,
  score: number,
  accuracyPct: number,
): Promise<boolean> {
  const bests = await getPersonalBests();
  const key = bestKey(category, difficulty);
  const prev = bests[key];
  if (prev && prev.score >= score) return false;
  bests[key] = { score, accuracy: accuracyPct, date: new Date().toISOString() };
  await writeJson(KEYS.bests, bests);
  return true;
}

interface DailyStreak {
  lastPlayed: string; // YYYY-MM-DD
  streak: number;
}

export async function bumpDailyStreak(today = new Date()): Promise<number> {
  const data = await readJson<DailyStreak>(KEYS.streak, { lastPlayed: '', streak: 0 });
  const todayStr = today.toISOString().slice(0, 10);
  if (data.lastPlayed === todayStr) return data.streak;
  const yesterday = new Date(today.getTime() - 86_400_000).toISOString().slice(0, 10);
  const streak = data.lastPlayed === yesterday ? data.streak + 1 : 1;
  await writeJson(KEYS.streak, { lastPlayed: todayStr, streak });
  return streak;
}
