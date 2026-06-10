import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { Colors, PaperVariants, type PaperTokens } from '../constants/colors';
import { titleFontFor } from '../constants/fonts';
import { DEFAULT_SETTINGS, getSettings, setSettings } from '../lib/storage';
import type { AppSettings, ThemePrefs } from '../lib/types';

export interface Theme {
  /** Effective paper tokens for the selected paper temperature. */
  paper: PaperTokens;
  /** Title font derived from the typographic voice. */
  titleFont: { fontFamily: string; fontStyle?: 'italic' | 'normal' };
  headerStyle: ThemePrefs['header'];
  colors: typeof Colors;
}

interface ThemeContextValue {
  theme: Theme;
  settings: AppSettings;
  updateSettings: (patch: Partial<AppSettings>) => Promise<void>;
  updateTheme: (patch: Partial<ThemePrefs>) => Promise<void>;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettingsState] = useState<AppSettings>(DEFAULT_SETTINGS);

  useEffect(() => {
    let cancelled = false;
    void getSettings().then((s) => {
      if (!cancelled) setSettingsState(s);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const updateSettings = useCallback(
    async (patch: Partial<AppSettings>) => {
      setSettingsState((prev) => {
        const next = { ...prev, ...patch };
        void setSettings(next);
        return next;
      });
    },
    [],
  );

  const updateTheme = useCallback(
    async (patch: Partial<ThemePrefs>) => {
      setSettingsState((prev) => {
        const next = { ...prev, theme: { ...prev.theme, ...patch } };
        void setSettings(next);
        return next;
      });
    },
    [],
  );

  const value = useMemo<ThemeContextValue>(() => {
    const { theme: prefs } = settings;
    return {
      theme: {
        paper: PaperVariants[prefs.paper],
        titleFont: titleFontFor(prefs.voice),
        headerStyle: prefs.header,
        colors: Colors,
      },
      settings,
      updateSettings,
      updateTheme,
    };
  }, [settings, updateSettings, updateTheme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}
