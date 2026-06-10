import rawQuestions from '../data/questions.json';
import type { Question } from './types';

const ALL_QUESTIONS = rawQuestions as unknown as Question[];

export function isVerified(q: Question): boolean {
  return q.source.verified_by !== 'pending_scholar_review' && q.source.verified_date != null;
}

/**
 * Question bank loaded once. In production builds only verified questions
 * are servable (section 6.2 rule 2); pending questions surface in dev only.
 */
export function getQuestionBank(): Question[] {
  if (__DEV__) return ALL_QUESTIONS;
  return ALL_QUESTIONS.filter(isVerified);
}

export function getQuestionById(id: string): Question | undefined {
  return ALL_QUESTIONS.find((q) => q.id === id);
}
