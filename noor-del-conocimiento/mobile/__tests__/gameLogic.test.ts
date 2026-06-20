import {
  calculateQuestionScore,
  calculateFinalScore,
  shuffleSeeded,
  filterQuestions,
  selectGameQuestions,
  applyFiftyFifty,
  isServable,
  getRank,
  getTimerDuration,
  TOTAL_QUESTIONS_PER_GAME,
} from "../lib/gameLogic";
import type { Question } from "../lib/types";

const mockQuestion = (
  id: number,
  opts: Partial<Question> = {}
): Question => ({
  id,
  question: { es: "Pregunta", en: "Question", ar: "سؤال" },
  category: "Corán y General",
  difficulty: "easy",
  verified: true,
  flag: false,
  options: {
    es: ["A", "B", "C", "D"],
    en: ["A", "B", "C", "D"],
    ar: ["A", "B", "C", "D"],
  },
  correctAnswer: {
    es: "A",
    en: "A",
    ar: "A",
  },
  explanation: { es: "Exp", en: "Exp", ar: "Exp" },
  source: "Fuente",
  ...opts,
});

describe("calculateQuestionScore", () => {
  it("returns higher score for harder difficulty with more time", () => {
    const easy = calculateQuestionScore("easy", 25, 30);
    const hard = calculateQuestionScore("hard", 25, 30);
    expect(hard).toBeGreaterThanOrEqual(easy);
  });

  it("returns higher score when more time is left with hard difficulty", () => {
    const fast = calculateQuestionScore("hard", 28, 30);
    const slow = calculateQuestionScore("hard", 5, 30);
    expect(fast).toBeGreaterThanOrEqual(slow);
  });

  it("applies category multiplier correctly with hard difficulty", () => {
    const general = calculateQuestionScore("hard", 25, 30, "Corán y General");
    const seerah = calculateQuestionScore("hard", 25, 30, "Seerah");
    expect(seerah).toBeGreaterThanOrEqual(general);
  });

  it("returns positive score even with 0 time", () => {
    const score = calculateQuestionScore("easy", 0, 30);
    expect(score).toBeGreaterThan(0);
  });
});

describe("calculateFinalScore", () => {
  it("returns 100 when all points earned", () => {
    expect(calculateFinalScore(100, 100)).toBe(100);
  });

  it("returns 0 when maxPossiblePoints is 0", () => {
    expect(calculateFinalScore(50, 0)).toBe(0);
  });

  it("returns correct percentage", () => {
    expect(calculateFinalScore(50, 100)).toBe(50);
    expect(calculateFinalScore(25, 100)).toBe(25);
  });
});

describe("shuffleSeeded", () => {
  it("returns same order for same seed", () => {
    const arr = [1, 2, 3, 4, 5];
    const result1 = shuffleSeeded(arr, 42);
    const result2 = shuffleSeeded(arr, 42);
    expect(result1).toEqual(result2);
  });

  it("returns different order for different seeds", () => {
    const arr = [1, 2, 3, 4, 5];
    const result1 = shuffleSeeded(arr, 42);
    const result2 = shuffleSeeded(arr, 99);
    expect(result1).not.toEqual(result2);
  });

  it("does not mutate original array", () => {
    const arr = [1, 2, 3, 4, 5];
    const original = [...arr];
    shuffleSeeded(arr, 42);
    expect(arr).toEqual(original);
  });

  it("contains all original elements", () => {
    const arr = [1, 2, 3, 4, 5];
    const result = shuffleSeeded(arr, 42);
    expect(result.sort()).toEqual([1, 2, 3, 4, 5]);
  });
});

