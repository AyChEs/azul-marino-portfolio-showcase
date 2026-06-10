/**
 * Pure game logic — no React, no I/O — so it can be unit-tested directly.
 */
import type {
  Difficulty,
  GameState,
  LifelineKind,
  LifelineState,
  Question,
} from './types';

export const INITIAL_LIVES = 3;
export const BASE_TIME_SECONDS: Record<Difficulty, number> = {
  easy: 20,
  medium: 15,
  hard: 12,
};
export const EXTRA_TIME_SECONDS = 15;
export const POINTS: Record<Difficulty, number> = { easy: 10, medium: 20, hard: 30 };
export const STREAK_BONUS = 5;
export const INITIAL_LIFELINES: LifelineState = { fiftyFifty: 1, extraTime: 1, skip: 1 };

export function createGame(questions: Question[]): GameState {
  return {
    questions,
    currentIndex: 0,
    score: 0,
    lives: INITIAL_LIVES,
    streak: 0,
    correctCount: 0,
    lifelines: { ...INITIAL_LIFELINES },
    eliminatedOptions: [],
    finished: questions.length === 0,
  };
}

export function currentQuestion(state: GameState): Question | undefined {
  return state.questions[state.currentIndex];
}

function advance(state: GameState): GameState {
  const nextIndex = state.currentIndex + 1;
  return {
    ...state,
    currentIndex: nextIndex,
    eliminatedOptions: [],
    finished: state.lives <= 0 || nextIndex >= state.questions.length,
  };
}

export function answerQuestion(state: GameState, optionIndex: number): {
  state: GameState;
  correct: boolean;
} {
  const q = currentQuestion(state);
  if (!q || state.finished) return { state, correct: false };
  const correct = optionIndex === q.correctIndex;
  if (correct) {
    const streak = state.streak + 1;
    const bonus = streak >= 3 ? STREAK_BONUS * (streak - 2) : 0;
    return {
      correct,
      state: advance({
        ...state,
        score: state.score + POINTS[q.difficulty] + bonus,
        streak,
        correctCount: state.correctCount + 1,
      }),
    };
  }
  const lives = state.lives - 1;
  return { correct, state: advance({ ...state, lives, streak: 0 }) };
}

/** Time ran out: counts as a wrong answer. */
export function timeOut(state: GameState): GameState {
  const lives = state.lives - 1;
  return advance({ ...state, lives, streak: 0 });
}

export function useLifeline(state: GameState, kind: LifelineKind): GameState {
  if (state.finished || state.lifelines[kind] <= 0) return state;
  const lifelines = { ...state.lifelines, [kind]: state.lifelines[kind] - 1 };
  switch (kind) {
    case 'fiftyFifty': {
      const q = currentQuestion(state);
      if (!q) return state;
      const wrong = q.options.es
        .map((_, i) => i)
        .filter((i) => i !== q.correctIndex);
      // Deterministic shuffle is unnecessary; keep two random wrong options eliminated.
      const eliminated = shuffle(wrong).slice(0, 2);
      return { ...state, lifelines, eliminatedOptions: eliminated };
    }
    case 'skip':
      return advance({ ...state, lifelines });
    case 'extraTime':
      // Timer effect is applied by the screen; logic only decrements the counter.
      return { ...state, lifelines };
  }
}

export function accuracy(state: GameState): number {
  const answered = state.currentIndex;
  if (answered === 0) return 0;
  return Math.round((state.correctCount / answered) * 100);
}

export type Rank = 'hafiz' | 'alim' | 'talib' | 'mubtadi';

/** Report-card rank based on accuracy. */
export function rankFor(accuracyPct: number): Rank {
  if (accuracyPct >= 90) return 'hafiz';
  if (accuracyPct >= 70) return 'alim';
  if (accuracyPct >= 50) return 'talib';
  return 'mubtadi';
}

export function shuffle<T>(items: readonly T[], random: () => number = Math.random): T[] {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    const a = out[i] as T;
    out[i] = out[j] as T;
    out[j] = a;
  }
  return out;
}

export function pickQuestions(
  pool: Question[],
  category: Question['category'] | 'all',
  difficulty: Difficulty,
  count: number,
  random: () => number = Math.random,
): Question[] {
  const filtered = pool.filter(
    (q) => q.difficulty === difficulty && (category === 'all' || q.category === category),
  );
  return shuffle(filtered, random).slice(0, count);
}
