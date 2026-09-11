"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Moon, Sun, Monitor } from "lucide-react";
import { Card, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/misc";
import { cn } from "@/lib/utils";

const OPTIONS = [
  { value: "dark", label: "Sombre", icon: Moon },
  { value: "light", label: "Clair", icon: Sun },
  { value: "system", label: "Système", icon: Monitor },
];

export function ThemePreference() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Le thème n'est connu qu'après hydratation : on évite tout décalage visuel.
  useEffect(() => setMounted(true), []);

  return (
    <Card>
      <CardTitle className="text-base">Apparence</CardTitle>
      <CardDescription>Xwé IA est pensé pour le sombre, mais le clair est disponible.</CardDescription>

      <div className="mt-4 grid grid-cols-3 gap-2">
        {mounted
          ? OPTIONS.map((option) => {
              const active = theme === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setTheme(option.value)}
                  aria-pressed={active}
                  className={cn(
                    "flex min-h-20 flex-col items-center justify-center gap-2 rounded-xl border text-xs transition-all duration-200",
                    active
                      ? "border-or/60 bg-or/8 text-or"
                      : "border-ivoire/12 bg-noir-elevated text-ivoire-dim hover:border-or/30 hover:text-ivoire",
                  )}
                >
                  <option.icon size={19} strokeWidth={1.6} />
                  {option.label}
                </button>
              );
            })
          : OPTIONS.map((option) => <Skeleton key={option.value} className="h-20 rounded-xl" />)}
      </div>
    </Card>
  );
}
