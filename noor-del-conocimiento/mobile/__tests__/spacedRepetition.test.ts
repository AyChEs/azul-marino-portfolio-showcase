import {
  createSRCard,
  qualityFromResponse,
  updateEaseFactor,
  applySM2,
  isDue,
  sortByPriority,
} from "../lib/spacedRepetition";
import type { SRCard } from "../lib/types";

describe("createSRCard", () => {
  it("creates a card with SM-2 defaults", () => {
    const card = createSRCard(42);
    expect(card.questionId).toBe(42);
    expect(card.easeFactor).toBe(2.5);
    expect(card.interval).toBe(0);
    expect(card.repetitions).toBe(0);
    expect(typeof card.nextReviewAt).toBe("number");
  });
});

describe("qualityFromResponse", () => {
  it("returns 5 for fast correct (<=5s)", () => {
    expect(qualityFromResponse(true, 3000)).toBe(5);
    expect(qualityFromResponse(true, 5000)).toBe(5);
  });
  it("returns 4 for normal correct (5-12s)", () => {
    expect(qualityFromResponse(true, 7000)).toBe(4);
    expect(qualityFromResponse(true, 12000)).toBe(4);
  });
  it("returns 3 for slow correct (>12s)", () => {
    expect(qualityFromResponse(true, 13000)).toBe(3);
    expect(qualityFromResponse(true, 20000)).toBe(3);
  });
  it("returns 1 for fast mistake (<=5s)", () => {
    expect(qualityFromResponse(false, 2000)).toBe(1);
  });
  it("returns 0 for slow mistake", () => {
    expect(qualityFromResponse(false, 10000)).toBe(0);
  });
});

describe("updateEaseFactor", () => {
  it("increases EF for quality 5", () => {
    expect(updateEaseFactor(2.5, 5)).toBeCloseTo(2.6);
  });
  it("keeps EF same for quality 4", () => {
    expect(updateEaseFactor(2.5, 4)).toBeCloseTo(2.5);
  });
  it("decreases EF for quality 3", () => {
    expect(updateEaseFactor(2.5, 3)).toBeCloseTo(2.36);
  });
  it("clamps EF to min 1.3", () => {
    expect(updateEaseFactor(1.3, 0)).toBeGreaterThanOrEqual(1.3);
  });
});

describe("applySM2", () => {
  it("first correct (q=5): interval=1, reps=1, EF=2.6", () => {
    const card = createSRCard(1);
    const r = applySM2(card, 5);
    expect(r.interval).toBe(1);
    expect(r.repetitions).toBe(1);
    expect(r.easeFactor).toBeCloseTo(2.6);
  });
  it("second correct (q=4): interval=6, reps=2", () => {
    const card: SRCard = { questionId: 1, easeFactor: 2.6, interval: 1, repetitions: 1, nextReviewAt: 0 };
    const r = applySM2(card, 4);
    expect(r.interval).toBe(6);
    expect(r.repetitions).toBe(2);
    expect(r.easeFactor).toBeCloseTo(2.6);
  });
  it("third correct (q=3): interval uses NEW ef (2.46), not old EF", () => {
    const card: SRCard = { questionId: 1, easeFactor: 2.6, interval: 6, repetitions: 2, nextReviewAt: 0 };
    const r = applySM2(card, 3);
    // quality=3 → new EF = 2.6 - 0.14 = 2.46, interval = round(6 * 2.46) = 15
    expect(r.easeFactor).toBeCloseTo(2.46);
    expect(r.interval).toBe(Math.round(6 * 2.46));
    expect(r.repetitions).toBe(3);
  });
  it("failed answer (q=0): resets to interval=1, reps=0, EF decreases", () => {
    const card: SRCard = { questionId: 1, easeFactor: 2.5, interval: 15, repetitions: 3, nextReviewAt: 0 };
    const r = applySM2(card, 0);
    expect(r.interval).toBe(1);
    expect(r.repetitions).toBe(0);
    expect(r.easeFactor).toBeLessThan(2.5);
  });
  it("does not mutate the input card", () => {
    const card = createSRCard(1);
    const original = { ...card };
    applySM2(card, 5);
    expect(card).toEqual(original);
  });
});

describe("isDue", () => {
  it("returns true for a card in the past", () => {
    const card = createSRCard(1);
    card.nextReviewAt = 0;
    expect(isDue(card, 1000)).toBe(true);
  });
  it("returns false for a card in the future", () => {
    const card = createSRCard(1);
    card.nextReviewAt = 9999;
    expect(isDue(card, 1000)).toBe(false);
  });
});

describe("sortByPriority", () => {
  it("puts due cards before non-due", () => {
    const farFuture = Date.now() + 86_400_000 * 365;
    const due: SRCard = { questionId: 1, easeFactor: 2.5, interval: 1, repetitions: 1, nextReviewAt: 0 };
    const notDue: SRCard = { questionId: 2, easeFactor: 2.5, interval: 1, repetitions: 1, nextReviewAt: farFuture };
    expect(sortByPriority(due, notDue)).toBeLessThan(0);
  });
  it("sorts due cards by easeFactor ascending", () => {
    const lowEF: SRCard = { questionId: 1, easeFactor: 1.5, interval: 1, repetitions: 0, nextReviewAt: Date.now() - 1000 };
    const highEF: SRCard = { questionId: 2, easeFactor: 2.5, interval: 1, repetitions: 0, nextReviewAt: Date.now() - 1000 };
    expect(sortByPriority(lowEF, highEF)).toBeLessThan(0);
  });
});
