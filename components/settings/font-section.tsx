"use client";

import { useFontPref, type FontPreference } from "@/components/shared/font-pref-provider";

const OPTIONS: { value: FontPreference; label: string; description: string; sample: string }[] = [
  { value: "inter", label: "Épurée", description: "Inter — la police par défaut, nette et moderne.", sample: "font-sans" },
  { value: "atkinson", label: "Accessible", description: "Atkinson Hyperlegible — conçue pour une lecture facile.", sample: "" },
  { value: "lora", label: "Chaleureuse", description: "Lora — une lecture plus littéraire, à l'esprit éditorial.", sample: "" },
];

export function FontSection() {
  const { font, setFont } = useFontPref();

  return (
    <div className="grid gap-3 sm:grid-cols-3">
      {OPTIONS.map((opt) => {
        const active = font === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => setFont(opt.value)}
            className={`rounded-lg border p-4 text-left transition-colors ${
              active ? "border-or bg-or/10" : "border-ivoire/15 hover:border-ivoire/30"
            }`}
          >
            <p className={`mb-1 text-base ${active ? "text-ivoire" : "text-ivoire-dim"}`}>{opt.label}</p>
            <p className="text-xs text-ivoire-dim">{opt.description}</p>
          </button>
        );
      })}
    </div>
  );
}
