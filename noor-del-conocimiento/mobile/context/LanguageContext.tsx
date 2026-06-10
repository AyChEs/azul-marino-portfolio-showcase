import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { I18nManager } from "react-native";
import { getLocales } from "expo-localization";
import i18n from "../lib/i18n";
import { getStoredLanguage, setStoredLanguage } from "../lib/storage";
import type { Language } from "../lib/types";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => Promise<void>;
  isRTL: boolean;
  isReady: boolean;
  isFirstTime: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

function detectDeviceLanguage(): Language {
  const locales = getLocales();
  const code = locales[0]?.languageCode ?? "";
  if (code === "es" || code.startsWith("es")) return "es";
  if (code === "ar" || code.startsWith("ar")) return "ar";
  if (code === "en" || code.startsWith("en")) return "en";
  return "es";
}

export const LanguageProvider = ({ children }: { children: React.ReactNode }) => {
  const [language, setLang] = useState<Language>("es");
  const [isReady, setIsReady] = useState(false);
  const [isFirstTime, setIsFirstTime] = useState(false);

  useEffect(() => {
    getStoredLanguage().then((stored) => {
      if (stored) {
        setLang(stored);
        i18n.changeLanguage(stored);
        I18nManager.forceRTL(stored === "ar");
        setIsFirstTime(false);
      } else {
        // No stored preference — detect from device locale
        const detected = detectDeviceLanguage();
        setLang(detected);
        i18n.changeLanguage(detected);
        I18nManager.forceRTL(detected === "ar");
        setIsFirstTime(true);
        // Don't save yet — wait for explicit user confirmation in index.tsx
      }
      setIsReady(true);
    });
  }, []);

  const setLanguage = useCallback(async (lang: Language) => {
    await setStoredLanguage(lang);
    await i18n.changeLanguage(lang);
    I18nManager.forceRTL(lang === "ar");
    setLang(lang);
    setIsFirstTime(false);
  }, []);

  return (
    <LanguageContext.Provider
      value={{ language, setLanguage, isRTL: language === "ar", isReady, isFirstTime }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used inside LanguageProvider");
  return ctx;
};
