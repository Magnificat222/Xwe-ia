"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import type { DashboardPrefs } from "@/lib/dashboard-prefs";

const OPTIONS: { key: keyof DashboardPrefs; label: string; description: string }[] = [
  { key: "showStats", label: "Statistiques rapides", description: "Missions terminées, points de quiz, badges." },
  { key: "showCategoryChart", label: "Répartition par catégorie", description: "Le graphique en anneau de votre progression." },
  { key: "showActivity", label: "Activité récente", description: "Les dernières missions consultées." },
  { key: "showRecommended", label: "Recommandé pour vous", description: "Une sélection de missions à découvrir." },
];

export function DashboardLayoutForm({ initialPrefs }: { initialPrefs: DashboardPrefs }) {
  const [prefs, setPrefs] = useState(initialPrefs);
  const [status, setStatus] = useState<"idle" | "saving" | "saved">("idle");

  const toggle = (key: keyof DashboardPrefs) => {
    setPrefs((p) => ({ ...p, [key]: !p[key] }));
  };

  const save = async () => {
    setStatus("saving");
    await fetch("/api/account/dashboard-prefs", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(prefs),
    });
    setStatus("saved");
    setTimeout(() => setStatus("idle"), 2000);
  };

  return (
    <div className="space-y-3">
      {OPTIONS.map((opt) => (
        <label
          key={opt.key}
          className="flex cursor-pointer items-start gap-3 rounded-lg border border-ivoire/10 p-3.5 hover:border-ivoire/25"
        >
          <input
            type="checkbox"
            checked={prefs[opt.key]}
            onChange={() => toggle(opt.key)}
            className="mt-0.5 h-4 w-4 accent-braise"
          />
          <div>
            <p className="text-sm text-ivoire">{opt.label}</p>
            <p className="text-xs text-ivoire-dim">{opt.description}</p>
          </div>
        </label>
      ))}
      <Button size="sm" onClick={save} disabled={status === "saving"}>
        {status === "saving" ? "Enregistrement..." : status === "saved" ? "Enregistré" : "Enregistrer la disposition"}
      </Button>
    </div>
  );
}
