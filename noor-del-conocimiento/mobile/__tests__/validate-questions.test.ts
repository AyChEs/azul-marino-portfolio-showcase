import questionsJson from '../data/questions.json';
import { countByVerification, validateQuestions } from '../scripts/validate-questions';

const validQuestion = {
  id: 'x_001',
  category: 'seerah',
  difficulty: 'easy',
  question: { es: 'q', en: 'q', ar: 'q' },
  options: {
    es: ['a', 'b', 'c', 'd'],
    en: ['a', 'b', 'c', 'd'],
    ar: ['a', 'b', 'c', 'd'],
  },
  correctIndex: 0,
  explanation: { es: 'e', en: 'e', ar: 'e' },
  source: { primary: 'Corán 1:1', verified_by: 'test', verified_date: '2026-01-01' },
  sensitivity: 'none',
};

describe('validateQuestions', () => {
  it('accepts a valid question', () => {
    expect(validateQuestions([validQuestion])).toEqual([]);
  });

  it('rejects missing source.primary', () => {
    const q = { ...validQuestion, source: { ...validQuestion.source, primary: '' } };
    expect(validateQuestions([q]).some((i) => i.problem.includes('source.primary'))).toBe(true);
  });

  it('rejects out-of-range correctIndex', () => {
    const q = { ...validQuestion, correctIndex: 4 };
    expect(validateQuestions([q]).some((i) => i.problem.includes('correctIndex'))).toBe(true);
  });

  it('rejects duplicate options', () => {
    const q = { ...validQuestion, options: { ...validQuestion.options, en: ['a', 'a', 'c', 'd'] } };
    expect(validateQuestions([q]).some((i) => i.problem.includes('duplicate options'))).toBe(true);
  });

  it('rejects missing required translation', () => {
    const q = { ...validQuestion, question: { es: 'q', en: 'q' } };
    expect(validateQuestions([q]).some((i) => i.problem.includes('question.ar'))).toBe(true);
  });

  it('rejects option lists that are not exactly 4 long', () => {
    const q = { ...validQuestion, options: { ...validQuestion.options, es: ['a', 'b'] } };
    expect(validateQuestions([q]).some((i) => i.problem.includes('exactly 4'))).toBe(true);
  });

  it('rejects duplicate ids', () => {
    expect(
      validateQuestions([validQuestion, { ...validQuestion }]).some((i) =>
        i.problem.includes('duplicate id'),
      ),
    ).toBe(true);
  });
});

describe('shipped question bank', () => {
  it('passes validation', () => {
    expect(validateQuestions(questionsJson as never[])).toEqual([]);
  });

  it('has no pending-review questions in the production set', () => {
    const { pending } = countByVerification(questionsJson as never[]);
    expect(pending).toBe(0);
  });
});
