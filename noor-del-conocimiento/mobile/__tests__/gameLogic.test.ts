import {
  INITIAL_LIVES,
  POINTS,
  STREAK_BONUS,
  accuracy,
  answerQuestion,
  createGame,
  currentQuestion,
  pickQuestions,
  rankFor,
  shuffle,
  timeOut,
  useLifeline,
} from '../lib/gameLogic';
import type { Question } from '../lib/types';

function makeQuestion(id: string, difficulty: Question['difficulty'] = 'easy'): Question {
  return {
    id,
    category: 'seerah',
    difficulty,
    question: { es: 'q', en: 'q', ar: 'q' },
    options: {
      es: ['a', 'b', 'c', 'd'],
      en: ['a', 'b', 'c', 'd'],
      ar: ['a', 'b', 'c', 'd'],
    },
    correctIndex: 1,
    explanation: { es: 'e', en: 'e', ar: 'e' },
    source: { primary: 'Corán 1:1', verified_by: 'test', verified_date: '2026-01-01' },
    sensitivity: 'none',
  };
}

const questions = [makeQuestion('a'), makeQuestion('b'), makeQuestion('c')];

describe('createGame', () => {
  it('initializes lives, score and lifelines', () => {
    const g = createGame(questions);
    expect(g.lives).toBe(INITIAL_LIVES);
    expect(g.score).toBe(0);
    expect(g.lifelines).toEqual({ fiftyFifty: 1, extraTime: 1, skip: 1 });
    expect(g.finished).toBe(false);
  });

  it('is finished immediately with an empty bank', () => {
    expect(createGame([]).finished).toBe(true);
  });
});

describe('answerQuestion', () => {
  it('awards difficulty points on correct answers', () => {
    const g = createGame(questions);
    const { state, correct } = answerQuestion(g, 1);
    expect(correct).toBe(true);
    expect(state.score).toBe(POINTS.easy);
    expect(state.correctCount).toBe(1);
    expect(state.currentIndex).toBe(1);
  });

  it('adds a streak bonus from the third consecutive correct answer', () => {
    let g = createGame(questions);
    g = answerQuestion(g, 1).state;
    g = answerQuestion(g, 1).state;
    g = answerQuestion(g, 1).state;
    expect(g.score).toBe(POINTS.easy * 3 + STREAK_BONUS);
  });

  it('removes a life and resets streak on wrong answers', () => {
    const g = createGame(questions);
    const { state, correct } = answerQuestion(g, 0);
    expect(correct).toBe(false);
    expect(state.lives).toBe(INITIAL_LIVES - 1);
    expect(state.streak).toBe(0);
  });

  it('finishes when lives reach zero', () => {
    let g = createGame([makeQuestion('a'), makeQuestion('b'), makeQuestion('c'), makeQuestion('d')]);
    g = answerQuestion(g, 0).state;
    g = answerQuestion(g, 0).state;
    g = answerQuestion(g, 0).state;
    expect(g.lives).toBe(0);
    expect(g.finished).toBe(true);
  });

  it('finishes when the question list is exhausted', () => {
    let g = createGame([makeQuestion('a')]);
    g = answerQuestion(g, 1).state;
    expect(g.finished).toBe(true);
  });
});

describe('timeOut', () => {
  it('counts as a wrong answer', () => {
    const g = timeOut(createGame(questions));
    expect(g.lives).toBe(INITIAL_LIVES - 1);
    expect(g.currentIndex).toBe(1);
  });
});

describe('useLifeline', () => {
  it('fiftyFifty eliminates two wrong options and decrements the counter', () => {
    const g = useLifeline(createGame(questions), 'fiftyFifty');
    expect(g.eliminatedOptions).toHaveLength(2);
    expect(g.eliminatedOptions).not.toContain(1);
    expect(g.lifelines.fiftyFifty).toBe(0);
  });

  it('skip advances without losing a life', () => {
    const g = useLifeline(createGame(questions), 'skip');
    expect(g.currentIndex).toBe(1);
    expect(g.lives).toBe(INITIAL_LIVES);
    expect(g.lifelines.skip).toBe(0);
  });

  it('is a no-op when the lifeline is exhausted', () => {
    const once = useLifeline(createGame(questions), 'skip');
    const twice = useLifeline(once, 'skip');
    expect(twice).toBe(once);
  });
});

describe('accuracy & rank', () => {
  it('computes accuracy over answered questions', () => {
    let g = createGame(questions);
    g = answerQuestion(g, 1).state;
    g = answerQuestion(g, 0).state;
    expect(accuracy(g)).toBe(50);
  });

  it('maps accuracy to ranks', () => {
    expect(rankFor(95)).toBe('hafiz');
    expect(rankFor(75)).toBe('alim');
    expect(rankFor(55)).toBe('talib');
    expect(rankFor(10)).toBe('mubtadi');
  });
});

describe('pickQuestions / shuffle', () => {
  it('filters by category and difficulty and respects count', () => {
    const pool = [
      makeQuestion('e1', 'easy'),
      makeQuestion('e2', 'easy'),
      makeQuestion('h1', 'hard'),
    ];
    const picked = pickQuestions(pool, 'seerah', 'easy', 1, () => 0);
    expect(picked).toHaveLength(1);
    expect(picked[0]?.difficulty).toBe('easy');
  });

  it('shuffle preserves elements', () => {
    const out = shuffle([1, 2, 3, 4, 5]);
    expect([...out].sort()).toEqual([1, 2, 3, 4, 5]);
  });
});
