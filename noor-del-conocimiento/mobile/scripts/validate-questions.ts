/**
 * Content verification gate. Fails the build when the question bank violates
 * any hard rule. Run with: npm run validate:questions
 *
 * Schema matches data/questions.json: id (number), localized question/options/
 * explanation (es/en/ar), correctAnswer as localized string that must exist in
 * its options list, source (string), verified/flag audit booleans.
 */
import questionsJson from '../data/questions.json';

export interface ValidationIssue {
  id: string;
  problem: string;
}

interface RawQuestion {
  id?: unknown;
  question?: Record<string, unknown>;
  options?: Record<string, unknown>;
  correctAnswer?: Record<string, unknown>;
  category?: unknown;
  difficulty?: unknown;
  explanation?: Record<string, unknown>;
  source?: unknown;
  verified?: unknown;
  flag?: unknown;
}

const REQUIRED_LANGS = ['es', 'en', 'ar'] as const;
const CATEGORIES = ['Profetas', 'Seerah', 'Corán y General'];
const DIFFICULTIES = ['easy', 'medium', 'hard'];

export function validateQuestions(questions: RawQuestion[]): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const seenIds = new Set<number>();

  for (const [idx, q] of questions.entries()) {
    const id = typeof q.id === 'number' ? String(q.id) : `#${idx}`;
    const push = (problem: string) => issues.push({ id, problem });

    if (typeof q.id !== 'number') push('missing or non-numeric id');
    else if (seenIds.has(q.id)) push('duplicate id');
    else seenIds.add(q.id);

    if (!CATEGORIES.includes(String(q.category))) push(`invalid category: ${String(q.category)}`);
    if (!DIFFICULTIES.includes(String(q.difficulty)))
      push(`invalid difficulty: ${String(q.difficulty)}`);

    if (typeof q.source !== 'string' || q.source.trim() === '') push('missing source');
    if (typeof q.verified !== 'boolean') push('missing verified flag');

    for (const lang of REQUIRED_LANGS) {
      if (typeof q.question?.[lang] !== 'string' || !q.question[lang])
        push(`missing question.${lang}`);
      if (typeof q.explanation?.[lang] !== 'string' || !q.explanation[lang])
        push(`missing explanation.${lang}`);

      const opts = q.options?.[lang];
      if (!Array.isArray(opts) || opts.length !== 4) {
        push(`options.${lang} must have exactly 4 entries`);
      } else {
        if (opts.some((o) => typeof o !== 'string' || o.trim() === ''))
          push(`options.${lang} contains an empty option`);
        if (new Set(opts.map((o) => String(o).trim())).size !== 4)
          push(`options.${lang} contains duplicate options`);
        const correct = q.correctAnswer?.[lang];
        if (typeof correct !== 'string' || !opts.includes(correct))
          push(`correctAnswer.${lang} is not one of options.${lang}`);
      }
    }
  }
  return issues;
}

/** Production rule used by lib/gameLogic: only verified && !flag is servable. */
export function countByVerification(questions: RawQuestion[]): {
  servable: number;
  excluded: number;
} {
  let servable = 0;
  let excluded = 0;
  for (const q of questions) {
    if (q.verified === true && q.flag !== true) servable++;
    else excluded++;
  }
  return { servable, excluded };
}

/* istanbul ignore next — CLI entry */
if (require.main === module) {
  const questions = questionsJson as RawQuestion[];
  const issues = validateQuestions(questions);
  const { servable, excluded } = countByVerification(questions);
  console.log(`Questions: ${questions.length} (servable: ${servable}, excluded: ${excluded})`);
  if (issues.length > 0) {
    for (const issue of issues) console.error(`  ✗ [${issue.id}] ${issue.problem}`);
    console.error(`\nValidation FAILED with ${issues.length} issue(s).`);
    process.exit(1);
  }
  console.log('Validation passed.');
}
