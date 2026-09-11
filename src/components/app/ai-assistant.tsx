"use client";

import { useState, useTransition } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Sparkles, Send, Info, Copy, Check } from "lucide-react";
import { Card, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/field";
import { Alert } from "@/components/ui/misc";
import { Markdown } from "@/components/app/markdown";
import { assistAction } from "@/lib/actions/ai";

/**
 * Assistance IA dans une mission.
 *
 * Volontairement dépliable et jamais automatique : l'IA n'intervient que si
 * l'utilisateur la sollicite. Elle aide à réfléchir, elle ne rédige pas à sa
 * place — c'est ce que rappelle l'avertissement affiché sous la réponse.
 */

const MODES: { id: string; label: string; hint: string }[] = [
  { id: "mission_assist", label: "M'aider à démarrer", hint: "Des questions pour débloquer la page blanche." },
  { id: "brainstorm", label: "Explorer des pistes", hint: "Élargir la réflexion avant de trancher." },
  { id: "structure", label: "Structurer", hint: "Organiser mes idées dans un plan clair." },
  { id: "rephrase", label: "Reformuler", hint: "Rendre mon texte plus direct." },
  { id: "analyze", label: "Analyser", hint: "Un regard critique sur ce que j'ai écrit." },
];

export function AiAssistant({ missionSlug }: { missionSlug: string }) {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState(MODES[0].id);
  const [prompt, setPrompt] = useState("");
  const [answer, setAnswer] = useState<string | null>(null);
  const [offline, setOffline] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [quota, setQuota] = useState<{ used: number; limit: number } | null>(null);
  const [copied, setCopied] = useState(false);
  const [pending, start] = useTransition();
  const reduce = useReducedMotion();

  const submit = () => {
    if (prompt.trim().length < 3) {
      setError("Écris ta demande avant de l'envoyer.");
      return;
    }
    start(async () => {
      setError(null);
      setAnswer(null);
      const result = await assistAction(mode, prompt, missionSlug);
      if (!result.ok) {
        setError(result.error ?? "L'assistance n'est pas disponible pour le moment.");
        return;
      }
      setAnswer(result.text);
      setOffline(result.offline);
      if (result.usedToday !== undefined && result.dailyLimit !== undefined) {
        setQuota({ used: result.usedToday, limit: result.dailyLimit });
      }
    });
  };

  const activeMode = MODES.find((m) => m.id === mode) ?? MODES[0];

  return (
    <Card tone="or">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-3 text-left"
      >
        <CardTitle className="flex items-center gap-2 text-base">
          <Sparkles size={16} className="text-or" /> Assistance IA
        </CardTitle>
        <span className="text-xs text-or">{open ? "Fermer" : "Ouvrir"}</span>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={reduce ? false : { height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={reduce ? { opacity: 0 } : { height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <div className="pt-4">
              <div
                className="mb-3 flex flex-wrap gap-1.5"
                role="radiogroup"
                aria-label="Type d'assistance"
              >
                {MODES.map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    role="radio"
                    aria-checked={mode === m.id}
                    onClick={() => setMode(m.id)}
                    className={`rounded-full border px-3 py-1.5 text-xs transition-colors ${
                      mode === m.id
                        ? "border-or bg-or/12 text-or-vif"
                        : "border-ivoire/12 text-ivoire-dim hover:border-or/30 hover:text-ivoire"
                    }`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>

              <p className="mb-3 text-xs text-ivoire-faint">{activeMode.hint}</p>

              <Textarea
                label="Ta demande"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                rows={4}
                placeholder="Colle ton texte ou décris ce sur quoi tu bloques."
                maxLength={6000}
              />

              <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                <Button
                  size="sm"
                  loading={pending}
                  onClick={submit}
                  icon={<Send size={14} />}
                >
                  Demander
                </Button>
                {quota && (
                  <span className="font-mono text-[0.7rem] text-ivoire-faint">
                    {quota.used}/{quota.limit} aujourd'hui
                  </span>
                )}
              </div>

              {error && (
                <div className="mt-4">
                  <Alert tone="erreur">{error}</Alert>
                </div>
              )}

              {answer && (
                <div className="mt-4">
                  <div className="rounded-card border border-ivoire/10 bg-noir/50 p-4">
                    <div className="mb-2 flex items-center justify-between gap-3">
                      <span className="font-mono text-[0.66rem] uppercase tracking-[0.18em] text-or">
                        Réponse
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard?.writeText(answer);
                          setCopied(true);
                          setTimeout(() => setCopied(false), 2000);
                        }}
                        className="flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs text-ivoire-faint transition-colors hover:bg-or/10 hover:text-or"
                      >
                        {copied ? <Check size={13} /> : <Copy size={13} />}
                        {copied ? "Copié" : "Copier"}
                      </button>
                    </div>
                    <Markdown content={answer} />
                  </div>

                  <p className="mt-3 flex items-start gap-2 text-[0.7rem] leading-relaxed text-ivoire-faint">
                    <Info size={13} className="mt-0.5 shrink-0 text-or" />
                    {offline
                      ? "Réponse produite par l'assistant local de Xwé IA. Elle te guide, elle ne remplace pas ton travail : les chiffres et les faits doivent venir de toi."
                      : "Cette réponse est une aide à la réflexion. Vérifie toute donnée chiffrée avant de la reprendre : elle doit venir de toi."}
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}
