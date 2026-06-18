// Daily hadith — online-capable with a verified offline fallback.
//
// Design: the app is NOT offline-only. The point is linked, verifiable sources
// and room to grow online. So getDailyHadith() is structured as:
//   1. same-day cache (AsyncStorage)        → instant, no network
//   2. remote fetch (configurable endpoint) → future online source, best-effort
//   3. bundled sahih dataset (deterministic)→ always-correct fallback
// Whatever resolves first wins; the UI never blocks on the network and never
// shows unverified content. Each hadith keeps a `source` string compatible with
// parseSource() so the reference becomes a tappable sunnah.com link.
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { Language } from "./types";

export interface Hadith {
  id: number;
  text: { es: string; en: string; ar: string };
  narrator: { es: string; en: string; ar: string };
  // Free-text source, parseSource()-compatible (e.g. "Sahih al-Bukhari 1").
  source: string;
}

// ── Bundled dataset ─────────────────────────────────────────────────────────
// Curated sahih ahadith (Bukhari / Muslim, plus widely-accepted Nawawi 40).
// Short matn chosen for daily reflection. Arabic is the established text.
export const HADITHS: Hadith[] = [
  {
    id: 1,
    text: {
      es: "Las obras valen según las intenciones, y cada persona tendrá lo que se propuso.",
      en: "Actions are judged by intentions, and everyone will have what they intended.",
      ar: "إِنَّمَا الأَعْمَالُ بِالنِّيَّاتِ، وَإِنَّمَا لِكُلِّ امْرِئٍ مَا نَوَى.",
    },
    narrator: { es: "Umar ibn al-Khattab", en: "Umar ibn al-Khattab", ar: "عمر بن الخطاب" },
    source: "Sahih al-Bukhari 1",
  },
  {
    id: 2,
    text: {
      es: "Ninguno de vosotros cree de verdad hasta que ame para su hermano lo que ama para sí mismo.",
      en: "None of you truly believes until he loves for his brother what he loves for himself.",
      ar: "لَا يُؤْمِنُ أَحَدُكُمْ حَتَّى يُحِبَّ لِأَخِيهِ مَا يُحِبُّ لِنَفْسِهِ.",
    },
    narrator: { es: "Anas ibn Malik", en: "Anas ibn Malik", ar: "أنس بن مالك" },
    source: "Sahih al-Bukhari 13",
  },
  {
    id: 3,
    text: {
      es: "El musulmán es aquel de cuya lengua y mano están a salvo los demás musulmanes.",
      en: "The Muslim is the one from whose tongue and hand other Muslims are safe.",
      ar: "الْمُسْلِمُ مَنْ سَلِمَ الْمُسْلِمُونَ مِنْ لِسَانِهِ وَيَدِهِ.",
    },
    narrator: { es: "Abdullah ibn Amr", en: "Abdullah ibn Amr", ar: "عبد الله بن عمرو" },
    source: "Sahih al-Bukhari 10",
  },
  {
    id: 4,
    text: {
      es: "Quien crea en Allah y en el Último Día, que diga el bien o que calle.",
      en: "Whoever believes in Allah and the Last Day, let him speak good or remain silent.",
      ar: "مَنْ كَانَ يُؤْمِنُ بِاللَّهِ وَالْيَوْمِ الْآخِرِ فَلْيَقُلْ خَيْرًا أَوْ لِيَصْمُتْ.",
    },
    narrator: { es: "Abu Hurayrah", en: "Abu Hurayrah", ar: "أبو هريرة" },
    source: "Sahih al-Bukhari 6018",
  },
  {
    id: 5,
    text: {
      es: "El mejor de vosotros es quien aprende el Corán y lo enseña.",
      en: "The best of you are those who learn the Quran and teach it.",
      ar: "خَيْرُكُمْ مَنْ تَعَلَّمَ الْقُرْآنَ وَعَلَّمَهُ.",
    },
    narrator: { es: "Uthman ibn Affan", en: "Uthman ibn Affan", ar: "عثمان بن عفان" },
    source: "Sahih al-Bukhari 5027",
  },
  {
    id: 6,
    text: {
      es: "La religión es sinceridad y buen consejo (naseeha).",
      en: "Religion is sincerity and sincere counsel (naseeha).",
      ar: "الدِّينُ النَّصِيحَةُ.",
    },
    narrator: { es: "Tamim ad-Dari", en: "Tamim ad-Dari", ar: "تميم الداري" },
    source: "Sahih Muslim 55",
  },
  {
    id: 7,
    text: {
      es: "Allah no mira vuestras figuras ni vuestros bienes, sino que mira vuestros corazones y vuestras obras.",
      en: "Allah does not look at your appearances or wealth, but at your hearts and deeds.",
      ar: "إِنَّ اللَّهَ لَا يَنْظُرُ إِلَى صُوَرِكُمْ وَأَمْوَالِكُمْ، وَلَكِنْ يَنْظُرُ إِلَى قُلُوبِكُمْ وَأَعْمَالِكُمْ.",
    },
    narrator: { es: "Abu Hurayrah", en: "Abu Hurayrah", ar: "أبو هريرة" },
    source: "Sahih Muslim 2564",
  },
  {
    id: 8,
    text: {
      es: "El fuerte no es el que vence luchando; el fuerte es quien se domina a sí mismo en la ira.",
      en: "The strong is not the good wrestler; the strong is the one who controls himself in anger.",
      ar: "لَيْسَ الشَّدِيدُ بِالصُّرَعَةِ، إِنَّمَا الشَّدِيدُ الَّذِي يَمْلِكُ نَفْسَهُ عِنْدَ الْغَضَبِ.",
    },
    narrator: { es: "Abu Hurayrah", en: "Abu Hurayrah", ar: "أبو هريرة" },
    source: "Sahih al-Bukhari 6114",
  },
  {
    id: 9,
    text: {
      es: "Facilitad y no dificultéis; dad buenas nuevas y no ahuyentéis.",
      en: "Make things easy and do not make them hard; give glad tidings and do not repel.",
      ar: "يَسِّرُوا وَلَا تُعَسِّرُوا، وَبَشِّرُوا وَلَا تُنَفِّرُوا.",
    },
    narrator: { es: "Anas ibn Malik", en: "Anas ibn Malik", ar: "أنس بن مالك" },
    source: "Sahih al-Bukhari 69",
  },
  {
    id: 10,
    text: {
      es: "Quien no es misericordioso con la gente, Allah no será misericordioso con él.",
      en: "Whoever does not show mercy to people, Allah will not show mercy to him.",
      ar: "مَنْ لَا يَرْحَمُ النَّاسَ لَا يَرْحَمُهُ اللَّهُ.",
    },
    narrator: { es: "Jarir ibn Abdullah", en: "Jarir ibn Abdullah", ar: "جرير بن عبد الله" },
    source: "Sahih al-Bukhari 7376",
  },
  {
    id: 11,
    text: {
      es: "Una buena palabra es caridad.",
      en: "A good word is charity.",
      ar: "الْكَلِمَةُ الطَّيِّبَةُ صَدَقَةٌ.",
    },
    narrator: { es: "Abu Hurayrah", en: "Abu Hurayrah", ar: "أبو هريرة" },
    source: "Sahih al-Bukhari 2989",
  },
  {
    id: 12,
    text: {
      es: "La purificación es la mitad de la fe.",
      en: "Purity is half of faith.",
      ar: "الطُّهُورُ شَطْرُ الْإِيمَانِ.",
    },
    narrator: { es: "Abu Malik al-Ash'ari", en: "Abu Malik al-Ash'ari", ar: "أبو مالك الأشعري" },
    source: "Sahih Muslim 223",
  },
  {
    id: 13,
    text: {
      es: "Quien recorre un camino buscando conocimiento, Allah le facilita por ello un camino hacia el Paraíso.",
      en: "Whoever treads a path seeking knowledge, Allah will make easy for him a path to Paradise.",
      ar: "مَنْ سَلَكَ طَرِيقًا يَلْتَمِسُ فِيهِ عِلْمًا سَهَّلَ اللَّهُ لَهُ بِهِ طَرِيقًا إِلَى الْجَنَّةِ.",
    },
    narrator: { es: "Abu Hurayrah", en: "Abu Hurayrah", ar: "أبو هريرة" },
    source: "Sahih Muslim 2699",
  },
  {
    id: 14,
    text: {
      es: "Los creyentes, en su afecto y misericordia mutua, son como un solo cuerpo: si un miembro sufre, todo el cuerpo le acompaña en el desvelo y la fiebre.",
      en: "The believers in their mutual love and mercy are like one body: when one part hurts, the whole body responds with sleeplessness and fever.",
      ar: "مَثَلُ الْمُؤْمِنِينَ فِي تَوَادِّهِمْ وَتَرَاحُمِهِمْ كَمَثَلِ الْجَسَدِ الْوَاحِدِ.",
    },
    narrator: { es: "an-Nu'man ibn Bashir", en: "an-Nu'man ibn Bashir", ar: "النعمان بن بشير" },
    source: "Sahih Muslim 2586",
  },
  {
    id: 15,
    text: {
      es: "Teme a Allah dondequiera que estés, sigue la mala acción con una buena que la borre, y trata a la gente con buen carácter.",
      en: "Fear Allah wherever you are, follow a bad deed with a good one to erase it, and treat people with good character.",
      ar: "اتَّقِ اللَّهَ حَيْثُمَا كُنْتَ، وَأَتْبِعِ السَّيِّئَةَ الْحَسَنَةَ تَمْحُهَا، وَخَالِقِ النَّاسَ بِخُلُقٍ حَسَنٍ.",
    },
    narrator: { es: "Abu Dharr al-Ghifari", en: "Abu Dharr al-Ghifari", ar: "أبو ذر الغفاري" },
    source: "Sunan al-Tirmidhi 1987",
  },
  {
    id: 16,
    text: {
      es: "Parte de la excelencia del Islam de una persona es que abandona aquello que no le concierne.",
      en: "Part of the excellence of a person's Islam is leaving what does not concern him.",
      ar: "مِنْ حُسْنِ إِسْلَامِ الْمَرْءِ تَرْكُهُ مَا لَا يَعْنِيهِ.",
    },
    narrator: { es: "Abu Hurayrah", en: "Abu Hurayrah", ar: "أبو هريرة" },
    source: "Sunan al-Tirmidhi 2317",
  },
  {
    id: 17,
    text: {
      es: "No menospreciéis ningún acto de bien, aunque sea recibir a tu hermano con rostro alegre.",
      en: "Do not belittle any good deed, even meeting your brother with a cheerful face.",
      ar: "لَا تَحْقِرَنَّ مِنَ الْمَعْرُوفِ شَيْئًا، وَلَوْ أَنْ تَلْقَى أَخَاكَ بِوَجْهٍ طَلْقٍ.",
    },
    narrator: { es: "Abu Dharr al-Ghifari", en: "Abu Dharr al-Ghifari", ar: "أبو ذر الغفاري" },
    source: "Sahih Muslim 2626",
  },
  {
    id: 18,
    text: {
      es: "Quien no agradece a la gente, no agradece a Allah.",
      en: "Whoever does not thank people does not thank Allah.",
      ar: "مَنْ لَا يَشْكُرُ النَّاسَ لَا يَشْكُرُ اللَّهَ.",
    },
    narrator: { es: "Abu Hurayrah", en: "Abu Hurayrah", ar: "أبو هريرة" },
    source: "Sunan al-Tirmidhi 1954",
  },
  {
    id: 19,
    text: {
      es: "La sonrisa hacia tu hermano es una caridad.",
      en: "Smiling at your brother is an act of charity.",
      ar: "تَبَسُّمُكَ فِي وَجْهِ أَخِيكَ صَدَقَةٌ.",
    },
    narrator: { es: "Abu Dharr al-Ghifari", en: "Abu Dharr al-Ghifari", ar: "أبو ذر الغفاري" },
    source: "Sunan al-Tirmidhi 1956",
  },
  {
    id: 20,
    text: {
      es: "Quien alivia a un creyente de una aflicción de este mundo, Allah le aliviará una aflicción del Día de la Resurrección.",
      en: "Whoever relieves a believer of a hardship in this world, Allah will relieve him of a hardship on the Day of Resurrection.",
      ar: "مَنْ نَفَّسَ عَنْ مُؤْمِنٍ كُرْبَةً مِنْ كُرَبِ الدُّنْيَا نَفَّسَ اللَّهُ عَنْهُ كُرْبَةً مِنْ كُرَبِ يَوْمِ الْقِيَامَةِ.",
    },
    narrator: { es: "Abu Hurayrah", en: "Abu Hurayrah", ar: "أبو هريرة" },
    source: "Sahih Muslim 2699",
  },
];

