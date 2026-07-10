"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

export const EASY_MODE_STORAGE_KEY = "rentchill_easy_mode";

type EasyModeContextValue = {
  easyMode: boolean;
  setEasyMode: (on: boolean) => void;
};

const EasyModeContext = createContext<EasyModeContextValue | null>(null);

function applyEasyModeAttr(on: boolean) {
  document.documentElement.setAttribute(
    "data-easy-mode",
    on ? "on" : "off",
  );
}

export function EasyModeProvider({ children }: { children: React.ReactNode }) {
  const [easyMode, setEasyModeState] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(EASY_MODE_STORAGE_KEY);
    const on = saved === "1" || saved === "true";
    setEasyModeState(on);
    applyEasyModeAttr(on);
  }, []);

  const setEasyMode = useCallback((on: boolean) => {
    setEasyModeState(on);
    localStorage.setItem(EASY_MODE_STORAGE_KEY, on ? "1" : "0");
    applyEasyModeAttr(on);
  }, []);

  const value = useMemo(
    () => ({ easyMode, setEasyMode }),
    [easyMode, setEasyMode],
  );

  return (
    <EasyModeContext.Provider value={value}>{children}</EasyModeContext.Provider>
  );
}

export function useEasyMode() {
  const context = useContext(EasyModeContext);
  if (!context) {
    throw new Error("useEasyMode must be used within EasyModeProvider");
  }
  return context;
}
