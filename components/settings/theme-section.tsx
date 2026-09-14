"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";

export function ThemeSection() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) return <div className="h-16" />;

  const options = [
    { value: "dark", label: "Sombre", icon: Moon },
    { value: "light", label: "Clair", icon: Sun },
  ];

  return (
    <div className="flex gap-3">
      {options.map((opt) => {
        const active = theme === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => setTheme(opt.value)}
            className={`flex flex-1 flex-col items-center gap-2 rounded-lg border px-4 py-4 text-sm transition-colors ${
              active ? "border-or bg-or/10 text-ivoire" : "border-ivoire/15 text-ivoire-dim hover:border-ivoire/30"
            }`}
          >
            <opt.icon size={18} />
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
