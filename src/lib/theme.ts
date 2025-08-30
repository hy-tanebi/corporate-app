"use client";

export type Theme = "light" | "dark" | "system";

export const getSystemTheme = (): "light" | "dark" => {
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
};

export const getStoredTheme = (): Theme => {
  if (typeof window === "undefined") return "system";
  try {
    const stored = localStorage.getItem("theme") as Theme;
    if (stored && ["light", "dark", "system"].includes(stored)) {
      return stored;
    }
  } catch (e) {
    console.warn("Failed to read theme from localStorage:", e);
  }
  return "system";
};

export const setStoredTheme = (theme: Theme): void => {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem("theme", theme);
  } catch (e) {
    console.warn("Failed to save theme to localStorage:", e);
  }
};

export const getResolvedTheme = (theme: Theme): "light" | "dark" => {
  if (theme === "system") {
    return getSystemTheme();
  }
  return theme;
};

export const applyTheme = (theme: Theme): void => {
  if (typeof document === "undefined") return;
  
  const resolvedTheme = getResolvedTheme(theme);
  const root = document.documentElement;
  
  root.classList.remove("light", "dark");
  root.classList.add(resolvedTheme);
  
  // メタテーマカラーの更新
  updateMetaThemeColor(resolvedTheme);
};

const updateMetaThemeColor = (theme: "light" | "dark"): void => {
  if (typeof document === "undefined") return;
  
  const metaThemeColor = document.querySelector('meta[name="theme-color"]');
  if (metaThemeColor) {
    metaThemeColor.setAttribute(
      "content",
      theme === "dark" ? "#0a0a0a" : "#ffffff"
    );
  }
};