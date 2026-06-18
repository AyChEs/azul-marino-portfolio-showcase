// Global app preferences (sound / haptics / reduced motion). Loaded once at
// startup and persisted on every change. lib/feedback reads these synchronously
// via a snapshot so hot paths (answer taps) don't await storage.
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { getPrefs, setPrefs, DEFAULT_PREFS } from "../lib/storage";
import { setFeedbackPrefs } from "../lib/feedback";
import type { AppPrefs } from "../lib/types";

interface SettingsContextType {
  prefs: AppPrefs;
  setPref: <K extends keyof AppPrefs>(key: K, value: AppPrefs[K]) => void;
  isReady: boolean;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider = ({ children }: { children: React.ReactNode }) => {
  const [prefs, setLocalPrefs] = useState<AppPrefs>(DEFAULT_PREFS);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    getPrefs().then((p) => {
      setLocalPrefs(p);
      setFeedbackPrefs(p); // keep the synchronous feedback snapshot in sync
      setIsReady(true);
    });
  }, []);

  const setPref = useCallback(
    <K extends keyof AppPrefs>(key: K, value: AppPrefs[K]) => {
      setLocalPrefs((prev) => {
        const next = { ...prev, [key]: value };
        setPrefs(next);
        setFeedbackPrefs(next);
        return next;
      });
    },
    []
  );

  return (
    <SettingsContext.Provider value={{ prefs, setPref, isReady }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = (): SettingsContextType => {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error("useSettings must be used inside SettingsProvider");
  return ctx;
};
