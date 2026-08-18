"use client";

import { Plus, Trash2 } from "lucide-react";

export function StringListEditor({
  label,
  hint,
  items,
  onChange,
}: {
  label: string;
  hint?: string;
  items: string[];
  onChange: (items: string[]) => void;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-ivoire-dim">
        {label}
      </label>
      {hint && <p className="mb-2 text-xs text-ivoire-dim">{hint}</p>}
      <div className="space-y-2">
        {items.map((item, i) => (
          <div key={i} className="flex gap-2">
            <input
              value={item}
              onChange={(e) => {
                const next = [...items];
                next[i] = e.target.value;
                onChange(next);
              }}
              className="flex-1 rounded-lg border border-ivoire/15 bg-noir px-3 py-2 text-sm text-ivoire outline-none focus:border-or"
            />
            <button
              type="button"
              onClick={() => onChange(items.filter((_, idx) => idx !== i))}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-ivoire/15 text-ivoire-dim hover:text-red-400"
            >
              <Trash2 size={14} />
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() => onChange([...items, ""])}
          className="inline-flex items-center gap-1.5 text-xs text-or hover:underline"
        >
          <Plus size={13} /> Ajouter
        </button>
      </div>
    </div>
  );
}

export interface StepItem {
  id: string;
  title: string;
  content: string;
}

export function StepsEditor({ steps, onChange }: { steps: StepItem[]; onChange: (steps: StepItem[]) => void }) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-ivoire-dim">
        Étapes de la mission
      </label>
      <div className="space-y-3">
        {steps.map((step, i) => (
          <div key={i} className="rounded-lg border border-ivoire/15 p-3">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs text-ivoire-dim">Étape {i + 1}</span>
              <button
                type="button"
                onClick={() => onChange(steps.filter((_, idx) => idx !== i))}
                className="text-ivoire-dim hover:text-red-400"
              >
                <Trash2 size={14} />
              </button>
            </div>
            <input
              value={step.title}
              placeholder="Titre de l'étape"
              onChange={(e) => {
                const next = [...steps];
                next[i] = { ...next[i], title: e.target.value };
                onChange(next);
              }}
              className="mb-2 w-full rounded-lg border border-ivoire/15 bg-noir px-3 py-2 text-sm text-ivoire outline-none focus:border-or"
            />
            <textarea
              value={step.content}
              placeholder="Contenu de l'étape"
              rows={2}
              onChange={(e) => {
                const next = [...steps];
                next[i] = { ...next[i], content: e.target.value };
                onChange(next);
              }}
              className="w-full rounded-lg border border-ivoire/15 bg-noir px-3 py-2 text-sm text-ivoire outline-none focus:border-or"
            />
          </div>
        ))}
        <button
          type="button"
          onClick={() =>
            onChange([...steps, { id: `s${steps.length + 1}`, title: "", content: "" }])
          }
          className="inline-flex items-center gap-1.5 text-xs text-or hover:underline"
        >
          <Plus size={13} /> Ajouter une étape
        </button>
      </div>
    </div>
  );
}
