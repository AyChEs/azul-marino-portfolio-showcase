// Expo API Route — server-side proxy for Anthropic Claude
// Keeps the API key out of the native bundle.
import Anthropic from "@anthropic-ai/sdk";

// ── Rate limiter ─────────────────────────────────────────────────────────────
// Limits: 10 requests per IP per 60-second window.
// In-memory only — resets on server restart, sufficient for Expo server rendering.

const RATE_WINDOW_MS = 60_000;
const RATE_MAX_REQUESTS = 10;

const rateMap = new Map<string, number[]>();

function getClientIP(request: Request): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "unknown"
  );
}

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const windowStart = now - RATE_WINDOW_MS;
  const hits = (rateMap.get(ip) ?? []).filter((t) => t > windowStart);
  hits.push(now);
  rateMap.set(ip, hits);
  // Prune stale IPs to avoid unbounded memory growth
  if (rateMap.size > 5000) {
    for (const [key, timestamps] of rateMap.entries()) {
      if (timestamps.every((t) => t <= windowStart)) rateMap.delete(key);
    }
  }
  return hits.length > RATE_MAX_REQUESTS;
}

// ── Input sanitization ───────────────────────────────────────────────────────
// Prevents prompt injection: strips control characters and known injection
// patterns before embedding user-supplied text into the Claude prompt.

const MAX_QUESTION_LEN = 500;
const MAX_ANSWER_LEN = 200;
const MAX_LANG_LEN = 5;

// Sequences that attempt to override system instructions
const INJECTION_PATTERNS = [
  /ignore\s+previous\s+instructions?/gi,
  /ignore\s+all\s+instructions?/gi,
  /you\s+are\s+now\s+(a|an)\s+/gi,
  /forget\s+(everything|all|previous)/gi,
  /system\s+prompt/gi,
  /\[INST\]/gi,
  /<\|im_start\|>/gi,
  /human:\s*\n/gi,
  /assistant:\s*\n/gi,
];

function sanitize(raw: string, maxLen: number): string {
  let s = raw
    // Strip null bytes and non-printable control chars (keep \n, \t)
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "")
    .slice(0, maxLen)
    .trim();

  for (const pattern of INJECTION_PATTERNS) {
    s = s.replace(pattern, "[redacted]");
  }
  return s;
}

// ── Request / response types ─────────────────────────────────────────────────

interface FeedbackRequest {
  question: string;
  correctAnswer: string;
  userAnswer: string;
  language: string;
}

const ALLOWED_LANGUAGES = new Set(["es", "en", "ar"]);

const LANGUAGE_NAMES: Record<string, string> = {
  es: "Spanish",
  en: "English",
  ar: "Modern Standard Arabic (فُصحى)",
};

// ── Handler ──────────────────────────────────────────────────────────────────

export async function POST(request: Request): Promise<Response> {
  // Rate limit
  const ip = getClientIP(request);
  if (isRateLimited(ip)) {
    return Response.json({ error: "Too many requests" }, { status: 429 });
  }

  // API key
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return Response.json({ error: "Service unavailable" }, { status: 503 });
  }

  // Parse body
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (
    typeof body !== "object" ||
    body === null ||
    typeof (body as FeedbackRequest).question !== "string" ||
    typeof (body as FeedbackRequest).correctAnswer !== "string" ||
    typeof (body as FeedbackRequest).userAnswer !== "string" ||
    typeof (body as FeedbackRequest).language !== "string"
  ) {
    return Response.json({ error: "Missing or invalid fields" }, { status: 400 });
  }

  const raw = body as FeedbackRequest;

  // Validate language against allowlist
  const lang = raw.language.slice(0, MAX_LANG_LEN).toLowerCase();
  if (!ALLOWED_LANGUAGES.has(lang)) {
    return Response.json({ error: "Unsupported language" }, { status: 400 });
  }

  // Sanitize all user-supplied strings
  const question = sanitize(raw.question, MAX_QUESTION_LEN);
  const correctAnswer = sanitize(raw.correctAnswer, MAX_ANSWER_LEN);
  const userAnswer = sanitize(raw.userAnswer, MAX_ANSWER_LEN);

  if (!question || !correctAnswer || !userAnswer) {
    return Response.json({ error: "Fields must not be empty" }, { status: 400 });
  }

  const langName = LANGUAGE_NAMES[lang];

  // Call Claude
  const client = new Anthropic({ apiKey });

  try {
    const message = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 256,
      messages: [
        {
          role: "user",
          content: `You are Noor, a knowledgeable and encouraging Islamic studies tutor.
The student answered an Islamic trivia question incorrectly.

Question: ${question}
Correct answer: ${correctAnswer}
Student's answer: ${userAnswer}

Respond in ${langName}. Give a brief, warm explanation (2-3 sentences) of why the correct answer is right, citing the relevant Quranic verse or hadith source only if you are certain of it. Be encouraging, never condescending. Do NOT invent citations.`,
        },
      ],
    });

    const text =
      message.content[0].type === "text" ? message.content[0].text : "";
    return Response.json({ feedback: text });
  } catch (err) {
    console.error("[/api/feedback] Anthropic error:", err);
    return Response.json({ error: "Upstream error" }, { status: 502 });
  }
}
