/**
 * Database module — manages SQLite connection and initialization.
 * 
 * The questions.db file is bundled in assets/ and imported using expo-sqlite's
 * asset import functionality.
 */

import { openDatabaseSync, type SQLiteDatabase, type SQLiteProviderAssetSource } from 'expo-sqlite';
import type { Question, SRCard, Language } from './types';
import { logError } from './logger';

let db: SQLiteDatabase | null = null;
let questionsCache: Question[] | null = null;

// Asset source for the bundled database
const questionsDbAssetSource: SQLiteProviderAssetSource = {
  assetId: require('../assets/questions.db'),
};

/**
 * Initialize the database from the bundled asset.
 */
export async function initDatabase(): Promise<SQLiteDatabase> {
  if (db) return db;

  try {
    // Import the database from the bundled asset
    const { importDatabaseFromAssetAsync } = await import('expo-sqlite');
    await importDatabaseFromAssetAsync('questions.db', questionsDbAssetSource);
    
    // Open the database
    db = openDatabaseSync('questions.db');
    
    return db;
  } catch (e) {
    logError('db.initDatabase', e);
    throw e;
  }
}

/**
 * Get the database instance. Throws if not initialized.
 */
export function getDatabase(): SQLiteDatabase {
  if (!db) {
    throw new Error('Database not initialized. Call initDatabase() first.');
  }
  return db;
}

/**
 * Load all questions from the database.
 * Results are cached in memory for subsequent calls.
 */
export async function loadQuestions(): Promise<Question[]> {
  if (questionsCache) return questionsCache;
  
  const database = getDatabase();
  
  try {
    const rows = database.getAllSync(`
      SELECT 
        id, 
        question_es, question_en, question_ar,
        options_es, options_en, options_ar,
        correct_answer_es, correct_answer_en, correct_answer_ar,
        explanation_es, explanation_en, explanation_ar,
        category, difficulty, arabic_verse, source,
        verified, flag, correction_note
      FROM questions
    `) as Array<Record<string, unknown>>;
    
    questionsCache = rows.map(rowToQuestion);
    return questionsCache;
  } catch (e) {
    logError('db.loadQuestions', e);
    return [];
  }
}

/**
 * Load questions filtered by category, difficulty, and language.
 * Much more efficient than loading all questions and filtering in JS.
 */
export async function loadQuestionsFiltered(
  category: string | null,
  difficulty: string | null,
  language: Language,
  excludeIds: number[] = []
): Promise<Question[]> {
  const database = getDatabase();
  
  try {
    let query = `
      SELECT 
        id, 
        question_es, question_en, question_ar,
        options_es, options_en, options_ar,
        correct_answer_es, correct_answer_en, correct_answer_ar,
        explanation_es, explanation_en, explanation_ar,
        category, difficulty, arabic_verse, source,
        verified, flag, correction_note
      FROM questions
      WHERE verified = 1 AND flag = 0
        AND correct_answer_${language} IS NOT NULL
    `;
    
    const params: (string | number)[] = [];
    
    if (category && category !== 'mix') {
      query += ' AND category = ?';
      params.push(category);
    }
    
    if (difficulty) {
      query += ' AND difficulty = ?';
      params.push(difficulty);
    }
    
    if (excludeIds.length > 0) {
      query += ` AND id NOT IN (${excludeIds.map(() => '?').join(',')})`;
      params.push(...excludeIds);
    }
    
    const rows = database.getAllSync(query, params as any) as Array<Record<string, unknown>>;
    return rows.map(rowToQuestion);
  } catch (e) {
    logError('db.loadQuestionsFiltered', e);
    return [];
  }
}

/**
 * Get the count of servable questions for a given language.
 */
export async function getServableCount(language: Language): Promise<number> {
  const database = getDatabase();
  
  try {
    const result = database.getFirstSync(`
      SELECT COUNT(*) as count
      FROM questions
      WHERE verified = 1 AND flag = 0
        AND correct_answer_${language} IS NOT NULL
    `) as { count: number } | undefined;
    
    return result?.count ?? 0;
  } catch (e) {
    logError('db.getServableCount', e);
    return 0;
  }
}

/**
 * Clear the questions cache (useful for testing or after DB update).
 */
export function clearQuestionsCache(): void {
  questionsCache = null;
}

// ── SR Cards ──────────────────────────────────────────────────────────────────

export async function getSRCards(): Promise<SRCard[]> {
  const database = getDatabase();
  
  try {
    const rows = database.getAllSync(`
      SELECT question_id, ease_factor, interval_days, repetitions, next_review_at
      FROM sr_cards
    `) as Array<Record<string, unknown>>;
    
    return rows.map((row) => ({
      questionId: row.question_id as number,
      easeFactor: row.ease_factor as number,
      interval: row.interval_days as number,
      repetitions: row.repetitions as number,
      nextReviewAt: row.next_review_at as number,
    }));
  } catch (e) {
    logError('db.getSRCards', e);
    return [];
  }
}

