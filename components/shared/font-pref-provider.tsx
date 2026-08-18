"use client";

import { createContext, useContext, useEffect, useState } from "react";

export type FontPreference = "inter" | "atkinson" | "lora";

const STORAGE_KEY = "xwe-ia-font-pref";
const CLASS_BY_FONT: Record<FontPreference, string | null> = {
  inter: null,
  atkinson: "font-pref-atkinson",
  lora: "font-pref-lora",
};

const FontPrefContext = createContext<{
  font: FontPreference;
  setFont: (f: FontPreference) => void;
}>({ font: "inter", setFont: () => {} });

export function FontPrefProvider({ children }: { children: React.ReactNode }) {
  const [font, setFontState] = useState<FontPreference>("inter");

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as FontPreference | null;
    if (stored && stored in CLASS_BY_FONT) applyFont(stored);
  }, []);

  const applyFont = (f: FontPreference) => {
    const html = document.documentElement;
    Object.values(CLASS_BY_FONT).forEach((cls) => cls && html.classList.remove(cls));
    const cls = CLASS_BY_FONT[f];
    if (cls) html.classList.add(cls);
    setFontState(f);
  };

  const setFont = (f: FontPreference) => {
    localStorage.setItem(STORAGE_KEY, f);
    applyFont(f);
  };

  return <FontPrefContext.Provider value={{ font, setFont }}>{children}</FontPrefContext.Provider>;
}

export function useFontPref() {
  return useContext(FontPrefContext);
}
