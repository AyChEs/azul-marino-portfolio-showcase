/**
 * Questions loader — re-exports from database module for backward compatibility.
 * 
 * This module maintains the same API as the old JSON-based loader,
 * but now queries SQLite instead of parsing a JSON file.
 */

import { loadQuestions as dbLoadQuestions, clearQuestionsCache } from './database';

export async function loadQuestions() {
  return dbLoadQuestions();
}

export function getQuestionsSync() {
  // Note: With SQLite, we can't provide a truly synchronous accessor
  // without first loading the data. This is a limitation of the async
  // nature of database queries.
  // 
  // For now, return null and let callers use the async loadQuestions().
  // In the future, we could maintain an in-memory cache that's populated
  // on app start.
  return null;
}

export { clearQuestionsCache };
