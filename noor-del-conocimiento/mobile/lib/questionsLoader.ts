import type { Question } from "./types";

let questionsCache: Question[] | null = null;

export async function loadQuestions(): Promise<Question[]> {
  if (questionsCache) return questionsCache;
  // Use require() for JSON - more reliable in Metro bundler for production builds
  // than static import, especially for large JSON files (827KB)
  const data = require("../data/questions.json");
  questionsCache = data as Question[];
  return questionsCache;
}

export function getQuestionsSync(): Question[] | null {
  return questionsCache;
}
