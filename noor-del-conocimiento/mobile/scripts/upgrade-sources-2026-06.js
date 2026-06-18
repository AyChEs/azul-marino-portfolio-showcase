// One-shot: upgrade 57 vague question sources to concrete, verifiable citations.
// Definitions → canonical reference works (Al-Itqan, Ibn al-Salah's Muqaddima,
// Al-Mu'jam al-Mufahras concordance). Surah-specific facts → Quran verse (links
// via parseSource). No fabricated hadith numbers — only well-established refs.
const fs = require("fs");
const path = require("path");
const FILE = path.join(__dirname, "..", "data", "questions.json");
const qs = JSON.parse(fs.readFileSync(FILE, "utf8"));

const ITQAN = "Al-Suyuti, Al-Itqan fi Ulum al-Quran";
const MUFAHRAS = "Al-Mu'jam al-Mufahras li-Alfaz al-Quran (M. F. Abd al-Baqi)";
const IBNSALAH = "Ibn al-Salah, Muqaddima fi Ulum al-Hadith";

const MAP = {
  // ── Quranic sciences: structure (Al-Itqan) ──
  151: `${ITQAN} — el Corán se divide en 30 Yuz (partes iguales)`,
  152: `${ITQAN} — el Corán se divide en 60 Hizb (2 por cada Yuz)`,
  153: "Mushaf de Madina (conteo Kufí) — 6,236 ayat",
  155: `${ITQAN} — ninguna Surah se repite textualmente en el Corán`,
  159: `${ITQAN} — 6 Suras con nombre de profeta: Yunus (10), Hud (11), Yusuf (12), Ibrahim (14), Muhammad (47), Nuh (71)`,
  160: `${ITQAN} — 29 Suras comienzan con Huruf Muqatta'at (letras desconectadas)`,
  167: `${ITQAN} — Al-Fatihah tiene múltiples nombres (Umm al-Kitab, Al-Sab' al-Mathani, etc.)`,
  379: `${ITQAN} — el Corán contiene 114 Suras`,
  381: "Mushaf de Madina (conteo Kufí) — 6,236 ayat en total",
  388: "Ibn al-Jazari, Al-Nashr fi al-Qira'at al-Ashr — 10 Qira'at mutawatir reconocidas",
  551: `${ITQAN} — el Corán contiene 114 Suras`,
  552: "Mushaf de Madina (conteo Kufí) — 6,236 ayat en total",
  563: `${ITQAN} — clasificación de las Suras en Makkiyyah y Madaniyyah`,
  566: `${ITQAN} — Al-Fatihah es la Sura con más nombres registrados`,
  573: `${ITQAN} — 6 Suras con nombres de animales: Al-Baqarah (2), Al-An'am (6), Al-Nahl (16), Al-Naml (27), Al-Ankabut (29), Al-Fil (105)`,

  // ── Quran concordance: name/word counts (Al-Mu'jam al-Mufahras) ──
  165: `${MUFAHRAS} — la palabra 'Yawm' (día) aparece 365 veces`,
  335: `${MUFAHRAS} — Maryam: 34 menciones por nombre`,
  345: `${MUFAHRAS} — Musa: 136 menciones por nombre (el profeta más nombrado)`,
  486: `${MUFAHRAS} — Isa: 25 menciones por nombre`,
  9115: `${MUFAHRAS} — Musa: ~136 menciones, el profeta más nombrado en el Corán`,

  // ── Hadith sciences (Ibn al-Salah) ──
  63: `${IBNSALAH} — el isnad es la cadena de narradores del hadith`,
  98: `${IBNSALAH} — el Hadith: dicho, acción o aprobación tácita del Profeta (ﷺ)`,
  501: `${IBNSALAH} — el Hadith: dichos, acciones y aprobaciones del Profeta (ﷺ)`,
  502: `${IBNSALAH} — el isnad es la cadena de transmisores del hadith`,
  503: `${IBNSALAH} — el matn es el texto o contenido del hadith`,
  504: `${IBNSALAH} — categorías de autenticidad: Sahih, Hasan, Da'if y Mawdu'`,
  516: `${IBNSALAH} — el Hadith Qudsi: palabra de Allah transmitida en palabras del Profeta (ﷺ)`,

  // ── Hadith collections / compilers ──
  288: "Consenso de los muhaddithun — Sahih al-Bukhari, la obra más auténtica tras el Corán; recopilada por al-Bukhari (m. 256 AH)",
  505: "Kutub al-Sitta (las Seis Canónicas): Bukhari, Muslim, Abu Dawud, al-Tirmidhi, al-Nasa'i, Ibn Majah",
  506: "Muhammad ibn Isma'il al-Bukhari (194–256 AH), compilador del Sahih al-Bukhari",
  508: "Muslim ibn al-Hajjaj al-Naysaburi (m. 261 AH), Sahih Muslim — segunda obra más auténtica",
  562: "Ibn Kathir (700–774 AH), autor de Tafsir al-Quran al-Azim",

  // ── Fiqh: terms, schools, founders ──
  44: "Usul al-Fiqh clásico — el Fiqh es la jurisprudencia islámica",
  199: "Al-Shafi'i, Al-Risala — el Ijma (consenso) es una de las cuatro fuentes (usul) del Fiqh",
  276: "Usul al-Fiqh — el Ijtihad es el esfuerzo jurídico independiente del erudito cualificado",
  277: "Las cuatro escuelas sunníes: Hanafi, Maliki, Shafi'i y Hanbali",
  278: "Malik ibn Anas (93–179 AH), fundador del Madhab Maliki; autor de Al-Muwatta",
  279: "Abu Hanifa al-Nu'man (80–150 AH), fundador del Madhab Hanafi",
  509: "Las cuatro escuelas sunníes (Madhahib): Hanafi, Maliki, Shafi'i y Hanbali",
  510: "Abu Hanifa al-Nu'man (80–150 AH), fundador de la escuela Hanafi de jurisprudencia",
  511: "Al-Shafi'i, Al-Risala — el Ijma es el consenso de los eruditos, fuente del Fiqh",

  // ── Quranic-sciences terms ──
  33: `${ITQAN} — el Tafsir es la exégesis o interpretación del Corán`,
  383: "Ibn al-Jazari, Al-Tamhid fi Ilm al-Tajwid — el Tajwid son las reglas de recitación correcta",
  384: "Ulum al-Quran — el Hifz es la memorización completa del Corán; el memorizador es Hafiz",
  385: `${ITQAN} — el Tafsir es la interpretación del Corán`,
  386: "Ibn Kathir, Tafsir al-Quran al-Azim — su célebre obra de exégesis",
  560: "Ibn al-Jazari, Al-Tamhid fi Ilm al-Tajwid — el Tajwid: reglas de pronunciación y recitación",
  561: `${ITQAN} — el Tafsir es la exégesis y explicación del Corán`,

  // ── Surah-specific facts → Quran verse (clickable) ──
  55: "Corán 9 (At-Tawbah) — única Sura que no comienza con Bismillah",
  156: "Corán 58 (Al-Mujadila) — menciona el nombre de Allah en cada uno de sus versículos",
  339: "Corán 9 (At-Tawbah) — única Sura de las 114 sin Bismillah inicial",

  // ── Seerah / history ──
  12: "Ibn Hajar, Al-Isaba fi Tamyiz al-Sahaba — Aisha narró el mayor número de hadices entre las mujeres (~2210)",
  168: "Las cinco oraciones diarias suman 17 raka'at y Al-Fatihah se recita en cada una; su lectura es pilar de la oración (Ubada ibn al-Samit)",
  217: "Tafsir Ibn Kathir (Surah Maryam, 19) — tradición sobre la parienta de Maryam",
  237: "Tradición profética (Sahih Muslim, hadiz de la detención del sol) — Yusha ibn Nun (Josué), sucesor de Musa",
  307: "Al-Tabari, Tarikh al-Rusul wa al-Muluk — Mu'awiya ibn Abi Sufyan, fundador de la dinastía Omeya (41 AH)",
  463: "Nisab de la Zakat: equivalente a 85 g de oro o 595 g de plata (umbral de los 5 awaq de plata; Ubada/Abu Sa'id al-Khudri)",
};

let n = 0,
  missing = [];
for (const q of qs) {
  if (MAP[q.id] !== undefined) {
    q.source = MAP[q.id];
    n++;
  }
}
for (const id of Object.keys(MAP)) {
  if (!qs.some((q) => q.id === Number(id))) missing.push(id);
}
fs.writeFileSync(FILE, JSON.stringify(qs, null, 2) + "\n");
console.log("upgraded", n, "sources");
if (missing.length) console.log("WARN ids not found:", missing.join(","));
