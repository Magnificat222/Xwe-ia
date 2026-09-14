"use client";

import { useId } from "react";
import { Check } from "lucide-react";
import type { MissionField } from "@/db/schema";
import { Input, Textarea, Field } from "@/components/ui/field";
import { cn } from "@/lib/utils";

/**
 * Rendu d'un champ de mission. C'est ce composant qui rend la mission
 * *productive* : chaque type de champ produit une réponse exploitable.
 */
export function MissionFieldRenderer({
  field,
  value,
  onChange,
  error,
}: {
  field: MissionField;
  value: unknown;
  onChange: (value: unknown) => void;
  error?: string;
}) {
  const id = useId();

  switch (field.type) {
    case "short_text":
      return (
        <Input
          id={id}
          label={field.label}
          hint={field.help}
          error={error}
          required={field.required}
          placeholder={field.placeholder}
          value={typeof value === "string" ? value : ""}
          onChange={(e) => onChange(e.target.value)}
        />
      );

    case "long_text":
      return (
        <Textarea
          id={id}
          label={field.label}
          hint={field.help}
          error={error}
          required={field.required}
          placeholder={field.placeholder}
          rows={6}
          value={typeof value === "string" ? value : ""}
          onChange={(e) => onChange(e.target.value)}
        />
      );

    case "number":
      return (
        <Input
          id={id}
          type="number"
          inputMode="numeric"
          label={field.label}
          hint={field.help}
          error={error}
          required={field.required}
          placeholder={field.placeholder}
          min={field.min}
          max={field.max}
          value={typeof value === "number" || typeof value === "string" ? String(value) : ""}
          onChange={(e) => onChange(e.target.value === "" ? "" : Number(e.target.value))}
        />
      );

    case "date":
      return (
        <Input
          id={id}
          type="date"
          label={field.label}
          hint={field.help}
          error={error}
          required={field.required}
          value={typeof value === "string" ? value : ""}
          onChange={(e) => onChange(e.target.value)}
        />
      );

    case "single_choice":
      return (
        <Field label={field.label} hint={field.help} error={error} required={field.required}>
          <div role="radiogroup" aria-label={field.label} className="grid gap-2 sm:grid-cols-2">
            {(field.options ?? []).map((option) => {
              const selected = value === option;
              return (
                <button
                  key={option}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  onClick={() => onChange(option)}
                  className={cn(
                    "flex min-h-11 items-center gap-2.5 rounded-xl border px-3.5 py-2.5 text-left text-sm transition-all duration-200",
                    selected
                      ? "border-or/60 bg-or/8 text-ivoire"
                      : "border-ivoire/12 bg-noir-elevated text-ivoire-dim hover:border-or/30 hover:text-ivoire",
                  )}
                >
                  <span
                    className={cn(
                      "flex h-4 w-4 shrink-0 items-center justify-center rounded-full border",
                      selected ? "border-or bg-or" : "border-ivoire/25",
                    )}
                  >
                    {selected && <span className="h-1.5 w-1.5 rounded-full bg-noir" />}
                  </span>
                  {option}
                </button>
              );
            })}
          </div>
        </Field>
      );

    case "multi_choice": {
      const selectedValues = Array.isArray(value) ? (value as string[]) : [];
      return (
        <Field label={field.label} hint={field.help} error={error} required={field.required}>
          <div role="group" aria-label={field.label} className="flex flex-wrap gap-2">
            {(field.options ?? []).map((option) => {
              const selected = selectedValues.includes(option);
              return (
                <button
                  key={option}
                  type="button"
                  aria-pressed={selected}
                  onClick={() =>
                    onChange(
                      selected
                        ? selectedValues.filter((v) => v !== option)
                        : [...selectedValues, option],
                    )
                  }
                  className={cn(
                    "inline-flex min-h-11 items-center gap-2 rounded-full border px-4 py-2 text-sm transition-all duration-200",
                    selected
                      ? "border-or bg-or/12 text-or-vif"
                      : "border-ivoire/12 bg-noir-elevated text-ivoire-dim hover:border-or/30 hover:text-ivoire",
                  )}
                >
                  {selected && <Check size={13} />}
                  {option}
                </button>
              );
            })}
          </div>
        </Field>
      );
    }

    case "file":
      return (
        <Field label={field.label} hint={field.help ?? "Indique le lien vers ton fichier."} error={error}>
          <Input
            id={id}
            type="url"
            placeholder="https://…"
            value={typeof value === "string" ? value : ""}
            onChange={(e) => onChange(e.target.value)}
          />
        </Field>
      );

    default:
      return null;
  }
}
