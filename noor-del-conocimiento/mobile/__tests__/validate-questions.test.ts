import questionsJson from '../data/questions.json';
import { countByVerification, validateQuestions } from '../scripts/validate-questions';

const validQuestion = {
  id: 9001,
  question: { es: 'q', en: 'q', ar: 'q' },
  options: {
    es: ['a', 'b', 'c', 'd'],
    en: ['a', 'b', 'c', 'd'],
    ar: ['a', 'b', 'c', 'd'],
  },
  correctAnswer: { es: 'b', en: 'b', ar: 'b' },
  category: 'Seerah',
  difficulty: 'easy',
  explanation: { es: 'e', en: 'e', ar: 'e' },
  source: 'Corán 1:1',
  verified: true,
  flag: false,
};

describe('validateQuestions', () => {
  it('accepts a valid question', () => {
    expect(validateQuestions([validQuestion])).toEqual([]);
  });

  it('rejects missing source', () => {
    const q = { ...validQuestion, source: '' };
    expect(validateQuestions([q]).some((i) => i.problem.includes('source'))).toBe(true);
  });

  it('rejects a correctAnswer that is not among the options', () => {
    const q = { ...validQuestion, correctAnswer: { es: 'z', en: 'b', ar: 'b' } };
    expect(
      validateQuestions([q]).some((i) => i.problem.includes('correctAnswer.es')),
    ).toBe(true);
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

describe('shipped question bank (507)', () => {
  it('passes validation', () => {
    expect(validateQuestions(questionsJson as never[])).toEqual([]);
  });

  it('has no excluded (unverified/flagged) questions', () => {
    const { servable, excluded } = countByVerification(questionsJson as never[]);
    expect(excluded).toBe(0);
    expect(servable).toBe(507);
  });
});
