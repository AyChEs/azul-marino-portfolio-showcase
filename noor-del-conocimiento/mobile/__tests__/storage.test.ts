jest.mock("@react-native-async-storage/async-storage", () =>
  require("@react-native-async-storage/async-storage/jest/async-storage-mock")
);

jest.mock("../lib/logger", () => ({
  logError: jest.fn(),
  logFatal: jest.fn(),
}));

import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  getStoredLanguage,
  setStoredLanguage,
  getPlayedQuestions,
  addPlayedQuestions,
  getMissedQuestions,
  addMissedQuestion,
  removeMissedQuestion,
  getStats,
  updateStats,
  incrementMajlisGames,
  getDailyStreak,
  bumpDailyStreak,
  getPrefs,
  setPrefs,
  DEFAULT_PREFS,
  hasOnboarded,
  setOnboarded,
  getCategoryStats,
  addCategoryStats,
  getSRCards,
  saveSRCard,
  getDueCards,
  getDailyChallenge,
  completeDailyChallenge,
  isDailyDone,
  resetAllProgress,
} from "../lib/storage";
import type { GameOutcome, SRCard } from "../lib/types";

beforeEach(() => {
  (AsyncStorage as any).clear();
  jest.clearAllMocks();
});

describe("language", () => {
  it("returns null when nothing stored", async () => {
    expect(await getStoredLanguage()).toBeNull();
  });

  it("stores and retrieves language", async () => {
    await setStoredLanguage("ar");
    expect(await getStoredLanguage()).toBe("ar");
  });

  it("migrates legacy 'ma' to 'ar'", async () => {
    await AsyncStorage.setItem("@noor:language", "ma");
    expect(await getStoredLanguage()).toBe("ar");
  });

  it("rejects invalid language values", async () => {
    await AsyncStorage.setItem("@noor:language", "xx");
    expect(await getStoredLanguage()).toBeNull();
  });
});

describe("played questions", () => {
  it("returns empty array when nothing stored", async () => {
    expect(await getPlayedQuestions()).toEqual([]);
  });

  it("adds and retrieves played question ids", async () => {
    await addPlayedQuestions([1, 2, 3]);
    expect(await getPlayedQuestions()).toEqual([1, 2, 3]);
  });

  it("deduplicates ids", async () => {
    await addPlayedQuestions([1, 2, 3]);
    await addPlayedQuestions([2, 3, 4]);
    expect(await getPlayedQuestions()).toEqual([1, 2, 3, 4]);
  });

  it("trims to MAX_MEMORY_SIZE (150) keeping most recent", async () => {
    const ids = Array.from({ length: 160 }, (_, i) => i);
    await addPlayedQuestions(ids);
    const result = await getPlayedQuestions();
    expect(result.length).toBe(150);
    expect(result[0]).toBe(10);
    expect(result[149]).toBe(159);
  });

  it("handles corrupted data gracefully", async () => {
    await AsyncStorage.setItem("@noor:played_questions", "not-json");
    expect(await getPlayedQuestions()).toEqual([]);
  });

  it("handles non-array data gracefully", async () => {
    await AsyncStorage.setItem("@noor:played_questions", JSON.stringify({ foo: "bar" }));
    expect(await getPlayedQuestions()).toEqual([]);
  });
});

describe("missed questions", () => {
  it("returns empty array when nothing stored", async () => {
    expect(await getMissedQuestions()).toEqual([]);
  });

  it("adds a missed question", async () => {
    await addMissedQuestion(42);
    expect(await getMissedQuestions()).toEqual([42]);
  });

  it("does not duplicate", async () => {
    await addMissedQuestion(42);
    await addMissedQuestion(42);
    expect(await getMissedQuestions()).toEqual([42]);
  });

  it("removes a missed question", async () => {
    await addMissedQuestion(1);
    await addMissedQuestion(2);
    await addMissedQuestion(3);
    await removeMissedQuestion(2);
    expect(await getMissedQuestions()).toEqual([1, 3]);
  });

  it("no-ops when removing non-existent id", async () => {
    await addMissedQuestion(1);
    await removeMissedQuestion(99);
    expect(await getMissedQuestions()).toEqual([1]);
  });

  it("trims to MAX_MISSED_SIZE (100)", async () => {
    for (let i = 0; i < 105; i++) {
      await addMissedQuestion(i);
    }
    const result = await getMissedQuestions();
    expect(result.length).toBe(100);
    expect(result[0]).toBe(5);
  });
});

