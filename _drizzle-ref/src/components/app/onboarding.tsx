"use client";

import { useActionState, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Target,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/field";
import { Progress } from "@/components/ui/progress";
import { completeOnboardingAction, skipOnboardingAction } from "@/lib/actions/app";
import type { ActionState } from "@/lib/actions/auth";
import { cn } from "@/lib/utils";
import { resolveIcon } from "@/lib/icons";

const DOMAINS = [
  "Entrepreneuriat",
  "Commerce",
  "Études",
  "Marketing / communication",
  "Technologie",
  "Artisanat / création",
  "Santé",
  "Agriculture",
  "Fonction publique",
  "Autre",
];

const INTERESTS = [
  "Business",
  "Marketing",
  "Réseaux sociaux",
  "Intelligence artificielle",
  "Rédaction",
  "Design",
  "Productivité",
  "Finances",
  "Études",
  "Carrière",
];

const LEVELS = [
  { value: "debutant", label: "Débutant", detail: "Je découvre, j'ai besoin qu'on m'explique." },
  { value: "intermediaire", label: "Intermédiaire", detail: "Je connais les bases, je veux structurer." },
  { value: "avance", label: "Avancé", detail: "Je maîtrise, je veux aller vite." },
];

interface GoalOption {
  id: string;
  slug: string;
  title: string;
  tagline: string;
  icon: string;
}

const STEPS = ["Ton nom", "Ton domaine", "Ton niveau", "Tes objectifs", "Tes intérêts"];

export function OnboardingFlow({
  goals,
  defaultName,
  suite,
}: {
  goals: GoalOption[];
  defaultName: string;
  /** Page que la personne voulait atteindre avant d'être invitée à s'inscrire. */
  suite?: string;
}) {
  const [state, action, pending] = useActionState<ActionState, FormData>(
    completeOnboardingAction,
    {},
  );
  const [step, setStep] = useState(0);
  const [name, setName] = useState(defaultName);
  const [domain, setDomain] = useState("");
  const [level, setLevel] = useState("debutant");
  const [goalIds, setGoalIds] = useState<string[]>([]);
  const [interests, setInterests] = useState<string[]>([]);
  const reduce = useReducedMotion();

  const canContinue = [name.trim().length >= 2, true, true, goalIds.length > 0, true][step];
  const isLast = step === STEPS.length - 1;

  const toggle = (list: string[], setList: (v: string[]) => void, value: string, max = 99) => {
    if (list.includes(value)) setList(list.filter((v) => v !== value));
    else if (list.length < max) setList([...list, value]);
  };

  return (
    <div className="w-full max-w-2xl">
      <div className="mb-8">
        <div className="mb-2 flex items-center justify-between text-xs">
          <span className="font-mono uppercase tracking-[0.18em] text-or">
            Étape {step + 1} / {STEPS.length}
          </span>
          <button
            type="button"
            onClick={() => skipOnboardingAction(suite)}
            className="text-ivoire-dim transition-colors hover:text-ivoire"
          >
            Passer cette étape
          </button>
        </div>
        <Progress value={((step + 1) / STEPS.length) * 100} />
      </div>

      <form action={action}>
        {suite && <input type="hidden" name="suite" value={suite} />}
        {/* Toutes les réponses voyagent avec le formulaire, quelle que soit l'étape affichée. */}
        <input type="hidden" name="displayName" value={name} />
        <input type="hidden" name="domain" value={domain} />
        <input type="hidden" name="level" value={level} />
        {goalIds.map((id) => (
          <input key={id} type="hidden" name="goalIds" value={id} />
        ))}
        {interests.map((i) => (
          <input key={i} type="hidden" name="interests" value={i} />
        ))}

        <AnimatePresence mode="wait" custom={step}>
          <motion.div
            key={step}
            initial={reduce ? false : { opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, x: -30 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          >
            {step === 0 && (
              <div>
                <h1 className="font-display text-2xl text-ivoire sm:text-3xl">
                  Comment veux-tu qu'on t'appelle ?
                </h1>
                <p className="mt-2.5 text-sm text-ivoire-dim">
                  C'est le nom qui apparaîtra sur ton espace et dans la communauté.
                </p>
                <div className="mt-7">
                  <Input
                    label="Nom d'affichage"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ex : Awa"
                    autoFocus
                    error={state.fieldErrors?.displayName}
                  />
                </div>
              </div>
            )}

            {step === 1 && (
              <div>
                <h1 className="font-display text-2xl text-ivoire sm:text-3xl">
                  Dans quel domaine évolues-tu ?
                </h1>
                <p className="mt-2.5 text-sm text-ivoire-dim">
                  Cela nous aide à adapter les exemples. Tu peux laisser vide.
                </p>
                <div className="mt-7">
                  <Select
                    label="Domaine"
                    value={domain}
                    onChange={(e) => setDomain(e.target.value)}
                  >
                    <option value="">Je préfère ne pas préciser</option>
                    {DOMAINS.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </Select>
                </div>
              </div>
            )}

            {step === 2 && (
              <div>
                <h1 className="font-display text-2xl text-ivoire sm:text-3xl">
                  Où en es-tu avec l'IA ?
                </h1>
                <p className="mt-2.5 text-sm text-ivoire-dim">
                  On ajuste le niveau d'explication des missions.
                </p>
                <div className="mt-7 space-y-3">
                  {LEVELS.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setLevel(option.value)}
                      className={cn(
                        "flex w-full items-start gap-3 rounded-xl border p-4 text-left transition-all duration-200",
                        level === option.value
                          ? "border-or/60 bg-or/8"
                          : "border-ivoire/10 bg-noir-elevated hover:border-or/30",
                      )}
                    >
                      <span
                        className={cn(
                          "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border",
                          level === option.value ? "border-or bg-or text-noir" : "border-ivoire/25",
                        )}
                      >
                        {level === option.value && <Check size={13} strokeWidth={3} />}
                      </span>
                      <span>
                        <span className="block text-sm text-ivoire">{option.label}</span>
                        <span className="mt-0.5 block text-xs text-ivoire-dim">{option.detail}</span>
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {step === 3 && (
              <div>
                <h1 className="font-display text-2xl text-ivoire sm:text-3xl">
                  Que veux-tu accomplir ?
                </h1>
                <p className="mt-2.5 text-sm text-ivoire-dim">
                  Choisis un ou plusieurs objectifs — on te proposera les parcours adaptés.
                </p>
                <div className="mt-7 grid gap-2.5 sm:grid-cols-2">
                  {goals.map((goal) => {
                    const Icon = resolveIcon(goal.icon, Target);
                    const selected = goalIds.includes(goal.id);
                    return (
                      <button
                        key={goal.id}
                        type="button"
                        onClick={() => toggle(goalIds, setGoalIds, goal.id)}
                        aria-pressed={selected}
                        className={cn(
                          "flex items-start gap-3 rounded-xl border p-3.5 text-left transition-all duration-200",
                          selected
                            ? "border-or/60 bg-or/8"
                            : "border-ivoire/10 bg-noir-elevated hover:border-or/30",
                        )}
                      >
                        <span
                          className={cn(
                            "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
                            selected ? "bg-or text-noir" : "bg-or/10 text-or",
                          )}
                        >
                          <Icon size={17} strokeWidth={1.7} />
                        </span>
                        <span className="min-w-0">
                          <span className="block text-sm text-ivoire">{goal.title}</span>
                          <span className="mt-0.5 block text-xs leading-snug text-ivoire-dim">
                            {goal.tagline}
                          </span>
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {step === 4 && (
              <div>
                <h1 className="font-display text-2xl text-ivoire sm:text-3xl">
                  Qu'est-ce qui t'intéresse ?
                </h1>
                <p className="mt-2.5 text-sm text-ivoire-dim">
                  Pour te suggérer du contenu pertinent. Optionnel.
                </p>
                <div className="mt-7 flex flex-wrap gap-2">
                  {INTERESTS.map((interest) => {
                    const selected = interests.includes(interest);
                    return (
                      <button
                        key={interest}
                        type="button"
                        onClick={() => toggle(interests, setInterests, interest)}
                        aria-pressed={selected}
                        className={cn(
                          "rounded-full border px-4 py-2.5 text-sm transition-all duration-200",
                          selected
                            ? "border-or bg-or/12 text-or-vif"
                            : "border-ivoire/12 bg-noir-elevated text-ivoire-dim hover:border-or/30 hover:text-ivoire",
                        )}
                      >
                        {interest}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        <div className="mt-10 flex items-center gap-3">
          {step > 0 && (
            <Button
              type="button"
              variant="secondary"
              onClick={() => setStep((s) => s - 1)}
              icon={<ArrowLeft size={16} />}
            >
              Retour
            </Button>
          )}
          {isLast ? (
            <Button type="submit" size="lg" loading={pending} iconRight={<ArrowRight size={17} />}>
              Terminer
            </Button>
          ) : (
            <Button
              type="button"
              size="lg"
              disabled={!canContinue}
              onClick={() => setStep((s) => s + 1)}
              iconRight={<ArrowRight size={17} />}
            >
              Continuer
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}
