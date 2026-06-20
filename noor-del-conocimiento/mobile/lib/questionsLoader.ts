import type { Question } from "./types";
import questionsData from "../data/questions.json";

let questionsCache: Question[] | null = null;

export async function loadQuestions(): Promise<Question[]> {
  if (questionsCache) return questionsCache;
  questionsCache = questionsData as Question[];
  return questionsCache;
}

export function getQuestionsSync(): Question[] | null {
  return questionsCache;
}
