import { I18n } from 'i18n-js';
import { getLocales } from 'expo-localization';
import es from '../locales/es.json';
import en from '../locales/en.json';
import ar from '../locales/ar.json';
import ma from '../locales/ma.json';
import { RTL_LANGUAGES, type Language } from './types';

export const i18n = new I18n({ es, en, ar, ma });
i18n.defaultLocale = 'en';
i18n.enableFallback = true;
// Darija is beta: fall back ma → ar → en for any missing key.
(i18n.locales as unknown as Record<string, string[]>).ma = ['ma', 'ar', 'en'];

/**
 * Map a device locale to the closest supported language (section 5.1).
 *   es* → es · ar-MA / ary → ma · ar* → ar · en* and everything else → en
 */
export function mapDeviceLocale(languageCode: string | null, regionCode?: string | null): Language {
  const lang = (languageCode ?? '').toLowerCase();
  const region = (regionCode ?? '').toUpperCase();
  if (lang === 'es') return 'es';
  if (lang === 'ary') return 'ma';
  if (lang === 'ar') return region === 'MA' ? 'ma' : 'ar';
  return 'en';
}

export function detectDeviceLanguage(): Language {
  const locale = getLocales()[0];
  return mapDeviceLocale(locale?.languageCode ?? null, locale?.regionCode ?? null);
}

export function isRTL(lang: Language): boolean {
  return RTL_LANGUAGES.includes(lang);
}

const EASTERN_DIGITS = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'] as const;

/** Eastern Arabic numerals for ar/ma contexts, Latin elsewhere. */
export function formatNumber(value: number, lang: Language): string {
  const latin = new Intl.NumberFormat(lang === 'ma' ? 'ar-MA' : lang).format(value);
  if (!isRTL(lang)) return latin;
  return String(value).replace(/\d/g, (d) => EASTERN_DIGITS[Number(d)] ?? d);
}

export function setLanguage(lang: Language): void {
  i18n.locale = lang;
}

export function t(key: string, options?: Record<string, unknown>): string {
  return i18n.t(key, options);
}
