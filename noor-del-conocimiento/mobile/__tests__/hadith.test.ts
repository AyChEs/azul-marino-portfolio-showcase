import {
  HADITHS,
  getDailyHadithIndex,
  getBundledDailyHadith,
  pickHadithLang,
} from "../lib/hadith";

describe("daily hadith rotation", () => {
  it("returns a valid in-range index", () => {
    const idx = getDailyHadithIndex(new Date("2026-06-13"));
    expect(idx).toBeGreaterThanOrEqual(0);
    expect(idx).toBeLessThan(HADITHS.length);
  });

  it("is deterministic for the same day", () => {
    const a = getDailyHadithIndex(new Date("2026-06-13T03:00:00Z"));
    const b = getDailyHadithIndex(new Date("2026-06-13T20:00:00Z"));
    expect(a).toBe(b);
  });

  it("advances by exactly one each day and wraps around", () => {
    const day0 = getDailyHadithIndex(new Date("2026-01-01"));
    const day1 = getDailyHadithIndex(new Date("2026-01-02"));
    expect(day1).toBe((day0 + 1) % HADITHS.length);
  });

  it("every bundled hadith has all three languages and a source", () => {
    for (const h of HADITHS) {
      expect(h.text.es && h.text.en && h.text.ar).toBeTruthy();
      expect(h.narrator.es && h.narrator.en && h.narrator.ar).toBeTruthy();
      expect(typeof h.source).toBe("string");
      expect(h.source.length).toBeGreaterThan(0);
    }
  });

  it("has unique ids", () => {
    const ids = new Set(HADITHS.map((h) => h.id));
    expect(ids.size).toBe(HADITHS.length);
  });

  it("pickHadithLang returns the requested language", () => {
    const h = getBundledDailyHadith(new Date("2026-06-13"));
    const picked = pickHadithLang(h, "es");
    expect(picked.text).toBe(h.text.es);
    expect(picked.narrator).toBe(h.narrator.es);
  });
});
