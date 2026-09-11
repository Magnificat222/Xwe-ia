"use client";

import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  Check,
  ChevronRight,
  ChevronLeft,
  Lightbulb,
  AlertTriangle,
  Copy,
  Sparkles,
  ListChecks,
  Save,
  PartyPopper,
  ArrowRight,
  Wrench,
} from "lucide-react";
import type { MissionField, MissionPrompt } from "@/db/schema";
import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/components/ui/toast";
import { MissionFieldRenderer } from "./mission-fields";
import { saveDraftAction, completeMissionAction } from "@/lib/actions/app";
import { cn } from "@/lib/utils";
import { AiAssistant } from "@/components/app/ai-assistant";

interface MissionData {
  slug: string;
  title: string;
  objective: string;
  explanation: string;
  instructions: string[];
  fields: MissionField[];
  prompts: MissionPrompt[];
  tips: string[];
  pitfalls: string[];
  checklist: string[];
  resultLabel: string;
  aiAssist: boolean;
}

type Panel = "guide" | "travail";

export function MissionPlayer({
  mission,
  initialAnswers,
  initialChecked,
  alreadyCompleted,
  pathwaySlug,
  nextSlug,
  previousSlug,
  index,
  total,
}: {
  mission: MissionData;
  initialAnswers: Record<string, unknown>;
  initialChecked: number[];
  alreadyCompleted: boolean;
  pathwaySlug: string;
  nextSlug: string | null;
  previousSlug: string | null;
  index: number;
  total: number;
}) {
  const router = useRouter();
  const { push } = useToast();
  const reduce = useReducedMotion();
  const [panel, setPanel] = useState<Panel>(alreadyCompleted ? "travail" : "guide");
  const [answers, setAnswers] = useState<Record<string, unknown>>(initialAnswers);
  const [checked, setChecked] = useState<number[]>(initialChecked);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<Date | null>(null);
  const [celebrate, setCelebrate] = useState(false);
  const [pending, startTransition] = useTransition();

  const dirty = useRef(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  /** Sauvegarde automatique : 1,2 s après la dernière frappe. */
  const scheduleSave = useCallback(
    (nextAnswers: Record<string, unknown>, nextChecked: number[]) => {
      dirty.current = true;
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(async () => {
        if (!dirty.current) return;
        setSaving(true);
        try {
          await saveDraftAction(mission.slug, nextAnswers, nextChecked);
          dirty.current = false;
          setSavedAt(new Date());
        } catch {
          // Silencieux : la prochaine frappe relancera une sauvegarde.
        } finally {
          setSaving(false);
        }
      }, 1200);
    },
    [mission.slug],
  );

  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);

  const setField = (key: string, value: unknown) => {
    const next = { ...answers, [key]: value };
    setAnswers(next);
    setErrors((prev) => {
      if (!prev[key]) return prev;
      const copy = { ...prev };
      delete copy[key];
      return copy;
    });
    scheduleSave(next, checked);
  };

  const toggleChecklist = (i: number) => {
    const next = checked.includes(i) ? checked.filter((c) => c !== i) : [...checked, i];
    setChecked(next);
    scheduleSave(answers, next);
  };

  const filledCount = mission.fields.filter((f) => {
    const value = answers[f.key];
    return Array.isArray(value) ? value.length > 0 : value !== undefined && value !== "" && value !== null;
  }).length;
  const fieldProgress = mission.fields.length > 0 ? (filledCount / mission.fields.length) * 100 : 0;

  const submit = () => {
    startTransition(async () => {
      const outcome = await completeMissionAction(mission.slug, answers, checked);
      if (!outcome.ok) {
        setErrors(outcome.errors ?? {});
        setPanel("travail");
        push("Il manque des réponses obligatoires.", "erreur");
        const firstKey = Object.keys(outcome.errors ?? {})[0];
        if (firstKey) {
          document
            .querySelector(`[data-field="${firstKey}"]`)
            ?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "center" });
        }
        return;
      }
      setCelebrate(true);
      push("Mission validée. Ton résultat est enregistré.", "succes");
      setTimeout(() => {
        if (outcome.nextSlug) router.push(`/missions/${outcome.nextSlug}`);
        else router.push(`/parcours/${pathwaySlug}?termine=1`);
      }, 1400);
    });
  };

  const copyPrompt = async (body: string) => {
    try {
      await navigator.clipboard.writeText(body);
      push("Prompt copié.", "succes");
    } catch {
      push("Copie impossible sur ce navigateur.", "erreur");
    }
  };

  return (
    <div className="relative">
      {/* Barre de progression du parcours */}
      <div className="mb-5">
        <div className="mb-2 flex items-center justify-between text-xs">
          <span className="font-mono uppercase tracking-[0.16em] text-or">
            Mission {index + 1} / {total}
          </span>
          {alreadyCompleted && (
            <Badge tone="feuillage">
              <Check size={11} /> Validée
            </Badge>
          )}
        </div>
        <Progress value={((index + (alreadyCompleted ? 1 : 0)) / total) * 100} tone="braise" />
      </div>

      <h1 className="font-display text-xl leading-tight text-ivoire sm:text-2xl">{mission.title}</h1>
      <p className="mt-2.5 text-sm leading-relaxed text-ivoire-dim">{mission.objective}</p>

      {/* Onglets : sur mobile on ne montre qu'un panneau à la fois. */}
      <div
        role="tablist"
        aria-label="Sections de la mission"
        className="mt-6 flex gap-1 rounded-xl border border-ivoire/10 bg-noir-elevated p-1 lg:hidden"
      >
        {(["guide", "travail"] as Panel[]).map((value) => (
          <button
            key={value}
            role="tab"
            type="button"
            aria-selected={panel === value}
            onClick={() => setPanel(value)}
            className={cn(
              "relative flex-1 rounded-lg px-4 py-2.5 text-sm transition-colors",
              panel === value ? "text-noir" : "text-ivoire-dim",
            )}
          >
            {panel === value && (
              <motion.span
                layoutId="mission-tab"
                className="absolute inset-0 -z-10 rounded-lg bg-or"
                transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 400, damping: 32 }}
              />
            )}
            {value === "guide" ? "Le guide" : "Mon travail"}
          </button>
        ))}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:items-start">
        {/* Panneau guide */}
        <div className={cn("space-y-4", panel !== "guide" && "hidden lg:block")}>
          <Card>
            <CardTitle className="text-base">Pourquoi cette mission</CardTitle>
            <p className="mt-2.5 text-sm leading-relaxed text-ivoire-dim">{mission.explanation}</p>
          </Card>

          {mission.instructions.length > 0 && (
            <Card>
              <CardTitle className="text-base">Comment procéder</CardTitle>
              <ol className="mt-3 space-y-2.5">
                {mission.instructions.map((instruction, i) => (
                  <li key={instruction} className="flex gap-3 text-sm leading-relaxed text-ivoire-dim">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-or/12 font-mono text-[0.65rem] text-or">
                      {i + 1}
                    </span>
                    {instruction}
                  </li>
                ))}
              </ol>
            </Card>
          )}

          {mission.aiAssist && <AiAssistant missionSlug={mission.slug} />}

          {mission.prompts.length > 0 && (
            <Card tone="or">
              <CardTitle className="flex items-center gap-2 text-base">
                <Sparkles size={16} className="text-or" /> Prompts à utiliser
              </CardTitle>
              <div className="mt-3 space-y-3">
                {mission.prompts.map((prompt) => (
                  <div key={prompt.title} className="rounded-xl border border-ivoire/10 bg-noir/50 p-3.5">
                    <div className="flex items-start justify-between gap-3">
                      <p className="text-sm text-ivoire">{prompt.title}</p>
                      <button
                        type="button"
                        onClick={() => copyPrompt(prompt.body)}
                        aria-label={`Copier le prompt : ${prompt.title}`}
                        className="shrink-0 rounded-lg p-1.5 text-ivoire-faint transition-colors hover:bg-or/10 hover:text-or"
                      >
                        <Copy size={14} />
                      </button>
                    </div>
                    <p className="mt-2 font-mono text-xs leading-relaxed text-ivoire-dim">
                      {prompt.body}
                    </p>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {(mission.tips.length > 0 || mission.pitfalls.length > 0) && (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
              {mission.tips.length > 0 && (
                <Card tone="feuillage">
                  <CardTitle className="flex items-center gap-2 text-sm">
                    <Lightbulb size={15} className="text-feuillage-vif" /> Conseils
                  </CardTitle>
                  <ul className="mt-2.5 space-y-2 text-sm leading-relaxed text-ivoire-dim">
                    {mission.tips.map((tip) => (
                      <li key={tip} className="flex gap-2">
                        <span className="text-feuillage-vif">•</span> {tip}
                      </li>
                    ))}
                  </ul>
                </Card>
              )}
              {mission.pitfalls.length > 0 && (
                <Card tone="braise">
                  <CardTitle className="flex items-center gap-2 text-sm">
                    <AlertTriangle size={15} className="text-braise-vif" /> À éviter
                  </CardTitle>
                  <ul className="mt-2.5 space-y-2 text-sm leading-relaxed text-ivoire-dim">
                    {mission.pitfalls.map((pitfall) => (
                      <li key={pitfall} className="flex gap-2">
                        <span className="text-braise-vif">•</span> {pitfall}
                      </li>
                    ))}
                  </ul>
                </Card>
              )}
            </div>
          )}

          <Link href="/outils" className="block">
            <Card interactive className="flex items-center gap-3 py-4">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-ivoire/6 text-or">
                <Wrench size={17} />
              </span>
              <span className="text-sm text-ivoire-dim">
                Besoin d'un outil ? Consulte la sélection Xwé IA.
              </span>
            </Card>
          </Link>
        </div>

        {/* Panneau travail */}
        <div className={cn("space-y-4", panel !== "travail" && "hidden lg:block")}>
          <Card>
            <div className="mb-4 flex items-center justify-between gap-3">
              <CardTitle className="text-base">Ton travail</CardTitle>
              <span className="flex items-center gap-1.5 text-xs text-ivoire-faint" aria-live="polite">
                {saving ? (
                  <>
                    <Save size={12} className="animate-pulse" /> Enregistrement…
                  </>
                ) : savedAt ? (
                  <>
                    <Check size={12} className="text-feuillage-vif" /> Enregistré
                  </>
                ) : (
                  "Sauvegarde automatique"
                )}
              </span>
            </div>

            <Progress value={fieldProgress} tone="or" showLabel label="Champs remplis" />

            <div className="mt-6 space-y-5">
              {mission.fields.map((field) => (
                <div key={field.key} data-field={field.key}>
                  <MissionFieldRenderer
                    field={field}
                    value={answers[field.key]}
                    onChange={(value) => setField(field.key, value)}
                    error={errors[field.key]}
                  />
                </div>
              ))}
            </div>
          </Card>

          {mission.checklist.length > 0 && (
            <Card>
              <CardTitle className="flex items-center gap-2 text-base">
                <ListChecks size={16} className="text-or" /> Checklist
              </CardTitle>
              <ul className="mt-3 space-y-2">
                {mission.checklist.map((item, i) => (
                  <li key={item}>
                    <label className="flex cursor-pointer items-start gap-2.5 rounded-lg p-2 text-sm text-ivoire transition-colors hover:bg-ivoire/4">
                      <input
                        type="checkbox"
                        checked={checked.includes(i)}
                        onChange={() => toggleChecklist(i)}
                        className="mt-0.5 h-4 w-4 shrink-0 accent-[var(--color-or)]"
                      />
                      <span className={checked.includes(i) ? "text-ivoire-faint line-through" : ""}>
                        {item}
                      </span>
                    </label>
                  </li>
                ))}
              </ul>
            </Card>
          )}

          <Card tone="feuillage">
            <p className="font-mono text-[0.66rem] uppercase tracking-[0.18em] text-feuillage-vif">
              Résultat de cette mission
            </p>
            <CardTitle className="mt-1.5 text-base">{mission.resultLabel}</CardTitle>
          </Card>

          <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center">
            <Button size="lg" onClick={submit} loading={pending} icon={<Check size={17} />}>
              {alreadyCompleted ? "Mettre à jour" : "Valider la mission"}
            </Button>
            {nextSlug && (
              <Link href={`/missions/${nextSlug}`}>
                <Button variant="ghost" size="lg" iconRight={<ChevronRight size={17} />}>
                  Passer
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Navigation entre missions */}
      <nav
        aria-label="Navigation entre missions"
        className="mt-8 flex items-center justify-between gap-3 border-t border-ivoire/8 pt-5"
      >
        {previousSlug ? (
          <Link href={`/missions/${previousSlug}`}>
            <Button variant="ghost" size="sm" icon={<ChevronLeft size={15} />}>
              Mission précédente
            </Button>
          </Link>
        ) : (
          <span />
        )}
        <Link href={`/parcours/${pathwaySlug}`}>
          <Button variant="ghost" size="sm">
            Voir le parcours
          </Button>
        </Link>
      </nav>

      {/* Célébration à la validation */}
      <AnimatePresence>
        {celebrate && (
          <motion.div
            className="fixed inset-0 z-[110] flex items-center justify-center bg-noir/85 backdrop-blur-sm px-6"
            initial={reduce ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              initial={reduce ? false : { scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 22 }}
              className="rounded-panel border border-or/30 bg-noir-elevated px-8 py-9 text-center"
            >
              <motion.span
                animate={reduce ? undefined : { rotate: [0, -12, 12, 0] }}
                transition={{ duration: 0.7, delay: 0.15 }}
                className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-or/12 text-or"
              >
                <PartyPopper size={30} />
              </motion.span>
              <p className="font-display text-lg text-ivoire">Mission validée</p>
              <p className="mt-1.5 text-sm text-ivoire-dim">
                {nextSlug ? "On enchaîne sur la suivante…" : "Ton parcours est terminé."}
              </p>
              <p className="mt-4 flex items-center justify-center gap-1.5 text-xs text-or">
                <ArrowRight size={13} /> Résultat enregistré
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
