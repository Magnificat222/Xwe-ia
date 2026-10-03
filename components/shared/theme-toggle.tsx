"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Avoid a hydration mismatch: the real theme is only known client-side.
  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return <div className="h-9 w-9" aria-hidden />;
  }

  const isLight = theme === "light";

  return (
    <button
      type="button"
      onClick={() => setTheme(isLight ? "dark" : "light")}
      aria-label={isLight ? "Passer au thème sombre" : "Passer au thème clair"}
      className="flex h-9 w-9 items-center justify-center rounded-full border border-ivoire/15 text-ivoire-dim transition-colors hover:border-or/40 hover:text-or"
    >
      {isLight ? <Moon size={16} /> : <Sun size={16} />}
    </button>
  );
}
