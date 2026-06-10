import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import es from "../locales/es.json";
import en from "../locales/en.json";
import ar from "../locales/ar.json";

i18n.use(initReactI18next).init({
  compatibilityJSON: "v4",
  lng: "es",
  fallbackLng: "es",
  resources: {
    es: { translation: es },
    en: { translation: en },
    ar: { translation: ar },
  },
  interpolation: {
    escapeValue: false,
  },
  returnNull: false,
});

export default i18n;
