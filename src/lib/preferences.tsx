import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { messages, type Locale } from "../i18n/messages.ts";

export type Theme = "light" | "dark";

type Preferences = {
  theme: Theme;
  locale: Locale;
  dir: "rtl" | "ltr";
  t: (key: string) => string;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  setLocale: (locale: Locale) => void;
  toggleLocale: () => void;
};

const PreferencesContext = createContext<Preferences | null>(null);

const THEME_KEY = "tariq-theme";
const LOCALE_KEY = "tariq-locale";

function readTheme(): Theme {
  const saved = localStorage.getItem(THEME_KEY);
  if (saved === "light" || saved === "dark") return saved;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function readLocale(): Locale {
  const saved = localStorage.getItem(LOCALE_KEY);
  return saved === "en" ? "en" : "ar";
}

export function PreferencesProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(() => (typeof window === "undefined" ? "light" : readTheme()));
  const [locale, setLocaleState] = useState<Locale>(() => (typeof window === "undefined" ? "ar" : readLocale()));

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("dark", theme === "dark");
    root.dataset.theme = theme;
    root.style.colorScheme = theme;
    localStorage.setItem(THEME_KEY, theme);
  }, [theme]);

  useEffect(() => {
    const root = document.documentElement;
    const dir = locale === "ar" ? "rtl" : "ltr";
    root.lang = locale;
    root.dir = dir;
    localStorage.setItem(LOCALE_KEY, locale);
  }, [locale]);

  const value = useMemo<Preferences>(() => {
    const dict = messages[locale];
    return {
      theme,
      locale,
      dir: locale === "ar" ? "rtl" : "ltr",
      t: (key) => dict[key] ?? key,
      setTheme: setThemeState,
      toggleTheme: () => setThemeState((current) => (current === "dark" ? "light" : "dark")),
      setLocale: setLocaleState,
      toggleLocale: () => setLocaleState((current) => (current === "ar" ? "en" : "ar")),
    };
  }, [theme, locale]);

  return <PreferencesContext.Provider value={value}>{children}</PreferencesContext.Provider>;
}

export function usePreferences() {
  const ctx = useContext(PreferencesContext);
  if (!ctx) throw new Error("usePreferences must be used within PreferencesProvider");
  return ctx;
}
