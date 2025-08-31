"use client";

import { createContext, useContext, useEffect, useState } from "react";
import {
  type Theme,
  getStoredTheme,
  setStoredTheme,
  applyTheme,
  getResolvedTheme,
} from "@/lib/theme";

interface ThemeContextValue {
  theme: Theme;
  resolvedTheme: "light" | "dark";
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("system");
  const [resolvedTheme, setResolvedTheme] = useState<"light" | "dark">("light");
  const [mounted, setMounted] = useState(false);

  // 初期化処理
  useEffect(() => {
    const storedTheme = getStoredTheme();
    setThemeState(storedTheme);
    const resolved = getResolvedTheme(storedTheme);
    setResolvedTheme(resolved);
    applyTheme(storedTheme);
    setMounted(true);
  }, []);

  // システムテーマ変更の監視
  useEffect(() => {
    if (!mounted) return;

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => {
      if (theme === "system") {
        const resolved = getResolvedTheme("system");
        setResolvedTheme(resolved);
        applyTheme("system");
      }
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [theme, mounted]);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    setStoredTheme(newTheme);
    const resolved = getResolvedTheme(newTheme);
    setResolvedTheme(resolved);
    applyTheme(newTheme);
  };

  // SSRとCSRの不一致を防ぐため、マウント前もProviderを提供
  const contextValue = mounted 
    ? { theme, resolvedTheme, setTheme }
    : { theme: "system" as Theme, resolvedTheme: "light" as const, setTheme: () => {} };

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    // SSR中やマウント前はエラーを投げずにデフォルト値を返す
    return {
      theme: "system" as Theme,
      resolvedTheme: "light" as const,
      setTheme: () => {}
    };
  }
  return context;
}