"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

interface ViewModeContextType {
  viewMode: "desktop" | "mobile";
  setViewMode: (mode: "desktop" | "mobile") => void;
  isMobile: boolean;
}

export const ViewModeContext = createContext<ViewModeContextType>({
  viewMode: "desktop",
  setViewMode: () => {},
  isMobile: false,
});

export function ViewModeProvider({ children }: { children: React.ReactNode }) {
  const [viewMode, setViewMode] = useState<"desktop" | "mobile">("desktop");
  const [isSmallScreen, setIsSmallScreen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsSmallScreen(window.innerWidth < 1024);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const isMobile = viewMode === "mobile" || isSmallScreen;

  return (
    <ViewModeContext.Provider value={{ viewMode, setViewMode, isMobile }}>
      {children}
    </ViewModeContext.Provider>
  );
}

export function useViewMode() {
  return useContext(ViewModeContext);
}
