"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Timer, Check, X, Trophy, RotateCcw, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { submitChallengeAction } from "@/lib/actions/app";
import { cn } from "@/lib/utils";

/** Question côté client : jamais la bonne réponse, la correction est serveur. */
export interface PublicQuestion {
  question: string;
  options: string[];
}

export function ChallengePlayer({
  challengeId,
  title,
  questions,
  durationSeconds,
  onClose,
}: {
  challengeId: string;
  title: string;
  questions: PublicQuestion[];
  durationSeconds: number;
  onClose: () => void;
}) {
  const reduce = useReducedMotion();
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<number[]>(Array(questions.length).fill(-1));
  const [remaining, setRemaining] = useState(durationSeconds);
  const [outcome, setOutcome] = useState<{ score: number; correct: number; total: number } | null>(
    null,
  );
  const [pending, start] = useTransition();
  const startedAt = useRef(Date.now());
  const submitted = useRef(false);

  const finish = () => {
    if (submitted.current) return;
    submitted.current = true;
    const elapsed = Math.round((Date.now() - startedAt.current) / 1000);
    start(async () => {
      const result = await submitChallengeAction(challengeId, answers, elapsed);
      setOutcome(result);
    });
  };

  // Compte à rebours : le défi se termine tout seul à zéro.
  useEffect(() => {
    if (outcome) return;
    const timer = setInterval(() => {
      setRemaining((value) => {
        if (value <= 1) {
          clearInterval(timer);
          finish();
          return 0;
        }
        return value - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [outcome]);

  const minutes = String(Math.floor(remaining / 60)).padStart(2, "0");
  const seconds = String(remaining % 60).padStart(2, "0");
  const urgent = remaining <= 15;

  if (outcome) {
    const perfect = outcome.correct === outcome.total;
    return (
      <motion.div
        initial={reduce ? false : { opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center"
      >
        <span
          className={cn(
            "mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-3xl",
            perfect ? "bg-or/15 text-or" : "bg-braise/12 text-braise-vif",
          )}
        >
          <Trophy size={34} />
        </span>
        <p className="font-display text-2xl text-ivoire">{outcome.score} points</p>
        <p className="mt-2 text-sm text-ivoire-dim">
          {outcome.correct} bonne{outcome.correct > 1 ? "s" : ""} réponse
          {outcome.correct > 1 ? "s" : ""} sur {outcome.total}
          {perfect && " — sans faute !"}
        </p>
        <div className="mt-7 flex flex-wrap justify-center gap-2.5">
          <Button onClick={onClose} icon={<ArrowRight size={16} />}>
            Retour à l'arène
          </Button>
          <Button
            variant="secondary"
            icon={<RotateCcw size={16} />}
            onClick={() => window.location.reload()}
          >
            Rejouer
          </Button>
        </div>
      </motion.div>
    );
  }

  const question = questions[index];
  const answered = answers[index] >= 0;
  const isLast = index === questions.length - 1;

  return (
    <div>
      <div className="mb-5 flex items-center justify-between gap-4">
        <div className="min-w-0">
          <p className="font-mono text-[0.66rem] uppercase tracking-[0.18em] text-or">{title}</p>
          <p className="mt-0.5 text-xs text-ivoire-dim">
            Question {index + 1} / {questions.length}
          </p>
        </div>
        <span
          className={cn(
            "flex items-center gap-1.5 rounded-full border px-3 py-1.5 font-mono text-sm tabular-nums transition-colors",
            urgent
              ? "border-erreur/50 bg-erreur/10 text-erreur"
              : "border-ivoire/12 text-ivoire-dim",
          )}
          role="timer"
          aria-live="off"
        >
          <Timer size={14} />
          {minutes}:{seconds}
        </span>
      </div>

      <Progress value={((index + 1) / questions.length) * 100} tone="braise" />

      <AnimatePresence mode="wait">
        <motion.div
          key={index}
          initial={reduce ? false : { opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          exit={reduce ? { opacity: 0 } : { opacity: 0, x: -24 }}
          transition={{ duration: 0.25 }}
          className="mt-6"
        >
          <CardTitle className="text-base leading-snug">{question.question}</CardTitle>

          <div className="mt-5 space-y-2.5">
            {question.options.map((option, optionIndex) => {
              const selected = answers[index] === optionIndex;
              return (
                <button
                  key={option}
                  type="button"
                  onClick={() =>
                    setAnswers((prev) => {
                      const next = [...prev];
                      next[index] = optionIndex;
                      return next;
                    })
                  }
                  aria-pressed={selected}
                  className={cn(
                    "flex min-h-12 w-full items-center gap-3 rounded-xl border px-4 py-3 text-left text-sm transition-all duration-200",
                    selected
                      ? "border-or/60 bg-or/8 text-ivoire"
                      : "border-ivoire/12 bg-noir-elevated text-ivoire-dim hover:border-or/30 hover:text-ivoire",
                  )}
                >
                  <span
                    className={cn(
                      "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border font-mono text-[0.65rem]",
                      selected ? "border-or bg-or text-noir" : "border-ivoire/20",
                    )}
                  >
                    {String.fromCharCode(65 + optionIndex)}
                  </span>
                  {option}
                </button>
              );
            })}
          </div>
        </motion.div>
      </AnimatePresence>

      <div className="mt-7 flex items-center justify-between gap-3">
        <Button
          variant="ghost"
          size="sm"
          disabled={index === 0}
          onClick={() => setIndex((i) => i - 1)}
        >
          Précédent
        </Button>
        {isLast ? (
          <Button loading={pending} disabled={!answered} onClick={finish} icon={<Check size={16} />}>
            Terminer
          </Button>
        ) : (
          <Button disabled={!answered} onClick={() => setIndex((i) => i + 1)} iconRight={<ArrowRight size={16} />}>
            Suivant
          </Button>
        )}
      </div>
    </div>
  );
}

/** Enveloppe : ouvre le défi en plein écran sur mobile, en carte sur desktop. */
export function ChallengeLauncher({
  challengeId,
  title,
  questions,
  durationSeconds,
  points,
}: {
  challengeId: string;
  title: string;
  questions: PublicQuestion[];
  durationSeconds: number;
  points: number;
}) {
  const [open, setOpen] = useState(false);
  const reduce = useReducedMotion();

  return (
    <>
      <Card interactive className="flex h-full flex-col">
        <CardTitle className="text-sm leading-snug">{title}</CardTitle>
        <p className="mt-2 flex-1 text-xs text-ivoire-dim">
          {questions.length} question{questions.length > 1 ? "s" : ""} ·{" "}
          {Math.round(durationSeconds / 60)} min · {points} pts
        </p>
        <Button className="mt-4" size="sm" onClick={() => setOpen(true)}>
          Lancer le défi
        </Button>
      </Card>

      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto bg-noir/92 px-4 py-8 backdrop-blur-sm sm:items-center"
            initial={reduce ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            role="dialog"
            aria-modal="true"
            aria-label={title}
          >
            <motion.div
              initial={reduce ? false : { scale: 0.96, y: 16 }}
              animate={{ scale: 1, y: 0 }}
              className="w-full max-w-lg rounded-panel border border-ivoire/12 bg-noir-elevated p-6 sm:p-7"
            >
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Fermer le défi"
                className="mb-2 ml-auto flex h-9 w-9 items-center justify-center rounded-lg text-ivoire-dim transition-colors hover:bg-ivoire/8 hover:text-ivoire"
              >
                <X size={18} />
              </button>
              <ChallengePlayer
                challengeId={challengeId}
                title={title}
                questions={questions}
                durationSeconds={durationSeconds}
                onClose={() => setOpen(false)}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
