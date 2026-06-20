// Parses the free-text `source` field of a question into a display label and,
// when recognizable, a tappable URL (quran.com / sunnah.com). Non-breaking:
// the bank keeps its string format; unknown formats just render as text.

export interface ParsedSource {
  label: string;
  url?: string;
}

const COLLECTION_SLUGS: Record<string, string> = {
  bukhari: 'bukhari',
  bujari: 'bukhari',
  muslim: 'muslim',
  tirmidhi: 'tirmidhi',
  'abu dawud': 'abudawud',
  nasai: 'nasai',
  'ibn majah': 'ibnmajah',
};

export function parseSource(source: string | undefined): ParsedSource | null {
  if (!source || !source.trim()) return null;
  const label = source.trim();

  // Explicit URL inside the string wins.
  const urlMatch = label.match(/https?:\/\/[^\s;,)]+|(?:sunnah|quran)\.com\/[^\s;,)]+/i);
  if (urlMatch) {
    const raw = urlMatch[0];
    return { label, url: raw.startsWith('http') ? raw : `https://${raw}` };
  }

  // "Sahih Bukhari 1741" / "Sahih al-Bujari 3" → sunnah.com/bukhari:1741
  const hadith = label.match(
    /sahih\s+(?:al-)?(bukhari|bujari|muslim)\s+(\d+)|sunan\s+(?:al-)?(tirmidhi|abu dawud|nasai|ibn majah)\s+(\d+)/i,
  );
  if (hadith) {
    const name = (hadith[1] ?? hadith[3] ?? '').toLowerCase();
    const num = hadith[2] ?? hadith[4];
    const slug = COLLECTION_SLUGS[name];
    if (slug && num) return { label, url: `https://sunnah.com/${slug}:${num}` };
  }

  // "Corán 96:1-5" / "Quran 2:282" → quran.com/96/1-5
  const quran = label.match(/(?:cor[áa]n|quran|qur'an)\s+(\d{1,3}):(\d{1,3}(?:-\d{1,3})?)/i);
  if (quran) return { label, url: `https://quran.com/${quran[1]}/${quran[2]}` };

  // Chapter-only reference: "Quran 111" / "Corán 27 (Surah An-Naml)" →
  // quran.com/111 (quran.com supports surah-level URLs). The number must
  // directly follow the word so prose like "el Corán tiene 114 Surahs" — where
  // a word sits between — never matches.
  const quranSurah = label.match(/(?:cor[áa]n|quran|qur'an)\s+(\d{1,3})(?!\s*[:\d])/i);
  if (quranSurah) {
    const n = Number(quranSurah[1]);
    if (n >= 1 && n <= 114) return { label, url: `https://quran.com/${n}` };
  }

  return { label };
}
