import { parseSource } from '../lib/sources';

describe('parseSource', () => {
  it('returns null for empty sources', () => {
    expect(parseSource(undefined)).toBeNull();
    expect(parseSource('  ')).toBeNull();
  });

  it('extracts explicit URLs', () => {
    const r = parseSource('Sahih Bukhari 1741; sunnah.com/bukhari:1741');
    expect(r?.url).toBe('https://sunnah.com/bukhari:1741');
  });

  it('builds sunnah.com links from hadith references', () => {
    expect(parseSource('Sahih Bukhari 8')?.url).toBe('https://sunnah.com/bukhari:8');
    expect(parseSource('Sahih Muslim 16')?.url).toBe('https://sunnah.com/muslim:16');
  });

  it('builds quran.com links from Quran references', () => {
    expect(parseSource('Corán 96:1-5')?.url).toBe('https://quran.com/96/1-5');
    expect(parseSource('Quran 2:282')?.url).toBe('https://quran.com/2/282');
  });

  it('builds surah-level quran.com links from chapter-only references', () => {
    expect(parseSource('Quran 111 (Surat al-Masad)')?.url).toBe('https://quran.com/111');
    expect(parseSource('Quran 27 (Surah An-Naml)')?.url).toBe('https://quran.com/27');
  });

  it('does not link Quran prose where a word sits before the number', () => {
    expect(parseSource('Ciencias coránicas — el Corán tiene 114 Surahs')?.url).toBeUndefined();
  });

  it('ignores out-of-range surah numbers', () => {
    expect(parseSource('Quran 200')?.url).toBeUndefined();
  });

  it('keeps unknown formats as plain labels', () => {
    const r = parseSource('Consenso de las obras de Seerah');
    expect(r?.label).toBe('Consenso de las obras de Seerah');
    expect(r?.url).toBeUndefined();
  });
});