describe("isServable", () => {
  it("returns true for valid question with answer in language", () => {
    const q = mockQuestion(1);
    expect(isServable(q, "es")).toBe(true);
  });

  it("returns false for flagged question", () => {
    const q = mockQuestion(1, { flag: true });
    expect(isServable(q, "es")).toBe(false);
  });

  it("returns false for unverified question", () => {
    const q = mockQuestion(1, { verified: false });
    expect(isServable(q, "es")).toBe(false);
  });

  it("returns false when no correctAnswer in language", () => {
    const q = mockQuestion(1, {
      correctAnswer: { es: "A", en: "A", ar: "" },
    });
    expect(isServable(q, "ar")).toBe(false);
  });
});

describe("filterQuestions", () => {
  const questions = [
    mockQuestion(1, { category: "Seerah", difficulty: "easy" }),
    mockQuestion(2, { category: "Seerah", difficulty: "medium" }),
    mockQuestion(3, { category: "Profetas", difficulty: "easy" }),
    mockQuestion(4, { category: "Corán y General", difficulty: "hard" }),
  ];

  it("filters by category", () => {
    const result = filterQuestions(questions, "Seerah", "easy", "es");
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe(1);
  });

  it("filters by difficulty", () => {
    const result = filterQuestions(questions, "mix", "easy", "es");
    expect(result).toHaveLength(2);
  });

  it("excludes specified ids", () => {
    const result = filterQuestions(questions, "mix", "easy", "es", [1]);
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe(3);
  });

  it("returns all for mix mode", () => {
    const result = filterQuestions(questions, "mix", "easy", "es");
    expect(result).toHaveLength(2);
  });
});

describe("selectGameQuestions", () => {
  const questions = Array.from({ length: 50 }, (_, i) =>
    mockQuestion(i + 1, {
      category: i % 2 === 0 ? "Seerah" : "Corán y General",
      difficulty: i % 3 === 0 ? "easy" : i % 3 === 1 ? "medium" : "hard",
    })
  );

  it("returns exactly TOTAL_QUESTIONS_PER_GAME questions", () => {
    const result = selectGameQuestions(questions, "mix", "easy", "es", []);
    expect(result).toHaveLength(TOTAL_QUESTIONS_PER_GAME);
  });

  it("prioritizes unplayed questions", () => {
    const playedIds = [1, 2, 3];
    const result = selectGameQuestions(questions, "mix", "easy", "es", playedIds);
    const ids = result.map((q) => q.id);
    const unplayedCount = ids.filter((id) => !playedIds.includes(id)).length;
    expect(unplayedCount).toBeGreaterThan(playedIds.length);
  });

  it("returns unique questions", () => {
    const result = selectGameQuestions(questions, "mix", "easy", "es", []);
    const ids = result.map((q) => q.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });
});

describe("applyFiftyFifty", () => {
  it("returns exactly 2 options", () => {
    const options = ["A", "B", "C", "D"];
    const result = applyFiftyFifty(options, "A");
    expect(result).toHaveLength(2);
  });

  it("always includes correct answer", () => {
    const options = ["A", "B", "C", "D"];
    const result = applyFiftyFifty(options, "A");
    expect(result).toContain("A");
  });

  it("includes exactly one wrong answer", () => {
    const options = ["A", "B", "C", "D"];
    const result = applyFiftyFifty(options, "A");
    const wrongAnswers = result.filter((o) => o !== "A");
    expect(wrongAnswers).toHaveLength(1);
  });
});

describe("getRank", () => {
  it("returns first rank for score 0", () => {
    const rank = getRank(0);
    expect(rank.minScore).toBe(0);
  });

  it("returns correct rank for different scores", () => {
    expect(getRank(40).minScore).toBe(40);
    expect(getRank(60).minScore).toBe(60);
    expect(getRank(80).minScore).toBe(80);
    expect(getRank(100).minScore).toBe(80);
  });
});

describe("getTimerDuration", () => {
  it("returns correct duration for each difficulty", () => {
    expect(getTimerDuration("easy")).toBe(30);
    expect(getTimerDuration("medium")).toBe(20);
    expect(getTimerDuration("hard")).toBe(15);
  });
});