describe("stats", () => {
  it("returns defaults when nothing stored", async () => {
    const stats = await getStats();
    expect(stats.bestScore).toBe(0);
    expect(stats.gamesPlayed).toBe(0);
    expect(stats.totalCorrect).toBe(0);
    expect(stats.perfectGames).toBe(0);
    expect(stats.longestStreak).toBe(0);
  });

  it("updates stats after a game", async () => {
    const outcome: GameOutcome = {
      score: 75,
      correct: 12,
      total: 15,
      difficulty: "medium",
      maxCorrectStreak: 8,
    };
    await updateStats(outcome);
    const stats = await getStats();
    expect(stats.bestScore).toBe(75);
    expect(stats.gamesPlayed).toBe(1);
    expect(stats.totalCorrect).toBe(12);
    expect(stats.bestCorrectStreak).toBe(8);
  });

  it("tracks perfect games", async () => {
    const perfect: GameOutcome = { score: 100, correct: 15, total: 15, difficulty: "easy", maxCorrectStreak: 15 };
    await updateStats(perfect);
    const stats = await getStats();
    expect(stats.perfectGames).toBe(1);
  });

  it("tracks hard wins", async () => {
    const hardWin: GameOutcome = { score: 65, correct: 10, total: 15, difficulty: "hard", maxCorrectStreak: 5 };
    await updateStats(hardWin);
    const stats = await getStats();
    expect(stats.hardWins).toBe(1);
  });

  it("keeps best score across games", async () => {
    await updateStats({ score: 50, correct: 8, total: 15, difficulty: "easy", maxCorrectStreak: 3 });
    await updateStats({ score: 80, correct: 12, total: 15, difficulty: "medium", maxCorrectStreak: 6 });
    await updateStats({ score: 60, correct: 9, total: 15, difficulty: "easy", maxCorrectStreak: 4 });
    const stats = await getStats();
    expect(stats.bestScore).toBe(80);
    expect(stats.gamesPlayed).toBe(3);
    expect(stats.totalCorrect).toBe(29);
  });

  it("increments majlis games counter", async () => {
    await incrementMajlisGames();
    await incrementMajlisGames();
    const stats = await getStats();
    expect(stats.majlisGames).toBe(2);
  });

  it("handles corrupted stats data", async () => {
    await AsyncStorage.setItem("@noor:stats", JSON.stringify({ invalid: true }));
    const stats = await getStats();
    expect(stats.bestScore).toBe(0);
    expect(stats.gamesPlayed).toBe(0);
  });
});

describe("daily streak", () => {
  it("returns 0 when nothing stored", async () => {
    expect(await getDailyStreak()).toBe(0);
  });

  it("starts streak at 1 on first play", async () => {
    const streak = await bumpDailyStreak();
    expect(streak).toBe(1);
  });

  it("does not increment twice on same day", async () => {
    await bumpDailyStreak();
    const streak = await bumpDailyStreak();
    expect(streak).toBe(1);
  });

  it("increments streak on consecutive days", async () => {
    const yesterday = new Date(Date.now() - 86_400_000);
    const m = String(yesterday.getMonth() + 1).padStart(2, "0");
    const d = String(yesterday.getDate()).padStart(2, "0");
    const yStr = `${yesterday.getFullYear()}-${m}-${d}`;
    await AsyncStorage.setItem("@noor:daily_streak", JSON.stringify({ lastPlayed: yStr, streak: 3 }));
    const streak = await bumpDailyStreak();
    expect(streak).toBe(4);
  });

  it("resets streak after gap day", async () => {
    const twoDaysAgo = new Date(Date.now() - 2 * 86_400_000);
    const m = String(twoDaysAgo.getMonth() + 1).padStart(2, "0");
    const d = String(twoDaysAgo.getDate()).padStart(2, "0");
    const oldStr = `${twoDaysAgo.getFullYear()}-${m}-${d}`;
    await AsyncStorage.setItem("@noor:daily_streak", JSON.stringify({ lastPlayed: oldStr, streak: 10 }));
    const streak = await bumpDailyStreak();
    expect(streak).toBe(1);
  });

  it("mirrors best streak into stats", async () => {
    await bumpDailyStreak();
    const stats = await getStats();
    expect(stats.longestStreak).toBe(1);
  });
});

