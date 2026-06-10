/**
 * Client for the server-side AI feedback endpoint. The Anthropic key lives on
 * the server only; the client sends just questionId + language. On any failure
 * the caller must fall back to the verified explanation from the bank.
 */
import { localized } from './utils';
import { getQuestionById } from './questions';
import type { Language } from './types';

const API_URL = process.env.EXPO_PUBLIC_FEEDBACK_API_URL ?? '/api/feedback';
const TIMEOUT_MS = 8000;

// In-memory cache per questionId+lang to avoid repeated calls (section 6.3).
const cache = new Map<string, string>();

export interface FeedbackResult {
  text: string;
  /** true when the text is the verified bank explanation (AI unavailable). */
  fromBank: boolean;
}

export async function getFeedback(questionId: string, lang: Language): Promise<FeedbackResult> {
  const question = getQuestionById(questionId);
  const fallback = question ? localized(question.explanation, lang) : '';

  const cacheKey = `${questionId}:${lang}`;
  const cached = cache.get(cacheKey);
  if (cached) return { text: cached, fromBank: false };

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ questionId, lang }),
      signal: controller.signal,
    });
    clearTimeout(timer);
    if (!res.ok) return { text: fallback, fromBank: true };
    const data = (await res.json()) as { feedback?: unknown };
    if (typeof data.feedback !== 'string' || data.feedback.length === 0)
      return { text: fallback, fromBank: true };
    cache.set(cacheKey, data.feedback);
    return { text: data.feedback, fromBank: false };
  } catch {
    return { text: fallback, fromBank: true };
  }
}
