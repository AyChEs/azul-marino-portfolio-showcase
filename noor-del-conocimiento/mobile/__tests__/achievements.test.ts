import {
  buildAchievements,
  diffUnlocked,
  ACHIEVEMENT_ICONS,
} from "../lib/achievements";
import type { StoredStats } from "../lib/types";

const base: StoredStats = {
  bestScore: 0,
  gamesPlayed: 0,
  totalCorrect: 0,
  lastPlayedAt: 0,
};

describe("achievements", () => {
  it("unlocks firstGame after one game", () => {
    const a = buildAchievements({ ...base, gamesPlayed: 1 }, 0, 0);
    expect(a.find((x) => x.id === "firstGame")?.unlocked).toBe(true);
    expect(a.find((x) => x.id === "games10")?.unlocked).toBe(false);
  });

  it("locks everything for a fresh profile", () => {
    const a = buildAchievements(base, 0, 0);
    expect(a.every((x) => !x.unlocked)).toBe(true);
  });

  it("uses the all-time longest streak, not just the current one", () => {
    const a = buildAchievements({ ...base, longestStreak: 7 }, 0, 0);
    expect(a.find((x) => x.id === "streak7")?.unlocked).toBe(true);
  });

  it("counts perfect games, hard wins and learn reviews", () => {
    const a = buildAchievements(
      { ...base, perfectGames: 5, hardWins: 10 },
      0,
      100
    );
    expect(a.find((x) => x.id === "perfect5")?.unlocked).toBe(true);
    expect(a.find((x) => x.id === "hardWin10")?.unlocked).toBe(true);
    expect(a.find((x) => x.id === "learn100")?.unlocked).toBe(true);
  });

  it("diffUnlocked returns only the newly-earned achievements", () => {
    const before = buildAchievements({ ...base, gamesPlayed: 9 }, 0, 0);
    const after = buildAchievements({ ...base, gamesPlayed: 10 }, 0, 0);
    const diff = diffUnlocked(before, after);
    expect(diff.map((a) => a.id)).toContain("games10");
    expect(diff.map((a) => a.id)).not.toContain("firstGame");
  });

  it("diffUnlocked is empty when nothing new is earned", () => {
    const s = buildAchievements({ ...base, gamesPlayed: 1 }, 0, 0);
    expect(diffUnlocked(s, s)).toEqual([]);
  });

  it("ACHIEVEMENT_ICONS covers every achievement id", () => {
    const ids = buildAchievements(base, 0, 0).map((a) => a.id);
    for (const id of ids) {
      expect(typeof ACHIEVEMENT_ICONS[id]).toBe("string");
    }
  });
});
