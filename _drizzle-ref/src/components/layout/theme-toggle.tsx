"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const reduce = useReducedMotion();

  useEffect(() => setMounted(true), []);

  if (!mounted) return <div className="h-10 w-10" aria-hidden />;

  const isLight = theme === "light";

  return (
    <button
      type="button"
      onClick={() => setTheme(isLight ? "dark" : "light")}
      aria-label={isLight ? "Passer au thème sombre" : "Passer au thème clair"}
      className="flex h-10 w-10 items-center justify-center rounded-xl border border-ivoire/15 text-ivoire-dim transition-colors hover:border-or/40 hover:text-or"
    >
      <motion.span
        key={isLight ? "moon" : "sun"}
        initial={reduce ? false : { rotate: -90, opacity: 0, scale: 0.7 }}
        animate={{ rotate: 0, opacity: 1, scale: 1 }}
        transition={{ duration: 0.28 }}
        className="flex"
      >
        {isLight ? <Moon size={17} /> : <Sun size={17} />}
      </motion.span>
    </button>
  );
}
