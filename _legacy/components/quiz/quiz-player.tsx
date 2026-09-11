"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { badgeLabel } from "@/lib/quiz";
import { CheckCircle2, XCircle, Trophy } from "lucide-react";

interface PublicQuestion {
  question: string;
  options: string[];
}

interface GradedResult {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  yourAnswer: number;
  isCorrect: boolean;
}

type Phase = "idle" | "loading" | "playing" | "submitting" | "done";

export function QuizPlayer({ stageId, duelId }: { stageId: string; duelId?: string }) {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>("idle");
  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [questions, setQuestions] = useState<PublicQuestion[]>([]);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{
    score: number;
    speedBonus: number;
    totalScore: number;
    badge: string | null;
    results: GradedResult[];
  } | null>(null);

  const start = async () => {
    setPhase("loading");
    setError(null);
    const res = await fetch(`/api/quiz/stages/${stageId}/start`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ duelId }),
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body.error ?? "Impossible de démarrer le quiz.");
      setPhase("idle");
      return;
    }
    const data = await res.json();
    setAttemptId(data.attemptId);
    setQuestions(data.questions);
    setAnswers(new Array(data.questions.length).fill(-1));
    setCurrent(0);
    setStartedAt(Date.now());
    setPhase("playing");
  };

  const selectAnswer = (index: number) => {
    const next = [...answers];
    next[current] = index;
    setAnswers(next);
  };

  const goNext = () => {
    if (current < questions.length - 1) {
      setCurrent(current + 1);
    } else {
      submit();
    }
  };

  const submit = async () => {
    if (!attemptId || !startedAt) return;
    setPhase("submitting");
    const durationSeconds = (Date.now() - startedAt) / 1000;
    const res = await fetch(`/api/quiz/attempts/${attemptId}/submit`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ answers, durationSeconds }),
    });
    if (!res.ok) {
      setError("Impossible d'envoyer vos réponses.");
      setPhase("playing");
      return;
    }
    const data = await res.json();
    setResult(data);
    setPhase("done");
  };

  if (phase === "idle") {
    return (
      <div className="rounded-xl border border-ivoire/10 bg-noir-elevated/40 p-8 text-center">
        {error && <p className="mb-4 text-sm text-red-400">{error}</p>}
        <p className="mb-4 text-sm text-ivoire-dim">
          Prêt·e ? Les questions sont générées à l'instant, spécialement pour cette partie.
        </p>
        <Button size="lg" className="rounded-full" onClick={start}>
          Commencer le quiz
        </Button>
      </div>
    );
  }

  if (phase === "loading") {
    return (
      <div className="rounded-xl border border-ivoire/10 bg-noir-elevated/40 p-8 text-center text-sm text-ivoire-dim">
        Génération des questions en cours...
      </div>
    );
  }

  if (phase === "playing" || phase === "submitting") {
    const q = questions[current];
    return (
      <div className="rounded-xl border border-ivoire/10 bg-noir-elevated/40 p-6 md:p-8">
        <p className="mb-2 text-xs text-ivoire-dim">
          Question {current + 1} / {questions.length}
        </p>
        <h2 className="mb-6 font-display text-xl text-ivoire">{q.question}</h2>
        <div className="space-y-3">
          {q.options.map((opt, i) => (
            <button
              key={i}
              type="button"
              onClick={() => selectAnswer(i)}
              className={`w-full rounded-lg border px-4 py-3 text-left text-sm transition-colors ${
                answers[current] === i
                  ? "border-or bg-or/10 text-ivoire"
                  : "border-ivoire/10 text-ivoire-dim hover:border-ivoire/30"
              }`}
            >
              {opt}
            </button>
          ))}
        </div>
        <div className="mt-6 flex justify-end">
          <Button
            className="rounded-full"
            disabled={answers[current] === -1 || phase === "submitting"}
            onClick={goNext}
          >
            {current < questions.length - 1
              ? "Suivant"
              : phase === "submitting"
                ? "Envoi..."
                : "Terminer le quiz"}
          </Button>
        </div>
      </div>
    );
  }

  if (phase === "done" && result) {
    return (
      <div className="space-y-6">
        <div className="rounded-xl border border-or/20 bg-or/5 p-6 text-center">
          <Trophy size={28} className="mx-auto mb-2 text-or" />
          <p className="font-display text-2xl text-ivoire">{result.totalScore} points</p>
          <p className="mt-1 text-sm text-ivoire-dim">
            {result.score} pts de bonnes réponses + {result.speedBonus} pts de rapidité
          </p>
          <p className="mt-2 text-sm font-medium text-or">
            {result.badge ? `Badge obtenu : ${badgeLabel(result.badge as "GOLD" | "SILVER" | "BRONZE")}` : "Pas de badge cette fois — réessayez !"}
          </p>
        </div>

        <div className="space-y-3">
          {result.results.map((r, i) => (
            <div key={i} className="rounded-lg border border-ivoire/10 p-4">
              <p className="mb-2 flex items-start gap-2 text-sm text-ivoire">
                {r.isCorrect ? (
                  <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-green-400" />
                ) : (
                  <XCircle size={16} className="mt-0.5 shrink-0 text-red-400" />
                )}
                {r.question}
              </p>
              <p className="ml-6 text-xs text-ivoire-dim">
                Bonne réponse : <span className="text-ivoire">{r.options[r.correctIndex]}</span>
              </p>
              <p className="ml-6 mt-1 text-xs text-ivoire-dim">{r.explanation}</p>
            </div>
          ))}
        </div>

        <div className="flex justify-center gap-3">
          <Button variant="secondary" className="rounded-full" onClick={() => router.push("/quiz")}>
            Retour aux étapes
          </Button>
          <Button className="rounded-full" onClick={start}>
            Rejouer
          </Button>
        </div>
      </div>
    );
  }

  return null;
}