// ── Daily rotation ──────────────────────────────────────────────────────────

const CACHE_KEY = "@noor:hadith_cache";

function localDateString(d: Date): string {
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
}

// Deterministic day-of-epoch index so everyone sees the same hadith each day
// and it advances by one daily, looping over the dataset.
export function getDailyHadithIndex(date = new Date(), size = HADITHS.length): number {
  const dayNumber = Math.floor(date.getTime() / 86_400_000);
  return ((dayNumber % size) + size) % size;
}

export function getBundledDailyHadith(date = new Date()): Hadith {
  return HADITHS[getDailyHadithIndex(date)] as Hadith;
}

// Future online source. Returns null today (no endpoint configured) so the app
// falls back to the verified bundle. When a trusted multilingual endpoint is
// available, implement the fetch here (AbortController timeout + shape check)
// and the rest of the pipeline already handles caching and fallback.
async function fetchRemoteHadith(_date: string): Promise<Hadith | null> {
  return null;
}

interface CacheEntry {
  date: string;
  hadith: Hadith;
}

// Resolves today's hadith: cache → remote (best-effort) → bundled.
// Never throws; always returns a verified hadith.
export async function getDailyHadith(now = new Date()): Promise<Hadith> {
  const today = localDateString(now);

  try {
    const raw = await AsyncStorage.getItem(CACHE_KEY);
    if (raw) {
      const entry = JSON.parse(raw) as CacheEntry;
      if (entry?.date === today && entry.hadith?.text) return entry.hadith;
    }
  } catch {
    // ignore — fall through to fetch/bundle
  }

  let hadith: Hadith | null = null;
  try {
    hadith = await fetchRemoteHadith(today);
  } catch {
    hadith = null;
  }
  if (!hadith) hadith = getBundledDailyHadith(now);

  try {
    await AsyncStorage.setItem(CACHE_KEY, JSON.stringify({ date: today, hadith }));
  } catch {
    // cache write best-effort
  }
  return hadith;
}