describe("prefs", () => {
  it("returns defaults when nothing stored", async () => {
    expect(await getPrefs()).toEqual(DEFAULT_PREFS);
  });

  it("stores and retrieves prefs", async () => {
    await setPrefs({ sound: false, haptics: true, reducedMotion: true });
    const prefs = await getPrefs();
    expect(prefs.sound).toBe(false);
    expect(prefs.reducedMotion).toBe(true);
  });

  it("fills missing fields with defaults", async () => {
    await AsyncStorage.setItem("@noor:prefs", JSON.stringify({ sound: false }));
    const prefs = await getPrefs();
    expect(prefs.sound).toBe(false);
    expect(prefs.haptics).toBe(true);
    expect(prefs.reducedMotion).toBe(false);
  });
});

describe("onboarding", () => {
  it("returns false when not onboarded", async () => {
    expect(await hasOnboarded()).toBe(false);
  });

  it("returns true after setOnboarded", async () => {
    await setOnboarded();
    expect(await hasOnboarded()).toBe(true);
  });
});

describe("category stats", () => {
  it("returns empty object when nothing stored", async () => {
    expect(await getCategoryStats()).toEqual({});
  });

  it("accumulates category stats", async () => {
    await addCategoryStats({ Seerah: { correct: 5, total: 8 } });
    await addCategoryStats({ Seerah: { correct: 3, total: 4 }, Profetas: { correct: 2, total: 3 } });
    const stats = await getCategoryStats();
    expect(stats.Seerah).toEqual({ correct: 8, total: 12 });
    expect(stats.Profetas).toEqual({ correct: 2, total: 3 });
  });
});

describe("spaced repetition cards", () => {
  it("returns empty array when nothing stored", async () => {
    expect(await getSRCards()).toEqual([]);
  });

  it("saves and retrieves cards", async () => {
    const card: SRCard = { questionId: 1, easeFactor: 2.5, interval: 1, repetitions: 1, nextReviewAt: Date.now() };
    await saveSRCard(card);
    const cards = await getSRCards();
    expect(cards.length).toBe(1);
    expect(cards[0].questionId).toBe(1);
  });

  it("updates existing card (upsert)", async () => {
    const card1: SRCard = { questionId: 1, easeFactor: 2.5, interval: 1, repetitions: 1, nextReviewAt: 100 };
    const card2: SRCard = { questionId: 1, easeFactor: 2.3, interval: 3, repetitions: 2, nextReviewAt: 200 };
    await saveSRCard(card1);
    await saveSRCard(card2);
    const cards = await getSRCards();
    expect(cards.length).toBe(1);
    expect(cards[0].easeFactor).toBe(2.3);
  });

  it("returns due cards sorted by ease factor", async () => {
    const now = Date.now();
    await saveSRCard({ questionId: 1, easeFactor: 2.8, interval: 1, repetitions: 1, nextReviewAt: now - 100 });
    await saveSRCard({ questionId: 2, easeFactor: 1.5, interval: 1, repetitions: 1, nextReviewAt: now - 50 });
    await saveSRCard({ questionId: 3, easeFactor: 2.0, interval: 1, repetitions: 1, nextReviewAt: now + 1000 });
    const due = await getDueCards(now);
    expect(due.length).toBe(2);
    expect(due[0].questionId).toBe(2);
    expect(due[1].questionId).toBe(1);
  });
});