export async function saveSRCard(card: SRCard): Promise<void> {
  const database = getDatabase();
  
  try {
    database.runSync(`
      INSERT OR REPLACE INTO sr_cards 
      (question_id, ease_factor, interval_days, repetitions, next_review_at)
      VALUES (?, ?, ?, ?, ?)
    `, [card.questionId, card.easeFactor, card.interval, card.repetitions, card.nextReviewAt]);
  } catch (e) {
    logError('db.saveSRCard', e);
  }
}

export async function getDueCards(now: number = Date.now()): Promise<SRCard[]> {
  const database = getDatabase();
  
  try {
    const rows = database.getAllSync(`
      SELECT question_id, ease_factor, interval_days, repetitions, next_review_at
      FROM sr_cards
      WHERE next_review_at <= ?
      ORDER BY ease_factor ASC
    `, [now]) as Array<Record<string, unknown>>;
    
    return rows.map((row) => ({
      questionId: row.question_id as number,
      easeFactor: row.ease_factor as number,
      interval: row.interval_days as number,
      repetitions: row.repetitions as number,
      nextReviewAt: row.next_review_at as number,
    }));
  } catch (e) {
    logError('db.getDueCards', e);
    return [];
  }
}

// ── Played Questions ──────────────────────────────────────────────────────────

export async function getPlayedQuestions(): Promise<number[]> {
  const database = getDatabase();
  
  try {
    const rows = database.getAllSync(`
      SELECT question_id FROM played_questions
      ORDER BY played_at ASC
      LIMIT 150
    `) as Array<{ question_id: number }>;
    
    return rows.map((row) => row.question_id);
  } catch (e) {
    logError('db.getPlayedQuestions', e);
    return [];
  }
}

export async function addPlayedQuestions(ids: number[]): Promise<void> {
  const database = getDatabase();
  const now = Date.now();
  
  try {
    for (const id of ids) {
      database.runSync(
        'INSERT OR REPLACE INTO played_questions (question_id, played_at) VALUES (?, ?)',
        [id, now]
      );
    }
    
    // Trim to max 150
    database.runSync(`
      DELETE FROM played_questions
      WHERE question_id NOT IN (
        SELECT question_id FROM played_questions
        ORDER BY played_at DESC
        LIMIT 150
      )
    `);
  } catch (e) {
    logError('db.addPlayedQuestions', e);
  }
}

// ── Missed Questions ──────────────────────────────────────────────────────────

export async function getMissedQuestions(): Promise<number[]> {
  const database = getDatabase();
  
  try {
    const rows = database.getAllSync(`
      SELECT question_id FROM missed_questions
    `) as Array<{ question_id: number }>;
    
    return rows.map((row) => row.question_id);
  } catch (e) {
    logError('db.getMissedQuestions', e);
    return [];
  }
}

export async function addMissedQuestion(id: number): Promise<void> {
  const database = getDatabase();
  
  try {
    database.runSync(`
      INSERT OR IGNORE INTO missed_questions (question_id)
      VALUES (?)
    `, [id]);
  } catch (e) {
    logError('db.addMissedQuestion', e);
  }
}

export async function removeMissedQuestion(id: number): Promise<void> {
  const database = getDatabase();
  
  try {
    database.runSync(`
      DELETE FROM missed_questions
      WHERE question_id = ?
    `, [id]);
  } catch (e) {
    logError('db.removeMissedQuestion', e);
  }
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function rowToQuestion(row: Record<string, unknown>): Question {
  return {
    id: row.id as number,
    question: {
      es: row.question_es as string,
      en: row.question_en as string,
      ar: row.question_ar as string,
    },
    options: {
      es: JSON.parse(row.options_es as string),
      en: JSON.parse(row.options_en as string),
      ar: JSON.parse(row.options_ar as string),
    },
    correctAnswer: {
      es: row.correct_answer_es as string,
      en: row.correct_answer_en as string,
      ar: row.correct_answer_ar as string,
    },
    explanation: {
      es: row.explanation_es as string,
      en: row.explanation_en as string,
      ar: row.explanation_ar as string,
    },
    category: row.category as Question['category'],
    difficulty: row.difficulty as Question['difficulty'],
    arabicVerse: row.arabic_verse as string | undefined,
    source: row.source as string | undefined,
    verified: (row.verified as number) === 1,
    flag: (row.flag as number) === 1,
    correction_note: row.correction_note as string | undefined,
  };
}
