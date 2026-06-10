import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { I18nManager } from 'react-native';
import { detectDeviceLanguage, formatNumber, isRTL, setLanguage as setI18nLanguage, t } from '../lib/i18n';
import { getStoredLanguage, setStoredLanguage } from '../lib/storage';
import type { Language } from '../lib/types';

interface LanguageContextValue {
  language: Language;
  /** false until the stored/auto-detected language has been resolved. */
  ready: boolean;
  /** true on the very first launch (no stored language) — show the cover/selector. */
  firstLaunch: boolean;
  rtl: boolean;
  setLanguage: (lang: Language) => Promise<void>;
  t: typeof t;
  n: (value: number) => string;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>('en');
  const [ready, setReady] = useState(false);
  const [firstLaunch, setFirstLaunch] = useState(true);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const stored = await getStoredLanguage();
      const lang = stored ?? detectDeviceLanguage();
      if (cancelled) return;
      setI18nLanguage(lang);
      setLanguageState(lang);
      setFirstLaunch(stored == null);
      setReady(true);
      // Persist the auto-detected language so later launches skip detection.
      if (stored == null) await setStoredLanguage(lang);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Mirror layout for RTL languages. A restart is required for a full flip;
  // allowRTL keeps text alignment correct immediately.
  useEffect(() => {
    if (!ready) return;
    const rtl = isRTL(language);
    I18nManager.allowRTL(rtl);
    if (I18nManager.isRTL !== rtl) I18nManager.forceRTL(rtl);
  }, [language, ready]);

  const setLanguage = useCallback(async (lang: Language) => {
    setI18nLanguage(lang);
    setLanguageState(lang);
    setFirstLaunch(false);
    await setStoredLanguage(lang);
  }, []);

  const value = useMemo<LanguageContextValue>(
    () => ({
      language,
      ready,
      firstLaunch,
      rtl: isRTL(language),
      setLanguage,
      t,
      n: (v: number) => formatNumber(v, language),
    }),
    [language, ready, firstLaunch, setLanguage],
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage(): LanguageContextValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider');
  return ctx;
}
