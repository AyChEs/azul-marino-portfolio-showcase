// Claude API integration — servidor proxy en producción, cliente en dev.
//
// SEGURIDAD:
//   - En producción nativa (APK/IPA): EXPO_PUBLIC_ANTHROPIC_API_KEY NO debe estar
//     configurada. Todo el tráfico debe pasar por el proxy /api/feedback.
//   - En Expo Go / desarrollo: se acepta la clave pública para iterar rápido.
//   - La clave ANTHROPIC_API_KEY (sin EXPO_PUBLIC_) solo existe en el servidor.
import Anthropic from "@anthropic-ai/sdk";
import type { Language } from "./types";

// Extraer el nombre del modelo aquí para facilitar actualizaciones.
const CLAUDE_MODEL = "claude-sonnet-4-6";

interface FeedbackInput {
  questionId: number;
  question: string;
  correctAnswer: string;
  userAnswer: string;
  /** Verified explanation from the bank — the model may ONLY rephrase/expand it. */
  explanation: string;
  language: Language;
}

// Cache by questionId+language — avoids paying for repeated calls on the
// same question within a session.
const feedbackCache = new Map<string, string>();

const LANGUAGE_NAMES: Record<Language, string> = {
  es: "Spanish",
  en: "English",
  ar: "Modern Standard Arabic (فُصحى)",
};

// ── Input sanitization (client side) ─────────────────────────────────────────
// Defense-in-depth: also sanitized server-side, but sanitize before sending too.

const INJECTION_PATTERNS = [
  /ignore\s+previous\s+instructions?/gi,
  /ignore\s+all\s+instructions?/gi,
  /you\s+are\s+now\s+(a|an)\s+/gi,
  /forget\s+(everything|all|previous)/gi,
  /system\s+prompt/gi,
];

function sanitize(raw: string, maxLen: number): string {
  // Validate length BEFORE sanitizing to avoid processing huge inputs
  if (raw.length > maxLen * 2) return "";
  let s = raw
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "")
    .slice(0, maxLen)
    .trim();
  for (const p of INJECTION_PATTERNS) s = s.replace(p, "[removed]");
  return s;
}

function sanitizeInput(input: FeedbackInput): FeedbackInput {
  return {
    questionId: input.questionId,
    question: sanitize(input.question, 500),
    correctAnswer: sanitize(input.correctAnswer, 200),
    userAnswer: sanitize(input.userAnswer, 200),
    explanation: sanitize(input.explanation, 600),
    language: input.language,
  };
}

// ── Proxy path (web / Expo server rendering) ──────────────────────────────────

async function fetchViaProxy(input: FeedbackInput): Promise<string> {
  const res = await fetch("/api/feedback", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!res.ok) return "";
  const data = (await res.json()) as { feedback?: string };
  return typeof data.feedback === "string" ? data.feedback : "";
}

// ── Direct path (Expo Go / development only) ──────────────────────────────────

async function fetchDirectly(input: FeedbackInput): Promise<string> {
  // Hard gate: the direct path (public key) must never run outside dev builds,
  // even if EXPO_PUBLIC_ANTHROPIC_API_KEY leaks into a production env.
  if (!__DEV__) return "";
  const apiKey = process.env.EXPO_PUBLIC_ANTHROPIC_API_KEY;
  // If the key is absent the build is production — AI feedback disabled without proxy.
  if (!apiKey) return "";

  const client = new Anthropic({
    apiKey,
    dangerouslyAllowBrowser: true,
  });

  const langName = LANGUAGE_NAMES[input.language];
  const isRTL = input.language === "ar";

  const message = await client.messages.create({
    model: CLAUDE_MODEL,
    max_tokens: 256,
    messages: [
      {
        role: "user",
        content: `You are Noor, a warm and knowledgeable Islamic trivia teacher.
A student just answered an Islamic knowledge question incorrectly.
Rephrase and gently expand the VERIFIED EXPLANATION below in a kind,
pedagogical tone (2-3 sentences max).

HARD RULES:
- Base your answer ONLY on the verified explanation provided. Do NOT add new
  religious facts, dates, names, verses or hadiths not present in it.
- Do NOT invent or quote hadith/Quranic verses that are not in the context.
- Do NOT issue religious rulings (fatwas).
- Respond ONLY in ${langName}.${isRTL ? " Write right-to-left." : ""}

Question: ${input.question}
Correct answer: ${input.correctAnswer}
Student's answer: ${input.userAnswer}
VERIFIED EXPLANATION: ${input.explanation}`,
      },
    ],
  });

  // Validate response structure before accessing
  if (!message.content.length || message.content[0].type !== "text") return "";
  return message.content[0].text.trim();
}

// ── Public API ────────────────────────────────────────────────────────────────

export const getAIFeedback = async (input: FeedbackInput): Promise<string> => {
  const cacheKey = `${input.questionId}:${input.language}`;
  const cached = feedbackCache.get(cacheKey);
  if (cached) return cached;
  try {
    const safe = sanitizeInput(input);
    const result =
      typeof window !== "undefined" && window.location?.origin?.startsWith("http")
        ? await fetchViaProxy(safe)
        : await fetchDirectly(safe);
    if (result) feedbackCache.set(cacheKey, result);
    return result;
  } catch {
    // Return empty — caller falls back to the verified bank explanation
    return "";
  }
};
