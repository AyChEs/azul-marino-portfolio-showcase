// SM-2 spaced repetition algorithm — pure, immutable, testable.
// Based on the SuperMemo SM-2 algorithm by Piotr Wozniak (1987).
// https://www.supermemo.com/en/blog/application-of-a-computer-to-improve-the-work-of-education
import type { SRCard, SRQuality } from "./types";

// Default ease factor (starting value for new cards).
const DEFAULT_EF = 2.5;
const MIN_EF = 1.3;

// Intervals (days) for the first two successful reviews.
const INTERVAL_FIRST = 1;
const INTERVAL_SECOND = 6;

// How many ms in a day (for nextReviewAt calculation).
const MS_PER_DAY = 86_400_000;

/**
 * Create a brand-new SRCard for a question.
 */
export function createSRCard(questionId: number): SRCard {
  return {
    questionId,
    easeFactor: DEFAULT_EF,
    interval: 0,
    repetitions: 0,
    nextReviewAt: Date.now(),
  };
}

/**
 * Map a boolean correct + response time (ms) to an SM-2 quality score.
 * Fast correct (<=5s) = 5, normal correct = 4, slow correct (>12s) = 3,
 * fast mistake = 1, normal mistake = 0.
 */
export function qualityFromResponse(
  correct: boolean,
  responseTimeMs: number,
): SRQuality {
  if (correct) {
    if (responseTimeMs <= 5000) return 5;
    if (responseTimeMs <= 12_000) return 4;
    return 3;
  }
  if (responseTimeMs <= 5000) return 1;
  return 0;
}

/**
 * Compute the new ease factor after a review.
 */
export function updateEaseFactor(ef: number, quality: SRQuality): number {
  const next = ef + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  return Math.max(MIN_EF, next);
}

/**
 * Given a card and the quality of the latest response, return a new SRCard
 * with updated SM-2 parameters (immutable — original is not mutated).
 */
export function applySM2(card: SRCard, quality: SRQuality): SRCard {
  const passed = quality >= 3;
  const ef = updateEaseFactor(card.easeFactor, quality);

  if (!passed) {
    return {
      ...card,
      easeFactor: ef,
      interval: INTERVAL_FIRST,
      repetitions: 0,
      nextReviewAt: Date.now() + INTERVAL_FIRST * MS_PER_DAY,
    };
  }

  const repetitions = card.repetitions + 1;
  let interval: number;
  if (repetitions === 1) {
    interval = INTERVAL_FIRST;
  } else if (repetitions === 2) {
    interval = INTERVAL_SECOND;
  } else {
    interval = Math.round(card.interval * ef);
  }

  return {
    ...card,
    easeFactor: ef,
    interval,
    repetitions,
    nextReviewAt: Date.now() + interval * MS_PER_DAY,
  };
}

/**
 * Return `true` if the card is due for review now.
 */
export function isDue(card: SRCard, now: number = Date.now()): boolean {
  return card.nextReviewAt <= now;
}

/**
 * Sort comparator: due cards first, then by ease factor ascending.
 */
export function sortByPriority(a: SRCard, b: SRCard): number {
  const aDue = isDue(a) ? 0 : 1;
  const bDue = isDue(b) ? 0 : 1;
  if (aDue !== bDue) return aDue - bDue;
  return a.easeFactor - b.easeFactor;
}
