import type { Difficulty, Player, RankInfo, GameMode, Language } from "./types";
import type { Question } from "./types";

export const RANKS: RankInfo[] = [
  { minScore: 0, titleKey: "rank.0.title", descriptionKey: "rank.0.description" },
  { minScore: 40, titleKey: "rank.1.title", descriptionKey: "rank.1.description" },
  { minScore: 60, titleKey: "rank.2.title", descriptionKey: "rank.2.description" },
  { minScore: 80, titleKey: "rank.3.title", descriptionKey: "rank.3.description" },
];

export const getRank = (score: number): RankInfo => {
  let current = RANKS[0];
  for (const rank of RANKS) {
    if (score >= rank.minScore) current = rank;
    else break;
  }
  return current;
};

export const DIFFICULTY_WEIGHT: Record<Difficulty, number> = {
  easy: 1.0,
  medium: 1.5,
  hard: 2.0,
};

export const CATEGORY_MULTIPLIER: Record<string, number> = {
  "Corán y General": 1.0,
  Profetas: 1.1,
  Seerah: 1.2,
};

export const getCategoryMultiplier = (category: string): number =>
  CATEGORY_MULTIPLIER[category] ?? 1.0;

export const calculateQuestionScore = (
  difficulty: Difficulty,
  timeLeft: number,
  totalTime: number,
  category = "Corán y General"
): number => {
  const weight = DIFFICULTY_WEIGHT[difficulty];
  const catMult = getCategoryMultiplier(category);
  const timeBonus = weight * 0.3 * (timeLeft / totalTime);
  return Math.round((weight * 0.7 + timeBonus) * catMult);
};

export const MAJLIS_QUESTIONS_PER_PLAYER = 5;

export const calculateFinalScore = (
  earnedPoints: number,
  maxPossiblePoints: number
): number => {
  if (maxPossiblePoints === 0) return 0;
  return Math.round((earnedPoints / maxPossiblePoints) * 100);
};

export const getTimerDuration = (difficulty: Difficulty): number => {
  const durations: Record<Difficulty, number> = {
    easy: 30,
    medium: 20,
    hard: 15,
  };
  return durations[difficulty];
};

export const INITIAL_LIVES = 3;
export const INITIAL_LIFELINES = { fiftyFifty: 2, extraTime: 2, skip: 1 };
export const EXTRA_TIME_BONUS = 15;
export const TOTAL_QUESTIONS_PER_GAME = 15;

// Fisher-Yates shuffle — uniform distribution, no bias
export const shuffleArray = <T>(array: T[]): T[] => {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
};

// mulberry32 — tiny deterministic PRNG. Used to shuffle answer options with a
// per-question seed: the order is random per game but stable across re-renders
// and identical across languages (so the correct answer doesn't jump position
// when the player switches language mid-question).
const mulberry32 = (seed: number) => {
  let a = seed >>> 0;
  return () => {
    a += 0x6d2b79f5;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

export const shuffleSeeded = <T>(array: T[], seed: number): T[] => {
  const rand = mulberry32(seed);
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
};

export const getMajlisRankings = (players: Player[]): Player[] => {
  return [...players].sort((a, b) => {
    if (a.isEliminated && !b.isEliminated) return 1;
    if (!a.isEliminated && b.isEliminated) return -1;
    return b.score - a.score;
  });
};

// Production content gate — the single source of truth for "is this question
// allowed to be served". Only verified, unflagged questions with a usable
// answer in the requested language pass. Reused anywhere questions are served
// (games, daily challenge) so the gate can never drift between call sites.
export const isServable = (q: Question, language: Language): boolean => {
  if (q.flag === true) return false;
  if (q.verified === false) return false;
  return Boolean(q.correctAnswer?.[language]);
};

export const filterQuestions = (
  questions: Question[],
  mode: GameMode,
  difficulty: Difficulty,
  language: Language,
  excludeIds: number[] = []
): Question[] => {
  const excluded = new Set(excludeIds);
  return questions.filter((q) => {
    if (excluded.has(q.id)) return false;
    if (mode !== "mix" && q.category !== mode) return false;
    if (q.difficulty !== difficulty) return false;
    return isServable(q, language);
  });
};

// Recency-weighted selection. `playedIds` is ordered oldest → newest (that's
// how storage appends). Instead of hard-excluding played questions (which
// starves the pool and forced a "wipe history" fallback), rank candidates:
//   1. never-played questions, shuffled
//   2. played questions, oldest first (least-recently-seen resurface first)
// Difficulty tiers: exact difficulty first, then neighbors top up the deck.
export const selectGameQuestions = (
  questions: Question[],
  mode: GameMode,
  difficulty: Difficulty,
  language: Language,
  playedIds: number[] = []
): Question[] => {
  const recency = new Map<number, number>();
  playedIds.forEach((id, i) => recency.set(id, i));

  const tiers: Difficulty[] = [
    difficulty,
    ...(["easy", "medium", "hard"] as Difficulty[]).filter((d) => d !== difficulty),
  ];

  const pool: Question[] = [];
  const seen = new Set<number>();
  for (const d of tiers) {
    const candidates = filterQuestions(questions, mode, d, language).filter(
      (q) => !seen.has(q.id)
    );
    const unplayed = shuffleArray(candidates.filter((q) => !recency.has(q.id)));
    const replayable = candidates
      .filter((q) => recency.has(q.id))
      .sort((a, b) => (recency.get(a.id) ?? 0) - (recency.get(b.id) ?? 0));
    pool.push(...unplayed, ...replayable);
    for (const q of candidates) seen.add(q.id);
    if (pool.length >= TOTAL_QUESTIONS_PER_GAME) break;
  }

  // Final shuffle so the deck order doesn't telegraph "new questions first".
  return shuffleArray(pool.slice(0, TOTAL_QUESTIONS_PER_GAME));
};

export const applyFiftyFifty = (
  options: string[],
  correctAnswer: string
): string[] => {
  const wrong = options.filter((o) => o !== correctAnswer);
  const shuffledWrong = shuffleArray(wrong);
  const kept = shuffledWrong.slice(0, 1); // keep 1 wrong
  return shuffleArray([...kept, correctAnswer]);
};

export const createPlayer = (id: string, name: string): Player => ({
  id,
  name,
  score: 0,
  lives: INITIAL_LIVES,
  lifelines: { ...INITIAL_LIFELINES },
  isEliminated: false,
});
