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
  return (weight * 0.7 + timeBonus) * catMult;
};

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

export const getMajlisRankings = (players: Player[]): Player[] => {
  return [...players].sort((a, b) => {
    if (a.isEliminated && !b.isEliminated) return 1;
    if (!a.isEliminated && b.isEliminated) return -1;
    return b.score - a.score;
  });
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
    // Only include questions verified or without flag for safety
    // (questions with correctAnswer confirmed by FASE 0 audit)
    const hasAnswer = Boolean(q.correctAnswer?.[language]);
    return hasAnswer;
  });
};

export const selectGameQuestions = (
  questions: Question[],
  mode: GameMode,
  difficulty: Difficulty,
  language: Language,
  excludeIds: number[] = []
): Question[] => {
  let pool = filterQuestions(questions, mode, difficulty, language, excludeIds);

  // If the strict pool can't fill a game, top up from neighboring difficulties
  // (still respects the chosen mode/language). Better to play 15 questions
  // mostly-on-difficulty than to play 3.
  if (pool.length < TOTAL_QUESTIONS_PER_GAME) {
    const otherDiffs: Difficulty[] = (["easy", "medium", "hard"] as Difficulty[])
      .filter((d) => d !== difficulty);
    const seen = new Set(pool.map((q) => q.id));
    for (const d of otherDiffs) {
      const extra = filterQuestions(questions, mode, d, language, excludeIds)
        .filter((q) => !seen.has(q.id));
      pool = pool.concat(extra);
      for (const q of extra) seen.add(q.id);
      if (pool.length >= TOTAL_QUESTIONS_PER_GAME) break;
    }
  }

  const shuffled = shuffleArray(pool);
  return shuffled.slice(0, TOTAL_QUESTIONS_PER_GAME);
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
