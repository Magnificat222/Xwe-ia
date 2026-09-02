"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { WizardConfig } from "@/lib/wizards/types";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Download, CheckCircle2 } from "lucide-react";

interface Props {
  projectId: string;
  wizard: WizardConfig;
  initialAnswers: Record<string, Record<string, string>>;
  initialStep: number;
  isComplete: boolean;
}

export function ProjectWizard({ projectId, wizard, initialAnswers, initialStep, isComplete }: Props) {
  const router = useRouter();
  const totalSteps = wizard.steps.length;
  const [step, setStep] = useState(Math.min(initialStep, totalSteps));
  const [answers, setAnswers] = useState(initialAnswers);
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(isComplete);

  const currentStepConfig = wizard.steps[step];
  const currentValues = (currentStepConfig && answers[currentStepConfig.key]) || {};

  const setFieldValue = (fieldKey: string, value: string) => {
    if (!currentStepConfig) return;
    setAnswers((prev) => ({
      ...prev,
      [currentStepConfig.key]: { ...prev[currentStepConfig.key], [fieldKey]: value },
    }));
  };

  const saveStep = async (nextStep: number, markComplete = false) => {
    setSaving(true);
    await fetch(`/api/projects/${projectId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        stepKey: currentStepConfig?.key,
        values: currentValues,
        currentStep: nextStep,
        markComplete,
      }),
    });
    setSaving(false);
  };

  const goNext = async () => {
    if (step < totalSteps - 1) {
      await saveStep(step + 1);
      setStep(step + 1);
    } else {
      await saveStep(totalSteps, true);
      setStep(totalSteps);
      setDone(true);
    }
  };

  const goBack = () => {
    if (step > 0) setStep(step - 1);
  };

  // Final "deliverable" screen
  if (step >= totalSteps || done) {
    return (
      <div className="rounded-xl border border-or/20 bg-or/5 p-8 text-center">
        <CheckCircle2 size={28} className="mx-auto mb-3 text-or" />
        <h2 className="font-display text-xl text-ivoire">Votre {wizard.title.toLowerCase()} est prêt</h2>
        <p className="mt-2 text-sm text-ivoire-dim">
          Téléchargez le document — vous pouvez revenir modifier vos réponses à tout moment.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <a href={`/api/projects/${projectId}/document`}>
            <Button>
              <Download size={15} /> Télécharger le document
            </Button>
          </a>
          <Button variant="secondary" onClick={() => setStep(0)}>
            Revoir mes réponses
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex items-center gap-2">
        {wizard.steps.map((s, i) => (
          <div
            key={s.key}
            className={`h-1.5 flex-1 rounded-full ${i <= step ? "bg-or" : "bg-ivoire/10"}`}
          />
        ))}
      </div>

      <p className="mb-1 text-xs text-ivoire-dim">
        Étape {step + 1} / {totalSteps}
      </p>
      <h2 className="font-display text-2xl text-ivoire">{currentStepConfig.title}</h2>
      <p className="mt-1 mb-6 text-sm text-ivoire-dim">{currentStepConfig.description}</p>

      <div className="space-y-5">
        {currentStepConfig.fields.map((field) => (
          <div key={field.key}>
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-ivoire-dim">
              {field.label}
            </label>
            <textarea
              rows={3}
              value={currentValues[field.key] ?? ""}
              placeholder={field.placeholder}
              onChange={(e) => setFieldValue(field.key, e.target.value)}
              className="w-full rounded-lg border border-ivoire/15 bg-noir px-3.5 py-2.5 text-sm text-ivoire outline-none focus:border-or"
            />
          </div>
        ))}
      </div>

      <div className="mt-8 flex justify-between">
        <Button variant="secondary" onClick={goBack} disabled={step === 0 || saving}>
          <ArrowLeft size={15} /> Précédent
        </Button>
        <Button onClick={goNext} disabled={saving}>
          {saving ? "Enregistrement..." : step === totalSteps - 1 ? "Terminer" : "Suivant"}
          {step < totalSteps - 1 && <ArrowRight size={15} />}
        </Button>
      </div>
    </div>
  );
}
