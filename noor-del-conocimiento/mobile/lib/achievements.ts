// Achievement definitions — single source of truth, derived purely from stored
// stats (no extra writes). Used by the Stats screen to render the badge grid
// and by Game Over to detect newly-unlocked achievements for the toast.
import type { StoredStats } from "./types";

export interface Achievement {
  id: string;
  icon: string;
  unlocked: boolean;
}

export const buildAchievements = (
  stats: StoredStats,
  streak: number,
  reviewed: number
): Achievement[] => {
  const bestStreakEver = Math.max(streak, stats.longestStreak ?? 0);
  return [
    // ── Constancia (partidas jugadas) ──
    { id: "firstGame", icon: "☪", unlocked: stats.gamesPlayed >= 1 },
    { id: "games10", icon: "✦", unlocked: stats.gamesPlayed >= 10 },
    { id: "games25", icon: "✧", unlocked: stats.gamesPlayed >= 25 },
    { id: "games50", icon: "۞", unlocked: stats.gamesPlayed >= 50 },
    { id: "games100", icon: "❂", unlocked: stats.gamesPlayed >= 100 },
    // ── Aciertos acumulados ──
    { id: "correct50", icon: "☾", unlocked: stats.totalCorrect >= 50 },
    { id: "correct100", icon: "☽", unlocked: stats.totalCorrect >= 100 },
    { id: "correct500", icon: "✶", unlocked: stats.totalCorrect >= 500 },
    { id: "correct1000", icon: "✸", unlocked: stats.totalCorrect >= 1000 },
    // ── Maestría (puntaje) ──
    { id: "best40", icon: "◈", unlocked: stats.bestScore >= 40 },
    { id: "best60", icon: "◆", unlocked: stats.bestScore >= 60 },
    { id: "best80", icon: "❖", unlocked: stats.bestScore >= 80 },
    { id: "best100", icon: "✺", unlocked: stats.bestScore >= 100 },
    // ── Excelencia ──
    { id: "perfectGame", icon: "♛", unlocked: (stats.perfectGames ?? 0) >= 1 },
    { id: "perfect5", icon: "♕", unlocked: (stats.perfectGames ?? 0) >= 5 },
    { id: "hardWin", icon: "⚔", unlocked: (stats.hardWins ?? 0) >= 1 },
    { id: "hardWin10", icon: "🛡", unlocked: (stats.hardWins ?? 0) >= 10 },
    { id: "streak5correct", icon: "⚡", unlocked: (stats.bestCorrectStreak ?? 0) >= 5 },
    { id: "streak10correct", icon: "☄", unlocked: (stats.bestCorrectStreak ?? 0) >= 10 },
    // ── Racha diaria ──
    { id: "streak3", icon: "🔥", unlocked: bestStreakEver >= 3 },
    { id: "streak7", icon: "⚜", unlocked: bestStreakEver >= 7 },
    { id: "streak30", icon: "🌙", unlocked: bestStreakEver >= 30 },
    // ── Modos ──
    { id: "majlis1", icon: "♟", unlocked: (stats.majlisGames ?? 0) >= 1 },
    { id: "majlis10", icon: "♚", unlocked: (stats.majlisGames ?? 0) >= 10 },
    // ── Aprender ──
    { id: "learn25", icon: "✑", unlocked: reviewed >= 25 },
    { id: "learn100", icon: "✒", unlocked: reviewed >= 100 },
    { id: "learn500", icon: "❉", unlocked: reviewed >= 500 },
  ];
};

// Returns achievements that are unlocked in `after` but were not in `before`.
export const diffUnlocked = (
  before: Achievement[],
  after: Achievement[]
): Achievement[] => {
  const wasUnlocked = new Set(
    before.filter((a) => a.unlocked).map((a) => a.id)
  );
  return after.filter((a) => a.unlocked && !wasUnlocked.has(a.id));
};

// id → icon lookup, so a screen can render an achievement by id alone (e.g. the
// Game Over toast, which receives only unlocked ids via route params).
const EMPTY = {
  bestScore: 0,
  gamesPlayed: 0,
  totalCorrect: 0,
  lastPlayedAt: 0,
};
export const ACHIEVEMENT_ICONS: Record<string, string> = Object.fromEntries(
  buildAchievements(EMPTY, 0, 0).map((a) => [a.id, a.icon])
);
