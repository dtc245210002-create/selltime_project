"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export type ThemeMode = "dark" | "light";
export type LanguageMode = "vi" | "en";

interface ViewModeContextType {
  viewMode: "desktop" | "mobile";
  setViewMode: (mode: "desktop" | "mobile") => void;
  isMobile: boolean;
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
  toggleTheme: () => void;
  language: LanguageMode;
  setLanguage: (lang: LanguageMode) => void;
  toggleLanguage: () => void;
  t: (vi: string, en: string) => string;
}

export const ViewModeContext = createContext<ViewModeContextType>({
  viewMode: "desktop",
  setViewMode: () => {},
  isMobile: false,
  theme: "dark",
  setTheme: () => {},
  toggleTheme: () => {},
  language: "vi",
  setLanguage: () => {},
  toggleLanguage: () => {},
  t: (vi: string, _en: string) => vi,
});

export function ViewModeProvider({ children }: { children: React.ReactNode }) {
  const [viewMode, setViewMode] = useState<"desktop" | "mobile">("desktop");
  const [isSmallScreen, setIsSmallScreen] = useState(false);
  const [theme, setThemeState] = useState<ThemeMode>("dark");
  const [language, setLanguageState] = useState<LanguageMode>("vi");

  useEffect(() => {
    const handleResize = () => {
      setIsSmallScreen(window.innerWidth < 1024);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    try {
      // 1. Phục hồi Theme
      const savedTheme = localStorage.getItem("selltime_theme") as ThemeMode | null;
      if (savedTheme === "light" || savedTheme === "dark") {
        setThemeState(savedTheme);
        if (savedTheme === "light") {
          document.documentElement.classList.add("light");
        } else {
          document.documentElement.classList.remove("light");
        }
      }

      // 2. Phục hồi Ngôn ngữ
      const savedLang = localStorage.getItem("selltime_lang") as LanguageMode | null;
      if (savedLang === "vi" || savedLang === "en") {
        setLanguageState(savedLang);
        document.documentElement.setAttribute("lang", savedLang);
      }
    } catch {
      // ignore
    }
  }, []);

  const setTheme = (newTheme: ThemeMode) => {
    setThemeState(newTheme);
    try {
      localStorage.setItem("selltime_theme", newTheme);
    } catch {
      // ignore
    }
    if (newTheme === "light") {
      document.documentElement.classList.add("light");
    } else {
      document.documentElement.classList.remove("light");
    }
  };

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  const setLanguage = (newLang: LanguageMode) => {
    setLanguageState(newLang);
    try {
      localStorage.setItem("selltime_lang", newLang);
    } catch {
      // ignore
    }
    document.documentElement.setAttribute("lang", newLang);
  };

  const toggleLanguage = () => {
    setLanguage(language === "vi" ? "en" : "vi");
  };

  const t = (vi: string, en: string) => {
    return language === "en" ? en : vi;
  };

  const isMobile = viewMode === "mobile" || isSmallScreen;

  return (
    <ViewModeContext.Provider
      value={{
        viewMode,
        setViewMode,
        isMobile,
        theme,
        setTheme,
        toggleTheme,
        language,
        setLanguage,
        toggleLanguage,
        t,
      }}
    >
      {children}
    </ViewModeContext.Provider>
  );
}

export function useViewMode() {
  return useContext(ViewModeContext);
}
