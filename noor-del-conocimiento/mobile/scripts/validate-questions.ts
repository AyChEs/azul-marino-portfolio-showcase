/**
 * Content verification gate (section 6.2). Fails the build when the question
 * bank violates any hard rule. Run with: npm run validate:questions
 */
import questionsJson from '../data/questions.json';

export interface ValidationIssue {
  id: string;
  problem: string;
}

interface RawQuestion {
  id?: unknown;
  category?: unknown;
  difficulty?: unknown;
  question?: Record<string, unknown>;
  options?: Record<string, unknown>;
  correctIndex?: unknown;
  explanation?: Record<string, unknown>;
  source?: { primary?: unknown; verified_by?: unknown; verified_date?: unknown };
  sensitivity?: unknown;
}

const REQUIRED_LANGS = ['es', 'en', 'ar'] as const;
const CATEGORIES = ['quran_general', 'prophets', 'seerah'];
const DIFFICULTIES = ['easy', 'medium', 'hard'];

export function validateQuestions(questions: RawQuestion[]): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const seenIds = new Set<string>();

  for (const [idx, q] of questions.entries()) {
    const id = typeof q.id === 'string' ? q.id : `#${idx}`;
    const push = (problem: string) => issues.push({ id, problem });

    if (typeof q.id !== 'string' || q.id.length === 0) push('missing id');
    else if (seenIds.has(q.id)) push('duplicate id');
    else seenIds.add(q.id);

    if (!CATEGORIES.includes(String(q.category))) push(`invalid category: ${String(q.category)}`);
    if (!DIFFICULTIES.includes(String(q.difficulty)))
      push(`invalid difficulty: ${String(q.difficulty)}`);

    if (typeof q.source?.primary !== 'string' || q.source.primary.trim() === '')
      push('missing source.primary');
    if (typeof q.source?.verified_by !== 'string') push('missing source.verified_by');

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
      }
    }

    const ci = q.correctIndex;
    if (typeof ci !== 'number' || !Number.isInteger(ci) || ci < 0 || ci > 3)
      push(`correctIndex out of range: ${String(ci)}`);

    if (q.sensitivity !== undefined && q.sensitivity !== 'none' && q.sensitivity !== 'scholarly_difference')
      push(`invalid sensitivity: ${String(q.sensitivity)}`);
  }
  return issues;
}

export function countByVerification(questions: RawQuestion[]): {
  verified: number;
  pending: number;
} {
  let verified = 0;
  let pending = 0;
  for (const q of questions) {
    if (q.source?.verified_by === 'pending_scholar_review' || q.source?.verified_date == null)
      pending++;
    else verified++;
  }
  return { verified, pending };
}

/* istanbul ignore next — CLI entry */
if (require.main === module) {
  const questions = questionsJson as RawQuestion[];
  const issues = validateQuestions(questions);
  const { verified, pending } = countByVerification(questions);
  console.log(`Questions: ${questions.length} (verified: ${verified}, pending review: ${pending})`);
  if (issues.length > 0) {
    for (const issue of issues) console.error(`  ✗ [${issue.id}] ${issue.problem}`);
    console.error(`\nValidation FAILED with ${issues.length} issue(s).`);
    process.exit(1);
  }
  console.log('Validation passed.');
}