export function pickHadithLang(h: Hadith, lang: Language): HadithView {
  return { text: h.text[lang], narrator: h.narrator[lang], source: h.source };
}

// ── Live API source ─────────────────────────────────────────────────────────
// Single-language view of a hadith for display. The daily card uses the curated
// trilingual bundle (coherent + offline); this powers the "another hadith"
// refresh, pulling fresh authentic narrations from a live keyless source.
export interface HadithView {
  text: string;
  narrator: string;
  source: string;
}

// fawazahmed0/hadith-api on the jsDelivr CDN — keyless, sourced from sunnah.com.
// We read from Nawawi's 40 (An-Nawawi), a famously authentic, curated collection
// with clean matn (no isnad noise). Editions exist for en/ar but not es; Spanish
// is produced by translating the English edition (see translateToSpanish).
const API_BASE = "https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1/editions";
const NAWAWI_EDITION: Record<Language, string> = {
  en: "eng-nawawi",
  ar: "ara-nawawi",
  es: "eng-nawawi", // source for machine translation
};
const NAWAWI_COUNT = 42;
const FETCH_TIMEOUT_MS = 6000;
const TRANSLATE_TIMEOUT_MS = 6000;
const TRANSLATION_CACHE_KEY = "@noor:hadith_translations";
const TRANSLATION_CACHE_MAX = 60;

