import { useEffect, useState } from "react";

export type ThemeMode = "light" | "dark" | "system";

const THEME_STORAGE_KEY = "sulyap-theme-mode";
const THEME_EVENT = "sulyap:theme-changed";

function getSystemTheme(): "light" | "dark" {
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function getStoredTheme(): ThemeMode {
  if (typeof window === "undefined") return "light";
  try {
    const saved = window.localStorage.getItem(THEME_STORAGE_KEY) as ThemeMode | null;
    if (saved === "light" || saved === "dark" || saved === "system") return saved;
    return "light";
  } catch {
    return "light";
  }
}

export function applyTheme(mode: ThemeMode): void {
  if (typeof document === "undefined") return;
  const isDark = mode === "dark" || (mode === "system" && getSystemTheme() === "dark");
  const root = document.documentElement;
  if (isDark) {
    root.classList.add("dark");
  } else {
    root.classList.remove("dark");
  }
}

export function useTheme(): {
  theme: ThemeMode;
  isDark: boolean;
  setTheme: (mode: ThemeMode) => void;
  toggleTheme: () => void;
} {
  const [theme, setThemeState] = useState<ThemeMode>("light");
  const [resolvedDark, setResolvedDark] = useState<boolean>(false);

  useEffect(() => {
    const current = getStoredTheme();
    setThemeState(current);
    const isDark = current === "dark" || (current === "system" && getSystemTheme() === "dark");
    setResolvedDark(isDark);
    applyTheme(current);

    const onStorage = (e: StorageEvent) => {
      if (e.key === THEME_STORAGE_KEY) {
        const next = getStoredTheme();
        setThemeState(next);
        const dark = next === "dark" || (next === "system" && getSystemTheme() === "dark");
        setResolvedDark(dark);
        applyTheme(next);
      }
    };

    const onCustom = (e: Event) => {
      const detail = (e as CustomEvent<ThemeMode>).detail;
      if (detail) {
        setThemeState(detail);
        const dark = detail === "dark" || (detail === "system" && getSystemTheme() === "dark");
        setResolvedDark(dark);
        applyTheme(detail);
      }
    };

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const onSystemChange = () => {
      if (getStoredTheme() === "system") {
        const dark = getSystemTheme() === "dark";
        setResolvedDark(dark);
        applyTheme("system");
      }
    };

    window.addEventListener("storage", onStorage);
    window.addEventListener(THEME_EVENT, onCustom);
    mediaQuery.addEventListener("change", onSystemChange);

    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener(THEME_EVENT, onCustom);
      mediaQuery.removeEventListener("change", onSystemChange);
    };
  }, []);

  const setTheme = (mode: ThemeMode) => {
    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, mode);
    } catch {
      // Ignore
    }
    setThemeState(mode);
    const isDark = mode === "dark" || (mode === "system" && getSystemTheme() === "dark");
    setResolvedDark(isDark);
    applyTheme(mode);
    window.dispatchEvent(new CustomEvent(THEME_EVENT, { detail: mode }));
  };

  const toggleTheme = () => {
    const next: ThemeMode = resolvedDark ? "light" : "dark";
    setTheme(next);
  };

  return {
    theme,
    isDark: resolvedDark,
    setTheme,
    toggleTheme,
  };
}
