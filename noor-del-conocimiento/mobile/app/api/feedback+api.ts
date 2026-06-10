/**
 * Server-side AI feedback endpoint (Expo API route).
 *
 * Security properties (section 7.3):
 *  - ANTHROPIC_API_KEY only ever read from server env (EAS Secret / host env).
 *  - questionId validated against the server-side bank; no arbitrary payloads.
 *  - The model only REPHRASES the verified explanation — it never decides the
 *    answer or adds new facts (section 6.3).
 *  - Per-IP rate limiting, request size cap, upstream timeout, generic errors.
 *  - No PII logged.
 */
import questionsJson from '../../data/questions.json';
import type { Language, Question } from '../../lib/types';

const QUESTIONS = questionsJson as unknown as Question[];
const QUESTION_INDEX = new Map(QUESTIONS.map((q) => [q.id, q]));

const SUPPORTED_LANGS: readonly string[] = ['es', 'en', 'ar', 'ma'];
const MAX_BODY_BYTES = 1024;
const UPSTREAM_TIMEOUT_MS = 10_000;
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 20;

const LANGUAGE_NAMES: Record<Language, string> = {
  es: 'Spanish',
  en: 'English',
  ar: 'Modern Standard Arabic',
  ma: 'Moroccan Darija (Arabic script)',
};

// Best-effort in-memory limiter (per serverless instance).
const hits = new Map<string, { count: number; windowStart: number }>();
function rateLimited(key: string): boolean {
  const now = Date.now();
  const entry = hits.get(key);
  if (!entry || now - entry.windowStart > RATE_LIMIT_WINDOW_MS) {
    hits.set(key, { count: 1, windowStart: now });
    return false;
  }
  entry.count += 1;
  return entry.count > RATE_LIMIT_MAX;
}

function corsHeaders(origin: string | null): Record<string, string> {
  const allowed = (process.env.FEEDBACK_ALLOWED_ORIGINS ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Vary: 'Origin',
  };
  if (origin && allowed.includes(origin)) {
    headers['Access-Control-Allow-Origin'] = origin;
    headers['Access-Control-Allow-Methods'] = 'POST, OPTIONS';
    headers['Access-Control-Allow-Headers'] = 'Content-Type';
  }
  return headers;
}

function jsonResponse(status: number, body: unknown, origin: string | null): Response {
  return new Response(JSON.stringify(body), { status, headers: corsHeaders(origin) });
}

export function OPTIONS(request: Request): Response {
  return new Response(null, { status: 204, headers: corsHeaders(request.headers.get('origin')) });
}

export async function POST(request: Request): Promise<Response> {
  const origin = request.headers.get('origin');
  const genericError = () => jsonResponse(500, { error: 'unavailable' }, origin);

  try {
    const ip =
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';
    if (rateLimited(ip)) return jsonResponse(429, { error: 'too_many_requests' }, origin);

    const raw = await request.text();
    if (raw.length > MAX_BODY_BYTES) return jsonResponse(413, { error: 'too_large' }, origin);

    let parsed: { questionId?: unknown; lang?: unknown };
    try {
      parsed = JSON.parse(raw) as { questionId?: unknown; lang?: unknown };
    } catch {
      return jsonResponse(400, { error: 'bad_request' }, origin);
    }

    const { questionId, lang } = parsed;
    if (
      typeof questionId !== 'string' ||
      typeof lang !== 'string' ||
      !SUPPORTED_LANGS.includes(lang)
    ) {
      return jsonResponse(400, { error: 'bad_request' }, origin);
    }

    const question = QUESTION_INDEX.get(questionId);
    if (!question) return jsonResponse(400, { error: 'bad_request' }, origin);

    const language = lang as Language;
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) return genericError();

    const questionText = question.question[language] ?? question.question.en;
    const options = question.options[language] ?? question.options.en;
    const correct = options[question.correctIndex] ?? '';
    const explanation = question.explanation[language] ?? question.explanation.en;

    const systemPrompt = [
      'You are a warm, respectful educational assistant for an Islamic knowledge quiz.',
      'You will receive a quiz question, its verified correct answer, its verified explanation and a cited source.',
      'Your ONLY task is to rephrase and gently expand the provided verified explanation pedagogically.',
      'HARD RULES:',
      '- Do NOT add any new religious facts, dates, names, verses or hadiths not present in the provided context.',
      '- Do NOT quote any Quranic verse or hadith that is not already in the provided context.',
      '- Do NOT issue religious rulings (fatwas) or advice on religious practice.',
      `- Respond ONLY in ${LANGUAGE_NAMES[language]}.`,
      '- Keep the response under 80 words. Warm, encouraging tone: a mistake is a chance to learn.',
    ].join('\n');

    const userPrompt = [
      `Question: ${questionText}`,
      `Verified correct answer: ${correct}`,
      `Verified explanation: ${explanation}`,
      `Cited source: ${question.source.primary}${question.source.secondary ? ` · ${question.source.secondary}` : ''}`,
    ].join('\n');

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), UPSTREAM_TIMEOUT_MS);
    const upstream = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 300,
        system: systemPrompt,
        messages: [{ role: 'user', content: userPrompt }],
      }),
      signal: controller.signal,
    });
    clearTimeout(timer);

    if (!upstream.ok) return genericError();
    const data = (await upstream.json()) as {
      content?: Array<{ type: string; text?: string }>;
    };
    const text = data.content?.find((c) => c.type === 'text')?.text;
    if (!text) return genericError();

    return jsonResponse(200, { feedback: text }, origin);
  } catch {
    return genericError();
  }
}