const NARRATOR_LABEL: Record<Language, string> = {
  en: "An-Nawawi's 40",
  ar: "الأربعون النووية",
  es: "Los 40 de an-Nawawi",
};

interface ApiHadith {
  text?: string;
  reference?: { book?: number; hadith?: number };
}
interface ApiResponse {
  hadiths?: ApiHadith[];
}

// Fetches the raw hadith text from a given edition. Returns null on any failure.
async function fetchNawawiText(
  edition: string,
  hadithNumber: number
): Promise<{ text: string; num: number } | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(`${API_BASE}/${edition}/${hadithNumber}.json`, {
      signal: controller.signal,
    });
    if (!res.ok) return null;
    const data = (await res.json()) as ApiResponse;
    const h = data.hadiths?.[0];
    const text = h?.text?.trim();
    if (!text) return null;
    return { text, num: h?.reference?.hadith ?? hadithNumber };
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

// Translation cache: English source text → Spanish. Bounded LRU-ish (drop oldest
// keys past the cap) so we don't re-hit the free translation API or grow storage.
async function getCachedTranslation(key: string): Promise<string | null> {
  try {
    const raw = await AsyncStorage.getItem(TRANSLATION_CACHE_KEY);
    if (!raw) return null;
    const map = JSON.parse(raw) as Record<string, string>;
    return map[key] ?? null;
  } catch {
    return null;
  }
}

