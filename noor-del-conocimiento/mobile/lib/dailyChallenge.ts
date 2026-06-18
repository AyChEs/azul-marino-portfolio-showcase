// Daily Challenge — deterministic question selection seeded by date.
// Same question for everyone on the same day, no server needed. Respects the
// production content gate (verified && !flag) via isServable.
import type { Question, Language } from "./types";
import { isServable } from "./gameLogic";

function localDateString(d: Date): string {
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
}

// Stable hash of the YYYY-MM-DD string → deterministic per calendar day.
function hashDate(dateStr: string): number {
  let h = 0;
  for (let i = 0; i < dateStr.length; i++) {
    h = (h * 31 + dateStr.charCodeAt(i)) | 0;
  }
  return h >>> 0;
}

function mulberry32(seed: number): () => number {
  let s = seed | 0;
  return () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function getTodaysQuestion(
  questions: Question[],
  language: Language,
  now: number = Date.now(),
): Question | null {
  const dateStr = localDateString(new Date(now));
  const rand = mulberry32(hashDate(dateStr));
  const servable = questions.filter((q) => isServable(q, language));
  if (servable.length === 0) return null;
  const idx = Math.floor(rand() * servable.length);
  return servable[idx] ?? null;
}

export function getTodayDateString(now: number = Date.now()): string {
  return localDateString(new Date(now));
}

export function isToday(dateStr: string, now: number = Date.now()): boolean {
  return dateStr === localDateString(new Date(now));
}
