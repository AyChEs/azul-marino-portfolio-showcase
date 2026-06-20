import type { Question } from "./types";

let questionsCache: Question[] | null = null;

export async function loadQuestions(): Promise<Question[]> {
  if (questionsCache) return questionsCache;
  const { default: data } = await import("../data/questions.json");
  questionsCache = data as Question[];
  return questionsCache;
}

export function getQuestionsSync(): Question[] | null {
  return questionsCache;
}