async function setCachedTranslation(key: string, value: string): Promise<void> {
  try {
    const raw = await AsyncStorage.getItem(TRANSLATION_CACHE_KEY);
    const map: Record<string, string> = raw ? JSON.parse(raw) : {};
    map[key] = value;
    const keys = Object.keys(map);
    if (keys.length > TRANSLATION_CACHE_MAX) {
      for (const k of keys.slice(0, keys.length - TRANSLATION_CACHE_MAX)) delete map[k];
    }
    await AsyncStorage.setItem(TRANSLATION_CACHE_KEY, JSON.stringify(map));
  } catch {
    // best-effort
  }
}

interface MyMemoryResponse {
  responseData?: { translatedText?: string };
  responseStatus?: number;
}

// Machine-translates English → Spanish via MyMemory (keyless free API), with a
// cache. The source link still points to the authentic English narration on
// sunnah.com so the translation is always verifiable. Returns null on failure.
async function translateToSpanish(text: string): Promise<string | null> {
  const cached = await getCachedTranslation(text);
  if (cached) return cached;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TRANSLATE_TIMEOUT_MS);
  try {
    const url =
      "https://api.mymemory.translated.net/get?langpair=en|es&q=" +
      encodeURIComponent(text);
    const res = await fetch(url, { signal: controller.signal });
    if (!res.ok) return null;
    const data = (await res.json()) as MyMemoryResponse;
    const out = data.responseData?.translatedText?.trim();
    if (!out || data.responseStatus !== 200) return null;
    await setCachedTranslation(text, out);
    return out;
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

// Fetches a random An-Nawawi hadith in the requested language. For Spanish it
// fetches the English edition and machine-translates it. Returns null on any
// failure (network, timeout, malformed, failed translation) so the caller can
// fall back to the verified bundle. Never throws.
export async function fetchLiveHadith(
  language: Language,
  hadithNumber = 1 + Math.floor(Math.random() * NAWAWI_COUNT)
): Promise<HadithView | null> {
  const fetched = await fetchNawawiText(NAWAWI_EDITION[language], hadithNumber);
  if (!fetched) return null;

  let text = fetched.text;
  if (language === "es") {
    const translated = await translateToSpanish(fetched.text);
    if (!translated) return null;
    text = translated;
  }

  return {
    text,
    narrator: NARRATOR_LABEL[language],
    // parseSource-friendly: links to the authentic narration on sunnah.com so
    // the (translated) text stays verifiable against the source.
    source: `Sunan an-Nawawi ${fetched.num} — sunnah.com/nawawi40:${fetched.num}`,
  };
}