describe("daily challenge", () => {
  it("returns defaults when nothing stored", async () => {
    const data = await getDailyChallenge();
    expect(data.lastDate).toBe("");
    expect(data.completed).toBe(false);
    expect(data.streak).toBe(0);
  });

  it("completes challenge and tracks streak", async () => {
    const today = new Date().toISOString().slice(0, 10);
    await completeDailyChallenge(true, 42, today);
    const data = await getDailyChallenge();
    expect(data.completed).toBe(true);
    expect(data.streak).toBe(1);
    expect(data.lastQuestionId).toBe(42);
  });

  it("is idempotent — same day does not double-count", async () => {
    const today = new Date().toISOString().slice(0, 10);
    await completeDailyChallenge(true, 42, today);
    await completeDailyChallenge(false, 99, today);
    const data = await getDailyChallenge();
    expect(data.streak).toBe(1);
    expect(data.lastQuestionId).toBe(42);
  });

  it("increments streak on consecutive days", async () => {
    const today = new Date();
    const m = String(today.getMonth() + 1).padStart(2, "0");
    const d = String(today.getDate()).padStart(2, "0");
    const todayStr = `${today.getFullYear()}-${m}-${d}`;
    const yesterday = new Date(Date.now() - 86_400_000);
    const ym = String(yesterday.getMonth() + 1).padStart(2, "0");
    const yd = String(yesterday.getDate()).padStart(2, "0");
    const yesterdayStr = `${yesterday.getFullYear()}-${ym}-${yd}`;

    await completeDailyChallenge(true, 1, yesterdayStr);
    await completeDailyChallenge(true, 2, todayStr);
    const data = await getDailyChallenge();
    expect(data.streak).toBe(2);
  });

  it("isDailyDone returns true after completion", async () => {
    const today = new Date().toISOString().slice(0, 10);
    await completeDailyChallenge(true, 42, today);
    expect(await isDailyDone()).toBe(true);
  });
});

describe("resetAllProgress", () => {
  it("clears all game data", async () => {
    await addPlayedQuestions([1, 2, 3]);
    await addMissedQuestion(5);
    await updateStats({ score: 80, correct: 12, total: 15, difficulty: "medium", maxCorrectStreak: 5 });
    await bumpDailyStreak();
    await resetAllProgress();
    expect(await getPlayedQuestions()).toEqual([]);
    expect(await getMissedQuestions()).toEqual([]);
    expect(await getStats().then((s) => s.gamesPlayed)).toBe(0);
    expect(await getDailyStreak()).toBe(0);
  });
});

describe("mutex serialization", () => {
  it("serializes concurrent addPlayedQuestions calls", async () => {
    const promises = [
      addPlayedQuestions([1]),
      addPlayedQuestions([2]),
      addPlayedQuestions([3]),
    ];
    await Promise.all(promises);
    const result = await getPlayedQuestions();
    expect(result).toEqual([1, 2, 3]);
  });

  it("serializes concurrent addMissedQuestion calls", async () => {
    const promises = [
      addMissedQuestion(10),
      addMissedQuestion(20),
      addMissedQuestion(30),
    ];
    await Promise.all(promises);
    const result = await getMissedQuestions();
    expect(result).toEqual([10, 20, 30]);
  });

  it("serializes concurrent updateStats calls", async () => {
    const outcome: GameOutcome = { score: 50, correct: 8, total: 15, difficulty: "easy", maxCorrectStreak: 3 };
    await Promise.all([updateStats(outcome), updateStats(outcome), updateStats(outcome)]);
    const stats = await getStats();
    expect(stats.gamesPlayed).toBe(3);
    expect(stats.totalCorrect).toBe(24);
  });
});
